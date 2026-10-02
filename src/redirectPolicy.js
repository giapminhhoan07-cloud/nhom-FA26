export function hasAdminRole(user) {
  if (!user) return false;
  return user.role === 'admin' || user.is_admin === true || user.isAdmin === true || Number(user.is_admin) === 1;
}

export function shouldRedirectToAdminDashboard(pathname, user) {
  if (!hasAdminRole(user)) return false;

  const normalized = (pathname || '/').split('?')[0].split('#')[0];
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
