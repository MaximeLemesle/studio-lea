// Fiches projet (V1 à V7, M20 à M22) et plein écran des exemples (V3, M21).
// Chaque fiche a sa propre URL (/portfolio/<projet>/). Sur le portfolio les 13 fiches
// sont déjà dans la page ; ailleurs (accueil, pages service) la fiche est chargée
// depuis sa page puis ouverte par-dessus la page en cours.

import { initAnimations } from './main';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = () => window.matchMedia('(max-width: 720px)').matches;

// Aperçu hébergé (dossier sans réécriture d'URL) : liens relatifs, pas d'URL par fiche dans l'historique.
const PREVIEW_ROOT = document.documentElement.dataset.root;
const ficheUrl = (slug: string) => (PREVIEW_ROOT !== undefined ? `${PREVIEW_ROOT}portfolio/${slug}/index.html` : `/portfolio/${slug}/`);
const canPush = PREVIEW_ROOT === undefined;

let current: HTMLDialogElement | null = null;
let returnFocus: HTMLElement | null = null;
let urlBeforeOpen: string | null = null;
let titleBeforeOpen = document.title;

const ficheOf = (slug: string) => document.getElementById(`fiche-${slug}`) as HTMLDialogElement | null;

async function loadFiche(slug: string): Promise<HTMLDialogElement | null> {
  const existing = ficheOf(slug);
  if (existing) return existing;
  try {
    const res = await fetch(ficheUrl(slug));
    if (!res.ok) return null;
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const remote = doc.getElementById(`fiche-${slug}`);
    if (!remote) return null;
    // les chemins de la fiche sont relatifs à sa propre page : on les rend absolus
    remote.querySelectorAll<HTMLElement>('[src], [srcset], [href], [data-full]').forEach((el) => {
      for (const attr of ['src', 'href', 'data-full']) {
        const v = el.getAttribute(attr);
        if (v && !v.startsWith('#')) el.setAttribute(attr, new URL(v, res.url).href);
      }
      const set = el.getAttribute('srcset');
      if (set) el.setAttribute('srcset', set.split(',').map((s) => { const [u, ...d] = s.trim().split(/\s+/); return [new URL(u, res.url).href, ...d].join(' '); }).join(', '));
    });
    const fiche = document.importNode(remote, true) as HTMLDialogElement;
    fiche.removeAttribute('open');
    fiche.dataset.title = doc.title;
    document.body.appendChild(fiche);
    initFiche(fiche);
    return fiche;
  } catch {
    return null;
  }
}

/** Projet voisin : dans le filtre actif sur le portfolio, sinon dans l'ordre du portfolio. */
function neighbour(fiche: HTMLDialogElement, dir: 'prev' | 'next'): string | null {
  const wall = document.querySelector<HTMLElement>('[data-wall]');
  const slug = fiche.dataset.fiche!;
  if (wall) {
    const visible = Array.from(wall.querySelectorAll<HTMLElement>('[data-wall-item]:not([hidden])'))
      .sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order)).map((el) => el.dataset.slug!);
    const i = visible.indexOf(slug);
    if (i !== -1 && visible.length > 1) {
      return visible[(i + (dir === 'next' ? 1 : -1) + visible.length) % visible.length];
    }
  }
  return fiche.querySelector<HTMLAnchorElement>(`[data-fiche-nav="${dir}"]`)?.dataset.projet ?? null;
}

export async function openFiche(slug: string, opts: { push?: boolean; trigger?: HTMLElement | null; onglet?: string | null } = {}) {
  const fiche = await loadFiche(slug);
  if (!fiche) {
    window.location.href = ficheUrl(slug);
    return;
  }
  const switching = current && current !== fiche;
  if (current && current !== fiche) {
    current.close();
  }
  if (!switching) {
    returnFocus = opts.trigger ?? (document.activeElement as HTMLElement | null);
    if (urlBeforeOpen === null) {
      urlBeforeOpen = location.pathname.startsWith('/portfolio/') && location.pathname !== '/portfolio/' ? '/portfolio/' : location.pathname + location.search;
      titleBeforeOpen = location.pathname.startsWith('/portfolio/') && location.pathname !== '/portfolio/' ? 'Studio Béa — Portfolio' : document.title;
    }
  }
  current = fiche;
  if (fiche.open && !fiche.matches(':modal')) fiche.close();
  if (!fiche.open) fiche.showModal();
  document.documentElement.style.overflow = 'hidden';
  // Onglet ouvert : celui du service d'où l'on vient (page service ou filtre du portfolio), sinon le premier
  const tab = (opts.onglet && fiche.querySelector<HTMLButtonElement>(`#tab-${slug}-${opts.onglet}`))
    || fiche.querySelector<HTMLButtonElement>('[role="tab"]');
  if (tab && tab.getAttribute('aria-selected') !== 'true') selectTab(tab);
  fiche.scrollTop = 0;
  fiche.querySelector<HTMLElement>('.vbox')?.scrollTo?.(0, 0);
  const title = fiche.dataset.title || `Studio Béa — ${fiche.querySelector('.f-title')?.textContent ?? ''}`;
  document.title = title;
  if (canPush && opts.push !== false && location.pathname !== `/portfolio/${slug}/`) {
    history.pushState({ fiche: slug }, '', `/portfolio/${slug}/`);
  }
  fiche.querySelector<HTMLElement>('[data-fiche-close]')?.focus({ preventScroll: true });
}

