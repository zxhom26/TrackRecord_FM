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
