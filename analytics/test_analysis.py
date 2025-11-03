import unittest
import pandas as pd
from analytics.analysis import MusicAnalytics


class TestMusicAnalytics(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.analyze = MusicAnalytics("analytics/mock_data.json")

    # CASE 1: are the minutes of type float?
    def test_minute_type(self):
        self.assertIsInstance(self.analyze.total_minutes(), float)

    # CASE 2: do the minutes for each song exist (they are greater than 0)?
    def test_minutes_exists(self):
        self.assertGreater(self.analyze.total_minutes(), 0)

    # CASE 3: top artist calculated properly?
    def test_top_artist(self):
        self.assertEqual(self.analyze.top_artist(), "The Weeknd")

    # CASE 4: bottom artist calculated properly?
    def test_bottom_artist(self):
        self.assertEqual(self.analyze.bottom_artist(), "Post Malone")

    # CASE 5: top genre calculated properly?
    def test_top_genre(self):
        self.assertEqual(self.analyze.top_genre(), "Pop")

    # CASE 6: bottom genre calculated properly?
    def test_bottom_genre(self):
        self.assertEqual(self.analyze.bottom_genre(), "Classical")

    # CASE 7: top day calculated properly?
    def test_top_day(self):
        self.assertEqual(self.analyze.top_day(), "Tuesday")

    # CASE 8: bottom day calculated properly?
    def test_bottom_day(self):
        self.assertEqual(self.analyze.bottom_day(), "Sunday")

    # CASE 9: test proper + dynamic calculation of minutes
    def test_total_minutes(self):
        total = self.analyze.df["minutes_listened"].astype(float).sum()
        self.assertAlmostEqual(self.analyze.total_minutes(), total, places=2)


if __name__ == "__main__":
    unittest.main()
