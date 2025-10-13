import requests
import time
from dotenv import load_dotenv
import os

class AuthenticationManager:
    '''
    - client_id: String
- client_secret: String
- user_access_token: String
- user_id: String

    - authenticate_user()
- get_client_id()
- get_api_key()
- set_client_id(client_id)
- set_api_key(client_id)


    '''
    def __init__(self, client_id, client_secret):
        load_dotenv() # Load environment variables from a .env file
        self.client_id = os.getenv("CLIENT_ID")
        self.client_secret = os.getenv("CLIENT_SECRET")

        # self.access_token = None
        # self.token_expiry = 0

    def authenticate(self):
        # Example: Get token from server
        response = requests.post("https://api.example.com/token", data={
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "grant_type": "client_credentials"
        })
        data = response.json()
        self.access_token = data["access_token"]
        self.token_expiry = time.time() + data.get("expires_in", 3600)

    def get_token(self):
        if not self.access_token or time.time() >= self.token_expiry:
            self.authenticate()
        return self.access_token