"use client";
import React, { useState } from "react";

export default function Home() {
  const [mood, setMood] = useState("");
  const [post, setPost] = useState("");
  const [feed, setFeed] = useState<string[]>([]);

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
