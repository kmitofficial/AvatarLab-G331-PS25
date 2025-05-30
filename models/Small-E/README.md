# Lina Speech Setup and Execution

## 1. Cloning the Repository

Clone the `lina-speech` repository from GitHub:

```bash
git clone https://github.com/theodorblackbird/lina-speech.git
```

---

## 2. Navigating to the Required Directory and Extracting Dependencies

```bash
cd lina-speech/3rdparty
unzip /content/lina-speech/3rdparty/flash-linear-attention-739ef15f97c.zip
cd ..
```

---

## 3. Verifying the Directory Path

```bash
pwd
```

---

## 4. Installing Required Dependencies

```bash
pip install torch==2.5.1
pip install git+https://github.com/Dao-AILab/causal-conv1d
pip install flash-attn --no-build-isolation
pip install -r requirements.txt
```

---

## 5. Installing Additional Libraries

```bash
pip install torchvision torchaudio
pip install triton
```

---

## 6. Creating Symbolic Links

```bash
ln -s 3rdparty/flash-linear-attention/fla fla
ln -s 3rdparty/encoder encoder
ln -s 3rdparty/decoder decoder
```

---

## 7. Importing Required Libraries and Downloading the Model

```python
import torch
from train_lina import TrainLina
from datasets import load_dataset
from decoder.pretrained import WavTokenizer
from transformers import PreTrainedTokenizerFast
from IPython.display import Audio, display
from initial_state import train_initial_state, filter_unk
```

Download model checkpoint:

```python
from huggingface_hub import hf_hub_download

repo_id = "lina-speech/all-models"
filename = "lina_gla_gigaspeech_d1024l12_convblind_shortconv_lr2e-4/last.ckpt"
model_path = hf_hub_download(repo_id=repo_id, filename=filename)
print(f"Model downloaded to: {model_path}")
```

---

## 8. Loading the Model Checkpoint

```python
checkpoint_path = "/root/.cache/huggingface/hub/models--lina-speech--all-models/snapshots/6fb9bcb17b87b40544aa52aac24e239d0e2e26/lina_gla_gigaspeech_d1024l12_convblind_shortconv_lr2e-4/last.ckpt"
checkpoint = torch.load(checkpoint_path, map_location="cpu")
print(checkpoint.keys())

model = TrainLina.load_from_checkpoint(checkpoint_path).model.eval()
tokenizer = PreTrainedTokenizerFast(tokenizer_file="bpe256.json")
```

---

## 9. Downloading and Initializing the WavTokenizer

```python
repo_id = "novateur/WavTokenizer-medium-speech-75token"
filename = "wavtokenizer_medium_speech_320_24k.ckpt"
model_path = hf_hub_download(repo_id=repo_id, filename=filename)

configname = "wavtokenizer_mediumdata_frame75_3s_nq1_code4096_dim512_kmeans200_attn.yaml"
config_path = hf_hub_download(repo_id=repo_id, filename=configname)

print(f"Model downloaded to: {model_path}")
print(f"Config downloaded to: {config_path}")
```

---

## 10. Generating Speech from Text

```python
txt = "All of the king's horses could drink from these waters at once..."
txt = "[BOS]" + txt + "[EOS]"
txt = torch.LongTensor(tokenizer.encode(txt))

_, atts, _, cuts = model.generate_batch(
    txt, batch_size=4, k=100, max_seqlen=2000, device="cuda"
)
```

### Processing and Playing the Generated Audio

```python
for x in cuts:
    features = wavtokenizer.codes_to_features(x[0][..., :].cuda())
    audio_out = wavtokenizer.decode(features, bandwidth_id=torch.tensor([0]).cuda())
    display(Audio(audio_out.numpy(force=True), rate=24000))
```

---

## 11. Processing an Existing Audio File

```python
audio_path = "/content/Test-1.wav"
wav, sr = torchaudio.load(audio_path)
resampler = torchaudio.transforms.Resample(orig_freq=sr, new_freq=24000)
wav = resampler(wav)
wav = wav.to("cuda")
bandwidth_id = torch.tensor([0]).cuda()
_, audio_tokens = wavtokenizer.encode_infer(wav, bandwidth_id=bandwidth_id)
```

---

## 12. Generating Speech Continuation Based on an Existing Audio Prompt

```python
txt = ("[BOS] In the heart of the ancient forest... [EOS]")
txt_encoded = torch.LongTensor(tokenizer.encode(txt)).to("cuda")

_, atts, _, cuts = model.generate_batch(
    txt_encoded, batch_size=4, k=100, max_seqlen=2000, prompt=audio_tokens, device="cuda"
)
```

---

## 13. Playing the Extended Audio Output

```python
for x in cuts:
    features = wavtokenizer.codes_to_features(x[0][..., :].cuda())
    audio_out = wavtokenizer.decode(features, bandwidth_id=bandwidth_id)
    display(Audio(audio_out.numpy(force=True), rate=24000))
```

---

## Additional Notes

After cloning the repo, download the Flash Linear Attention repo as a zip file:

[flash-linear-attention - GitHub](https://github.com/fla-org/flash-linear-attention/tree/739ef15f97cff06366c97dfdf346f2ceaadf05ce)

Store it under:

```bash
lina-speech/3rdparty
```

Replace the `Test-1.wav` path with your own `.wav` voice sample.