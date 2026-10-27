# AGENTS.md · Sitio web de Henko

Instrucciones para agentes de código (Claude Code, Codex) que escriben o revisan este repositorio.
Fuente de verdad visual y verbal: **Manual de marca Henko v1.0 (septiembre 2026)**. Si algo de este archivo choca con el manual, gana el manual.

## Qué es
Web corporativa de Henko, consultora argentina que **acompaña** a organizaciones a implementar, mejorar y sostener sistemas de gestión (ISO), con servicios de capacitación, higiene y seguridad, asesoramiento legal y reclutamiento. Alcance: **todo el país y también fuera de Argentina** (sin sede ni dirección pública, sin SEO local por ciudad).
Stack: HTML, CSS y JS estáticos, **sin framework ni build**. Despliegue: GitHub → Vercel.
Los HTML se generan con `entrada/build-pages.mjs`; correr con `HENKO_ROOT=<raíz del proyecto>`; no editar los HTML a mano.

## Antes de dar nada por terminado
1. `node scripts/check-brand.mjs` debe terminar sin errores.
2. Para publicar: `node scripts/check-brand.mjs --launch` debe terminar sin errores.
3. Revisar a 390 px y a 1280 px. No dar por bueno un cambio visual solo por el código.
4. **No hacer commit ni push.** Mostrar el plan y el diff y esperar el visto bueno explícito.

## Marca (obligatorio)
- **Color**: solo la paleta de `assets/css/tokens.css`. Nada de hex ni rgb() sueltos en otros archivos; usar variables.
  Blanco cálido `#FAF9F5` y Tinta `#1A1917` sostienen la lectura. Terracota `#A44F38` da reconocimiento. Lavanda `#A9A0BD` (solo marcadores y líneas), Lavanda light `#D3CCE8` (resumen o idea destacada) y Arena `#E6E2D8` (información complementaria) acompañan.
- **Parejas de texto y fondo** (manual p. 12): Tinta sobre Blanco cálido, Arena, Lavanda y Lavanda light. Blanco cálido sobre Terracota y sobre Tinta. Nunca texto pequeño en Blanco cálido sobre Lavanda ni en Tinta sobre Terracota. Fondo liso detrás del texto.
- **Tipografía**: Schibsted Grotesk para todo lo que se comunica; DM Mono solo para datos y referencias (normas, versiones, fechas, etiquetas). Los números dentro de una frase van en Schibsted. Alineado a la izquierda, sin justificar. Autoalojadas: prohibido Google Fonts.
- **Logo** (`assets/logo/`, protegido por `SHA256SUMS`): no se edita, reexporta ni reconstruye con fuente. Solo Tinta (sobre claros) o Blanco cálido (sobre Tinta o Terracota). Ancho mínimo 160 px según el manual (p. 8); **desviación autorizada por Tomás: 112 px en cabecera y 136 px en pie** (`LOGO_MIN_PX = 112` en el linter). Comprobar nitidez a DPR 1 y 2. Espacio libre = ½ de la altura de la «o» por los 4 lados (clase `.logo`). Sin estirar, girar, recolorear, quitar el interior, añadir contornos, sellos o textos pegados. El símbolo («o») solo como favicon o foto de perfil, nunca como fondo cortado.
- **Forma (v2)**: esquinas con radio 10 px (`--radius`; 6 px en elementos pequeños), botones en píldora, líneas finas (1 px), pasos numerados y paneles redondeados dentro de la página. El manual no prohíbe radios ni sombras; se evitan sombras y degradados. Títulos en peso 500 con una palabra clave en 800 (`<b>`) o con marcador Lavanda (`.mark`), como pide el manual. Se permiten el tablero PHVA animado del hero y fotos/vídeo de MoneyPrinterTurbo; no ilustraciones decorativas ajenas.
- **Escala tipográfica**: fluida con `clamp()` en `tokens.css` (H1 de Home ≈ 74 px a 1440; H1 interno ≈ 53 px; cuerpo 17–21 px). Revisar siempre a 360, 768, 1440 y 1920, no solo móvil y 1280.
- **No depender solo del color**: distinguir bloques también con títulos, espacio o líneas.

