import requests

class SpotifyAPI:
    def __init__(self, client_id, access_token):
        self.client_id = client_id
        self.access_token = access_token   
        self.cache = {}


    def fetch_api(endpoint, access_token, method="GET", data=None, params=None):
        """
        Calls the Spotify Web API with OAuth access token.

        :param endpoint: Spotify API endpoint (e.g. "/v1/me" or "/v1/playlists/{id}")
        :param access_token: Valid Spotify OAuth token string
        :param method: HTTP method ("GET", "POST", "PUT", "DELETE")
        :param data: Dictionary for POST/PUT JSON body
        :param params: Dictionary for query parameters
        :return: Parsed JSON response
        """
        base_url = "https://api.spotify.com/v1"
        url = f"{base_url}/{endpoint}"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        try:
            isCached = self.cache.get(url)

            if isCached and "etag" in isCached: # check if url is already cached
                headers["If-None-Match"] = cached["etag"] # notify api that url is cached

            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                json=data,
                params=params
            )

            if response.status_code == 304: # url exists in cache
                print("Using cached data for:", url)
                return cached["data"]

            elif response.status_code not in range(200, 300): # request failed
                raise Exception(
                    f"Spotify API Error {response.status_code}: {response.text}"
                )
            
            else: # cache new url 
                etag = response.headers.get("ETag")
                self.cache[url] = {
                "etag": etag,
                "data": response.json(),
                "timestamp": time.time()
                }
                return self.cache[url]["data"]

        except Exception as e:
            print(f"API request failed with status code [{response.status_code}]: {e}")



    ACCESS_TOKEN = "<YOUR_SPOTIFY_ACCESS_TOKEN>"

    # Get your own profile data
    me = spotify_api_fetch("/v1/me", ACCESS_TOKEN)
    print("Logged in as:", me["display_name"])

    # Get a playlist by ID
    playlist_id = "37i9dQZF1DXcBWIGoYBM5M"  # e.g. Today's Top Hits
    playlist = spotify_api_fetch(f"/v1/playlists/{playlist_id}", ACCESS_TOKEN)
    print("Playlist name:", playlist["name"])

    # Search for an artist
    search_results = spotify_api_fetch(
        "/v1/search",
        ACCESS_TOKEN,
        params={"q": "Taylor Swift", "type": "artist"}
    )
    print("Found artist:", search_results["artists"]["items"][0]["name"])
