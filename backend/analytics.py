import pandas as pd
from datetime import datetime, timedelta
import asyncio

from spotify_api import SpotifyAPI, SpotifyAPIProxy


class ProcessData:
    def __init__(self):
        pass

    def flatten_data(self, raw_data):
        """Convert raw Spotify JSON into Pandas DataFrame."""
        if not raw_data:
            return pd.DataFrame()
        df = pd.json_normalize(raw_data)
        return df


class UserAnalytics:
    def __init__(self, access_token: str):
        self.api = SpotifyAPI(access_token)
        self.proxy = SpotifyAPIProxy(self.api)
        self.process = ProcessData()

    # ---------------------------------------------------
    # CLEAN JSON HELPER (removes NaN, NaT, Inf, nested)
    # ---------------------------------------------------
    def clean_json(self, obj):
        """Recursively clean NaN/NaT/Inf → None."""
        if isinstance(obj, dict):
            return {k: self.clean_json(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [self.clean_json(v) for v in obj]
        if pd.isna(obj):
            return None
        return obj

    # ---------------------------------------------------
    # TOP TRACKS
    # ---------------------------------------------------
    async def getTopTracks(self, n=20):
        data = await self.proxy.fetch_api(
            "me/top/tracks",
            params={"limit": n}
        )
        items = data.get("items", [])
        df = self.process.flatten_data(items)
        df = df.where(pd.notnull(df), None)
        return df.to_dict(orient="records")

    # ---------------------------------------------------
    # TOP ARTISTS
    # ---------------------------------------------------
    async def getTopArtists(self, n=20):
        data = await self.proxy.fetch_api(
            "me/top/artists",
            params={"limit": n}
        )
        items = data.get("items", [])
        df = self.process.flatten_data(items)
        df = df.where(pd.notnull(df), None)
        return df.to_dict(orient="records")

    # ---------------------------------------------------
    # RECENTLY PLAYED  (FULLY FIXED)
    # ---------------------------------------------------
    async def getRecentlyPlayed(self, n=50):
        before = int(datetime.now().timestamp() * 1000)

        data = await self.proxy.fetch_api(
            "me/player/recently-played",
            params={"limit": n, "before": before}
        )

        items = data.get("items", [])

        df = self.process.flatten_data(items)
        df = df.where(pd.notnull(df), None)

        cleaned = self.clean_json(df.to_dict(orient="records"))

        # FRONTEND EXPECTS:  { "recently_played": [...] }
        return {"recently_played": cleaned}

    # ---------------------------------------------------
    # TOP GENRES  (NaN SAFE)
    # ---------------------------------------------------
    async def getTopGenres(self, n=50):
        artist_records = await self.getTopArtists(n=n)
        df = self.process.flatten_data(artist_records)
        df = df.where(pd.notnull(df), None)

        if "genres" not in df.columns:
            return {"top_genres": []}

        exploded = df["genres"].explode()

        cleaned_list = []
        for g in exploded.tolist():
            cleaned_list.append({
                "genre": g if g is not None and not pd.isna(g) else None
            })

        return {"top_genres": cleaned_list}

    # ---------------------------------------------------
    # QUICKSTATS (CHART-READY)
    # ---------------------------------------------------
    async def getQuickStats(self):
        """
        Returns:
        {
            "quick_stats": [
                {
                    "top_artist": "...",
                    "top_track": "...",
                    "top_genre": "...",
                    "minutes_listened_by_day": [12, 30, 42, ...]
                }
            ]
        }
        """
        # Pull small amounts for speed
        artist_task = self.getTopArtists(n=1)
        track_task = self.getTopTracks(n=1)
        genre_task = self.getTopGenres(n=10)

        top_artists, top_tracks, genre_result = await asyncio.gather(
            artist_task, track_task, genre_task
        )

        # Extract genre mode
        genres_df = pd.DataFrame(genre_result["top_genres"])
        if not genres_df.empty:
            genres_df = genres_df.dropna()
        top_genre = None
        if not genres_df.empty:
            try:
                top_genre = genres_df["genre"].value_counts().idxmax()
            except Exception:
                top_genre = None

        # FAKE LISTEN MINUTES (placeholder)
        minutes = [12, 22, 34, 15, 55, 21, 33]

        return {
            "quick_stats": [
                {
                    "top_artist": top_artists[0]["name"] if top_artists else None,
                    "top_track": top_tracks[0]["name"] if top_tracks else None,
                    "top_genre": top_genre,
                    "minutes_listened_by_day": minutes
                }
            ]
        }

    # ---------------------------------------------------
    # SONG RECOMMENDATIONS  (FIXED)
    # ---------------------------------------------------
    async def getSongRecommendations(self, n=20):
        top_tracks = await self.getTopTracks(n=2)
        top_artists = await self.getTopArtists(n=1)

        genres_result = await self.getTopGenres(n=5)
        genres_list = [g["genre"] for g in genres_result["top_genres"] if g["genre"]]

        seed_tracks = [t["id"] for t in top_tracks if t.get("id")]
        seed_artists = [a["id"] for a in top_artists if a.get("id")]

        if not (seed_tracks or seed_artists or genres_list):
            return {"recommendations": []}

        params = {
            "seed_tracks": ",".join(seed_tracks),
            "seed_artists": ",".join(seed_artists),
            "seed_genres": ",".join(genres_list),
            "limit": n,
        }

        data = await self.proxy.fetch_api("recommendations", params=params)

        recs = data.get("tracks", [])
        df = self.process.flatten_data(recs)
        df = df.where(pd.notnull(df), None)

        cleaned = self.clean_json(df.to_dict(orient="records"))

        return {"recommendations": cleaned}



