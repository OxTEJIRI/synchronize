# SYNCHRONIZE

A civic operating system you can feel.

Unofficial interactive workshop for the Society Protocol Creator Contest. You name an Actor, walk four eras of human coordination, mint a Synchronized State, watch Energy move, then break the bind on purpose and leave a Lifeline.

**Thesis:** Society Protocol is a clock that learned how to be a state — and every clock can be captured.

This repo is the product. Spec: [`DESIGN.md`](./DESIGN.md). Agent brief: [`CLAUDE.md`](./CLAUDE.md).

## Contest mapping

| Act | Track |
|---|---|
| I · Clock | Philosophical & historical context |
| II · Society / Energy | Hopeful vision |
| III · Break | Honest critical analysis |

## Run

```bash
npm install
npm run dev
```

```bash
npm run build     # type-check + production build into dist/
npm run preview   # serves at http://localhost:4173/synchronize/
```

Static host: GitHub Pages from the Vite `dist` output. `vite.config.ts` sets `base: "/synchronize/"`, so the site expects to live at `https://<user>.github.io/synchronize/`. Routing is hash-based, so no rewrite rules are needed.

## What this is not

Not an official Society Protocol product. Not a wallet. Not the protocol itself. Concepts are interpretive readings of public material at [societyprotocol.io](https://societyprotocol.io/).

## License

MIT
