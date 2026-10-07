/**
 * RIDDHI Ayurveda Clinic
 * Native Vanilla Interactions (< 2 KB)
 */
document.addEventListener('DOMContentLoaded', () => {
  // Reveal styles only apply once JS is running, so content never stays hidden
  document.documentElement.classList.add('js-ready');

  // 1. Mobile Navigation Drawer
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  const closeButton = document.querySelector('.menu-close');
  const menuLinks = document.querySelectorAll('.mobile-menu a');
  const mainContent = document.querySelector('main');

  const setMenuState = (isOpen) => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.classList.toggle('is-open', isOpen);
    mobileMenu.hidden = !isOpen;
    document.body.classList.toggle('menu-is-open', isOpen);
    if (mainContent) {
      if (isOpen) {
        mainContent.setAttribute('aria-hidden', 'true');
      } else {
        mainContent.removeAttribute('aria-hidden');
      }
    }
    if (isOpen) {
      closeButton?.focus();
    } else {
      menuButton?.focus();
    }
  };

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const isCurrentlyOpen = menuButton.getAttribute('aria-expanded') === 'true';
      setMenuState(!isCurrentlyOpen);
    });

    closeButton?.addEventListener('click', () => setMenuState(false));

    menuLinks.forEach((link) => {
      link.addEventListener('click', () => setMenuState(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        setMenuState(false);
      }
    });
  }

  // 2. Fixed Navbar Solid Transition (IntersectionObserver on 1px sentinel)
  const sentinel = document.getElementById('top-sentinel');
  const siteHeader = document.querySelector('.site-header');

  if (siteHeader) {
    if (sentinel && 'IntersectionObserver' in window) {
      const navObserver = new IntersectionObserver(([entry]) => {
        siteHeader.classList.toggle('nav--solid', !entry.isIntersecting && entry.boundingClientRect.top <= 0);
      }, { threshold: 0 });
      navObserver.observe(sentinel);
    } else {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            siteHeader.classList.toggle('nav--solid', window.scrollY > 40);
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
  }

  // 3. Scroll Reveal Animations (IntersectionObserver rootMargin: "0px 0px -10% 0px")
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fadeElements = document.querySelectorAll('.fade-in');

  if (prefersReduced || !('IntersectionObserver' in window)) {
    fadeElements.forEach((el) => el.classList.add('is-visible'));
  } else {
    const scrollObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        // also reveal blocks already scrolled past (anchor links, reloads mid-page)
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
          entry.target.addEventListener('transitionend', () => {
            entry.target.style.willChange = 'auto';
          }, { once: true });
        }
      });
    }, {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0
    });

    fadeElements.forEach((el) => {
      if (!el.closest('.hero')) {
        scrollObserver.observe(el);
      }
    });
  }

  // 3b. Hero: scroll-driven opening (full-screen wordmark -> card + headline)
  const heroEl = document.querySelector('.hero');
  const stage = document.querySelector('.hero__stage');
  const wordmark = document.querySelector('.hero__wordmark');
  const rootEl = document.documentElement;

  if (heroEl && stage && wordmark) {
    const mobileQuery = window.matchMedia('(max-width: 52rem)');
    const clamp01 = (v) => Math.min(1, Math.max(0, v));
    const setVar = (name, value) => stage.style.setProperty(name, value);
    let vw = 0;
    let vh = 0;

    // Size the wordmark to span the screen, and work out where it ends up
    const fit = () => {
      vw = heroEl.clientWidth;
      vh = stage.offsetHeight;
      const mobile = mobileQuery.matches;

      setVar('--F', '100px');
      const widthAt100 = wordmark.firstElementChild.offsetWidth || 1;
      const size = (100 * vw) / widthAt100;
      setVar('--F', size.toFixed(1) + 'px');

      const startY = vh - size * 0.315 - Math.max(10, vh * 0.015); // letters sit on the bottom edge
      const endX = mobile ? vw / 2 : vw / 4;
      const endY = mobile ? vh * 0.24 : vh / 2;
      const panelWidth = mobile ? vw : vw / 2;
      const finalWidth = Math.min(300, panelWidth * 0.62);

      setVar('--oy', (startY - vh / 2).toFixed(1) + 'px');
      setVar('--dx', (endX - vw / 2).toFixed(1) + 'px');
      setVar('--dy', (endY - startY).toFixed(1) + 'px');
      setVar('--ks', (1 - finalWidth / vw).toFixed(4));
      setVar('--ix', mobile ? '0px' : (-vw * 0.25).toFixed(1) + 'px');
    };

    // Progress 0..1 comes only from the scroll position, never from a timer
    const update = () => {
      const runway = heroEl.offsetHeight - vh;
      const q = runway > 0 ? -heroEl.getBoundingClientRect().top / runway : 1;
      const p = clamp01(q);
      setVar('--p', p.toFixed(4));
      rootEl.classList.toggle('hero-settled', p >= 0.9);
      rootEl.classList.toggle('hero-past', q >= 1);
    };

    const run = () => { fit(); update(); };

    if (prefersReduced) {
      // No scrubbing: show the final layout straight away
      rootEl.classList.add('hero-static', 'hero-settled', 'hero-past');
      fit();
      setVar('--p', '1');
    } else {
      let ticking = false;
      run();
      if (document.fonts) document.fonts.ready.then(run);
      window.addEventListener('resize', run);
      window.addEventListener('scroll', () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(() => { update(); ticking = false; });
        }
      }, { passive: true });
    }
  }

  // 4. Choreographed Page-Load Intro Timeline
  const hero = document.querySelector('.hero');
  const root = document.documentElement;

  if (prefersReduced) {
    root.classList.remove('is-loading');
    root.classList.add('is-ready', 'intro-completed');
    return;
  }

  if (!hero) {
    root.classList.remove('is-loading');
    root.classList.add('is-ready', 'no-hero', 'intro-completed');
    return;
  }

  // 4s safety fallback
  const fallbackTimer = setTimeout(() => {
    root.classList.remove('is-loading');
    root.classList.add('is-ready');
  }, 4000);

  const heroImage = hero.querySelector('.hero__image');

  // Decode hero image (or Image() preload with fallback)
  const imageDecodePromise = heroImage
    ? (heroImage.complete ? heroImage.decode().catch(() => {}) : new Promise((resolve) => {
        heroImage.addEventListener('load', () => heroImage.decode().catch(() => {}).then(resolve), { once: true });
        heroImage.addEventListener('error', resolve, { once: true });
      }))
    : Promise.resolve();

  // Wait for web fonts ready
  const fontsPromise = document.fonts ? document.fonts.ready.catch(() => {}) : Promise.resolve();

  // 2.5s timeout race so page never hangs
  const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2500));

  Promise.race([
    Promise.all([imageDecodePromise, fontsPromise]),
    timeoutPromise
  ]).then(() => {
    clearTimeout(fallbackTimer);
    root.classList.remove('is-loading');
    root.classList.add('is-ready');

    // Remove will-change after sequence ends
    setTimeout(() => {
      root.classList.add('intro-completed');
    }, 2200);
  });
});
