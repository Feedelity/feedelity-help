# Feedelity docs

Customer documentation for [Feedelity](https://feedelity.io), built with [Mintlify](https://mintlify.com).

## Develop locally

Install the Mintlify CLI:

```bash
npm i -g mint
```

From the repo root, where `docs.json` lives, run:

```bash
mint dev
```

Open `http://localhost:3000` to preview.

Before you push, check your changes:

```bash
mint validate
mint broken-links
```

## Structure

- `docs.json`: site config, including navigation, branding, and links
- `*.mdx`: pages
- `logo/`, `favicon.svg`: brand assets that match the web app's logo

See `AGENTS.md` for terminology and writing style.

## Publishing

Pushes to `main` deploy automatically once the Mintlify GitHub app is installed for this repo.
