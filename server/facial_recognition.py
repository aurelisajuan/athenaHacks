from deepface import DeepFace


def facial_recognition(path1, path2):
    result = DeepFace.verify(
        img1_path=path1,
        img2_path=path2,
    )

    return result['verified']


result = facial_recognition("demos/extracted_img.png", "demos/serena_img3.png")
print(result)
