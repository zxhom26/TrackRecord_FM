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

    data = await request.json()
    token = data.get("token")
    if not token:
        return {"error": "token_missing"}

    api = SpotifyAPI(access_token=token)
    proxy = SpotifyAPIProxy(api)

    playlist_id = None

    # ------------------------------------------------------------
    # 1) Try finding Discover Weekly via search (correct method)
    # ------------------------------------------------------------
    print("🔍 Searching for Discover Weekly via search...")
    try:
        search_res = proxy.fetch_api(
            endpoint="search",
            params={"q": "Discover Weekly", "type": "playlist", "limit": 5},
        )
    except Exception as e:
        print("❌ Search request failed:", e)
        search_res = None

    if search_res and "playlists" in search_res:
        matches = [
            p for p in search_res["playlists"]["items"]
            if "discover weekly" in p.get("name", "").lower()
        ]
        if matches:
            playlist_id = matches[0]["id"]
            print("🎉 Found via search:", playlist_id)

    # ------------------------------------------------------------
    # 2) Optional fallback: check user library
    #    (Will NOT catch algorithmic playlists — but harmless)
    # ------------------------------------------------------------
    if not playlist_id:
        print("🔎 Checking user playlists (fallback)...")
        lib = proxy.fetch_api("me/playlists", params={"limit": 50})
        if lib and "items" in lib:
            for p in lib["items"]:
                if p.get("name", "").lower() == "discover weekly":
                    playlist_id = p.get("id")
                    print("🎉 Found in library:", playlist_id)
                    break

    # ------------------------------------------------------------
    # 3) If still none → user has no Discover Weekly
    # ------------------------------------------------------------
    if not playlist_id:
        print("❌ Discover Weekly not found anywhere")
        return {"discover_weekly": {"items": []}}

    # ------------------------------------------------------------
    # 4) Fetch tracks
    # ------------------------------------------------------------
    tracks = proxy.fetch_api(f"playlists/{playlist_id}/tracks")

    if not tracks or "error" in tracks:
        print("❌ Error fetching tracks:", tracks)
        return {"error": "track_fetch_error", "details": tracks}

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
