import test from 'node:test';
import assert from 'node:assert/strict';

import { shouldRedirectToAdminDashboard, shouldRedirectToBackupHome, shouldRequireLogin } from '../src/redirectPolicy.js';

test('redirects admin from home page to admin dashboard', () => {
  const adminUser = { role: 'admin', name: 'Quản trị viên' };
  const uppercaseAdminUser = { role: 'ADMIN', name: 'Quản trị viên' };
  assert.equal(shouldRedirectToAdminDashboard('/', adminUser), true);
  assert.equal(shouldRedirectToAdminDashboard('/index.html', adminUser), true);
  assert.equal(shouldRedirectToAdminDashboard('/backup/index.html', adminUser), true);
  assert.equal(shouldRedirectToAdminDashboard('/', adminUser, null), true);
  assert.equal(shouldRedirectToAdminDashboard('/', uppercaseAdminUser), true);
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

test('redirects signed-in regular users from the root to the canonical home page', () => {
  const regularUser = { role: 'user', name: 'Học viên' };
  const adminUser = { role: 'admin', name: 'Quản trị viên' };
  assert.equal(shouldRedirectToBackupHome('/', regularUser), true);
  assert.equal(shouldRedirectToBackupHome('/index.html', regularUser), true);
  assert.equal(shouldRedirectToBackupHome('/backup/index.html', regularUser), false);
  assert.equal(shouldRedirectToBackupHome('/backup/pages/exams.html', regularUser), false);
  assert.equal(shouldRedirectToBackupHome('/', null), false);
  assert.equal(shouldRedirectToBackupHome('/', adminUser), false);
});

test('requires login on every page except auth page', () => {
  assert.equal(shouldRequireLogin('/backup/pages/about.html', null), true);
  assert.equal(shouldRequireLogin('/backup/pages/auth.html', null), false);
  assert.equal(shouldRequireLogin('/backup/pages/about.html', { role: 'user' }), false);
  assert.equal(shouldRequireLogin('/backup/pages/admin-dashboard.html', { role: 'admin' }), false);
});
