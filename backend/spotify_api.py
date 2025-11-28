import requests
from abc import ABC, abstractmethod
import time
from typing import Dict, Any, Optional
import copy
import urllib.parse  # ⭐ (added for cache key fix)

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
        try:
            # build full URL
            url = f"{self.base_url}/{endpoint}"
            
            # ⭐ build cache key INCLUDING params
            query = urllib.parse.urlencode(params or {})  # ⭐
            cache_key = f"{url}?{query}"  # ⭐
            
            # ⭐ look up by the improved cache key
            isCached = self.cache.get(cache_key)  # ⭐
            
            access_token = self.access_token
            if not access_token:
                raise Exception('Access token not found. Unable to call on behalf of user.')

            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }

            if isCached and "ETag" in isCached:
                headers["If-None-Match"] = isCached["ETag"]

            response = self.api.fetch_api(endpoint, headers, method, data, params)

            if response is None:
                raise Exception('API response empty')
            elif response.status_code == 304:
                return isCached["data"]
            else:
                etag = response.headers.get("ETag")
                
                # ⭐ save to cache using improved cache key
                self.cache[cache_key] = {  # ⭐
                    "ETag": etag,
                    "data": response.json(),
                    "timestamp": time.time()
                }
                
                # ⭐ return cached data using improved key
                return self.cache[cache_key]["data"]  # ⭐

        except Exception as e:
            print(f"API cache search failed: {e}")
            return {}

    def get_cache(self):
        return copy.deepcopy(self.cache)

class SpotifyAPI(APIInterface):
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.base_url = "https://api.spotify.com/v1"
        pass

    def fetch_api(self, endpoint, headers=None, method="GET", data=None, params=None) -> Optional[requests.Response]:
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

            if response.status_code not in range(200, 400):
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
