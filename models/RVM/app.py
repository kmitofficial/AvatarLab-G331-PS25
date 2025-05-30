from flask import Flask, request, jsonify, send_file
from pyngrok import ngrok
import os
import subprocess
import uuid
import time

app = Flask(_name_)

@app.route('/custom_bg', methods=['POST'])
def custom_bg():
    try:
        # Get current working directory for absolute paths
        base_dir = os.path.abspath(os.getcwd())
        uploads_dir = os.path.join(base_dir, 'uploads')
        
        # Ensure the uploads directory exists
        os.makedirs(uploads_dir, exist_ok=True)
        
        # Save the uploaded video
        video_file = request.files.get('video')
        if not video_file:
            return jsonify({'error': 'Video file is required'}), 400
        
        video_path = os.path.join(uploads_dir, f"input_{uuid.uuid4().hex}.mp4")
        video_file.save(video_path)
        
        # Check if a custom background was provided
        bg_file = request.files.get('bg')
        if bg_file:
            bg_path = os.path.join(uploads_dir, f"bg_{uuid.uuid4().hex}.png")
            bg_file.save(bg_path)
        else:
            # Use absolute path for default background
            bg_path = os.path.join(base_dir, 'bg.png')  # default background in project folder
        
        # Verify background file exists
        if not os.path.exists(bg_path):
            return jsonify({'error': 'Background file not found'}), 400
        
        # Output path with absolute path
        temp_output_filename = f"temp_output_{uuid.uuid4().hex}.mp4"
        temp_output_path = os.path.join(uploads_dir, temp_output_filename)
        
        final_output_filename = f"output_{uuid.uuid4().hex}.mp4"
        final_output_path = os.path.join(uploads_dir, final_output_filename)
        
        print(f"Processing video: {video_path}")
        print(f"Using background: {bg_path}")
        print(f"Temporary output will be saved to: {temp_output_path}")
        print(f"Final output will be saved to: {final_output_path}")
        
        # Run the inference command with absolute paths
        command = [
            'python', os.path.join(base_dir, 'inference.py'),
            '--variant', 'mobilenetv3',
            '--device', 'cpu',
            '--checkpoint', os.path.join(base_dir, 'weights/rvm_mobilenetv3.pth'),
            '--input-source', video_path,
            '--background-source', bg_path,
            '--input-resize', '584', '584',
            '--output-composition', temp_output_path,
            '--output-type', 'video'
        ]
        
        print(f"Running command: {' '.join(command)}")
        
        # Run the subprocess
        process = subprocess.run(command, check=True, capture_output=True, text=True)
        print(f"Process stdout: {process.stdout}")
        print(f"Process stderr: {process.stderr}")
        
        # Wait a moment to ensure file system has completed writing
        time.sleep(1)
        
        # Verify the output file exists
        if not os.path.exists(temp_output_path):
            print(f"Output file not found at: {temp_output_path}")
            
            # Check if it's in a different location
            for root, dirs, files in os.walk(base_dir):
                if temp_output_filename in files:
                    found_path = os.path.join(root, temp_output_filename)
                    print(f"Found output file at: {found_path}")
                    temp_output_path = found_path
                    break
            else:
                return jsonify({'error': 'Output file not created'}), 500
        
        # Now copy the audio from the original video to the output
        print(f"Copying audio from original video to output")
        ffmpeg_command = [
            'ffmpeg',
            '-i', temp_output_path,  # Video without audio
            '-i', video_path,        # Original video with audio
            '-c:v', 'copy',          # Copy video stream without re-encoding
            '-c:a', 'aac',           # Use AAC codec for audio
            '-map', '0:v:0',         # Use video from first input
            '-map', '1:a:0',         # Use audio from second input
            '-shortest',             # End when shortest input ends
            final_output_path
        ]
        
        print(f"Running FFmpeg command: {' '.join(ffmpeg_command)}")
        ffmpeg_process = subprocess.run(ffmpeg_command, check=True, capture_output=True, text=True)
        print(f"FFmpeg stdout: {ffmpeg_process.stdout}")
        print(f"FFmpeg stderr: {ffmpeg_process.stderr}")
        
        # Check if the final output file exists
        if not os.path.exists(final_output_path):
            print(f"Final output file not found at: {final_output_path}")
            return jsonify({'error': 'Final output file not created'}), 500
        
        print(f"Sending file: {final_output_path}")
        
        # Return the output video with download name
        return send_file(
            final_output_path, 
            mimetype='video/mp4', 
            as_attachment=True,
            download_name='processed_video.mp4'
        )
        
    except subprocess.CalledProcessError as e:
        print(f"Processing error: {e}")
        if hasattr(e, 'output'):
            print(f"Process output: {e.output}")
        if hasattr(e, 'stderr'):
            print(f"Process stderr: {e.stderr}")
        return jsonify({'error': 'Video processing failed', 'details': str(e)}), 500
    except Exception as e:
        print(f"General error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Server error', 'details': str(e)}), 500

@app.route('/api/process-video', methods=['GET', 'POST'])
def process_video():
    if request.method == 'POST':
        # This endpoint now supports POST requests
        return custom_bg()
    else:
        return "This endpoint supports POST requests. Please use POST with video and optional bg files."

@app.route('/', methods=['GET'])
def home():
    return "Video Background Replacement API is running. Use POST /custom_bg to process videos."

if _name_ == '_main_':
    print("Starting ngrok...")
    ngrok.set_auth_token("YOUR_AUTH_TOKEN")
    public_url = ngrok.connect(8000).public_url
    print(f"🚀 Public URL: {public_url}")
    
    app.run(host="0.0.0.0", port=8004)