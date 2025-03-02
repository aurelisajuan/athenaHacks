from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Form, HTTPException

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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
