// Generador de las páginas HTML del sitio. Salida: HTML plano en la raíz del proyecto. Los HTML se generan, no se editan a mano.
// Uso: node tools/build-pages.mjs   (o npm run build)
// Raíz de salida: la carpeta padre de tools/; HENKO_ROOT la anula (opcional).
// Variables opcionales: FORM_ENDPOINT (endpoint del formulario), PHVA_LIGHT (variante clara del PHVA).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = process.env.HENKO_ROOT || resolve(join(dirname(fileURLToPath(import.meta.url)), '..'));
const DOM = 'https://www.henkogestion.com';
// Contacto de Henko (confirmado por Tomás, oct 2026)
const EMAIL = 'info@henkogestion.com';
const WA_NUM = '5491168699081';
const WA_TXT = '+54 9 11 6869-9081';
const WA_MSG = encodeURIComponent('Hola Henko, quiero consultar por sus servicios.');
const WA_URL = `https://wa.me/${WA_NUM}?text=${WA_MSG}`;
// Endpoint del formulario (Formspree u otro). Mientras esté vacío, el formulario funciona en modo de prueba y no envía nada.
const FORM_ENDPOINT = process.env.FORM_ENDPOINT || '';
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const attr = s => esc(s).replace(/"/g,'&quot;');
const strip = s => s.replace(/<[^>]+>/g,'');

// ------------------------------------------------------------ datos
// Grupos de la página Servicios (la agrupación se confirma con Henko: va marcada con data-placeholder)
const G = [
 { name:'Gestión y procesos', tag:'Para ordenar', line:'Ordenar cómo trabaja tu organización y comprobar que funciona.', on:'on-lavanda-light' },
 { name:'Personas y organización', tag:'Para tu equipo', line:'Formar, incorporar y comunicar con coherencia.', on:'on-lavanda' },
 { name:'Seguridad y cumplimiento', tag:'Para cumplir', line:'Cumplir con la normativa y cuidar a las personas en su lugar de trabajo.', on:'on-arena' },
 { name:'Comercio exterior y responsabilidad social', tag:'Para destacar', line:'Operar con el exterior con la documentación en orden y asumir el compromiso con la comunidad.', on:'on-arena' },
];
const S = [
 { slug:'implementacion-normas-iso', name:'Implementación de normas ISO', feat:true, g:0,
   short:'Diseñamos e implementamos sistemas de gestión con cada equipo dentro de las organizaciones.',
   need:'Ordenar tu gestión, responder a un cliente o certificar por primera vez.', scope:'Diagnóstico, diseño del sistema y preparación para la auditoría.',
   title:'Implementación de normas ISO en Argentina | Henko',
   desc:'Implementamos sistemas de gestión ISO con tu equipo y lo preparamos para la auditoría de certificación. Consultoría para empresas de toda Argentina.',
   h1:'Implementación de normas <b>ISO</b> en Argentina',
   lead:'Implementamos sistemas de gestión basados en normas ISO junto con las personas que van a trabajar con ellos. Diseñamos procesos, documentación y registros, formamos al equipo y lo preparamos para la auditoría. La certificación la emite un organismo independiente.',
   lines:null,
   includes:['Diagnóstico inicial y plan de trabajo','Mapa de procesos, política y objetivos','Documentación y registros acordes a tu operación, sin burocracia de más','Formación del equipo y auditoría interna','Preparación para la auditoría de certificación y seguimiento posterior'],
   steps:[['Diagnóstico','Entendemos cómo trabaja tu organización hoy y acordamos alcance, plazos y responsables.'],['Diseño con el equipo','Definimos procesos, política y objetivos con quienes los van a usar todos los días.'],['Implementación y capacitación','Ponemos en marcha el sistema y formamos a cada equipo según su rol.'],['Auditoría interna y preparación','Revisamos el sistema con mirada externa y te preparamos para la auditoría de certificación.']],
   who:['Ordenar cómo se trabaja|Mejorar el orden interno, documentar procesos y definir roles.','Medir si funciona|Tener indicadores que muestren la efectividad del sistema.','Cumplir un requisito|Presentarte a una licitación o responder a la exigencia de un cliente.'], whoPh:false,
   faq:[['¿Ustedes otorgan la certificación ISO?','No. La otorga un organismo de certificación independiente después de su propia auditoría. Nosotros implementamos el sistema y preparamos a tu organización para ese momento.'],['¿Cuánto tarda implementar una norma ISO?','Depende de la disponibilidad de recursos, de la cantidad de sitios a implementar y de las normas. Como referencia, una implementación lleva entre 6 y 9 meses.'],['¿Se puede integrar más de una norma?','Sí, siempre.']],
   rel:['auditorias','capacitaciones','higiene-y-seguridad'] },
 { slug:'higiene-y-seguridad', name:'Servicio de Higiene y Seguridad', feat:true, g:2,
   short:'Ambientes de trabajo seguros, con controles operacionales y cumplimiento de la normativa vigente.',
   need:'Ambientes de trabajo más seguros y normativa al día.', scope:'Relevamiento de riesgos, controles y capacitación en seguridad.',
   title:'Servicio de Higiene y Seguridad en el trabajo | Henko',
   desc:'Asesoramiento y controles operacionales de higiene y seguridad para empresas de toda Argentina. Ambientes de trabajo más seguros y normativa al día.',
   h1:'Servicio de Higiene y <b>Seguridad</b> en el trabajo',
   lead:'Colaboramos en la identificación de riesgos, controles operacionales y en la identificación de normativa legal aplicable a cada organización.',
   lines:[['Para','Planta, obra, depósito u oficinas'],['Marco','Ley 19.587 y decretos'],['Incluye','Relevamiento y controles'],['Base de','ISO 45001']],
   includes:['Relevamiento de riesgos en planta u oficina','Controles operacionales y procedimientos de trabajo seguro','Capacitación en seguridad para cada puesto','Seguimiento de los requisitos legales aplicables','Apoyo para implementar ISO 45001'],
   steps:[['Relevamiento','Recorremos tus instalaciones y puestos para identificar riesgos y desvíos.'],['Plan de acción','Priorizamos qué corregir primero y quién se encarga de cada tema.'],['Implementación con el equipo','Definimos controles y procedimientos con las personas que los aplican.'],['Seguimiento','Revisamos que los controles se mantengan y se actualicen cuando cambia la operación.']],
   who:['Empresas con planta, obra, depósito u oficinas que quieren ordenar su seguridad y llegar al día con la normativa.'], whoPh:true,
   faq:[['¿Qué normativa aplica en Argentina?','El marco general es la Ley 19.587 de Higiene y Seguridad en el Trabajo y sus decretos reglamentarios, junto con normas específicas según la actividad. Te indicamos cuáles aplican a tu caso.'],['¿Sirve para implementar ISO 45001?','Sí. Es la base operativa que esa norma pide tener ordenada.'],['¿Trabajan con empresas de varias sedes?','Sí. Coordinamos el relevamiento y el seguimiento por sede.']],
   rel:['asesoramiento-legal','capacitaciones','implementacion-normas-iso'] },
 { slug:'asesoramiento-legal', name:'Asesoramiento Legal', feat:true, g:2,
   short:'Identificamos los requisitos legales de ambiente y seguridad que aplican a tu actividad y los mantenemos al día.',
   need:'Saber qué exige la ley en ambiente y seguridad.', scope:'Matriz de requisitos, evaluación de cumplimiento y actualización.',
   title:'Asesoramiento legal ambiental y de seguridad | Henko',
   desc:'Identificamos los requisitos legales ambientales y de seguridad que aplican a tu empresa y los mantenemos actualizados. Para organizaciones de toda Argentina.',
   h1:'Asesoramiento <b>legal</b> en ambiente y seguridad para empresas',
   lead:'Se identifican requisitos legales aplicables a cada actividad, evaluando nivel de cumplimiento y desarrollando una matriz de identificación y evaluación de requisitos legales. Se realizan auditorías de cumplimiento para verificar el cumplimiento legal y nuevos requerimientos.',
   lines:[['Áreas','Ambiente y seguridad'],['Entregable','Matriz de requisitos legales'],['Actualización','Periódica, con frecuencia acordada']],
   includes:['Auditorías de cumplimiento en ambiente y seguridad','Matriz de requisitos legales aplicables','Actualización periódica de la legislación','Recomendaciones de adecuación y responsables'],
   steps:[['Relevamiento de tu actividad','Identificamos qué procesos, sustancias y sitios tiene tu organización.'],['Matriz de requisitos','Listamos las normas que aplican, a qué nivel de gobierno y con qué obligaciones.'],['Evaluación de cumplimiento','Contrastamos cada requisito con lo que hoy hace tu organización.'],['Actualización periódica','Revisamos la legislación con la frecuencia que acordemos y te avisamos qué cambió.']],
   who:['Organizaciones que quieren saber qué les exige la ley en ambiente y seguridad y mantenerlo al día sin depender de una planilla desactualizada.'], whoPh:true,
   faq:[['¿Qué es una matriz de requisitos legales?','Es un registro de las normas que aplican a tu organización, con su estado de cumplimiento y responsables. Las normas ISO de ambiente y de seguridad piden tenerlo.'],['¿Cada cuánto se actualiza?','Con la frecuencia que acordemos al comenzar. La legislación cambia a menudo, por eso conviene revisarla de forma periódica.'],['¿Esto reemplaza a un estudio jurídico?','No. Es asesoramiento técnico y legal en ambiente y seguridad. Para litigios o contratos, seguís trabajando con tu abogado.']],
   rel:['higiene-y-seguridad','auditorias','implementacion-normas-iso'] },
 { slug:'reclutamiento-de-personal', name:'Reclutamiento de personal', feat:true, g:1,
   short:'Búsqueda y selección de perfiles que encajan con tu cultura y tus procesos.',
   need:'Incorporar personas con un proceso ordenado y criterios claros.', scope:'Perfil, búsqueda, entrevistas y seguimiento de la incorporación.',
   title:'Reclutamiento y selección de personal en Argentina | Henko',
   desc:'Búsqueda y selección de personal para empresas de toda Argentina, con foco en el encaje con tu cultura y tus procesos de trabajo.',
   h1:'Reclutamiento y <b>selección</b> de personal en Argentina',
   lead:'Buscamos y seleccionamos perfiles acorde a las necesidades, competencias y experiencias. Trabajamos con descripciones de puesto claras y criterios acordados desde el inicio.',
   lines:[['Perfiles','Operativos, técnicos y de gestión'],['Proceso','Cuatro etapas, con criterios acordados'],['Foco','Encaje con tu cultura y tus procesos']],
   includes:['Definición del perfil y de las competencias del puesto','Búsqueda y preselección de candidatos','Entrevistas y evaluación','Presentación de candidatos con criterios claros','Seguimiento de la incorporación'],
   steps:[['Definición del puesto','Acordamos funciones, competencias y lo que el equipo necesita.'],['Búsqueda y preselección','Convocamos y filtramos candidatos según los criterios acordados.'],['Entrevistas y evaluación','Evaluamos competencias y encaje con la cultura de tu organización.'],['Incorporación','Acompañamos los primeros pasos para que la persona se integre al equipo.']],
   who:['Organizaciones que necesitan incorporar personas y quieren un proceso ordenado, con criterios claros y sin perder tiempo de gestión.'], whoPh:true, whoFirst:true,
   faq:[['¿Qué tipo de perfiles buscan?','Perfiles operativos, técnicos y de gestión. Lo conversamos según la necesidad de tu organización.'],['¿Cuánto tarda una búsqueda?','Depende del perfil y del mercado. Acordamos plazos estimados al comenzar.'],['¿Cómo se conecta con los sistemas de gestión?','Las funciones y competencias de cada puesto salen de los mismos procesos que definimos con vos.']],
   rel:['capacitaciones','mejora-de-procesos','implementacion-normas-iso'] },
 { slug:'capacitaciones', name:'Capacitaciones integrales', feat:false, g:1,
   short:'Formación por rol, con ejemplos de tu operación.',
   need:'Que cada equipo trabaje con los mismos criterios.', scope:'Concientización, formación por rol y talleres con tu operación.',
   title:'Capacitaciones integrales para equipos de trabajo | Henko',
   desc:'Capacitaciones adaptadas a las competencias y responsabilidades de cada equipo: calidad, seguridad, ambiente y más. Para empresas de toda Argentina.',
   h1:'Capacitaciones <b>integrales</b> para empresas',
   lead:'Concientizamos a toda la compañía y formamos a cada equipo según sus competencias y responsabilidades, para que las prácticas nuevas se usen todos los días.',
   lines:[['Formación','Por rol y por área'],['Modalidad','Presencial o virtual'],['Registro','Constancia de cada capacitación']],
   includes:['Concientización general para toda la organización','Formación por rol y por área','Talleres con casos de tu propia operación','Material de apoyo y registros de capacitación','Modalidad presencial o virtual'],
   steps:[['Necesidades de formación','Identificamos qué necesita saber cada equipo y en qué nivel.'],['Plan de capacitación','Armamos un cronograma que respeta tus turnos y tu operación.'],['Talleres','Trabajamos con ejemplos reales de tu organización, no con teoría suelta.'],['Registro y seguimiento','Dejamos constancia de lo realizado y revisamos cómo se aplica.']],
   who:['Organizaciones que implementan un sistema de gestión, cambian procesos o quieren que sus equipos trabajen con los mismos criterios.'], whoPh:true, whoFirst:true,
   faq:[['¿Capacitan solo en normas ISO?','No. También en seguridad, ambiente y trabajo en equipo, según lo que necesite tu organización.'],['¿Se adaptan a nuestros turnos?','Sí. Planificamos las sesiones con vos para no frenar la operación.'],['¿Entregan constancia de asistencia?','Sí. Dejamos registro de cada capacitación realizada.']],
   rel:['implementacion-normas-iso','higiene-y-seguridad','mejora-de-procesos'] },
 { slug:'auditorias', name:'Auditorías', feat:false, g:0,
   short:'Revisión interna para llegar bien preparados a la auditoría externa.',
   need:'Saber cómo está tu sistema antes de la auditoría externa.', scope:'Auditoría interna y de cumplimiento, informe y seguimiento.',
   title:'Auditorías internas ISO, ambiente y seguridad | Henko',
   desc:'Auditorías internas y de cumplimiento para saber dónde está tu organización antes de la auditoría de certificación. Servicio para toda Argentina.',
   h1:'Auditorías <b>internas</b> y de cumplimiento',
   lead:'Revisamos tu sistema de gestión y tu cumplimiento legal con mirada externa, para que sepas qué corregir antes de que llegue la auditoría de certificación.',
   lines:[['Alcance','Sistema de gestión y cumplimiento legal'],['Resultado','Informe con hallazgos y plan de acción'],['Después','Seguimiento de las correcciones']],
   includes:['Auditoría interna de sistemas de gestión ISO','Auditoría de cumplimiento legal en ambiente y seguridad','Informe con hallazgos y plan de acción','Seguimiento de las correcciones'],
   steps:[['Alcance y criterios','Acordamos qué se audita y contra qué requisitos.'],['Auditoría','Revisamos documentos, registros y la práctica diaria en el lugar de trabajo.'],['Informe','Te entregamos hallazgos claros, ordenados por prioridad.'],['Seguimiento','Verificamos que las correcciones queden efectivamente implementadas.']],
   who:['Organizaciones que van a pasar una auditoría de certificación o que quieren saber, con mirada externa, cómo está su sistema.'], whoPh:true,
   faq:[['¿Una auditoría interna reemplaza a la de certificación?','No. Es una preparación. La de certificación la realiza un organismo independiente.'],['¿Con qué frecuencia conviene hacerla?','Al menos una vez al año y antes de cada auditoría externa. Las normas ISO piden auditorías internas planificadas.'],['¿Quién ve el informe?','Solo tu organización.']],
   rel:['implementacion-normas-iso','asesoramiento-legal','mejora-de-procesos'] },
 { slug:'mejora-de-procesos', name:'Mejora de procesos y desarrollo de herramientas', feat:false, g:0,
   short:'Indicadores, tableros y registros que tu equipo puede mantener.',
   need:'Que el trabajo no dependa de personas clave y tenga datos para decidir.', scope:'Mapeo de procesos, indicadores, tableros y registros.',
   title:'Mejora de procesos y herramientas de gestión | Henko',
   desc:'Analizamos cómo trabaja tu equipo y desarrollamos herramientas simples para medir y mejorar: indicadores, tableros y registros. Para toda Argentina.',
   h1:'Mejora de <b>procesos</b> y herramientas de gestión',
   lead:'Analizamos cómo se hacen las cosas hoy, detectamos qué frena al equipo y construimos indicadores, tableros y registros, con herramientas y criterios que tu equipo pueda sostener.',
   lines:[['Foco','Procesos e indicadores'],['Herramientas','Tableros, registros y rutinas'],['Requisito','No hace falta una norma ISO']],
   includes:['Relevamiento y mapeo de procesos','Indicadores y tableros de seguimiento','Registros y formularios simples','Rutinas de seguimiento y reuniones de equipo'],
   steps:[['Planificar','Entendemos el proceso actual y acordamos qué mejorar y cómo medirlo.'],['Hacer','Probamos los cambios con el equipo, en pequeño.'],['Verificar','Medimos con indicadores acordados si el cambio funcionó.'],['Actuar','Estandarizamos lo que funciona y ajustamos lo que no.']],
   who:['Organizaciones que sienten que el trabajo depende de personas clave, repite errores o no tiene datos para decidir.'], whoPh:true,
   faq:[['¿Necesitamos tener una norma ISO?','No. Podemos mejorar procesos sin que tu organización esté certificada ni lo esté buscando.'],['¿Qué herramientas usan?','Las que ya usa tu equipo, para no sumar complejidad. Si hace falta algo nuevo, lo elegimos juntos.'],['¿Cómo se mide la mejora?','Con indicadores acordados al empezar, para comparar el antes y el después.']],
   rel:['implementacion-normas-iso','capacitaciones','auditorias'] },
 { slug:'oea-y-rse', name:'OEA y RSE', feat:false, g:3,
   short:'Requisitos del Operador Económico Autorizado (OEA) y estrategia de Responsabilidad Social Empresaria (RSE).',
   need:'Ordenar tu cadena logística o formalizar tu impacto social.', scope:'Requisitos del OEA y estrategia de responsabilidad social.',
   title:'Operador Económico Autorizado (OEA) en Argentina | Henko',
   desc:'Te acompañamos en el Operador Económico Autorizado (OEA) y en tu estrategia de Responsabilidad Social Empresaria (RSE). Para organizaciones de toda Argentina.',
   h1:'Operador Económico <b>Autorizado</b> (OEA) y Responsabilidad Social Empresaria (RSE) en Argentina',
   lead:'Te acompañamos para que tu organización cumpla los requisitos del programa Operador Económico Autorizado (OEA) y para que diseñe y sostenga acciones de Responsabilidad Social Empresaria (RSE) alineadas con su gestión. La autorización del OEA la otorga la Dirección General de Aduanas.',
   lines:[['Ámbitos','OEA y RSE, por separado'],['Autoriza el OEA','Dirección General de Aduanas'],['Incluye','Diagnóstico y plan de adecuación']],
   includes:['Diagnóstico frente a los requisitos del OEA','Plan de adecuación, documentación y procedimientos','Capacitación del equipo en seguridad de la cadena logística','Estrategia y reporte de Responsabilidad Social Empresaria'],
   steps:[['Diagnóstico','Comparamos tu situación actual con los requisitos del programa.'],['Plan de adecuación','Definimos qué ajustar, quién lo hace y en qué plazos.'],['Implementación','Documentamos procedimientos y formamos al equipo.'],['Seguimiento','Mantenemos el sistema vivo para sostener lo logrado en el tiempo.']],
   who:['Operadores de comercio exterior y organizaciones que quieren ordenar su cadena logística o formalizar su impacto social y ambiental.'], whoPh:true,
   faq:[['¿Qué es el Operador Económico Autorizado (OEA)?','Es un programa de la Dirección General de Aduanas de Argentina, creado siguiendo los lineamientos de la Organización Mundial de Aduanas, para operadores de comercio exterior que cumplen con ciertos requisitos de cumplimiento y seguridad.'],['¿Henko otorga la autorización?','No. La otorga la Dirección General de Aduanas. Nosotros te acompañamos a preparar tu organización.'],['¿Qué es la Responsabilidad Social Empresaria (RSE)?','Es la forma en que una organización gestiona su impacto en las personas, la comunidad y el ambiente.']],
   rel:['implementacion-normas-iso','asesoramiento-legal','auditorias'] },
 { slug:'imagen-organizacional', name:'Diseño de imagen organizacional', feat:false, g:1,
   short:'Identidad y comunicación coherentes con tu cultura.',
   need:'Que lo que tu organización muestra coincida con cómo trabaja.', scope:'Identidad, comunicación interna y material institucional.',
   title:'Diseño de imagen organizacional para empresas | Henko',
   desc:'Alineamos cómo se ve y cómo se comunica tu organización con su cultura y sus valores: identidad, comunicación interna y material institucional.',
   h1:'Diseño de <b>imagen</b> organizacional',
   lead:'Ayudamos a que lo que tu organización dice y muestra coincida con cómo trabaja: identidad, comunicación interna y material institucional coherentes con su cultura.',
   lines:[['Ámbitos','Identidad, comunicación y material'],['Parte de','Tu cultura y tus valores']],
   includes:['Revisión de identidad, valores y mensajes','Comunicación interna alineada con la política de la organización','Material institucional coherente'],
   steps:[['Escucha','Conversamos con la dirección y con el equipo sobre cómo se ve hoy la organización.'],['Definición','Acordamos valores, mensajes y criterios de identidad.'],['Diseño','Desarrollamos el material que tu organización necesita.'],['Puesta en uso','Acompañamos su adopción para que se use de forma consistente.']],
   who:['Organizaciones que están creciendo o cambiando y quieren que su imagen y su comunicación reflejen cómo trabajan hoy.'], whoPh:true,
   faq:[['¿Hacen branding completo?','Trabajamos identidad, comunicación y material institucional según lo que cada organización necesite. Lo definimos en la primera reunión.'],['¿Se conecta con el sistema de gestión?','Sí. La política, los valores y la comunicación interna salen del mismo trabajo.'],['¿Cuánto dura?','Depende del alcance. Lo acordamos antes de empezar.']],
   rel:['capacitaciones','mejora-de-procesos','implementacion-normas-iso'] },
];
const bySlug = Object.fromEntries(S.map(s=>[s.slug,s]));
const featured = S.filter(s=>s.feat), others = S.filter(s=>!s.feat);

// Módulo variable de cada ficha (contenido derivado de lo ya redactado)
const li = a => a.map(x=>`<li>${esc(x)}</li>`).join('');
const tile = (t,body,extra='') => `<div class="tile${extra}"><h3 class="h3">${t}</h3>${body}</div>`;
const MOD = {
 'implementacion-normas-iso': { eyebrow:'Normas', title:'Normas con las que trabajamos', cls:'mods mods--3', html:
   [['ISO 9001','Calidad'],['ISO 14001','Ambiente'],['ISO 45001','Seguridad y salud en el trabajo']]
   .map(([c,n])=>`<div class="tile norm"><p class="norm__code">${c}</p><h3 class="h3">${n}</h3></div>`).join(''),
   foot:'<p class="small muted">También trabajamos con <b>ISO 27001</b> (Seguridad de la información) y <span data-placeholder>[segunda norma pendiente]</span>.</p><p class="lead">Henko acompaña. <b>No certifica.</b> En los proyectos de certificación ISO, la certificación la otorga un organismo independiente.</p>' },
 'auditorias': { eyebrow:'Proceso y entregables', title:'Qué revisamos y qué recibís', cls:'mods', html:
   tile('Qué revisamos',`<ul>${li(['Documentos y registros del sistema','La práctica diaria en el lugar de trabajo','El cumplimiento legal en ambiente y seguridad'])}</ul>`)+
   tile('Qué recibís',`<ul>${li(['Informe con hallazgos ordenados por prioridad','Plan de acción con responsables','Seguimiento de las correcciones'])}</ul>`) },
 'higiene-y-seguridad': { eyebrow:'Riesgos, controles y normativa', title:'De los riesgos a los controles', cls:'mods mods--3', html:
   tile('Riesgos','<p>Relevamos puestos, instalaciones y desvíos para identificar dónde hay riesgo.</p>')+
   tile('Controles','<p>Definimos controles operacionales y procedimientos de trabajo seguro con quienes los aplican.</p>')+
   tile('Normativa','<p>Seguimos los requisitos legales que aplican a tu actividad, como la Ley 19.587 y sus decretos reglamentarios.</p>') },
 'asesoramiento-legal': { eyebrow:'Requisitos, evaluación y seguimiento', title:'Del requisito legal al cumplimiento', cls:'mods mods--3', html:
   tile('Requisitos','<p>Una matriz con las normas que aplican a tu actividad, el nivel de gobierno y sus obligaciones.</p>')+
   tile('Evaluación','<p>Contrastamos cada requisito con lo que hoy hace tu organización.</p>')+
   tile('Seguimiento','<p>Actualizamos la legislación con la frecuencia acordada y te avisamos qué cambió.</p>') },
 'oea-y-rse': { eyebrow:'Dos ámbitos', title:'OEA y RSE, por separado', cls:'mods', html:
   tile('Operador Económico Autorizado (OEA)',`<ul>${li(['Diagnóstico frente a los requisitos del programa','Plan de adecuación, documentación y procedimientos','Capacitación en seguridad de la cadena logística'])}</ul><p class="small">La autorización la otorga la Dirección General de Aduanas.</p>`,' area')+
   tile('Responsabilidad Social Empresaria (RSE)',`<ul>${li(['Estrategia de responsabilidad social alineada con tu gestión','Reporte de las acciones realizadas','Acciones que tu organización pueda sostener'])}</ul>`,' area') },
 'mejora-de-procesos': { eyebrow:'Ejemplo y entregables', title:'Cómo se ve una mejora', cls:'mods', html:
   tile('Mapa de proceso','<div class="mini-flow"><span>Entrada</span><i>→</i><span>Actividad</span><i>→</i><span>Control</span><i>→</i><span>Salida</span><i>→</i><span>Indicador</span></div><p class="small">Ejemplo ilustrativo, no corresponde a un cliente.</p>')+
   tile('Qué entregamos',`<ul>${li(['Indicadores y tableros de seguimiento','Registros y formularios simples','Rutinas de seguimiento para el equipo'])}</ul>`) },
 'capacitaciones': { eyebrow:'Modalidades', title:'Cómo formamos a tu equipo', cls:'mods mods--3', html:
   tile('Concientización general','<p class="mono">Fase 1</p><p>Para toda la organización: por qué y para qué cambian las prácticas.</p>')+
   tile('Formación por rol y área','<p class="mono">Fase 2</p><p>Cada equipo aprende lo que necesita para su responsabilidad.</p>')+
   tile('Talleres con tu operación','<p class="mono">Fase 3</p><p>Casos reales de tu organización, para aplicarlo en el trabajo diario.</p>'),
   foot:'<p data-placeholder>Modalidad presencial o virtual, según lo que acordemos.</p>' },
 'reclutamiento-de-personal': { eyebrow:'Proceso de búsqueda', title:'Qué entregamos en cada fase', cls:'mods', html:
   tile('Perfil','<p>Descripción del puesto y de las competencias que necesita.</p>')+
   tile('Búsqueda','<p>Candidatos preseleccionados según los criterios acordados.</p>')+
   tile('Evaluación','<p>Entrevistas y presentación de candidatos con criterios claros.</p>')+
   tile('Incorporación','<p>Seguimiento de los primeros pasos de la persona en el equipo.</p>') },
 'imagen-organizacional': { eyebrow:'Ámbitos de intervención', title:'Dónde intervenimos', cls:'mods mods--3', html:
   tile('Identidad','<p>Valores, mensajes y criterios de imagen.</p>')+
   tile('Comunicación interna','<p>Alineada con la política y la cultura de la organización.</p>')+
   tile('Material institucional','<p>Piezas coherentes con lo anterior.</p>')+
   `<div class="tile" data-placeholder><h3 class="h3">Piezas aprobadas</h3><p>Ejemplos de piezas, pendientes de aprobación de Henko.</p></div>` },
};

// ------------------------------------------------------------ piezas
const ld = o => `  <script type="application/ld+json">\n${JSON.stringify(o,null,2)}\n  </script>`;
const ORG = { '@type':'Organization', '@id':DOM+'/#organization', name:'Henko', url:DOM+'/', logo:DOM+'/assets/logo/Henko-logo-tinta.svg',
  description:'Consultora de sistemas de gestión ISO que acompaña a organizaciones de toda Argentina.', areaServed:{ '@type':'Country', name:'Argentina' },
  email:EMAIL, contactPoint:[{ '@type':'ContactPoint', contactType:'customer service', email:EMAIL, telephone:'+54 9 11 6869-9081', availableLanguage:'es', areaServed:'AR' }] };

function head({title,desc,path,schema=[],og='home'}) {
  return `<!doctype html>
<html lang="es-AR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${attr(desc)}">
  <!-- Pre-lanzamiento: quitar noindex (aquí, en vercel.json y en robots.txt) y sustituir el dominio provisional al publicar -->
  <meta name="robots" content="noindex, nofollow">
  <link rel="canonical" href="${DOM}${path}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_AR">
  <meta property="og:site_name" content="Henko">
  <meta property="og:title" content="${attr(title)}">
  <meta property="og:description" content="${attr(desc)}">
  <meta property="og:url" content="${DOM}${path}">
  <meta property="og:image" content="${DOM}/assets/og/${og}.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#FAF9F5">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon.ico" sizes="32x32 48x48">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="preload" href="/assets/fonts/schibsted-grotesk-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/tokens.css">
  <link rel="stylesheet" href="/assets/css/base.css">
  <link rel="stylesheet" href="/assets/css/site.css">
  <script>document.documentElement.className += ' js';</script>
${schema.map(ld).join('\n')}
</head>
<body>
  <a class="skip-link" href="#contenido">Saltar al contenido</a>
`;
}
function header(cur='') {
  return `
  <header class="site-header surface on-blanco">
    <div class="container">
      <a class="logo" href="/" aria-label="Henko, ir al inicio">
        <img src="/assets/logo/Henko-logo-tinta.svg" width="112" height="31" alt="Henko">
      </a>
      <nav class="nav" id="menu" aria-label="Principal">
        <ul>
          <li><a href="/servicios/"${cur==='servicios'?' aria-current="page"':''}>Servicios</a></li>
          <li><a href="/#metodologia">Cómo trabajamos</a></li>
        </ul>
      </nav>
      <a class="btn header-cta" href="/#contacto">Hablemos</a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="menu" aria-label="Abrir menú"><span></span><span></span><span></span></button>
    </div>
  </header>
`;
}
function footer() {
  return `
  <footer class="site-footer surface on-tinta">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="logo logo--lg" href="/" aria-label="Henko, ir al inicio">
            <img src="/assets/logo/Henko-logo-blanco-calido.svg" width="136" height="37" alt="Henko">
          </a>
          <p>Consultoría en sistemas de gestión para organizaciones de toda Argentina.</p>
        </div>
        <div class="footer-nav">
          <details class="fold" open>
            <summary>Navegación</summary>
            <ul>
              <li><a href="/">Inicio</a></li>
              <li><a href="/servicios/">Servicios</a></li>
              <li><a href="/#metodologia">Cómo trabajamos</a></li>
              <li><a href="/#preguntas">Preguntas frecuentes</a></li>
            </ul>
          </details>
          <details class="fold" open>
            <summary>Servicios</summary>
            <ul>
${featured.map(s=>`              <li><a href="/servicios/${s.slug}/">${esc(s.name)}</a></li>`).join('\n')}
              <li><a href="/servicios/">Ver todos los servicios</a></li>
            </ul>
          </details>
        </div>
        <div class="footer-contact">
          <h2>Contacto</h2>
          <ul>
            <li><a href="mailto:${EMAIL}">${EMAIL}</a></li>
            <li><a href="${WA_URL}" rel="noopener">WhatsApp ${WA_TXT}</a></li>
          </ul>
        </div>
      </div>
      <div class="site-footer__meta">
        <span>© 2026 Henko</span>
        <span data-placeholder>Privacidad (pendiente)</span>
      </div>
    </div>
  </footer>
  <script src="/assets/js/site.js" defer></script>
</body>
</html>
`;
}
// faq: [pregunta, respuesta, ¿pendiente de Henko?]
const faqHtml = (faq, {open=false,compact=false}={}) => `<div class="faq${compact?' faq--compact':''}">
${faq.map(([q,a,ph],i)=>`          <details${open&&i===0?' open':''}${ph?' data-placeholder':''}>
            <summary>${esc(q)}</summary>
            <div class="faq__a"><p>${esc(a)}</p></div>
          </details>`).join('\n')}
        </div>`;
const faqLd = faq => ({ '@context':'https://schema.org','@type':'FAQPage', mainEntity: faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}})) });
const crumbLd = items => ({ '@context':'https://schema.org','@type':'BreadcrumbList', itemListElement: items.map(([n,p],i)=>({'@type':'ListItem',position:i+1,name:n,item:DOM+p})) });

const WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.3-4.2A8 8 0 1 1 8.4 18.8L4 20z"/><path d="M9 9.2c.2 2.3 2.5 4.6 4.8 4.8l1.2-1.2-1.7-.9-.8.6c-.9-.4-1.7-1.2-2.1-2.1l.6-.8-.9-1.7L9 9.2z"/></svg>';
const formHtml = () => `<form class="form" action="${FORM_ENDPOINT || '#'}" method="post" ${FORM_ENDPOINT ? `data-endpoint="${FORM_ENDPOINT}"` : 'data-placeholder'} novalidate>
          <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">
          <p class="form__note small">Los campos con <span class="req" aria-hidden="true">*</span><span class="sr-only">asterisco</span> son obligatorios.</p>
          <div class="form__row form__row--2">
            <div class="field"><label for="nombre">Nombre y apellido <span class="req" aria-hidden="true">*</span></label><input id="nombre" name="nombre" type="text" autocomplete="name" required></div>
            <div class="field"><label for="empresa">Empresa (opcional)</label><input id="empresa" name="empresa" type="text" autocomplete="organization"></div>
          </div>
          <div class="form__row form__row--2">
            <div class="field"><label for="email">Email <span class="req" aria-hidden="true">*</span></label><input id="email" name="email" type="email" autocomplete="email" required></div>
            <div class="field"><label for="telefono">Teléfono (opcional)</label><input id="telefono" name="telefono" type="tel" inputmode="tel" autocomplete="tel"></div>
          </div>
          <div class="field">
            <label for="servicio">¿En qué podemos ayudarte?</label>
            <select id="servicio" name="servicio">
              <option value="">Elegí una opción</option>
              <option value="orientacion">Necesito orientación para empezar</option>
${S.map(s=>`              <option value="${s.slug}">${esc(s.name)}</option>`).join('\n')}
            </select>
          </div>
          <div class="field"><label for="mensaje">Mensaje <span class="req" aria-hidden="true">*</span></label><textarea id="mensaje" name="mensaje" required></textarea></div>
          <label class="check"><input type="checkbox" name="privacidad" required><span>Acepto que Henko use estos datos para responder mi consulta. <span data-placeholder>Política de privacidad (pendiente)</span> <span class="req" aria-hidden="true">*</span></span></label>
          <div><button class="btn btn--dark" type="submit">Enviar consulta</button></div>
          <p class="form__status" role="status" aria-live="polite" hidden></p>
          <div class="form__after">
            <p>Leemos tu consulta y conversamos sobre los próximos pasos. Respondemos en menos de 24 horas hábiles.</p>
            <p>¿Dudas? <a href="#preguntas">Mirá las preguntas frecuentes ↓</a></p>
          </div>
        </form>`;

