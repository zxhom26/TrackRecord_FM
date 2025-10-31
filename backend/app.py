from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from spotify_api import SpotifyAPI, SpotifyAPIProxy

user_tokens = {} # temp token storage for dev

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["track-record-fm-test.vercel.app",
                    "http://localhost:3000"],  # your Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/token")
async def get_token(request: Request):
    """
    Receives access token from front end and stores it for api calls
    """
    data = await request.json()
    token = data.get('accessToken')
    if not token:
        return {"error": "token not found"}
    user_tokens['active'] = token
    return {"error": "token not found"}

@app.get("/api/data") # need to specify diff endpoints
def get_data():
    # token = user_tokens['active']
    # if not token:
    #     return {"error": "token not found. cannot make api calls"}

    # api = SpotifyAPI()
    # proxy = SpotifyAPIProxy(api, token)

    # data = proxy.fetch_api(endpoint="me/top/tracks") # default method GET

    return {"message": "Hello from Python backend!"}

handler = Mangum(app)
'''
top artists
top songs
minutes (daily, weekly, monthly)
genre
'''
