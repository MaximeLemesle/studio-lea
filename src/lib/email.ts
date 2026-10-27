// Adresse email protégée (PASSATION § 5.6) : jamais écrite en clair dans le code ni dans les pages.
// À la construction du site, l'adresse (variable d'environnement CONTACT_EMAIL) est encodée :
// chaque caractère est décalé puis le tout est inversé et passé en base 64.
// Le script de la page Mentions légales la reconstitue seulement au clic.

const SHIFT = 7;

export function encodeEmail(email: string | undefined): string {
  if (!email) return '';
  const shifted = Array.from(email, (c) => String.fromCharCode(c.charCodeAt(0) + SHIFT)).reverse().join('');
  return Buffer.from(shifted, 'utf8').toString('base64');
}

export function decodeEmail(encoded: string): string {
  const shifted = new TextDecoder().decode(Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0)));
  return Array.from(shifted, (c) => String.fromCharCode(c.charCodeAt(0) - SHIFT)).reverse().join('');
}
