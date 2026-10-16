const XP_PER_ATTEMPT = 50;
const WEEK_IN_MILLISECONDS = 7 * 24 * 60 * 60 * 1000;

function getUserKey(user) {
  const id = user?.id || user?.email;
  return id === undefined || id === null ? "" : String(id);
}

function isStudent(user) {
  return user
    && user.role !== "admin"
    && user.is_admin !== true
    && user.isAdmin !== true
    && Number(user.is_admin) !== 1
    && user.status !== "locked";
}

function getAttemptDate(attempt) {
  const date = new Date(attempt?.submittedAt || attempt?.submitted_at || "");
  return Number.isNaN(date.getTime()) ? null : date;
}

export function buildLeaderboard(users, attempts, period = "week", now = new Date()) {
  const studentUsers = (Array.isArray(users) ? users : [])
    .filter(isStudent)
    .filter((user) => getUserKey(user));
  const userById = new Map(studentUsers.map((user) => [getUserKey(user), user]));
  const uniqueAttempts = new Map();

  (Array.isArray(attempts) ? attempts : []).forEach((attempt, index) => {
    const userId = String(attempt?.userId || "");
    const score = Number(attempt?.score);
    const submittedAt = getAttemptDate(attempt);
    const attemptId = String(attempt?.attemptId || attempt?.id || `${userId}-${index}`);
    if (!userById.has(userId) || !submittedAt || !Number.isFinite(score) || score < 0 || score > 10) return;
    if (period === "week" && (submittedAt < new Date(now.getTime() - WEEK_IN_MILLISECONDS) || submittedAt > now)) return;
    uniqueAttempts.set(attemptId, { userId, score });
  });

  const activityByUser = new Map();
  uniqueAttempts.forEach(({ userId, score }) => {
    const activity = activityByUser.get(userId) || { attempts: 0, scoreTotal: 0 };
    activity.attempts += 1;
    activity.scoreTotal += score;
    activityByUser.set(userId, activity);
  });

  return studentUsers
    .map((user) => {
      const key = getUserKey(user);
      const activity = activityByUser.get(key) || { attempts: 0, scoreTotal: 0 };
      const xp = period === "week"
        ? activity.attempts * XP_PER_ATTEMPT
        : Math.max(0, Number(user.xp) || 0);
      return {
        id: key,
        name: String(user.name || "Học sinh"),
        xp,
        attempts: activity.attempts,
        averageScore: activity.attempts ? activity.scoreTotal / activity.attempts : 0,
        level: Math.floor(xp / 100) + 1,
      };
    })
    .filter((entry) => entry.xp > 0)
    .sort((first, second) => second.xp - first.xp
      || second.averageScore - first.averageScore
      || first.name.localeCompare(second.name, "vi"));
}

