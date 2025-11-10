// src/app/app/utils.js
//this file contains utility functions that is responsible for managing logic of mood tracking and social feed interactions for the dashboard
//it seperates the business logic (saving moods, adding posts, mood tone, etc.) from the UI layer

// --- 1. Save mood message ---
export function handleMoodSave(mood) {
  return `Mood saved: ${mood || "neutral"}`;
}

// --- 2. Add a new post to feed ---
export function handlePost(post, feed) {
  if (post.trim() === "") {
    return feed; // no change if post is empty
  }
  return [...feed, post];
}

// --- 3. Clear feed entirely ---
export function clearFeed() {
  return [];
}

// --- 4. Get the latest post ---
export function getLatestPost(feed) {
  if (feed.length === 0) return null;
  return feed[feed.length - 1];
}

// --- 5. Count words in a post ---
export function countWords(post) {
  if (!post || typeof post !== "string") return 0;
  return post.trim().split(/\s+/).length;
}

// --- 6. Check if mood is positive or negative ---
export function analyzeMood(mood) {
  const positiveWords = ["happy", "joyful", "excited", "calm", "good"];
  const negativeWords = ["sad", "angry", "tired", "anxious", "bad"];

  if (!mood) return "neutral";

  const lowerMood = mood.toLowerCase();
  if (positiveWords.some((word) => lowerMood.includes(word))) return "positive";
  if (negativeWords.some((word) => lowerMood.includes(word))) return "negative";

  return "neutral";
}

// --- 7. Get feed length ---
export function getFeedLength(feed) {
  return Array.isArray(feed) ? feed.length : 0;
}

// --- 8. Check if a post already exists in feed ---
export function postExists(feed, post) {
  if (!Array.isArray(feed)) return false;
  return feed.includes(post);
}

// --- 9. Format mood string (capitalize first letter) ---
export function formatMood(mood) {
  if (!mood || typeof mood !== "string") return "Neutral";
  return mood.charAt(0).toUpperCase() + mood.slice(1).toLowerCase();
}

// --- 10. Generate mood summary ---
export function generateMoodSummary(moods) {
  if (!Array.isArray(moods) || moods.length === 0) return "No moods recorded";
  const positives = moods.filter((m) => analyzeMood(m) === "positive").length;
  const negatives = moods.filter((m) => analyzeMood(m) === "negative").length;

  if (positives > negatives) return "Overall positive trend";
  if (negatives > positives) return "Overall negative trend";
  return "Mixed mood pattern";
}

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


