// __tests__/utils.test.js
// Jest test suite for mood tracking and feed management utility functions

import {
  handleMoodSave,
  handlePost,
  clearFeed,
  getLatestPost,
  countWords,
  analyzeMood,
  getFeedLength,
  postExists,
  formatMood,
  generateMoodSummary,
} from "../utils"; // 

describe("Utility Functions", () => {
  //  TEST 1: handleMoodSave()
  test("returns correct message when mood is provided", () => {
    expect(handleMoodSave("happy")).toBe("Mood saved: happy");
  });

  test("returns 'neutral' message when mood is empty", () => {
    expect(handleMoodSave("")).toBe("Mood saved: neutral");
  });

  //  TEST 2: handlePost()
  test("adds a valid post to the feed", () => {
    const result = handlePost("Hello", []);
    expect(result).toEqual(["Hello"]);
  });

  test("ignores empty posts", () => {
    const result = handlePost("   ", ["Existing"]);
    expect(result).toEqual(["Existing"]);
  });

  //  TEST 3: clearFeed()
  test("clears all posts from feed", () => {
    const result = clearFeed();
    expect(result).toEqual([]);
  });

  //  TEST 4: getLatestPost()
  test("returns latest post from feed", () => {
    const feed = ["First", "Second", "Latest"];
    expect(getLatestPost(feed)).toBe("Latest");
  });

  test("returns null if feed is empty", () => {
    expect(getLatestPost([])).toBeNull();
  });

  // TEST 5: countWords()
  test("counts words correctly in a post", () => {
    expect(countWords("Hello world")).toBe(2);
  });

  test("returns 0 for invalid input", () => {
    expect(countWords("")).toBe(0);
    expect(countWords(null)).toBe(0);
  });

  // TEST 6: analyzeMood()
  test("detects positive moods", () => {
    expect(analyzeMood("I feel happy")).toBe("positive");
  });

  test("detects negative moods", () => {
    expect(analyzeMood("I'm so sad")).toBe("negative");
  });

  test("returns neutral for unrecognized moods", () => {
    expect(analyzeMood("confused")).toBe("neutral");
  });

  //  TEST 7: getFeedLength()
  test("returns correct feed length", () => {
    expect(getFeedLength(["a", "b", "c"])).toBe(3);
  });

  test("returns 0 for invalid feed input", () => {
    expect(getFeedLength("not an array")).toBe(0);
  });

  //  TEST 8: postExists()
  test("returns true if post exists in feed", () => {
    expect(postExists(["hi", "hello"], "hi")).toBe(true);
  });

  test("returns false if post does not exist in feed", () => {
    expect(postExists(["hi"], "bye")).toBe(false);
  });

  // TEST 9: formatMood()
  test("capitalizes mood string correctly", () => {
    expect(formatMood("happy")).toBe("Happy");
  });

  test("returns 'Neutral' for invalid input", () => {
    expect(formatMood("")).toBe("Neutral");
  });

  //  TEST 10: generateMoodSummary()
  test("returns positive trend summary when positive moods dominate", () => {
    const moods = ["happy", "good", "sad"];
    expect(generateMoodSummary(moods)).toBe("Overall positive trend");
  });

  test("returns negative trend summary when negative moods dominate", () => {
    const moods = ["sad", "angry", "happy"];
    expect(generateMoodSummary(moods)).toBe("Overall negative trend");
  });

  test("returns mixed pattern when positive and negative are equal", () => {
    const moods = ["happy", "sad"];
    expect(generateMoodSummary(moods)).toBe("Mixed mood pattern");
  });

  test("returns message when no moods are recorded", () => {
    expect(generateMoodSummary([])).toBe("No moods recorded");
  });
});

