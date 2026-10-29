<?php
/**
 * Studio Béa — envoi du formulaire de contact (hébergement Hostinger).
 *
 * Reçoit le formulaire de /contact/ et l'envoie par email avec les pièces jointes.
 * L'adresse de réception et les réglages SMTP sont dans config.php (même dossier),
 * qui n'est jamais publié dans le dépôt : copier config.example.php en config.php
 * directement sur le serveur et le remplir.
 */

declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');

function reponse(int $code, array $data): void
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    reponse(405, ['ok' => false]);
}

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    reponse(500, ['ok' => false, 'error' => 'config']);
}
$config = require $configFile;

// --- Anti-spam : champ piège, délai minimal de saisie, limite par adresse IP ---
if (!empty($_POST['site_web'])) {
    reponse(200, ['ok' => true]); // robot : on fait semblant
}
$t0 = (int) ($_POST['t0'] ?? 0);
if ($t0 > 0 && (microtime(true) * 1000 - $t0) < 3000) {
    reponse(200, ['ok' => true]);
}
$ip = $_SERVER['REMOTE_ADDR'] ?? '0';
$limiteDir = sys_get_temp_dir() . '/studio-bea-contact';
@mkdir($limiteDir, 0700, true);
$limiteFile = $limiteDir . '/' . hash('sha256', $ip);
$horodatages = array_filter(
    is_file($limiteFile) ? array_map('intval', file($limiteFile, FILE_IGNORE_NEW_LINES)) : [],
    fn ($t) => $t > time() - 3600
);
if (count($horodatages) >= ($config['limite_par_heure'] ?? 5)) {
    reponse(429, ['ok' => false, 'error' => 'limite']);
}

// --- Champs ---
$propre = fn ($v) => trim(str_replace(["\r", "\0"], '', (string) $v));
$nom = mb_substr($propre($_POST['nom'] ?? ''), 0, 120);
$email = mb_substr($propre($_POST['email'] ?? ''), 0, 160);
$entreprise = mb_substr($propre($_POST['entreprise'] ?? ''), 0, 160);
$services = array_map($propre, (array) ($_POST['services'] ?? []));
$formule = mb_substr($propre($_POST['formule'] ?? ''), 0, 80);
$budget = mb_substr($propre($_POST['budget'] ?? ''), 0, 40);
$delai = mb_substr($propre($_POST['delai'] ?? ''), 0, 40);
$message = mb_substr(trim((string) ($_POST['message'] ?? '')), 0, 8000);
$rgpd = ($_POST['rgpd'] ?? '') === 'oui';

$erreurs = [];
if ($nom === '') $erreurs['nom'] = 'vide';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $erreurs['email'] = 'format';
if ($message === '') $erreurs['message'] = 'vide';
if (!$rgpd) $erreurs['rgpd'] = 'vide';

// --- Pièces jointes : PDF, JPG ou PNG, 10 Mo au total ---
$pieces = [];
$total = 0;
$autorises = ['application/pdf' => 'pdf', 'image/jpeg' => 'jpg', 'image/png' => 'png'];
if (!empty($_FILES['fichiers']['name'][0])) {
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    foreach ($_FILES['fichiers']['name'] as $i => $nomFichier) {
        if ($_FILES['fichiers']['error'][$i] !== UPLOAD_ERR_OK) {
            $erreurs['fichiers'] = 'envoi';
            continue;
        }
        $tmp = $_FILES['fichiers']['tmp_name'][$i];
        $type = $finfo->file($tmp);
        if (!isset($autorises[$type])) {
            $erreurs['fichiers'] = 'type';
            continue;
        }
        $total += filesize($tmp);
        $pieces[] = [
            'nom' => preg_replace('/[^\w.\- ]+/u', '_', basename($nomFichier)),
            'type' => $type,
            'contenu' => file_get_contents($tmp),
        ];
    }
    if ($total > 10 * 1024 * 1024) $erreurs['fichiers'] = 'taille';
}

if ($erreurs) {
    reponse(422, ['ok' => false, 'errors' => $erreurs]);
}

// --- Email ---
$lignes = [
    'Prénom et nom : ' . $nom,
    'Email : ' . $email,
    'Entreprise / activité : ' . ($entreprise ?: '—'),
    ...($formule ? ['Formule choisie : ' . $formule] : []),
    'Les dossiers qui vous intéressent : ' . ($services ? implode(', ', $services) : '—'),
    'Budget : ' . ($budget ?: '—'),
    'Délai : ' . ($delai ?: '—'),
    '',
    'Votre message :',
    $message,
    '',
    'Pièces jointes : ' . ($pieces ? implode(', ', array_column($pieces, 'nom')) : '—'),
];
$texte = implode("\n", $lignes);
$sujet = 'Studio Béa — ' . $nom;

