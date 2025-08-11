/* =========================================================
   SARA ROSATI — SINGLE SCRIPT FILE
   Features:
   - Skills tabs (click + keyboard)
   - Portfolio filters (All/Web/App)
   - Project details toggle
   - Scroll spy (highlight nav links on scroll)
   - Full-screen "starry sky" background (respects prefers-reduced-motion)
   ========================================================= */

/* Run everything when the DOM is ready */
document.addEventListener('DOMContentLoaded', () => {

  /* =========================
     SKILLS TABS
     =========================
     - Click or Enter/Space to activate a tab
     - Uses [data-target] on tabs and [data-content] on panels
  */
  (function initSkillsTabs(){
    const tabs = document.querySelectorAll('[data-target]');
    const panels = document.querySelectorAll('[data-content]');

    if (!tabs.length || !panels.length) return;

    function activateTab(tab){
      const targetSel = tab.dataset.target;
      const target = targetSel ? document.querySelector(targetSel) : null;
      if (!target) return;

      // Deactivate panels + tabs
      panels.forEach(p => p.classList.remove('skills__active'));
      tabs.forEach(t => t.classList.remove('skills__active'));

      // Activate current
      target.classList.add('skills__active');
      tab.classList.add('skills__active');
    }

    tabs.forEach(tab => {
      // Mouse
      tab.addEventListener('click', () => activateTab(tab));
      // Keyboard accessibility
      tab.setAttribute('tabindex', '0');
      tab.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activateTab(tab);
        }
      });
    });
  })();


  /* =========================
     PORTFOLIO FILTERS
     =========================
     - Filters .work__card by data-category
     - Buttons have .work__item + data-filter="all|web|app"
  */
  (function initWorkFilters(){
    const filterButtons = document.querySelectorAll('.work__item');
    const cards = document.querySelectorAll('.work__card');
    if (!filterButtons.length || !cards.length) return;

    function applyFilter(value){
      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        const show = (value === 'all' || value === cat);
        card.style.display = show ? 'block' : 'none';
      });
    }

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active-work'));
        btn.classList.add('active-work');
        applyFilter(btn.getAttribute('data-filter') || 'all');
      });
    });
  })();


  /* =========================
     PROJECT DETAILS TOGGLE
     =========================
     - Each .work__button toggles its next sibling .portfolio__item-details
     - Click outside to close all
  */
  (function initPortfolioDetails(){
    const buttons = document.querySelectorAll('.work__button');
    if (!buttons.length) return;

    function closeAllExcept(except){
      document.querySelectorAll('.portfolio__item-details').forEach(d => {
        if (d !== except) d.style.display = 'none';
      });
    }

    buttons.forEach(btn => {
      const toggle = () => {
        const details = btn.nextElementSibling;
        if (!details) return;
        const willOpen = details.style.display !== 'block';
        closeAllExcept(details);
        details.style.display = willOpen ? 'block' : 'none';
      };

      // Mouse
      btn.addEventListener('click', toggle);
      // Keyboard
      btn.setAttribute('tabindex', '0');
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      const isBtn = e.target.closest('.work__button');
      const isDetails = e.target.closest('.portfolio__item-details');
      if (!isBtn && !isDetails) {
        document.querySelectorAll('.portfolio__item-details').forEach(d => d.style.display = 'none');
      }
    });
  })();


  /* =========================
     SCROLL SPY (active nav link)
     =========================
     - Highlights .nav__link matching the section in viewport
     - Uses rAF to throttle scroll handling
  */
  (function initScrollSpy(){
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    let ticking = false;

    function updateActive(){
      const scrollY = window.pageYOffset;

      sections.forEach(sec => {
        const h = sec.offsetHeight;
        const top = sec.offsetTop - 50; // offset so it activates a bit earlier
        const id = sec.getAttribute('id');
        const link = document.querySelector('.nav__link[href*=' + id + ']');
        if (!link) return;

        if (scrollY > top && scrollY <= top + h) {
          link.classList.add('active-link');
        } else {
          link.classList.remove('active-link');
        }
      });

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateActive);
        ticking = true;
      }
    }, { passive: true });

    // Initial state
    updateActive();
  })();


  /* =========================
     STARRY SKY BACKGROUND
     =========================
     - Draws white stars on a fixed canvas (#bg-stars)
     - Stars drift down slowly and twinkle a bit
     - Respects prefers-reduced-motion
     - Handles HiDPI (retina) scaling to keep stars crisp
  */