export function closeFiche(opts: { push?: boolean } = {}) {
  const fiche = current;
  if (!fiche) return;
  current = null;
  const finish = () => {
    fiche.classList.remove('is-closing');
    if (fiche.open) fiche.close();
    document.documentElement.style.overflow = '';
    document.title = titleBeforeOpen;
    if (canPush && opts.push !== false && urlBeforeOpen !== null) history.pushState({}, '', urlBeforeOpen);
    urlBeforeOpen = null;
    if (returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  };
  finish();
}

function selectTab(tab: HTMLButtonElement, focus = false) {
  const list = tab.closest('[role="tablist"]')!;
  const tabs = Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const fiche = tab.closest('.fiche')!;
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    const panel = fiche.querySelector<HTMLElement>(`#${t.getAttribute('aria-controls')}`);
    if (!panel) return;
    if (on && panel.hidden) {
      panel.hidden = false;
      panel.classList.add('is-entering');
      panel.addEventListener('animationend', () => panel.classList.remove('is-entering'), { once: true });
    } else if (!on) panel.hidden = true;
  });
  if (focus) tab.focus();
}

function initFiche(fiche: HTMLDialogElement) {
  if (fiche.dataset.ready) return;
  fiche.dataset.ready = '1';
  initAnimations(fiche);

  // Onglets (V2, V5 : flèches du clavier)
  fiche.querySelectorAll<HTMLButtonElement>('[role="tab"]').forEach((tab) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => {
      const tabs = Array.from(tab.closest('[role="tablist"]')!.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
      const i = tabs.indexOf(tab);
      let j = -1;
      if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = tabs.length - 1;
      if (j === -1) return;
      e.preventDefault();
      e.stopPropagation();
      selectTab(tabs[j], true);
    });
  });

  fiche.querySelector('[data-fiche-close]')?.addEventListener('click', () => closeFiche());
  fiche.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeFiche();
  });
  // Clic sur le fond assombri
  fiche.addEventListener('click', (e) => {
    if (e.target === fiche) closeFiche();
  });
  // Précédent / Suivant (dans le filtre actif)
  fiche.querySelectorAll<HTMLAnchorElement>('[data-fiche-nav]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const slug = neighbour(fiche, a.dataset.ficheNav as 'prev' | 'next');
      if (slug) openFiche(slug);
    });
  });
  // Flèches du clavier : projet voisin (hors onglets et plein écran)
  fiche.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const t = e.target as HTMLElement;
    if (t.closest('[role="tablist"], input, textarea, .ex-grid')) return;
    const slug = neighbour(fiche, e.key === 'ArrowRight' ? 'next' : 'prev');
    if (slug) openFiche(slug);
  });

  // Mobile : glisser la fiche vers le bas pour fermer, swipe gauche / droite sur la photo (M22)
  const box = fiche.querySelector<HTMLElement>('.vbox')!;
  let y0: number | null = null;
  let x0 = 0;
  let fromCover = false;
  box.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    fromCover = !!(e.target as HTMLElement).closest('.f-cover');
    y0 = box.scrollTop <= 0 || (e.target as HTMLElement).closest('.f-grab') ? t.clientY : null;
    x0 = t.clientX;
  }, { passive: true });
  box.addEventListener('touchmove', (e) => {
    if (y0 === null || reduceMotion()) return;
    const dy = e.touches[0].clientY - y0;
    if (dy > 0 && box.scrollTop <= 0) box.style.translate = `0 ${dy}px`;
  }, { passive: true });
  box.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    const dy = y0 === null ? 0 : t.clientY - y0;
    const dx = t.clientX - x0;
    box.style.translate = '';
    if (dy > 110) {
      closeFiche();
    } else if (fromCover && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      const slug = neighbour(fiche, dx < 0 ? 'next' : 'prev');
      if (slug) openFiche(slug);
    }
    y0 = null;
  });
}

