# GitHub bootstrap

From an empty folder on your machine:

```bash
mkdir synchronize && cd synchronize
# drop DESIGN.md, CLAUDE.md, README.md, CLAUDE_STARTER_PROMPT.md into the root
# drop src-seed/content.ts somewhere you can copy from (or into src/copy later)

git init
git add DESIGN.md CLAUDE.md README.md CLAUDE_STARTER_PROMPT.md GITHUB.md src-seed
git commit -m "docs: SYNCHRONIZE design spec for implementation"

gh repo create synchronize --public --source=. --remote=origin --push
```

Then open the repo in Claude Code and paste `CLAUDE_STARTER_PROMPT.md`.

## Pages (after the app builds)

`vite.config.ts` should set:

```ts
export default defineConfig({
  base: "/synchronize/",
  plugins: [react()],
})
```

Add `.github/workflows/pages.yml` if you want auto-deploy on push to `main`:

```yaml
name: pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.dep.outputs.page_url }}
    steps:
      - id: dep
        uses: actions/deploy-pages@v4
```

Enable Pages → GitHub Actions in repo settings.

Live URL will be `https://<you>.github.io/synchronize/`.
