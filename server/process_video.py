from moviepy import VideoFileClip
import cv2
from resemblyzer import VoiceEncoder, preprocess_wav
from pathlib import Path
from deepface import DeepFace
import numpy as np
import os


def embed_voice(path):
    fpath = Path(path)
    wav = preprocess_wav(fpath)
    encoder = VoiceEncoder()
    embed = encoder.embed_utterance(wav)
    return embed


def embed_face(image_path, model_name="VGG-Face"):
    embedding = DeepFace.represent(img_path=image_path, model_name=model_name)[0]["embedding"]
    return np.array(embedding)


def process_voice(input_file, user_id, category=1):
    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input file {input_file} not found.")

    output_file = f"user_data/{user_id}_checkin_voice.wav"
    if category == 1:
        output_file = f"user_data/{user_id}_ref_voice.wav"

    video = VideoFileClip(input_file)
    video.audio.write_audiofile(output_file)
    embed = embed_voice(output_file)
    # os.remove(output_file)
    return embed


def process_image(input_file, user_id, category=1):
    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input file {input_file} not found.")

    output_file = f"user_data/{user_id}_checkin_face.png"
    if category == 1:
        output_file = f"user_data/{user_id}_ref_face.png"

    cap = cv2.VideoCapture(input_file)

    # Get FPS and calculate frame number at 5s
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_number = int(1 * fps)

    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)

    success, frame = cap.read()
    if success:
        cv2.imwrite(output_file, frame)
        cap.release()
        embed = embed_face(output_file)
        # os.remove(output_file)
        return embed
    else:
        cap.release()
        # os.remove(output_file)
        return None