// Banda de cierre compacta (todas las páginas)
const closeBand = () => `
    <section class="close-band surface on-terracota">
      <div class="container close-band__in">
        <div><h2 class="h2">Contanos qué necesita tu empresa.</h2><p>Te ayudamos a definir por dónde empezar.</p></div>
        <a class="btn btn--light" href="/#contacto">Hablemos</a>
      </div>
    </section>`;

// ------------------------------------------------------------ HOME
const cards = () => `<div class="cards" data-placeholder>
${featured.map(s=>`          <a class="card tile" href="/servicios/${s.slug}/">
            <div class="ph-photo mono" role="img" aria-label="Espacio reservado para una foto ilustrativa">Foto · ${esc(s.name)}</div>
            <div class="card__body">
              <h3 class="h3">${esc(s.name)}</h3>
              <p>${esc(s.short)}</p>
              <span class="link-arrow">Ver servicio</span>
            </div>
          </a>`).join('\n')}
        </div>
        <div class="more">
          <h3 class="h3 more__t">También podemos acompañarte en…</h3>
          <div class="more__list">
${others.map(s=>`            <a class="more__row" href="/servicios/${s.slug}/">
              <span class="h3">${esc(s.name)}</span>
              <p>${esc(s.short)}</p>
              <span class="more__go" aria-hidden="true">→</span>
            </a>`).join('\n')}
          </div>
          <p class="more__foot"><a class="link-arrow" href="/servicios/">Explorá todos los servicios</a></p>
        </div>`;
