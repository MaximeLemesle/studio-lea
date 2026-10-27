<?php
/**
 * Modèle de réglages du formulaire de contact.
 * Sur le serveur : copier ce fichier en config.php (même dossier) et le remplir.
 * config.php n'est jamais publié dans le dépôt (voir .gitignore).
 */
return [
    // Adresse qui reçoit les messages du formulaire (celle de Léa)
    'destinataire' => 'À COMPLÉTER',
    // Adresse d'expédition, sur le nom de domaine du site (ex. une boîte Hostinger)
    'expediteur' => 'À COMPLÉTER',
    'expediteur_nom' => 'Site Studio Béa',
    // Envoi SMTP authentifié (recommandé). Laisser 'hote' vide pour utiliser mail().
    'smtp' => [
        'hote' => 'smtp.hostinger.com',
        'port' => 465,
        'utilisateur' => 'À COMPLÉTER',
        'mot_de_passe' => 'À COMPLÉTER',
    ],
    'limite_par_heure' => 5,
];
