from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from spotify_api import SpotifyAPI, SpotifyAPIProxy
from analytics import UserAnalytics

user_tokens = {}

# FastAPI app setup
app = FastAPI()

# CORS setup to enable requests from frontend
# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://trackrecord-fm-ui.onrender.com",   
        "https://trackrecord-fm.onrender.com",      
        "http://localhost:3000"                     
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
async def get_top_tracks(request: Request): 
    data = await request.json()
    token = data.get("accessToken")
    if not token:
        return {"error": "no active token found"}

    analytics = UserAnalytics(access_token=token)
    top_tracks = await analytics.getTopTracks(n=20)

    return {"top_tracks": top_tracks}

# SEND TOP ARTISTS TO FRONTEND
@app.post("/api/top-artists")
async def get_top_artists(request: Request): 
    data = await request.json()
    token = data.get("accessToken")
    if not token:
        return {"error": "no active token found"}

    analytics = UserAnalytics(access_token=token)
    top_artists = await analytics.getTopArtists(n=20)

    return {"top_artists": top_artists}

# SEND RECENTLY PLAYED TO FRONTEND
@app.post("/api/recently-played")
async def get_recently_played(request: Request): 
    data = await request.json()
    token = data.get("accessToken")
    if not token:
        return {"error": "no active token found"}

    analytics = UserAnalytics(access_token=token)
    recently_played = await analytics.getRecentlyPlayed(n=50)

    return {"recently_played": recently_played}

# SEND TOP GENRES TO FRONTEND
@app.post("/api/top-genres")
async def get_top_genres(request: Request): 
    data = await request.json()
    token = data.get("accessToken")
    if not token:
        return {"error": "no active token found"}

    analytics = UserAnalytics(access_token=token)
    top_genres = await analytics.getTopGenres(n=50)

    return {"top_genres": top_genres}

# SEND QUICK STATS TO FRONTEND
@app.post("/api/quick-stats")
async def get_quick_stats(request: Request): 
    data = await request.json()
    token = data.get("accessToken")
    if not token:
        return {"error": "no active token found"}

    analytics = UserAnalytics(access_token=token)
    quick_stats = await analytics.getQuickStats()

    return {"quick_stats": quick_stats}

# SEND SONG RECOMMENDATIONS TO FRONTEND
@app.post("/api/recommendations")
async def get_song_recommendations(request: Request): 
    data = await request.json()
    token = data.get("accessToken")
    if not token:
        return {"error": "no active token found"}

    analytics = UserAnalytics(access_token=token)
    recommendations = await analytics.getSongRecommendations(n=20)

    return {"recommendations": recommendations}

