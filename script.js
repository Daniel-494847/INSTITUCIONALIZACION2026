// Feedback visual al pulsar los botones
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function () {
        this.style.transform = 'scale(0.96)';
        setTimeout(() => { this.style.transform = ''; }, 150);
    });
});
