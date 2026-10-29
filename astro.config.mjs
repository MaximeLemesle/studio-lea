// @ts-check
import { defineConfig } from 'astro/config';

// TODO domaine : renseigner `site` (ex. 'https://www.studio-bea.fr') quand le nom de domaine sera connu,
// pour générer les URL canoniques et le plan du site.
export default defineConfig({
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto', assets: 'assets' },
  image: { responsiveStyles: false },
  devToolbar: { enabled: false },
});
