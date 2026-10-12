![neurospace cover](docs/design-system/cover.png)

# neurospace
Dein Körper. Wieder deiner. – Ton corps, à nouveau à toi. –  Il tuo corpo, di nuovo tuo.
Sensomotorisches Heimtraining, neurologisch begleitet.

## Design system

Brand book, colour and type tokens, and the cover: see [`docs/design-system/`](docs/design-system/README.md).

## App

The app is a Next.js (App Router) project in TypeScript. The screens follow the design system in
[`docs/design-system/`](docs/design-system/README.md) and use its tokens from `app/globals.css`.

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build
```

Routes: `/` (Heute), `/uebung` (one exercise with a timer), `/verlauf` (progress).

### Deploy on Vercel

Vercel detects Next.js automatically; no `vercel.json` is needed. Import the repository in the Vercel
dashboard, or run `npx vercel` locally. Every push to a branch gets a preview deployment, and `main`
is the production branch.
