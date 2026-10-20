# CSS Class Conventions & Styling Rule

- **Always match and define component classes in `resources/css/app.css` under `@layer components`.**
- Do NOT use long ad-hoc inline Tailwind utility strings directly in JSX components when styling structural or repeated components.
- When creating or modifying pages (such as Landing Page, Jobs, Pelamar, HRD, etc.), define semantic, clean class names (e.g. `.landing-*`, `.jobs-*`, `.nav-*`, `.hrd-*`) in `resources/css/app.css` using `@layer components` and `@apply`.
- Ensure `@apply` does not contain invalid Tailwind modifiers (such as `group`, which cannot be applied directly via `@apply`).
- Preserve the existing Header (`<Header />`) and Footer (`<Footer />`) components intact.
