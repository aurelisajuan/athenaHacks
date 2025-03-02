from facial_recognition import *
from voice_recognition import *


def recognition(voice_embed1, voice_path2, face_embed1, face_path2):
    voice = voice_recognition(voice_embed1, voice_path2)
    if not voice:
        return False, 0

    face = facial_recognition(face_embed1, face_path2)
    if not face:
        return False, 1

    return True, 2


def recognition_hc(voice1, voice2, face1, face2):
    voice = voice_recognition_hc(voice1, voice2)
    if not voice:
        return False, 0

    face = facial_recognition_hc(face1, face2)
    if not face:
        return False, 1

    return True, 2
