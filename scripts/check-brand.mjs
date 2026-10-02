#!/usr/bin/env node
/**
 * Henko · Comprobador de marca y calidad.
 * Revisa el sitio contra el manual de marca v1.0 (sep. 2026) y reglas básicas de SEO.
 *
 *   node scripts/check-brand.mjs            revisión normal (errores bloquean, avisos no)
 *   node scripts/check-brand.mjs --launch   además bloquea todo lo pendiente antes de publicar
 *   node scripts/check-brand.mjs --root=DIR revisa otra carpeta (para pruebas)
 *
 * Sin dependencias. Código de salida 1 si hay errores.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const args = process.argv.slice(2);
const LAUNCH = args.includes('--launch');
const rootArg = args.find((a) => a.startsWith('--root='));
const ROOT = resolve(rootArg ? rootArg.slice(7) : join(dirname(fileURLToPath(import.meta.url)), '..'));

const PALETTE = new Set([
  '#FAF9F5', '#1A1917', '#A44F38', '#A9A0BD', '#D3CCE8', '#E6E2D8',
  '#F1EEEB', '#CAC7C4', '#A9A6A3', '#878481', '#625F5C', '#33302E',
]);
const SKIP_DIRS = new Set(['node_modules', '.git', 'entrada', 'media-raw', 'tools', 'scripts', '.vercel']);
// Desvío consciente del manual (p. 8: 160 px). Decisión de Tomás, oct 2026: probar un logo más pequeño como las referencias.
const LOGO_MIN_PX = 112;
const SKIP_PATHS = ['assets/fonts/', 'assets/logo/']; // archivos entregados, no se tocan
const findings = [];
const add = (level, file, line, rule, msg) => findings.push({ level, file, line, rule, msg });

/* ---------- utilidades ---------- */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = relative(ROOT, full).split('\\').join('/');
    if (statSync(full).isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(full, out);
    } else if (!SKIP_PATHS.some((p) => rel.startsWith(p))) {
      out.push(rel);
    }
  }
  return out;
}
const lineOf = (text, idx) => text.slice(0, idx).split('\n').length;
// Sustituye coincidencias por espacios del mismo largo (conserva saltos de línea y posiciones).
const blank = (text, re) => text.replace(re, (m) => m.replace(/[^\n]/g, ' '));
const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/* ---------- reglas de texto ---------- */
const FORBIDDEN = [
  [/\bcertificamos\b/, 'Henko acompaña, no certifica (manual p. 4). Usá «acompañamos» o «preparamos para la auditoría».'],
  [/te damos la iso/, 'No digas «te damos la ISO» (manual p. 4).'],
  [/garantizamos la certificacion|certificacion garantizada/, 'No prometas ni garantices la certificación (manual p. 4).'],
  [/somos una empresa certificadora/, 'Henko no es una empresa certificadora (manual p. 4).'],
  [/\bsomos (?:un )?organismo (?:de )?certificacion\b/, 'Henko no es un organismo de certificación (manual p. 4).'],
];
const WARN_TEXT = [
  [/\bgarantiza(?:mos|do|da|dos|das|r)?\b/, 'Evitá promesas exageradas («garantizamos…», manual p. 3).'],
  [/\b(?:sellos?|medallas?|insignias?)\b/, 'Sin sellos, medallas ni insignias que sugieran una certificación (manual p. 4).'],
  [/\bscrum\b|\bagile\b/, 'Henko no vende Scrum ni agile: usá la imagen, no la palabra, salvo que haya servicio.'],
  [/softexpert|\bdnv\b|\$\s?\d{1,3}(?:\.\d{3}){2,}/, 'Posible dato de la propuesta comercial o de un cliente: no debe publicarse.'],
];
const TUTEO = /\b(puedes|tienes|quieres|necesitas|buscas|sabes|prefieres|contáctanos|escríbenos|llámanos|cuéntanos|haz clic)\b/gi;

/* ---------- análisis por archivo ---------- */
const files = walk(ROOT);
const htmlFiles = files.filter((f) => extname(f) === '.html');
const cssFiles = files.filter((f) => extname(f) === '.css');
const htmlSet = new Set(htmlFiles);

