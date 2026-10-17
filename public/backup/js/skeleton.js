const skeletonTemplates = {
  "practice-card": `
    <article class="skeleton-card" aria-hidden="true">
      <div class="skeleton-between"><span class="skeleton-block skeleton-subject"></span><span class="skeleton-block skeleton-short"></span></div>
      <span class="skeleton-block skeleton-badge"></span>
      <span class="skeleton-block skeleton-heading"></span>
      <span class="skeleton-block skeleton-line"></span>
      <span class="skeleton-block skeleton-line skeleton-line-short"></span>
      <div class="skeleton-between skeleton-card-footer"><span class="skeleton-block skeleton-medium"></span><span class="skeleton-block skeleton-medium"></span></div>
    </article>
  `,
  "history-row": `
    <div class="skeleton-history-row" aria-hidden="true">
      <span class="skeleton-block skeleton-avatar"></span>
      <div class="skeleton-stack"><span class="skeleton-block skeleton-short"></span><span class="skeleton-block skeleton-heading"></span><span class="skeleton-block skeleton-line"></span></div>
      <span class="skeleton-block skeleton-score"></span>
      <span class="skeleton-block skeleton-badge"></span>
      <span class="skeleton-block skeleton-button"></span>
    </div>
  `,
  recommendation: `
    <article class="skeleton-recommendation" aria-hidden="true">
      <span class="skeleton-block skeleton-medium"></span>
      <span class="skeleton-block skeleton-heading"></span>
      <span class="skeleton-block skeleton-line"></span>
      <span class="skeleton-block skeleton-button"></span>
    </article>
  `,
  detail: `
    <div class="skeleton-detail" aria-hidden="true">
      <div class="skeleton-between"><span class="skeleton-block skeleton-subject"></span><span class="skeleton-block skeleton-medium"></span></div>
      <span class="skeleton-block skeleton-detail-heading"></span>
      <span class="skeleton-block skeleton-line"></span>
      <span class="skeleton-block skeleton-line skeleton-line-short"></span>
      <div class="skeleton-detail-stats"><span class="skeleton-block"></span><span class="skeleton-block"></span><span class="skeleton-block"></span></div>
      <span class="skeleton-block skeleton-button"></span>
    </div>
  `,
  podium: `
    <div class="skeleton-podium-card" aria-hidden="true">
      <span class="skeleton-block skeleton-avatar"></span><span class="skeleton-block skeleton-medium"></span><span class="skeleton-block skeleton-short"></span>
    </div>
  `,
  "leaderboard-row": `
    <div class="skeleton-leaderboard-row" aria-hidden="true">
      <span class="skeleton-block skeleton-short"></span><span class="skeleton-block skeleton-avatar"></span>
      <span class="skeleton-block skeleton-line"></span><span class="skeleton-block skeleton-medium"></span>
    </div>
  `,
  "profile-stat": `
    <div class="skeleton-profile-stat" aria-hidden="true">
      <span class="skeleton-block skeleton-medium"></span><span class="skeleton-block skeleton-heading"></span><span class="skeleton-block skeleton-short"></span>
    </div>
  `,
  chart: `<div class="skeleton-chart" aria-hidden="true"><span class="skeleton-block"></span></div>`,
  badge: `<div class="skeleton-badge-card" aria-hidden="true"><span class="skeleton-block skeleton-avatar"></span><span class="skeleton-block skeleton-line"></span></div>`,
  recent: `
    <div class="skeleton-recent" aria-hidden="true">
      <span class="skeleton-block skeleton-line"></span><span class="skeleton-block skeleton-score"></span>
    </div>
  `,
  result: `
    <div class="skeleton-detail" aria-hidden="true">
      <span class="skeleton-block skeleton-heading"></span><span class="skeleton-block skeleton-detail-heading"></span>
      <span class="skeleton-block skeleton-line"></span><span class="skeleton-block skeleton-line"></span>
      <span class="skeleton-block skeleton-line skeleton-line-short"></span>
    </div>
  `,
  question: `
    <div class="skeleton-question" aria-hidden="true">
      <span class="skeleton-block skeleton-heading"></span><span class="skeleton-block skeleton-detail-heading"></span>
      <span class="skeleton-block skeleton-answer"></span><span class="skeleton-block skeleton-answer"></span>
      <span class="skeleton-block skeleton-answer"></span><span class="skeleton-block skeleton-answer"></span>
    </div>
  `,
};

export function showSkeleton(container, type, count = 1) {
  if (!container) return;
  const template = skeletonTemplates[type];
  if (!template) throw new TypeError(`Unknown skeleton type: ${type}`);

  container.setAttribute("aria-busy", "true");
  container.innerHTML = Array.from({ length: count }, () => template).join("");
}

export function hideSkeleton(container) {
  container?.setAttribute("aria-busy", "false");
}