const board = `<div class="board" aria-hidden="true">
            <div class="board__col"><div class="board__h"><span>Planificar</span><span>01</span></div>
              <div class="note surface on-lavanda-light" style="--i:1">Diagnóstico</div>
              <div class="note surface on-arena" style="--i:2">Procesos</div>
              <div class="slot slot--live"><div class="note surface on-terracota">Indicadores</div></div>
              <div class="note note--echo surface on-terracota" style="--k:0">Indicadores</div>
            </div>
            <div class="board__col"><div class="board__h"><span>Hacer</span><span>02</span></div>
              <div class="note surface on-lavanda" style="--i:3">Documentar</div>
              <div class="note surface on-lavanda-light" style="--i:4">Capacitar</div>
              <div class="slot"></div>
              <div class="note note--echo surface on-terracota" style="--k:1">Indicadores</div>
            </div>
            <div class="board__col"><div class="board__h"><span>Verificar</span><span>03</span></div>
              <div class="note surface on-arena" style="--i:5">Auditar</div>
              <div class="slot"></div>
              <div class="slot"></div>
              <div class="note note--echo surface on-terracota" style="--k:2">Indicadores</div>
            </div>
            <div class="board__col"><div class="board__h"><span>Actuar</span><span>04</span></div>
              <div class="note surface on-tinta" style="--i:6">Mejorar</div>
              <div class="slot"></div>
              <div class="slot"></div>
              <div class="note note--echo surface on-terracota" style="--k:3">Indicadores</div>
            </div>
          </div>`;
