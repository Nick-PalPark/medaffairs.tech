# Zapier Integration Guide for MedAffairs.tech

## Overview
This guide explains how to set up Zapier to automatically feed RSS articles from Inoreader to the MedAffairs.tech website.

## Integration Architecture

### 1. RSS Feed Processing Flow
```
Inoreader RSS Feeds → Zapier Trigger → Article Processing → GitHub Repository Dispatch → Website Update
```

### 2. Article Categories & Tags
Articles are automatically categorized based on tags and content:

- **Hero Articles**: Tag with `hero` or set `isHero: true`
- **Industry News**: Default category, or tag with `news`
- **Tech Insights**: Tag with `tech` or category contains "tech"
- **Opinion & Analysis**: Tag with `opinion` or category contains "opinion/analysis"

### 3. Required Article Data Structure
Send the following JSON payload via repository dispatch:

```json
{
  "title": "Article Title",
  "snappyTitle": "Optional AI-generated snappy headline",
  "url": "https://example.com/article",
  "category": "Technology|Health|Opinion",
  "tags": "comma,separated,tags",
  "coverImage": "https://example.com/image.jpg",
  "source": "Source Name",
  "publishedDate": "2025-01-01T12:00:00Z",
  "isHero": false
}
```

## Zapier Configuration

### Step 1: Create RSS Trigger
1. **Trigger**: RSS by Zapier
2. **Event**: New Item in Feed
3. **RSS Feed URL**: Your Inoreader RSS feed URL
4. **Test**: Verify feed is working

### Step 2: Set Up Filters (Optional)
Add filters to process only tagged articles:
- Only continue if Tags contains specific values
- Only continue if Title is not empty

### Step 3: Configure GitHub Repository Dispatch
1. **Action**: Webhooks by Zapier
2. **Event**: POST
3. **URL**: `https://api.github.com/repos/Nick-PalPark/medaffairs.tech/dispatches`
4. **Method**: POST
5. **Headers**:
   ```
   Authorization: token YOUR_GITHUB_TOKEN
   Content-Type: application/json
   Accept: application/vnd.github.v3+json
   ```
6. **Data** (JSON):
   ```json
   {
     "event_type": "zapier-article-received",
     "client_payload": {
       "title": "{{title}}",
       "snappyTitle": "{{description}}", 
       "url": "{{link}}",
       "category": "{{category}}",
       "tags": "{{tags}}",
       "coverImage": "{{image}}",
       "source": "{{feed_title}}",
       "publishedDate": "{{published}}",
       "isHero": false
     }
   }
   ```

### Step 4: Test Integration
1. Create a test article in Inoreader with appropriate tags
2. Monitor the Zapier run logs
3. Check the GitHub Actions workflow execution
4. Verify article appears on the website

## GitHub Token Setup

### Required Permissions
Your GitHub Personal Access Token needs:
- `public_repo` (if repository is public)
- `repo` (if repository is private)
- Specifically the `repo:dispatch` permission

### Token Creation
1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Generate new token (classic)
3. Select required permissions
4. Copy token and add to Zapier webhook headers

## Article Management

### Automatic Limits
- **Hero Articles**: Maximum 3 (newest first)
- **Column Articles**: Maximum 20 per column (newest first)
- **Article Rotation**: Older articles automatically removed

### Manual Article Management
Articles can be manually edited by:
1. Editing `data/articles.json` directly in the repository
2. Using the GitHub web interface
3. Setting `manual_title` to override automatic titles

### Hero Article Promotion
To make an article a hero:
1. Tag it with `hero` in Inoreader
2. Set `isHero: true` in the Zapier payload
3. Or manually move it to the `heroes` array in `data/articles.json`

## Troubleshooting

### Common Issues
1. **Articles not appearing**: Check GitHub Actions workflow logs
2. **Wrong category**: Verify tags and category mapping
3. **Missing images**: Ensure `coverImage` URL is accessible
4. **Zapier errors**: Check GitHub token permissions

### Monitoring
- GitHub Actions: Repository → Actions tab
- Zapier: Dashboard → Task History
- Website: Check "Last updated" timestamp

### Support
For technical issues:
1. Check GitHub Actions workflow logs
2. Verify Zapier task execution
3. Inspect `data/articles.json` structure
4. Test manually with repository dispatch

## Advanced Configuration

### Custom Article Processing
The processing logic can be modified in `.github/workflows/zapier-webhook.yml`:
- Custom category assignment rules
- Advanced filtering logic
- Title generation enhancements

### Multiple RSS Feeds
Set up multiple Zapier workflows for different RSS sources:
- Use different `event_type` values
- Customize category assignment per source
- Add source-specific processing rules