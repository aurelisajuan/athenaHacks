from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Form, HTTPException, Request
import aiofiles
from recognition import recognition
from process_video import *

app = FastAPI()

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js runs on 3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/data")
def get_data():
    return {"message": "Hello from FastAPI!"}


@app.post("/get-origin")
async def get_origin(origin: str = Form(...)):
    if not origin.strip():
        raise HTTPException(status_code=400, detail="Destination cannot be empty")
    return {"received_message": origin}


@app.post("/get-destination")
async def get_destination(destination: str = Form(...)):
    if not destination.strip():
        raise HTTPException(status_code=400, detail="Destination cannot be empty")
    return {"received_message": destination}


@app.post("/get-interval")
async def get_interval(time: int = Form(...)):
    if time <= 0:
        raise HTTPException(status_code=400, detail="Interval must be greater than 0")
    return {"received_message": time}


@app.post("/check-in")
async def check_in(request: Request):
    try:
        video_bytes = await request.body()  # Read the video bytes
        path = "demos/serena_video.mp4"

        async with aiofiles.open(path, "wb") as video_file:
            await video_file.write(video_bytes)

        voice_path = process_voice(path)
        img_path = process_video(path)

        result = recognition(voice_path, "demos/serena_demo.wav", img_path, "demos/serena_img3.png")

        return {"matched": result}

    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