// Respuestas todavía por confirmar con Henko: tercer elemento true
const homeFaq = [
 ['¿Henko emite la certificación?','No. Henko acompaña, no certifica: implementamos el sistema y preparamos a tu organización; la certificación ISO la otorga un organismo independiente después de su propia auditoría.',false],
 ['¿Cómo es la primera reunión?','Es sin costo y dura entre 40 minutos y 1 hora. La pactamos con tu empresa y acordamos quiénes deberían participar. Nos presentamos, nos contás qué necesitás, resolvemos dudas y te explicamos cómo trabajamos según tu caso. Con lo que relevamos, preparamos una propuesta comercial.',false],
 ['¿Pueden ayudarnos si todavía no tenemos un sistema de gestión?','Sí. Empezamos con un diagnóstico de cómo trabaja tu organización hoy y acordamos por dónde empezar.',true],
 ['¿Podemos mejorar procesos sin buscar una certificación?','Sí. Podemos mejorar procesos, indicadores y registros sin que tu organización busque una certificación.',true],
 ['¿Cómo se define el alcance del acompañamiento?','Lo definimos con vos después de un diagnóstico inicial: qué se trabaja, con qué plazos y quién es responsable de cada tema.',true],
 ['¿Trabajan de forma presencial o a distancia?','Sí, trabajamos de forma presencial y a distancia, en todo el país y también fuera de Argentina.',false],
 ['¿De qué depende el tiempo de implementación?','Depende de la disponibilidad de recursos, de la cantidad de sitios a implementar y de las normas. Como referencia, una implementación lleva entre 6 y 9 meses.',false],
];
const phva = (variant='') => `<div class="phva${variant}">
          <ol class="phva__list">
            <li class="phva__step surface on-arena"><h3 class="h3">Planificar</h3><p>Entendemos tu organización y acordamos objetivos y responsables.</p></li>
            <li class="phva__step surface on-lavanda-light"><h3 class="h3">Hacer</h3><p>Implementamos con el equipo, paso a paso.</p></li>
            <li class="phva__step surface on-lavanda"><h3 class="h3">Verificar</h3><p>Medimos, auditamos internamente y revisamos qué funciona.</p></li>
            <li class="phva__step surface on-tinta"><h3 class="h3">Actuar</h3><p>Corregimos y estandarizamos lo aprendido.</p></li>
          </ol>
          <p class="phva__loop"><span>Y se vuelve a Planificar</span></p>
        </div>`;
