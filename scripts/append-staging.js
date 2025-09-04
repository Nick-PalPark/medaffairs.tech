const fs = require('fs');
const path = require('path');

function safeParse(json) {
  try { return JSON.parse(json); } catch (e) { return null; }
}

function main() {
  const input = process.env.INPUT_PAYLOAD || process.argv[2];
  if (!input) {
    console.error('No input payload');
    process.exit(1);
  }

  const payload = safeParse(input);
  if (!payload) {
    console.error('Invalid JSON payload');
    process.exit(1);
  }

  const stagingPath = path.join(__dirname, '..', 'staging.json');
  let staging = { generated: null, candidates: [] };
  if (fs.existsSync(stagingPath)) {
    try { staging = JSON.parse(fs.readFileSync(stagingPath, 'utf8')); } catch (e) { /* ignore */ }
  }

  const item = {
    title: payload.title || payload.item_title || '',
    snappy_title: payload.snappy_title || payload.title || '',
    link: payload.url || payload.link || '',
    pubDate: payload.pubDate || new Date().toISOString(),
    source: payload.source || payload.site || null,
    image: payload.image || null
  };

  // Deduplicate by link
  staging.candidates = staging.candidates.filter(c => c.link !== item.link);
  staging.candidates.unshift(item);
  staging.generated = new Date().toISOString();

  fs.writeFileSync(stagingPath, JSON.stringify(staging, null, 2));
  console.log('Appended item to staging.json', item.link);
}

main();
