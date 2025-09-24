# GitHub Actions Workflows Usage Guide

This repository contains several GitHub Actions workflows for syncing article data from different sources.

## Available Workflows

### 1. `sync_from_medaffairs_articles.yml` ⭐ **RECOMMENDED**

**Purpose**: Syncs and transforms articles from the medaffairs-articles repository.

**Triggers**:
- `repository_dispatch` with event type `medaffairs-articles-updated`
- Manual trigger via GitHub Actions UI

**Features**:
- ✅ Downloads articles from public or private medaffairs-articles repository
- ✅ Transforms data format from `articles-updated.json` to site-compatible format
- ✅ Intelligent article categorization (heroes, news, tech, opinion)
- ✅ Commits only when changes are detected
- ✅ Automatically triggers GitHub Pages deployment

**Setup Requirements**:
- For private repos: Set `MEDAFFAIRS_ARTICLES_READ_PAT` secret with repository read permissions
- For public repos: No additional setup needed

**How to trigger from medaffairs-articles**:
```bash
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/Nick-PalPark/medaffairs.tech/dispatches \
  -d '{"event_type":"medaffairs-articles-updated"}'
```

### 2. `sync_data.yml`

**Purpose**: Syncs articles from the medaffairs-data repository (original workflow).

**Triggers**:
- `repository_dispatch` with event type `medaffairs-data-updated`
- Manual trigger via GitHub Actions UI

**Setup Requirements**:
- Set `MEDAFFAIRS_DATA_TOKEN` secret with repository read permissions

### 3. `sync_from_articles.yml` ⚠️ **DEPRECATED**

This workflow has been deprecated and replaced by `sync_from_medaffairs_articles.yml`.

## Data Format Transformation

The new workflow transforms data from the medaffairs-articles format:

```json
{
  "lastUpdated": "2025-09-11T00:24:37.335021",
  "approvedArticles": [
    {
      "title": "Article Title",
      "snappyTitle": "Catchy Title",
      "url": "https://example.com/article",
      "coverImage": "https://example.com/image.jpg",
      "category": "Technology",
      "tags": "AI, Medical"
    }
  ]
}
```

To the site-compatible format:

```json
{
  "last_updated": 1757550277335,
  "heroes": [
    {
      "original_title": "Article Title",
      "generated_title": "Catchy Title",
      "url": "https://example.com/article",
      "image": "https://example.com/image.jpg",
      "source": "Source Name"
    }
  ],
  "columns": {
    "news": [],
    "tech": [],
    "opinion": []
  }
}
```

## Testing

Use the included test script to validate transformations:

```bash
node .github/scripts/test-transform.js articles-updated.json
```

## Troubleshooting

1. **Workflow not triggering**: Check that the `repository_dispatch` event type matches exactly
2. **Authentication errors**: Verify PAT tokens have correct permissions
3. **Data format issues**: Use the test script to validate transformations
4. **Site not updating**: Check GitHub Pages settings and deployment status

## Manual Workflow Execution

You can manually trigger workflows from the GitHub Actions tab:
1. Go to Actions tab in the repository
2. Select the desired workflow
3. Click "Run workflow"
4. Choose branch and any required inputs