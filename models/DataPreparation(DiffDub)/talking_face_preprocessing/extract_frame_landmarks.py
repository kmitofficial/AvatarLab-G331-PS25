import argparse
import torchlm
import torch
import cv2
from torchlm.tools import faceboxesv2
from torchlm.models import pipnet
from tqdm import tqdm
import os
import numpy as np

def save_lmds(landmarks, txt_path):
    """Save landmarks for a single frame to a text file."""
    with open(txt_path, 'w') as obj:
        for x, y in landmarks:
            obj.write(f"{int(x)} {int(y)}\n")

def main(from_dir, lmd_output_dir, skip_existing, check_and_padding):
    os.makedirs(lmd_output_dir, exist_ok=True)
    device = torch.device("cuda:0")
    torchlm.runtime.bind(faceboxesv2(device=device))
    
    torchlm.runtime.bind(
        pipnet(
            backbone="resnet18",
            pretrained=True,
            num_nb=10,
            num_lms=68,
            net_stride=32,
            input_size=256,
            meanface_type="300w",
            map_location=device,
            checkpoint=None
        )
    )

    clip_dirs = os.listdir(from_dir)
    np.random.shuffle(clip_dirs)
    
    for clip_dir in tqdm(clip_dirs, desc="Processing clips"):
        frames_path = os.path.join(from_dir, clip_dir)
        
        if not os.path.isdir(frames_path):
            print(f"❌ ERROR: Expected a directory but found a file: {frames_path}")
            exit(1)

        img_lists = sorted([f for f in os.listdir(frames_path) if f.endswith('.png')])
        print(f"✅ Found {len(img_lists)} images in {frames_path}")

        # Create a subdirectory for this clip's landmarks
        clip_lmd_dir = os.path.join(lmd_output_dir, clip_dir)
        os.makedirs(clip_lmd_dir, exist_ok=True)

        last_landmarks = None
        for image_name in tqdm(img_lists):
            if not (image_name.endswith('.png') or image_name.endswith('.jpg') or image_name.endswith('.jpeg')):
                continue
                
            # Define the output landmark file path
            lmd_path = os.path.join(clip_lmd_dir, f"{os.path.splitext(image_name)[0]}.txt")
            
            if skip_existing and os.path.exists(lmd_path):
                continue

            frame = cv2.imread(os.path.join(frames_path, image_name))
            if frame is None:
                break
                
            landmarks, bboxes = torchlm.runtime.forward(frame)

            if len(bboxes) == 0:
                if check_and_padding:
                    if last_landmarks is None:
                        print(f"{clip_dir}'s {image_name} does not have first frame. Passing ...")
                        break
                    print(f"{clip_dir}'s {image_name} pads the missing landmarks using last frame.")
                    landmarks = last_landmarks
                else:
                    print(f"{clip_dir}'s {image_name} is missing, later frames will not be processed!")
                    break

            # Store only the first 68 landmarks (standard facial landmarks)
            current_landmarks = [(x, y) for x, y in landmarks[0][:68]]
            save_lmds(current_landmarks, lmd_path)
            last_landmarks = landmarks

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Extract frame landmarks.')
    parser.add_argument('--from_dir', type=str, default='./data_processing/specified_formats/videos/video_frames/',
                        help='Directory where video frames are stored')
    parser.add_argument('--lmd_output_dir', type=str, default='./data_processing/specified_formats/videos/landmarks/',
                        help='Directory where landmarks will be saved')
    parser.add_argument('--skip_existing', action='store_true',
                        help='Skip processing if landmarks file already exists')
    parser.add_argument('--check_and_padding', action='store_true',
                        help='Check and pad frames.')
    args = parser.parse_args()

    main(args.from_dir, args.lmd_output_dir, args.skip_existing, args.check_and_padding)