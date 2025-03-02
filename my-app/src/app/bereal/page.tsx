"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, StopCircle, RefreshCw, User } from "lucide-react";

export default function VideoUpdate() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const chunksRef = useRef<BlobPart[]>([]);

  // Initialize camera (only front camera)
  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsInitialized(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  // Start recording
  const startRecording = () => {
    if (!videoRef.current?.srcObject) return;

    // Reset chunks
    chunksRef.current = [];

    const recorder = new MediaRecorder(
      videoRef.current.srcObject as MediaStream
    );
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setVideoBlob(blob);
      simulateTranscription();
    };

    recorder.start();
    mediaRecorderRef.current = recorder;

    setIsRecording(true);
    setRecordingDuration(0);
  };

  // Stop recording
  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  // Update recording duration
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  // Initialize camera on mount
  useEffect(() => {
    initializeCamera();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Simulate transcription (replace with your backend integration)
  const simulateTranscription = () => {
    setTimeout(() => {
      setTranscription("hey yea I've just arrived at the century city.");
    }, 1000);
  };

  // Handle verification
  // const handleVerify = async () => {
  //   if (!videoBlob) return;
  //
  //   setIsVerifying(true);
  //   try {
  //     // 1. Upload the videoBlob to your backend
  //     // 2. Process facial recognition, voice recognition, and verify transcription
  //     await new Promise((resolve) => setTimeout(resolve, 1500));
  //     router.push("/");
  //   } catch (error) {
  //     console.error("Verification failed:", error);
  //   } finally {
  //     setIsVerifying(false);
  //   }
  // };

  // const userId = localStorage.getItem("user_id");

  // Reset recording
  const handleReset = () => {
    setVideoBlob(null);
    setTranscription("");
    setRecordingDuration(0);
  };

  const handleVerify = async () => {
    if (!videoBlob) {
      console.error("No video recorded.");
      return;
    }

    setIsVerifying(true);

    // Convert Blob to File
    const videoFile = new File([videoBlob], "checkin_video.mp4", {
      type: "video/mp4",
    });

    const formData = new FormData();
    formData.append("user_id", "21");
    formData.append("file", videoFile);

    // Use environment variable for backend URL
    const BACKEND_URL =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://https://95fd-207-151-52-106.ngrok-free.app";
    const API_ENDPOINT = `${BACKEND_URL}/check-in`;

    try {
      const requestOptions: { method: string; body: FormData } = {
        method: "POST",
        body: formData,
      };

      const response = await fetch(API_ENDPOINT, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Check-in response:", data);

      alert("Verification successful");
      router.push("/trip-info");

      // if (data.matched) {
      //   console.log("Verification successful");
      //   router.push("/");
      // } else {
      //   alert("Verification failed")
      //   // console.error("Verification failed");
      // }
    } catch (error) {
      console.error("Error uploading video:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Camera or Recorded Video */}
      <div className="flex-1 relative">
        {!videoBlob ? (
          <div className="relative h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {isRecording && (
              <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium">
                  {formatDuration(recordingDuration)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <video
            src={URL.createObjectURL(videoBlob)}
            controls
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-black p-6 space-y-4">
        {!videoBlob ? (
          <div className="flex justify-center items-center gap-6">
            <button
              onClick={() => router.push("/")}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isInitialized}
              className={`w-20 h-20 rounded-full border-4 flex items-center justify-center ${
                isRecording ? "border-red-500" : "border-white"
              }`}
            >
              {isRecording ? (
                <StopCircle className="w-12 h-12 text-red-500" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/90" />
              )}
            </button>

            <button
              onClick={initializeCamera}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10"
            >
              <RefreshCw className="w-6 h-6 text-white" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {transcription && (
              <p className="text-center text-white/80 px-6">{transcription}</p>
            )}

            <div className="flex justify-center gap-4">
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-full bg-white/10 text-white"
              >
                Record Again
              </button>

              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="px-6 py-3 rounded-full bg-white text-black font-medium"
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-black border-t border-white/10">
        <div className="flex justify-around py-3">
          <button
            onClick={() => router.push("/")}
            className="flex flex-col items-center text-white/60"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                fill="currentColor"
              />
              <path
                d="M13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V7C11 7.55228 11.4477 8 12 8C12.5523 8 13 7.55228 13 7V5Z"
                fill="currentColor"
              />
              <path
                d="M13 17C13 16.4477 12.5523 16 12 16C11.4477 16 11 16.4477 11 17V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V17Z"
                fill="currentColor"
              />
              <path
                d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H17C16.4477 11 16 11.4477 16 12C16 12.5523 16.4477 13 17 13H19Z"
                fill="currentColor"
              />
              <path
                d="M8 12C8 12.5523 7.55228 13 7 13H5C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11H7C7.55228 11 8 11.4477 8 12Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-xs mt-1">Trip Status</span>
          </button>
          <button className="flex flex-col items-center text-white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                fill="currentColor"
              />
              <path
                d="M13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V7C11 7.55228 11.4477 8 12 8C12.5523 8 13 7.55228 13 7V5Z"
                fill="currentColor"
              />
              <path
                d="M13 17C13 16.4477 12.5523 16 12 16C11.4477 16 11 16.4477 11 17V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V17Z"
                fill="currentColor"
              />
              <path
                d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H17C16.4477 11 16 11.4477 16 12C16 12.5523 16.4477 13 17 13H19Z"
                fill="currentColor"
              />
              <path
                d="M8 12C8 12.5523 7.55228 13 7 13H5C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11H7C7.55228 11 8 11.4477 8 12Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-xs mt-1">Update</span>
          </button>
          <button className="flex flex-col items-center text-white/60">
            <User size={24} />
            <span className="text-xs mt-1">My Contact</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
