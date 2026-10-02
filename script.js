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
});
