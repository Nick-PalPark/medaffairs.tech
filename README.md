# medaffairs.tech — Static front-end for medaffairs articles

This repository hosts the static front-end for medaffairs.tech. Article content is produced in a separate repository (medaffairs-articles) and synchronized into this repo at publish-time.

This README explains the two supported synchronization patterns, required tokens/secrets, and the workflow names and event types to keep both repos in sync.

## Key overview

- Producer repo: `Nick-PalPark/medaffairs-articles` (generates articles JSON)
- Consumer repo (this one): `Nick-PalPark/medaffairs.tech` (serves the site / GitHub Pages)
- Recommended workflow names:
  - Producer: `.github/workflows/sync_articles.yml` (in medaffairs-articles)
  - Consumer: `.github/workflows/sync_from_articles.yml` (in medaffairs.tech)
- Recommended repository_dispatch event_type (when using dispatch): `medaffairs-articles-updated`
- Preferred secret names (examples):
  - If producer dispatches to this repo: store a PAT inside medaffairs-articles named `MEDAFFAIRS_TECH_PAT`. The PAT must include repo:dispatch for medaffairs.tech.
  - If consumer pulls from producer (checkout private repo): store a PAT inside medaffairs.tech named `MEDAFFAIRS_ARTICLES_TOKEN` with repo:contents (or equivalent) scope.

## Two supported synchronization approaches

1) Producer triggers consumer (recommended if medaffairs-articles is the canonical source)
- medaffairs-articles runs `sync_articles.yml` (scheduled or manual) to produce `articles.json`.
- At the end of that run, it calls the GitHub API to trigger a repository_dispatch on medaffairs.tech with event_type `medaffairs-articles-updated` (or pushes directly).
- medaffairs.tech has a workflow `sync_from_articles.yml` that listens for `repository_dispatch` with that exact type and, when triggered, pulls the latest `articles.json` from medaffairs-articles (or relies on the dispatch as signal to run a pull step).

Example dispatch step (in medaffairs-articles workflow):
```bash
# uses the secret MEDAFFAIRS_TECH_PAT stored in medaffairs-articles repo settings
curl -X POST \
  -H "Authorization: token ${{ secrets.MEDAFFAIRS_TECH_PAT }}" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/Nick-PalPark/medaffairs.tech/dispatches \
  -d '{"event_type":"medaffairs-articles-updated"}'
```

Consumer workflow skeleton (medaffairs.tech `.github/workflows/sync_from_articles.yml`):
```yaml
on:
  repository_dispatch:
    types: [medaffairs-articles-updated]
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout site repo
        uses: actions/checkout@v4
      - name: Checkout articles repo
        uses: actions/checkout@v4
        with:
          repository: Nick-PalPark/medaffairs-articles
          token: ${{ secrets.MEDAFFAIRS_ARTICLES_TOKEN }}   # secret stored in medaffairs.tech
          path: upstream
      - name: Copy articles.json
        run: |
          mkdir -p data
          cp upstream/path/to/articles.json data/articles.json
      - name: Commit & push if changed
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add data/articles.json || true
          if ! git diff --staged --quiet; then
            git commit -m "Sync articles.json from medaffairs-articles"
            git push
          else
            echo "No changes"
          fi
```

Notes:
- `MEDAFFAIRS_ARTICLES_TOKEN` is a PAT stored in medaffairs.tech and used to check out private medaffairs-articles.
- If you prefer the producer to push the file directly into medaffairs.tech (instead of dispatch + pull), the producer workflow can check out medaffairs.tech and push `data/articles.json` directly; that PAT would be stored in medaffairs-articles (name it `MEDAFFAIRS_TECH_PAT`).

2) Consumer pulls from producer (alternate)
- medaffairs.tech workflow runs on `repository_dispatch` (signal) or on a schedule and checks out medaffairs-articles using a token stored in medaffairs.tech (secret `MEDAFFAIRS_ARTICLES_TOKEN`) to copy `articles.json`.
- This approach keeps the pull logic on the consumer side.

## Tokens & permissions (how to create and where to store)

- Create a Personal Access Token (classic) with:
  - If using repository_dispatch from producer to consumer: `repo` scope (or repo:dispatch if available) for the PAT stored in medaffairs-articles (secret `MEDAFFAIRS_TECH_PAT`).
  - If consumer checks out private medaffairs-articles: `repo` or `repo:contents` scope for the PAT stored in medaffairs.tech (secret `MEDAFFAIRS_ARTICLES_TOKEN`).

Where to set secrets:
- In medaffairs-articles (Settings → Secrets → Actions) add `MEDAFFAIRS_TECH_PAT` if that repo will call dispatch or push to medaffairs.tech.
- In medaffairs.tech (Settings → Secrets → Actions) add `MEDAFFAIRS_ARTICLES_TOKEN` if medaffairs.tech will check out medaffairs-articles.

## Workflow and event naming checklist (to fix most updates-not-happening issues)

- Producer must call the exact event type the consumer expects. If the consumer's workflow is:
  - `on: repository_dispatch: types: [medaffairs-articles-updated]`
  then the producer must dispatch event_type `medaffairs-articles-updated`.
- Verify exact casing and spelling — they must match.
- If you deleted `sync_data.yml`, ensure medaffairs-articles does not still try to trigger the old event name.
- Confirm token secret names referenced inside workflows match the secret names in repo settings.

## GitHub Pages / publishing

- Confirm GitHub Pages is configured to serve from the branch/folder that your workflow commits to (Settings → Pages).
- If your workflow commits to `main` root, Pages should serve automatically. If your workflow writes to `docs/`, ensure Pages serves from `docs/`.
- If Pages build fails, check the Pages build status and logs in repository Settings → Pages or Actions.

## Troubleshooting quick steps

1. In medaffairs-articles → Actions: check the latest sync run. Did it:
   - Complete successfully? Look specifically for the dispatch/push step success status.
   - Show a 403/401 or 404 when trying to dispatch/push? This indicates an invalid/insufficient PAT.
2. In medaffairs.tech → Actions: verify `sync_from_articles.yml` runs after the producer run. If not, event type or token is wrong.
3. Check secrets in both repos: names must match the values used inside the workflows.
4. Confirm the producer sends the exact event_type and consumer lists that string in `on: repository_dispatch`.
5. Confirm Pages branch/folder and review last Pages build logs if commits landed but the site didn't update.

## Example troubleshooting curl (manual test)
Replace <PAT> with a PAT that has repo:dispatch permission for medaffairs.tech:
```bash
curl -X POST \
  -H "Authorization: token <PAT>" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/Nick-PalPark/medaffairs.tech/dispatches \
  -d '{"event_type":"medaffairs-articles-updated"}'
```
If the consumer workflow triggers, the dispatch works.

---

If you'd like, I can:
- Inspect the most recent Actions run logs for medaffairs-articles and medaffairs.tech and point out the exact failing step and error.
- Produce a minimal `sync_from_articles.yml` for medaffairs.tech (ready to paste) tuned to your chosen approach (dispatch or direct push).
