// ---  Call backend helper ---
export async function callBackend() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const res = await fetch(`${backendUrl}/api/data`, { method: "GET" });

    if (!res.ok) {
      throw new Error(`Backend responded with status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Error calling backend:", err);
    return { error: err.message };
  }
}

// --- Send token to backend ---
export async function sendTokenToBackend(token) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const res = await fetch(`${backendUrl}/api/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: token }),
    });

    if (!res.ok) {
      throw new Error(`Backend responded with status ${res.status}`);
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
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/top-tracks`,
      {
        method: "POST", // backend expects POST
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

// ─────────────────────────────────────────
//   Composite Mood Classifier (Top 3 Moods)
// ─────────────────────────────────────────

const GENRE_TO_MOOD_MAP = [
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
  if (!genres || genres.length === 0) {
    return ["Unknown Mood"];
  }

  const lower = genres.map((g) => g.toLowerCase());
  const moodScores = {};

  for (const g of lower) {
    for (const entry of GENRE_TO_MOOD_MAP) {
      if (g.includes(entry.key)) {
        moodScores[entry.mood] = (moodScores[entry.mood] || 0) + 1;
      }
    }
  }

  if (Object.keys(moodScores).length === 0) {
    return ["🎧 Balanced Vibes"];
  }

  return Object.entries(moodScores)
    .sort((a, b) => b[1] - a[1])
    .map((pair) => pair[0])
    .slice(0, 3);
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


