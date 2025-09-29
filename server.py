import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router as api_router

app = FastAPI()

'''
Allows cross origin resource sharing (CORS).
Enables requests between frontend and backend servers.
Modify wildcards to include specific domains when dev if farther along. 
'''
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change later for React domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Establishes base path that all other routes will build from.  
app.include_router(api_router, prefix="/api")

'''
GET endpoint at the application's root URL (/)
Nav to base URL returns a JSON response confirming the API is active.
'''
@app.get("/")
def root():
    return {"message": "Spotify Backend API is running!"}

'''
Uvicorn — an Asynchronous Server Gateway Interface (ASGI)
Translates HTTP responses from the Internet to ASGI for python apps
Supports concurrency without blocking 
'''
# This is only for Render/Heroku, not for local `uvicorn server:app --reload`
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)

'''
Host IP must be wildcard to accept requests from all IPs to allow deployment

'''
