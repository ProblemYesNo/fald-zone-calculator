# FALD Zone Size Calculator

Estimate the size and arrangement of full-array local dimming zones in an LCD
screen from its diagonal in inches, resolution, and total number of zones.

## Stack

React 19, strict TypeScript, Next.js 15 App Router, Sass modules, and pnpm.
The supplied folder already contained this stack; no Vue source was present.

Use Node.js 22.18 or newer and the pnpm version pinned in package.json.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000. For production, run `pnpm build` then `pnpm start`.

## Calculation and preview

The calculator chooses an exact factor pair for the zone count, preferring zone
shapes closest to square. It reports zone width and height in pixels and inches.
For example, a 27-inch 3840 × 2160 display with 576 zones produces an estimated
32 × 18 grid of 120 × 120 pixel zones, approximately 0.74 × 0.74 inches each.

The grid is an estimate: the manufacturer may use a different arrangement.
Calculations assume square pixels and a uniform rectangular grid. Pixel sizes
are averages and can be fractional when the grid does not divide the resolution.
Prime zone counts can produce long, narrow grids; counts that cannot fit at least
one pixel per zone in each direction are rejected.

The SVG preview preserves the screen aspect ratio. It defaults to 1:4 source-pixel
scale, with 1:2, 1:8, and 1:16 options, plus native 1:1 and Fit to view. Fixed scales scroll when the grid exceeds
the preview; Fit to view preserves the entire screen aspect ratio.
For example, 3840 × 2160 at 1:4 requests 960 × 540 CSS pixels before fitting.
Native 1:1 accounts for `window.devicePixelRatio`, including display scaling and
current browser zoom. Fullscreen defaults to Fit to view with controls revealed
at the top on hover/focus. Press Escape to exit; the previous scale is restored.
This is not a calibrated physical-size comparison to the user's own monitor.

## Validation

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Calculation tests cover exact zone totals, physical dimensions, rectangular and
portrait grids, prime counts, and invalid inputs. Tests use Node's native TypeScript
support and built-in test runner, without additional test dependencies.

Project conventions and scope are documented in [AGENT.md](./AGENT.md).
`AGENTS.md` directs coding agents to that guide. The monochrome design is inspired by dpi.lv. The header stays at the top; the
footer sits at the bottom of short pages and follows longer content naturally.

## GitHub authentication on CachyOS

Install GitHub CLI and sign in using its browser flow, outside the application:

```sh
sudo pacman -S github-cli
gh auth login --hostname github.com --git-protocol https --web
gh auth setup-git
gh auth status
```

GitHub CLI uses the system credential store when available; it reports a fallback
to a configuration file if no credential store is available. Never commit
credentials or put passwords/tokens in application source or chat.
