import test from 'node:test';
import assert from 'node:assert/strict';

import { getTopMoodsFromGenres } from '../utils.js'

/* ----- TRF-53 ----- */

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