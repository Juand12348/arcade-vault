# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Arcade Vault: plataforma para jugar online y competir por la mayor cantidad de puntos. Está en fase inicial (solo el scaffold de Create Next App); el README indica que se sigue Spec Driven Design (`/spec` y `/spec-impl`) con las skills de `Klerith/fernando-skills`.

## Comandos

- `npm run dev` — servidor de desarrollo
- `npm run build` / `npm start` — build y servidor de producción
- `npm run lint` — ESLint (flat config en `eslint.config.mjs`)
- No hay framework de tests configurado todavía.

## Next.js no es el que conoces

`AGENTS.md` advierte que esta versión (Next 16.4, React 19.3) tiene cambios incompatibles con lo que conoces. Antes de escribir código, lee la guía relevante en `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`, `04-community`) y respeta los avisos de deprecación.

## Skills

Usa siempre /frontend-design para diseñar la interfaz de usuario


## Arquitectura / configuración no obvia

- App Router en `app/` (`layout.tsx`, `page.tsx`, `globals.css`). Alias `@/*` apunta a la raíz del repo.
- `next.config.ts` activa flags experimentales: `cacheComponents: true`, `partialPrefetching: true` y `experimental.agentFeedback`. `cacheComponents` cambia el modelo de caché/renderizado: consulta la documentación local antes de usar fetch, datos dinámicos o `use cache`.
- Tailwind CSS v4 se procesa vía `@tailwindcss/turbopack` mediante una regla de Turbopack en `next.config.ts` (no hay `postcss.config`); los tokens de tema están en `app/globals.css` con `@theme inline`.
- Se usan los tipos globales de props de Next (`LayoutProps<"/">` en `app/layout.tsx`), sin importarlos.
