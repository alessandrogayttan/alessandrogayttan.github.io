(function () {
  'use strict';

  const cfg = window.SITE_CONFIG || {
    whatsapp: '523324453536',
    whatsappMessage: "Hi Alessandro, I'd like to discuss a project.",
  };

  function waUrl(msg) {
    return 'https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(msg || cfg.whatsappMessage);
  }

  document.querySelectorAll('[data-wa]').forEach((el) => {
    el.href = waUrl(el.dataset.waMessage);
    if (!el.target) {
      el.target = '_blank';
      el.rel = 'noopener';
    }
  });

  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open);
    });
    links.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => links.classList.remove('is-open'));
    });
  }

  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
  );
  revealEls.forEach((el) => observer.observe(el));

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  if (new URLSearchParams(location.search).get('sent') === '1') {
    const contact = document.getElementById('contact');
    if (contact) {
      const note = document.createElement('p');
      note.className = 'form-success';
      note.textContent = 'Message sent! I\'ll reply within 24 hours.';
      contact.querySelector('.contact__grid')?.prepend(note);
      history.replaceState({}, '', location.pathname + location.hash);
    }
  }
})();
