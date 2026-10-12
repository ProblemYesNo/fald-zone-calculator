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

## CI/CD on GitHub

[CI](.github/workflows/ci.yml) runs when a pull request targeting `main` is
opened, updated with new commits, or reopened. The required `Validate and build`
check runs lint, type checking, calculation tests, and a static production build.
It uses Node.js 22, the pnpm version pinned in `package.json`, a cached pnpm store,
and a frozen lockfile install.

[CD](.github/workflows/cd.yml) runs only through `workflow_dispatch`, separately
from CI. Pushes, pull requests, and merges do not deploy. A manual run on `main`
revalidates and builds the selected commit, then deploys that run's artifact to
GitHub Pages using GitHub's built-in token. Runs on other branches are skipped.
No deployment secrets are needed. A future Codex/Linear/GitHub integration can
invoke the same dispatch API; no integration is configured yet.

The active `main` ruleset requires a pull request and a passing, up-to-date
`Validate and build` check before merging. Direct pushes, force pushes, and
branch deletion are blocked, with no bypass actors (including administrators).
Approving reviews are optional so a sole maintainer can merge their own PR.
The configuration is recorded in [.github/main-ruleset.json](.github/main-ruleset.json).
GitHub enforces the remote ruleset; this JSON file documents its configuration.

All other branches must use one of these prefixes with a nonempty description:

- `feat/` or `feature/` for features, such as `feat/github-ci-cd`.
- `bugfix/` for fixes, such as `bugfix/fullscreen-controls`.
- `docs/` for documentation, such as `docs/deployment-guide`.

The branch naming ruleset has no bypass actors and excludes `main`, which keeps
its separate PR and CI protections. Its configuration is recorded in
[.github/branch-naming-ruleset.json](.github/branch-naming-ruleset.json).

To activate it:

1. In the repository's **Settings → Pages → Build and deployment**, select
   **GitHub Actions** as the source.
2. Create a branch, push it, and open a pull request targeting `main`.
3. Wait for **CI** to pass, then merge the pull request.
4. Choose **Actions → CD → Run workflow** with `main` selected when ready to
   deploy. The deployment job reports the published URL:
   https://problemyesno.github.io/fald-zone-calculator/.

After the CD workflow is merged into `main`, deployments can also be dispatched
through the authenticated GitHub CLI:

```sh
gh workflow run cd.yml --repo ProblemYesNo/fald-zone-calculator --ref main
```

The build defaults to the repository name as its URL base path. For a custom
domain or a repository named `<owner>.github.io`, set the repository Actions
variable `PAGES_BASE_PATH` to `/`. For a different path, set it to `/your-path`
without a trailing slash. Changing the path requires a new build.

Reproduce the Pages build locally:

```sh
STATIC_EXPORT=true NEXT_PUBLIC_BASE_PATH=/fald-zone-calculator pnpm build
```

The exported site is in `out/` and needs a static web server. Ordinary
`pnpm build` and `pnpm start` continue to use the Next.js server.
See the [GitHub Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
for the deployment environment and publishing-source settings.

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
