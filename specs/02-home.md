# SPEC 02 — Página de inicio (Home) y biblioteca en `/juegos`

> **Estado:** Implementado
> **Depende de:** SPEC 01
> **Fecha:** 2026-11-25
> **Objetivo:** Crear la página de inicio de `references/templates/home-about/home.jsx` en `/` y mover la biblioteca de juegos a `/juegos`.

---

## Por qué existe esta spec

Hoy `/` muestra la biblioteca (SPEC 01). El diseño nuevo en `references/templates/home-about/` define una landing en `/` y deja la biblioteca como una pantalla aparte. Mover la biblioteca cambia enlaces ya existentes (nav, botones de volver, redirecciones), por eso se registra aquí. La pantalla "Acerca de" de la misma carpeta es otra spec.

## Alcance

**Dentro:**

- Nueva página `/` con las 7 secciones del prototipo `home.jsx`:
  1. Hero (siluetas flotantes, título, subtítulo, CTAs EXPLORAR JUEGOS y CREAR CUENTA, indicador DESLIZA).
  2. `// 01` ¿POR QUÉ ARCADE VAULT? (4 tarjetas con icono pixel).
  3. `// 02` JUEGOS DISPONIBLES AHORA (6 mini-tarjetas + botón VER TODOS LOS JUEGOS).
  4. Franja de estadísticas (3 bloques).
  5. `// 03` ACTIVIDAD EN VIVO (últimas puntuaciones + top jugadores con enlace VER SALÓN).
  6. `// 04` PRECIOS (plan único + 3 preguntas frecuentes).
  7. CTA final INSERTAR MONEDA.
- Animación de aparición al hacer scroll (clase `reveal` → `in`) con `IntersectionObserver`.
- La biblioteca actual (hero + `Library`) se mueve tal cual a `/juegos`.
- Nav: nuevo enlace "Inicio" (`/`); "Biblioteca" apunta a `/juegos`. Aplica a barra superior y panel móvil.
- Actualizar los enlaces que hoy apuntan a la biblioteca con `/`:
  - Botón "VOLVER AL VAULT" del detalle y del modal del reproductor → `/juegos`.
  - Botón "VOLVER A LA BIBLIOTECA" del salón → `/juegos`.
- Portar a `app/globals.css` las clases del home que están en `references/templates/home-about/styles.css` y faltan en el tema.

**Fuera de alcance (para specs futuras):**

- Pantalla "Acerca de" y su enlace en la nav (spec aparte).
- Datos reales de actividad, estadísticas o rankings: todo es texto simulado y estático.
- Pagos, planes o créditos funcionales (la sección PRECIOS es solo visual).
- Renombrar `/juegos/[id]` o `/juegos/[id]/jugar`; esas rutas no cambian.
- Redirecciones desde la URL antigua (`/` ya no es la biblioteca; no hay URLs externas que mantener).
- Tests automatizados (el proyecto no tiene framework de tests).
- Rediseño del tema existente.

## Modelo de datos

Estructuras nuevas, solo para el home. Los valores son los de `home.jsx`.

```ts
// lib/home-data.ts
export type Accent = "cyan" | "magenta" | "yellow" | "green";

export type Feature = { icon: "GAMEPAD" | "FREE" | "TROPHY" | "ROCKET"; title: string; desc: string; color: Accent };
export type Stat = { n: string; u: string; s: string };
export type RecentScore = { player: string; game: string; score: number; when: string; color: Accent };
export type TopPlayer = { rank: number; player: string; score: number };
export type Faq = { q: string; a: string };

export const FEATURES: Feature[];       // 4
export const STATS: Stat[];             // 3
export const RECENT_SCORES: RecentScore[]; // 7
export const TOP_PLAYERS: TopPlayer[];  // 5
export const FAQS: Faq[];               // 3
export const PRICING_PERKS: string[];   // 6
```

Convenciones:

- Los juegos de "JUEGOS DISPONIBLES AHORA" salen de `GAMES.slice(0, 6)` (`lib/games.ts`, SPEC 01). No se duplican datos.
- Números con `toLocaleString("es-ES")`.
- Los textos se copian literalmente de `home.jsx`, incluido "12+ JUEGOS" (hay 8 reales; es parte del diseño).

