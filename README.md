# medaffairs.tech — Static front-end for medaffairs articles

This repository hosts the static front-end for medaffairs.tech. Article content is produced in a separate repository (medaffairs-articles) and synchronized into this repo at publish-time.

This README explains the supported synchronization patterns, required tokens/secrets, and the workflow names and event types to keep both repos in sync.

## Key overview

- Producer repo (articles source): `Nick-PalPark/medaffairs-articles` (generates articles JSON)
- Consumer repo (this one): `Nick-PalPark/medaffairs.tech` (serves the site / GitHub Pages)
- Recommended workflow names:
  - Producer: `.github/workflows/sync_articles.yml` (in medaffairs-articles)
  - Consumer: `.github/workflows/sync_from_articles.yml` (in medaffairs.tech)
- Recommended repository_dispatch event_type (when using dispatch): `medaffairs-articles-updated`
- Preferred secret names:
  - In medaffairs.tech (consumer): `MEDAFFAIRS_ARTICLES_TOKEN` — a PAT used to check out medaffairs-articles if it is private.
  - In medaffairs-articles (producer), if the producer will dispatch to or push into medaffairs.tech: `MEDAFFAIRS_TECH_PATS` — a PAT used to call repository_dispatch or to push into medaffairs.tech.

## Two supported synchronization approaches

1) Producer triggers consumer (recommended when medaffairs-articles is canonical)
- medaffairs-articles runs `sync_articles.yml` (scheduled or manual) to generate `articles.json`.
- At the end of that run, the producer can:
  - Send a `repository_dispatch` event to medaffairs.tech with event_type `medaffairs-articles-updated`, or
  - Check out medaffairs.tech and push the updated `data/articles.json` directly.
- medaffairs.tech has `sync_from_articles.yml` that listens for the `repository_dispatch` and, when triggered, checks out medaffairs-articles (using `MEDAFFAIRS_ARTICLES_TOKEN`) and copies `articles.json` into `data/articles.json`, committing only when changed.

Example dispatch step (producer, medaffairs-articles):
```bash
# in medaffairs-articles workflow; MEDAFFAIRS_TECH_PATS stored in medaffairs-articles secrets
curl -X POST \
  -H "Authorization: token ${{ secrets.MEDAFFAIRS_TECH_PATS }}" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/Nick-PalPark/medaffairs.tech/dispatches \
  -d '{"event_type":"medaffairs-articles-updated"}'
```

2) Consumer pulls from producer (alternate)
- medaffairs.tech can run a workflow (on schedule or on repository_dispatch) that checks out medaffairs-articles using `MEDAFFAIRS_ARTICLES_TOKEN` and copies `articles.json` into this repo.
- Use this if you prefer the consumer to control when the copy happens.

## Tokens & permissions (how to create and where to store)

- To create a PAT (classic) with appropriate permissions:
  - If the producer will call `repository_dispatch` on this repo: the PAT stored in medaffairs-articles (`MEDAFFAIRS_TECH_PATS`) needs repo:dispatch (or full repo) permission for medaffairs.tech.
  - If this repo will check out a private medaffairs-articles: store `MEDAFFAIRS_ARTICLES_TOKEN` in medaffairs.tech; it should have repo or repo:contents permission.
- Where to set secrets:
  - medaffairs-articles (Settings → Secrets → Actions): add `MEDAFFAIRS_TECH_PATS` if producer dispatches/pushes to this repo.
  - medaffairs.tech (Settings → Secrets → Actions): add `MEDAFFAIRS_ARTICLES_TOKEN` if this repo will check out medaffairs-articles.

## Consumer workflow (medaffairs.tech)

The consumer workflow filename should be `.github/workflows/sync_from_articles.yml` and listen for:

- repository_dispatch types: `[medaffairs-articles-updated]`
- optionally `workflow_dispatch` for manual runs

A ready workflow template is included in the repo as `.github/workflows/sync_from_articles.yml`.

## GitHub Pages / publishing

- Confirm Pages is configured to serve from the branch/folder your workflow commits to (Settings → Pages).
- If your workflow commits to `main` root, Pages serves that by default. If your workflow writes to `docs/`, configure Pages accordingly.
- If commits land but the site doesn't update, check Pages build logs in repository Settings → Pages or in the Actions tab (Pages build run).

## Troubleshooting quick steps

1. Check the producer (medaffairs-articles) Actions run logs — confirm it finishes and either 1) successfully dispatches to medaffairs.tech or 2) pushes to medaffairs.tech.
2. In medaffairs.tech → Actions: confirm that `sync_from_articles.yml` runs after a dispatch. If not, check event_type spelling and token names.
3. Confirm secrets exist and names match those referenced in workflows.
4. Manual test dispatch:
```bash
curl -X POST \
  -H "Authorization: token <PAT-with-repo:dispatch>" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/Nick-PalPark/medaffairs.tech/dispatches \
  -d '{"event_type":"medaffairs-articles-updated"}'
```

## Notes about naming consistency

- This repository used to reference `medaffairs-data` and `MEDAFFAIRS_DATA_TOKEN`. Those older names should be replaced with `medaffairs-articles` and `MEDAFFAIRS_ARTICLES_TOKEN` respectively to match the current producer repo.
- Make sure `medaffairs-articles-updated` is used consistently as the event_type string.

## Reviewer checklist

- Confirm secret `MEDAFFAIRS_ARTICLES_TOKEN` exists in medaffairs.tech if medaffairs-articles is private.
- If the producer will dispatch calls to this repo, confirm medaffairs-articles has `MEDAFFAIRS_TECH_PATS` with repo:dispatch permission.
- Verify the path to articles.json in the producer repo; adjust workflow SOURCE_FILE if articles.json is in a subdirectory.
