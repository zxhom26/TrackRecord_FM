from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from spotify_api import SpotifyAPI, SpotifyAPIProxy

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["track-record-fm-test.vercel.app"],  # your Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/token")
async def get_token(request: Request):
    data = await request.json()
    token = data.get('accessToken')
    return token 

@app.get("/api/data")
def get_data():

    api = SpotifyAPI() # client id param
    proxy = SpotifyAPIProxy(api, token)

    return {"message": "Hello from Python backend!"}

'''
top artists
top songs
minutes (daily, weekly, monthly)
genre

'''
