// src/app/utils.js
// Utility functions for interacting with backend + Spotify API

// ------------- SEND TOKEN TO BACKEND -------------
export async function sendTokenToBackend(accessToken) {
  try {
    await fetch("https://trackrecord-fm.onrender.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
      credentials: "include",
    });
  } catch (error) {
    console.error("Error sending token to backend:", error);
  }
}

// ------------- FETCH TOP TRACKS -------------
export async function fetchTopTracks(accessToken) {
  try {
    const res = await fetch("https://trackrecord-fm.onrender.com/api/top-tracks", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include",
    });

    return await res.json();
  } catch (error) {
    console.error("Error fetching top tracks:", error);
    return null;
  }
}

// ------------- FETCH AUDIO FEATURES -------------
export async function fetchAudioFeatures(accessToken, trackIds) {
  try {
    const res = await fetch("https://trackrecord-fm.onrender.com/api/audio-features", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ track_ids: trackIds }),
      credentials: "include",
    });

    return await res.json();
  } catch (error) {
    console.error("Error fetching audio features:", error);
    return null;
  }
}

// ------------- FETCH DISCOVER WEEKLY (no longer using) -------------
export async function fetchDiscoverWeekly(accessToken) {
  try {
    const res = await fetch(
      "https://trackrecord-fm.onrender.com/api/discover-weekly",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    return await res.json();
  } catch (error) {
    console.error("Error fetching Discover Weekly:", error);
    return null;
  }
}
