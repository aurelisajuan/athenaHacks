from moviepy import VideoFileClip
import cv2


def process_voice(input_file):
    output_file = "demos/extracted_voice.wav"  # Change to "output.wav" for WAV format

    video = VideoFileClip(input_file)
    video.audio.write_audiofile(output_file)

    return output_file


def process_video(input_file):
    output_file = "demos/extracted_img.png"

    cap = cv2.VideoCapture(input_file)

    # Get FPS and calculate frame number at 5s
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_number = int(1 * fps)

    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)

    success, frame = cap.read()
    if success:
        cv2.imwrite(output_file, frame)
        cap.release()
        return output_file
    else:
        cap.release()
        return None
