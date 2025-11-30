import unittest
from unittest.mock import AsyncMock, MagicMock, patch
import time
import httpx
import copy

from spotify_api import SpotifyAPIProxy, SpotifyAPI, APIInterface

class MockAPI(APIInterface):
    """Mock implementation for APIInterface."""
    def __init__(self, token="TEST_TOKEN"):
        self.token = token
        self.fetch_api = AsyncMock()
    
    async def fetch_api(self, *args, **kwargs):
        return await self.fetch_api(*args, **kwargs)

    def get_token(self):
        return self.token


# ───────────────────────────────────────────────
#              TEST: SpotifyAPIProxy
# ───────────────────────────────────────────────
class TestSpotifyAPIProxy(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        """Runs before each test."""
        self.mock_api = MockAPI()
        self.proxy = SpotifyAPIProxy(api=self.mock_api)

        # Common mock response object used by several tests
        self.mock_response = MagicMock()
        self.mock_response.status_code = 200
        self.mock_response.headers = {"ETag": "ABC123"}
        self.mock_response.json.return_value = {"result": 1}

    async def test_fetch_api_stores_cache(self):
        """Test that proxy caches new responses using ETag."""
        self.mock_api.fetch_api.return_value = self.mock_response

        result = await self.proxy.fetch_api("me")

        self.assertEqual(result, {"result": 1})
        url = "https://api.spotify.com/v1/me"
        self.assertIn(url, self.proxy.cache)
        self.assertEqual(self.proxy.cache[url]["ETag"], "ABC123")

    async def test_fetch_api_uses_cache_on_304(self):
        """Test that cached data is returned on a 304."""
        cached_url = "https://api.spotify.com/v1/me"
        self.proxy.cache[cached_url] = {
            "ETag": "ABC123",
            "data": {"cached": True},
            "timestamp": time.time(),
        }

        mock_304 = MagicMock()
        mock_304.status_code = 304
        mock_304.headers = {}

        self.mock_api.fetch_api.return_value = mock_304

        result = await self.proxy.fetch_api("me")
        self.assertEqual(result, {"cached": True})

    async def test_fetch_api_handles_missing_token(self):
        """Test that proxy returns {} if no token exists."""
        proxy = SpotifyAPIProxy(api=MockAPI(token=None))  # simulate missing token
        result = await proxy.fetch_api("me")
        self.assertEqual(result, {})

    async def test_fetch_api_recaches_on_new_response(self):
        """Test recaching when API returns new data."""
        cached_url = "https://api.spotify.com/v1/me"
        self.proxy.cache[cached_url] = {
            "ETag": "OLD",
            "data": {"old": True},
            "timestamp": time.time(),
        }

        new_resp = MagicMock()
        new_resp.status_code = 200
        new_resp.headers = {"ETag": "NEW123"}
        new_resp.json.return_value = {"updated": True}

        self.mock_api.fetch_api.return_value = new_resp

        result = await self.proxy.fetch_api("me")

        self.assertEqual(result, {"updated": True})
        self.assertEqual(self.proxy.cache[cached_url]["ETag"], "NEW123")


# ───────────────────────────────────────────────
#                    TEST: SpotifyAPI
# ───────────────────────────────────────────────
class TestSpotifyAPI(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        """Setup token and default API object."""
        self.api = SpotifyAPI(access_token="TEST_TOKEN")

    @patch("httpx.AsyncClient")
    async def test_fetch_api_success(self, mock_client_cls):
        """Test successful HTTP request."""
        mock_client = AsyncMock()
        mock_client_cls.return_value.__aenter__.return_value = mock_client

        mock_response = MagicMock()
        mock_response.status_code = 200

        mock_client.request.return_value = mock_response

        result = await self.api.fetch_api("me")
        self.assertEqual(result, mock_response)

    @patch("httpx.AsyncClient")
    async def test_fetch_api_failure(self, mock_client_cls):
        """Test returning None when Spotify returns an error code."""
        mock_client = AsyncMock()
        mock_client_cls.return_value.__aenter__.return_value = mock_client

        failure_resp = MagicMock()
        failure_resp.status_code = 401
        failure_resp.text = "Unauthorized"

        mock_client.request.return_value = failure_resp

        result = await self.api.fetch_api("me")
        self.assertIsNone(result)

    async def test_fetch_api_missing_token(self):
        """Test behavior when access token is missing."""
        api = SpotifyAPI(access_token=None)
        result = await api.fetch_api("me")
        self.assertIsNone(result)


if __name__ == "__main__":
    unittest.main()
