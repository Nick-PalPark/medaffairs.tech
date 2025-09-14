fetch('data/articles.json')
  .then(response => response.json())
  .then(articles => {
    const container = document.getElementById('articles');
    container.innerHTML = '';
    articles.forEach(article => {
      const el = document.createElement('div');
      el.className = 'article';
      el.innerHTML = `<h2>${article.title}</h2><p>${article.body}</p>`;
      container.appendChild(el);
    });
  })
  .catch(() => {
    document.getElementById('articles').innerHTML =
      '<p>Could not load articles.</p>';
  });