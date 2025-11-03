import pytest
from analytics.analysis import MusicAnalytics
import pandas as pd

analyze = MusicAnalytics("analytics/mock_data.json")

## CASE 1: are the minutes of type float?
def test_minute_type():
  assert isinstance(analyze.total_minutes(), float)

## CASE 2: do the minutes for each song exist (they are greater than 0)?
def test_minutes_exists():
  assert analyze.total_minutes() > 0

## CASE 3: top artist calculated properly?
def test_top_artist():
  assert analyze.top_artist() == "The Weeknd"

## CASE 4: bottom artist calculated properly?
def test_bottom_artist():
  assert analyze.bottom_artist() == "Post Malone"

## CASE 5: top genre calculated properly?
def test_top_genre():
  assert analyze.top_genre() == "Pop"

## CASE 6: bottom genre calculated properly?
def test_bottom_genre():
  assert analyze.bottom_genre() == "Classical"

## CASE 7: top day calculated properly?
def test_top_day():
  assert analyze.top_day() == "Tuesday"

## CASE 8: bottom day calculated properly?
def test_bottom_day():
  assert analyze.bottom_day() == "Sunday"

## CASE 9: test proper + dynamic calculation of minutes
def test_total_minutes():
  total = analyze.df["minutes_listened"].astype(float).sum()
  assert abs(analyze.total_minutes() - total) < 0.01


