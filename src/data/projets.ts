// Ordre et métadonnées des 13 projets (PASSATION § 5.3). Généré depuis les maquettes.
export type ServiceKey = 'cm' | 'audit' | 'graphisme' | 'redac' | 'ugc';
export interface Projet {
  slug: string;
  title: string;
  index: number;
  services: ServiceKey[];
  cover: string;
  coverAlt: string;
}
export const PROJETS: Projet[] = [
  {
    "slug": "medusor",
    "title": "Médusor",
    "index": 1,
    "services": [
      "cm",
      "redac"
    ],
    "cover": "pf-medusor.jpg",
    "coverAlt": "Projet Médusor"
  },
  {
    "slug": "salon-des-peches",
    "title": "Salon des Pêches",
    "index": 2,
    "services": [
      "cm",
      "redac",
      "ugc"
    ],
    "cover": "projet-salon-peches.jpg",
    "coverAlt": "Équipe du Salon des Pêches devant le stand"
  },
  {
    "slug": "liquide-imaginaire",
    "title": "Liquide Imaginaire",
    "index": 3,
    "services": [
      "cm"
    ],
    "cover": "pf-liquide-imaginaire.jpg",
    "coverAlt": "Projet Liquide Imaginaire"
  },
  {
    "slug": "nutraclear",
    "title": "Nutraclear",
    "index": 4,
    "services": [
      "cm",
      "ugc"
    ],
    "cover": "projet-nutraclear.jpg",
    "coverAlt": "Léa présente les compléments Nutraclear"
  },
  {
    "slug": "fitadium",
    "title": "Fitadium",
    "index": 5,
    "services": [
      "cm",
      "audit"
    ],
    "cover": "pf-fitadium.jpg",
    "coverAlt": "Studio de tournage Fitadium"
  },
  {
    "slug": "ap-ressources-humaines",
    "title": "AP Ressources Humaines",
    "index": 6,
    "services": [
      "cm",
      "graphisme",
      "redac"
    ],
    "cover": "pf-ap-rh.jpg",
    "coverAlt": "Goodies réalisés pour AP Ressources Humaines"
  },
  {
    "slug": "oui-a-la-qualite",
    "title": "Oui à la Qualité en Pays de la Loire",
    "index": 7,
    "services": [
      "cm"
    ],
    "cover": "projet-oui-qualite.jpg",
    "coverAlt": "Projet Oui à la Qualité en Pays de la Loire"
  },
  {
    "slug": "aline-lemesle",
    "title": "Aline Lemesle",
    "index": 8,
    "services": [
      "graphisme"
    ],
    "cover": "services-graphisme.jpg",
    "coverAlt": "Carte de visite réalisée pour Aline Lemesle"
  },
  {
    "slug": "yubo",
    "title": "Yubo",
    "index": 9,
    "services": [
      "cm"
    ],
    "cover": "pf-yubo.jpg",
    "coverAlt": "Projet Yubo"
  },
  {
    "slug": "msa",
    "title": "MSA",
    "index": 10,
    "services": [
      "graphisme"
    ],
    "cover": "pf-msa.jpg",
    "coverAlt": "Affiche « La santé mentale des agriculteurs » réalisée pour la MSA"
  },
  {
    "slug": "la-grange-coworking",
    "title": "La Grange Coworking",
    "index": 11,
    "services": [
      "cm",
      "graphisme"
    ],
    "cover": "pf-la-grange.jpg",
    "coverAlt": "Projet La Grange Coworking"
  },
  {
    "slug": "produit-loco",
    "title": "Produit Loco",
    "index": 12,
    "services": [
      "graphisme"
    ],
    "cover": "pf-produit-loco.jpg",
    "coverAlt": "Packaging réalisé pour Produit Loco"
  },
  {
    "slug": "brand-style",
    "title": "Brand Style",
    "index": 13,
    "services": [
      "graphisme"
    ],
    "cover": "pf-brand-style.jpg",
    "coverAlt": "Projet Brand Style"
  }
];
