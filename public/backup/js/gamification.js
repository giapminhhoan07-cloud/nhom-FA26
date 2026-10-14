export const BADGE_DEFINITIONS = [
  { id: "first-attempt", name: "Bắt đầu hành trình", description: "Hoàn thành bài thi đầu tiên." },
  { id: "high-score", name: "Bứt phá điểm số", description: "Đạt từ 9 điểm trong một bài thi." },
  { id: "ten-attempts", name: "Kiên trì luyện tập", description: "Hoàn thành 10 bài thi." },
  { id: "seven-day-streak", name: "Giữ nhịp 7 ngày", description: "Học liên tiếp trong 7 ngày." },
];

export function getLevelFromXp(xp) {
  return Math.floor(Math.max(0, Number(xp) || 0) / 100) + 1;
}

export function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDayNumber(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86_400_000;
}

export function createGamificationUpdate(current = {}, attempt, now = new Date()) {
  const attemptId = String(attempt?.attemptId || attempt?.id || "");
  const totalQuestions = Number(attempt?.totalQuestions ?? attempt?.total_questions);
  const correctCount = Number(attempt?.correctCount ?? attempt?.correct_count);
  const score = Number(attempt?.score);
  const answers = attempt?.answers;
  const submittedAt = new Date(attempt?.submittedAt ?? attempt?.submitted_at);
  const valid = Boolean(
    attemptId
    && Number.isInteger(totalQuestions) && totalQuestions > 0
    && Number.isInteger(correctCount) && correctCount >= 0 && correctCount <= totalQuestions
    && Number.isFinite(score) && score >= 0 && score <= 10
    && Array.isArray(answers) && answers.length === totalQuestions
    && !Number.isNaN(submittedAt.getTime()),
  );

  if (!valid) return { awarded: false, reason: "invalid", state: current, newBadges: [] };

  const awardedAttemptIds = Array.isArray(current.awardedAttemptIds) ? current.awardedAttemptIds : [];
  if (awardedAttemptIds.includes(attemptId)) {
    return { awarded: false, reason: "duplicate", state: current, newBadges: [] };
  }

  const previousXp = Math.max(0, Number(current.xp) || 0);
  const completedAttempts = Math.max(0, Number(current.completedAttempts) || 0) + 1;
  const today = getLocalDateKey(now);
  const yesterday = getLocalDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const previousStudyDate = current.lastStudyDate;
  const streak = previousStudyDate === today
    ? Math.max(1, Number(current.streak) || 0)
    : previousStudyDate === yesterday ? Math.max(1, Number(current.streak) || 0) + 1 : 1;
  const badgeIds = new Set(Array.isArray(current.badges) ? current.badges : []);

  if (completedAttempts >= 1) badgeIds.add("first-attempt");
  if (score >= 9) badgeIds.add("high-score");
  if (completedAttempts >= 10) badgeIds.add("ten-attempts");
  if (streak >= 7) badgeIds.add("seven-day-streak");

  const newBadges = [...badgeIds].filter((badgeId) => !(current.badges || []).includes(badgeId));
  const xp = previousXp + 50;
  const state = {
    xp,
    level: getLevelFromXp(xp),
    streak,
    lastStudyDate: today,
    completedAttempts,
    awardedAttemptIds: [...awardedAttemptIds, attemptId],
    badges: [...badgeIds],
  };

  return { awarded: true, reason: "awarded", state, newBadges };
}

export function recordGamificationCompletion(user, attempt, storage = globalThis.localStorage, now = new Date()) {
  const userId = String(user?.id || user?.email || "");
  if (!userId || !storage) return { awarded: false, reason: "no-user", state: null, newBadges: [] };

  const key = `studysphere_gamification_${encodeURIComponent(userId)}`;
  let current = {};
  try {
    current = JSON.parse(storage.getItem(key) || "{}") || {};
  } catch {
    current = {};
  }
  const update = createGamificationUpdate(current, attempt, now);
  if (update.awarded) storage.setItem(key, JSON.stringify(update.state));
  return update;
}