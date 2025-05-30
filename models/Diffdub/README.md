# DiffDub: Step-by-Step Setup & Execution Guide

## 1. Clone the Repository

```bash
git clone https://github.com/liutaocode/DiffDub.git
cd DiffDub
```

---

## 2. Setting Up a Python Virtual Environment

**Check Python Version**  
DiffDub requires Python 3.9

### Create & Activate a Virtual Environment

**For Linux:**

```bash
python3 -m venv diffdub_env
source diffdub_env/bin/activate
```

**For Windows:**

```bash
python -m venv diffdub_env
diffdub_env\Scripts\activate
```

### Install Dependencies:

```bash
pip install -r requirements.txt
```

**Packages:**

- `torch`, `torchaudio`: Deep learning with PyTorch  
- `numpy`, `scipy`: Numerical and signal processing  
- `opencv-python`: Computer vision  
- `tqdm`: Progress bars  
- `imageio`: Video writing/saving

---

## 3. Downloading Pretrained Checkpoints

Download from Hugging Face:  
https://huggingface.co/taocode/diffdub/tree/main/assets/checkpoints

Move to `DiffDub/assets/checkpoints`:

- `stage1_state_dict.ckpt`: First-stage diffusion model  
- `stage2_state_dict.ckpt`: Second-stage refinement model

---

## 4. Preparing Input Files

You will need:

1. A reference video (.mp4)  
2. An audio file (.wav)  
3. HuBERT features (.npy)

---

## 5. Running All Inference Modes

### 1. One-Shot Generation

```bash
python demo.py \
    --one_shot \
    --video_inference \
    --stage1_checkpoint_path 'assets/checkpoints/stage1_state_dict.ckpt' \
    --stage2_checkpoint_path 'assets/checkpoints/stage2_state_dict.ckpt' \
    --saved_path 'assets/samples/output/' \
    --hubert_feat_path 'assets/samples/hubert.npy' \
    --wav_path 'assets/samples/audio.wav' \
    --mp4_original_path 'assets/samples/reference.mp4' \
    --denoising_step 20 \
    --saved_name 'one_shot_pred.mp4' \
    --device 'cuda:0'
```

---

### 2. Reference Video (Copy Existing Motion)

```bash
python demo.py \
    --video_inference \
    --stage1_checkpoint_path 'assets/checkpoints/stage1_state_dict.ckpt' \
    --stage2_checkpoint_path 'assets/checkpoints/stage2_state_dict.ckpt' \
    --saved_path 'assets/samples/output/' \
    --hubert_feat_path 'assets/samples/hubert.npy' \
    --wav_path 'assets/samples/audio.wav' \
    --mp4_original_path 'assets/samples/reference.mp4' \
    --denoising_step 20 \
    --saved_name 'reference_pred.mp4' \
    --device 'cuda:0'
```

---

### 3. Fine-Tuned (Using a Custom Model)

```bash
python demo.py \
    --video_inference \
    --stage1_checkpoint_path 'assets/checkpoints/custom_stage1.ckpt' \
    --stage2_checkpoint_path 'assets/checkpoints/custom_stage2.ckpt' \
    --saved_path 'assets/samples/output/' \
    --hubert_feat_path 'assets/samples/hubert.npy' \
    --wav_path 'assets/samples/audio.wav' \
    --mp4_original_path 'assets/samples/reference.mp4' \
    --denoising_step 20 \
    --saved_name 'fine_tuned_pred.mp4' \
    --device 'cuda:0'
```

---

## 6. Command Breakdown

Each argument modifies how `demo.py` runs:

- `--one_shot`: Enables one-shot inference mode  
- `--video_inference`: Specifies video output  
- `--stage1_checkpoint_path`: First denoising model  
- `--stage2_checkpoint_path`: Refinement model  
- `--saved_path`: Output path  
- `--hubert_feat_path`: Path to HuBERT .npy features  
- `--wav_path`: Input audio  
- `--mp4_original_path`: Reference video  
- `--denoising_step`: Number of denoising steps  
- `--saved_name`: Name of output file  
- `--device`: GPU device

---

## 7. Backend Execution in demo.py

### Step 1: Load Dependencies

```python
import torch
import argparse
from src.pipeline import DiffDubPipeline
from src.utils import load_hubert_feature, save_video
```

### Step 2: Parse Command-Line Arguments

```python
parser = argparse.ArgumentParser()
parser.add_argument("--one_shot", action="store_true")
parser.add_argument("--video_inference", action="store_true")
parser.add_argument("--stage1_checkpoint_path", type=str, required=True)
parser.add_argument("--stage2_checkpoint_path", type=str, required=True)
parser.add_argument("--saved_path", type=str, required=True)
parser.add_argument("--hubert_feat_path", type=str, required=True)
parser.add_argument("--wav_path", type=str, required=True)
parser.add_argument("--mp4_original_path", type=str, required=True)
parser.add_argument("--denoising_step", type=int, default=20)
parser.add_argument("--saved_name", type=str, required=True)
parser.add_argument("--device", type=str, default="cuda:0")
args = parser.parse_args()
```

### Step 3: Load HuBERT Features

```python
hubert_feat = load_hubert_feature(args.hubert_feat_path)
```

### Step 4: Initialize DiffDub Pipeline

```python
pipeline = DiffDubPipeline(
    stage1_checkpoint=args.stage1_checkpoint_path,
    stage2_checkpoint=args.stage2_checkpoint_path,
    device=args.device
)
```

### Step 5: Process the Audio

```python
audio_waveform = load_audio(args.wav_path)
```

### Step 6: Run the Diffusion Model

```python
generated_video = pipeline.generate(
    hubert_feat=hubert_feat,
    audio_waveform=audio_waveform,
    mp4_original=args.mp4_original_path,
    denoising_step=args.denoising_step,
    one_shot=args.one_shot
)
```

### Step 7: Save the Final Video

```python
save_video(generated_video, args.saved_path, args.saved_name)
```