import unittest
from unittest.mock import patch, MagicMock
import time
import requests
from spotify_api import SpotifyAPI, SpotifyAPIProxy


class TestSpotifyAPI(unittest.TestCase):
    def setUp(self):
        self.api = SpotifyAPI()

    @patch('spotify_api.requests.request')
    def test_fetch_api(self, mock_request):
        mock_response = MagicMock() # magic mock creates a fake object
        mock_response.json.return_value = {'music': {'track1', 'track2'}}
        mock_response.status_code = 200
        mock_response.raise_for_status = MagicMock()

        # Mock request is what patches the real request
        mock_request.return_value = mock_response # attaches mock object to the patch

        # Test standard API call --> returns Response object
        standard_call = self.api.fetch_api('fake_url', 'fake_header')
        self.assertEqual(standard_call.json(), {'music': {'track1', 'track2'}})

        # Test API call failure catch --> returns None if status code != (200,300)
        mock_response.status_code = 404
        status_check = self.api.fetch_api('fake_endpoint', 'fake_header')
        self.assertIsNone(status_check)

        # Test cached conditional response --> returns Response object
        mock_response.status_code = 304
        conditional_call = self.api.fetch_api('fake_endpoint', 'fake_header')
        self.assertEqual(conditional_call.status_code, 304)


class TestSpotifyAPIProxy(unittest.TestCase):
    def setUp(self):
        self.api = SpotifyAPI()
        self.proxy = SpotifyAPIProxy(self.api, 'fake_token')
    
    @patch('spotify_api.requests.request')
    def test_fetch_api(self, mock_request):
        # Populate the cache and check its stored properly
        first_response = MagicMock()
        first_response.status_code = 200
        first_response.json.return_value = {"data": "fresh"}
        first_response.headers = {"ETag": "12345"}
        mock_request.return_value = first_response

        result1 = self.proxy.fetch_api("fake")  # first call
        self.assertEqual(result1, {"data": "fresh"})
        cache = self.proxy.get_cache()
        self.assertIn("https://api.spotify.com/v1/fake", cache)
        self.assertEqual(cache["https://api.spotify.com/v1/fake"]["ETag"], "12345")

        # Check cached result
        cached_response = MagicMock()
        cached_response.status_code = 304
        cached_response.json.return_value = {"data": "stale"}  # should be ignored
        cached_response.headers = {}
        mock_request.return_value = cached_response

        result2 = self.proxy.fetch_api("fake")
        # should return cached "fresh" data, not new
        self.assertEqual(result2, {"data": "fresh"})

        # API call failed
        fail_response = MagicMock()
        fail_response.status_code = 500
        fail_response.json.return_value = {"error": "server"}
        fail_response.headers = {}
        mock_request.return_value = fail_response

        result3 = self.proxy.fetch_api("fake")
        self.assertEqual(result3, {})  # proxy returns {} on failure

    @patch("spotify_api.requests.request")
    def test_get_cache(self, mock_request):
        # Populate the cache and check its stored properly
        first_response = MagicMock()
        first_response.status_code = 200
        first_response.json.return_value = {"data": "fresh"}
        mock_request.return_value = first_response

        track1 = self.proxy.fetch_api("track1")

        second_response = MagicMock()
        second_response.status_code = 200
        second_response.json.return_value = {"data": "fresh"}
        mock_request.return_value = second_response

        track2 = self.proxy.fetch_api("track2")

        self.assertIn("https://api.spotify.com/v1/track1", self.proxy.get_cache())
        self.assertIn("https://api.spotify.com/v1/track2", self.proxy.get_cache())

        

if __name__ == '__main__':
    unittest.main()
