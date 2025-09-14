# MedAffairs.tech Website

MedAffairs.tech is a static HTML website that displays medical and healthcare news articles organized into three categories: Industry News, Tech Insights, and Opinion & Analysis. The site features hero articles at the top and categorized article lists below. Data is synced from a private medaffairs-data repository via GitHub Actions.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Serve the Website
- Navigate to repository root: `cd /home/runner/work/medaffairs.tech/medaffairs.tech`
- Start local server: `python3 -m http.server 8000` -- Takes <3 seconds to start. NEVER CANCEL.
- Access site at: `http://localhost:8000`
- Stop server: `Ctrl+C` or `killall python3`

### Alternative Serving Methods
- PHP built-in server: `php -S localhost:8000` -- VALIDATED working alternative
- Any HTTP server works, but AVOID `npx serve` (requires network access for package download)
- File:// URLs do NOT work due to CORS restrictions with JSON loading

## Validation

### ALWAYS Test Complete User Scenarios
After making any changes, ALWAYS validate by:
1. `python3 -m http.server 8000` -- Set timeout to 30+ seconds
2. Navigate to `http://localhost:8000` in browser or Playwright
3. Verify all three sections load articles (not "Error loading..." messages)
4. Check hero articles display with images and titles (placeholder images will show error in console but still display)
5. Verify "Last updated" timestamp appears in footer
6. Test clicking article links (they should open in new tabs)
7. Test responsive design: resize to mobile viewport (375x667)
8. Stop the server when done

### Manual Validation Requirements
- ALWAYS serve the site and visually inspect it after changes
- Check browser console for JavaScript errors (ignore placeholder image 404s)
- Verify JSON loads correctly: `curl http://localhost:8000/data/articles.json`
- Test responsive design on mobile viewport if CSS changes made
- Validate JSON syntax: `python3 -c "import json; json.load(open('data/articles.json'))"`

## Data Architecture and Flow

### Critical Understanding: Two Data Files
There are two different JSON files with different purposes:

1. **`articles-updated.json`** - Raw data from medaffairs-data repository
   - Contains `approvedArticles` array with full article metadata
   - Synced by GitHub Actions workflow from private medaffairs-data repo
   - NOT directly used by website JavaScript

2. **`data/articles.json`** - Formatted data for website display
   - Contains structured `heroes` and `columns` data that JavaScript expects
   - This is what the website actually loads and displays
   - Must be manually maintained to match expected structure

### Critical: data/articles.json Structure
The JavaScript at `static/js/site.js` expects this EXACT structure:
```json
{
  "last_updated": 1700000000000,
  "heroes": [
    {
      "manual_title": "Article Title",
      "generated_title": "Snappy AI Title", 
      "original_title": "Original Feed Title",
      "url": "https://example.com/article",
      "image": "https://example.com/image.jpg",
      "source": "Source Name",
      "published_at": 1699000000000
    }
  ],
  "columns": {
    "news": [
      {
        "manual_title": "Industry Article Title",
        "url": "https://example.com/article",
        "source": "Source Name",
        "published_at": 1699000000000
      }
    ],
    "tech": [...],
    "opinion": [...]
  }
}
```

### Title Priority Logic
JavaScript displays titles in this priority order:
1. `manual_title` (if present and not empty)
2. `generated_title` (if present and not empty) 
3. `original_title` (fallback)

### Common Data Issues
- If you see "Error loading..." messages, check `data/articles.json` structure
- Missing `heroes` or `columns.news/tech/opinion` arrays causes display errors
- `last_updated` should be timestamp in milliseconds
- `image` field is optional for heroes but recommended for visual appeal

## File Structure and Navigation

### Repository Root Contents
```
.
├── index.html          # Main HTML file - loads static/js/site.js
├── static/
│   ├── css/style.css   # All styling (responsive design included)
│   └── js/site.js      # Article loading and rendering logic
├── data/
│   └── articles.json   # Formatted data consumed by JavaScript
├── articles-updated.json # Raw data from medaffairs-data (not used by website)
├── CNAME              # GitHub Pages domain config
├── .github/
│   ├── workflows/sync_data.yml # Data sync from medaffairs-data repo
│   └── copilot-instructions.md # This file
└── README.md          # Setup and architecture documentation
```

### Key Code Locations
- **Article loading logic**: Lines 79-88 in `static/js/site.js`
- **Hero rendering**: Lines 58-66 in `static/js/site.js`
- **Column rendering**: Lines 68-75 in `static/js/site.js`  
- **Title selection logic**: Lines 8-12 in `static/js/site.js`
- **Responsive CSS**: Lines 75-84 in `static/css/style.css`
- **Error handling**: Lines 85-88 in `static/js/site.js`

## GitHub Actions Data Pipeline

### Workflow: .github/workflows/sync_data.yml
- **Trigger**: `repository_dispatch` event with type `medaffairs-data-updated`
- **Purpose**: Sync `articles.json` from private medaffairs-data repository
- **Process**: Copies raw data to `data/articles.json` 
- **Requires**: `MEDAFFAIRS_DATA_TOKEN` secret for accessing private repo
- **IMPORTANT**: Currently syncs raw format that may need transformation

### Understanding the Data Gap
The sync workflow copies raw data, but the website expects formatted data. If articles don't display:
1. Check if `data/articles.json` has the expected structure 
2. Raw data from medaffairs-data may need transformation script
3. Manual updates to `data/articles.json` may be needed

