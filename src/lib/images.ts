import type { ImageMetadata } from 'astro';

// Toutes les images du site (src/assets/img), indexées par nom de fichier.
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/img/*.{jpg,jpeg,png,webp}', { eager: true });

export const images: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(files).map(([path, mod]) => [path.split('/').pop()!, mod.default]),
);

export function getImg(name: string): ImageMetadata {
  const meta = images[name];
  if (!meta) throw new Error(`Image introuvable : ${name}`);
  return meta;
}

/** URL du fichier d'origine (pour les liens « voir en entier »). */
export function img(name: string): string {
  return getImg(name).src;
}
