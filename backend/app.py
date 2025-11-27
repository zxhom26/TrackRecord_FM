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
        "https://trackrecord-fm-ui.onrender.com/", # added this
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

# MAIN SPOTIFY CALL
@app.post("/api/spotify")
async def call_spotify(request: Request):
    data = await request.json()

    print("\n--- /api/spotify CALLED ---")
    print("Request body:", data)

    token = data.get("token")
    if not token:
        print("❌ No token received!")
        return {"error": "token not found"}

    print("🎵 Token received in /api/spotify:", token[:25] + "...")

    # create API wrapper with token
    api = SpotifyAPI(access_token=token)
    proxy = SpotifyAPIProxy(api)

    print("📡 Calling Spotify: GET me/top/tracks")

    # make spotify call
    response = proxy.fetch_api(endpoint="me/top/tracks")

    print("📦 Spotify API returned:", response)
    print("--- END /api/spotify ---\n")

    return {"spotify_data": response}

# SPOTIFY CALL TO FETCH DISCOVER WEEKLY PLAYLIST
@app.post("/api/discover-weekly")
async def fetch_discover_weekly(request: Request):
    print("\n--- /api/discover-weekly CALLED ---")

    # ================================
    # 1. SAFE JSON PARSE
    # ================================
    try:
        data = await request.json()
    except Exception as e:
        print("❌ Invalid JSON", e)
        return {"error": "invalid_json"}

    token = data.get("token")
    if not token:
        print("❌ No token provided")
        return {"error": "token_missing"}

    print("🔑 Token received")

    # ================================
    # 2. INITIALIZE API PROXY
    # ================================
    try:
        api = SpotifyAPI(access_token=token)
        proxy = SpotifyAPIProxy(api)
    except Exception as e:
        print("❌ Proxy init failed:", e)
        return {"error": "proxy_init_failed"}

    # ================================
    # 3. FIND DISCOVER WEEKLY PLAYLIST
    # ================================
    try:
        search_result = proxy.fetch_api(
            endpoint="me/playlists",
            params={"limit": 50}
        )
    except Exception as e:
        print("❌ Spotify request crashed:", e)
        return {"error": "spotify_request_failed"}

    if not search_result or "error" in search_result:
        print("❌ Spotify returned error:", search_result)
        return {"error": "spotify_error", "details": search_result}

    playlists = search_result.get("items", [])
    dw = next((p for p in playlists if p.get("name") == "Discover Weekly"), None)

    if not dw:
        print("❌ No Discover Weekly for this user")
        return {"discover_weekly": {"items": []}}

    playlist_id = dw.get("id")

    # ================================
    # 4. FETCH TRACKS
    # ================================
    try:
        tracks = proxy.fetch_api(endpoint=f"playlists/{playlist_id}/tracks")
    except Exception as e:
        print("❌ Track fetch crashed:", e)
        return {"error": "track_fetch_failed"}

    if not tracks or "error" in tracks:
        print("❌ Track fetch returned error:", tracks)
        return {"error": "spotify_track_error", "details": tracks}

    print("📦 Returning Discover Weekly tracks")
    return {"discover_weekly": tracks}

# DEBUGGING DISCOVER WEEKLY ISSUE
@app.post("/api/debug-playlists")
async def debug_playlists(request: Request):
    data = await request.json()
    token = data.get("token")

    api = SpotifyAPI(access_token=token)
    proxy = SpotifyAPIProxy(api)

    playlists = proxy.fetch_api("me/playlists", params={"limit": 50})
    return playlists
