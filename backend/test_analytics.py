import unittest
from unittest.mock import AsyncMock, MagicMock
import pandas as pd

from analytics import UserAnalytics, ProcessData
from spotify_api import SpotifyAPI, SpotifyAPIProxy


# ----------------------------------------------------
#      Mock Objects
# ----------------------------------------------------
class MockSpotifyAPI(SpotifyAPI):
    """Fake SpotifyAPI that never calls the real API."""
    def __init__(self, token="TEST_TOKEN"):
        self.access_token = token
        self.fetch_api = AsyncMock()


class MockSpotifyAPIProxy:
    """Mock proxy that returns predefined responses for endpoints."""
    def __init__(self, responses):
        self.responses = responses  # dict: {endpoint: data}

    async def fetch_api(self, endpoint, params=None):
        data = self.responses.get(endpoint, {"items": []})
        return data


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
            {"name": "Tyler", "followers.total": 999, "genres": ["hip hop"]}
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

        # Sample Spotify responses
        self.sample_top_artists = {
            "items": [
                {
                    "id": "4V8LLVI7PbaPR0K2TGSxFF",
                    "name": "Tyler, The Creator",
                    "genres": ["hip hop"],
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

        self.sample_top_tracks = {
            "items": [
                {"id": "track1", "name": "Song1"},
                {"id": "track2", "name": "Song2"}
            ]
        }

        self.sample_recently_played = {
            "items": [
                {"track": {"id": "track_recent", "name": "Recent Song"}, "played_at": "2024-05-20T10:00:00Z"}
            ]
        }

        self.sample_recommendations = {
            "tracks": [
                {"id": "rec1", "name": "Recommended Song"}
            ]
        }

        # Mock proxy with predefined responses
        self.ua.proxy = MockSpotifyAPIProxy({
            "me/top/artists": self.sample_top_artists,
            "me/top/tracks": self.sample_top_tracks,
            "me/player/recently-played": self.sample_recently_played,
            "recommendations": self.sample_recommendations
        })

    # ----------------------------------------------------
    #   Top Artists
    # ----------------------------------------------------
    async def test_get_top_artists(self):
        result = await self.ua.getTopArtists(n=2)
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["name"], "Tyler, The Creator")

    # ----------------------------------------------------
    #   Top Tracks
    # ----------------------------------------------------
    async def test_get_top_tracks(self):
        result = await self.ua.getTopTracks(n=1)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "track1")

    # ----------------------------------------------------
    #   Recently Played
    # ----------------------------------------------------
    async def test_get_recently_played(self):
        result = await self.ua.getRecentlyPlayed(n=1)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["track.id"], "track_recent")

    # ----------------------------------------------------
    #   Top Genres
    # ----------------------------------------------------
    async def test_get_top_genres(self):
        result = await self.ua.getTopGenres(n=2)
        genres = [g["genre"] for g in result]
        self.assertIn("hip hop", genres)
        self.assertIn("dream pop", genres)
        self.assertIn("shoegaze", genres)

    # ----------------------------------------------------
    #   Quick Stats
    # ----------------------------------------------------
    async def test_get_quick_stats(self):
        result = await self.ua.getQuickStats()
        self.assertEqual(result[0]["top_artist"], "Tyler, The Creator")
        self.assertEqual(result[0]["top_track"], "Song1")
        self.assertIsNotNone(result[0]["top_genre"])

    # ----------------------------------------------------
    #   Song Recommendations
    # ----------------------------------------------------
    async def test_get_song_recommendations(self):
        result = await self.ua.getSongRecommendations(n=1)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "rec1")


if __name__ == "__main__":
    unittest.main()
