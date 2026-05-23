# Lore Vault

A dark fantasy character sheet app — create, customize, and manage your RPG characters with lore, journals, moodboards, and manuscripts in an immersive gothic terminal.

## Run & Operate

- `pnpm --filter @workspace/lore-vault run dev` — run the frontend (workflow managed)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind v3 + shadcn/ui
- Routing: react-router-dom v7
- State: localStorage via useVaultDB hook (no backend needed)
- Fonts: Pixelify Sans, Cinzel, Cormorant Garamond, JetBrains Mono, etc. (Google Fonts)

## Where things live

- `artifacts/lore-vault/src/` — frontend source
- `artifacts/lore-vault/src/pages/` — Index, CharacterPage, WorldBoardPage, NotFound
- `artifacts/lore-vault/src/components/vault/` — Lore Vault specific components
- `artifacts/lore-vault/src/hooks/useVaultDB.ts` — all app state (localStorage)
- `artifacts/lore-vault/src/lib/vault-types.ts` — core data types
- `artifacts/lore-vault/src/index.css` — dark fantasy design system (CSS variables, palette themes)
- `artifacts/lore-vault/tailwind.config.ts` — Tailwind v3 config with custom fonts/colors/animations

## Architecture decisions

- Pure frontend app with no backend — all data stored in localStorage via useVaultDB
- Tailwind v3 (not v4) with postcss — the copy script switched from @tailwindcss/vite to postcss pipeline
- Multiple color palettes (pixel-dark, abyss, crimson, arcane, ember, verdant, etc.) via CSS data-palette attribute
- Per-character font and animation settings stored in each character's data object

## Product

- Character card creation and management (name, lore, image, tags)
- Per-card customization: color palette, border frame, animation, font family
- Tabs per character: Lore, Journal, Manuscript, Moodboard, Encyclopedia
- World Board (Tablica Świata) — shared canvas for world-building
- Music player integration per character
- Dark fantasy design: pixel fonts, grain texture, rune glows, particle effects

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- App uses Tailwind v3 via postcss (NOT @tailwindcss/vite) — vite.config.ts handles this via css.postcss
- Do NOT run `pnpm dev` at workspace root — use workflows
- Fonts come from Google Fonts CDN via index.html link tags

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
