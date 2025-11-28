from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from spotify_api import SpotifyAPI, SpotifyAPIProxy

# Temporary token storage (for development)
user_tokens = {}

app = FastAPI()

# ---------------------- CORS ----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://trackrecord-fm-ui.onrender.com",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------- BASIC ROUTES ----------------------
@app.get("/")
def root():
    return {"message": "✅ TrackRecord.fm API is live!"}

@app.get("/api/data")
def get_data():
    return {"message": "Hello from FastAPI backend!"}

# ---------------------- STORE TOKEN ----------------------
@app.post("/api/token")
async def receive_token(request: Request):
    data = await request.json()
    token = data.get("accessToken")

    print("\n--- /api/token RECEIVED ---")
    print("Token:", token)

    if not token:
        return {"error": "token not found"}

    user_tokens["active"] = token
    print("Stored token successfully.")

    return {"message": "token stored successfully"}

# ---------------------- FETCH TOP TRACKS ----------------------
@app.post("/api/top-tracks")
async def get_top_tracks(request: Request):
    data = await request.json()
    token = data.get("token")

    print("\n--- /api/top-tracks CALLED ---")
    print("Token:", token)

    if not token:
        return {"spotify_data": {"items": []}}

    api = SpotifyAPI(access_token=token)
    proxy = SpotifyAPIProxy(api)

    # Fetch top tracks (short_term = last 4 weeks)
    response = proxy.fetch_api(
        endpoint="me/top/tracks",
        params={"limit": 20, "time_range": "short_term"}
    )

    print("Top Tracks Response:", response)

    return {"spotify_data": response}

# ---------------------- FETCH AUDIO FEATURES ----------------------
@app.post("/api/audio-features")
async def audio_features(request: Request):
    data = await request.json()
    token = data.get("token")
    track_ids = data.get("track_ids", [])

    print("\n--- /api/audio-features CALLED ---")
    print("Track IDs:", track_ids)

    if not token or not track_ids:
        return {"audio_features": []}

    ids_str = ",".join(track_ids)

    api = SpotifyAPI(access_token=token)
    proxy = SpotifyAPIProxy(api)

    response = proxy.fetch_api(
        endpoint="audio-features",
        params={"ids": ids_str}
    )

    print("Audio Features Response:", response)

    return {"audio_features": response.get("audio_features", [])}

# ---------------------- DEBUG PLAYLISTS (OPTIONAL) ----------------------
@app.post("/api/debug-playlists")
async def debug_playlists(request: Request):
    data = await request.json()
    token = data.get("token")

    api = SpotifyAPI(access_token=token)
    proxy = SpotifyAPIProxy(api)

    playlists = proxy.fetch_api("me/playlists", params={"limit": 50})
    return playlists
