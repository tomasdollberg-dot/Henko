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
tools/build-pages.mjs      Generador de las páginas HTML (no se editan a mano)
tools/generate_media.py    Material en bruto con MoneyPrinterTurbo (se ejecuta en el Mac)
```

## Comandos
```
npm run build          genera las páginas HTML (ver «Generar las páginas»)
npm run dev            servidor local en http://localhost:3000
npm run check          revisión de marca y SEO
npm run check:launch   además bloquea todo lo pendiente antes de publicar
SITE_URL=https://DOMINIO npm run sitemap
```

## Generar las páginas
Los HTML salen de `tools/build-pages.mjs`: no se editan a mano. Hace falta Node 18 o superior.
```
npm run build                      escribe las páginas en la raíz del proyecto
HENKO_ROOT=/otra/ruta npm run build   escribe en otra carpeta (opcional)
```
- `HENKO_ROOT`: carpeta de salida. Si no se define, es la raíz del proyecto (la carpeta padre de `tools/`).
- `FORM_ENDPOINT`: endpoint del formulario de contacto. Vacío, el formulario queda en modo de prueba y no envía nada.
- `PHVA_LIGHT`: si tiene cualquier valor, el tablero PHVA de la home usa la variante clara (pasos en Blanco cálido con borde en lugar de fondos de color).

Después de generar, `npm run check`.

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
- `media-raw/` está en `.gitignore` (material en bruto y archivos entregados por el cliente).
