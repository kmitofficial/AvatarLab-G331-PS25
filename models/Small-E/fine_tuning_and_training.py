import os
import torch
import torchaudio
import numpy as np
import pandas as pd
import pytorch_lightning as pl
from torch.utils.data import Dataset, DataLoader
from transformers import PreTrainedTokenizerFast
from huggingface_hub import hf_hub_download
from model.gla import AttentiveGLA
from model.modeling_lina import LinaModel
from model.encoder import TextEncoder
from decoder.pretrained import WavTokenizer
from train_lina import TrainLina
from pytorch_lightning.callbacks import ModelCheckpoint, LearningRateMonitor

# Configuration
CHECKPOINT_PATH = "/home/kmit/Desktop/PS-Projects/G331/lina-speech/last.ckpt"
BATCH_SIZE = 8
LEARNING_RATE = 2e-4
EPOCHS = 1000
WARMUP_STEPS = 1000
TRAINING_STEPS = 500000
CHECKPOINT_DIR = "checkpoints/"
MAX_AUDIO_LEN = 1500
MAX_TEXT_LEN = 120

os.makedirs(CHECKPOINT_DIR, exist_ok=True)

# Load WavTokenizer
config_path = hf_hub_download("novateur/WavTokenizer-medium-speech-75token", "wavtokenizer_mediumdata_frame75_3s_nq1_code4096_dim512_kmeans200_attn.yaml")
model_path = hf_hub_download("novateur/WavTokenizer-medium-speech-75token", "wavtokenizer_medium_speech_320_24k.ckpt")
wavtokenizer = WavTokenizer.from_pretrained0802(config_path, model_path).to("cuda")
tokenizer = PreTrainedTokenizerFast(tokenizer_file="bpe256.json")
bandwidth_id = torch.tensor([0], requires_grad=False)

class NPTELDataset(Dataset):
    def __init__(self, csv_file, audio_dir, tokenizer, wavtokenizer, bandwidth_id):
        self.data = pd.read_csv(csv_file, names=['audio_path', 'text'])
        self.audio_dir = os.path.abspath(audio_dir)
        self.tokenizer = tokenizer
        self.wavtokenizer = wavtokenizer
        self.bandwidth_id = bandwidth_id
        self.device = next(wavtokenizer.parameters()).device

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        audio_path = os.path.join(self.audio_dir, self.data['audio_path'][idx])
        text = f"[BOS]{self.data['text'][idx]}[EOS]"
        text_token = torch.LongTensor(self.tokenizer.encode(text))

        try:
            wav, sr = torchaudio.load(audio_path)
            wav = torchaudio.transforms.Resample(orig_freq=sr, new_freq=24000)(wav)
            wav = wav.mean(dim=0, keepdim=True) if wav.shape[0] > 1 else wav
            wav = wav.to(self.device)

            with torch.no_grad():
                _, audio_token = self.wavtokenizer.encode_infer(wav, bandwidth_id=self.bandwidth_id.to(self.device))

            seq_len = audio_token.shape[-1]

            if seq_len > MAX_AUDIO_LEN:
                print(f"Warning: {audio_path} has {seq_len} tokens, max is {MAX_AUDIO_LEN}")
                audio_token = audio_token[:, :MAX_AUDIO_LEN]
                seq_len = MAX_AUDIO_LEN

            return {
                "text_token": text_token,
                "audio_token": audio_token.cpu(),
                "seq_len": seq_len,
                "audio_path": self.data['audio_path'][idx]
            }

        except Exception as e:
            print(f"Failed to process {audio_path}: {e}")
            return {
                "text_token": torch.zeros(1, dtype=torch.long),
                "audio_token": torch.zeros((1, 1), dtype=torch.long),
                "seq_len": 0,
                "audio_path": self.data['audio_path'][idx]
            }


def collate_fn(batch):
    batch = [b for b in batch if b["seq_len"] > 0]
    if not batch:
        return {
            "text_token": torch.zeros((1, 1), dtype=torch.long),
            "audio_token": torch.zeros((1, 1, 1), dtype=torch.long),  # Keep 3D structure
            "crossatt_mask": torch.zeros((1, 1, 1), dtype=torch.bool),
            "crossatt_pos": torch.zeros((1, 1), dtype=torch.long),
            "encoder_mask": torch.zeros((1, 1), dtype=torch.bool),
            "y_mask": torch.zeros((1, 1, 1), dtype=torch.bool),
            "padding_mask": torch.zeros((1), dtype=torch.bool),
            "lengths": torch.zeros((1), dtype=torch.long)
        }

    batch_size = len(batch)
    audio_lens = [b["seq_len"] for b in batch]
    text_lens = [b["text_token"].shape[0] for b in batch]
    max_audio_len = min(max(audio_lens), MAX_AUDIO_LEN)
    max_text_len = min(max(text_lens), MAX_TEXT_LEN)

    # Keep this as 3D tensor: [batch_size, num_quantizers, max_audio_len]
    # Where num_quantizers is 1 in this case
    audio_tokens = torch.zeros((batch_size, 1, max_audio_len), dtype=torch.long)
    text_tokens = torch.zeros((batch_size, max_text_len), dtype=torch.long)
    encoder_mask = torch.zeros((batch_size, max_audio_len), dtype=torch.bool)
    crossatt_mask = torch.zeros((batch_size, max_audio_len, max_audio_len), dtype=torch.bool)
    y_mask = torch.zeros((batch_size, 1, max_audio_len), dtype=torch.bool)
    padding_mask = torch.ones(batch_size, dtype=torch.bool)
    lengths = torch.tensor([min(l, MAX_AUDIO_LEN) for l in audio_lens], dtype=torch.long)
    crossatt_pos = torch.arange(max_audio_len).unsqueeze(0).repeat(batch_size, 1)

    for i, b in enumerate(batch):
        a_len = min(b["seq_len"], max_audio_len)
        t_len = min(b["text_token"].shape[0], max_text_len)
        # Keep the 3D structure
        audio_tokens[i, :, :a_len] = b["audio_token"][:, :a_len]
        text_tokens[i, :t_len] = b["text_token"][:t_len]
        encoder_mask[i, :a_len] = True
        crossatt_mask[i, :a_len, :a_len] = True
        y_mask[i, :, :a_len] = True

    print("text_token:", text_tokens.shape)
    print("audio_token:", audio_tokens.shape)
    return {
        "text_token": text_tokens,
        "audio_token": audio_tokens,  # Keep as 3D
        "crossatt_mask": crossatt_mask,
        "crossatt_pos": crossatt_pos,
        "encoder_mask": encoder_mask,
        "y_mask": y_mask,
        "padding_mask": padding_mask,
        "lengths": lengths
    }

