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
  (function initStars(){
    const canvas = document.getElementById('bg-stars');
    if (!canvas) return; // Safe exit if canvas is not present

    const ctx = canvas.getContext('2d');
    const NUM_STARS = 120;        // Adjust to taste (performance vs. density)
    const MAX_DPR = 2;            // Cap devicePixelRatio to avoid huge canvases
    let stars = [];
    let w = 0, h = 0;
    let running = true;

    // Respect user preference for reduced motion
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    function handleMotion(e) {
      running = !e.matches;
      if (running) requestAnimationFrame(animate);
    }
    if (media.addEventListener) media.addEventListener('change', handleMotion);
    else if (media.addListener) media.addListener(handleMotion); // Older Safari
    handleMotion(media);

    // Resize canvas and regenerate stars
    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;

      // HiDPI scaling
      const dpr = Math.max(1, Math.min(MAX_DPR, window.devicePixelRatio || 1));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Create stars
      stars = [];
      for (let i = 0; i < NUM_STARS; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.5 + 0.5,  // radius
          vy: Math.random() * 0.3 + 0.05, // vertical speed
          twinkle: Math.random() * 0.5 + 0.5 // twinkle factor
        });
      }
    }

    // Draw all stars
    function draw() {
      ctx.clearRect(0, 0, w, h);
      const t = Date.now() * 0.001;
      for (const s of stars) {
        // Light twinkle using sine wave
        const alpha = 0.7 + Math.sin((t + s.x) * s.twinkle) * 0.3;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Update positions
    function update() {
      for (const s of stars) {
        s.y += s.vy;
        if (s.y > h) {
          s.y = 0;
          s.x = Math.random() * w;
        }
      }
    }

    // Animation loop
    function animate() {
      if (!running) return;
      draw();
      update();
      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();
    if (running) requestAnimationFrame(animate);
  })();

});
/* === Skills: mobile accordion (≤724px) === */
(function skillsAccordionMobile(){
  const BP = 724;
  const tabsWrap   = document.querySelector('.skills__tabs');
  const contentWrap= document.querySelector('.skills__content');
  if (!tabsWrap || !contentWrap) return;

  const headers = Array.from(tabsWrap.querySelectorAll('.skills__header'));
  const panels  = Array.from(contentWrap.querySelectorAll('.skills__group'));

  // crea una mappa header -> panel tramite data-target
  const getPanelForHeader = (header) => {
    const sel = header.dataset.target;
    return sel ? document.querySelector(sel) : null;
  };

  // per padding solo quando aperto, usiamo un inner container
  function ensureInner(panel){
    if (!panel) return null;
    if (!panel.firstElementChild || !panel.firstElementChild.classList.contains('skills__group-inner')){
      const inner = document.createElement('div');
      inner.className = 'skills__group-inner';
      // sposta tutti i figli attuali dentro l'inner
      while (panel.firstChild) inner.appendChild(panel.firstChild);
      panel.appendChild(inner);
      return inner;
    }
    return panel.firstElementChild;
  }

  // apre/chiude con animazione max-height
  function setOpen(panel, open){
    if (!panel) return;
    const inner = ensureInner(panel);
    if (!inner) return;
    if (open){
      panel.style.maxHeight = inner.scrollHeight + 'px';
    } else {
      panel.style.maxHeight = '0px';
    }
  }

  // chiude tutti tranne uno
  function closeOthers(except){
    panels.forEach(p => { if (p !== except) setOpen(p, false); });
    headers.forEach(h => { if (getPanelForHeader(h) !== except) h.classList.remove('skills__active'); });
  }

  // attiva accordion su mobile: sposta i pannelli sotto ai rispettivi header
  function activateMobile(){
    // sposta ogni pannello subito dopo il suo header
    headers.forEach((h) => {
      const p = getPanelForHeader(h);
      if (!p) return;
      if (p.previousElementSibling !== h){ // evita di rispostare ogni volta
        h.insertAdjacentElement('afterend', p);
      }
      // stato iniziale: apri solo quello con header .skills__active
      const isActive = h.classList.contains('skills__active');
      setOpen(p, isActive);
    });

    // click/tastiera: toggle tenda sotto l'header
    headers.forEach((h) => {
      if (h.__accordionBound) return; // bind una sola volta
      const handler = (e) => {
        if (e.type === 'keydown' && !(e.key === 'Enter' || e.key === ' ')) return;
        if (e.type === 'keydown') e.preventDefault();

        const p = getPanelForHeader(h);
        if (!p) return;

        const willOpen = p.style.maxHeight === '0px' || !p.style.maxHeight;
        closeOthers(p);
        h.classList.toggle('skills__active', willOpen);
        setOpen(p, willOpen);
        // scroll leggero per vedere l'inizio del pannello
        if (willOpen) h.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      };
      h.addEventListener('click', handler);
      h.addEventListener('keydown', handler);
      h.setAttribute('tabindex','0');
      h.__accordionBound = true;
    });
  }

  // ripristina desktop: rimette i pannelli dentro .skills__content
  function activateDesktop(){
    // rimetti i pannelli nell'ordine originale
    panels.forEach(p => contentWrap.appendChild(p));
    // lascia gestire l'apertura/chiusura al tuo codice tabs esistente (classe skills__active)
    // e rimuovi max-height inline (così le altezze tornano naturali)
    panels.forEach(p => { p.style.maxHeight = ''; });
  }

  function onResize(){
    const isMobile = window.innerWidth <= BP;
    if (isMobile) activateMobile(); else activateDesktop();
  }

  window.addEventListener('resize', onResize, { passive: true });
  onResize(); // stato iniziale
})();
