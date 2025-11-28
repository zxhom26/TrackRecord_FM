from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from spotify_api import SpotifyAPI, SpotifyAPIProxy

# Temporary token storage (for development)
user_tokens = {}

app = FastAPI()

# CORS setup
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

@app.get("/")
def root():
    return {"message": "✅ TrackRecord.fm API is live!"}

@app.get("/api/data")
def get_data():
    return {"message": "Hello from FastAPI backend!"}

# Receive token from frontend
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

# ---------------------------------------------------------
#   TOP TRACKS ENDPOINT  
# ---------------------------------------------------------

@app.post("/api/top-tracks")
async def top_tracks(request: Request):
    data = await request.json()
    token = data.get("token")

    if not token:
        print("❌ Missing token for /api/top-tracks")
        return {"error": "token missing"}

    api = SpotifyAPI(access_token=token)
    proxy = SpotifyAPIProxy(api)

    print("📡 Calling Spotify: GET me/top/tracks")

    response = proxy.fetch_api(
        endpoint="me/top/tracks",
        params={"limit": 20, "time_range": "short_term"}
    )

    print("📦 Spotify top tracks returned:", response)
    return {"spotify_data": response}

# ---------------------------------------------------------
#   AUDIO FEATURES ENDPOINT (FOR MOOD PAGE)
# ---------------------------------------------------------

@app.post("/api/audio-features")
async def audio_features(request: Request):
    data = await request.json()
    token = data.get("token")
    track_ids = data.get("track_ids", [])

    print("\n--- /api/audio-features CALLED ---")
    print("Token received:", token[:20] + "..." if token else None)
    print("Track IDs received:", track_ids)

    if not token:
        return {"error": "Missing token"}

    if not isinstance(track_ids, list) or len(track_ids) == 0:
        print("❌ No track IDs received at backend")
        return {"error": "Missing track_ids"}

    # Create API wrapper
    api = SpotifyAPI(access_token=token)
    proxy = SpotifyAPIProxy(api)

    # Convert track IDs to comma-separated string
    ids_str = ",".join(track_ids)

    print("🔗 Requesting Spotify audio features for:", ids_str)

    response = proxy.fetch_api(
        endpoint="/audio-features",
        params={"ids": ids_str}
    )

    print("🎵 Spotify audio features response:", response)

    # Spotify returns:
    # { "audio_features": [ {...}, {...} ] }
    audio = response.get("audio_features", [])

    print("Parsed audio features:", audio)

    return {"audio_features": audio}


# ---------------------------------------------------------
#   ORIGINAL MAIN SPOTIFY CALL 
# ---------------------------------------------------------

'''@app.post("/api/spotify")
async def call_spotify(request: Request):
    data = await request.json()

    print("\n--- /api/spotify CALLED ---")
    print("Request body:", data)

    token = data.get("token")
    if not token:
        print("❌ No token received!")
        return {"error": "token not found"}

    print("🎵 Token received in /api/spotify:", token[:25] + "...")

    api = SpotifyAPI(access_token=token)
    proxy = SpotifyAPIProxy(api)

    print("📡 Calling Spotify: GET me/top/tracks")

    # make spotify call
    response = proxy.fetch_api(endpoint="me/top/tracks")

    print("📦 Spotify API returned:", response)
    print("--- END /api/spotify ---\n")

    return {"spotify_data": response}'''
