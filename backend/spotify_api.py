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
            cache_key = f"{url}?{query}"

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

            # ⭐ FIX — Build endpoint WITH query params so backend hits correct URL
            if params:
                endpoint_with_params = f"{endpoint}?{urllib.parse.urlencode(params)}"   # ⭐ FIX
            else:
                endpoint_with_params = endpoint

            # ⭐ FIX — pass None for params so base class doesn't override
            response = self.api.fetch_api(endpoint_with_params, headers, method, data, None)  # ⭐ FIX

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
            # ⭐ FIX: endpoint may already include "?...", so do NOT add another slash
            url = f"{self.base_url}/{endpoint.lstrip('/')}"  

            access_token = self.access_token
            if not access_token:
                raise Exception("Access token not found.")

            if headers is None:
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                }

            print("🎯 FINAL URL:", url, "PARAMS:", params)

            # ⭐ FIX — your previous syntax error is corrected here
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                json=data,
                params=params
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
