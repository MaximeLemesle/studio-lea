// Pages Mentions légales et Confidentialité : sommaire replié sur mobile (M5)
// et bouton « Afficher l'adresse email » (PASSATION § 5.6).
import { decodeEmail } from '../lib/email';

const toc = document.querySelector<HTMLDetailsElement>('[data-toc]');
if (toc) {
  const mq = window.matchMedia('(max-width: 720px)');
  const sync = () => (toc.open = !mq.matches);
  sync();
  mq.addEventListener('change', sync);
  // un clic sur une ligne du sommaire mène à la section et referme le post-it sur mobile
  toc.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => { if (mq.matches) toc.open = false; }));
}

const btn = document.querySelector<HTMLButtonElement>('[data-email-btn]');
const holder = document.querySelector<HTMLElement>('[data-email]');
if (btn && holder) {
  btn.addEventListener('click', () => {
    const encoded = holder.dataset.email;
    const link = document.createElement(encoded ? 'a' : 'span');
    if (encoded) {
      const email = decodeEmail(encoded);
      (link as HTMLAnchorElement).href = `mailto:${email}`;
      link.textContent = email;
    } else {
      link.className = 'a-completer';
      link.textContent = 'À compléter';
    }
    link.classList.add('lg-email-link');
    btn.replaceWith(link);
    if (link instanceof HTMLAnchorElement) link.focus();
  });
}
