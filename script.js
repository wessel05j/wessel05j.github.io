(() => {
  'use strict';

  const root = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const motionToggle = document.querySelector('.motion-toggle');
  const systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const save = (key, value) => {
    try { localStorage.setItem(key, value); } catch (_) { /* Preferences still work for this visit. */ }
  };
  const read = (key) => {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  };

  function updateThemeLabel() {
    const light = root.dataset.theme === 'light';
    themeToggle.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    document.querySelector('meta[name="theme-color"]').content = light ? '#f5f7fc' : '#080c13';
  }
  themeToggle.hidden = false;
  updateThemeLabel();
  themeToggle.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    save('jw-theme', root.dataset.theme);
    updateThemeLabel();
  });

  let reduced = root.dataset.motion === 'reduced';
  const portrait = document.querySelector('.portrait-wrap');
  const revealItems = [...document.querySelectorAll('.reveal')];
  let revealObserver;

  function applyMotion() {
    root.dataset.motion = reduced ? 'reduced' : 'full';
    motionToggle.setAttribute('aria-pressed', String(reduced));
    motionToggle.textContent = reduced ? 'Reduced motion on' : 'Reduce motion';
    if (reduced) {
      revealObserver?.disconnect();
      revealItems.forEach(element => element.classList.add('is-visible'));
      portrait.style.setProperty('--portrait-x', '0px');
      portrait.style.setProperty('--portrait-y', '0px');
    } else if (revealObserver) {
      revealItems.filter(element => !element.classList.contains('is-visible')).forEach(element => revealObserver.observe(element));
    }
  }

  if ('IntersectionObserver' in window && !reduced) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -30px 0px' });
    revealItems.forEach(element => {
      // Never hide content that is already in view, including a direct fragment visit.
      const rect = element.getBoundingClientRect();
      if (rect.top < innerHeight && rect.bottom > 0) {
        element.classList.add('is-visible');
      } else {
        element.classList.add('reveal-ready');
        revealObserver.observe(element);
      }
    });
  }
  motionToggle.hidden = false;
  applyMotion();
  motionToggle.addEventListener('click', () => {
    reduced = !reduced;
    save('jw-motion', reduced ? 'reduced' : 'full');
    applyMotion();
    scheduleScroll();
  });
  systemMotion.addEventListener('change', event => {
    if (!read('jw-motion')) {
      reduced = event.matches;
      applyMotion();
      scheduleScroll();
    }
  });

  // A keyboard-operable explanatory workflow. Without JS, every step is readable.
  const tabs = [...document.querySelectorAll('[data-step]')];
  const panels = [...document.querySelectorAll('.workflow-panel')];
  const nextStep = document.querySelector('.workflow-next');
  let currentStep = 0;
  function activateStep(index, focus = false) {
    currentStep = (index + tabs.length) % tabs.length;
    tabs.forEach((tab, i) => {
      const selected = i === currentStep;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
      panels[i].classList.toggle('panel-enter', selected && !reduced);
    });
    if (focus) tabs[currentStep].focus();
    nextStep.innerHTML = currentStep === tabs.length - 1
      ? 'Back to start <span aria-hidden="true">↺</span>'
      : 'Next step <span aria-hidden="true">→</span>';
  }
  panels.forEach((panel, index) => {
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabs[index].id);
    panel.tabIndex = 0;
  });
  document.querySelector('.workflow-tabs').hidden = false;
  nextStep.hidden = false;
  activateStep(0);
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateStep(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = currentStep + 1;
      if (event.key === 'ArrowLeft') next = currentStep - 1;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        activateStep(next, true);
      }
    });
  });
  nextStep.addEventListener('click', () => {
    activateStep(currentStep + 1);
    panels[currentStep].focus({ preventScroll: true });
  });

  // Read scroll geometry once per animation frame; never hijack wheel or touch.
  const chapters = [...document.querySelectorAll('.chapter')];
  const chapterLinks = [...document.querySelectorAll('.chapter-links a')];
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const sections = navLinks.map(link => document.getElementById(link.dataset.nav));
  const viewsCard = document.querySelector('.views-card');
  let viewsProgress = 1;
  let frame = 0;
  const clamp = value => Math.min(1, Math.max(0, value));
  function updateScroll() {
    frame = 0;
    const height = innerHeight;
    const scrollRange = root.scrollHeight - height;
    root.style.setProperty('--reading-progress', String(scrollRange > 0 ? clamp(scrollY / scrollRange) : 0));
    const marker = Math.max(155, height * .38);
    let chapterIndex = 0;
    chapters.forEach((chapter, index) => {
      if (chapter.getBoundingClientRect().top <= marker) chapterIndex = index;
    });
    chapterLinks.forEach((link, index) => {
      if (index === chapterIndex) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    let sectionIndex = -1;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= marker) sectionIndex = index;
    });
    navLinks.forEach((link, index) => {
      if (index === sectionIndex) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    const rect = viewsCard.getBoundingClientRect();
    const target = reduced ? 1 : clamp((height * .96 - rect.top) / Math.max(1, Math.min(rect.height * .85, height * .65)));
    viewsProgress = reduced ? 1 : viewsProgress + (target - viewsProgress) * .15;
    if (Math.abs(target - viewsProgress) < .001) viewsProgress = target;
    viewsCard.style.setProperty('--views-progress', String(viewsProgress));
    if (viewsProgress !== target) scheduleScroll();
  }
  function scheduleScroll() {
    if (!frame) frame = requestAnimationFrame(updateScroll);
  }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  window.addEventListener('pageshow', scheduleScroll);
  document.fonts?.ready.then(scheduleScroll);
  updateScroll();

  // A small response to the pointer gives the portrait depth without continuous motion.
  let pointerFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  portrait.addEventListener('pointermove', event => {
    if (reduced || event.pointerType !== 'mouse') return;
    const rect = portrait.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - .5) * 9;
    pointerY = ((event.clientY - rect.top) / rect.height - .5) * 9;
    if (!pointerFrame) pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      portrait.style.setProperty('--portrait-x', reduced ? '0px' : pointerX.toFixed(2) + 'px');
      portrait.style.setProperty('--portrait-y', reduced ? '0px' : pointerY.toFixed(2) + 'px');
    });
  });
  portrait.addEventListener('pointerleave', () => {
    pointerX = 0;
    pointerY = 0;
    portrait.style.setProperty('--portrait-x', '0px');
    portrait.style.setProperty('--portrait-y', '0px');
  });
})();
