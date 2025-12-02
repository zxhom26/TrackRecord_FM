import test from 'node:test';
import assert from 'node:assert/strict';

import { fetchTopGenres } from '../utils.js'

/* ----- TRF-64 (frontend) ----- */
test("fetchTopGenres returns proper genres", async () => {
  process.env.NEXT_PUBLIC_BACKEND_URL = "https://mock-backend.com";

  const mockFetch = global.fetch;

  global.fetch = async (url, options) => {
    assert.equal(url, "https://mock-backend.com/api/top-genres");
    assert.equal(options.method, "POST");
    assert.equal(options.headers["Content-Type"], "application/json");

    const body = JSON.parse(options.body);
    assert.equal(body.accessToken, "mocktoken123");

    return {
      ok: true,
      json: async () => ({
        top_genres: ["Pop", "R&B", "Indie"],
      }),
    };
  };

  const result = await fetchTopGenres("mocktoken123");

  assert.deepEqual(result, {
    top_genres: ["Pop", "R&B", "Indie"],
  });

  global.fetch = mockFetch;
});