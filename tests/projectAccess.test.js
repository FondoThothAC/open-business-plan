import test from 'node:test';
import assert from 'node:assert/strict';
import { assertSafeProjectSegment, userFolder } from '../server/projectAccess.js';

test('project identifiers reject traversal and ownership derives from the authenticated username', () => {
  assert.throws(() => assertSafeProjectSegment('../other-user'));
  assert.throws(() => assertSafeProjectSegment('project/name'));
  assert.equal(userFolder({ username: 'Ana Pérez' }), 'user_ana_p_rez');
});
