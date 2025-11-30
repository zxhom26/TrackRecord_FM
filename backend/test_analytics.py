import unittest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
import pandas as pd

from user_analytics import UserAnalytics, ProcessData
from spotify_api import SpotifyAPI, SpotifyAPIProxy


# ----------------------------------------------------
#      Mock Objects
# ----------------------------------------------------
class MockSpotifyAPI(SpotifyAPI):
    """Fake SpotifyAPI that never calls the real API."""
    def __init__(self, token="TEST_TOKEN"):
        self.access_token = token
        self.fetch_api = AsyncMock()


class MockSpotifyAPIProxy(SpotifyAPIProxy):
    """Proxy that bypasses the real HTTP layer."""
    def __init__(self):
        self.api = MockSpotifyAPI()
        self.cache = {}
        self.base_url = "https://api.spotify.com/v1"


# ----------------------------------------------------
#      Test: ProcessData
# ----------------------------------------------------
class TestProcessData(unittest.TestCase):

    def setUp(self):
        self.process = ProcessData()

    def test_flatten_empty(self):
        df = self.process.flatten_data([])
        self.assertTrue(df.empty)

    def test_flatten_valid(self):
        raw = [
            {"name": "Tyler", "followers.total": 999, "genres": []}
        ]
        df = self.process.flatten_data(raw)
        self.assertIn("name", df.columns)
        self.assertEqual(df.iloc[0]["name"], "Tyler")


# ----------------------------------------------------
#      Test: UserAnalytics
# ----------------------------------------------------
class TestUserAnalytics(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        """Create a UserAnalytics instance using a mocked proxy."""
        self.ua = UserAnalytics("TEST_TOKEN")

        # Replace real proxy with mocked proxy
        self.ua.proxy = MockSpotifyAPIProxy()
        self.mock_api = self.ua.proxy.api

        # Example Spotify response for top artists
        self.sample_top_artists = {
            "items": [
                {
                    "id": "4V8LLVI7PbaPR0K2TGSxFF",
                    "name": "Tyler, The Creator",
                    "genres": [],
                    "followers": {"total": 24739335},
                    "popularity": 87
                },
                {
                    "id": "5Wabl1lPdNOeIn0SQ5A1mp",
                    "name": "Cocteau Twins",
                    "genres": ["dream pop", "shoegaze"],
                    "followers": {"total": 1403390},
                    "popularity": 67
                }
            ]
        }

    # ----------------------------------------------------
    #   Top Artists
    # ----------------------------------------------------
    async def test_get_top_artists(self):
        self.mock_api.fetch_api.return_value = self.sample_top_artists

        result = await self.ua.getTopArtists(n=2)

        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["name"], "Tyler, The Creator")

    # ----------------------------------------------------
    #   Top Tracks
    # ----------------------------------------------------
    async def test_get_top_tracks(self):
        mock_tracks = {
            "items": [
                {"id": "track123", "name": "Some Song", "popularity": 55}
            ]
        }

        self.mock_api.fetch_api.return_value = mock_tracks
        result = await self.ua.getTopTracks(n=1)

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "track123")

    # ----------------------------------------------------
    #   Recently Played
    # ----------------------------------------------------
    async def test_get_recently_played(self):
        mock_recent = {
            "items": [
                {"track.id": "abc", "played_at": "2024-05-20T10:00:00Z"}
            ]
        }
        self.mock_api.fetch_api.return_value = mock_recent

        result = await self.ua.getRecentlyPlayed(n=1)
        self.assertEqual(len(result), 1)

    # ----------------------------------------------------
    #   Top Genres
    # ----------------------------------------------------
    async def test_get_top_genres(self):
        self.mock_api.fetch_api.return_value = self.sample_top_artists

        result = await self.ua.getTopGenres(n=2)

        genres = [g["genre"] for g in result]

        # explosion of ["dream pop", "shoegaze"]
        self.assertIn("dream pop", genres)
        self.assertIn("shoegaze", genres)

    # ----------------------------------------------------
    #   Quick Stats
    # ----------------------------------------------------
    async def test_get_quick_stats(self):
        # top artists
        self.mock_api.fetch_api.side_effect = [
            self.sample_top_artists,   # artists
            {"items": [{"name": "Song1", "id": "t1"}]},  # tracks
            self.sample_top_artists    # genres
        ]

        result = await self.ua.getQuickStats()
        result = result[0]

        self.assertEqual(result["top_artist"], "Tyler, The Creator") 
        self.assertEqual(result["top_track"], "Song1")
        self.assertIsNotNone(result["top_genre"])

    # ----------------------------------------------------
    #   Song Recommendations
    # ----------------------------------------------------
    async def test_get_song_recommendations(self):

        # 1. getTopTracks(2)
        # 2. getTopArtists(1)
        # 3. getTopGenres(2)
        # 4. recommendations endpoint
        self.mock_api.fetch_api.side_effect = [
            {"items": [{"id": "t1"}, {"id": "t2"}]},  # top tracks
            self.sample_top_artists,                  # top artists 
            self.sample_top_artists,                  # genres → extracted
            {"tracks": [{"id": "rec1", "name": "Recommended Song"}]} # recs
        ]

        result = await self.ua.getSongRecommendations(n=1)

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "rec1")


if __name__ == "__main__":
    unittest.main()
