import os
import math
import requests
import asyncio
import uvicorn
from functools import partial

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Form, Request
from pydantic import BaseModel, EmailStr
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
import aiofiles
from recognition import recognition
from process_video import *

app = FastAPI()

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_API_KEY = os.getenv("SUPABASE_API_KEY")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")
GOOGLE_MAPS_MATRIX_API = os.getenv("GOOGLE_MAPS_API_KEY")


supabase: Client = create_client(SUPABASE_URL, SUPABASE_API_KEY)

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js runs on 3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SignUpRequest(BaseModel):
    first_name: str
    last_name: str
    phone_num: str


@app.post("/signup")
async def signup(user: SignUpRequest):
    try:
        response = supabase.table("users").insert({
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone_num": user.phone_num,
        }).execute()

        user_data = response.data[0]
        user_id = user_data["id"]

        return {
            "id": user_id,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class LoginRequest(BaseModel):
    first_name: str
    last_name: str
    phone_num: str


@app.post("/login")
async def login(user: LoginRequest):
    try:
        # Query the Supabase database for a matching user
        response = supabase.table("users") \
            .select("*") \
            .eq("first_name", user.first_name) \
            .eq("last_name", user.last_name) \
            .eq("phone_num", user.phone_num) \
            .execute()

        if not response.data:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        user_data = response.data[0]  # Get the matched user

        return {
            "message": "Login successful",
            "user": {
                "id": user_data["id"],
                "first_name": user_data["first_name"],
                "last_name": user_data["last_name"],
                "phone_num": user_data["phone_num"]
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/get-ref-video")
async def get_ref_video(request: Request):
    try:
        video_bytes = await request.body()  # Read the video bytes
        path = "demos/serena_reference_video.mp4"

        async with aiofiles.open(path, "wb") as video_file:
            await video_file.write(video_bytes)

        voice_path = process_voice(path)
        face_path = process_image(path)

        # save to database

    except Exception as e:
        return {"error": str(e)}


@app.post("/get-origin")
async def get_origin(origin: str = Form(...)):
    if not origin.strip():
        raise HTTPException(status_code=400, detail="Origin cannot be empty")
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

        voice_path = process_voice(path, 1)
        img_path = process_image(path, 1)

        result = recognition(voice_path, "demos/serena_demo.wav", img_path, "demos/serena_img3.png")

        return {"matched": result}

    except Exception as e:
        return {"error": str(e)}


class ETARequest(BaseModel):
    start: str
    destination: str


def calc_eta_sync(start: str, destination: str) -> int:
    """
    Synchronous function that calculates ETA using the Google Maps Distance Matrix API.
    Applies a 20% safety buffer and returns the ETA in minutes.
    """
    params = {
        "origins": start,
        "destinations": destination,
        "key": GOOGLE_MAPS_API_KEY,
        "mode": "driving"
    }

    response = requests.get(GOOGLE_MAPS_MATRIX_API, params=params)
    data = response.json()

    # Check if the API call was successful and a route was found.
    if data.get("status") != "OK":
        raise Exception("Error with Distance Matrix API: " + data.get("error_message", "Unknown error"))

    element = data["rows"][0]["elements"][0]
    if element.get("status") != "OK":
        raise Exception("No route found: " + element.get("status", "Unknown error"))

    duration_in_seconds = element["duration"]["value"]
    buffered_duration = duration_in_seconds * 1.2  # Apply 20% safety buffer
    eta_minutes = math.ceil(buffered_duration / 60)
    return eta_minutes


async def calc_eta(start: str, destination: str) -> int:
    """
    Asynchronous wrapper for the synchronous ETA calculation.
    """
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, partial(calc_eta_sync, start, destination))


# Test endpoint to check the helper function
@app.post("/calc_eta")
async def calculate_eta_endpoint(request: ETARequest):
    try:
        eta = await calc_eta(request.start, request.destination)
        return {"eta_minutes": eta}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":

    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
