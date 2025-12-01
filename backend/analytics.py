import pandas as pd
from datetime import datetime, timedelta
import json
import requests
from itertools import chain
from spotify_api import SpotifyAPI, SpotifyAPIProxy
import asyncio
import httpx

class ProcessData:
    def __init__(self):
        pass

    def flatten_data(self, raw_data):
        """
        Convert raw Spotify JSON data into a Pandas DataFrame.
        """
        if not raw_data:
            return pd.DataFrame()  # Return empty DataFrame if no data

        df = pd.json_normalize(raw_data)
        return df


class UserAnalytics:
    def __init__(self, access_token: str):
        self.api = SpotifyAPI(access_token)
        self.proxy = SpotifyAPIProxy(self.api)
        self.process = ProcessData()
        pass

    # ---------------- HELPER FUNCTIONS -------------------
    async def getTopTracks(self, n=20):
        data = await self.proxy.fetch_api("me/top/tracks", params={"limit": n})
        tracks = data.get("items", [])
        df = self.process.flatten_data(tracks)
        return df.to_dict(orient='records')

    async def getTopArtists(self, n=20):
        data = await self.proxy.fetch_api("me/top/artists", params={"limit": n})
        artists = data.get("items", [])
        df = self.process.flatten_data(artists)
        return df.to_dict(orient='records')

    # ---------------- RECENTLY PLAYED (FIXED) ----------------
    async def getRecentlyPlayed(self, n=50):
        before = int(datetime.now().timestamp() * 1000)

        data = await self.proxy.fetch_api(
            "me/player/recently-played",
            params={"limit": n, "before": before},
        )

        plays = data.get("items", [])
        df = self.process.flatten_data(plays)
        df = df.where(pd.notnull(df), None)

        # Deep clean all nested NaN/NaT/Inf values
        def clean_json(obj):
            if isinstance(obj, dict):
                return {k: clean_json(v) for k, v in obj.items()}
            if isinstance(obj, list):
                return [clean_json(x) for x in obj]
            if pd.isna(obj):
                return None
            return obj

        records = df.to_dict(orient="records")
        cleaned = clean_json(records)
        return cleaned

    # ---------------- TOP GENRES ----------------
    async def getTopGenres(self, n=50):
        records = await self.getTopArtists(n=n)
        df = self.process.flatten_data(records)
        df = df.where(pd.notnull(df), None)

        df_exploded_genres = df['genres'].explode()

        cleaned = []
        for g in df_exploded_genres.tolist():
            cleaned.append({"genre": g if g is not None and not pd.isna(g) else None})

        return cleaned

    # ---------------- QUICKSTATS ----------------
    async def getQuickStats(self):
        artist_task = self.getTopArtists(n=2)
        track_task = self.getTopTracks(n=1)
        genre_task = self.getTopGenres(n=2)

        top_artist, top_track, top_genres = await asyncio.gather(
            artist_task, track_task, genre_task
        )

        top_genre = pd.DataFrame(top_genres)

        return [{
            'top_artist': top_artist[0]['name'] if top_artist else None,
            'top_track': top_track[0]['name'] if top_track else None,
            'top_genre': top_genre["genre"].value_counts().idxmax()
            if not top_genre.empty else None
        }]

    # ---------------- RECOMMENDATIONS (FULLY FIXED) ----------------
    async def getSongRecommendations(self, n=20):
        try:
            # ---- Get seeds ----
            top_tracks = await self.getTopTracks(n=5)
            top_artists = await self.getTopArtists(n=3)
            top_genres_raw = await self.getTopGenres(n=10)

            # Tracks
            seed_tracks = [
                track.get("id")
                for track in top_tracks
                if track.get("id")
            ]

            # Artists
            seed_artists = [
                artist.get("id")
                for artist in top_artists
                if artist.get("id")
            ]

            # Genres
            seed_genres = [
                g.get("genre")
                for g in top_genres_raw
                if g.get("genre") and isinstance(g.get("genre"), str)
            ]

            # ---- Prevent Spotify API error ----
            if not (seed_tracks or seed_artists or seed_genres):
                print("⚠️ No seeds found for recommendations.")
                return {"recommendations": []}

            # ---- Build params ----
            params = {
                "seed_tracks": ",".join(seed_tracks[:2]),
                "seed_artists": ",".join(seed_artists[:2]),
                "seed_genres": ",".join(seed_genres[:2]),
                "limit": n
            }

            # ---- Call Spotify API ----
            data = await self.proxy.fetch_api("recommendations", params=params)
            tracks = data.get("tracks", [])

            # ---- Clean DataFrame ----
            df = self.process.flatten_data(tracks)
            df = df.where(pd.notnull(df), None)
            cleaned = df.to_dict(orient='records')

            # ⭐⭐ MOST IMPORTANT: return JSON with key ⭐⭐
            return {"recommendations": cleaned}

        except Exception as e:
            print(f"❌ Error in recommendations: {e}")
            return {"recommendations": []}
