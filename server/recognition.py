from facial_recognition import facial_recognition
from voice_recognition import voice_recognition


def recognition(voice1, voice2, face1, face2):
    voice = voice_recognition(voice1, voice2)
    if not voice:
        return False, 0

    face = facial_recognition(face1, face2)
    if not face:
        return False, 1

    return True, 2
