// XRT project site: carousels, visible-only autoplay, sound toggle, menu, copy, theme, Rerun embeds.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };

  // Theme: follows the system unless the visitor picked one.
  const saved = store.get('xrt-theme');
  if (saved) document.documentElement.dataset.theme = saved;
  $$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', () => {
    const dark = document.documentElement.dataset.theme
      ? document.documentElement.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    const next = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    store.set('xrt-theme', next);
  }));

  // Header border once scrolled; mobile menu.
  const header = $('.site-header');
  const onScroll = () => header && header.classList.toggle('scrolled', scrollY > 4);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const menuBtn = $('.menu-btn'), nav = $('.nav');
  if (menuBtn && nav) menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  // Play a video only while it is on screen and on the active slide.
  const visible = new Set();
  const shouldPlay = (v) => visible.has(v) && !v.closest('.slide:not(.active)') && v.dataset.autoplay !== 'off';
  const sync = (v) => { if (shouldPlay(v)) v.play().catch(() => {}); else v.pause(); };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) { e.isIntersecting ? visible.add(e.target) : visible.delete(e.target); sync(e.target); }
  }, { threshold: 0.35 });
  $$('video[data-autoplay]').forEach((v) => { v.muted = true; v.playsInline = true; io.observe(v); });

  // Sound toggle for clips whose audio carries the contact cues.
  const ICON_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>';
  const ICON_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m23 9-6 6M17 9l6 6"/></svg>';
  $$('video[data-sound]').forEach((v) => {
    const b = document.createElement('button');
    b.className = 'sound-btn'; b.type = 'button';
    const paint = () => {
      b.innerHTML = (v.muted ? ICON_OFF : ICON_ON) + (v.muted ? 'Sound off' : 'Sound on');
      b.setAttribute('aria-label', v.muted ? 'Turn sound on' : 'Turn sound off');
    };
    b.addEventListener('click', () => {
      v.muted = !v.muted;
      if (!v.muted) { v.currentTime = 0; v.play().catch(() => {}); }
      paint();
    });
    paint(); v.parentElement.append(b);
  });

  // Carousels: arrows, keyboard, swipe, "Clip i/n" captions.
  $$('.carousel').forEach((c) => {
    const track = $('.track', c), slides = $$('.slide', c);
    const prev = $('.arrow.prev', c), next = $('.arrow.next', c);
    let i = 0;
    if (slides.length > 1) c.classList.add('multi');
    const go = (k) => {
      i = Math.max(0, Math.min(slides.length - 1, k));
      track.style.transform = `translateX(${-100 * i}%)`;
      slides.forEach((s, j) => {
        s.classList.toggle('active', j === i);
        s.setAttribute('aria-hidden', String(j !== i));
        $$('a, button, video[controls], iframe', s).forEach((el) => { el.tabIndex = j === i ? 0 : -1; });
        if (j !== i) $$('video', s).forEach((v) => { v.pause(); if (v.dataset.sound !== undefined) v.muted = true; });
      });
      $$('video[data-autoplay]', c).forEach(sync);
      $$('.sound-btn', c).forEach((b) => b.dispatchEvent(new Event('repaint')));
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === slides.length - 1;
    };
    if (slides.length < 2) { prev?.remove(); next?.remove(); }
    prev?.addEventListener('click', () => go(i - 1));
    next?.addEventListener('click', () => go(i + 1));
    c.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') go(i - 1);
      if (e.key === 'ArrowRight') go(i + 1);
    });
    let x0 = null;
    c.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    c.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    slides.forEach((s, j) => {
      const cap = $('.cap', s);
      if (cap && slides.length > 1 && !cap.dataset.raw) {
        cap.dataset.raw = cap.textContent;
        cap.textContent = `Clip ${j + 1}/${slides.length}: ${cap.textContent}`;
      }
    });
    go(0);
  });
  // Keep sound labels honest after a slide change mutes a clip.
  $$('.sound-btn').forEach((b) => b.addEventListener('repaint', () => {
    const v = b.parentElement.querySelector('video');
    b.innerHTML = (v.muted ? ICON_OFF : ICON_ON) + (v.muted ? 'Sound off' : 'Sound on');
  }));

  // Copy buttons on code blocks.
  $$('pre[data-copy]').forEach((pre) => {
    const b = document.createElement('button');
    b.className = 'btn copy-btn'; b.type = 'button'; b.textContent = 'Copy';
    b.addEventListener('click', async () => {
      const text = $('code', pre).innerText;
      try { await navigator.clipboard.writeText(text); b.textContent = 'Copied'; }
      catch { b.textContent = 'Select & copy'; }
      setTimeout(() => { b.textContent = 'Copy'; }, 1600);
    });
    pre.append(b);
  });

  // Rerun web viewer, pinned to the version that wrote each recording.
  $$('iframe[data-rrd]').forEach((f) => {
    const rrd = new URL(f.dataset.rrd, location.href).href;
    f.src = `https://app.rerun.io/version/${f.dataset.rerun}/index.html?url=${encodeURIComponent(rrd)}`;
  });
})();
