# Henko · Sitio web

HTML, CSS y JS estáticos (sin build). Marca: *Manual de marca Henko v1.0, septiembre 2026*. Reglas para agentes: [`AGENTS.md`](AGENTS.md).

## Estructura
```
index.html                 Inicio (fase 1: base provisional)
styleguide.html            Guía de estilo interna (noindex; se elimina antes de publicar)
assets/css/                tokens.css (marca) · base.css (componentes) · styleguide.css
assets/fonts/              Schibsted Grotesk (variable) y DM Mono, autoalojadas (licencias incluidas)
assets/logo/               Logos del manual, sin tocar (SHA256SUMS comprueba la integridad)
favicon.svg / .ico / apple-touch-icon.png   Símbolo del manual
vercel.json  robots.txt  sitemap.xml        Despliegue y rastreo (pre-lanzamiento: todo en noindex)
scripts/check-brand.mjs    Comprobador de marca y SEO
scripts/build-sitemap.mjs  Genera sitemap.xml con SITE_URL
tools/generate_media.py    Material en bruto con MoneyPrinterTurbo (se ejecuta en el Mac)
```

## Comandos
```
npm run dev            servidor local en http://localhost:3000
npm run check          revisión de marca y SEO
npm run check:launch   además bloquea todo lo pendiente antes de publicar
SITE_URL=https://DOMINIO npm run sitemap
```

## Despliegue
GitHub (`main`) → Vercel, automático. Mientras no haya dominio, el sitio permanece en `noindex` (meta, cabecera `X-Robots-Tag` y `robots.txt`).

## Para publicar con dominio propio
1. Sustituir todo el contenido provisional (`data-placeholder`) y eliminar `styleguide.html`.
2. Quitar `noindex` de las páginas, la cabecera de `vercel.json` y el `Disallow: /` de `robots.txt`.
3. Añadir `canonical` y datos estructurados con el dominio definitivo.
4. `SITE_URL=https://DOMINIO npm run sitemap` y la línea `Sitemap:` en `robots.txt`.
5. `npm run check:launch` sin errores. Después, GA4 y Search Console.

## Notas
- Los SVG de `assets/logo/` se copian tal cual. Si una herramienta los reexporta o les añade metadatos, `check-brand` falla.
- `media-raw/` y `entrada/` están en `.gitignore` (material en bruto y archivos entregados por el cliente).
