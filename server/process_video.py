from moviepy import VideoFileClip
import cv2
from resemblyzer import VoiceEncoder, preprocess_wav
from pathlib import Path
from deepface import DeepFace
import numpy as np
import os


def safe_remove(path):
    if os.path.exists(path):
        os.remove(path)


def embed_voice(path):
    fpath = Path(path)
    wav = preprocess_wav(fpath)
    encoder = VoiceEncoder()
    embed = encoder.embed_utterance(wav)
    return embed


def embed_face(image_path, model_name="VGG-Face"):
    embedding = DeepFace.represent(img_path=image_path, model_name=model_name)[0]["embedding"]
    return np.array(embedding)


def process_voice(input_file, user_id):
    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input file {input_file} not found.")

    output_file = f"user_data/{user_id}_voice.wav"

    video = VideoFileClip(input_file)
    video.audio.write_audiofile(output_file)
    embed = embed_voice(output_file)
    safe_remove(output_file)
    return embed


import cv2
import os
import numpy as np


def process_image(input_file, user_id):
    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input file {input_file} not found.")

    output_file = f"user_data/{user_id}_face.png"

    cap = cv2.VideoCapture(input_file)

    # Get FPS and calculate frame number at 1s
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_number = int(1 * fps)

    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)

    success, frame = cap.read()
    cap.release()  # Release video capture immediately after reading frame

    if success:
        # Rotate the frame 90 degrees to the right
        frame_rotated = cv2.rotate(frame, cv2.ROTATE_90_CLOCKWISE)

        # Save rotated frame
        cv2.imwrite(output_file, frame_rotated)

        # Process face embedding
        embed = embed_face(output_file)
        safe_remove(output_file)
        return embed
    else:
        safe_remove(output_file)
        return None

# def process_image(input_file, user_id):
#     if not os.path.exists(input_file):
#         raise FileNotFoundError(f"Input file {input_file} not found.")
#
#     output_file = f"user_data/{user_id}_face.png"
#
#     cap = cv2.VideoCapture(input_file)
#
#     # Get FPS and calculate frame number at 5s
#     fps = cap.get(cv2.CAP_PROP_FPS)
#     frame_number = int(1 * fps)
#
#     cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
#
#     success, frame = cap.read()
#     if success:
#         cv2.imwrite(output_file, frame)
#         cap.release()
#         embed = embed_face(output_file)
#         safe_remove(output_file)
#         return embed
#     else:
#         cap.release()
#         safe_remove(output_file)
#         return None
