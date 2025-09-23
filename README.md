# MedAffairs.tech — Automated RSS Article Collection & Display

A Drudge.com-inspired website that automatically collects and displays medical/healthcare news articles from RSS feeds via Zapier integration.

## 🚀 Key Features

- **Automated RSS Processing**: Zapier integration with Inoreader for seamless article collection
- **Drudge-inspired Layout**: 3 hero articles above header + 3-column layout below
- **Smart Categorization**: Automatic article assignment to Industry News, Tech Insights, or Opinion & Analysis
- **Article Management**: Hero article rotation, 20-article limits per column
- **Mobile Responsive**: Clean, fast-loading design that works on all devices
- **GitHub Pages Hosting**: Static site with automated deployments

## 📋 Quick Setup

### 1. Zapier Integration (Recommended)
1. **RSS Trigger**: Set up Zapier with RSS by Zapier trigger
2. **Webhook Action**: Configure repository dispatch to this repo
3. **Article Processing**: Articles automatically categorized and added
4. **See**: [ZAPIER_INTEGRATION.md](ZAPIER_INTEGRATION.md) for detailed setup

### 2. Manual Article Management
- **Admin Interface**: Use `/admin.html` to manually add articles
- **Direct Editing**: Edit `data/articles.json` in the GitHub interface
- **API Integration**: Use repository dispatch API for custom integrations

### 3. Legacy Data Sync (Optional)
If you have an existing medaffairs-data repository:
### 3. Legacy Data Sync (Optional)
If you have an existing medaffairs-data repository:
- Create a PAT with `repo` scope
- Add `MEDAFFAIRS_DATA_TOKEN` secret to repository settings
- The `sync_data.yml` workflow will sync from medaffairs-data on repository dispatch

### 4. GitHub Pages Setup
- **Pages Source**: Deploy from main branch (root directory)
- **Custom Domain**: CNAME file already configured for medaffairs.tech
- **DNS**: Point A records to GitHub Pages IPs or CNAME to username.github.io

## 🏗️ Architecture

### Data Flow
```
Inoreader RSS → Zapier → GitHub Repository Dispatch → Article Processing → Website Update
```

### Article Structure
Articles are stored in `data/articles.json` with this structure:
```json
{
  "last_updated": 1700000000000,
  "heroes": [
    {
      "manual_title": "Optional manual title override",
      "generated_title": "AI-generated snappy title",
      "original_title": "Original RSS title",
      "url": "https://example.com/article",
      "image": "https://example.com/image.jpg",
      "source": "Source Name",
      "published_at": 1699000000000
    }
  ],
  "columns": {
    "news": [...],     // Industry News articles
    "tech": [...],     // Tech Insights articles  
    "opinion": [...]   // Opinion & Analysis articles
  }
}
```

### Article Limits & Rotation
- **Heroes**: Max 3 articles (newest first)
- **Columns**: Max 20 articles each (newest first)
- **Auto-rotation**: Older articles automatically removed

## 📝 Article Management

### Automatic Categorization
Articles are categorized based on tags and content:
- **Hero Articles**: Tagged with `hero` or `isHero: true`
- **Industry News**: Default category, or tagged `news`
- **Tech Insights**: Tagged `tech` or category contains "tech"
- **Opinion & Analysis**: Tagged `opinion` or category contains "opinion"

### Title Priority
Displayed titles use this hierarchy:
1. `manual_title` (manually set override)
2. `generated_title` (AI-generated snappy title)
3. `original_title` (from RSS feed)

### Manual Management Options
1. **Admin Interface**: Visit `/admin.html` for a user-friendly form
2. **GitHub Web Interface**: Edit `data/articles.json` directly
3. **API Integration**: Use repository dispatch API calls

## 🔧 Development

### Local Development
```bash
# Clone repository
git clone https://github.com/Nick-PalPark/medaffairs.tech.git
cd medaffairs.tech

# Serve locally
python3 -m http.server 8000
# Visit http://localhost:8000
```

### Testing Workflows
```bash
# Test Zapier webhook simulation
gh api repos/Nick-PalPark/medaffairs.tech/dispatches \
  --method POST \
  --field event_type='zapier-article-received' \
  --field client_payload='{"title":"Test Article","url":"https://example.com"}'
```

### File Structure
```
.
├── index.html              # Main website
├── admin.html              # Article management interface
├── data/articles.json      # Article data store
├── static/
│   ├── css/style.css      # Responsive styling
│   └── js/site.js         # Article rendering logic
├── .github/workflows/
│   ├── zapier-webhook.yml  # Main article processing
│   ├── sync_data.yml      # Legacy data sync
│   └── sync_from_articles.yml
├── ZAPIER_INTEGRATION.md   # Zapier setup guide
└── README.md              # This file
```

## 📱 Mobile Responsive Design

The website features a fully responsive design that adapts to all screen sizes:
- **Desktop**: 3 hero articles side-by-side, 3-column layout
- **Mobile**: Stacked hero articles, single-column layout
- **Tablet**: Optimized layouts for medium screens

## 🔒 Security & Privacy

- **Static Site**: No server-side processing, enhanced security
- **GitHub Actions**: Secure token-based authentication
- **Rate Limiting**: Built-in GitHub API rate limiting
- **Content Validation**: Article data validated before processing

## 📈 Monitoring & Maintenance

### Monitoring Points
- **GitHub Actions**: Check workflow execution logs
- **Zapier Dashboard**: Monitor task success/failure rates
- **Website Uptime**: GitHub Pages uptime monitoring
- **Article Updates**: Check "Last updated" timestamp on site

### Troubleshooting
1. **Articles not appearing**: Check GitHub Actions logs
2. **Zapier failures**: Verify GitHub token permissions
3. **Category issues**: Review tag-based categorization rules
4. **Image loading**: Ensure cover image URLs are accessible

## 📚 Additional Resources

- [Zapier Integration Guide](ZAPIER_INTEGRATION.md) - Complete setup instructions
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Repository Dispatch API](https://docs.github.com/en/rest/repos/repos#create-a-repository-dispatch-event)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with local server
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
