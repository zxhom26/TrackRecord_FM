import test from 'node:test';
import assert from 'node:assert/strict';

import {
  callBackend,
  sendTokenToBackend,
  fetchTopTracks,
  fetchTopArtists,
  getTopMoodsFromGenres,
  getQuickStats,
} from '../utils.js';


/*  ----- 1. CHECK BACKEND OBJECT ---- */
test("callBackend returns object", () => {
  assert.equal(typeof callBackend(), "object");
});


/*  ----- 2. CHECK IF TOKEN IS SUCCESSFULLY SENT TO BACKEND ---- */
test("sendTokenToBackend sends request and returns json", async () => {
  process.env.NEXT_PUBLIC_BACKEND_URL = "https://mock-backend.com";

  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    assert.equal(url, "https://mock-backend.com/api/token");
    assert.equal(options.method, "POST");
    assert.equal(options.headers["Content-Type"], "application/json");

    const body = JSON.parse(options.body);
    assert.equal(body.accessToken, "mocktoken123");

    return {
      ok: true,
      json: async () => ({ success: true, received: body.accessToken }),
    };
  };

  const result = await sendTokenToBackend("mocktoken123");
  assert.deepEqual(result, { success: true, received: "mocktoken123" });

  global.fetch = originalFetch;
});


/*  ----- 3. CHECK ERROR HANDLING MESSAGE FOR FAILED BACKEND SEND TOKEN ---- */
test("sendTokenToBackend error handling", async () => {
  process.env.NEXT_PUBLIC_BACKEND_URL = "https://mock-backend.com";

  const originalFetch = global.fetch;

  global.fetch = async () => ({
    ok: false,
    status: 500,
  });

  const result = await sendTokenToBackend("token");
  assert.equal(result.error, "Backend responded with status 500");

  global.fetch = originalFetch;
});



/*  ----- 4. CHECKING SUCCESSFUL FETCH TOP TRACKS ---- */
test("fetchTopTracks returns proper tracks", async () => {
  process.env.NEXT_PUBLIC_BACKEND_URL = "https://mock-backend.com";

  const originalFetch = global.fetch;

  global.fetch = async (url, options) => {
    assert.equal(url, "https://mock-backend.com/api/top-tracks");
    assert.equal(options.method, "POST");

    const body = JSON.parse(options.body);
    assert.equal(body.accessToken, "mocktoken123");

    return {
      ok: true,
      json: async () => ({ top_tracks: ["Happy Song", "Fun Song"] }),
    };
  };

  const result = await fetchTopTracks("mocktoken123");
  assert.deepEqual(result, { top_tracks: ["Happy Song", "Fun Song"] });

  global.fetch = originalFetch;
});


/*  ----- 5. CHECKING FETCH TOP TRACKS ERROR MESSAGE ---- */
test("fetchTopTracks error handling", async () => {
  process.env.NEXT_PUBLIC_BACKEND_URL = "https://mock-backend.com";

  const originalFetch = global.fetch;

  global.fetch = async () => ({
    ok: false,
    status: 500,
  });

  const result = await fetchTopTracks("mocktoken123");
  assert.equal(result.error, "Top tracks request failed: 500");

  global.fetch = originalFetch;
});



/*  ----- 6. CHECKING SUCCESSFUL FETCH TOP ARTISTS ---- */
test("fetchTopArtists returns proper artists", async () => {
  process.env.NEXT_PUBLIC_BACKEND_URL = "https://mock-backend.com";

  const originalFetch = global.fetch;

  global.fetch = async (url, options) => {
    assert.equal(url, "https://mock-backend.com/api/top-artists");
    assert.equal(options.method, "POST");

    const body = JSON.parse(options.body);
    assert.equal(body.accessToken, "mocktoken123");

    return {
      ok: true,
      json: async () => ({ top_artists: ["Taylor Swift", "Drake"] }),
    };
  };

  const result = await fetchTopArtists("mocktoken123");
  assert.deepEqual(result, { top_artists: ["Taylor Swift", "Drake"] });

  global.fetch = originalFetch;
});


/*  ----- 7. CHECKING FETCH TOP ARTISTS ERROR MESSAGE ---- */
test("fetchTopArtists error handling", async () => {
  process.env.NEXT_PUBLIC_BACKEND_URL = "https://mock-backend.com";

  const originalFetch = global.fetch;

  global.fetch = async () => ({
    ok: false,
    status: 500,
  });

  const result = await fetchTopArtists("mocktoken123");
  assert.equal(result.error, "Top artists request failed: 500");

  global.fetch = originalFetch;
});



/*  ----- 8. CHECKING SUCCESSFUL FETCH QUICK STATS  ---- */
test("getQuickStats returns proper stats", async () => {
  process.env.NEXT_PUBLIC_BACKEND_URL = "https://mock-backend.com";

  const originalFetch = global.fetch;

  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      quick_stats: [
        {
          top_track: "CHANEL",
          top_artist: "Tyla",
          top_genre: "R&B",
        },
      ],
    }),
  });

  const result = await getQuickStats("mocktoken123");

  assert.deepEqual(result, {
    topTrack: "CHANEL",
    topArtist: "Tyla",
    topGenre: "R&B",
  });

  global.fetch = originalFetch;
});

/*  ----- 9. CHECKING GET QUICK STATS ERROR MESSAGE ---- */
test("getQuickStats error handling", async () => {
  process.env.NEXT_PUBLIC_BACKEND_URL = "https://mock-backend.com";

  const originalFetch = global.fetch;

  global.fetch = async () => ({
    ok: false,
    status: 404,
  });

  const result = await getQuickStats("mocktoken123");

  assert.equal(result.topTrack, "N/A");
  assert.equal(result.topArtist, "N/A");
  assert.equal(result.topGenre, "N/A");

  global.fetch = originalFetch;
});


/*  ----- 10. - 13. CHECKING MOOD MAPPING ---- */
test("noMood", () => {
    const result = getTopMoodsFromGenres([]);
    assert.deepEqual(result, ["Unknown Mood"]);
})

test("nullMood", () => {
    const result = getTopMoodsFromGenres(null);
    assert.deepEqual(result, ["Unknown Mood"]);
})

test("BalancedVibes", () => {
    const result = getTopMoodsFromGenres(["xyz", "abc"]);
    assert.deepEqual(result, ["🎧 Balanced Vibes"]);
});

test("CorrectMoods", () => {
    const result = getTopMoodsFromGenres(["latin", "rap", "lofi"]);
    assert.deepEqual(result, [
        "Vibrant & Rhythmic",
        "Bold & Confident",
        "Chill Study Vibes",
    ])
});
