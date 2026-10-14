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
    ['01 / CHANNELS', 'Meet people where they are.', 'WhatsApp is Alessia’s primary interface for Inpulso 43. The WhatsApp Business API delivers messages to the Flask webhook layer.'],
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
  // Local, clearly labeled examples; no patient data or API calls.
  const scenarios = {
    appointment: ['Quiero agendar una cita.', 'Puedo ayudarte a consultar opciones y coordinar tu cita. ¿Qué servicio te interesa?'],
    workshop: ['Me gustaría conocer los talleres.', 'Puedo orientarte sobre los talleres de Inpulso 43 y ayudarte con el proceso de inscripción. ¿Qué tema te interesa?'],
    human: ['Prefiero hablar con una persona.', 'Claro. Puedo ayudarte a contactar con recepción para que una persona del equipo te atienda.']
  };
  document.querySelectorAll('[data-chat-demo]').forEach(demo => {
    demo.querySelectorAll('[data-scenario]').forEach(button => button.addEventListener('click', () => {
      const [question, answer] = scenarios[button.dataset.scenario];
      demo.querySelectorAll('[data-scenario]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
      demo.querySelector('[data-demo-question]').textContent = question;
      demo.querySelector('[data-demo-answer]').textContent = answer;
    }));
  });
  // A restrained specular highlight follows a fine pointer; motion controls win.
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('[data-glass-scene]').forEach(scene => {
    let frame;
    const reset = () => {
      cancelAnimationFrame(frame);
      scene.style.removeProperty('--pointer-x');
      scene.style.removeProperty('--pointer-y');
      scene.style.removeProperty('--tilt-x');
      scene.style.removeProperty('--tilt-y');
    };
    scene.addEventListener('pointermove', event => {
      if (reducedMotion.matches || manuallyPaused || !finePointer.matches) return;
      const rect = scene.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        scene.style.setProperty('--pointer-x', `${x * 100}%`);
        scene.style.setProperty('--pointer-y', `${y * 100}%`);
        scene.style.setProperty('--tilt-x', `${(0.5 - y) * 10}deg`);
        scene.style.setProperty('--tilt-y', `${(x - 0.5) * 12}deg`);
      });
    });
    scene.addEventListener('pointerleave', reset);
    reducedMotion.addEventListener('change', reset);
    motionButton?.addEventListener('click', reset);
  });

})();
