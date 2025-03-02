import math
import asyncio

import googlemaps
import uvicorn
from functools import partial
import ast
import os
import json

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Form, Request, UploadFile, File, WebSocket, WebSocketDisconnect
from typing import Optional
from concurrent.futures import TimeoutError as ConnectionTimeoutError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
import aiofiles
from recognition import recognition
from process_video import *

from custom_types import (
    ConfigResponse,
    ResponseRequiredRequest,
)
from retell import Retell
from llm import LlmClient

from db import set_status, notify_emergency_contact

app = FastAPI()

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_API_KEY = os.getenv("SUPABASE_API_KEY")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_API_KEY) #TODO: Change this to async client
retell = Retell(api_key=os.environ["RETELL_API_KEY"])

client = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)

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
async def get_ref_video(user_id: int = Form(...), file: UploadFile = File(...)):
    path = f"user_data/{user_id}_ref_vid.mp4"
    try:
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID is required")

        async with aiofiles.open(path, "wb") as video_file:
            content = await file.read()
            await video_file.write(content)

        voice_embed = process_voice(path, user_id)
        face_embed = process_image(path, user_id)

        # save to database
        response = supabase.table("users").update({
            "voice_embed": voice_embed.tolist(),
            "face_embed": face_embed.tolist()
        }).eq("id", user_id).execute()

        if response.count == 0:
            raise HTTPException(status_code=404, detail="User ID not found in database")
        safe_remove(path)
        return {
            "message": "Reference video processed successfully"
        }

    except Exception as e:
        safe_remove(path)
        return {"error": str(e)}


class TripRequest(BaseModel):
    user_id: int
    start_location: str
    destination: str
    interval: int


@app.post("/save-trip")
async def save_trip(trip: TripRequest):
    if not trip.user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
    if not trip.start_location.strip():
        raise HTTPException(status_code=400, detail="Start location cannot be empty")
    if not trip.destination.strip():
        raise HTTPException(status_code=400, detail="Destination cannot be empty")

    trip_data = trip.dict()

    # Insert trip data into Supabase
    response = supabase.table("trips").insert(trip_data).execute()

    if response.data:
        return {"message": "Trip saved successfully", "trip_id": response.data[0]["id"]}
    else:
        raise HTTPException(status_code=500, detail="Failed to save trip")


class TripStartRequest(BaseModel):
    user_id: int
    trip_id: int

async def scheduled_call(delay: float, mode: int, trip_data: dict, traveler_data: dict):
    # Wait for the specified delay (in seconds)
    await asyncio.sleep(delay)
    # Make the phone call using your retell client
    retell.call.create_phone_call(
        from_number=retell_number,
        to_number=user_number,
        metadata={
            "mode": mode,
            "trip_details": trip_data,
            "traveler_details": traveler_data,
        },
    )

@app.post("/start")
async def save_trip(trip: TripStartRequest):
    if not trip.user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
    if not trip.trip_id:
        raise HTTPException(status_code=400, detail="Trip ID is required")

    response = supabase.table("trips").select("*").eq("id", trip.trip_id).eq("user_id", trip.user_id).execute()

    # Grab user details
    user_response = supabase.table("users").select("*").eq("id", trip.user_id).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="Trip not found")

    trip_data = response.data[0]
    start_location = trip_data["start_location"]
    destination = trip_data["destination"]

    eta_minutes = await calc_eta(start_location, destination)

    trip_data = trip.dict()
    trip_data["eta"] = eta_minutes

    update_response = supabase.table("trips").update({"eta": eta_minutes}).eq("id", trip.trip_id).execute()

    if update_response.data:
        # TODO: Here, we set up three timers
        # One timer at 50% eta, to call the user
        # Two timer at 120% eta to call the user
        # Three timer at 100% eta to send a push notification to the user

        retell_number = "+14435668609"
        user_number = "+14435668609" # TODO: Change this to demo number

        eta_seconds = eta_minutes * 60

        # Schedule calls:
        # Scenario 1: Call at 50% of ETA (mode 0)
        asyncio.create_task(
            scheduled_call(eta_seconds * 0.5, 0, trip_data, user_response.data[0])
        )
        # Scenario 2: Call at 120% of ETA (mode 1)
        asyncio.create_task(
            scheduled_call(eta_seconds * 1.2, 1, trip_data, user_response.data[0])
        )
            

        # Scenario 3:
        # TODO: FCM push notification, will need to set up firebase


        return {
            "eta": eta_minutes,
        }
    else:
        raise HTTPException(status_code=500, detail="Failed to update trip")


def get_embeddings(user_id: int):
    response = supabase.table("users").select("voice_embed, face_embed").eq("id", user_id).execute()

    # Check if user exists
    if not response.data:
        raise HTTPException(status_code=404, detail="User ID not found in database")

    # Extract embeddings
    embeddings = response.data[0]

    voice_embedding = embeddings["voice_embed"]
    face_embedding = embeddings["face_embed"]

    if isinstance(voice_embedding, str):  # Convert from string to list
        voice_embedding = ast.literal_eval(voice_embedding)

    if isinstance(face_embedding, str):  # Convert from string to list
        face_embedding = ast.literal_eval(face_embedding)

    voice_embedding = np.array(voice_embedding, dtype=np.float32)
    face_embedding = np.array(face_embedding, dtype=np.float32)

    return voice_embedding, face_embedding


