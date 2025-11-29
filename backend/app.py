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

# NEW: Fetch user's top artists (for mood via genres)
@app.post("/api/top-artists")
async def get_top_artists(request: Request):
    data = await request.json()

    print("\n--- /api/top-artists CALLED ---")
    print("Request body:", data)

    token = data.get("token")
    if not token:
        print("❌ No token received in /api/top-artists!")
        return {"error": "token not found"}

    print("🎵 Token received in /api/top-artists:", token[:25] + "...")

    # create API wrapper with token
    api = SpotifyAPI(access_token=token)
    proxy = SpotifyAPIProxy(api)

    # We use Spotify's "Get User's Top Artists" endpoint
    # Spotify default is medium_term; we can make it explicit & set limit.
    endpoint = "me/top/artists?limit=20&time_range=medium_term"
    print(f"📡 Calling Spotify: GET {endpoint}")

    response = proxy.fetch_api(endpoint=endpoint)

    print("📦 Spotify top artists returned:", response)
    print("--- END /api/top-artists ---\n")

    # Keep return structure consistent with /api/spotify
    return {"spotify_data": response}
