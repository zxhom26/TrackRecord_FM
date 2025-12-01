
/* ------------------ API HELPERS ------------------ */
// ---  Call backend helper ---
export async function callBackend() { // exported async function to check connectivity with backend
  try { // error handling block
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL; //read the backend URL from env variables

    const res = await fetch(`${backendUrl}/api/data`, { method: "GET" }); // fetches (GETs) data from a backend endpoint

    if (!res.ok) { // backend will send an ok response if status is good (ex. 200), if the response is not okay then...
      throw new Error(`Backend responded with status ${res.status}`); // Throw error with message + code
    }

    return await res.json(); // backend sends a .json
  } catch (err) {
    console.error("Error calling backend:", err); // log any errors 
    return { error: err.message };
  }
}

// --- Send token to backend ---
export async function sendTokenToBackend(token) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL; // build backend URL

    const res = await fetch(`${backendUrl}/api/token`, { // sets a constant variable called 'res'. 'res' will be assigned to the response of fetch POST. await will wait until it is received
      method: "POST", // tells the backend we are sending (POST) a json (the OAuth token)
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: token }), // body ex. {accessToken: abcxyz123}
    });

    if (!res.ok) {
      throw new Error(`Backend responded with status ${res.status}`); // throw error if bad status
    }

    return await res.json();
  } catch (err) {
    console.error("Error sending token to backend:", err);
    return { error: err.message };
  }
}

// --- Fetch Top Tracks ---
export async function fetchTopTracks(token) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/top-tracks`, // similar to above, waiting for a response from top-tracks endpoint
      {
        method: "POST", // backend expects POST of access token -- CODE SMELL (could just call sendTokenToBackend here)
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "accessToken": token }),
      }
    );

    if (!response.ok) {
      throw new Error(`Top tracks request failed: ${response.status}`);
    }

    return await response.json(); // { top_tracks: [...] }
  } catch (err) {
    console.error("fetchTopTracks error:", err);
    return { error: err.message };
  }
}

// --- Fetch Top Artists (NEW RESPONSE SHAPE) ---
export async function fetchTopArtists(token) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/top-artists`,
      {
        method: "POST", // backend uses POST
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "accessToken": token })
      }
    );

    if (!response.ok) {
      throw new Error(`Top artists request failed: ${response.status}`);
    }

    return await response.json(); // { top_artists: [...] }
  } catch (err) {
    console.error("fetchTopArtists error:", err);
    return { error: err.message };
  }
}

// --- Fetch Recently Played (matches getRecentlyPlayed in backend) ---
export async function fetchRecentlyPlayed(token) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recently-played`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token }),
      }
    );

    if (!response.ok) {
      throw new Error(`Recently played failed: ${response.status}`);
    }

    return await response.json(); // { recently_played: [...] }
  } catch (err) {
    console.error("fetchRecentlyPlayed error:", err);
    return { error: err.message };
  }
}

// --- Fetch Top Genres ---
export async function fetchTopGenres(token) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/top-genres`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token }),
      }
    );

    if (!response.ok) {
      throw new Error(`Top genres failed: ${response.status}`);
    }

    return await response.json(); // { top_genres: [...] }
  } catch (err) {
    console.error("fetchTopGenres error:", err);
    return { error: err.message };
  }
}

// --- Fetch Recommendations ---
export async function fetchRecommendations(token) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recommendations`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token }),
      }
    );

    if (!response.ok) {
      throw new Error(`Recommendations failed: ${response.status}`);
    }

    return await response.json(); // { recommendations: [...] }
  } catch (err) {
    console.error("fetchRecommendations error:", err);
    return { error: err.message };
  }
}

// ─────────────────────────────────────────
//   Composite Mood Classifier (Top 3 Moods)
// ─────────────────────────────────────────

const GENRE_TO_MOOD_MAP = [
  // static array lookup table - assigning genres to moods -- includes fragments as well
  { key: "rap", mood: "Bold & Confident" },
  { key: "hip hop", mood: "Bold & Confident" },
  { key: "trap", mood: "Bold & Confident" },

  { key: "pop", mood: "Upbeat & Fun" },

  { key: "r&b", mood: "Smooth & Chill" },
  { key: "dark r&b", mood: "Smooth & Chill" },
  { key: "trap soul", mood: "Smooth & Chill" },

  { key: "indie", mood: "Mellow & Indie" },

  { key: "edm", mood: "High Energy" },
  { key: "dance", mood: "High Energy" },

  { key: "rock", mood: "Intense & Driven" },

  { key: "lofi", mood: "Chill Study Vibes" },
  { key: "lo-fi", mood: "Chill Study Vibes" },

  { key: "latin", mood: "Vibrant & Rhythmic" },

  { key: "classical", mood: "Calm & Peaceful" },
];

export function getTopMoodsFromGenres(genres) {
  if (!genres || genres.length === 0) { // if not genres OR no genres come up
    return ["Unknown Mood"]; // then unknown mood
  }

  const lower = genres.map((g) => g.toLowerCase()); // convert all genres to lowercase
  const moodScores = {}; // creates mood object literals

  for (const g of lower) { // loops through the lowercase genres
    for (const entry of GENRE_TO_MOOD_MAP) { // compare the given entry against the array of genre/moods
      if (g.includes(entry.key)) { // if the key (genre) is includes
        moodScores[entry.mood] = (moodScores[entry.mood] || 0) + 1; // add to the mood score
      }
    }
  }

  if (Object.keys(moodScores).length === 0) {
    return ["🎧 Balanced Vibes"]; // if the genre is not recognized then we will return 'Balanced Vibes'
  }
  
  // fallback if no genre found
  return Object.entries(moodScores)
    .sort((a, b) => b[1] - a[1])
    .map((pair) => pair[0])
    .slice(0, 3); // slicing to the top 3
}

// --- Fetch QuickStats ---
export async function getQuickStats(token) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quick-stats`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token }),
      }
    );

    if (!response.ok) {
      throw new Error(`QuickStats failed: ${response.status}`);
    }

    const json = await response.json();

    // The backend returns quick_stats as a list with ONE object:
    // { quick_stats: [ { top_artist, top_track, top_genre } ] }
    const arr = json.quick_stats;

    if (!arr || !Array.isArray(arr) || arr.length === 0) {
      return {
        topTrack: "N/A",
        topArtist: "N/A",
        topGenre: "N/A",
      };
    }

    const stats = arr[0]; // extract the first object

    return {
      topTrack: stats.top_track || "N/A",
      topArtist: stats.top_artist || "N/A",
      topGenre: stats.top_genre || "N/A",
    };
  } catch (err) {
    console.error("QuickStats error:", err);
    return {
      topTrack: "N/A",
      topArtist: "N/A",
      topGenre: "N/A",
    };
  }
}


