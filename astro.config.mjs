// @ts-check
import { defineConfig } from 'astro/config';

// Nom de domaine : sert aux URL canoniques et au plan du site (sitemap.xml).
export default defineConfig({
  site: 'https://lea-audouin.fr',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto', assets: 'assets' },
  image: { responsiveStyles: false },
  devToolbar: { enabled: false },
});