## Voz y contenido (obligatorio)
- Castellano de Argentina, **voseo**: «contactanos», «conocé», «podés», «tenés». No tutear.
- Henko **acompaña, no certifica**. Decir: «acompañamos», «implementamos», «preparamos para la auditoría», «formamos al equipo». No decir: «certificamos», «te damos la ISO», «garantizamos la certificación», «somos una empresa certificadora». Aclarar siempre que la certificación la emite un organismo certificador independiente.
- Sin sellos, medallas, escudos ni insignias que sugieran una certificación.
- Sin promesas exageradas. Siglas explicadas la primera vez. Tono humano, técnico, boutique y flexible.
- Cifras solo las confirmadas por el cliente. Nada inventado. Etiquetas vigentes: «+10 · Años de experiencia acumulada del equipo» y «+60 · Empresas acompañadas».
- **Prohibido publicar** datos de la propuesta comercial (honorarios, nombres de proveedores, entregables de un cliente) o de capacitaciones internas de un cliente.
- Se permite el nombre y la foto de la directora (Marina Boeri); del resto del equipo, solo roles.
- Contenido provisional (fotos, logos de clientes, testimonios de ejemplo, contacto): siempre marcado con `data-placeholder` y con texto que lo declare («Testimonio de ejemplo», «Logo cliente»). Jamás citas realistas con nombre de persona o empresa inventados. Sin marcado `Review`/`AggregateRating`.

## SEO
- `lang="es-AR"`. Un único `<h1>` por página, con la palabra clave principal y «en Argentina» o «en todo el país» cuando encaje de forma natural.
- `<title>` hasta 60 caracteres; meta description entre 70 y 160; `canonical` en cada página al publicar.
- Estructura: un bloque de **respuesta directa** al principio de cada página de servicio, subtítulos como preguntas reales, FAQ con respuestas visibles en la página.
- Datos estructurados JSON-LD: `Organization` y `WebSite` (inicio), `Service` (cada servicio), `FAQPage` (solo con FAQ visibles), `BreadcrumbList`. `areaServed`: Argentina. Sin `LocalBusiness` con dirección.
- URLs en minúsculas, sin acentos, con barra final (`/servicios/higiene-y-seguridad/`). Enlaces internos entre servicios (hub y spokes). Rutas absolutas desde la raíz.
- Pre-lanzamiento: `noindex` en meta, `X-Robots-Tag` (vercel.json) y `Disallow: /` (robots.txt). Se quitan los tres a la vez al publicar el dominio.

## Código
- HTML semántico (`header`, `nav`, `main`, `section`, `footer`), una sola jerarquía de encabezados, enlace «Saltar al contenido».
- Todo `<img>` con `alt` y `width`/`height`. `loading="lazy"` salvo en lo que se ve al cargar. Peso: imágenes en WebP o JPEG, vídeo corto, sin audio y con póster.
- CSS solo con variables de `tokens.css`. Sin estilos de color o fuente en línea. JS mínimo, sin dependencias y con degradación elegante.
- Respetar `prefers-reduced-motion`. Foco visible. Tamaño táctil mínimo 44 px.
- Sin peticiones a terceros (analítica, fuentes, CDN) hasta que se decida y se documente. GA4 y Search Console se añaden cuando exista el dominio.

## Decisiones tomadas
- Dominio real: `www.henkogestion.com`.
- Email: `info@henkogestion.com`.
- WhatsApp: +54 9 11 6869-9081.
- Formulario en modo de prueba hasta definir el endpoint.
- Fichas de servicio con panel de flujo (`FLOW` en el generador).
- La bio de Marina Boeri está reservada con un `<p hidden data-placeholder>` y no muestra texto provisional; se completa cuando la tengamos (excepción deliberada a la regla de placeholders visibles).

## Checklist de revisión (adaptado de la p. 19 del manual)
- [ ] Logo original, sin modificar, con tamaño mínimo y espacio libre.
- [ ] Logo completo en las páginas; símbolo solo en favicon.
- [ ] Combinaciones de fondo y texto de la guía; fondo liso tras el texto.
- [ ] Schibsted para comunicar y DM Mono para datos.
- [ ] Título reconocible y texto cómodo de leer a 390 px y 1280 px.
- [ ] Contenido alineado y separado de forma consistente.
- [ ] Nada sugiere que Henko otorga certificaciones.
- [ ] Voseo en todo el texto visible.
- [ ] `check-brand` sin errores (y con `--launch` antes de publicar).
