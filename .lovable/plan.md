## Scope

1. **Home cleanup** — remove the 3-icon quick-link row (Health tips / Join practice / My badges) above "Recommended for you", and remove the "Neck care guide" tip card near the bottom of `/`.
2. **Global language switcher** — the Language row in `/me` becomes functional. Selecting a language re-renders the entire app in that language and persists the choice.

## Language coverage (Top 20)

English, 中文(简体), हिन्दी, Español, Français, العربية, Português, Русский, 日本語, Deutsch, 한국어, Türkçe, Italiano, Bahasa Indonesia, Tiếng Việt, ไทย, Polski, Nederlands, فارسی, Українська.

## How translation works (technical)

Building a hand-maintained i18n dictionary for the entire app across 20 languages is unrealistic. Instead:

- Add a `LanguageProvider` (React context) in `src/lib/i18n.tsx` with `{ lang, setLang, t(text) }`. The current choice is persisted in `localStorage` (`qiwell.lang`).
- `t(text)` returns the English source when `lang === "en"`; otherwise it looks up an in-memory + IndexedDB cache keyed by `(lang, text)`.
- Cache misses are batched (debounced ~150 ms) and sent to a new server function `translateBatch` in `src/lib/gemini.functions.ts`, which calls Gemini via the existing Lovable AI Gateway and returns an array of translations. Results are written back to the cache and trigger a re-render.
- A tiny `<T>` component wraps `t()` so JSX like `<T>Recommended for you</T>` works. Static string props (button labels, aria-labels) use `t("...")` directly.
- While a translation is pending the English source is shown, so the UI never blanks out.
- The `<html lang="…">` attribute is updated on change; RTL languages (ar, fa) also set `dir="rtl"` on `<html>`.

The provider is mounted in `src/routes/__root.tsx` so every route inherits it. Dynamic user content (custom routine names, AI-generated Markdown) is left as-is — translation applies to UI chrome and static content strings.

## Files changed

- `src/routes/index.tsx` — delete the `quickLinks` grid and the Neck care guide block; drop now-unused imports (`Leaf`, `Wind`, `Award`, `tips`).
- `src/lib/i18n.tsx` (new) — `LanguageProvider`, `useLang`, `t`, `<T>`, language list, IndexedDB cache.
- `src/lib/gemini.functions.ts` — add `translateBatch` server function (reuses `LOVABLE_API_KEY` + gateway, uses a fast text model, returns JSON array).
- `src/routes/__root.tsx` — wrap `<Outlet />` in `<LanguageProvider>`.
- `src/routes/me.tsx` — replace static Language row with a real selector opening a bottom sheet listing the 20 languages, wired to `setLang`.
- Wrap visible UI strings across the main screens (`index`, `catalog`, `session.$id`, `shop`, `shop.$id`, `me`, `achievements`, `tips`, `create`, `pro`, `assessment`, `knowledge.$id`, `BottomNav`, `AppBar`, `LoginModal`) in `<T>` / `t()`. Content data strings (course titles, tips, product names, badge names) also flow through `t()` at render time.

## Out of scope

- Translating AI-generated Markdown on the knowledge page (that page already has its own language selector).
- Server-side rendering of pre-translated HTML — translations resolve client-side after hydration.
- Persisting translations across users (cache is per-device).
