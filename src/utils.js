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

    return await res.json(); // e.g., { message: "token stored successfully" }
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
          token: token  
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

    return await response.json(); // { spotify_data: { items: [...] } }

  } catch (err) {
    console.error("fetchTopArtists error:", err);
    return { error: err.message };
  }
}

// --- MOOD MAPPING ---
// --- Mood Mapping by Genre ---
export function getMoodFromGenres(genres) {
  if (!genres || genres.length === 0) return "Unknown Mood";

  // Normalize genres
  const g = genres.map((s) => s.toLowerCase());

  if (g.some((x) => x.includes("rap") || x.includes("hip hop"))) {
    return "🔥 Bold & Confident";
  }
  if (g.some((x) => x.includes("pop"))) {
    return "🎉 Upbeat & Fun";
  }
  if (g.some((x) => x.includes("edm") || x.includes("dance"))) {
    return "⚡ High Energy";
  }
  if (g.some((x) => x.includes("r&b"))) {
    return "💙 Smooth & Chill";
  }
  if (g.some((x) => x.includes("indie"))) {
    return "🌿 Mellow & Indie";
  }
  if (g.some((x) => x.includes("rock"))) {
    return "🤘 Intense & Driven";
  }
  if (g.some((x) => x.includes("lofi") || x.includes("lo-fi"))) {
    return "📚 Chill Study Vibes";
  }
  if (g.some((x) => x.includes("latin"))) {
    return "💃 Vibrant & Rhythmic";
  }
  if (g.some((x) => x.includes("classical"))) {
    return "🌙 Calm & Peaceful";

  return "🎧 Balanced Vibes";
}

