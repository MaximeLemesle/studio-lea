// Données communes du site (navigation, réseaux, couleurs de service).

export const NAV = [
  { key: 'accueil', label: 'Accueil', href: '/', color: '#F4D3B8' },
  { key: 'services', label: 'Services', href: '/services/', color: '#F2E3A0' },
  { key: 'portfolio', label: 'Portfolio', href: '/portfolio/', color: '#EFC9D2' },
  { key: 'a-propos', label: 'À propos', href: '/a-propos/', color: '#CFE3C4' },
] as const;

export const SOCIAL = {
  instagram: 'https://www.instagram.com/lesaleaas/',
  linkedin: 'https://www.linkedin.com/in/l%C3%A9a-audouin/',
};

export const SERVICES = [
  { key: 'cm', label: 'Community management', short: 'Community management', href: '/services/community-management/', color: '#F2E3A0' },
  { key: 'audit', label: 'Audit stratégique', short: 'Audit stratégique', href: '/services/audit-strategique/', color: '#C9D6EC' },
  { key: 'graphisme', label: 'Graphisme print et digital', short: 'Graphisme', href: '/services/graphisme/', color: '#EFC9D2' },
  { key: 'redac', label: 'Rédactionnel', short: 'Rédactionnel', href: '/services/redactionnel/', color: '#CFE3C4' },
  { key: 'ugc', label: 'UGC', short: 'UGC', href: '/services/ugc/', color: '#F4D3B8' },
] as const;

/** Texte affiché à la place d'un contenu que Léa doit encore fournir. */
export const A_COMPLETER = 'À compléter';

/** Témoignages (accueil et « Le mot de mes clients » des pages service) : masqués tant qu'ils ne sont pas fournis.
 *  Passer à true pour les réafficher. */
export const AFFICHER_TEMOIGNAGES = false;
