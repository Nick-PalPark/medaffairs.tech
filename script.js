async function loadContent() {
  try {
    const res = await fetch('content.json');
    const data = await res.json();

    // Render hero
    const heroWrap = document.querySelector('.hero-lockup');
    if (heroWrap) {
      heroWrap.innerHTML = '';
      (data.hero || []).forEach(item => {
        const div = document.createElement('div');
        div.className = 'hero-item';
        div.innerHTML = `
          <img src="${item.image}" alt="${item.snappy_title || item.title}" class="hero-img">
          <a href="${item.url}" class="headline" target="_blank" rel="noopener">${item.snappy_title || item.title}</a>
        `;
        heroWrap.appendChild(div);
      });
    }

    // Render columns
    const renderList = (selector, items) => {
      const ul = document.querySelector(selector);
      if (!ul) return;
      ul.innerHTML = '';
      items.forEach(it => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${it.url}" target="_blank" rel="noopener">${it.snappy_title || it.title}</a>`;
        ul.appendChild(li);
      });
    }

    renderList('.column.industry ul', data.columns.news || []);
    renderList('.column.tech ul', data.columns.tech || []);
    renderList('.column.opinion ul', data.columns.products || []);

  } catch (err) {
    console.error('Failed to load content.json', err);
  }
}

document.addEventListener('DOMContentLoaded', loadContent);
// Placeholder for future interactivity
// Example: Highlight headline on click

document.querySelectorAll('.headlines ul li a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Headline clicked: ' + this.textContent);
    });
});
