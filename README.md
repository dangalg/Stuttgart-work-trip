# Stuttgart Work Trip

Existing Stuttgart exhibition planner, including mobile activity editing, local notes, offline venue maps and optional Munich/Stuttgart city ideas.

Expected Pages URL: https://dangalg.github.io/Stuttgart-work-trip/

Only static files in dist are deployed. Your browser schedule and notes are not uploaded or synchronized. Download a private backup from the browser holding your original plan, then use Back up or move my plan on the new app to review/import it. Keep the original app and its browser data until you verify the transfer.

## Verification

npm ci
npx playwright install chromium
npm test

Tests use a fresh isolated browser and the exact Pages project path. They check import/cancel/export, unknown fields and saved IDs, rollback/recovery, offline maps, narrow mobile layouts, and preservation of another app's cache. Test fixtures are synthetic.

## Deployment

Set GitHub Settings > Pages > Source to GitHub Actions. Pushes to main run tests before deploying dist. No runtime backend or secrets are required.

For laptop-independent coding, connect this repository to a published Codex Cloud environment. This repository and workflow alone do not provision that environment.

