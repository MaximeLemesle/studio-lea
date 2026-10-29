# Studio Béa — site vitrine

Site de **Léa Audouin**, freelance en communication à Angers, codé à partir des maquettes validées (dossier de passation).

- **Technologie** : [Astro](https://astro.build), qui génère un site 100 % statique (HTML, CSS, très peu de JavaScript).
- **Hébergement prévu** : Hostinger (offre « hébergement web »), déjà cité dans les mentions légales.
- **Formulaire de contact** : petit script PHP sur l'hébergement (`public/api/contact.php`), sans service tiers.

## Lancer le site sur un ordinateur

Il faut [Node.js](https://nodejs.org) 20 ou plus.

```sh
npm install
npm run dev       # aperçu sur http://localhost:4321
npm run build     # génère le site final dans dist/
```

Le formulaire de contact a besoin de PHP : il ne répond pas dans l'aperçu `npm run dev`.

## Mettre en ligne chez Hostinger

1. Créer `.env` à partir de `.env.example` et y mettre l'adresse email de Léa (`CONTACT_EMAIL=…`).
   Elle sert au bouton « Afficher l'adresse email » et n'apparaît jamais en clair dans les pages.
2. `npm run build`
3. Envoyer **le contenu** du dossier `dist/` dans `public_html/` (gestionnaire de fichiers Hostinger ou FTP).
   Les fichiers `.htaccess` sont inclus : HTTPS obligatoire, page 404, cache et compression.
4. Sur le serveur, copier `public_html/api/config.example.php` en `public_html/api/config.php` et le remplir :
   adresse de réception, adresse d'expédition sur le nom de domaine, identifiants SMTP de la boîte mail Hostinger.
   Ce fichier n'est jamais publié dans le dépôt et n'est pas accessible depuis le web.
5. Brancher le nom de domaine dans hPanel, activer le certificat SSL (gratuit), puis déclarer le site dans Google Search Console.

## Organisation du code

| Dossier | Contenu |
|---|---|
| `src/pages/` | Une page par URL (`/`, `/services/…`, `/portfolio/…`, `/a-propos/`, `/contact/`, pages légales, 404). |
| `src/components/` | Header, menu carnet mobile, footer, logo, image optimisée, page portfolio. |
| `src/components/projets/` | Les 13 fiches projet. Chaque fiche a sa propre URL `/portfolio/<projet>/`. |
| `src/data/projets.ts` | Ordre et métadonnées des projets. |
| `src/styles/` | `base.css` (styles communs des maquettes), `global.css` (header, footer, menu, animations, mobile), une feuille par page. |
| `src/scripts/` | Animations, menu, fiches projet et plein écran, portfolio, formulaire, pages légales. |
| `src/assets/img/` | Images du site (converties automatiquement en AVIF/WebP à plusieurs tailles). |
| `public/api/` | Envoi du formulaire (PHP). |
| `tools/` | Scripts Python ayant servi à convertir les maquettes en pages (une seule fois). |

Les textes viennent tels quels des maquettes. Quand une maquette mobile a un texte différent du desktop, les deux versions sont dans la page (`.d-only` / `.m-only`).
Les animations respectent « réduire les animations » du système : le contenu reste alors à son état final.

Les emplacements d'un contenu manquant affichent **« À compléter »** (classe `.a-completer`).

## Prochaine étape : ce que Léa doit fournir ou valider

**Contenus manquants (affichés « À compléter »)**
- Adresse email (bouton protégé des mentions légales et réception du formulaire).
- Vidéos UGC : portfolio (Salon des Pêches, Nutraclear, Albom), page UGC (2 polaroïds du haut, 2 projets) et vidéo Mélatonine de la fiche Nutraclear (repère rouge « vidéo à mettre dans github »).
- Témoignages : 3 sur l'accueil, 1 « Le mot de mes clients » par page service.
- Photo de la plaquette de La Grange Coworking.
- Date de mise en ligne (mentions légales et confidentialité) et crédits photo éventuels.

**Textes à valider (absents des maquettes)**
- Page 404.
- Titres d'onglet et descriptions des pages pour Google.
- Libellés lus par les lecteurs d'écran : « Aller au contenu », « Retirer <fichier> », « Agrandir : <description> ».

**À fournir plus tard (gardé en mémoire)**
- Liens des posts manquants : Liquide Imaginaire, Oui à la Qualité, Yubo, AP Ressources Humaines ; lien du reel Royan (t-shirt) à confirmer.
- Nom de domaine, accès Hostinger.

**Décisions prises**
- « +6 050 abonnés » : gardé sur l'accueil uniquement.
- « en coulisses » : retiré des fiches projet mobiles.
- Bouton « Voir plus de projets » : masqué tant qu'il n'y a pas plus de 13 projets (les maquettes les montrent tous).
- Formulaire : aucun service, budget ni délai n'est coché par défaut (la maquette montrait des exemples cochés).