const home = head({
  title:'Henko | Consultoría en sistemas de gestión ISO en Argentina',
  desc:'Acompañamos a empresas de toda Argentina a implementar y sostener sistemas de gestión ISO. Preparamos a tu equipo para la auditoría de certificación.',
  path:'/', og:'home',
  schema:[{ '@context':'https://schema.org','@graph':[ORG,{ '@type':'WebSite','@id':DOM+'/#website', url:DOM+'/', name:'Henko', inLanguage:'es-AR', publisher:{'@id':DOM+'/#organization'} }]}, faqLd(homeFaq)]
}) + header() + `
  <main id="contenido">
    <section class="hero surface on-blanco">
      <div class="container">
        <h1 class="display">Gestión, procesos y mejoras adaptadas para <mark class="mark">cada empresa</mark>.</h1>
        <div class="hero__grid">
          <div class="stack">
            <p class="lead">Henko entiende cómo se trabaja y se construye en equipo, transforma a las organizaciones desde adentro, generando sistemas de gestión que no solo cumplan requisitos, sino que aporten valor al negocio y se mantengan en el tiempo.</p>
            <div class="hero__actions">
              <a class="btn" href="#contacto">Contanos qué necesitás</a>
              <a class="btn btn--outline" href="/servicios/">Ver servicios</a>
            </div>
          </div>
          ${board}
        </div>
      </div>
    </section>

    <section class="section--compact section--flush-top surface on-blanco">
      <div class="container">
        <!-- Cifras: +10 y +60 mantenidas por decisión de Tomás; confirmar con Henko -->
        <div class="stats reveal">
          <p class="stat"><span class="stat__n" data-count="10" data-prefix="+">+10</span><span class="stat__l">Años de experiencia acumulada del equipo</span></p>
          <p class="stat"><span class="stat__n" data-count="60" data-prefix="+">+60</span><span class="stat__l">Empresas acompañadas</span></p>
          <p class="stat"><span class="stat__n">A medida</span><span class="stat__l">Acompañamiento adaptado a tu empresa</span></p>
        </div>
        <div class="logos reveal">
          <h2 class="logos__t">Organizaciones con las que trabajamos</h2>
          <div class="logos__row" role="group" aria-label="Logos de clientes (espacios reservados)">${'<div class="ph-logo mono" data-placeholder>Logo cliente</div>'.repeat(6)}</div>
        </div>
      </div>
    </section>

    <section class="section surface on-arena" id="servicios">
      <div class="container">
        <div class="sec-head reveal">
          <h2 class="h1">Lo que hacemos en conjunto</h2>
        </div>
        ${cards()}
      </div>
    </section>

    <section class="band surface on-terracota">
      <div class="container reveal">
        <div class="band__in">
          <p class="eyebrow">Nuestro rol</p>
          <h2 class="h1">El cambio se construye <mark class="mark">desde dentro</mark> de la organización.</h2>
          <p class="lead">Entendemos cómo trabaja tu empresa, acordamos un plan e implementamos las mejoras junto a tu equipo.</p>
          <p><a class="link-arrow" href="/#metodologia">Conocé nuestra forma de trabajar</a></p>
          <p class="band__note">En los proyectos de certificación ISO, la certificación la otorga un organismo independiente.</p>
        </div>
      </div>
    </section>

    <section class="section surface on-blanco" id="metodologia">
      <div class="container">
        <div class="sec-head reveal">
          <p class="eyebrow">Metodología</p>
          <h2 class="h1">Una forma de <b>mejorar</b> con tu equipo</h2>
          <p class="lead">Trabajamos con el ciclo Planificar, Hacer, Verificar y Actuar (PHVA), con tu equipo en cada etapa.</p>
        </div>
        ${phva(process.env.PHVA_LIGHT ? ' phva--light' : '')}
      </div>
    </section>

    <section class="section surface on-arena">
      <div class="container about reveal">
        <div class="ph-photo mono" data-placeholder role="img" aria-label="Espacio reservado para una foto de Marina Boeri, directora de Henko">Foto · Directora</div>
        <div class="about__text">
          <p class="eyebrow">Quién está detrás</p>
          <h2 class="h3">Marina Boeri</h2>
          <p class="mono">Directora</p>
          <!-- PENDIENTE: bio de Marina Boeri (2 a 3 líneas). Poner el texto en este <p> y quitar hidden y data-placeholder. -->
          <p class="about__bio" data-placeholder hidden></p>
        </div>
      </div>
    </section>

    <section class="section surface on-blanco">
      <div class="container">
        <div class="sec-head reveal">
          <p class="eyebrow">Testimonios</p>
          <h2 class="h1">Lo que dicen quienes trabajaron con nosotros</h2>
        </div>
        <div class="quotes reveal">
          ${[1,2,3].map(()=>`<blockquote class="quote tile" data-placeholder><p class="mono">Testimonio de ejemplo</p><p class="quote__text">Aquí irá la cita real de un cliente, de dos o tres frases, sobre cómo fue trabajar con Henko.</p><p class="small">Nombre autorizado · Cargo · Empresa</p></blockquote>`).join('\n          ')}
        </div>
      </div>
    </section>

    <section class="section surface on-lavanda-light" id="contacto">
      <div class="container">
        <div class="contact">
          <div class="contact__side">
            <p class="eyebrow">Contacto</p>
            <h2 class="h1">Contanos qué querés <b>mejorar</b>.</h2>
            <p class="body">Contanos qué necesitás ordenar o mejorar. Completá el formulario o escribinos por WhatsApp, como te resulte más cómodo.</p>
            <p><a class="btn btn--dark" href="${WA_URL}" rel="noopener">${WA_ICON}Escribinos por WhatsApp</a></p>
            <p class="contact__mail"><a href="mailto:${EMAIL}">${EMAIL}</a></p>
          </div>
          ${formHtml()}
        </div>
      </div>
    </section>

    <section class="section surface on-blanco" id="preguntas">
      <div class="container split">
        <div class="stack reveal">
          <p class="eyebrow">Preguntas frecuentes</p>
          <h2 class="h1">Antes de empezar</h2>
        </div>
        ${faqHtml(homeFaq,{open:true})}
      </div>
    </section>
  </main>
` + footer();

// ------------------------------------------------------------ SERVICIOS (página índice)
const dirBand = (g,i) => `
    <section class="section surface ${i%2===0?'on-blanco':'on-arena'}">
      <div class="container dir" data-placeholder>
        <div class="dir__head">
          <p class="eyebrow">${esc(G[g].tag)}</p>
          <h2 class="h2">${esc(G[g].name)}</h2>
          <p class="muted">${esc(G[g].line)}</p>
        </div>
        <div class="dir__rows">
${S.filter(s=>s.g===g).map(s=>`          <a class="dir__row" href="/servicios/${s.slug}/">
            <span class="h3">${esc(s.name)}</span>
            <span class="dir__go" aria-hidden="true">→</span>
            <p>${esc(s.need)}</p>
            <p class="small muted">${esc(s.scope)}</p>
          </a>`).join('\n')}
        </div>
      </div>
    </section>`;
