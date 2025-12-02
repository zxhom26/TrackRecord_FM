import test from 'node:test';
import assert from 'node:assert/strict';

import { callBackend } from '../utils.js'

/*  ----- TRF-42 ---- */
test("callBackend returns object", () => {
  assert.equal(typeof callBackend(), "object");
});
