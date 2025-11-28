// --- 11. Call backend helper ---
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

// --- 12. Backend token sender ---
export async function sendTokenToBackend(token) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const res = await fetch(`${backendUrl}/api/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: token }),
      credentials: "include",
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

// --- 13. Fetch Top Tracks (calls /api/spotify) ---
export async function fetchTopTracks(token) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/spotify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token }),
        credentials: "include",
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

// --- 14. Fetch Audio Features ---
export async function fetchAudioFeatures(token, trackIds) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/audio-features`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          track_ids: trackIds,
        }),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`Audio features request failed: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("fetchAudioFeatures error:", err);
    return { error: err.message };
  }
}

// --- 15. Fetch Discover Weekly (no longer needed) ---
export async function fetchDiscoverWeekly(token) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/discover-weekly`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token }),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`Discover Weekly request failed: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("fetchDiscoverWeekly error:", err);
    return { error: err.message };
  }
}
