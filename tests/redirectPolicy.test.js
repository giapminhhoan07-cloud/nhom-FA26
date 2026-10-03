import test from 'node:test';
import assert from 'node:assert/strict';

import { shouldRedirectToAdminDashboard } from '../src/redirectPolicy.js';

test('redirects admin from home page to admin dashboard', () => {
  const adminUser = { role: 'admin', name: 'Quản trị viên' };
  assert.equal(shouldRedirectToAdminDashboard('/', adminUser), true);
  assert.equal(shouldRedirectToAdminDashboard('/index.html', adminUser), true);
  assert.equal(shouldRedirectToAdminDashboard('/backup/index.html', adminUser), true);
  assert.equal(shouldRedirectToAdminDashboard('/', adminUser, '?from=admin'), false);
});

test('does not redirect regular users or other pages', () => {
  const guestUser = null;
  const regularUser = { role: 'user', name: 'Học viên' };
  const adminUser = { role: 'admin', name: 'Quản trị viên' };
  assert.equal(shouldRedirectToAdminDashboard('/', guestUser), false);
  assert.equal(shouldRedirectToAdminDashboard('/', regularUser), false);
  assert.equal(shouldRedirectToAdminDashboard('/backup/pages/exams.html', adminUser), false);
});
