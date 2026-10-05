export function hasAdminRole(user) {
  if (!user || typeof user !== 'object') return false;

  const roleValue = typeof user.role === 'string' ? user.role.trim().toLowerCase() : '';
  const adminFlagValue = user.is_admin ?? user.isAdmin;
  const adminFlag = adminFlagValue === true || adminFlagValue === 1 || String(adminFlagValue ?? '').trim() === '1' || String(adminFlagValue ?? '').trim().toLowerCase() === 'true';

  return roleValue === 'admin' || adminFlag;
}

export function shouldRedirectToAdminDashboard(pathname, user, search = '') {
  if (!hasAdminRole(user)) return false;

  const safeSearch = search == null ? '' : String(search);
  if (new URLSearchParams(safeSearch).get('from') === 'admin') return false;

  const normalized = String(pathname ?? '/').split('?')[0].split('#')[0];
  const trimmed = normalized.replace(/\/+$/, '') || '/';
  const homePaths = [
    '/',
    '/index.html',
    '/backup',
    '/backup/',
    '/backup/index.html',
    '/public',
    '/public/',
    '/public/index.html',
    '/public/backup',
    '/public/backup/',
    '/public/backup/index.html',
  ];

  return homePaths.includes(trimmed) || trimmed.endsWith('/backup') || trimmed.endsWith('/public/backup');
}
