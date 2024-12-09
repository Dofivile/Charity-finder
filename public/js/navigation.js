document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('show');
        });
    }

    document.addEventListener('click', function(event) {
        if (!event.target.closest('nav') && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
        }
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
        }
    });

    const currentPath = window.location.pathname;
    const navButtons = document.querySelectorAll('.nav-btn');

    navButtons.forEach(button => {
        const href = button.getAttribute('href');
        if (currentPath === href || 
            (href !== '/' && currentPath.startsWith(href))) {
            button.classList.add('active');
        }
    });
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && 
        document.querySelector('.nav-links.show')) {
        document.querySelector('.nav-links').classList.remove('show');
    }
});