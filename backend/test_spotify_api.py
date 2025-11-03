import unittest
from unittest.mock import patch, MagicMock
import time
import requests
from spotify_api import SpotifyAPI, SpotifyAPIProxy


class TestSpotifyAPI(unittest.TestCase):
    def setUp(self):
        self.api = SpotifyAPI()

    @patch('spotify_api.requests.requests')
    def test_fetch_api(self, mock_get):
        # mock get is what patches the real get
        mock_response = MagicMock() # magic mock creates a fake object
        mock_response.json.return_value = {'music': {'track1', 'track2'}}
        mock_response.raise_for_status = MagicMock()
        mock_get = mock_response # attaches mock object to the patch

        # Check standard call
        response = self.api.fetch_api('fake_url', 'fake_header')
        self.assertEqual(response, {'music': {'track1', 'track2'}})

        # Check status code catching for HTTP errors
        mock_response.raise_for_status.side_effect = requests.HTTPError("401 Unauthorized")
        with self.assertRaises(requests.HTTPError):
            self.api.fetch_api('fake_url', 'fake_header')

class TestSpotifyAPIProxy(unittest.TestCase):
    def setUp(self):
        self.api = SpotifyAPI()
        self.proxy = SpotifyAPIProxy(self.api, 'fake_token')
    
    @patch('spotify_api.requests.requests')
    def test_fetch_api(self, mock_get):
        # mock get is what patches the real get
        mock_response = MagicMock() # magic mock creates a fake object
        mock_response.json.return_value = {'music': {'track1', 'track2'}}
        mock_response.raise_for_status = MagicMock()
        mock_get = mock_response # attaches mock object to the patch

        reponse = self.proxy.fetch_api('fake_endpoint')
        self.assertEqual(response, {'music': {'track1', 'track2'}})

        response = self.proxy.fetch_api('fake_endpoint')

if __name__ == '__main__':
    unittest.main()
