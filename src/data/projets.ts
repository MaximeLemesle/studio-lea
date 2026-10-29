// Ordre et métadonnées des 13 projets (PASSATION § 5.3). Généré depuis les maquettes.
export type ServiceKey = 'cm' | 'audit' | 'graphisme' | 'redac' | 'ugc';
export interface Projet {
  slug: string;
  title: string;
  index: number;
  services: ServiceKey[];
  cover: string;
  coverAlt: string;
  /** Description pour Google : première phrase de « Ce que j'ai fait ». */
  description: string;
}
export const PROJETS: Projet[] = [
  {
    "slug": "salon-des-peches",
    "title": "Salon des Pêches",
    "index": 1,
    "services": [
      "cm",
      "redac",
      "ugc"
    ],
    "cover": "projet-salon-peches.jpg",
    "coverAlt": "Équipe du Salon des Pêches devant le stand",
    "description": "J'ai géré les réseaux sociaux de deux salons différents : le Salon des Pêches de Royan et celui de Saint-Étienne."
  },
  {
    "slug": "nutraclear",
    "title": "Nutraclear",
    "index": 2,
    "services": [
      "cm",
      "ugc"
    ],
    "cover": "projet-nutraclear.jpg",
    "coverAlt": "Léa présente les compléments Nutraclear",
    "description": "J'ai géré les réseaux sociaux de Nutraclear sur Facebook, LinkedIn, Instagram et TikTok."
  },
  {
    "slug": "aline-lemesle",
    "title": "Aline Lemesle",
    "index": 3,
    "services": [
      "graphisme"
    ],
    "cover": "services-graphisme.jpg",
    "coverAlt": "Carte de visite réalisée pour Aline Lemesle",
    "description": "J'ai créé la carte de visite d'Aline Lemesle, à son image, prête à imprimer."
  },
  {
    "slug": "medusor",
    "title": "Médusor",
    "index": 4,
    "services": [
      "cm",
      "redac"
    ],
    "cover": "pf-medusor.jpg",
    "coverAlt": "Projet Médusor",
    "description": "J'ai pris en charge la communication B2B sur LinkedIn."
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
    "coverAlt": "Studio de tournage Fitadium",
    "description": "J'ai co-géré la communication de Fitadium sur Instagram, TikTok, LinkedIn et Facebook."
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
    "coverAlt": "Goodies réalisés pour AP Ressources Humaines",
    "description": "J'ai géré les réseaux sociaux d'AP Ressources Humaines sur Instagram et LinkedIn : création des contenus, planification et publication."
  },
  {
    "slug": "oui-a-la-qualite",
    "title": "Oui à la Qualité en Pays de la Loire",
    "index": 7,
    "services": [
      "cm"
    ],
    "cover": "projet-oui-qualite.jpg",
    "coverAlt": "Projet Oui à la Qualité en Pays de la Loire",
    "description": "J'ai animé les réseaux sociaux de Oui à la Qualité en Pays de la Loire sur Instagram, Facebook et LinkedIn : création des contenus, planification et publication."
  },
  {
    "slug": "msa",
    "title": "MSA",
    "index": 8,
    "services": [
      "graphisme"
    ],
    "cover": "pf-msa.jpg",
    "coverAlt": "Affiche « La santé mentale des agriculteurs » réalisée pour la MSA",
    "description": "J'ai réalisé une infographie sur la santé mentale des agriculteurs."
  },
  {
    "slug": "produit-loco",
    "title": "Produit Loco",
    "index": 9,
    "services": [
      "graphisme"
    ],
    "cover": "pf-produit-loco.jpg",
    "coverAlt": "Packaging réalisé pour Produit Loco",
    "description": "J'ai créé toute l'identité visuelle de Produit Loco et ses déclinaisons : affiche, flyer, kakemono, magazine et cartes de visite."
  },
  {
    "slug": "liquide-imaginaire",
    "title": "Liquide Imaginaire",
    "index": 10,
    "services": [
      "cm"
    ],
    "cover": "pf-liquide-imaginaire.jpg",
    "coverAlt": "Projet Liquide Imaginaire",
    "description": "J'ai géré les réseaux sociaux de Liquide Imaginaire en anglais."
  },
  {
    "slug": "yubo",
    "title": "Yubo",
    "index": 11,
    "services": [
      "cm"
    ],
    "cover": "pf-yubo.jpg",
    "coverAlt": "Projet Yubo",
    "description": "J'ai géré la communication de marque employeur de Yubo sur LinkedIn."
  },
  {
    "slug": "la-grange-coworking",
    "title": "La Grange Coworking",
    "index": 12,
    "services": [
      "cm",
      "graphisme"
    ],
    "cover": "pf-la-grange.jpg",
    "coverAlt": "Projet La Grange Coworking",
    "description": "J'ai géré les réseaux sociaux de La Grange Coworking sur Instagram et Facebook : création des contenus, planification et publication."
  },
  {
    "slug": "brand-style",
    "title": "Brand Style",
    "index": 13,
    "services": [
      "graphisme"
    ],
    "cover": "pf-brand-style.jpg",
    "coverAlt": "Projet Brand Style",
    "description": "J'ai créé l'identité visuelle du jeu de cartes Brand Style : logo, couleurs et déclinaisons."
  }
];
