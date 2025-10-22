

"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // token stuff 


export default function Home() {
  const { data: session } = useSession(); // Spotify session

  // Local states
  const [mood, setMood] = useState("");
  const [post, setPost] = useState("");
  const [feed, setFeed] = useState<string[]>([]);

  const [data, setData] = useState(""); // new useState to set up backend call -- FastAPI backend message
  const [spotifyInfo, setSpotifyInfo] = useState<any>(null); // Spotify API Response

  // useEffect will fetch FastAPI backend 
  useEffect(() => {
    fetch("https://track-record-fm-test.vercel.app/api/data") // "api/data" is a filler for now
    .then((res) => res.json())
    .then((json) => setData(json.message))
    //.then((err) => console.error("Error fetching backend data:", err))
  }, []);

  // Send Spotify token to backend to call Spotify API
  useEffect(() => {
    if (session?.accessToken){
      fetch("https://track-record-fm-test.vercel.app/api/spotify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: session.accessToken }),
})
      .then((res) => res.json())
      .then((json) => setSpotifyInfo(json))
      .catch((err) => console.error("Error calling backend Spotify route:", err));

    }
  }, [session]);


  const handleMoodSave = () => {
    alert(`Mood saved: ${mood || "neutral"}`);
  };

  const handlePost = () => {
    if (post.trim() !== "") {
      setFeed((prevFeed) => [...prevFeed, post]);
      setPost("");
    }
  };

  return (
    <main
      style={{
        padding: "2rem",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#e8defa,#d0bcf5)",
        fontFamily: "'Inter', sans-serif",
        color: "#2b225a",
      }}
    >
      <h1 style={{ marginBottom: "2rem", fontSize: "2rem", fontWeight: 700 }}>
        🎧 TrackRecord FM Dashboard
      </h1>

      {/* Backend message from FastAPI to check if data fetching is  */}
      <p style={{ color: "#7b72a3", marginBottom: "2rem", fontWeight: 500}}>
        {data ? data: "Loading backend data..."}
      </p>

      {/* Spotify API response */}
{spotifyInfo && (
  <section
    style={{
      background: "linear-gradient(135deg,#f0f0f0,#dcdcdc)",
      borderRadius: "15px",
      padding: "1rem",
      marginBottom: "2rem",
      width: "90%",
      maxWidth: "1200px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      fontFamily: "monospace",
      overflowX: "auto",
    }}
  >
    <h3>🎵 Spotify API Response</h3>
    <pre>{JSON.stringify(spotifyInfo, null, 2)}</pre>
  </section>
)}


      {/* ===== Dashboard Grid ===== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          width: "90%",
          maxWidth: "1200px",
        }}
      >
        {/* 🎶 Music Diary */}
        <section
          style={{
            background: "linear-gradient(135deg,#f0e8ff,#d7caff)",
            borderRadius: "20px",
            boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
            padding: "1.5rem",
          }}
        >
          <h3>🎶 Music Diary</h3>
          <input
            type="text"
            placeholder="How are you feeling?"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #b6a9d9",
              outline: "none",
            }}
          />
          <button
            onClick={handleMoodSave}
            style={{
              marginTop: "1rem",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#6a56c2",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            💾 Save Mood
          </button>
        </section>

        {/* 📊 Analytics Overview */}
        <section
          style={{
            background: "linear-gradient(135deg,#e8faff,#d3ebff)",
            borderRadius: "20px",
            boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
            padding: "1.5rem",
          }}
        >
          <h3>📊 Analytics Overview</h3>
          <div
            style={{
              height: "200px",
              borderRadius: "15px",
              background:
                "repeating-linear-gradient(90deg,#cae5ff 0px,#cae5ff 50px,#d8f3ff 50px,#d8f3ff 100px)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-around",
              padding: "0 1rem",
            }}
          >
            {[40, 70, 55, 90, 100, 65, 80].map((height, i) => (
              <div
                key={i}
                style={{
                  width: "20px",
                  height: `${height * 1.5}px`,
                  background:
                    "linear-gradient(180deg,#6a56c2,#9e8ce2,#c3b9f0)",
                  borderRadius: "8px",
                }}
              />
            ))}
          </div>
          <p
            style={{
              textAlign: "center",
              marginTop: "0.5rem",
              fontWeight: 500,
            }}
          >
            Weekly engagement bars (mock visualization)
          </p>
        </section>

        {/* 💬 Social Feed */}
        <section
          style={{
            background: "linear-gradient(135deg,#ffe9f0,#ffd0de)",
            borderRadius: "20px",
            boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
            padding: "1.5rem",
          }}
        >
          <h3>💬 Social Feed</h3>
          <textarea
            placeholder="Share your thoughts..."
            value={post}
            onChange={(e) => setPost(e.target.value)}
            style={{
              width: "100%",
              height: "100px",
              borderRadius: "8px",
              border: "1px solid #e4a4b2",
              padding: "10px",
              outline: "none",
            }}
          />
          <button
            onClick={handlePost}
            style={{
              marginTop: "1rem",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#f37eab",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🚀 Post
          </button>

          <div
            style={{ marginTop: "1rem", maxHeight: "150px", overflowY: "auto" }}
          >
            {feed.map((item, i) => (
              <p
                key={i}
                style={{
                  backgroundColor: "rgba(255,255,255,0.7)",
                  padding: "8px",
                  borderRadius: "8px",
                  marginBottom: "0.5rem",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                }}
              >
                {item}
              </p>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
