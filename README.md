# SIMULADORES-2026

Sitio estático de **simuladores y cuestionarios interactivos** sobre normativa educativa boliviana y textos técnico-pedagógicos. Reúne 20 documentos en 3 módulos, con más de **1.300 preguntas** de autoevaluación con retroalimentación inmediata.

No requiere backend: es HTML, CSS y JavaScript puro, listo para publicarse en GitHub Pages.

---

## Contenido

### 1. Normativa General (8 documentos)
| Documento | Preguntas |
|---|---|
| Constitución Política del Estado | 50 |
| Ley 070 Avelino Siñani – Elizardo Pérez | 80 |
| Ley 045 Contra el Racismo y toda forma de Discriminación | 70 |
| Ley 004 Lucha contra la Corrupción (Marcelo Quiroga Santa Cruz) | 73 |
| Ley 223 General para Personas con Discapacidad | 63 |
| Ley 348 Vida Libre de Violencia para las Mujeres | 68 |
| Ley 548 Código Niña, Niño y Adolescente | 37 |
| Ley 1178 SAFCO – Administración y Control Gubernamentales | 9 |

### 2. Normativa Específica (8 documentos)
| Documento | Preguntas |
|---|---|
| Decreto Supremo N° 4688 – Reglamento del Escalafón Nacional | 70 |
| Resolución Suprema N° 212414 – Faltas y Sanciones del Magisterio | 10 |
| Resolución Ministerial N° 864/2019 – Protocolo de Prevención de Violencia | 66 |
| Resolución Ministerial N° 069/2025 – Educación Inclusiva | 70 |
| Resoluciones Ministeriales N° 0020, 0021 y 0022/2024 – Apertura, Modificación y Cierre de UE | *informativa* |
| Resolución Ministerial N° 0190/2024 – Evaluación del Desarrollo Curricular | 70 |
| Resolución Ministerial N° 800/2015 – Libretas de Calificaciones Electrónicas | 70 |
| Resolución Ministerial N° 001/2026 – Del Subsistema de Educación Regular | 70 |

### 3. Técnico Pedagógico (4 documentos)
| Documento | Preguntas |
|---|---|
| ODS 4 – Educación 2030 (UNESCO) | 105 |
| LIDEI 2022 – Liderazgo Directivo en Iberoamérica (OEI) | 115 |
| Marco para la Gestión y el Liderazgo Educativo Local | 140 |
| ERCE 2019 – Estudio Regional Comparativo y Explicativo (UNESCO – LLECE) | 150 |

**Total: 1.316 preguntas.**

---

## Estructura del proyecto

```
.
├── index.html                  # Panel principal (cada carpeta con su lista de documentos)
├── 404.html                    # Página de error personalizada
├── style.css                   # Tema claro y elegante (base propia)
├── script.js                   # Feedback visual de botones
├── build-modulos.js            # Generador de las páginas de quiz
├── .nojekyll                   # Evita el procesado con Jekyll en GitHub Pages
├── normativa-general/          # 8 documentos
├── normativa-especifica/       # 8 documentos
└── textos-pedagogicos/         # 4 documentos
```

Cada página de quiz es **autónoma**: incluye su propio banco de preguntas dentro de un bloque `const DOC = { … }`.

---

## Cómo usarlo

**En local:** abre `index.html` en el navegador y elige un módulo. Las páginas de quiz cargan Bootstrap 5 y Font Awesome desde CDN, por lo que necesitan conexión a internet.

**En línea:** https://daniel-494847.github.io/INSTITUCIONALIZACION2026/

---

## Formato de las preguntas

Cada pregunta es una cadena con campos separados por `|`:

```
pregunta|respuesta_correcta|mala_1|mala_2|mala_3|retroalimentación
```

- El orden de las opciones se baraja al iniciar, salvo cuando el documento define `orden`.
- La retroalimentación es opcional (algunos bancos usan solo 5 campos).

---

## Tecnologías

- HTML5 · CSS3 · JavaScript (sin frameworks de build)
- [Bootstrap 5.3](https://getbootstrap.com/) (solo en las páginas de quiz, vía CDN)
- [Bootstrap Icons](https://icons.getbootstrap.com/) / [Font Awesome](https://fontawesome.com/) (CDN)
- Tipografía [Inter](https://fonts.google.com/specimen/Inter)

---

## Publicación

El sitio se sirve con **GitHub Pages** desde la rama `main` (raíz del repositorio).

Para actualizar: haz `commit` y `push` a `main`; GitHub Pages publica los cambios automáticamente en 1–2 minutos.

> El archivo `404.html` se sirve para cualquier ruta inexistente y usa rutas absolutas (`/style.css`, `/index.html`), por lo que funciona en cualquier nivel de URL del sitio publicado.

---

## Estado y pendientes

- Bancos de preguntas en ampliación: `61`, `62`, `63`, `Ley 1178`, `RS 212414` y `RM 864/2019`.
- `documentos.js` / `build-modulos.js` no están sincronizados con las páginas editadas a mano.

---

## Autor

**Daniel** — [@Daniel-494847](https://github.com/Daniel-494847)
