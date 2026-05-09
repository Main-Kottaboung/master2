# Master2 Tailwind Foundation

This workspace is a standalone Angular app with SCSS enabled and a Tailwind CSS foundation for ecommerce-style UI work.

Note: the current workspace reports Angular 21.2.x, but the setup below is compatible with Angular 18 standalone projects as well.

## Install

```bash
npm install -D tailwindcss postcss autoprefixer
```

If you want to recreate the config files from scratch, the common Tailwind CLI bootstrap is:

```bash
npx tailwindcss init
```

## Configuration

The project uses these files:

- [tailwind.config.js](tailwind.config.js)
- [postcss.config.js](postcss.config.js)
- [src/styles.scss](src/styles.scss)

Tailwind scans `src/**/*.{html,ts,scss}` so utility classes work in templates, component styles, and inline class strings.

## Global Styles

`src/styles.scss` is the global styling foundation. It now:

- loads Tailwind base, components, and utilities
- sets a clean body background and typography baseline
- defines reusable component-layer classes for shells, cards, buttons, inputs, and focus states
- keeps the app responsive and visually consistent before any feature pages exist

## Folder Recommendations

Use a simple feature-first structure as the store grows:

- `src/app/core/` for singleton services, guards, interceptors, and shell-level utilities
- `src/app/shared/ui/` for reusable UI primitives like buttons, badges, cards, and form controls
- `src/app/features/` for routed ecommerce domains such as catalog, product detail, cart, checkout, and account
- `src/styles/` for optional SCSS partials like tokens, mixins, or responsive helpers if the global file grows too large
- `src/assets/` for product images, category artwork, icons, and brand media

## Responsive Strategy

Build mobile-first and layer up with Tailwind breakpoints:

- `sm` for denser phone layouts and small-tablet tweaks
- `md` for grid expansions, filter panels, and secondary navigation
- `lg` for desktop storefront layouts, sidebars, and multi-column merchandising blocks
- `xl` and `2xl` for wide product grids, comparison tables, and editorial landing sections

Recommended pattern: start with one column and stack vertically, then promote to 2-3 columns as space allows. Keep cards fluid with `w-full`, cap reading widths with `max-w-*`, and use `container` plus `page-shell` for consistent horizontal rhythm.

## Reusable Utility Recommendations

The foundation includes a few shared classes you can reuse immediately:

- `page-shell` for centered page width and consistent padding
- `section-stack` for vertical spacing between storefront sections
- `surface-card` for product cards, panels, and summary boxes
- `btn-primary` and `btn-secondary` for CTA variants
- `input-field` for search, filter, and checkout form inputs
- `focus-ring` for accessible keyboard states

## Run It

```bash
npm start
```

Open `http://localhost:4200/` after the dev server starts.