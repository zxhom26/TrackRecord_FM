from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.spotify_api import SpotifyAPI, SpotifyAPIProxy

# Temporary token storage (for development)
user_tokens = {}

app = FastAPI()

# ✅ Add correct CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://track-record-fm-test.vercel.app",  # production frontend
        "http://localhost:3000",                    # local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Simple test route
@app.get("/api/data")
def get_data():
    return {"message": "Hello from FastAPI backend!"}

# ✅ Receive and store access token
@app.post("/api/token")
async def get_token(request: Request):
    data = await request.json()
    token = data.get("accessToken")
    if not token:
        return {"error": "token not found"}
    user_tokens["active"] = token
    return {"message": "token stored successfully"}

# ✅ Spotify route example
@app.post("/api/spotify")
async def call_spotify(request: Request):
    data = await request.json()
    token = data.get("token")

    if not token:
        return {"error": "token not found"}

    # Example call using your wrapper
    api = SpotifyAPI()
    proxy = SpotifyAPIProxy(api, token)

    # Example: fetch top tracks
    response = proxy.fetch_api(endpoint="me/top/tracks")

    return {"spotify_data": response}
