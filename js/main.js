// Bodega SF — interactions
(function () {
  'use strict';

  // Sticky nav state
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile drawer
  const burger = document.querySelector('.burger');
  const drawer = document.querySelector('.drawer');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    if (burger) burger.setAttribute('aria-expanded', String(open));
    if (drawer) drawer.setAttribute('aria-hidden', String(!open));
  };
  if (burger) {
    burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  }
  document.querySelectorAll('.drawer a').forEach((a) => {
    a.addEventListener('click', () => setMenu(false));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
  });

  // Reveal on scroll
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // Tabs (menu)
  document.querySelectorAll('[data-tabs]').forEach((group) => {
    const tabs = group.querySelectorAll('[role="tab"]');
    const panels = group.querySelectorAll('[role="tabpanel"]');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.setAttribute('aria-selected', 'false'));
        panels.forEach((p) => p.setAttribute('aria-hidden', 'true'));
        tab.setAttribute('aria-selected', 'true');
        const panel = group.querySelector('#' + tab.getAttribute('aria-controls'));
        if (panel) panel.setAttribute('aria-hidden', 'false');
      });
      tab.addEventListener('keydown', (e) => {
        const list = Array.from(tabs);
        const idx = list.indexOf(tab);
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          list[(idx + 1) % list.length].focus();
          list[(idx + 1) % list.length].click();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          list[(idx - 1 + list.length) % list.length].focus();
          list[(idx - 1 + list.length) % list.length].click();
        }
      });
    });
  });

  // FAQ accordions (using <details> is also supported; this adds enhanced class toggling)
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', (e) => {
      // Allow default <details> behavior if used
      if (item.tagName.toLowerCase() === 'details') return;
      e.preventDefault();
      const open = item.hasAttribute('open');
      // Optional: close others
      // document.querySelectorAll('.faq-item[open]').forEach(i => i.removeAttribute('open'));
      if (open) item.removeAttribute('open');
      else item.setAttribute('open', '');
    });
  });

  // Form (private events / catering) — simple client-side feedback
  document.querySelectorAll('[data-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const subject = encodeURIComponent('New ' + (form.dataset.form || 'Inquiry') + ' Inquiry');
      const bodyLines = [];
      for (const [k, v] of data.entries()) bodyLines.push(k.toUpperCase() + ': ' + v);
      const body = encodeURIComponent(bodyLines.join('\n'));
      window.location.href = 'mailto:info@bodegarestaurants.com?subject=' + subject + '&body=' + body;
    });
  });

  // Set active nav link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a, .drawer a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === path) a.setAttribute('aria-current', 'page');
  });

  // Year
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
