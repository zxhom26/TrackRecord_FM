import requests
from abc import ABC, abstractmethod
import time
from typing import Dict, Any, Optional
import copy

class APIInterface(ABC):
    @abstractmethod
    def fetch_api(self, endpoint, headers, method, data, params):
        pass

class SpotifyAPIProxy(APIInterface):
    def __init__(self, api: APIInterface):
        self.api = api
        self.cache = {}
        self.base_url = "https://api.spotify.com/v1"
        self.access_token = api.get_token()
        pass
    
    def fetch_api(self, endpoint, headers=None, method="GET", data=None, params=None) -> Dict[str, Any]:
        """
        Calls the Spotify Web API with OAuth access token.
        :param endpoint: Spotify API endpoint (e.g. "/v1/me" or "/v1/playlists/{id}")
        :param access_token: Valid Spotify OAuth token string
        :param method: HTTP method 
        :param data: Dictionary for JSON body
        :param params: Dictionary for query parameters
        :return: Parsed JSON response
        """
        try:
            url = f"{self.base_url}/{endpoint}"
            isCached = self.cache.get(url)
            
            access_token = self.access_token
            if not access_token:
                raise Exception('Access token not found. Unable to call on behalf of user.')

            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
                }

            if isCached and "ETag" in isCached: # check if url is already cached
                headers["If-None-Match"] = isCached["ETag"] # notify Spotify api that url is cached
            
            response = self.api.fetch_api(endpoint, headers, method, data, params)

            if response is None:
                raise Exception('API response empty')

            elif response.status_code == 304: # cache response is NOT EXPIRED
                print(f"Using cached data for [{url}]")
                return isCached["data"]

            else: # cache new url or recache EXPIRED response
                etag = response.headers.get("ETag")
                self.cache[url] = {
                                "ETag": etag,
                                "data": response.json(),
                                "timestamp": time.time()
                                }
                return self.cache[url]["data"]

        except Exception as e:
            print(f"API cache search failed: {e}")
            return {} # return empty dict on failure

    def get_cache(self):
        return copy.deepcopy(self.cache)

    

class SpotifyAPI(APIInterface):
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.base_url = "https://api.spotify.com/v1"
        pass

    def fetch_api(self, endpoint, headers=None, method="GET", data=None, params=None) -> Optional[requests.Response]:
        """
        Calls the Spotify Web API with OAuth access token.
        :param url: Spotify API full url 
        :param headers: Valid Spotify token and headers
        :param method: HTTP method
        :param data: Dictionary for JSON body
        :param params: Dictionary for query parameters
        :return: raw requests.Response object
        """
        try:
            url = f"{self.base_url}/{endpoint}"

            access_token = self.access_token
            if not access_token:
                raise Exception('Access token not found. Unable to call on behalf of user.')

            if headers is None:
                headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
                }

            response = requests.request(
                method=method,
                url=url, 
                headers=headers,
                json=data,
                params=params
            )

            if response.status_code not in range(200, 400): # request failed
                raise Exception(f"Spotify API request failed with code {response.status_code}: {response.text}")
            else:   
                return response

        except Exception as e:
            print(f"{e}")
            return None
    
    def get_token(self):
        return copy.copy(self.access_token)



# Sample Usage ---------------------------------------------------------
# api = SpotifyAPI(token='token1234')
# proxy = SpotifyAPIProxy(api=api)
# user_data = proxy.fetch_api(endpoint="me")
