from backend.spotify_api import APIInterface

class SpotifyDataFetcher:
    def __init__(self, api: APIInterface):
        self.api = api  # This can be SpotifyAPI or SpotifyAPIProxy

    def get_recently_played(self, limit=50):
        endpoint = f"me/player/recently-played?limit={limit}"
        return self.api.fetch_api(endpoint)

    def get_top_tracks(self, limit=50):
        endpoint = f"me/top/tracks?limit={limit}"
        return self.api.fetch_api(endpoint)

    def get_top_artists(self, limit=50):
        endpoint = f"me/top/artists?limit={limit}"
        return self.api.fetch_api(endpoint)
