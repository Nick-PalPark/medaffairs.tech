#!/usr/bin/env node

/**
 * Test script for article data transformation
 * Usage: node .github/scripts/test-transform.js <input-file> [output-file]
 */

const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2];
const outputFile = process.argv[3] || '/tmp/test-transform-output.json';

if (!inputFile) {
  console.error('Usage: node test-transform.js <input-file> [output-file]');
  process.exit(1);
}

if (!fs.existsSync(inputFile)) {
  console.error(`Input file not found: ${inputFile}`);
  process.exit(1);
}

try {
  // Read the raw data
  const rawData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  console.log('Input data structure keys:', Object.keys(rawData));

  // Initialize the target structure
  const transformed = {
    last_updated: Date.now(),
    heroes: [],
    columns: {
      news: [],
      tech: [],
      opinion: []
    }
  };

  // Handle different input formats
  let articles = [];
  if (rawData.approvedArticles) {
    // Format from medaffairs-articles repository
    articles = rawData.approvedArticles;
    if (rawData.lastUpdated) {
      transformed.last_updated = new Date(rawData.lastUpdated).getTime();
    }
  } else if (Array.isArray(rawData)) {
    // Direct array format
    articles = rawData;
  } else if (rawData.articles) {
    // Nested articles format
    articles = rawData.articles;
  }

  console.log('Found', articles.length, 'articles to transform');

  // Transform articles
  let heroCount = 0;
  articles.forEach((article, index) => {
    const transformedArticle = {
      original_title: article.title || 'Untitled',
      url: article.url || '#',
      source: article.source || 'Unknown',
      published_at: article.publishedDate ? new Date(article.publishedDate).getTime() : Date.now()
    };

    // Add optional fields
    if (article.snappyTitle) transformedArticle.generated_title = article.snappyTitle;
    if (article.manualTitle) transformedArticle.manual_title = article.manualTitle;

    // Determine placement - first 3 go to heroes, rest to columns
    if (heroCount < 3) {
      transformedArticle.image = article.coverImage || 'https://via.placeholder.com/180x150?text=News';
      transformed.heroes.push(transformedArticle);
      heroCount++;
      console.log(`  Article ${index + 1} -> Hero ${heroCount}: "${transformedArticle.original_title}"`);
    } else {
      // Categorize into columns based on category or tags
      const category = (article.category || '').toLowerCase();
      const tags = (article.tags || '').toLowerCase();

      let targetColumn = 'news'; // default
      if (category.includes('tech') || tags.includes('tech') || tags.includes('ai')) {
        targetColumn = 'tech';
      } else if (category.includes('opinion') || category.includes('analysis') || tags.includes('opinion')) {
        targetColumn = 'opinion';
      }

      transformed.columns[targetColumn].push(transformedArticle);
      console.log(`  Article ${index + 1} -> ${targetColumn.toUpperCase()}: "${transformedArticle.original_title}"`);
    }
  });

  // Write the transformed data
  fs.writeFileSync(outputFile, JSON.stringify(transformed, null, 2));
  
  console.log('\n✅ Transformation complete:');
  console.log(`  Heroes: ${transformed.heroes.length}`);
  console.log(`  Industry News: ${transformed.columns.news.length}`);
  console.log(`  Tech Insights: ${transformed.columns.tech.length}`);
  console.log(`  Opinion & Analysis: ${transformed.columns.opinion.length}`);
  console.log(`  Output saved to: ${outputFile}`);

} catch (error) {
  console.error('Error during transformation:', error.message);
  process.exit(1);
}