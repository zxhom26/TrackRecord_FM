"use client";

 // --------------------- IMPORTS/USES -------------------
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";    
import { sendTokenToBackend } from "./utils";     

export default function Home() {
  const [mood, setMood] = useState("");
  const [post, setPost] = useState("");
  const [feed, setFeed] = useState<string[]>([]);

  const { data: session } = useSession();          

  // --------------------- SENDING TOKEN TO BACKEND -------------------
  useEffect(() => {
    if (session?.accessToken) {
      console.log("Sending token to backend...");
      sendTokenToBackend(session.accessToken).then((res) => {
        console.log("Backend response:", res);
      });
    }
  }, [session?.accessToken]);                       


  // --------------------- EXTRA UI/UX -------------------
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

    </main>
  );
}
