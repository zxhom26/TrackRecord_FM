// ---  Call backend helper ---
export async function callBackend() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    console.log("Backend URL:", backendUrl);

    const res = await fetch(`${backendUrl}/api/data`, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error(`Backend responded with status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Error calling backend:", err);
    return { error: err.message };
  }
}

// ---  Backend token sender ---
export async function sendTokenToBackend(token) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const res = await fetch(`${backendUrl}/api/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

// --- Fetching Top Tracks ---
export async function fetchTopTracks(token) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/spotify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify request failed: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error("fetchTopTracks error:", err);
    return { error: err.message };
  }
}

// --- Fetching Top Artists (for genre-based mood) ---
export async function fetchTopArtists(token) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/top-artists`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Top artists request failed: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("fetchTopArtists error:", err);
    return { error: err.message };
  }
}

// ─────────────────────────────────────────────
//   Composite Mood Classifier (Top 3 Moods)
// ─────────────────────────────────────────────

// 1️⃣ Base map: genre keyword → mood label
const GENRE_TO_MOOD_MAP = [
  { key: "rap", mood: "🔥 Bold & Confident" },
  { key: "hip hop", mood: "🔥 Bold & Confident" },
  { key: "trap", mood: "🔥 Bold & Confident" },

  { key: "pop", mood: "🎉 Upbeat & Fun" },

  { key: "r&b", mood: "💙 Smooth & Chill" },
  { key: "dark r&b", mood: "💙 Smooth & Chill" },
  { key: "trap soul", mood: "💙 Smooth & Chill" },

  { key: "indie", mood: "🌿 Mellow & Indie" },

  { key: "edm", mood: "⚡ High Energy" },
  { key: "dance", mood: "⚡ High Energy" },

  { key: "rock", mood: "🤘 Intense & Driven" },

  { key: "lofi", mood: "📚 Chill Study Vibes" },
  { key: "lo-fi", mood: "📚 Chill Study Vibes" },

  { key: "latin", mood: "💃 Vibrant & Rhythmic" },

  { key: "classical", mood: "🌙 Calm & Peaceful" },
];

// 2️⃣ Compute top moods from genres
export function getTopMoodsFromGenres(genres) {
  if (!genres || genres.length === 0) {
    return ["Unknown Mood"];
  }

  const lowerGenres = genres.map((g) => g.toLowerCase());
  const moodScores = {};

  // Assign mood points based on genre matches
  for (const g of lowerGenres) {
    for (const entry of GENRE_TO_MOOD_MAP) {
      if (g.includes(entry.key)) {
        moodScores[entry.mood] = (moodScores[entry.mood] || 0) + 1;
      }
    }
  }

  // If no moods matched
  if (Object.keys(moodScores).length === 0) {
    return ["🎧 Balanced Vibes"];
  }

  // Sort by frequency (descending)
  const sorted = Object.entries(moodScores)
    .sort((a, b) => b[1] - a[1]) // sort by score
    .map((pair) => pair[0]); // return mood labels only

  // Return the TOP 3 moods
  return sorted.slice(0, 3);
}
