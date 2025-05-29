from flask import Flask, request, jsonify, send_file
from transformers import HubertModel, Wav2Vec2Processor
from demo import demo_pipeline
from pyngrok import ngrok
import os
import torch
import numpy as np
import torchaudio
from audio_features import extract_audio_features


app = Flask(__name__)


REQUESTS = 'Requests'
OUTPUTS = 'Outputs'


@app.route('/generate_video', methods=['POST'])
def generate_video():

    if 'reference_video' not in request.files or 'reference_audio' not in request.files:
        return jsonify({"error": "Missing reference_video or reference_audio"}), 400
    
    reference_video = request.files['reference_video']
    reference_audio = request.files['reference_audio']
      
    video_path = os.path.join(REQUESTS, "UserVideo.mp4")
    audio_path = os.path.join(REQUESTS, "UserAudio.wav")

    reference_video.save(video_path)
    reference_audio.save(audio_path)
    print("🚀Assests Recived And Saved...")


    try:
        print("🚀Features Generating...")
        extract_audio_features()
    
        print("🚀Video Generating...")
        demo_pipeline(
            one_shot=False,
            video_inference=True,
            stage1_checkpoint_path="assets/checkpoints/stage1_state_dict.ckpt",
            stage2_checkpoint_path="assets/checkpoints/stage2_state_dict.ckpt",
            saved_path=OUTPUTS,
            hubert_feat_path="Requests/hubert_features.npy",
            wav_path=audio_path,
            mp4_original_path=video_path,
            denoising_step=20,
            reference_image_path="assets/single_images/test001.png",
            saved_name="GeneratedVideo.mp4",
            device="cuda:0"
        )
        generated_video_path = os.path.join(OUTPUTS, "GeneratedVideo.mp4")

        if os.path.exists(generated_video_path):
            return send_file(
                generated_video_path,
                mimetype="video/mp4",
                as_attachment=True,
                download_name="final_video.mp4"
            )
        else:
            return jsonify({"error": "Failed to generate video"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
  
    print("🚀Starting ngrok...")
    ngrok.set_auth_token("YOUR_AUTH_TOKEN")
    public_url = ngrok.connect(5000).public_url
    print(f"Public URL: {public_url}")

    app.run(host="0.0.0.0", port=5000)