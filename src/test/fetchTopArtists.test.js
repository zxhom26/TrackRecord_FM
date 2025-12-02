import test from 'node:test';
import assert from 'node:assert/strict';

import { fetchTopArtists } from '../utils.js'

/*  ----- TRF-52 ---- */
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