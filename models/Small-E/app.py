import torch
from train_lina import TrainLina
from decoder.pretrained import WavTokenizer
from transformers import PreTrainedTokenizerFast
from flask import Flask, request, send_file, jsonify
from pyngrok import ngrok
import soundfile as sf
import torchaudio
import tempfile
import numpy as np
import os

app = Flask(__name__)

print("Loading models...")
model = TrainLina.load_from_checkpoint("check/last.ckpt").model.eval().to("cuda")
tokenizer = PreTrainedTokenizerFast(tokenizer_file="bpe256.json")
config_path = "check/wavtokenizer_mediumdata_frame75_3s_nq1_code4096_dim512_kmeans200_attn.yaml"
model_path = "check/wavtokenizer_medium_speech_320_24k.ckpt"
wavtokenizer = WavTokenizer.from_pretrained0802(config_path, model_path).to("cuda")
bandwidth_id = torch.tensor([0], device="cuda")
print("Models loaded successfully.")

@app.route("/synthesize", methods=["POST"])
def synthesize():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' parameter"}), 400

    text = "[BOS]" + data["text"] + "[EOS]"
    txt = torch.LongTensor(tokenizer.encode(text)).to("cuda")

    _, _, _, cuts = model.generate_batch(txt, batch_size=1, k=100, max_seqlen=2000, device="cuda")
    x = cuts[0]

    features = wavtokenizer.codes_to_features(x[0][..., :].cuda())
    audio_out = wavtokenizer.decode(features, bandwidth_id=bandwidth_id)

    if not isinstance(audio_out, torch.Tensor):
        return jsonify({"error": "Decoded audio is not a valid tensor"}), 500

    audio_numpy = np.squeeze(audio_out.cpu().numpy())

    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_wav:
        sf.write(temp_wav.name, audio_numpy, 24000)
        temp_filename = temp_wav.name

    return send_file(temp_filename, mimetype="audio/wav", as_attachment=True, download_name="output.wav")


@app.route("/synthesize_voice", methods=["POST"])
def synthesize_voice():
    if 'text' not in request.form or 'audio' not in request.files:
        return jsonify({"error": "Missing 'text' or 'audio' parameter"}), 400

    text = request.form.get('text')
    audio_file = request.files['audio']
    text_normalized = request.form.get('text_normalized', '')

    audio_path = os.path.join('Requests', 'input_audio.wav')
    audio_file.save(audio_path)

    try:
        wav, sr = torchaudio.load(audio_path)
    except Exception as e:
        return jsonify({"error": f"Failed to load audio: {str(e)}"}), 400

    try:
        wav, sr = torchaudio.load(audio_path)
        wav = wav.to("cuda")
        bandwidth_id = torch.tensor([0]).cuda()
        _, audio_tokens = wavtokenizer.encode_infer(wav, bandwidth_id=bandwidth_id)

        print(f"Your audio tokens shape: {audio_tokens.shape}")

        txt = "[BOS]" + text_normalized + " " + text + "[EOS]"
        txt_encoded = torch.LongTensor(tokenizer.encode(txt)).to("cuda")
        print(f"Text input shape: {txt_encoded.shape}")

        # Generate
        batch_size = 4
        _, atts, _, cuts = model.generate_batch(
            txt_encoded,
            batch_size=batch_size,
            k=400,
            max_seqlen=4000,
            prompt=audio_tokens,
            device="cuda",
        )

        cut_t = audio_tokens.shape[-1]/75
        for x in cuts:
            features = wavtokenizer.codes_to_features(x[0][..., :].cuda())
            audio_out = wavtokenizer.decode(features, bandwidth_id=bandwidth_id)
            audio_out = audio_out[:, int(cut_t * 24000):]  # Crop first
            break;

        audio_numpy = np.squeeze(audio_out.cpu().numpy())

        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_wav:
            sf.write(temp_wav.name, audio_numpy, 24000)
            temp_filename = temp_wav.name

        return send_file(temp_filename, mimetype="audio/wav", as_attachment=True, download_name="output.wav")
        

    except Exception as e:
        return jsonify({"error": f"Processing failed: {str(e)}"}), 500

if __name__ == "__main__":
    print("Starting ngrok...")
    ngrok.set_auth_token("YOUR_AUTH_TOKEN")
    public_url = ngrok.connect(8000).public_url
    print(f"🚀 Public URL: {public_url}")

    app.run(host="0.0.0.0", port=8000)