/*========== STARRY SKY — twinkle + gentle drift, no trails ==========*/
(function initStarsMovingNoTrails(){
  const canvas = document.getElementById('bg-stars');
  if (!canvas) return;
  if (canvas.__starsInit) return; // evita doppie init
  canvas.__starsInit = true;

  const ctx = canvas.getContext('2d', { alpha: true });
  let stars = [];
  const NUM_STARS = 120;
  const MAX_DPR = 2;
  let w = 0, h = 0, dpr = 1;
  let rafId = null;
  let lastT = 0;

  // Rispetta prefers-reduced-motion
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let running = !media.matches;
  if (media.addEventListener) media.addEventListener('change', () => {
    running = !media.matches;
    if (running && !rafId) rafId = requestAnimationFrame(draw);
  });

  // Piccolo helper per random in range
  const rand = (min, max) => Math.random() * (max - min) + min;

  function makeStars(){
    stars = [];
    for (let i = 0; i < NUM_STARS; i++){
      const speed = rand(0.005, 0.03);      // px/ms circa (molto lento)
      const angle = rand(-0.25, 0.25);      // drift quasi verticale
      const vx = Math.sin(angle) * speed;
      const vy = Math.cos(angle) * speed;

      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.5,       // raggio
        tw: Math.random() * 0.6 + 0.4,      // fattore twinkle
        vx, vy
      });
    }
  }

  function sizeCanvas(){
    const vw = (window.visualViewport && window.visualViewport.width)  || window.innerWidth;
    const vh = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
    w = vw; h = vh;
    dpr = Math.max(1, Math.min(MAX_DPR, window.devicePixelRatio || 1));

    const newW = Math.floor(w * dpr);
    const newH = Math.floor(h * dpr);

    // ridimensiona solo se cambia davvero (evita rigenerazioni continue su mobile)
    if (canvas.width !== newW || canvas.height !== newH){
      canvas.width  = newW;
      canvas.height = newH;
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeStars();
    }
  }

  // debounce del resize (utile su mobile)
  let resizeTimer = null;
  function onResize(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(sizeCanvas, 80);
  }

  function draw(ts){
    rafId = null;
    if (!running) return;

    if (!lastT) lastT = ts;
    const dt = Math.min(50, ts - lastT); // clamp per salti di tempo
    lastT = ts;

    // PULIZIA COMPLETA: niente accumulo/scie
    ctx.clearRect(0, 0, w, h);

    const t = ts * 0.001;
    for (const s of stars){
      // Aggiorna posizione con delta time (ms -> px via vx/vy)
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      // Wrap ai bordi (riappare dal lato opposto)
      if (s.x < -2) s.x = w + 2;
      else if (s.x > w + 2) s.x = -2;
      if (s.y < -2) s.y = h + 2;
      else if (s.y > h + 2) s.y = -2;

      // Twinkle (opacità che varia nel tempo)
      const alpha = 0.65 + Math.sin((t + s.x * 0.01) * s.tw) * 0.35;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = requestAnimationFrame(draw);
  }

  // Eventi
  window.addEventListener('resize', onResize, { passive: true });
  if (window.visualViewport){
    window.visualViewport.addEventListener('resize', onResize, { passive: true });
  }
  document.addEventListener('visibilitychange', () => {
    // pausa quando la tab è nascosta (risparmia batteria, nessun backlog)
    if (document.hidden){
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      lastT = 0;
    } else {
      if (!rafId && running) rafId = requestAnimationFrame(draw);
    }
  });

  // Avvio
  sizeCanvas();
  if (running) rafId = requestAnimationFrame(draw);
})();



});
/**/ 
/* ===== SKILLS — FAQ-style accordion on small screens (<=724px) ===== */
(function skillsFaqAccordion(){
  const BP = 724;
  const tabsWrap    = document.querySelector('.skills__tabs');
  const contentWrap = document.querySelector('.skills__content');
  if (!tabsWrap || !contentWrap) return;

  const headers = Array.from(tabsWrap.querySelectorAll('.skills__header'));
  const panels  = Array.from(contentWrap.querySelectorAll('.skills__group'));

  // Map header -> panel using the original data-target (preservato in __targetSel)
  const panelFor = (header) => {
    const sel = header.__targetSel || header.getAttribute('data-target');
    return sel ? document.querySelector(sel) : null;
  };

  // Ensure inner wrapper so padding doesn't break height calc
  function ensureInner(panel){
    if (!panel) return null;
    let inner = panel.querySelector('.skills__group-inner');
    if (!inner){
      inner = document.createElement('div');
      inner.className = 'skills__group-inner';
      while (panel.firstChild) inner.appendChild(panel.firstChild);
      panel.appendChild(inner);
    }
    return inner;
  }

  // Open/close with measured height
  function setOpen(panel, open){
    const inner = ensureInner(panel);
    if (!inner) return;
    if (open){
      panel.classList.add('is-open');
      panel.style.maxHeight = inner.scrollHeight + 'px';
    } else {
      panel.classList.remove('is-open');
      panel.style.maxHeight = '0px';
    }
  }

  function closeOthers(exceptPanel){
    panels.forEach(p => { if (p !== exceptPanel) setOpen(p, false); });
    headers.forEach(h => {
      const p = panelFor(h);
      if (p !== exceptPanel) h.classList.remove('skills__open');
    });
  }

  // Temporarily disable tabs behavior on mobile (prevents double-click feel)
  function deactivateTabsOnMobile(){
    headers.forEach(h => {
      if (!h.__targetSel) h.__targetSel = h.getAttribute('data-target');
      h.removeAttribute('data-target');
    });
  }
  function restoreTabsOnDesktop(){
    headers.forEach(h => {
      if (h.__targetSel) h.setAttribute('data-target', h.__targetSel);
    });
  }

  function activateMobile(){
    deactivateTabsOnMobile();

    headers.forEach((h, idx) => {
      const p = panelFor(h);
      if (!p) return;

      // Make sure the panel is visible on mobile (base CSS may hide it)
      p.style.display = 'block';

      // Move panel right after its header (once)
      if (p.previousElementSibling !== h) h.insertAdjacentElement('afterend', p);

      // Initial state: open only the first
      const open = idx === 0;
      h.classList.toggle('skills__open', open);
      setOpen(p, open);

      // Bind once
      if (h.__faqBound) return;
      const toggle = (e) => {
        // One-click behavior: stop old handlers & default
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'keydown' && !(e.key === 'Enter' || e.key === ' ')) return;

        const panel = panelFor(h);
        if (!panel) return;

        const willOpen = !(panel.classList.contains('is-open') && panel.style.maxHeight !== '0px');
        closeOthers(panel);
        h.classList.toggle('skills__open', willOpen);
        setOpen(panel, willOpen);
        //if (willOpen) h.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      h.addEventListener('click', toggle);
      h.addEventListener('keydown', toggle);
      h.setAttribute('tabindex','0');
      h.__faqBound = true;
    });
  }

  function activateDesktop(){
    restoreTabsOnDesktop();
    // Put panels back into .skills__content (original layout)
    panels.forEach(p => {
      contentWrap.appendChild(p);
      p.style.maxHeight = '';
      p.classList.remove('is-open');
      p.style.display = ''; // reset for desktop tabs layout
    });
    headers.forEach(h => h.classList.remove('skills__open'));
  }

  function onResize(){
    if (window.innerWidth <= BP) activateMobile();
    else activateDesktop();
  }

  window.addEventListener('resize', onResize, { passive: true });
  onResize(); // initial
})();