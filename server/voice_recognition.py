from resemblyzer import VoiceEncoder, preprocess_wav
from pathlib import Path
import numpy as np


def cosine_similarity(vec1, vec2):
    """Compute cosine similarity between two vectors"""
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))


def voice_recognition(path1, path2):
    # Load and preprocess the audio files
    fpath1 = Path(path1)
    fpath2 = Path(path2)

    wav1 = preprocess_wav(fpath1)
    wav2 = preprocess_wav(fpath2)

    # Initialize the encoder
    encoder = VoiceEncoder()

    # Generate embeddings
    embed1 = encoder.embed_utterance(wav1)
    embed2 = encoder.embed_utterance(wav2)

    # Compute similarity
    similarity = cosine_similarity(embed1, embed2)

    return similarity > 0.75


result = voice_recognition("demos/extracted_voice.wav", "demos/serena_demo.wav")
print(result)