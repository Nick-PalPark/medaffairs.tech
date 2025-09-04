import React, { useEffect, useState } from 'react';

export default function App() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetch('./content.json')
      .then((r) => r.json())
      .then(setContent)
      .catch(console.error);
  }, []);

  if (!content) return <div>Loading…</div>;

  return (
    <div className="site">
      <header>
        <h1>Med Affairs Tech Report</h1>
      </header>
      <section className="hero">
        {content.hero.map((h) => (
          <article key={h.id} className="hero-item">
            <a href={h.url} target="_blank" rel="noopener noreferrer">
              <img src={h.image} alt="" />
              <h2>{h.snappy_title}</h2>
            </a>
          </article>
        ))}
      </section>
      <main className="columns">
        <section>
          <h3>News</h3>
          <ul>
            {content.columns.news.map((item, i) => (
              <li key={i}><a href={item.url} target="_blank" rel="noopener noreferrer">{item.snappy_title || item.title}</a></li>
            ))}
          </ul>
        </section>
        <section>
          <h3>Tech</h3>
          <ul>{content.columns.tech.map((t, i) => <li key={i}>{t.title}</li>)}</ul>
        </section>
        <section>
          <h3>Products</h3>
          <ul>{content.columns.products.map((p, i) => <li key={i}>{p.title}</li>)}</ul>
        </section>
      </main>
    </div>
  );
}
