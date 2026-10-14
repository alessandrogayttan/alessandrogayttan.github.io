(function () {
  'use strict';
  const cfg = window.SITE_CONFIG || {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let manuallyPaused = false;
  const motionButton = document.querySelector('.motion-toggle');
  function syncMotion() {
    const paused = manuallyPaused || reducedMotion.matches;
    document.documentElement.classList.toggle('motion-paused', paused);
    if (motionButton) {
      motionButton.textContent = reducedMotion.matches ? 'Reduced motion' : paused ? 'Resume motion' : 'Pause motion';
      motionButton.setAttribute('aria-pressed', String(paused));
      motionButton.disabled = reducedMotion.matches;
    }
  }
  motionButton?.addEventListener('click', () => { manuallyPaused = !manuallyPaused; syncMotion(); });
  reducedMotion.addEventListener('change', syncMotion);
  syncMotion();
  document.querySelectorAll('[data-wa]').forEach(el => {
    if (!cfg.whatsapp) return;
    el.href = 'https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(el.dataset.waMessage || "Hi Alessandro, I'd like to discuss an opportunity.");
    el.target = '_blank'; el.rel = 'noopener';
  });
  const nav = document.getElementById('nav');
  const progress = document.querySelector('.reading-progress');
  function updateScroll() {
    nav?.classList.toggle('nav--scrolled', window.scrollY > 40);
    if (progress) {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${total > 0 ? Math.min(1, window.scrollY / total) : 0})`;
    }
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('resize', updateScroll);
  updateScroll();
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  function closeMenu(restoreFocus) {
    links?.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Open menu');
    if (restoreFocus) toggle?.focus();
  }
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && links.classList.contains('is-open')) closeMenu(true); });
    document.addEventListener('click', e => { if (!nav.contains(e.target)) closeMenu(false); });
  }
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.06 });
    document.documentElement.classList.add('js-reveal');
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
  const layers = [
    ['01 / CHANNELS', 'Meet people where they are.', 'WhatsApp and web chat provide two entry points into the assistant. Flask handles the API and webhook layer.'],
    ['02 / CONVERSATION', 'Give the conversation a purpose.', 'The Gemini conversation layer connects natural-language requests to the assistant’s business tools. A human handoff remains part of the workflow.'],
    ['03 / BUSINESS TOOLS', 'Turn intent into an action.', 'Appointment and business tools connect the assistant to Google Calendar, Google Sheets, and SQLite-backed persistence.'],
    ['04 / OPERATIONS', 'Think beyond the first request.', 'Docker and Gunicorn package the service. The documented deployment uses a single web worker while scheduled jobs run in-process; scaling requires separating the scheduler to prevent duplicate reminders.']
  ];
  document.querySelectorAll('[data-layer]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-layer]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    const [label, title, copy] = layers[Number(button.dataset.layer)];
    document.getElementById('layer-label').textContent = label;
    document.getElementById('layer-title').textContent = title;
    document.getElementById('layer-copy').textContent = copy;
  }));
})();
