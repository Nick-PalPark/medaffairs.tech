// Placeholder for future interactivity
// Example: Highlight headline on click

document.querySelectorAll('.headlines ul li a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Headline clicked: ' + this.textContent);
    });
});
