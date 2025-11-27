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

    # ------------------------
    # 1. Safe JSON load
    # ------------------------
    try:
        data = await request.json()
    except Exception as e:
        print("❌ JSON parse error:", e)
        return {"error": "invalid_json"}

    token = data.get("token")
    if not token:
        print("❌ No token provided")
        return {"error": "token_missing"}

    api = SpotifyAPI(access_token=token)
    proxy = SpotifyAPIProxy(api)

    playlist_id = None

    # ------------------------
    # 2. SEARCH method
    # ------------------------
    print("🔍 Searching for Discover Weekly via /search...")
    try:
        search_res = proxy.fetch_api(
            endpoint="search",
            params={"q": "Discover Weekly", "type": "playlist", "limit": 5},
        )
    except Exception as e:
        print("❌ Error during search:", e)
        search_res = {}

    playlists = (
        search_res.get("playlists", {}) or {}
    ).get("items", []) or []

    for p in playlists:
        name = (p.get("name") or "").lower()
        if "discover weekly" in name:
            playlist_id = p.get("id")
            print("🎉 Found via search:", playlist_id)
            break

    # ------------------------
    # 3. Fallback: /me/playlists (optional)
    # ------------------------
    if not playlist_id:
        print("🔎 Checking /me/playlists (fallback)...")

        try:
            lib = proxy.fetch_api(
                endpoint="me/playlists",
                params={"limit": 50}
            )
        except Exception as e:
            print("❌ Error reading library:", e)
            lib = {}

        items = lib.get("items", []) or []
        for p in items:
            if (p.get("name") or "").lower() == "discover weekly":
                playlist_id = p.get("id")
                print("🎉 Found in library:", playlist_id)
                break

    # ------------------------
    # 4. Still missing
    # ------------------------
    if not playlist_id:
        print("❌ Discover Weekly not found (search + library)")
        return {"discover_weekly": {"items": []}}

    # ------------------------
    # 5. Fetch tracks
    # ------------------------
    print("📡 Fetching tracks for playlist:", playlist_id)
    try:
        tracks_res = proxy.fetch_api(
            endpoint=f"playlists/{playlist_id}/tracks"
        )
    except Exception as e:
        print("❌ Track fetch exception:", e)
        return {"error": "track_fetch_failed"}

    if not tracks_res:
        print("❌ Track fetch returned None")
        return {"discover_weekly": {"items": []}}

    if isinstance(tracks_res, dict) and "error" in tracks_res:
        print("❌ Spotify track error:", tracks_res)
        return {"discover_weekly": {"items": []}}

    print("📦 Returning tracks")
    return {"discover_weekly": tracks_res}



# DEBUGGING DISCOVER WEEKLY ISSUE
@app.post("/api/debug-playlists")
async def debug_playlists(request: Request):
    data = await request.json()
    token = data.get("token")

    api = SpotifyAPI(access_token=token)
    proxy = SpotifyAPIProxy(api)

    playlists = proxy.fetch_api("me/playlists", params={"limit": 50})
    return playlists