function checkColorsAndFonts(file, text, { inlineOnly = false } = {}) {
  const isTokens = file.endsWith('tokens.css');
  for (const m of text.matchAll(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) {
    const hex = m[0].length === 4
      ? '#' + [...m[0].slice(1)].map((c) => c + c).join('').toUpperCase()
      : m[0].toUpperCase();
    if (!PALETTE.has(hex)) add('error', file, lineOf(text, m.index), 'color', `Color fuera de la paleta: ${m[0]}. Usá las variables de tokens.css.`);
  }
  for (const m of text.matchAll(/\b(?:rgba?|hsla?)\(/gi)) {
    add('warn', file, lineOf(text, m.index), 'color', 'Evitá rgb()/hsl() sueltos: usá las variables de color de tokens.css.');
  }
  for (const m of text.matchAll(/font-family\s*:\s*([^;}{]+)/gi)) {
    const v = m[1].trim();
    if (isTokens) {
      if (!/^["']?(Schibsted Grotesk|DM Mono)["']?$/i.test(v) && !/^["']?(Schibsted Grotesk|DM Mono)["']?\s*,/i.test(v)) {
        add('error', file, lineOf(text, m.index), 'font', `Tipografía no permitida en tokens: ${v}. Solo Schibsted Grotesk y DM Mono.`);
      }
    } else if (!/^(var\(--font-(?:sans|mono)\)|inherit)$/i.test(v)) {
      add('error', file, lineOf(text, m.index), 'font', `font-family fuera de tokens: ${v}. Usá var(--font-sans) o var(--font-mono).`);
    }
  }
  if (!inlineOnly && /fonts\.(?:googleapis|gstatic)\.com|@import\s+url\(/i.test(text)) {
    add('error', file, 1, 'font', 'Las tipografías van autoalojadas: sin Google Fonts ni @import.');
  }
}

for (const file of cssFiles) {
  const text = readFileSync(join(ROOT, file), 'utf8');
  checkColorsAndFonts(file, blank(text, /\/\*[\s\S]*?\*\//g));
}

let placeholderCount = 0;
for (const file of htmlFiles) {
  const raw = readFileSync(join(ROOT, file), 'utf8');
  const noComments = blank(raw, /<!--[\s\S]*?-->/g);
  const noScripts = blank(noComments, /<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi);
  const visible = blank(noScripts, /<[^>]+>/g);
  const isStyleguide = file === 'styleguide.html';
  const noindex = /<meta[^>]+name=["']robots["'][^>]*noindex/i.test(noComments);

  // Texto: frases prohibidas, avisos, tuteo
  const textNorm = norm(noScripts);
  for (const [re, msg] of FORBIDDEN) for (const m of textNorm.matchAll(new RegExp(re, 'g'))) add('error', file, lineOf(textNorm, m.index), 'voz', msg);
  if (!isStyleguide) {
    for (const [re, msg] of WARN_TEXT) for (const m of norm(visible).matchAll(new RegExp(re, 'g'))) add('warn', file, lineOf(visible, m.index), 'voz', msg);
    for (const m of visible.matchAll(TUTEO)) add('warn', file, lineOf(visible, m.index), 'voz', `Voseo (manual p. 3): «${m[0]}» suena a tuteo. Usá la forma con vos.`);
  }
  for (const m of norm(noComments).matchAll(/lorem ipsum/g)) add('error', file, lineOf(noComments, m.index), 'contenido', 'Texto de relleno «lorem ipsum».');

  if (/fonts\.(?:googleapis|gstatic)\.com/i.test(noComments)) add('error', file, 1, 'font', 'Las tipografías van autoalojadas: sin enlaces a Google Fonts.');

  // Colores y tipografías en <style> y style=""
  for (const m of noComments.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) checkColorsAndFonts(file, m[1], { inlineOnly: true });
  for (const m of noComments.matchAll(/\sstyle=["']([^"']*)["']/gi)) checkColorsAndFonts(file, m[1], { inlineOnly: true });
  for (const m of noComments.matchAll(/<meta[^>]+name=["']theme-color["'][^>]*content=["']([^"']+)["']/gi)) {
    if (!PALETTE.has(m[1].toUpperCase())) add('error', file, lineOf(noComments, m.index), 'color', `theme-color fuera de la paleta: ${m[1]}`);
  }

  // Imágenes y logo
  for (const m of noComments.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const line = lineOf(noComments, m.index);
    const attr = (n) => (tag.match(new RegExp(`\\s${n}=["']([^"']*)["']`, 'i')) || [])[1];
    const src = attr('src') || '';
    if (attr('alt') === undefined) add('error', file, line, 'imagen', '<img> sin atributo alt.');
    if (!attr('width') || !attr('height')) add('error', file, line, 'imagen', '<img> sin width y height (evita saltos de diseño).');
    if (/Henko-logo-/i.test(src)) {
      const w = parseInt(attr('width') || '0', 10);
      if (w && w < LOGO_MIN_PX) add('error', file, line, 'logo', `Logo a ${w} px: por debajo del mínimo acordado (${LOGO_MIN_PX} px; el manual p. 8 pide 160 px, desvío decidido por Tomás en oct 2026).`);
      if (attr('alt') && attr('alt') !== 'Henko') add('warn', file, line, 'logo', 'El alt del logo debería ser «Henko».');
      if (/filter|transform|opacity|rotate|skew/i.test(attr('style') || '')) add('error', file, line, 'logo', 'No se deforma, gira ni recolorea el logo (manual p. 9).');
    }
    if (/Henko-simbolo-/i.test(src)) add('error', file, line, 'logo', 'El símbolo solo se usa como favicon o foto de perfil (manual p. 6).');
    if (/(sello|seal|badge|medalla|insignia|certificad)/i.test(src)) add('warn', file, line, 'logo', 'Nombre de imagen que sugiere un sello o certificación (manual p. 4).');
  }

  // Metadatos SEO
  const lang = (noComments.match(/<html[^>]*\slang=["']([^"']+)["']/i) || [])[1];
  if (lang !== 'es-AR') add('error', file, 1, 'seo', `<html lang> debe ser «es-AR» (es «${lang ?? 'ausente'}»).`);
  if (!/<meta[^>]+name=["']viewport["']/i.test(noComments)) add('error', file, 1, 'seo', 'Falta meta viewport.');
  const title = (noComments.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]?.trim();
  if (!title) add('error', file, 1, 'seo', 'Falta <title>.');
  else if (title.length > 60) add('warn', file, 1, 'seo', `Título de ${title.length} caracteres (ideal hasta 60).`);
  else if (title.length < 20) add('warn', file, 1, 'seo', `Título muy corto (${title.length}).`);
  const desc = (noComments.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i) || [])[1];
  if (!desc) add('error', file, 1, 'seo', 'Falta meta description.');
  else if (desc.length > 160) add('warn', file, 1, 'seo', `Meta description de ${desc.length} caracteres (ideal hasta 160).`);
  else if (desc.length < 70) add('warn', file, 1, 'seo', `Meta description corta (${desc.length}).`);
  const h1s = [...noScripts.matchAll(/<h1\b/gi)].length;
  if (h1s !== 1) add('error', file, 1, 'seo', `Debe haber exactamente un <h1> (hay ${h1s}).`);
  if (!/<link[^>]+rel=["']canonical["']/i.test(noComments) && !noindex) add('warn', file, 1, 'seo', 'Falta <link rel="canonical">.');
  if (LAUNCH && !isStyleguide && !/<link[^>]+rel=["']canonical["']/i.test(noComments)) add('error', file, 1, 'lanzamiento', 'Falta <link rel="canonical"> (obligatorio al publicar).');

  // Datos estructurados
  for (const m of noComments.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const json = JSON.parse(m[1]);
      if (/"@type"\s*:\s*"(?:Review|AggregateRating)"/.test(JSON.stringify(json))) {
        add('error', file, lineOf(noComments, m.index), 'seo', 'Marcado Review/AggregateRating: solo con reseñas reales y verificables.');
      }
    } catch {
      add('error', file, lineOf(noComments, m.index), 'seo', 'JSON-LD con JSON inválido.');
    }
  }

  // Enlaces internos rotos
  const ids = new Set([...noComments.matchAll(/\sid=["']([^"']+)["']/gi)].map((m) => m[1]));
  for (const m of noComments.matchAll(/<a\b[^>]*\shref=["']([^"']*)["']/gi)) {
    const href = m[1];
    const line = lineOf(noComments, m.index);
    if (href.startsWith('#')) {
      if (href.length > 1 && !ids.has(href.slice(1))) add('warn', file, line, 'enlace', `Ancla sin destino: ${href}`);
    } else if (href.startsWith('/') && !href.startsWith('//')) {
      const p = href.split('#')[0].split('?')[0];
      const clean = p.replace(/^\//, '');
      const ok = clean === '' ? htmlSet.has('index.html')
        : extname(clean) ? existsSync(join(ROOT, clean))
        : htmlSet.has(clean.replace(/\/$/, '') + '.html') || htmlSet.has(clean.replace(/\/$/, '') + '/index.html');
      if (!ok) add('error', file, line, 'enlace', `Enlace interno roto: ${href}`);
    }
  }

  // Pendientes
  for (const m of noComments.matchAll(/\sdata-placeholder\b/gi)) {
    placeholderCount += 1;
    if (LAUNCH) add('error', file, lineOf(noComments, m.index), 'lanzamiento', 'Contenido provisional (data-placeholder): reemplazarlo antes de publicar.');
  }
  if (LAUNCH && noindex) add('error', file, 1, 'lanzamiento', 'La página tiene noindex: quitarlo al publicar.');
  for (const m of norm(noComments).matchAll(/dominio-pendiente|\.invalid\b|example\.com/g)) {
    if (LAUNCH) add('error', file, lineOf(noComments, m.index), 'lanzamiento', 'Dominio provisional: poné el dominio definitivo.');
  }
}

/* ---------- integridad de los logos entregados (manual p. 5 y 9: no se tocan) ---------- */
const sums = join(ROOT, 'assets/logo/SHA256SUMS');
if (existsSync(sums)) {
  for (const l of readFileSync(sums, 'utf8').split('\n').filter(Boolean)) {
    const [hash, name] = l.split(/\s+/);
    const f = join(ROOT, 'assets/logo', name);
    if (!existsSync(f)) add('error', `assets/logo/${name}`, 1, 'logo', 'Falta un logo del manual.');
    else if (createHash('sha256').update(readFileSync(f)).digest('hex') !== hash) add('error', `assets/logo/${name}`, 1, 'logo', 'El archivo del logo no coincide con el entregado: no se edita ni se reexporta.');
  }
}

/* ---------- comprobaciones de lanzamiento ---------- */
if (LAUNCH) {
  if (existsSync(join(ROOT, 'styleguide.html'))) add('error', 'styleguide.html', 1, 'lanzamiento', 'La guía de estilo interna no se publica: eliminarla.');
  const vj = existsSync(join(ROOT, 'vercel.json')) ? readFileSync(join(ROOT, 'vercel.json'), 'utf8') : '';
  if (/X-Robots-Tag[\s\S]{0,60}noindex/i.test(vj)) add('error', 'vercel.json', 1, 'lanzamiento', 'Cabecera X-Robots-Tag noindex activa: quitarla.');
  const rb = existsSync(join(ROOT, 'robots.txt')) ? readFileSync(join(ROOT, 'robots.txt'), 'utf8') : '';
  if (/^\s*Disallow:\s*\/\s*$/im.test(rb)) add('error', 'robots.txt', 1, 'lanzamiento', 'robots.txt bloquea todo: permitir el rastreo y añadir el sitemap.');
  const sm = existsSync(join(ROOT, 'sitemap.xml')) ? readFileSync(join(ROOT, 'sitemap.xml'), 'utf8') : '';
  if (!/<loc>/.test(sm)) add('error', 'sitemap.xml', 1, 'lanzamiento', 'sitemap.xml vacío o ausente (SITE_URL=https://DOMINIO npm run sitemap).');
}

/* ---------- informe ---------- */
const order = { error: 0, warn: 1 };
findings.sort((a, b) => a.file.localeCompare(b.file) || order[a.level] - order[b.level] || a.line - b.line);
let lastFile = '';
for (const f of findings) {
  if (f.file !== lastFile) { console.log(`\n${f.file}`); lastFile = f.file; }
  console.log(`  ${f.level === 'error' ? 'ERROR' : 'aviso'}  línea ${f.line}  [${f.rule}]  ${f.msg}`);
}
const errors = findings.filter((f) => f.level === 'error').length;
const warns = findings.length - errors;
console.log(`\nHenko check-brand${LAUNCH ? ' --launch' : ''}: ${htmlFiles.length} páginas HTML, ${cssFiles.length} CSS revisados.`);
console.log(`Errores: ${errors} · Avisos: ${warns} · Marcadores provisionales (data-placeholder): ${placeholderCount}`);
if (!LAUNCH && placeholderCount) console.log('Recordatorio: --launch fallará mientras queden marcadores provisionales.');
process.exit(errors ? 1 : 0);