## Plan de implementación

Cada paso deja la app compilando y navegable.

1. Mover la biblioteca: crear `app/juegos/page.tsx` con el contenido actual de `app/page.tsx` (hero + `<Library />`). En ese mismo paso, `app/page.tsx` pasa a un placeholder mínimo para que `/` siga compilando.
2. Actualizar la navegación: en `components/nav.tsx` añadir "Inicio" (`/`), apuntar "Biblioteca" a `/juegos` y ajustar el estado activo (`/` solo en inicio; `/juegos` y `/juegos/*` en biblioteca), en barra y panel móvil.
3. Actualizar los enlaces de retorno: `app/juegos/[id]/page.tsx`, `components/game-player.tsx` y `components/hall-of-fame.tsx` apuntan a `/juegos`. El logo y las redirecciones de `components/auth-form.tsx` siguen yendo a `/` (el nuevo home).
4. Portar el CSS del home: copiar a `app/globals.css` las clases de `styles.css` que faltan (`home-*`, `silo`, `feature-*`, `mini-*`, `stat-*`, `activity-*`, `tick-*`, `top-*`, `pricing-*`, `price-*`, `faq-*`, `final-*`, `section-*`, `reveal`). No modificar las existentes.
5. Crear `lib/home-data.ts` con los datos tipados del modelo.
6. Crear los componentes del home: `components/floating-silhouettes.tsx` y `components/feature-icon.tsx` (SVG de la plantilla, servidor), `components/mini-card.tsx` (enlace a `/juegos/[id]`) y `components/reveal.tsx` (cliente, `IntersectionObserver` que añade la clase `in` una sola vez).
7. Ensamblar `app/page.tsx` con las 7 secciones; CTAs EXPLORAR JUEGOS / VER TODOS LOS JUEGOS / INSERTAR MONEDA → `/juegos`, CREAR CUENTA / EMPEZAR GRATIS → `/auth`, VER SALÓN → `/salon`.
8. Pasada final: respetar `prefers-reduced-motion` en las animaciones nuevas, revisar que no queden enlaces a la biblioteca con `/`, y comparar el home contra `references/templates/home-about/arcade-vault-standalone.html`.

Antes de escribir código, leer en `node_modules/next/dist/docs/` lo relativo a `cacheComponents` y componentes cliente (ver `CLAUDE.md`). El diseño se hace con `/frontend-design`, pero la referencia visual es la plantilla.

## Criterios de aceptación

- [x] `npm run lint` termina sin errores.
- [x] `npm run build` termina sin errores y genera `/`, `/juegos`, `/auth`, `/salon`, `/juegos/[id]` y `/juegos/[id]/jugar`.
- [x] La consola del navegador no muestra errores ni avisos de hidratación en `/` y `/juegos`.
- [x] `/juegos` muestra la biblioteca de SPEC 01 sin cambios: 8 tarjetas, búsqueda "caí" deja solo CAÍDA, chip SHOOTER deja INVASORES y ROCAS, y "NO HAY RESULTADOS" sin coincidencias.
- [x] `/` ya no muestra la biblioteca completa; muestra el hero con el título "EL ARCADE / CLÁSICO ESTÁ / DE VUELTA".
- [x] `/` contiene las secciones `// 01`, `// 02`, `// 03` y `// 04`, la franja de 3 estadísticas y el CTA final "¿LISTO PARA JUGAR?".
- [x] La sección `// 01` muestra 4 tarjetas con icono; `// 02` muestra 6 mini-tarjetas; el ticker tiene 7 filas y el top de jugadores 5 filas.
- [x] Hacer clic en una mini-tarjeta navega a `/juegos/[id]` del juego elegido.
- [x] EXPLORAR JUEGOS, VER TODOS LOS JUEGOS e INSERTAR MONEDA navegan a `/juegos`.
- [x] CREAR CUENTA y EMPEZAR GRATIS navegan a `/auth`; VER SALÓN navega a `/salon`.
- [x] Las secciones con `reveal` empiezan ocultas y reciben la clase `in` al entrar en el viewport.
- [x] Con `prefers-reduced-motion: reduce` las secciones se ven sin animación de aparición.
- [x] La barra muestra Inicio, Biblioteca y Salón de la Fama (sin "Acerca de"); el activo es Inicio en `/`, Biblioteca en `/juegos` y `/juegos/*`, y Salón en `/salon`.
- [x] El panel móvil (375 px) muestra los mismos enlaces con el estado activo correcto.
- [x] VOLVER AL VAULT (detalle y modal del reproductor) y VOLVER A LA BIBLIOTECA (salón) llevan a `/juegos`.
- [x] El logo y el envío del formulario de `/auth` llevan a `/`; la barra muestra "KAI ▾" tras iniciar sesión como "kai".
- [x] A 375 px de ancho `/` no tiene scroll horizontal.
- [x] `grep` de `href="/"` en `components/` y `app/` solo encuentra el logo de la nav y los usos intencionales de "Inicio".

