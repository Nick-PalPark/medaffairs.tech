const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36'
};

async function fetchText(url) {
  const res = await fetch(url, { headers: DEFAULT_HEADERS });
  return { ok: res.ok, status: res.status, headers: res.headers, text: await res.text() };
}

async function tryAutodiscover(html, baseUrl) {
  // look for <link type="application/rss+xml" href="...">
  const m = html.match(/<link[^>]+type=["']application\/rss\+xml["'][^>]*href=["']([^"']+)["']/i);
  if (m && m[1]) return new URL(m[1], baseUrl).toString();
  // fallback: common feed hrefs
  const common = ['rss', 'feed', 'feeds', 'rss.xml', 'index.xml'];
  for (const c of common) {
    try {
      const trial = new URL(c, baseUrl).toString();
      return trial;
    } catch (e) {
      // ignore
    }
  }
  return null;
}

function sanitizeXml(text) {
  // Replace bare ampersands that aren't part of entities
  return text.replace(/&(?!(?:amp|lt|gt|quot|apos);)/g, '&amp;');
}

async function run() {
  const feedsPath = path.join(__dirname, '..', 'feeds.json');
  const feeds = JSON.parse(fs.readFileSync(feedsPath, 'utf8'));
  const parser = new Parser();
  const candidates = [];

  for (const feedUrl of feeds) {
    try {
      let attemptUrl = feedUrl;
      let fetched = await fetchText(attemptUrl);

      if (!fetched.ok) {
        console.error(`Failed to fetch ${attemptUrl} Status code ${fetched.status}`);
        // try fetching the page and autodiscover a feed link
        const page = await fetchText(attemptUrl);
        if (page.ok) {
          const discovery = await tryAutodiscover(page.text, attemptUrl);
          if (discovery) {
            console.log('Autodiscovered feed for', attemptUrl, '->', discovery);
            attemptUrl = discovery;
            fetched = await fetchText(attemptUrl);
          }
        }
      }

      if (!fetched.ok) {
        console.error('Giving up on', feedUrl, 'status', fetched.status);
        continue;
      }

      let text = fetched.text;
      // If response looks like HTML (no <rss> or <feed>), try autodiscover on that HTML
      if (!/\<(rss|feed)\b/i.test(text)) {
        const discovery = await tryAutodiscover(text, attemptUrl);
        if (discovery && discovery !== attemptUrl) {
          console.log('Autodiscovered inside HTML for', attemptUrl, '->', discovery);
          const next = await fetchText(discovery);
          if (next.ok) text = next.text;
        }
      }

      // sanitize common XML problems (unescaped &)
      const sanitized = sanitizeXml(text);

      let feed;
      try {
        feed = await parser.parseString(sanitized);
      } catch (err) {
        console.error('Failed to parse feed from', attemptUrl, err.message || err);
        continue;
      }

      for (const item of (feed.items || []).slice(0, 8)) {
        candidates.push({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate || null,
          source: feed.title || null
        });
      }

    } catch (err) {
      console.error('Error processing', feedUrl, err && err.message ? err.message : err);
    }
  }

  const outPath = path.join(__dirname, '..', 'staging.json');
  fs.writeFileSync(outPath, JSON.stringify({ generated: new Date().toISOString(), candidates }, null, 2));
  console.log('Wrote', outPath);
}

run().catch(err => { console.error(err); process.exit(1); });
