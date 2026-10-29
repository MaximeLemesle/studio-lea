// Plan du site pour Google (déclaré dans robots.txt).
import type { APIRoute } from 'astro';
import { PROJETS } from '../data/projets';

const PAGES = [
  '/', '/services/', '/services/community-management/', '/services/audit-strategique/', '/services/graphisme/',
  '/services/redactionnel/', '/services/ugc/', '/portfolio/', ...PROJETS.map((p) => `/portfolio/${p.slug}/`),
  '/a-propos/', '/contact/', '/mentions-legales/', '/confidentialite/',
];

export const GET: APIRoute = ({ site }) => new Response(
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PAGES.map((p) => `  <url><loc>${new URL(p, site)}</loc></url>`).join('\n')}\n</urlset>\n`,
  { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
);