@app.post("/check-in")
async def check_in(user_id: int = Form(...), file: UploadFile = File(...)):
    path = f"user_data/{user_id}_checkin_vid.mp4"
    try:
        if not user_id:
            HTTPException(status_code=400, detail="User ID is required")

        async with aiofiles.open(path, "wb") as video_file:
            content = await file.read()
            await video_file.write(content)

        voice_embed1, face_embed1 = get_embeddings(user_id)

        voice_embed2 = process_voice(path, user_id)
        face_embed2 = process_image(path, user_id)

        result = recognition(voice_embed1, voice_embed2, face_embed1, face_embed2)

        safe_remove(path)
        return {"matched": result}

    except Exception as e:
        safe_remove(path)
        return {"error": str(e)}


def calc_eta_sync(start: str, destination: str) -> int:
    """
    Synchronous function that calculates ETA using the Google Maps Distance Matrix API.
    Applies a 20% safety buffer and returns the ETA in minutes.
    """
    # params = {
    #     "origins": start,
    #     "destinations": destination,
    #     "key": GOOGLE_MAPS_API_KEY,
    #     "mode": "driving"
    # }

    response = client.distance_matrix(origins=start, destinations=destination, mode="driving")
    print(response)
    # The response is already a dictionary, no need to call json()
    data = response

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


class ETARequest(BaseModel):
    start: str
    destination: str

    # WebSocket server for exchanging messages with the Retell server.
@app.websocket("/llm-websocket/{call_id}")
async def websocket_handler(websocket: WebSocket, call_id: str):
    try:
        await websocket.accept()
        llm_client = None

        # Send configuration to the Retell server
        config = ConfigResponse(
            response_type="config",
            config={
                "auto_reconnect": True,
                "call_details": True,
            },
            response_id=1,
        )
        await websocket.send_json(config.__dict__)
        response_id = 0

        async def handle_message(request_json):
            nonlocal response_id
            nonlocal llm_client
            if request_json["interaction_type"] == "call_details":
                print(request_json["call"]["metadata"])
                mode = request_json["call"]["metadata"]["mode"]
                trip_details = request_json["call"]["metadata"]["trip_details"]
                traveler_details = request_json["call"]["metadata"]["traveler_details"]
                llm_client = LlmClient(mode, trip_details, traveler_details)
                print("LLM client created")
                first_event = await llm_client.draft_begin_messsage()
                await websocket.send_text(json.dumps(first_event))
                return
            if request_json["interaction_type"] == "ping_pong":
                pong_response = {
                    "response_type": "ping_pong",
                    "timestamp": request_json["timestamp"],
                }
                print("Sending ping pong response:", pong_response)
                await websocket.send_json(pong_response)
                return
            if request_json.get("interaction_type") == "update_only":
                print("Update only interaction received, ignoring.")
                return
            if request_json["interaction_type"] in [
                "response_required",
                "reminder_required",
            ]:
                response_id = request_json["response_id"]
                transcript = request_json.get("transcript", [])

                request_obj = ResponseRequiredRequest(
                    interaction_type=request_json["interaction_type"],
                    response_id=response_id,
                    transcript=transcript,
                )
                async for event in llm_client.draft_response(request_obj):
                    try:
                        await websocket.send_json(event.__dict__)
                    except Exception as e:
                        print(
                            f"Error sending event via WebSocket: {e} for call_id: {call_id}"
                        )
                    if request_obj.response_id < response_id:
                        print("New response needed, abandoning current draft.")
                        break

        async for data in websocket.iter_json():
            asyncio.create_task(handle_message(data))

    except WebSocketDisconnect:
        print(f"LLM WebSocket disconnected for {call_id}")
    except ConnectionTimeoutError as e:
        print(f"Connection timeout error for {call_id}: {e}")
    except Exception as e:
        print(f"Error in LLM WebSocket: {e} for call_id: {call_id}")
        await websocket.close(1011, "Server error")
    finally:
        print(f"LLM WebSocket connection closed for {call_id}")


# Test endpoint to check the helper function
@app.post("/calc_eta")
async def calculate_eta_endpoint(request: ETARequest):
    try:
        eta = await calc_eta(request.start, request.destination)
        return {"eta_minutes": eta}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class StatusUpdateRequest(BaseModel):
    trip_id: str
    status: str  # e.g., "safe", "alert", "completed"
    notes: Optional[str] = None

class NotifyECRequest(BaseModel):
    traveler_id: int
    trip_id: int
    contact_name: str
    phone_number: str

@app.post("/api/status/update")
async def update_status(request: StatusUpdateRequest):
    """
    API Route: /api/status/update (POST)
    Inputs: Request body with trip ID, status update, and optional notes
    Outputs: JSON response confirming status update
    """
    result = await set_status(request.trip_id, request.status)
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result

@app.post("/api/status/update")
async def update_status(request: StatusUpdateRequest):
    """
    API Route: /api/status/update (POST)
    Inputs: Request body with trip ID, status update, and optional notes
    Outputs: JSON response confirming status update
    """
    result = await set_status(request.trip_id, request.status)
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    return result

@app.post("/api/notify/ec")
async def notify_ec(request: NotifyECRequest):
    """
    API Route: /api/notify/ec (POST)
    Inputs: Request body with traveler’s ID, trip ID, and emergency contact details
    Outputs: JSON response indicating that the emergency contact has been notified
    """
    result = await notify_emergency_contact(
        user_id=request.traveler_id,
        trip_id=request.trip_id,
        contact_name=request.contact_name,
        phone_number=request.phone_number
    )
    return result

@app.get("/api/alerts")
async def get_alerts(user_id: str, trip_id: str, status: str):
    """
    API Route: /api/alerts (GET)
    Inputs: Query parameters (user_id, trip_id)
    Outputs: JSON object containing alert history and current status
    """
    response = supabase.table("trips").select("*").eq("user_id", user_id).eq("trip_id", trip_id).eq("statue", status).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="No alerts found for the given user and trip ID")

    return {"user_id": user_id, "trip_id": trip_id, "status": status}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
