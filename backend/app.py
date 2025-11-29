from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from spotify_api import SpotifyAPI, SpotifyAPIProxy
from analytics import UserAnalytics

# Temporary token storage (for development)
user_tokens = {}

# FastAPI app setup
app = FastAPI()

# CORS setup to enable requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://trackrecord-fm-ui.onrender.com",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Basic root endpoint
@app.get("/")
def root():
    return {"message": "TrackRecord.fm backend API is live!"}

# Testing endpoint
@app.get("/api/test") 
def get_data():
    return {"message": "Hello from FastAPI backend!"}

# RECEIVE FRESH TOKEN FROM FRONTEND
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

# SEND TOP TRACKS TO FRONTEND
@app.post("/api/top-tracks")
async def get_top_tracks(): 
    token = user_tokens.get("active")
    if not token:
        return {"error": "no active token found"}

    analytics = UserAnalytics(access_token=token)
    top_tracks = await analytics.getTopTracks(n=20)

    return {"top_tracks": top_tracks}

# SEND TOP ARTISTS TO FRONTEND
@app.get("/api/top-artists")
async def get_top_artists(): 
    token = user_tokens.get("active")
    if not token:
        return {"error": "no active token found"}

    analytics = UserAnalytics(access_token=token)
    top_artists = await analytics.getTopArtists(n=20)

    return {"top_artists": top_artists}

# SEND RECENTLY PLAYED TO FRONTEND (DOES NOT SUPPORT PAGINATION)
@app.get("/api/recently-played")
async def get_recently_played(): 
    token = user_tokens.get("active")
    if not token:
        return {"error": "no active token found"}

    analytics = UserAnalytics(access_token=token)
    recently_played = await analytics.getRecentlyPlayed(n=50)

    return {"recently_played": recently_played}

# SEND TOP GENRES TO FRONTEND
@app.get("/api/top-genres")
async def get_top_genres(): 
    token = user_tokens.get("active")
    if not token:
        return {"error": "no active token found"}

    analytics = UserAnalytics(access_token=token)
    top_genres = await analytics.getTopGenres(n=50)

    return {"top_genres": top_genres}

# SEND QUICK STATS TO FRONTEND
@app.get("/api/quick-stats")
async def get_quick_stats(): 
    token = user_tokens.get("active")
    if not token:
        return {"error": "no active token found"}

    analytics = UserAnalytics(access_token=token)
    quick_stats = await analytics.getQuickStats()

    return {"quick_stats": quick_stats}

# SEND SONG RECOMMENDATIONS TO FRONTEND
@app.get("/api/recommendations")
async def get_song_recommendations(): 
    token = user_tokens.get("active")
    if not token:
        return {"error": "no active token found"}

    analytics = UserAnalytics(access_token=token)
    recommendations = await analytics.getSongRecommendations(n=20)

    return {"recommendations": recommendations}


# ------------- DEPRECATED ---------------
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
