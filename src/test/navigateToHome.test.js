import test from 'node:test';
import assert from 'node:assert/strict';

import { navigateToHome } from '../utils.js'


/* ----- TRF-60 ----- */
test("navigateToHome calls router.push('/')", () => {
  const mockRouter = {
    push: test.mock.fn(() => "success"),
  };

  const result = navigateToHome(mockRouter);

  // Check the return value
  assert.equal(result, "success");

  // Ensure push("/") was called once with correct argument
  assert.equal(mockRouter.push.mock.calls.length, 1);
  assert.equal(mockRouter.push.mock.calls[0].arguments[0], "/");
});