## Common Tasks

### Updating Article Data (Manual Method)
1. Edit `data/articles.json` with correct structure
2. Validate JSON syntax: `python3 -c "import json; json.load(open('data/articles.json'))"`
3. ALWAYS test by serving site: `python3 -m http.server 8000`
4. Verify articles display correctly at `http://localhost:8000`
5. Test both desktop and mobile views

### Styling Changes  
1. Edit `static/css/style.css`
2. ALWAYS test responsive design: resize browser or use mobile viewport (375px width)
3. Test hero section images, column layout, and footer
4. Verify changes work on both desktop (1100px max-width) and mobile
5. Check hover effects and link colors

### HTML Structure Changes
1. Edit `index.html`  
2. Be careful with script tag loading `static/js/site.js`
3. Maintain existing element IDs: `hero-strip`, `news-list`, `tech-list`, `opinion-list`, `last-updated`
4. ALWAYS validate by serving the site and testing JavaScript functionality

### JavaScript Logic Changes
1. Edit `static/js/site.js`
2. Maintain the fetch to `data/articles.json` (not articles-updated.json)
3. Preserve title selection logic: manual_title → generated_title → original_title
4. Test error handling by temporarily breaking JSON structure
5. ALWAYS validate with real data loading

### Troubleshooting Common Issues
- **"Error loading..." messages**: Check `data/articles.json` structure and network loading
- **Empty sections**: Verify `heroes` and `columns.news/tech/opinion` arrays exist and have data
- **Images not loading**: Check `image` URLs; placeholder service may be blocked (normal)
- **Links not working**: Verify `url` fields in JSON are valid and complete URLs
- **Site not accessible**: Ensure HTTP server running, not using file:// URLs  
- **JavaScript errors**: Check browser console and validate JSON syntax
- **Wrong titles displayed**: Check title priority logic and ensure proper field names

## Build and Deployment

### No Build Process Required
- This is a static website with no build steps
- No dependencies, package managers, or compilation needed
- Deploy by copying files to any HTTP server
- GitHub Pages configured with CNAME for medaffairs.tech domain

### Current CI/CD Pipeline
- Data sync via GitHub Actions when medaffairs-data updates
- Automatic deployment via GitHub Pages on push to main branch
- No testing or validation steps (manual validation required)

## Performance Notes

### Measured Timing Expectations (NEVER CANCEL Commands)
- **HTTP server startup**: <3 seconds - Set timeout to 30+ seconds
- **Initial page load**: <2 seconds including JSON fetch
- **JSON fetch**: <0.01 seconds (1.7KB file)
- **Complete validation cycle**: <30 seconds total
- **Mobile responsive test**: <5 seconds

### No Long-Running Operations
- No build processes that take minutes
- No test suites to run  
- No database setup required
- All validation is near-instant
- Longest operation is server startup (3 seconds max)

## Development Workflow

### Making Changes
1. Edit files directly (no build required)
2. Start HTTP server: `python3 -m http.server 8000`
3. Test in browser: `http://localhost:8000`
4. Validate complete user scenario (click links, test mobile)
5. Stop server and commit changes

### Testing New Features
1. Always backup `data/articles.json` before major changes
2. Test with minimal data first, then full dataset
3. Verify error handling: temporarily break JSON structure
4. Test edge cases: very long article titles, missing images, empty arrays
5. Validate responsive design changes by resizing browser
6. Check browser console for errors (ignore placeholder image 404s)

### Data Integration Testing
1. When medaffairs-data syncs new data, verify the format matches expectations
2. Raw `articles-updated.json` structure differs from `data/articles.json`
3. May need transformation script if automatic sync doesn't format correctly
4. Always validate after GitHub Actions workflow runs

## Common File Outputs for Reference

### Repository Root Structure
```bash
$ ls -la
total 40
drwxr-xr-x 6 runner runner 4096 Sep 14 20:19 .
drwxr-xr-x 3 runner runner 4096 Sep 14 20:19 ..
drwxrwxr-x 7 runner runner 4096 Sep 14 20:19 .git
drwxrwxr-x 3 runner runner 4096 Sep 14 20:19 .github
-rw-rw-r-- 1 runner runner   15 Sep 14 20:19 CNAME
-rw-rw-r-- 1 runner runner 2689 Sep 14 20:19 README.md
-rw-rw-r-- 1 runner runner 1241 Sep 14 20:19 articles-updated.json
drwxrwxr-x 2 runner runner 4096 Sep 14 20:19 data
-rw-rw-r-- 1 runner runner 1679 Sep 14 20:19 index.html
drwxrwxr-x 4 runner runner 4096 Sep 14 20:19 static
```

### Working Server Output
```bash
$ python3 -m http.server 8000
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

### JSON Validation Commands
```bash
$ python3 -c "import json; json.load(open('data/articles.json'))" && echo "Valid"
Valid
$ curl http://localhost:8000/data/articles.json | head -5
{
  "last_updated": 1700000000000,
  "heroes": [
    {
      "manual_title": "AI Breakthrough in Medical Research",
```

Remember: This is a simple static website with a data sync pipeline. Most operations complete in seconds. Always validate changes by serving and viewing the site with real user interactions.