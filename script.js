/**
 * RIDDHI Ayurveda Clinic
 * Lightweight Vanilla Interactions (< 2 KB)
 */
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Menu
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

  // Content Fade-in with 16px Rise via IntersectionObserver
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fadeElements = document.querySelectorAll('.fade-in');

  if (prefersReduced || !('IntersectionObserver' in window)) {
    fadeElements.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    });

    fadeElements.forEach((el) => observer.observe(el));
  }

  // Valar-Style Intro Animation Transition on Scroll
  const introBackdrop = document.getElementById('intro-backdrop');
  const introWordmark = document.querySelector('.intro-wordmark');
  const brandWordmark = document.querySelector('.site-header .brand-wordmark');

  if (introBackdrop && introWordmark && brandWordmark) {
    const hasHash = window.location.hash && window.location.hash !== '#top';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (hasHash || prefersReducedMotion) {
      document.documentElement.classList.remove('has-intro');
      document.documentElement.classList.add('intro-done');
      introBackdrop.style.display = 'none';
    } else {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);

      let isTransitioning = false;
      let isIntroDone = false;

      const runTransition = () => {
        if (isTransitioning || isIntroDone) return;
        isTransitioning = true;

        const brandRect = brandWordmark.getBoundingClientRect();
        const introRect = introWordmark.getBoundingClientRect();

        const brandCenterX = brandRect.left + brandRect.width / 2;
        const brandCenterY = brandRect.top + brandRect.height / 2;

        const introCenterX = introRect.left + introRect.width / 2;
        const introCenterY = introRect.top + introRect.height / 2;

        const deltaX = brandCenterX - introCenterX;
        const deltaY = brandCenterY - introCenterY;

        const brandFontSize = parseFloat(window.getComputedStyle(brandWordmark).fontSize) || 29.6;
        const introFontSize = parseFloat(window.getComputedStyle(introWordmark).fontSize) || 64;
        const scale = brandFontSize / introFontSize;

        introWordmark.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;

        document.documentElement.classList.remove('has-intro');
        document.documentElement.classList.add('intro-transitioning');

        let lockScroll = true;
        const keepAtTop = () => {
          if (lockScroll) window.scrollTo(0, 0);
        };
        window.addEventListener('scroll', keepAtTop, { passive: true });

        setTimeout(() => {
          lockScroll = false;
          window.removeEventListener('scroll', keepAtTop);
          isIntroDone = true;
          isTransitioning = false;
          document.documentElement.classList.remove('intro-transitioning');
          document.documentElement.classList.add('intro-done');
          introBackdrop.style.display = 'none';
        }, 1250);
      };

      window.addEventListener('wheel', (e) => {
        if (e.deltaY > 0) runTransition();
      }, { passive: true });

      let touchStartY = 0;
      window.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches[0]) {
          const deltaY = touchStartY - e.touches[0].clientY;
          if (deltaY > 6) runTransition();
        }
      }, { passive: true });

      window.addEventListener('scroll', () => {
        if (window.scrollY > 0) runTransition();
      }, { passive: true });

      window.addEventListener('keydown', (e) => {
        if (['ArrowDown', 'PageDown', ' ', 'ArrowRight', 'End'].includes(e.key)) {
          runTransition();
        }
      });

      introBackdrop.addEventListener('click', runTransition);
    }
  }
});

