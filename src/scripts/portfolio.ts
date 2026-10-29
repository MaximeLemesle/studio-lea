// Portfolio : filtres par service (A9, A9b), « Voir plus de projets » (A6) et mur de vidéos UGC.
import { openLightbox } from './fiche';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Les maquettes montrent les 13 projets d'emblée : le bouton « Voir plus de projets »
// ne s'affiche que lorsqu'il y a davantage de projets que ce nombre.
const INITIAL = 13;

const wall = document.querySelector<HTMLElement>('[data-wall]');
const items = Array.from(document.querySelectorAll<HTMLElement>('[data-wall-item]'));
// ordre du portfolio, conservé même quand les cartes sont réparties dans les colonnes
items.forEach((el, i) => (el.dataset.order = String(i)));
const filters = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-filter]'));
const more = document.querySelector<HTMLButtonElement>('[data-more]');
const count = document.querySelector<HTMLElement>('.pf-count');
let filter = 'tous';
let expanded = false;

function visibleFor(el: HTMLElement, i: number) {
  if (filter !== 'tous') return el.dataset.services!.split(' ').includes(filter);
  return expanded || i < INITIAL;
}

function apply(animate: boolean) {
  let shown = 0;
  items.forEach((el, i) => {
    const show = visibleFor(el, i);
    if (show) shown++;
    const hidden = el.hidden;
    if (show && hidden) {
      el.hidden = false;
      if (animate && !reduceMotion() && el.classList.contains('in')) {
        el.classList.remove('is-leaving');
        el.classList.add('is-landing');
        el.addEventListener('animationend', () => el.classList.remove('is-landing'), { once: true });
      }
    } else if (!show && !hidden) {
      if (animate && !reduceMotion()) {
        // les polaroïds hors filtre s'envolent
        el.classList.add('is-leaving');
        el.addEventListener('animationend', () => {
          if (el.classList.contains('is-leaving')) {
            el.hidden = true;
            el.classList.remove('is-leaving');
          }
        }, { once: true });
      } else el.hidden = true;
    }
  });
  if (more) more.parentElement!.hidden = filter !== 'tous' || expanded || items.length <= INITIAL;
  if (count) count.textContent = `${filter === 'tous' ? items.length : shown} projet${(filter === 'tous' ? items.length : shown) > 1 ? 's' : ''}`;
}

/* Répartition à tour de rôle : 3 colonnes sur ordinateur, 2 sur tablette ; sur mobile, la grille simple des maquettes. */
const mq = { mobile: window.matchMedia('(max-width: 720px)'), tablette: window.matchMedia('(max-width: 1100px)') };
let pending = 0;
function columns() {
  if (!wall) return;
  cancelAnimationFrame(pending);
  pending = requestAnimationFrame(() => {
    wall.querySelectorAll('.wall-col').forEach((col) => col.remove());
    const n = mq.mobile.matches ? 0 : mq.tablette.matches ? 2 : 3;
    wall.classList.toggle('is-cols', n > 0);
    if (!n) {
      wall.append(...items);
      return;
    }
    const cols = Array.from({ length: n }, () => {
      const col = document.createElement('div');
      col.className = 'wall-col';
      return col;
    });
    let i = 0;
    items.forEach((el) => cols[el.hidden ? 0 : i++ % n].appendChild(el));
    wall.append(...cols);
  });
}

if (wall) {
  // ?filtre=cm depuis « Voir les projets » de la page Services
  const depuis = filters.find((b) => b.dataset.filter === new URLSearchParams(location.search).get('filtre'));
  if (depuis) {
    filter = depuis.dataset.filter!;
    filters.forEach((b) => b.setAttribute('aria-pressed', String(b === depuis)));
  }
  apply(false);
  columns();
  new MutationObserver(columns).observe(wall, { subtree: true, attributes: true, attributeFilter: ['hidden'] });
  mq.mobile.addEventListener('change', columns);
  mq.tablette.addEventListener('change', columns);
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter!;
      filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      apply(true);
    });
  });
  more?.addEventListener('click', () => {
    expanded = true;
    apply(true);
    items[INITIAL]?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
  });
}

// Mur de vidéos : au survol lecture muette, au clic plein écran avec le son.
// Les vidéos s'activent dès qu'un fichier est renseigné (data-video sur .vid).
document.querySelectorAll<HTMLElement>('.vid[data-video]').forEach((card) => {
  const video = card.querySelector('video');
  if (video) {
    card.addEventListener('mouseenter', () => { if (!reduceMotion()) video.play().catch(() => {}); });
    card.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
  }
  card.addEventListener('click', () => openLightbox(card, [card]));
});