const hub = head({
  title:'Servicios de consultoría ISO, seguridad y RR. HH. | Henko',
  desc:'Implementación de normas ISO, higiene y seguridad, asesoramiento legal, reclutamiento y más. Nueve servicios para organizaciones de toda Argentina.',
  path:'/servicios/', og:'servicios',
  schema:[{ '@context':'https://schema.org', '@type':'CollectionPage', name:'Servicios de Henko', url:DOM+'/servicios/', isPartOf:{'@id':DOM+'/#website'}, hasPart:S.map(s=>({'@type':'Service',name:s.name,url:DOM+'/servicios/'+s.slug+'/'})) }, crumbLd([['Inicio','/'],['Servicios','/servicios/']])]
}) + header('servicios') + `
  <main id="contenido">
    <section class="page-hero surface on-blanco">
      <div class="container">
        <nav aria-label="Migas de pan"><ol class="crumbs mono"><li><a href="/">Inicio</a></li><li aria-current="page">Servicios</li></ol><a class="link-arrow crumbs-back" href="/">Volver al inicio</a></nav>
        <h1 class="display display--page">Servicios para mejorar cómo <b>trabaja</b> tu empresa.</h1>
        <p class="lead answer">Henko ofrece nueve servicios que se combinan según el momento de tu organización: desde implementar una norma ISO hasta capacitar al equipo, auditar internamente o seleccionar personal.</p>
      </div>
    </section>

    <section class="section surface on-arena">
      <div class="container split">
        <div class="stack"><p class="eyebrow">Orientación</p><h2 class="h2">¿Por dónde empezar?</h2></div>
        <!-- El mapeo escenario → servicio lo valida Henko -->
        <div class="paths" data-placeholder>
          <a class="path" href="/servicios/implementacion-normas-iso/"><span class="path__q">Queremos certificar por primera vez</span><span class="path__s">Implementación de normas ISO</span><span class="path__go" aria-hidden="true">→</span></a>
          <a class="path" href="/servicios/auditorias/"><span class="path__q">Ya tenemos sistema y se viene la auditoría</span><span class="path__s">Auditorías</span><span class="path__go" aria-hidden="true">→</span></a>
          <a class="path" href="/servicios/capacitaciones/"><span class="path__q">Queremos formar a nuestro equipo</span><span class="path__s">Capacitaciones integrales</span><span class="path__go" aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>
${G.map((_,g)=>dirBand(g,g)).join('\n')}

    <section class="section surface on-blanco">
      <div class="container split">
        <div class="stack"><p class="eyebrow">Combinaciones</p><h2 class="h2">Servicios que se pueden combinar</h2></div>
        <div>
          <p class="lead">Los servicios no son compartimentos cerrados. Por ejemplo, para llegar a una certificación podés combinar la implementación de la norma con la capacitación del equipo y una auditoría interna antes de la auditoría externa.</p>
          <p class="combo"><a href="/servicios/implementacion-normas-iso/">Implementación ISO</a><i>+</i><a href="/servicios/capacitaciones/">Capacitaciones</a><i>+</i><a href="/servicios/auditorias/">Auditoría interna</a></p>
        </div>
      </div>
    </section>

    <section class="section surface on-arena">
      <div class="container">
        <div class="sec-head"><p class="eyebrow">Cómo empezamos</p><h2 class="h2">Tres pasos antes de empezar a trabajar</h2></div>
        <ol class="startrow">
          <li><span class="mono">01</span><h3 class="h3">Conversamos</h3><p class="muted">Nos contás qué necesitás y cómo trabaja tu empresa.</p></li>
          <li><span class="mono">02</span><h3 class="h3">Relevamos</h3><p class="muted">Entendemos tu situación actual y tus prioridades.</p></li>
          <li><span class="mono">03</span><h3 class="h3">Acordamos un plan</h3><p class="muted">Definimos alcance, plazos y responsables.</p></li>
        </ol>
      </div>
    </section>
${closeBand()}
  </main>
` + footer();

// ------------------------------------------------------------ FICHAS
// Panel de la ficha: mismo componente para los 9 servicios (nodos con flechas, bloque punteado para lo externo).
// Contenido propio de cada servicio, tomado de lo ya redactado en includes, steps y FAQ.
const FLOW = {
  'implementacion-normas-iso': { t:'Cómo se ordena el trabajo',
    nodes:[['Operación y procesos','Relevamiento de los procesos y metodologías actuales'],['Implementación y adaptación de mejoras','Incorporación de políticas organizacionales, estandarización de procesos, definición de objetivos'],['Cultura y seguimiento','Capacitación a todo el equipo según procesos, auditoría interna y seguimiento']],
    ext:['Organismo certificador','Externo e independiente. Es quien otorga la certificación.'] },
  'higiene-y-seguridad': { t:'Cómo se ordena el trabajo',
    nodes:[['Relevamiento de riesgos','Puestos e instalaciones'],['Controles y procedimientos','Definidos con quienes los aplican'],['Capacitación y seguimiento','Los controles se mantienen y se actualizan']],
    ext:['Normativa aplicable','Ley 19.587 y decretos reglamentarios.'] },
  'asesoramiento-legal': { t:'Cómo se ordena el trabajo',
    nodes:[['Actividad','Relevamiento de actividades y aplicabilidad de normativa'],['Desarrollo de matriz','Normas que aplican y sus obligaciones'],['Evaluación de cumplimiento','Cada requisito frente a lo que hoy hace tu organización']],
    ext:['Cambios en la legislación','Se comunican las novedades aplicables a cada organización.'] },
  'reclutamiento-de-personal': { t:'Cómo se ordena el trabajo',
    nodes:[['Definición del puesto','Funciones, competencias y experiencias'],['Búsqueda y evaluación','Preselección, entrevistas y presentación de candidatos'],['Incorporación','Seguimiento de los primeros pasos']],
    note:'Con criterios acordados desde el inicio' },
  'capacitaciones': { t:'Cómo se ordena el trabajo',
    nodes:[['Necesidades de formación','Qué necesita saber cada equipo'],['Plan y talleres','Con ejemplos de tu propia operación'],['Registro y seguimiento','Constancia de lo realizado y de cómo se aplica']],
    note:'Presencial o virtual' },
  'auditorias': { t:'Cómo se ordena el trabajo',
    nodes:[['Alcance y criterios','Qué se audita y contra qué requisitos'],['Auditoría','Documentos, registros y práctica diaria'],['Informe y seguimiento','Hallazgos por prioridad y correcciones verificadas']],
    ext:['Auditoría de certificación','La realiza un organismo independiente. Esta es una preparación.'] },
  'mejora-de-procesos': { t:'Cómo se ordena el trabajo',
    nodes:[['Planificar','Qué mejorar y cómo medirlo'],['Hacer','Cambios en pequeño, con el equipo'],['Verificar','Indicadores acordados'],['Actuar','Estandarizar lo que funciona']],
    loop:'Y se vuelve a planificar' },
  'oea-y-rse': { t:'Cómo se ordena el trabajo',
    nodes:[['Diagnóstico','Frente a los requisitos del OEA'],['Plan de adecuación','Documentación y procedimientos'],['Implementación y capacitación','Del equipo, en seguridad de la cadena logística']],
    ext:['Dirección General de Aduanas','Es quien otorga la autorización del OEA.'],
    alt:['Responsabilidad Social Empresaria','Estrategia y reporte, por separado del OEA.'] },
  'imagen-organizacional': { t:'Cómo se ordena el trabajo',
    nodes:[['Escucha','Cómo se ve hoy la organización'],['Definición','Valores, mensajes y criterios de identidad'],['Diseño y puesta en uso','Material institucional que se usa de forma consistente']],
    note:'Parte de tu cultura y tus valores' },
};
function fichaPanel(s) {
  const f = FLOW[s.slug];
  const nodes = f.nodes.map(([t,d])=>`            <div class="flow__node">${esc(t)}<small>${esc(d)}</small></div>`).join('\n            <div class="flow__arrow" aria-hidden="true">↓</div>\n');
  const ext = f.ext ? `\n          <div class="flow__ext"><strong>${esc(f.ext[0])}</strong>${esc(f.ext[1])}</div>` : '';
  const alt = f.alt ? `\n          <div class="flow__alt"><strong>${esc(f.alt[0])}</strong>${esc(f.alt[1])}</div>` : '';
  const loop = f.loop ? `\n          <p class="flow__loop"><span aria-hidden="true">↻</span> ${esc(f.loop)}</p>` : '';
  const note = f.note ? `\n          <p class="flow__note">${esc(f.note)}</p>` : '';
  return `<aside class="ficha surface ${G[s.g].on}" aria-label="${esc(f.t)}">
          <p class="mono ficha__t">${esc(f.t)}</p>
          <div class="flow">
${nodes}
          </div>${loop}${ext}${alt}${note}
        </aside>`;
}
const relDesc = { 'implementacion-normas-iso':'Sistemas de gestión con tu equipo.', 'higiene-y-seguridad':'Ambientes de trabajo más seguros.', 'asesoramiento-legal':'Requisitos legales al día.', 'reclutamiento-de-personal':'Búsqueda y selección de perfiles.', 'capacitaciones':'Formación por rol y área.', 'auditorias':'Revisión interna con mirada externa.', 'mejora-de-procesos':'Indicadores, tableros y registros.', 'oea-y-rse':'OEA y responsabilidad social.', 'imagen-organizacional':'Identidad y comunicación coherentes.' };

