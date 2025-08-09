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
/**/ 
/* ===== SKILLS — FAQ-style accordion on small screens (<=724px) ===== */
(function skillsFaqAccordion(){
  const BP = 724;
  const tabsWrap    = document.querySelector('.skills__tabs');
  const contentWrap = document.querySelector('.skills__content');
  if (!tabsWrap || !contentWrap) return;

  const headers = Array.from(tabsWrap.querySelectorAll('.skills__header'));
  const panels  = Array.from(contentWrap.querySelectorAll('.skills__group'));

  const panelFor = (header) => {
    const sel = header.__targetSel || header.getAttribute('data-target');
    return sel ? document.querySelector(sel) : null;
  };

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

  function deactivateTabsOnMobile(){
    // Temporarily remove data-target so il vecchio handler non scatta
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

      // Metti il pannello subito dopo il suo header (una volta sola)
      if (p.previousElementSibling !== h) h.insertAdjacentElement('afterend', p);

      // Stato iniziale: apri solo il primo
      const open = idx === 0;
      h.classList.toggle('skills__open', open);
      setOpen(p, open);

      if (h.__faqBound) return;
      const toggle = (e) => {
        // Evita che i vecchi listener reagiscano
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'keydown' && !(e.key === 'Enter' || e.key === ' ')) return;

        const panel = panelFor(h);
        if (!panel) return;

        const willOpen = !(panel.classList.contains('is-open') && panel.style.maxHeight !== '0px');
        closeOthers(panel);
        h.classList.toggle('skills__open', willOpen);
        setOpen(panel, willOpen);
        if (willOpen) h.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      h.addEventListener('click', toggle);
      h.addEventListener('keydown', toggle);
      h.setAttribute('tabindex','0');
      h.__faqBound = true;
    });
  }

  function activateDesktop(){
    restoreTabsOnDesktop();
    // Rimetti i pannelli dentro .skills__content (layout originale)
    panels.forEach(p => {
      contentWrap.appendChild(p);
      p.style.maxHeight = '';
      p.classList.remove('is-open');
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
