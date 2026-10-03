// Bodega SF — interactions + editorial 3D depth
(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  // ---------- Hero: mouse parallax (desktop only) ----------
  const hero = document.querySelector('.hero');
  if (hero && !reducedMotion && !isTouch) {
    const bg = hero.querySelector('.bg');
    const plate = hero.querySelector('.plate-3d');
    const orbs = hero.querySelectorAll('.orb');
    const content = hero.querySelector('.content');
    const fg = hero.querySelectorAll('.fg > span');
    let rafId = null, tx = 0, ty = 0, cx = 0, cy = 0;

    const update = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      if (bg)      bg.style.transform      = `translate3d(${cx * -10}px, ${cy * -10}px, 0) scale(1.04)`;
      if (plate)   plate.style.transform   = `translate3d(${cx * 28}px, ${cy * 20}px, 0) rotateX(${8 + cy * -3}deg) rotateY(${cx * 5}deg) rotateZ(-5deg)`;
      if (content) content.style.transform = `translate3d(${cx * -6}px, ${cy * -6}px, 0)`;
      orbs.forEach((o, i) => {
        const d = (i + 1) * 16;
        o.style.transform = `translate3d(${cx * d}px, ${cy * d}px, 0)`;
      });
      fg.forEach((el, i) => {
        const d = (i + 1) * 10;
        const prevRot = el.classList.contains('fg-1') || el.classList.contains('fg-3') ? ' rotate(180deg)' : '';
        el.style.transform = `translate3d(${cx * d}px, ${cy * d}px, 0)${prevRot}`;
      });
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
        rafId = requestAnimationFrame(update);
      } else { rafId = null; }
    };

    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!rafId) rafId = requestAnimationFrame(update);
    });
    hero.addEventListener('mouseleave', () => {
      tx = 0; ty = 0;
      if (!rafId) rafId = requestAnimationFrame(update);
    });
  }

  // ---------- Scroll parallax (subtle, GPU-cheap) ----------
  if (!reducedMotion) {
    const parallaxTargets = [];

    // Hero bg scales out slightly on scroll (cinematic zoom-out)
    const heroBg = document.querySelector('.hero .bg');
    const heroPlate = document.querySelector('.hero .plate-3d');
    const heroOrbs = document.querySelectorAll('.hero .orb');
    const heroContent = document.querySelector('.hero .content');

    // Story frames parallax
    document.querySelectorAll('.story .frame, .pevents .img, [data-parallax]').forEach((el) => {
      parallaxTargets.push({ el, speed: 0.12 });
    });

    let scrollRaf = null;
    const applyScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;

      // Hero depth as you scroll past
      if (heroBg) {
        const p = Math.min(1, y / vh);
        heroBg.style.transform = `translate3d(0, ${y * 0.3}px, 0) scale(${1.04 + p * 0.06})`;
      }
      if (heroPlate && y < vh * 1.2) {
        heroPlate.style.transform = `translate3d(0, ${y * 0.18}px, 0) rotateX(${8 + y * 0.01}deg) rotateZ(-5deg) scale(${1 - Math.min(.1, y / vh * .1)})`;
      }
      if (heroContent && y < vh) {
        heroContent.style.transform = `translate3d(0, ${y * 0.25}px, 0)`;
        heroContent.style.opacity = String(Math.max(0, 1 - y / (vh * .9)));
      }
      heroOrbs.forEach((o, i) => {
        if (y < vh * 1.3) {
          const d = (i + 1) * 0.08;
          o.style.transform = `translate3d(0, ${y * d}px, 0)`;
        }
      });

      // Element-level parallax
      parallaxTargets.forEach(({ el, speed }) => {
        const rect = el.getBoundingClientRect();
        const centerFromViewport = rect.top + rect.height / 2 - vh / 2;
        const offset = -centerFromViewport * speed;
        el.style.transform = (el.dataset.baseTransform || '') + ` translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });

      scrollRaf = null;
    };

    window.addEventListener('scroll', () => {
      if (!scrollRaf) scrollRaf = requestAnimationFrame(applyScroll);
    }, { passive: true });

    // Store any base transforms (e.g. story frame rotation)
    document.querySelectorAll('.story .frame').forEach((el) => {
      const cs = getComputedStyle(el).transform;
      // Only remember if it's a rotation we set in CSS
      if (cs && cs !== 'none') el.dataset.baseTransform = 'rotate(-1.2deg)';
    });

    applyScroll();
  }

  // ---------- Card 3D tilt (desktop, non-touch) ----------
  const tiltSelector = '.press-card, .policy-card, .shop-card, .gallery .tile, .map-card';
  if (!reducedMotion && !isTouch) {
    document.querySelectorAll(tiltSelector).forEach((el) => {
      let raf = null, tx = 0, ty = 0;
      const apply = () => {
        el.style.transform = `perspective(1000px) rotateX(${ty}deg) rotateY(${tx}deg) translateZ(0)`;
        raf = null;
      };
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 8;
        ty = -((e.clientY - r.top) / r.height - 0.5) * 8;
        if (!raf) raf = requestAnimationFrame(apply);
      });
      el.addEventListener('mouseleave', () => {
        tx = 0; ty = 0;
        el.style.transform = '';
      });
    });
  }

  // ---------- Sticky nav state ----------
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Mobile drawer (works for old .burger/.drawer and new .pill-burger/.exp-drawer) ----------
  const burger = document.querySelector('.burger, .pill-burger');
  const drawer = document.querySelector('.drawer, .exp-drawer');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    if (burger) burger.setAttribute('aria-expanded', String(open));
    if (drawer) drawer.setAttribute('aria-hidden', String(!open));
  };
  if (burger) {
    burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  }
  document.querySelectorAll('.drawer a, .exp-drawer a').forEach((a) => {
    a.addEventListener('click', () => setMenu(false));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
  });

  // ---------- Reveal on scroll ----------
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

  // ---------- Tabs ----------
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

  // ---------- FAQ accordions ----------
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', (e) => {
      if (item.tagName.toLowerCase() === 'details') return;
      e.preventDefault();
      const open = item.hasAttribute('open');
      if (open) item.removeAttribute('open');
      else item.setAttribute('open', '');
    });
  });

  // ---------- Form (inquiry) ----------
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

  // ---------- Active nav link ----------
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a, .drawer a, .nav-pill a, .exp-drawer a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === path) a.setAttribute('aria-current', 'page');
  });

  // ---------- Year ----------
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
