import test from 'node:test';
import assert from 'node:assert/strict';

import { getQuickStats } from '../utils.js'

/*  ----- TRF-57  ---- */
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