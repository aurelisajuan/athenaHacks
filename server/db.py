import os
import uuid
import csv
import asyncio
from datetime import datetime
from supabase import create_async_client, AsyncClient
from dotenv import load_dotenv

load_dotenv(override=True)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_API_KEY = os.getenv("SUPABASE_API_KEY", "")

# supabase: AsyncClient = create_async_client(SUPABASE_URL, SUPABASE_API_KEY)

async def get_client() -> AsyncClient:
    """
    Helper function to create and return a new asynchronous Supabase client.
    """
    return await create_async_client(SUPABASE_URL, SUPABASE_API_KEY)

async def user_signup(first_name: str, last_name: str, phone_num: str, password: str, voice_embed: list) -> dict:
    data = {
        "first_name": first_name,
        "last_name": last_name,
        "phone_num": phone_num,
        "pass": password,  
        "voice_embed": voice_embed, 
        "created_at": datetime.utcnow().isoformat()
    }

    client = get_client() 
    response = await client.table("users").insert(data).execute()
    result = response.dict() 

    if result.get("error") is None:
        return {"status": "success", "data": result.get("data")}
    else:
        return {"status": "error", "message": result.get("error")}

async def reset_checkins() -> dict:
    """
    Resets the 'check_ins' table by deleting all its records.
    """
    client = get_client()
    response = await client.table("check_ins").delete().neq("video_url", "").execute()
    result = response.dict()

    if result.get("error") is None:
        return {"status": "success", "data": result.get("data")}
    else:
        return {"status": "error", "message": result.get("error")}
    
async def reset_trips() -> dict:
    """
    Resets the 'trips' table by deleting all its records.
    """
    client = get_client()
    response = await client.table("trips").delete().neq("status", "").execute()
    result = response.dict()

    if result.get("error") is None:
        return {"status": "success", "data": result.get("data")}
    else:
        return {"status": "error", "message": result.get("error")}
    
async def reset_emergency_contacts() -> dict:
    """
    Resets the 'emergency_contact' table by deleting all its records.
    """
    client = get_client()

    response = await client.table("emergency_contact").delete().neq("contact_name", "").execute()
    result = response.dict()

    if result.get("error") is None:
        return {"status": "success", "data": result.get("data")}
    else:
        return {"status": "error", "message": result.get("error")}
    
async def reset_users() -> dict:
    """
    Resets the 'users' table by deleting all its records.
    """
    client = get_client()
    response = await client.table("users").delete().neq("first_name", "").execute()
    result = response.dict()

    if result.get("error") is None:
        return {"status": "success", "data": result.get("data")}
    else:
        return {"status": "error", "message": result.get("error")}
    
async def reset_db() -> dict:
    """
    Resets the entire database to the default state.
    Deletion is done in the following order to respect foreign key constraints:
        1. CheckIns (child of Trips)
        2. Trips (child of Users)
        3. Emergency Contacts (child of Users)
        4. Users (parent)
    """
    results = {}
    results["check_ins"] = await reset_checkins()
    results["trips"] = await reset_trips()
    results["emergency_contacts"] = await reset_emergency_contacts()
    results["users"] = await reset_users()

    return {"status": "success", "results": results}

async def set_status(trip_id: str, status: str) -> dict:
    """
    Updates the status of a trip in the 'trips' table.
    
    Parameters:
        trip_id (str): The unique identifier of the trip.
        status (str): The new status. Allowed values: "safe", "alert", "completed".
        
    Returns:
        dict: A response dict indicating success or error with corresponding data.
    """
    # allowed_statuses = {"arrived", "delayed", "in progress"}
    allowed_statuses = {"safe", "alert", "completed"}
    if status not in allowed_statuses:
        return {
            "status": "error",
            "message": f"Invalid status provided. Allowed statuses: {allowed_statuses}"
        }

    client = get_client()
    response = await client.table("trips").update({"status": status}).eq("id", trip_id).execute()
    result = response.dict()

    if result.get("error") is None:
        return {"status": "success", "data": result.get("data")}
    else:
        return {"status": "error", "message": result.get("error")}
    
async def notify_emergency_contact(user_id: int, trip_id: int, contact_name: str, phone_number: str) -> dict:
    """
    Notifies an emergency contact by initiating a phone call.
    
    Args:
        user_id (int): Unique identifier for the traveler.
        trip_id (int): Identifier for the trip.
        contact_name (str): Name of the emergency contact.
        phone_number (str): Phone number of the emergency contact.
    
    Returns:
        dict: A dictionary with the result of the call initiation.
    """
    message = f"Emergency Alert: Traveler {user_id} on trip {trip_id} requires assistance. Please contact {contact_name} immediately."
    # Optionally, you can also call sendPushNotification here if needed.
    call_result = initiateCall(phone_number)
    return {"call": call_result}

def initiateCall(phoneNumber: str) -> dict:
    """
    Dummy function to simulate initiating an automated call.
    Replace with your actual call initiation service.
    """
    return {"called": True, "phoneNumber": phoneNumber}
