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
            return pd.DataFrame() # Return empty DataFrame if no data

        # Normalize nested JSON into flat table of records [{}, {}, ...]
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
    
    async def getRecentlyPlayed(self, n=50):
        # timestamps in milliseconds
        before = int(datetime.now().timestamp() * 1000)

        data = await self.proxy.fetch_api("me/player/recently-played", params={"limit": n, 'before': before})
        plays = data.get("items", [])
        df = self.process.flatten_data(plays)
        
        return df.to_dict(orient='records') 
    
    # ---------------- DIRECT TO FRONTEND ----------------
    async def getTopGenres(self, n=50):
        '''
        Returns a dict of top genres according to user's top artists.
        Does not remove duplicates to enable genre stats.
        '''
        records = await self.getTopArtists(n=n)
        df = self.process.flatten_data(records)
        df_exploded_genres = df['genres'].explode()
        return [{"genre": g} for g in df_exploded_genres.tolist()]

    async def getQuickStats(self):
        artist_task = self.getTopArtists(n=2) 
        track_task = self.getTopTracks(n=1)
        genre_task = self.getTopGenres(n=2)

        top_artist, top_track, top_genres = await asyncio.gather(artist_task, 
                                                                track_task, 
                                                                genre_task)
        top_genre = pd.DataFrame(top_genres)

        return [{'top_artist': top_artist[0]['name'] if top_artist else None, 
                'top_track': top_track[0]['name'] if top_track else None, 
                'top_genre': top_genre["genre"].value_counts().idxmax() if not top_genre.empty else None}]
    
    async def getSongRecommendations(self, n=20):
        # Max 5 seeds allowed in any comination of tracks, artists, genres
        top_tracks = await self.getTopTracks(n=2)
        top_artists = await self.getTopArtists(n=1)
        top_genres = pd.DataFrame(await self.getTopGenres(n=2))

        seed_tracks = [track['id'] for track in top_tracks]
        seed_artists = [artist['id'] for artist in top_artists]
        seed_genres = top_genres["genre"].unique().tolist()

        try:
            if not (seed_tracks or seed_artists or seed_genres):
                raise ValueError("At least one seed required for recommendations")

            params = {
                "seed_tracks": ",".join(seed_tracks),
                "seed_artists": ",".join(seed_artists),
                "seed_genres": ",".join(seed_genres),
                "limit": n
            }
            data = await self.proxy.fetch_api("recommendations", params=params)
            recommendations = data.get("tracks", [])
            df = self.process.flatten_data(recommendations)
            return df.to_dict(orient='records')

        except Exception as e:
            print(f"No seeds found. Error getting track, artist, and genre ids: {e}")
            return []





