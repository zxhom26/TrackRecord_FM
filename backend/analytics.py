import pandas as pd
from datetime import datetime, timedelta
import json
import requests
from itertools import chain
from spotify_api import SpotifyAPI, SpotifyAPIProxy

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
    
    # ---------------- TOP ITEMS ----------------
    # def getTopTracks(self, n=20):
    #     data = self.proxy.fetch_api("me/top/tracks", params={"limit": n})
    #     tracks = data.get("items", [])
    #     # Flatten tracks data into Spark DataFrame
    #     rdd = self.spark.parallelize([json.dumps(track) for track in tracks]) # Convert each track dict → JSON string
    #     df = spark.read.json(rdd)
    #     return [json.loads(row) for row in df.toJSON().collect()]

    # ---------------- HELPER FUNCTIONS -------------------
    def getTopTracks(self, n=20):
        data = self.proxy.fetch_api("me/top/tracks", params={"limit": n})
        tracks = data.get("items", [])
        df = self.process.flatten_data(tracks)
        return df.to_dict(orient='records')

    def getTopArtists(self, n=20):
        data = self.proxy.fetch_api("me/top/artists", params={"limit": n})
        artists = data.get("items", [])
        df = self.process.flatten_data(artists)
        return df.to_dict(orient='records')
    
    def getRecentlyPlayed(self, n=50):
        data = self.proxy.fetch_api("me/player/recently-played", params={"limit": n})
        plays = data.get("items", [])
        df = self.process.flatten_data(plays)
        return df.to_dict(orient='records') # RETURNING TUPLE HERE -------
        # [{day: '2025-11-20', minutes_listened: 34.5}, ...]
    
    # ---------------- DIRECT TO FRONTEND ----------------
    def getTopGenres(self, n=50):
        '''
        Returns a dict of top genres according to user's top artists.
        Does not remove duplicates to enable genre stats.
        '''
        records = self.getTopArtists(n=n)
        df = self.process.flatten_data(records)
        df_exploded_genres = df['genres'].explode()
        return [{"genre": g} for g in df_exploded_genres.tolist()]

    def getQuickStats(self):
        top_artist = self.getTopArtists(n=1) 
        top_track = self.getTopTracks(n=1)
        top_genre = pd.DataFrame(self.getTopGenres())
        return [{'top_artist': top_artist[0]['name'] if top_artist else None, 
                'top_track': top_track[0]['name'] if top_track else None, 
                'top_genre': top_genre["genre"].value_counts().idxmax() if not top_genre.empty else None}]
    
    def getSongRecommendations(self, n=20):
        # Max 5 seeds allowed in any comination of tracks, artists, genres
        top_tracks = self.getTopTracks(n=2)
        top_artists = self.getTopArtists(n=1)
        top_genres = pd.DataFrame(self.getTopGenres(n=2))

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
            data = self.proxy.fetch_api("recommendations", params=params)
            recommendations = data.get("tracks", [])
            df = self.process.flatten_data(recommendations)
            return df.to_dict(orient='records')

        except Exception as e:
            print(f"No seeds found. Error getting track, artist, and genre ids: {e}")
            return []

# ---------- Run standalone ----------
if __name__ == "__main__":
    analytics = MusicAnalytics()
    analytics.print_summary()





# def getMinutesListened(self, n=50, interval='day', aggBy=None):
#     # timestamps in milliseconds
#     before = int(datetime.now().timestamp() * 1000)
#     match interval:
#         case 'day':
#             after = int((datetime.now() - timedelta(days=1)).timestamp() * 1000)
#         case 'week':
#             after = int((datetime.now() - timedelta(days=7)).timestamp() * 1000)
#         case 'month':
#             after = int((datetime.now() - timedelta(days=30)).timestamp() * 1000)
#         case _: # default to day if invalid
#             after = int((datetime.now() - timedelta(days=1)).timestamp() * 1000)

#     more_data = True
#     all_items = []
#     # Breaking up week call into chunks to handle item limits
#     while more_data:
#         # Fetch data
#         data, records = self.getRecentlyPlayed(n=n, after=after, before=before)
#         all_items.append(records) # list of lists
#         more_data = data.get("next")
    
#     if len(all_items) <= 0 or aggBy is None:
#         print("No aggBy column selected, you must specify how to group records for minute aggregation OR failed api call.")
#         return []
#     else:
#         # Combine all dictionary records into single DataFrame
#         df_all = list(chain.from_iterable(all_items)) # flatten list of lists
#         df_all = pd.DataFrame(df_all)

#         # Calculate minutes listened by day of the week
#         df_all['hour'] = pd.to_datetime(df_all['played_at']).dt.hour # "played_at": "2025-11-26T22:00:45.165Z"
#         df_all['day'] = pd.to_datetime(df_all['played_at']).dt.date # "played_at": "2025-11-26T22:00:45.165Z"
#         df_all['minutes_listened'] = (df_all['track.duration_ms'] / 60000).round(2)

#         if aggBy == 'artist':
#             df_all[aggBy] = df_all['track.' + aggBy]
#             df_final = df_all.groupby(aggBy).agg({'minutes_listened': 'sum'}).reset_index()
#         elif aggBy == 'day':
#             df_final = df_all.groupby('hour').agg({'minutes_listened': 'sum'}).reset_index()
#         else: # week and month default to day
#             df_final = df_all.groupby('day').agg({'minutes_listened': 'sum'}).reset_index()

#         return df_final.to_dict(orient='records')
#         # ex. aggBy == day:[{day: '2025-11-20', minutes_listened: 42.0}, ...]
#         # ex. aggBy == artist:[{artist: 'Doechii', minutes_listened: 69.0}, ...]