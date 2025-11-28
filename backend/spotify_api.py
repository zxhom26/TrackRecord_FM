import requests
from abc import ABC, abstractmethod
import time
from typing import Dict, Any, Optional
import copy
import urllib.parse  # ⭐

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

    def fetch_api(self, endpoint, headers=None, method="GET", data=None, params=None) -> Dict[str, Any]:
        try:
            url = f"{self.base_url}/{endpoint}"

            # ⭐ include params in cache key
            query = urllib.parse.urlencode(params or {})
            cache_key = f"{url}?{query}"  # ⭐

            isCached = self.cache.get(cache_key)

            access_token = self.access_token
            if not access_token:
                raise Exception("Access token not found.")

            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }

            if isCached and "ETag" in isCached:
                headers["If-None-Match"] = isCached["ETag"]

            # ⭐ REVERTED: do NOT append params manually into endpoint
            # ⭐ CORRECT: pass params directly down to API layer
            response = self.api.fetch_api(endpoint, headers, method, data, params)  # ⭐

            if response is None:
                raise Exception("API response empty")

            elif response.status_code == 304:
                return isCached["data"]

            else:
                etag = response.headers.get("ETag")
                self.cache[cache_key] = {
                    "ETag": etag,
                    "data": response.json(),
                    "timestamp": time.time()
                }
                return self.cache[cache_key]["data"]

        except Exception as e:
            print(f"API cache search failed: {e}")
            return {}

class SpotifyAPI(APIInterface):
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.base_url = "https://api.spotify.com/v1"

    def fetch_api(self, endpoint, headers=None, method="GET", data=None, params=None) -> Optional[requests.Response]:
        try:
            url = f"{self.base_url}/{endpoint.lstrip('/')}"  # ⭐ keep the fix for slashes

            access_token = self.access_token
            if not access_token:
                raise Exception("Access token not found.")

            if headers is None:
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }

            print("🎯 FINAL URL:", url, "PARAMS:", params)  # logging is fine

            # ⭐ Correct: requests handles params itself
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                json=data,
                params=params  # ⭐ correct usage
            )

            if response.status_code not in range(200, 400):
                raise Exception(
                    f"Spotify API request failed with code {response.status_code}: {response.text}"
                )

            return response

        except Exception as e:
            print(f"{e}")
            return None

    def get_token(self):
        return copy.copy(self.access_token)
