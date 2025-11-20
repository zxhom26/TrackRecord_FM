from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from spotify_api import SpotifyAPI, SpotifyAPIProxy

# Temporary token storage (for development)
user_tokens = {}

app = FastAPI()

# ✅ Add correct CORS setup
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

# ✅ Home
@app.get("/")
def root():
    return {"message": "✅ TrackRecord.fm API is live!"}

# ✅ Simple test route
@app.get("/api/data")
def get_data():
    return {"message": "Hello from FastAPI backend!"}

# ✅ Receive and store access token
@app.post("/api/token")
async def receive_token(request: Request):
    data = await request.json()
    token = data.get("accessToken")
    if not token:
        return {"error": "token not found"}
    user_tokens["active"] = token
    return {"message": "token stored successfully"}

# ✅ Spotify route (FIXED VERSION)
@app.post("/api/spotify")
async def call_spotify(request: Request):
    data = await request.json()
    token = data.get("token")

    if not token:
        return {"error": "token not found"}

    # FIXED — must pass token into SpotifyAPI
    api = SpotifyAPI(access_token=token)

    # FIXED — SpotifyAPIProxy only accepts (api)
    proxy = SpotifyAPIProxy(api)

    # request top tracks
    response = proxy.fetch_api(endpoint="me/top/tracks")

    return {"spotify_data": response}
