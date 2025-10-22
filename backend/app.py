from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from spotify_api import SpotifyAPI, SpotifyAPIProxy

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["track-record-fm-test.vercel.app"],  # your Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/data")
def get_data():
    return {"message": "Hello from Python backend!"}
