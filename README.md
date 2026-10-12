# Normalización de Bases de Datos · Ejercicio Práctico

Aplicación web educativa interactiva que resuelve un caso de estudio completo de normalización, paso a paso, desde una tabla en bruto hasta la 6NF, dejando el MER como evidencia en cada fase.

## Descripción

Este proyecto es un ejercicio práctico guiado para aprender **normalización de bases de datos** aplicando las formas normales sobre un mismo caso de estudio: el registro de inscripción de estudiantes. Cada paso transforma el modelo y muestra el antes/después con diagramas Entidad-Relación (MER) renderizados dinámicamente, acompañados de retos, mini-controles y un examen final de dominio.

Todo el contenido está en español y funciona sin dependencias ni build: basta con abrir `index.html`.

## Características principales

- 🗺️ **Recorrido guiado de 26 pasos** organizados en 5 fases: Inicio → 1NF → 2NF → 3NF → Formas superiores.
- 🗂️ **MER evolutivos**: visor del modelo en cada hito, con entidades nuevas resaltadas y relaciones animadas en SVG.
- 🧩 **Retos rápidos** y **mini-controles** por fase con feedback inmediato.
- 🏁 **Examen final** de 13 preguntas sin feedback hasta entregar, con puntuación, desglose por forma normal y resumen copiable.
- 🎯 **Modo repaso**: navega únicamente por los pasos con fallos pendientes.
- 📚 **Panel de referencia**: chuleta comparativa, glosario de conceptos con buscador y flashcards.
- 💾 **Progreso persistente** en `localStorage` (retos, quizzes, examen y último paso visto).
- ⌨️ Navegación con teclado, diseño responsive y tema oscuro.

## Contenido cubierto

| Fase | Conceptos clave |
|------|-----------------|
| 1NF | Atomicidad, clave primaria, sin grupos repetidos, claves compuestas y foráneas |
| 2NF | Dependencias funcionales y parciales en claves compuestas |
| 3NF | Dependencias transitivas y anomalías de actualización |
| BCNF | Claves candidatas solapadas (3NF estricta) |
| 4NF | Dependencias multivaluadas y productos cartesianos |
| 5NF | Dependencias de unión y filas fantasma |
| 6NF | Descomposición total (clave + un atributo por tabla) |

## Cómo ejecutarlo

No requiere instalación, dependencias ni paso de compilación. Descarga/clona el repositorio y abre `index.html` en tu navegador:

```bash
git clone https://github.com/ManuelCarrascalPragma/normales-db.git
cd normales-db
start index.html   # Windows (o abre el archivo directamente en el navegador)
```

## Estructura del proyecto

```
normales/
├── index.html   # Estructura de la aplicación: cabecera, pasos, modales de referencia y MER
├── styles.css   # Estilos: tema oscuro, entidades MER, quizzes, examen y responsive
├── app.js       # Lógica: contenido de los 26 pasos, renderizado de diagramas, quizzes y examen
└── README.md
```

## Atajos de teclado

| Tecla | Acción |
|-------|--------|
| `←` | Paso anterior |
| `→` | Siguiente paso |
| `Esc` | Cerrar el panel de referencia o el visor MER |

## Tecnologías

- **HTML5** · **CSS3** (custom properties, `color-mix()`, grid/flex) · **JavaScript vanilla**
- Sin frameworks, librerías ni herramientas de build externas.

## Licencia

Este proyecto se distribuye bajo la licencia [MIT](LICENSE).
