// Comportements communs à toutes les pages : menu carnet, header collant,
// animations à l'entrée dans l'écran, compteurs, accordéons.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = () => window.matchMedia('(max-width: 720px)').matches;

/* ---------- Menu carnet (M10 à M13) ---------- */
function initMenu() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-menu]');
  const opener = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  if (!dialog || !opener) return;
  const page = dialog.querySelector<HTMLElement>('.mc-page')!;

  const open = () => {
    dialog.showModal();
    opener.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
  };
  const close = () => {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    const done = () => {
      dialog.classList.remove('is-closing');
      dialog.close();
    };
    if (reduceMotion) return done();
    dialog.classList.add('is-closing');
    page.addEventListener('animationend', done, { once: true });
  };
  dialog.addEventListener('close', () => {
    opener.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    opener.focus();
  });
  opener.addEventListener('click', open);
  dialog.querySelector('[data-menu-close]')?.addEventListener('click', close);
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });
  // Clic sur la partie assombrie
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) close();
  });
  // Swipe vers la gauche
  let x0: number | null = null;
  page.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
  page.addEventListener('touchend', (e) => {
    if (x0 !== null && x0 - e.changedTouches[0].clientX > 70) close();
    x0 = null;
  });
  window.addEventListener('resize', () => {
    if (dialog.open && window.innerWidth > 1000) close();
  });
}

/* ---------- Header collant qui se réduit (M1) ---------- */
function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  let ticking = false;
  const update = () => {
    header.classList.toggle('is-small', window.scrollY > 40);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}

/* ---------- Animations à l'entrée dans l'écran ---------- */
function prepareDraw(root: ParentNode) {
  root.querySelectorAll<SVGPathElement>('[data-anim="draw"] path, path[data-anim="draw"]').forEach((p) => p.setAttribute('pathLength', '1'));
}

function indexStaggers(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
    const items = group.querySelectorAll<HTMLElement>('[data-anim]');
    items.forEach((el, i) => {
      if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', String(i));
    });
    const step = group.dataset.stagger;
    if (step) items.forEach((el) => el.style.setProperty('--step', step));
  });
}

let observer: IntersectionObserver | null = null;

export function initAnimations(root: ParentNode = document) {
  prepareDraw(root);
  indexStaggers(root);
  const els = root.querySelectorAll<HTMLElement>('[data-anim]:not(.in)');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    els.forEach(reveal);
    return;
  }
  observer ??= new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      const group = el.closest<HTMLElement>('[data-stagger]');
      const targets = group ? group.querySelectorAll<HTMLElement>('[data-anim]') : [el];
      targets.forEach((t) => {
        reveal(t);
        observer!.unobserve(t);
      });
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  els.forEach((el) => observer!.observe(el));
}

function reveal(el: HTMLElement) {
  el.classList.add('in');
  if (el.dataset.anim === 'count') countUp(el);
}

/* ---------- Compteurs (A11) : « +700 », « +100M »… ---------- */
function countUp(el: HTMLElement) {
  const target = el.dataset.value ?? el.textContent ?? '';
  const m = target.match(/^(\D*)([\d\s ]+)(\D*)$/);
  if (!m || reduceMotion) return;
  const [, pre, num, post] = m;
  const end = parseInt(num.replace(/\D/g, ''), 10);
  const t0 = performance.now();
  const dur = 1400;
  el.dataset.value = target;
  const step = (t: number) => {
    const p = Math.min(1, (t - t0) / dur);
    const v = Math.round(end * (1 - Math.pow(1 - p, 3)));
    el.textContent = `${pre}${v}${post}`;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

/* ---------- Étoiles : parallaxe au scroll sur desktop (A3) ---------- */
function initParallax() {
  const stars = document.querySelectorAll<HTMLElement>('[data-parallax]');
  if (!stars.length || reduceMotion) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    if (isMobile()) return stars.forEach((s) => (s.style.translate = ''));
    const y = window.scrollY;
    stars.forEach((s) => {
      const k = parseFloat(s.dataset.parallax || '0.1');
      s.style.translate = `0 ${(-y * k).toFixed(1)}px`;
    });
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
}

/* ---------- Accordéons : une seule question ouverte à la fois sur mobile (M5) ---------- */
function initAccordions() {
  document.querySelectorAll<HTMLElement>('[data-accordion]').forEach((group) => {
    const items = Array.from(group.querySelectorAll<HTMLDetailsElement>(':scope details, :scope [data-acc-item]'))
      .filter((d): d is HTMLDetailsElement => d instanceof HTMLDetailsElement);
    const mode = group.dataset.accordion; // "mobile" = exclusif seulement sur mobile, "always" = toujours
    items.forEach((d) => {
      d.addEventListener('toggle', () => {
        if (!d.open) return;
        if (mode === 'always' || isMobile()) items.forEach((o) => o !== d && (o.open = false));
      });
    });
    if (group.dataset.firstOpenMobile !== undefined && isMobile() && items[0]) {
      items.forEach((o, i) => (o.open = i === 0));
    }
  });
}

/* ---------- Carrousels : repère de pagination (M7) ---------- */
function initCarousels() {
  document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((track) => {
    const pager = track.parentElement?.querySelector<HTMLElement>('[data-pager]');
    if (!pager) return;
    const dots = Array.from(pager.children) as HTMLElement[];
    const update = () => {
      const items = Array.from(track.children) as HTMLElement[];
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      items.forEach((it, i) => {
        const d = Math.abs(it.offsetLeft + it.offsetWidth / 2 - center);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      dots.forEach((dot, i) => dot.classList.toggle('on', i === best));
      items.forEach((it, i) => it.classList.toggle('is-center', i === best));
    };
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    update();
  });
}

initMenu();
initHeader();
initAnimations();
initParallax();
initAccordions();
initCarousels();
