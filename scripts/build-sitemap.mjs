#!/usr/bin/env node
/**
 * Genera sitemap.xml con las páginas indexables.
 * Uso:  SITE_URL=https://dominio.com node scripts/build-sitemap.mjs
 * Excluye styleguide.html y cualquier página con noindex. No incluye lastmod:
 * una fecha inexacta resta confianza, y Google solo la usa si es fiable.
 */
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(join(dirname(fileURLToPath(import.meta.url)), '..'));
const SITE = (process.env.SITE_URL || '').replace(/\/+$/, '');
if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(SITE)) {
  console.error('Definí SITE_URL con el dominio definitivo, por ejemplo: SITE_URL=https://dominio.com npm run sitemap');
  process.exit(1);
}
const SKIP = new Set(['node_modules', '.git', 'entrada', 'media-raw', 'tools', 'scripts', '.vercel', 'assets']);
const pages = [];
(function walk(dir) {
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) { if (!SKIP.has(n)) walk(f); continue; }
    if (!n.endsWith('.html')) continue;
    const rel = relative(ROOT, f).split('\\').join('/');
    if (rel === 'styleguide.html') continue;
    if (/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(readFileSync(f, 'utf8'))) continue;
    const url = rel === 'index.html' ? '/' : rel.endsWith('/index.html') ? '/' + rel.slice(0, -10) + '/' : '/' + rel.replace(/\.html$/, '') + '/';
    pages.push(url);
  }
})(ROOT);
pages.sort();
if (!pages.length) {
  console.error('No hay páginas indexables: ¿siguen todas con noindex? Quitá el noindex antes de generar el sitemap.');
  process.exit(1);
}
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}\n</urlset>\n`;
writeFileSync(join(ROOT, 'sitemap.xml'), xml);
console.log(`sitemap.xml: ${pages.length} URL`);
pages.forEach((u) => console.log('  ' + SITE + u));
