import unittest
from unittest.mock import AsyncMock
from datetime import datetime
import pandas as pd

from analytics import UserAnalytics, ProcessData


# ----------------------------------------------------
#      Mock Objects
# ----------------------------------------------------
class MockSpotifyAPIProxy:
    """Mock proxy that returns dict data exactly as UserAnalytics expects."""
    def __init__(self, responses=None):
        # responses: dict of {endpoint: dict_data}
        self.responses = responses or {}

    async def fetch_api(self, endpoint, params=None):
        # Return the raw dict
        return self.responses.get(endpoint, {"items": []})


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

        # Sample Spotify response for top artists
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

        # Sample responses for all endpoints needed
        self.ua.proxy = MockSpotifyAPIProxy({
            "me/top/artists": self.sample_top_artists,
            "me/top/tracks": {"items": [{"id": "track1", "name": "Song1"}]},
            "me/player/recently-played": {"items": [{"track": {"id": "track1"}, "played_at": "2024-01-01T00:00:00Z"}]},
            "recommendations": {"tracks": [{"id": "rec1", "name": "Recommended Song"}]}
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
        self.assertEqual(result[0]["name"], "Song1")

    # ----------------------------------------------------
    #   Recently Played
    # ----------------------------------------------------
    async def test_get_recently_played(self):
        result = await self.ua.getRecentlyPlayed(n=1)
        self.assertEqual(len(result), 1)
        self.assertIn("track.id", result[0] or result[0].get("track"))

    # ----------------------------------------------------
    #   Top Genres
    # ----------------------------------------------------
    async def test_get_top_genres(self):
        result = await self.ua.getTopGenres(n=2)
        genres = [g["genre"] for g in result]
        self.assertIn("dream pop", genres)
        self.assertIn("shoegaze", genres)

    # ----------------------------------------------------
    #   Quick Stats
    # ----------------------------------------------------
    async def test_get_quick_stats(self):
        result = await self.ua.getQuickStats()
        stats = result[0]
        self.assertEqual(stats["top_artist"], "Tyler, The Creator")
        self.assertEqual(stats["top_track"], "Song1")
        self.assertIsNotNone(stats["top_genre"])

    # ----------------------------------------------------
    #   Song Recommendations
    # ----------------------------------------------------
    async def test_get_song_recommendations(self):
        result = await self.ua.getSongRecommendations(n=1)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "rec1")


if __name__ == "__main__":
    unittest.main()
