// public/js/navigation.js

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the menu toggle button and navigation links
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    // Toggle mobile menu when hamburger icon is clicked
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('show');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('nav') && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
        }
    });

    // Close mobile menu when window is resized to desktop view
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
        }
    });

    // Get current page URL to highlight active nav link
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

// Handle keyboard navigation for accessibility
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && 
        document.querySelector('.nav-links.show')) {
        document.querySelector('.nav-links').classList.remove('show');
    }
});