## Decisiones tomadas y descartadas

- **Sí:** biblioteca en `/juegos`. Coincide con `/juegos/[id]` y `/juegos/[id]/jugar` ya existentes y con la UI en español.
- **No:** `/games`. Obligaba a decidir si el detalle y el reproductor también se renombraban; eso amplía el alcance sin aportar al home.
- **Sí:** las 7 secciones completas del prototipo. El usuario pidió seguir el diseño; recortar secciones obligaría a otra spec para recuperarlas.
- **Sí:** copiar los textos de estadísticas y actividad tal cual, estáticos (`lib/home-data.ts`), incluido "12+ JUEGOS". Mismo criterio de datos simulados de SPEC 01.
- **No:** calcular "12+" desde `GAMES.length`. Cambia el texto del diseño y no hay un contador real detrás.
- **Sí:** la nav gana "Inicio"; "Acerca de" no aparece hasta su spec para no dejar un enlace muerto.
- **No:** mostrar "Acerca de" deshabilitado. Es ruido visual temporal.
- **Sí:** el logo y las redirecciones de `/auth` van a `/` (el home). Coincide con la plantilla, donde el logo lleva a "home".
- **Sí:** botones de "volver" a `/juegos`, porque su texto habla de la biblioteca.
- **Sí:** el home usa `GAMES.slice(0, 6)` en lugar de duplicar datos.
- **Sí:** `Reveal` es el único componente cliente nuevo; el resto del home son componentes de servidor.
- **No:** copiar el `useReveal` global de la plantilla (consulta `document.querySelectorAll`). Va contra el modelo de componentes de React.
- **Sí:** no se mantiene una redirección desde la antigua biblioteca en `/`; la ruta pasó a ser el home.

## Riesgos

| Riesgo | Mitigación |
| ------ | ---------- |
| Un enlace a la biblioteca con `/` queda olvidado y lleva al home. | Paso 3 y último criterio de aceptación con `grep` de `href="/"`. |
| Clases CSS del home chocan con las existentes de `globals.css` (`.fade-in`, `.hero-*`, `.btn`). | Solo añadir clases nuevas; si hay colisión de nombre, nombrar la nueva con prefijo `home-` y registrarlo. |
| Secciones con `reveal` quedan invisibles si falla el `IntersectionObserver` o JS está deshabilitado. | `Reveal` añade la clase `in` en el montaje si no existe `IntersectionObserver`; `prefers-reduced-motion` muestra todo sin animar. |
| Home muy largo, lento en móvil por siluetas animadas. | Las siluetas son SVG decorativos con `aria-hidden`; se pausa su animación bajo `prefers-reduced-motion`. |
| `cacheComponents: true` afecta a componentes que usan APIs de navegador. | Solo `Reveal` toca APIs de navegador y es cliente, con efectos dentro de `useEffect`. |

## Qué **no** está en esta spec

- La pantalla "Acerca de".
- Datos reales de actividad, estadísticas o rankings.
- Pagos, suscripciones o créditos funcionales.
- Renombrar o mover `/juegos/[id]` y `/juegos/[id]/jugar`.
- Tests automatizados.
- Rediseño del tema visual.

Cada uno de estos puntos, si se aborda, va en su propia spec.
