from process_video import *


def compare_embeddings(embed1, embed2):
    similarity = np.dot(embed1, embed2) / (np.linalg.norm(embed1) * np.linalg.norm(embed2))
    return similarity > 0.5  # Threshold (adjust as needed)


def facial_recognition(embed1, path):
    embed2 = embed_face(path)
    result = compare_embeddings(embed1, embed2)

    return result


def facial_recognition_hc(path1, path2):
    result = DeepFace.verify(
        img1_path=path1,
        img2_path=path2,
    )

    return result['verified']