class LinaModelPL(pl.LightningModule):
    def __init__(self, checkpoint_path=None):
        super().__init__()
        txt_encoder = TextEncoder(dim=1024, heads=4, n_layers=6, dropout=0.1, rotary=True)
        attentive_rnn = AttentiveGLA(
            d_model=1024, n_layer=6, heads=8, dropout_att=0.1, dropout=0.0, d_blind=None,
            blind=True, cross_att_pp=False, rotary=False, use_short_conv=False,
            expand_k=0.5, expand_v=1.0, pos_type='convolutional'
        )
        base_model = LinaModel(
            attentive_rnn=attentive_rnn, d_model=1024, n_quant=1, n_codebook=4096,
            n_special_token_in=3, n_special_token_out=3, n_txt_vocab=256, txt_encoder=txt_encoder
        )
        self.model = TrainLina(
            attentive_rnn=base_model, d_model=1024, quant_layer=[0], n_codebook=4096,
            n_special_token_in=3, n_special_token_out=3, n_txt_vocab=256, learning_rate=LEARNING_RATE,
            weight_decay=0.1, betas=(0.9, 0.999), n_warmup_steps=WARMUP_STEPS, n_training_steps=TRAINING_STEPS
        )

        if checkpoint_path:
            self._load_ckpt(checkpoint_path)

    def _load_ckpt(self, path):
        try:
            ckpt = torch.load(path, map_location='cpu')
            state_dict = ckpt["state_dict"] if "state_dict" in ckpt else ckpt
            new_state = {k.replace("model.", ""): v for k, v in state_dict.items()}
            self.model.load_state_dict(new_state, strict=False)
            print(f"Loaded checkpoint: {path}")
        except Exception as e:
            print(f"Checkpoint load failed: {e}")

    def forward(self, batch):
        batch = {k: v.to(self.device) for k, v in batch.items()}
        try:
            loss = self.model(batch)
            if torch.isnan(loss) or torch.isinf(loss):
                return torch.tensor(1.0, requires_grad=True, device=self.device)
            return loss
        except Exception as e:
            print(f"Forward pass error: {e}")
            return torch.tensor(1.0, requires_grad=True, device=self.device)

    def training_step(self, batch, batch_idx):
        if batch["padding_mask"].sum() == 0:
            return None
        loss = self.forward(batch)
        self.log("train_loss", loss, prog_bar=True)
        return loss

    def configure_optimizers(self):
        return self.model.configure_optimizers()

# Load dataset and dataloader
train_dataset = NPTELDataset(
    "/home/kmit/Desktop/PS-Projects/G331/lina-speech/dataset/train.csv",
    "/home/kmit/Desktop/PS-Projects/G331/lina-speech/dataset/audio",
    tokenizer, wavtokenizer, bandwidth_id
)

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0,
    collate_fn=collate_fn,
    drop_last=False
)

# Setup model and training
model = LinaModelPL(checkpoint_path=CHECKPOINT_PATH)

checkpoint_cb = ModelCheckpoint(
    monitor="train_loss", mode="min",
    save_top_k=3, filename="finetuned-{epoch:02d}-{train_loss:.4f}",
    dirpath=CHECKPOINT_DIR, save_last=True
)

lr_monitor = LearningRateMonitor(logging_interval='step')

trainer = pl.Trainer(
    max_epochs=EPOCHS,
    accelerator="gpu", devices=1,
    callbacks=[checkpoint_cb, lr_monitor],
    precision="16-mixed",
    gradient_clip_val=1.0,
    log_every_n_steps=10,
    detect_anomaly=True,
    enable_progress_bar=True
)

# Start training
print("Starting training...")
try:
    torch.set_float32_matmul_precision('medium')
    trainer.fit(model, train_loader)
    print(f"Training complete. Best checkpoint: {checkpoint_cb.best_model_path}")
except Exception as e:
    print(f"Training failed: {e}")