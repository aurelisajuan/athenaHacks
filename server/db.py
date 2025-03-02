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

supabase: AsyncClient = create_async_client(SUPABASE_URL, SUPABASE_API_KEY)

async def user_signup(first_name: str, last_name: str, phone_num: str) -> dict:
    data = {
        "first_name": first_name,
        "last_name": last_name,
        "phone_num": phone_num,
        "created_at": datetime.utcnow().isoformat()
    }
    
    response = await client.table("users").insert(data).execute()
    result = response.dict() 

    if result.get("error") is None:
        return {"status": "success", "data": result.get("data")}
    else:
        return {"status": "error", "message": result.get("error")}