$envoye = !empty($config['smtp']['hote'])
    ? envoyerSmtp($config, $email, $nom, $sujet, $texte, $pieces)
    : envoyerMail($config, $email, $nom, $sujet, $texte, $pieces);

if (!$envoye) {
    reponse(500, ['ok' => false, 'error' => 'envoi']);
}
$horodatages[] = time();
@file_put_contents($limiteFile, implode("\n", $horodatages));
reponse(200, ['ok' => true]);

// ---------------------------------------------------------------------------

function construireMime(array $config, string $replyTo, string $replyName, string $sujet, string $texte, array $pieces): array
{
    $frontiere = 'sb_' . bin2hex(random_bytes(12));
    $entetes = [
        'From: ' . encoderNom($config['expediteur_nom'] ?? 'Site Studio Béa') . ' <' . $config['expediteur'] . '>',
        'Reply-To: ' . encoderNom($replyName) . ' <' . $replyTo . '>',
        'MIME-Version: 1.0',
        'Content-Type: multipart/mixed; boundary="' . $frontiere . '"',
    ];
    $corps = "--$frontiere\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($texte)) . "\r\n";
    foreach ($pieces as $p) {
        $corps .= "--$frontiere\r\nContent-Type: {$p['type']}; name=\"{$p['nom']}\"\r\n"
            . "Content-Disposition: attachment; filename=\"{$p['nom']}\"\r\nContent-Transfer-Encoding: base64\r\n\r\n"
            . chunk_split(base64_encode($p['contenu'])) . "\r\n";
    }
    $corps .= "--$frontiere--\r\n";
    return [$entetes, $corps, '=?UTF-8?B?' . base64_encode($sujet) . '?='];
}

function encoderNom(string $nom): string
{
    return '=?UTF-8?B?' . base64_encode($nom) . '?=';
}

/** Envoi avec la fonction mail() de l'hébergement. */
function envoyerMail(array $config, string $replyTo, string $replyName, string $sujet, string $texte, array $pieces): bool
{
    [$entetes, $corps, $sujetEncode] = construireMime($config, $replyTo, $replyName, $sujet, $texte, $pieces);
    return mail($config['destinataire'], $sujetEncode, $corps, implode("\r\n", $entetes), '-f' . $config['expediteur']);
}

/** Envoi SMTP authentifié (boîte mail Hostinger), recommandé pour la délivrabilité. */
function envoyerSmtp(array $config, string $replyTo, string $replyName, string $sujet, string $texte, array $pieces): bool
{
    $s = $config['smtp'];
    [$entetes, $corps, $sujetEncode] = construireMime($config, $replyTo, $replyName, $sujet, $texte, $pieces);
    $fp = @stream_socket_client('ssl://' . $s['hote'] . ':' . ($s['port'] ?? 465), $errno, $errstr, 15);
    if (!$fp) return false;
    $lire = function () use ($fp) {
        $r = '';
        while (($l = fgets($fp, 515)) !== false) {
            $r .= $l;
            if (isset($l[3]) && $l[3] === ' ') break;
        }
        return $r;
    };
    $cmd = function (string $c, string $attendu) use ($fp, $lire) {
        fwrite($fp, $c . "\r\n");
        return str_starts_with($lire(), $attendu);
    };
    $lire();
    $ok = $cmd('EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'localhost'), '250')
        && $cmd('AUTH LOGIN', '334')
        && $cmd(base64_encode($s['utilisateur']), '334')
        && $cmd(base64_encode($s['mot_de_passe']), '235')
        && $cmd('MAIL FROM:<' . $config['expediteur'] . '>', '250')
        && $cmd('RCPT TO:<' . $config['destinataire'] . '>', '250')
        && $cmd('DATA', '354');
    if ($ok) {
        $message = implode("\r\n", array_merge($entetes, [
            'To: <' . $config['destinataire'] . '>',
            'Subject: ' . $sujetEncode,
            'Date: ' . date('r'),
        ])) . "\r\n\r\n" . str_replace("\r\n.", "\r\n..", $corps);
        $ok = $cmd($message . "\r\n.", '250');
    }
    $cmd('QUIT', '221');
    fclose($fp);
    return $ok;
}
