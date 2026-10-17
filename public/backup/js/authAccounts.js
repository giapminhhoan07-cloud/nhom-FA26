export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function findUserByEmail(users, email) {
  const normalizedEmail = normalizeEmail(email);
  return users.find((user) => normalizeEmail(user.email) === normalizedEmail);
}

export function resolveLoginUser({ remoteUsers, localUsers, email, password }) {
  const remoteUser = findUserByEmail(remoteUsers, email);
  if (remoteUser) return remoteUser.password === password ? remoteUser : null;

  const localUser = findUserByEmail(localUsers, email);
  return localUser?.password === password ? localUser : null;
}
