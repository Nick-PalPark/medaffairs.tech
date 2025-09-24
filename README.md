# medaffairs.tech — Drudge-inspired front-end + article sync workflows

This repo contains the static front-end for medaffairs.tech and GitHub Actions workflows that sync article data from source repositories.

## Available Workflows

### 1. sync_articles.yml (Recommended)
- **Purpose**: Syncs articles from medaffairs-articles repository with intelligent processing
- **Trigger**: `repository_dispatch` event `medaffairs-data-updated` or manual trigger
- **Features**:
  - Processes approved articles from medaffairs-articles/articles.json
  - Maintains title hierarchy: manual_title → generated_title → original_title
  - Auto-categorizes articles into Tech Insights, Industry News, Opinion & Analysis
  - Selects top 3 articles as heroes (with cover images)
  - Balances content across all columns
  - Comprehensive error handling and logging

### 2. sync_data.yml (Legacy)
- **Purpose**: Direct copy of articles.json from medaffairs-data (private repo)
- **Trigger**: `repository_dispatch` event `medaffairs-data-updated`

### 3. sync_from_articles.yml (Alternative)
- **Purpose**: Downloads articles.json from medaffairs-articles (public/private)
- **Trigger**: `repository_dispatch` event `medaffairs-articles-updated`

## Setup for sync_articles.yml (Recommended)

### 1. Repository Access Token
Create a Personal Access Token with `repo` scope and add it as a repository secret:
- Go to: Settings → Secrets and variables → Actions
- Create secret: `MEDAFFAIRS_ARTICLES_TOKEN`
- Value: Your PAT with access to the medaffairs-articles repository

### 2. Source Repository Structure
The workflow expects `medaffairs-articles/articles.json` with this structure:
```json
{
  "approvedArticles": [
    {
      "id": "unique-id",
      "title": "Original Article Title",
      "manual_title": "Custom Editorial Title (optional)",
      "generated_title": "AI Generated Title (optional)",
      "snappyTitle": "Alternative Generated Title (optional)",
      "url": "https://article-url.com",
      "publishedDate": "2025-01-15T08:00:00Z",
      "category": "Technology|Health|Industry|Opinion",
      "source": "Source Name",
      "tags": "comma, separated, tags",
      "coverImage": "https://image-url.jpg (optional)",
      "status": "approved"
    }
  ]
}
```

### 3. Triggering the Workflow
From medaffairs-articles repository, trigger the sync:
```bash
curl -X POST \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/Nick-PalPark/medaffairs.tech/dispatches \
  -d '{"event_type":"medaffairs-data-updated"}'
```

### 4. GitHub Pages Configuration
- Configure GitHub Pages to serve from the main branch
- The workflow automatically triggers deployment after successful sync
- Add a `CNAME` file with `medaffairs.tech` for custom domain

## Title Hierarchy System

The site displays titles using this priority order:
1. **manual_title** - Custom editorial titles (highest priority)
2. **generated_title** - AI-generated snappy headlines  
3. **snappyTitle** - Alternative generated titles
4. **original_title** - Original feed titles (fallback)

## Article Categorization

Articles are automatically categorized based on:
- **Tech Insights**: Articles with "tech", "AI", or technology-related tags
- **Opinion & Analysis**: Articles with "opinion" or "analysis" categories
- **Industry News**: All other articles (default)

The workflow ensures balanced content across all three columns.

## Legacy Setup (sync_data.yml)

For the legacy workflow using medaffairs-data (private):
1. Create `MEDAFFAIRS_DATA_TOKEN` secret with repo access to medaffairs-data
2. Trigger with `medaffairs-data-updated` event
3. Direct copy of articles.json without processing