/* ---------- Plein écran des exemples ---------- */
let lightbox: HTMLDialogElement | null = null;
let lbItems: HTMLElement[] = [];
let lbIndex = 0;
let lbReturn: HTMLElement | null = null;

function ensureLightbox() {
  if (lightbox) return lightbox;
  lightbox = document.createElement('dialog');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('aria-label', 'Image en plein écran');
  lightbox.innerHTML = `
    <div class="lb-stage"></div>
    <button class="lb-btn lb-close" type="button" aria-label="Fermer"><svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2 L12 12 M12 2 L2 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"></path></svg>Fermer</button>
    <button class="lb-btn lb-prev" type="button" aria-label="Précédent"><svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true"><path d="M17 7 H2 M7 1 L1 7 L7 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>
    <button class="lb-btn lb-next" type="button" aria-label="Suivant"><svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true"><path d="M1 7 H16 M11 1 L17 7 L11 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></button>
    <p class="lb-count" aria-live="polite"></p>`;
  document.body.appendChild(lightbox);
  lightbox.querySelector('.lb-close')!.addEventListener('click', () => lightbox!.close());
  lightbox.querySelector('.lb-prev')!.addEventListener('click', () => showItem(lbIndex - 1));
  lightbox.querySelector('.lb-next')!.addEventListener('click', () => showItem(lbIndex + 1));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || (e.target as HTMLElement).classList.contains('lb-stage')) lightbox!.close();
  });
  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') showItem(lbIndex - 1);
    if (e.key === 'ArrowRight') showItem(lbIndex + 1);
  });
  lightbox.addEventListener('close', () => {
    lightbox!.querySelector('.lb-stage')!.innerHTML = '';
    lbReturn?.focus({ preventScroll: true });
  });
  let x0 = 0;
  lightbox.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) showItem(lbIndex + (dx < 0 ? 1 : -1));
  });
  return lightbox;
}

function showItem(i: number) {
  if (!lightbox || !lbItems.length) return;
  lbIndex = (i + lbItems.length) % lbItems.length;
  const item = lbItems[lbIndex];
  const stage = lightbox.querySelector('.lb-stage')!;
  stage.innerHTML = '';
  if (item.dataset.video) {
    const v = document.createElement('video');
    v.src = item.dataset.video;
    v.controls = true;
    v.autoplay = true;
    v.playsInline = true;
    stage.appendChild(v);
  } else {
    const img = document.createElement('img');
    img.src = item.dataset.full!;
    img.alt = item.querySelector('img')?.alt ?? '';
    stage.appendChild(img);
  }
  const several = lbItems.length > 1;
  (lightbox.querySelector('.lb-prev') as HTMLElement).hidden = !several;
  (lightbox.querySelector('.lb-next') as HTMLElement).hidden = !several;
  lightbox.querySelector('.lb-count')!.textContent = several ? `${lbIndex + 1} / ${lbItems.length}` : '';
}

export function openLightbox(trigger: HTMLElement, items: HTMLElement[]) {
  const lb = ensureLightbox();
  lbItems = items;
  lbReturn = trigger;
  lb.showModal();
  showItem(Math.max(0, items.indexOf(trigger)));
}

/* ---------- Délégation des clics ---------- */
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const zoom = target.closest<HTMLElement>('[data-zoom]');
  if (zoom) {
    e.preventDefault();
    const scope = zoom.closest('[role="tabpanel"]') ?? zoom.closest('.fiche') ?? document;
    openLightbox(zoom, Array.from(scope.querySelectorAll<HTMLElement>('[data-zoom]')));
    return;
  }
  const link = target.closest<HTMLAnchorElement>('a[data-projet]');
  if (!link || link.closest('.fiche') || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  const filtre = document.querySelector<HTMLElement>('[data-filter][aria-pressed="true"]')?.dataset.filter;
  openFiche(link.dataset.projet!, { trigger: link, onglet: link.dataset.onglet ?? filtre });
});

window.addEventListener('popstate', () => {
  const m = location.pathname.match(/^\/portfolio\/([^/]+)\/$/);
  if (m && ficheOf(m[1])) openFiche(m[1], { push: false });
  else if (current) closeFiche({ push: false });
});

// Fiches présentes dans la page (portfolio) ; ouverture directe sur /portfolio/<projet>/
document.querySelectorAll<HTMLDialogElement>('.fiche').forEach(initFiche);
const initial = document.querySelector<HTMLDialogElement>('.fiche[data-open-on-load]');
if (initial) {
  urlBeforeOpen = '/portfolio/';
  titleBeforeOpen = 'Studio Béa — Portfolio';
  openFiche(initial.dataset.fiche!, { push: false });
}
