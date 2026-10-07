# FALD Calculator project guide

## Purpose and current scope

Calculate estimated full-array local dimming zone dimensions from screen diagonal
(inches), pixel resolution, and total zone count. Show the zone layout in a scaled
preview that fits the user's viewport while preserving the target screen's aspect
ratio. The application uses a monochrome design inspired by dpi.lv, with prominent
results, a top header, and a footer pushed to the viewport bottom on short pages.

## Stack and package management

- React 19 and TypeScript with strict checking, hosted by Next.js 15 App Router.
- Use pnpm exclusively. The exact version is pinned in package.json; commit
  pnpm-lock.yaml when dependencies change. Do not create npm or Yarn lockfiles.
- Node.js 22.18 or newer is required for the native TypeScript calculation tests.
- Application source belongs in .ts/.tsx files. Framework config can use .mjs.
- Keep the current Next.js framework unless the user requests a framework change.

## Commands

- pnpm install --frozen-lockfile: install the committed dependency versions.
- pnpm dev: start the development server at http://localhost:3000.
- pnpm lint: lint the project.
- pnpm typecheck: check TypeScript without emitting files.
- pnpm test: run calculation tests with Node's built-in test runner.
- pnpm build: validate the production build.
- pnpm start: serve the completed production build.

Run lint, typecheck, tests, and build after substantial changes. Report any checks
blocked by the environment accurately. Add meaningful tests when calculation
behavior changes; avoid tests that merely duplicate the implementation.

## Source map

- src/app/page.tsx: calculator page entry point.
- src/app/layout.tsx and globals.css: shared layout and global styles.
- src/components/zone-calculator.tsx: client form, results, and SVG preview.
- src/components/zone-calculator.module.scss: current calculator styling.
- src/lib/fald.ts: pure calculation, validation, and shared domain types.
- src/lib/fald.test.ts: calculation regression tests.

## Calculation rules

- Diagonal must be positive and finite. Resolution and zone count must be positive
  safe integers. Reject unsupported grids rather than producing invalid output.
- Assume square pixels when converting pixel dimensions to physical dimensions.
  inchesPerPixel = diagonalInches / hypot(widthPixels, heightPixels).
- Estimate a uniform rectangular grid by selecting a factor pair whose product
  equals the supplied zone count and whose zone shape is closest to square.
  Never round columns and rows independently and silently change the zone count.
- Show width and height separately, in pixels and inches. Pixel dimensions are
  averages and may be fractional when the resolution is not divisible by the grid.
- Zone count alone does not reveal the manufacturer's hardware layout. Label the
  calculated grid as an estimate and make the uniform-grid assumption visible.
- Keep domain math independent of React and rendering.

## Preview and UI rules

- Use the target resolution as the SVG viewBox; preserve its aspect ratio.
- Preview scale defaults to 1:4: one source pixel maps to 0.25 CSS pixels before
  scrolling if larger than the view. Offer 1:2, 1:8, and 1:16 as well.
- Offer Fit to view and native 1:1. For native 1:1 divide source dimensions by
  window.devicePixelRatio to account for display scaling and current browser zoom.
- Fullscreen uses the Fullscreen API, defaults to fit, and restores the previous
  scale on exit (including Escape). Reveal fullscreen controls on hover/focus.
  Show a useful message when fullscreen is unavailable or rejected.
- Browser CSS pixels are not calibrated inches. Do not claim an actual physical
  1:4 scale on the user's monitor without a future calibration feature.
- Use an SVG pattern to render the grid without creating one DOM node per zone.
- Use labeled inputs, keyboard-submittable forms, and accessible result/error text.
- Keep the design black, white, and gray. The map illustrates geometry, not a
  simulation of contrast or blooming. Avoid unsolicited hardware catalogs or exports.
- Keep header at the top; use a full-height flex layout so footer rests at the
  viewport bottom when content is short and follows longer content naturally.
- Never store credentials in the project or ask for passwords in chat. Use the
  authenticated GitHub CLI / system credential store for repository operations.
