# CLAUDE.md — instructions for Claude Code

You are implementing **SYNCHRONIZE**, a static single-page workshop about Society Protocol.

Read `DESIGN.md` first. It is the source of truth. If this file and DESIGN.md conflict, DESIGN.md wins.

## Goal

Ship a polished, dark, editorial web app that walks a visitor through:

1. Threshold (name)
2. Act I Clock (four eras, coordination trial)
3. Act II Society (pick Value Functions, mint)
4. Act II Energy (zero-sum simulation + actions)
5. Act III Break (stress toggles that change the sim)
6. Lifeline (downloadable plaque)
7. About

## Stack

- Vite + React + TypeScript
- Hash routing
- Plain CSS with the tokens in DESIGN.md §5
- Canvas for the node field
- No Next.js, no wallet, no backend, no Tailwind unless you can still hit the exact palette and type

## Non-negotiables

- Palette is only `#070706`, cream `#E8DCBA`, gold `#C4A35A`, oxide danger `#B56A3A`, and the dim variants in DESIGN.md. No purple, no electric blue, no neon green.
- Fonts: Cormorant Garamond + IBM Plex Sans + IBM Plex Mono.
- All user-facing strings live in `src/copy/content.ts`.
- Total Energy is conserved at 100.
- Act III toggles must mutate simulation behavior, not only copy.
- `prefers-reduced-motion` disables particles and ring spin.
- Persist session to `localStorage` key `synchronize.v1`.
- Do not add features listed in DESIGN.md §14.

## Build order

1. Scaffold Vite React TS, tokens, fonts, AppShell, hash router
2. Threshold + persist name
3. Act I eras + trial (can be simple canvas/div nodes)
4. Act II setup
5. Simulation loop + Energy screen
6. Act III stresses wired into `simulation.ts`
7. Lifeline + PNG (or plaintext fallback)
8. About + responsive pass
9. README

## How to work

- Small commits.
- After each act, the app must be clickable through what exists.
- Do not stop at placeholder screens with “TODO: fancy viz.” A restrained working canvas beats a broken animation.
- When unsure about copy, use DESIGN.md §3 canonical lines.

## Acceptance

Match DESIGN.md §13 Definition of done.