// Etiqueta (.eyebrow) de un encabezado: se omite si el título ya contiene la etiqueta o su palabra clave (`key`)
const norm = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const eyebrow = (label, title, key=label) => norm(title).includes(norm(key)) ? '' : `<p class="eyebrow">${esc(label)}</p>`;
function page(s) {
  const path = `/servicios/${s.slug}/`;
  const m = MOD[s.slug];
  const sections = [];
  const sec = (id, html, opts={}) => sections.push({ id, html, ...opts });
  const incl = `<div class="container inc">
        <div class="inc__head">${eyebrow('Qué incluye','¿Qué incluye este servicio?')}<h2 class="h2">¿Qué incluye este servicio?</h2></div>
        <div class="inc__photo"><div class="ph-photo mono" data-placeholder role="img" aria-label="Espacio reservado para una foto ilustrativa">Foto · ${esc(s.name)}</div></div>
        <ul class="includes">
${s.includes.map(i=>`          <li>${esc(i)}</li>`).join('\n')}
        </ul>
      </div>`;
  const mod = `<div class="container">
        <div class="sec-head">${eyebrow(m.eyebrow,m.title)}<h2 class="h2">${esc(m.title)}</h2></div>
        <div class="${m.cls}">${m.html}</div>
        ${m.foot ? `<div class="stack" style="margin-top:var(--space-l)">${m.foot}</div>` : ''}
      </div>`;
  const how = `<div class="container">
        <div class="sec-head"><p class="eyebrow">Cómo lo trabajamos</p><h2 class="h2">¿Cómo es el proceso?</h2></div>
        <ol class="stages stages--h" style="--n:${s.steps.length}">
${s.steps.map(([t,d],i)=>`          <li><span class="mono">0${i+1}</span><h3 class="h3">${esc(t)}</h3><p>${esc(d)}</p></li>`).join('\n')}
        </ol>
      </div>`;
  const who = s.whoPh === false
    ? `<div class="container"><div class="sec-head"><h2 class="h2">¿Para quién es?</h2></div><div class="situations situations--3">${s.who.map(w=>{const [t,d]=w.split('|');return `<div class="tile"><h3 class="h3">${esc(t)}</h3><p class="muted">${esc(d)}</p></div>`;}).join('')}</div></div>`
    : `<div class="container split"><div class="stack">${eyebrow('Para quién','¿Para quién es?')}<h2 class="h2">¿Para quién es?</h2></div><div class="situations" data-placeholder>${s.who.map(w=>`<div class="tile"><p>${esc(w)}</p></div>`).join('')}</div></div>`;
  const faq = `<div class="container split" id="preguntas">
        <div class="stack">${eyebrow('Preguntas frecuentes','Preguntas sobre este servicio','preguntas')}<h2 class="h2">Preguntas sobre este servicio</h2></div>
        ${faqHtml(s.faq,{compact:true})}
      </div>`;
  const rel = `<div class="container">
        <div class="sec-head">${eyebrow('Servicios relacionados','Otros servicios que se combinan con este','servicios')}<h2 class="h2">Otros servicios que se combinan con este</h2></div>
        <div class="related">
${s.rel.map(r=>`          <a class="tile" href="/servicios/${r}/"><span><span class="h3">${esc(bySlug[r].name)}</span><p>${esc(relDesc[r])}</p></span><span class="link-arrow">Ver servicio</span></a>`).join('\n')}
        </div>
      </div>`;
  const order = s.whoFirst ? [who, incl, mod, how, faq, rel] : [incl, mod, how, who, faq, rel];
  const body = order.map((h,i)=>{
    const dark = i%2===1;
    const cls = dark ? 'section surface on-arena' : (i===0 ? 'section section--flush-top surface on-blanco' : 'section surface on-blanco');
    return `\n    <section class="${cls}">\n      ${h}\n    </section>`;
  }).join('\n');
  const heroTitle = s.h1;
  return head({
    title:s.title, desc:s.desc, path, og:s.slug,
    schema:[
      { '@context':'https://schema.org','@type':'Service', name:s.name, description:s.desc, url:DOM+path, serviceType:s.name, provider:{'@id':DOM+'/#organization'}, areaServed:{'@type':'Country',name:'Argentina'}, inLanguage:'es-AR' },
      crumbLd([['Inicio','/'],['Servicios','/servicios/'],[s.name,path]]), faqLd(s.faq)
    ]
  }) + header('servicios') + `
  <main id="contenido">
    <section class="page-hero surface on-blanco">
      <div class="container">
        <nav aria-label="Migas de pan"><ol class="crumbs mono"><li><a href="/">Inicio</a></li><li><a href="/servicios/">Servicios</a></li><li aria-current="page">${esc(s.name)}</li></ol><a class="link-arrow crumbs-back" href="/servicios/">Volver a servicios</a></nav>
        <div class="ficha-hero">
          <div>
            <h1 class="h1">${heroTitle}</h1>
            <p class="lead answer">${esc(s.lead)}</p>
            <div class="hero__actions"><a class="btn" href="/?servicio=${s.slug}#contacto">Hablemos</a></div>
          </div>
          ${fichaPanel(s)}
        </div>
      </div>
    </section>
${body}
${closeBand()}
  </main>
` + footer();
}

// ------------------------------------------------------------ 404
const notFound = head({
  title:'Página no encontrada | Henko',
  desc:'No encontramos la página que buscás. Volvé al inicio, mirá los servicios de Henko o escribinos para que te ayudemos.',
  path:'/404/', og:'home', schema:[]
}) + header() + `
  <main id="contenido">
    <section class="nf surface on-blanco">
      <div class="container">
        <p class="eyebrow">Error 404</p>
        <h1 class="display display--page">No encontramos esta <mark class="mark">página</mark>.</h1>
        <p class="lead" style="margin-top:var(--space-m)">Puede que el enlace haya cambiado. Mirá los servicios o contanos qué estabas buscando.</p>
        <div class="hero__actions"><a class="btn" href="/servicios/">Ver servicios</a><a class="btn btn--outline" href="/#contacto">Contanos qué buscás</a></div>
      </div>
    </section>
  </main>
` + footer();

// ------------------------------------------------------------ salida
const out = (rel, html) => { const f = join(ROOT, rel); mkdirSync(join(f, '..'), { recursive:true }); writeFileSync(f, html); console.log('escrito', rel); };
out('index.html', home);
out('servicios/index.html', hub);
for (const s of S) out(`servicios/${s.slug}/index.html`, page(s));
out('404.html', notFound);
