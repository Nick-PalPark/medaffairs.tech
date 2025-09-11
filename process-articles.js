#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Process articles from the log and generate website content
 */
function processArticles() {
    try {
        // Read the articles log
        const logPath = path.join(__dirname, 'articles-log.json');
        const logData = JSON.parse(fs.readFileSync(logPath, 'utf8'));
        
        // Filter for approved articles only
        const approvedArticles = logData.articles.filter(article => article.status === 'approved');
        
        // Categorize articles based on their category field
        const categorizedArticles = {
            heroes: [],
            industry: [],
            tech: [],
            opinion: []
        };
        
        approvedArticles.forEach(article => {
            const articleForWeb = {
                title: article.title,
                url: article.url,
                cover_image: article.coverImage
            };
            
            // Categorize based on category field and tags
            const category = article.category.toLowerCase();
            const tags = (article.tags || '').toLowerCase();
            
            if (category.includes('technology') || category.includes('tech') || tags.includes('tech') || tags.includes('ai')) {
                categorizedArticles.tech.push(articleForWeb);
            } else if (category.includes('health') || category.includes('industry') || tags.includes('global') || tags.includes('initiative')) {
                categorizedArticles.industry.push(articleForWeb);
            } else if (category.includes('opinion') || category.includes('product')) {
                categorizedArticles.opinion.push(articleForWeb);
            } else {
                // Default to industry
                categorizedArticles.industry.push(articleForWeb);
            }
        });
        
        // Select heroes (take the 3 most recent approved articles)
        const recentArticles = approvedArticles
            .sort((a, b) => new Date(b.approvedDate) - new Date(a.approvedDate))
            .slice(0, 3);
            
        categorizedArticles.heroes = recentArticles.map(article => ({
            title: article.snappyTitle || article.title,
            url: article.url,
            cover_image: article.coverImage
        }));
        
        // Generate the output structure that index.html expects
        const output = {
            last_updated: new Date().toISOString(),
            heroes: categorizedArticles.heroes,
            industry: categorizedArticles.industry,
            tech: categorizedArticles.tech,
            opinion: categorizedArticles.opinion
        };
        
        // Write the processed articles
        const outputPath = path.join(__dirname, 'articles-updated.json');
        fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
        
        console.log(`Processed ${approvedArticles.length} approved articles`);
        console.log(`Heroes: ${output.heroes.length}`);
        console.log(`Industry: ${output.industry.length}`);
        console.log(`Tech: ${output.tech.length}`);
        console.log(`Opinion: ${output.opinion.length}`);
        console.log(`Output written to: ${outputPath}`);
        
        return output;
        
    } catch (error) {
        console.error('Error processing articles:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    processArticles();
}

module.exports = { processArticles };