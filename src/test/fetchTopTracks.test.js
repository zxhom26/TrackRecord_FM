import test from 'node:test';
import assert from 'node:assert/strict';

import { fetchTopTracks } from '../utils.js'

/*  ----- 4. TRF-46 ---- */
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
