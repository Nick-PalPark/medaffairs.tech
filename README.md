# medaffairs.tech — Drudge-inspired front-end + private-data sync

This repo contains the static front-end for medaffairs.tech and a GitHub Actions workflow that syncs the private medaffairs-articles/articles.json into this repo at publish-time.

Quick start / setup checklist
1. medaffairs-articles repo:
   - Keep medaffairs-articles private if you prefer (recommended by you).
   - Ensure medaffairs-articles has the fetch workflow that updates articles.json and triggers medaffairs.tech by calling repository_dispatch with event_type `medaffairs-articles-updated`. Example:
     - POST to https://api.github.com/repos/Nick-PalPark/medaffairs.tech/dispatches with body {"event_type":"medaffairs-articles-updated"} using a token with repo:dispatch permissions.

2. Create a PAT for this repo to read medaffairs-articles:
   - Create a Personal Access Token (classic) with `repo` scope (or finer-grained token with repo:contents access).
   - In medaffairs.tech repository settings -> Secrets -> Actions, create the secret `MEDAFFAIRS_ARTICLES_READ_PAT` with that PAT.

3. GitHub Actions:
   - The workflow `.github/workflows/sync_articles.yml` will:
     - Run on `repository_dispatch` event named `medaffairs-articles-updated` (or manually).
     - Check out medaffairs-articles using the PAT and copy `articles.json` into `data/articles.json`.
     - Commit and push the updated file if it changed.
   - After the commit, GitHub Pages (if configured) will publish the updated site.

4. GitHub Pages:
   - Configure GitHub Pages to serve from the branch/folder you want (e.g., main branch / root or `docs/`).
   - If you serve from main root, the site is ready. If you serve from `docs/`, move the static files into `docs/` or adjust the workflow to place files there.
   - Add a `CNAME` file with `medaffairs.tech` if you haven't already and configure DNS as described in your repo settings (A records or CNAME depending on setup).

Notes about titles and editing
- The site will display:
  1) manual_title (if present)
  2) generated_title (AI snappy headline)
  3) original_title (feed title)
- Keep using the admin/editor approach we discussed earlier (or edit articles.json in medaffairs-articles via the GitHub UI) to set `manual_title`. The medaffairs-articles fetch workflow will preserve manual_title when it updates articles.json.

If you want, I can:
- Update the medaffairs.tech repo directly with these files (I can open a PR) so you can review and merge.
- Or I can walk you step-by-step through adding secrets and enabling the repository_dispatch trigger from medaffairs-articles.

DNS / Pages help
- If you'd like, tell me your DNS host and I'll give exact DNS records to point medaffairs.tech to GitHub Pages.# Setup complete
