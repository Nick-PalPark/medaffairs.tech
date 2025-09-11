# Article Management Logging System

This repository implements a logging system for article management that solves SHA versioning issues by separating content storage from content presentation.

## System Overview

### Files

1. **`articles-log.json`** - Persistent log storing ALL articles with full metadata and status history
2. **`process-articles.js`** - Script that processes the log to generate website content
3. **`articles-updated.json`** - Generated file containing processed content for the website (auto-generated, do not edit manually)
4. **`index.html`** - Website that consumes the processed content

### Workflow

1. **Content Storage**: All articles are stored in `articles-log.json` with complete metadata including:
   - Article details (title, URL, author, etc.)
   - Status tracking (pending, approved, rejected)
   - Full activity logs with timestamps
   - Status change history

2. **Content Processing**: Run `process-articles.js` to:
   - Filter approved articles from the log
   - Categorize them into Industry News, Tech Insights, Products & Opinion
   - Select hero articles (most recent approved)
   - Generate the JSON structure expected by the website

3. **Content Presentation**: The website loads and displays the processed content

## Usage

### Adding New Articles

Add articles to `articles-log.json` with the following structure:

```json
{
  "id": "unique-article-id",
  "title": "Article Title",
  "snappyTitle": "Catchy Title for Heroes",
  "url": "https://...",
  "author": "Author Name",
  "publishedDate": "2025-09-11T08:30:00+00:00",
  "category": "Technology|Health|Industry|Opinion",
  "source": "Source Name",
  "tags": "comma, separated, tags",
  "coverImage": "https://...",
  "status": "pending|approved|rejected",
  "addedDate": "2025-09-11T00:20:00.000000",
  "approvedDate": "2025-09-11T00:24:37.334995", // if approved
  "logs": [
    {
      "timestamp": "2025-09-11T00:20:00.000000",
      "action": "added|approved|rejected|updated",
      "details": "Description of action"
    }
  ]
}
```

### Processing Articles

Run the processing script to update the website:

```bash
node process-articles.js
```

This will:
- Read `articles-log.json`
- Filter for approved articles
- Categorize and format them
- Write the result to `articles-updated.json`
- Update the `last_updated` timestamp

## Benefits

1. **Persistent History**: Complete log of all articles and their status changes
2. **Conflict Reduction**: Single source of truth reduces file conflicts during concurrent updates
3. **Separation of Concerns**: Content storage separate from presentation logic
4. **Auditing**: Full audit trail of when articles were added, approved, or rejected
5. **Flexibility**: Easy to add new categories or change processing logic without affecting stored data

## Categorization Logic

Articles are automatically categorized based on their `category` field and `tags`:

- **Tech Insights**: Articles with category/tags containing "technology", "tech", or "ai"  
- **Industry News**: Articles with category/tags containing "health", "industry", "global", or "initiative"
- **Products & Opinion**: Articles with category/tags containing "opinion" or "product"
- **Default**: Articles that don't match above criteria go to Industry News

**Heroes** are selected as the 3 most recently approved articles, using their `snappyTitle` if available.