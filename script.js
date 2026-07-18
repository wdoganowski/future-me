(() => {
  'use strict';

  const STORAGE_KEY = 'futureMe.capsules';
  const THEME_KEY = 'futureMe.theme';

  const QUOTES = [
    "The future depends on what you do today. — Mahatma Gandhi",
    "Your time is limited, so don't waste it living someone else's life. — Steve Jobs",
    "The best way to predict the future is to create it. — Abraham Lincoln",
    "Write it on your heart that every day is the best day in the year. — Ralph Waldo Emerson",
    "What you get by achieving your goals is not as important as what you become by achieving your goals. — Zig Ziglar",
    "Small daily improvements are the key to staggering long-term results.",
    "The secret of getting ahead is getting started. — Mark Twain",
    "Dream big. Start small. Act now.",
    "A year from now you may wish you had started today. — Karen Lamb",
    "Be patient with yourself. Growth takes time."
  ];

  const els = {};

  function qs(id) { return document.getElementById(id); }

  function init() {
    els.themeToggle = qs('themeToggle');
    els.form = qs('letterForm');
    els.name = qs('name');
    els.message = qs('message');
    els.charCount = qs('charCount');
    els.unlockDate = qs('unlockDate');
    els.formError = qs('formError');
    els.capsuleList = qs('capsuleList');
    els.emptyState = qs('emptyState');
    els.capsuleCount = qs('capsuleCount');
    els.quote = qs('quote');
    els.revealOverlay = qs('revealOverlay');
    els.revealClose = qs('revealClose');
    els.revealTitle = qs('revealTitle');
    els.revealMeta = qs('revealMeta');
    els.revealBody = qs('revealBody');

    initQuote();
    initMinDate();

    els.themeToggle.addEventListener('click', toggleTheme);
    els.message.addEventListener('input', updateCharCount);
    els.form.addEventListener('submit', handleSubmit);
    els.revealClose.addEventListener('click', closeReveal);
    els.revealOverlay.addEventListener('click', (e) => {
      if (e.target === els.revealOverlay) closeReveal();
    });

    renderCapsules();
    setInterval(renderCapsules, 1000);
  }

  // ---------- Theme ----------
  // Initial data-theme is set by the blocking inline script in <head>,
  // before first paint, to avoid a flash of the wrong theme.
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
  }

  // ---------- Quote ----------
  function initQuote() {
    els.quote.textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }

  // ---------- Form helpers ----------
  function initMinDate() {
    const now = new Date();
    now.setSeconds(0, 0);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    els.unlockDate.min = now.toISOString().slice(0, 16);
  }

  function updateCharCount() {
    els.charCount.textContent = els.message.value.length;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const name = els.name.value.trim();
    const message = els.message.value.trim();
    const unlockDateValue = els.unlockDate.value;

    if (!name || !message || !unlockDateValue) {
      showFormError('Please fill in your name, message, and unlock date.');
      return;
    }

    const unlockTime = new Date(unlockDateValue).getTime();
    if (Number.isNaN(unlockTime)) {
      showFormError('That date looks invalid.');
      return;
    }

    if (unlockTime <= Date.now()) {
      showFormError('Please choose a date in the future.');
      return;
    }

    const capsule = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      message,
      createdAt: Date.now(),
      unlockAt: unlockTime,
      revealed: false
    };

    const capsules = loadCapsules();
    capsules.push(capsule);
    saveCapsules(capsules);

    els.form.reset();
    updateCharCount();
    clearFormError();
    initMinDate();
    renderCapsules();
  }

  function showFormError(msg) {
    els.formError.textContent = msg;
    els.form.classList.add('shake');
    setTimeout(() => els.form.classList.remove('shake'), 400);
  }

  function clearFormError() {
    els.formError.textContent = '';
  }

  // ---------- Storage ----------
  function loadCapsules() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveCapsules(capsules) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capsules));
  }

  // ---------- Rendering ----------
  function renderCapsules() {
    const capsules = loadCapsules().sort((a, b) => a.unlockAt - b.unlockAt);
    els.capsuleCount.textContent = capsules.length;
    els.emptyState.hidden = capsules.length > 0;

    const now = Date.now();
    const existingIds = new Set();

    capsules.forEach((capsule) => {
      existingIds.add(capsule.id);
      const isUnlocked = now >= capsule.unlockAt;
      let node = els.capsuleList.querySelector(`[data-id="${capsule.id}"]`);

      if (!node) {
        node = document.createElement('div');
        node.dataset.id = capsule.id;
        els.capsuleList.appendChild(node);
      }

      node.className = `capsule ${isUnlocked ? 'unlocked' : 'locked'}`;

      const createdStr = new Date(capsule.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      const unlockStr = new Date(capsule.unlockAt).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      let bodyHtml;
      if (isUnlocked) {
        bodyHtml = `<div class="capsule-message">${escapeHtml(capsule.message)}</div>`;
      } else {
        const totalSpan = capsule.unlockAt - capsule.createdAt;
        const elapsed = now - capsule.createdAt;
        const pct = totalSpan > 0 ? Math.min(100, Math.max(0, (elapsed / totalSpan) * 100)) : 0;
        const remaining = capsule.unlockAt - now;
        const c = countdownParts(remaining);
        bodyHtml = `
          <div class="countdown">
            <div class="unit"><span class="num">${c.days}</span><span class="label">days</span></div>
            <div class="unit"><span class="num">${c.hours}</span><span class="label">hrs</span></div>
            <div class="unit"><span class="num">${c.minutes}</span><span class="label">min</span></div>
            <div class="unit"><span class="num">${c.seconds}</span><span class="label">sec</span></div>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
          <div class="capsule-preview">🔒 This message is sealed until the unlock date arrives.</div>
        `;
      }

      node.innerHTML = `
        <div class="capsule-top">
          <div class="capsule-title">To: ${escapeHtml(capsule.name)}</div>
          <div class="capsule-status">${isUnlocked ? 'Unlocked ✅' : 'Locked 🔒'}</div>
        </div>
        <div class="capsule-date">Sealed ${createdStr} · Unlocks ${unlockStr}</div>
        ${bodyHtml}
        <div class="capsule-actions">
          ${isUnlocked ? '<button class="btn-ghost" data-action="view">Open letter</button>' : ''}
          <button class="btn-delete" data-action="delete">Delete</button>
        </div>
      `;

      if (isUnlocked && !capsule.revealed) {
        capsule.revealed = true;
        openReveal(capsule);
      }

      node.querySelector('[data-action="delete"]').onclick = () => {
        const updated = loadCapsules().filter((c) => c.id !== capsule.id);
        saveCapsules(updated);
        node.remove();
        renderCapsules();
      };

      const viewBtn = node.querySelector('[data-action="view"]');
      if (viewBtn) viewBtn.onclick = () => openReveal(capsule);
    });

    // Persist any "revealed" flag updates and clean up removed nodes
    saveCapsules(capsules);
    Array.from(els.capsuleList.children).forEach((child) => {
      if (!existingIds.has(child.dataset.id)) child.remove();
    });
  }

  function countdownParts(ms) {
    const clamped = Math.max(0, ms);
    const totalSeconds = Math.floor(clamped / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0')
    };
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- Reveal modal ----------
  function openReveal(capsule) {
    els.revealTitle.textContent = `A letter to ${capsule.name} has arrived`;
    els.revealMeta.textContent = `Sealed on ${new Date(capsule.createdAt).toLocaleDateString()}`;
    els.revealBody.textContent = capsule.message;
    els.revealOverlay.hidden = false;
  }

  function closeReveal() {
    els.revealOverlay.hidden = true;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
