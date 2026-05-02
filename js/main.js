/* ===============================================
   EcoClima Barcelona - Main JS
   - Sticky header scroll effect
   - Mobile menu (burger) with close on outside/ESC/resize
   - Scroll reveal animations
   - Form validation + submit
   - Cookie consent
   - Smooth scroll + scroll-to-top anchor
   =============================================== */
(function () {
  'use strict';

  /* -------- Sticky header: scroll effect + hide-on-scroll-down -------- */
  const header = document.getElementById('header');
  if (header) {
    /* Expose header height as CSS var so the full-screen mobile menu knows where to start */
    const setHeaderHeight = () => {
      document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
    };
    setHeaderHeight();
    window.addEventListener('resize', setHeaderHeight);

    let lastScrollY = window.scrollY;
    let ticking = false;

    const SCROLL_DELTA_MIN = 6;    /* ignore micro-scrolls */
    const HIDE_THRESHOLD = 120;    /* don't hide until user has scrolled at least this far */

    const update = () => {
      const y = window.scrollY;

      /* Translucent / scrolled background */
      if (y > 8) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');

      /* Direction-based show/hide (disabled while mobile menu is open) */
      if (!document.body.classList.contains('menu-open')) {
        const delta = y - lastScrollY;

        if (Math.abs(delta) > SCROLL_DELTA_MIN) {
          if (delta > 0 && y > HIDE_THRESHOLD) {
            /* Scrolling down past threshold → hide */
            header.classList.add('is-hidden');
          } else if (delta < 0) {
            /* Scrolling up → reveal */
            header.classList.remove('is-hidden');
          }
        }

        /* Near top → always show */
        if (y < 10) header.classList.remove('is-hidden');
      }

      lastScrollY = y;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* -------- Mobile menu (burger) -------- */
  const burger = document.getElementById('burger');
  const navMobile = document.getElementById('navMobile');

  function closeMenu() {
    if (!burger || !navMobile) return;
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    navMobile.classList.remove('is-open');
    navMobile.hidden = true;
    document.body.classList.remove('menu-open');
  }

  function openMenu() {
    if (!burger || !navMobile) return;
    /* Ensure header is visible at current viewport top before opening menu */
    if (header) header.classList.remove('is-hidden');
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    navMobile.hidden = false;
    requestAnimationFrame(() => navMobile.classList.add('is-open'));
    document.body.classList.add('menu-open');
  }

  if (burger && navMobile) {
    burger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (burger.classList.contains('is-open')) closeMenu();
      else openMenu();
    });

    navMobile.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (e) => {
      if (!burger.classList.contains('is-open')) return;
      if (navMobile.contains(e.target) || burger.contains(e.target)) return;
      closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 960) closeMenu();
    });
  }

  /* -------- Scroll reveal (IntersectionObserver) -------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    revealEls.forEach((el, idx) => {
      const delay = (idx % 4) * 90;
      el.style.setProperty('--reveal-delay', delay + 'ms');
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.22, rootMargin: '0px 0px -10% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* -------- Form submit -------- */
  const form = document.getElementById('form-hero');
  if (form) {
    const success = form.querySelector('.form__success');
    const errorBox = form.querySelector('.form__error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameField = form.querySelector('#name');
      const phoneField = form.querySelector('#phone');
      const distanceField = form.querySelector('#distance-meters');
      const photoOutdoorField = form.querySelector('#photo-outdoor');
      const photoIndoorField = form.querySelector('#photo-indoor');
      const messageField = form.querySelector('#message');

      const name = (nameField.value || '').trim();
      const phone = (phoneField.value || '').trim();
      const distanceRaw = (distanceField.value || '').trim();
      const distance = Number(distanceRaw.replace(',', '.'));
      const message = (messageField.value || '').trim();
      if (errorBox) errorBox.hidden = true;

      let valid = true;
      [nameField, phoneField, distanceField, photoOutdoorField, photoIndoorField].forEach(f => f.parentElement.classList.remove('is-error'));

      if (name.length < 2) { nameField.parentElement.classList.add('is-error'); valid = false; }
      const phoneClean = phone.replace(/\s+/g, '');
      if (phoneClean.length < 9 || !/^[+0-9]+$/.test(phoneClean)) {
        phoneField.parentElement.classList.add('is-error');
        valid = false;
      }
      if (distanceRaw && (!Number.isFinite(distance) || distance <= 0)) {
        distanceField.parentElement.classList.add('is-error');
        valid = false;
      }
      if (!valid) {
        const firstErr = form.querySelector('.is-error input, .is-error textarea');
        firstErr && firstErr.focus();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const submitBtnHtml = submitBtn.innerHTML;
      const lang = window.EcoClimaI18n?.getLanguage?.() || 'es';
      const sendingByLang = {
        es: 'Enviando...',
        ca: 'Enviant...',
        en: 'Sending...'
      };
      submitBtn.disabled = true;
      submitBtn.style.opacity = '.7';
      submitBtn.textContent = sendingByLang[lang] || sendingByLang.es;

      if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', {
          event_category: 'form',
          event_label: 'hero_form',
          value: 1
        });
      }

      try {
        const formData = new FormData(form);
        const response = await fetch('/api/lead', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          let errorText = 'No se pudo enviar la solicitud.';
          try {
            const payload = await response.json();
            if (payload?.error) errorText = payload.error;
          } catch (parseError) {
            // Ignore parse errors and keep generic error text.
          }
          throw new Error(errorText);
        }

        form.querySelectorAll('.form__field, button[type="submit"], .form__legal').forEach(el => el.style.display = 'none');
        if (success) success.hidden = false;
      } catch (error) {
        console.error('Lead submit failed:', error);
        if (errorBox) errorBox.hidden = false;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.innerHTML = submitBtnHtml;
      }
    });
  }

  /* -------- Cookie consent -------- */
  const cookieBox = document.getElementById('cookies');
  const COOKIE_KEY = 'ecoclima_cookies_v1';
  if (cookieBox) {
    const stored = localStorage.getItem(COOKIE_KEY);
    if (!stored) {
      setTimeout(() => { cookieBox.hidden = false; }, 1200);
    }
    const accept = document.getElementById('cookiesAccept');
    const reject = document.getElementById('cookiesReject');
    accept && accept.addEventListener('click', () => {
      localStorage.setItem(COOKIE_KEY, 'accepted');
      cookieBox.hidden = true;
    });
    reject && reject.addEventListener('click', () => {
      localStorage.setItem(COOKIE_KEY, 'rejected');
      cookieBox.hidden = true;
    });
  }

  /* -------- Smooth scroll for in-page links -------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* -------- Floating language switcher -------- */
  const langSwitch = document.getElementById('langSwitch');
  if (langSwitch) {
    const langButtons = Array.from(langSwitch.querySelectorAll('.lang-switch__btn'));
    const allowedLangs = ['es', 'ca', 'en'];
    const i18n = window.EcoClimaI18n;

    const setLang = (lang) => {
      const nextLang = allowedLangs.includes(lang) ? lang : 'es';
      if (i18n && typeof i18n.setLanguage === 'function') i18n.setLanguage(nextLang);
      else {
        document.documentElement.setAttribute('lang', nextLang);
        document.documentElement.setAttribute('data-lang', nextLang);
      }

      langButtons.forEach((btn) => {
        const isActive = btn.dataset.lang === nextLang;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    };

    const activeLang = i18n && typeof i18n.getLanguage === 'function'
      ? i18n.getLanguage()
      : (document.documentElement.getAttribute('data-lang') || 'es');
    setLang(activeLang);

    langButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        setLang(btn.dataset.lang || 'es');
      });
    });
  }

  /* -------- Lazy loading fallback -------- */
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (!('loading' in HTMLImageElement.prototype)) {
      img.setAttribute('loading', 'eager');
    }
  });

  /* -------- Scroll-to-top anchor -------- */
  const anchorTop = document.getElementById('anchorTop');
  if (anchorTop) {
    const toggleAnchor = () => {
      if (window.scrollY > 600) {
        anchorTop.hidden = false;
        requestAnimationFrame(() => anchorTop.classList.add('is-visible'));
      } else {
        anchorTop.classList.remove('is-visible');
        setTimeout(() => { if (!anchorTop.classList.contains('is-visible')) anchorTop.hidden = true; }, 250);
      }
    };
    toggleAnchor();
    window.addEventListener('scroll', toggleAnchor, { passive: true });
  }

  /* -------- Zones chips marquee (desktop only) -------- */
  const zonesChips = document.querySelector('.zones .chips--list');
  if (zonesChips) {
    const desktopMq = window.matchMedia('(min-width: 60rem)');
    const originalHtml = zonesChips.innerHTML;

    const enableMarquee = () => {
      if (zonesChips.dataset.marquee === 'on') return;

      const group = document.createElement('div');
      group.className = 'chips-marquee__group';

      while (zonesChips.firstChild) {
        group.appendChild(zonesChips.firstChild);
      }

      const clone = group.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');

      const track = document.createElement('div');
      track.className = 'chips-marquee__track';
      track.appendChild(group);
      track.appendChild(clone);

      zonesChips.appendChild(track);
      zonesChips.dataset.marquee = 'on';
    };

    const disableMarquee = () => {
      if (zonesChips.dataset.marquee !== 'on') return;
      zonesChips.innerHTML = originalHtml;
      zonesChips.dataset.marquee = 'off';
    };

    const syncMarqueeMode = () => {
      if (desktopMq.matches) enableMarquee();
      else disableMarquee();
    };

    syncMarqueeMode();
    if (typeof desktopMq.addEventListener === 'function') {
      desktopMq.addEventListener('change', syncMarqueeMode);
    } else if (typeof desktopMq.addListener === 'function') {
      desktopMq.addListener(syncMarqueeMode);
    }
  }
})();
