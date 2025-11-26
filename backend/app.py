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
    data = await request.json() # awaiting json
    token = data.get("token")

    print("\n--- /api/discover-weekly CALLED ---")
    print("Token received:", token[:25] + "..." if token else "❌ None")

    if not token:
        return {"error": "token not found"}

    # initialize API proxy
    api = SpotifyAPI(access_token=token)
    proxy = SpotifyAPIProxy(api)

    print("🔍 Searching for Discover Weekly playlist...")

    # 1) Search for Discover Weekly playlist
    search_result = proxy.fetch_api(
        endpoint="search",
        params={
            "q": "Discover Weekly",
            "type": "playlist",
            "limit": 1
        }
    )

    # Check if playlist exists
    playlists = search_result.get("playlists", {}).get("items", [])
    if not playlists:
        print("❌ Discover Weekly playlist not found.")
        return {"error": "Discover Weekly playlist not found"}

    playlist_id = playlists[0]["id"] # extract playlist ID
    print(f"🎵 Found Discover Weekly playlist: {playlist_id}")

    # 2) Fetch playlist tracks
    tracks = proxy.fetch_api( 
        endpoint=f"playlists/{playlist_id}/tracks" # WITHIN discover weekly, fetch top tracks
    )

    print("📦 Returned Discover Weekly tracks.")
    print("--- END /api/discover-weekly ---\n")

    return {"discover_weekly": tracks}
