/**
 * LUXURY PORTFOLIO — Combined Design
 * Design 5 aesthetics + Current implementation functionality
 * ═══════════════════════════════════════════════════════════════
 * Features: Theme toggle, custom cursor, GSAP animations,
 * Lenis smooth scroll, role rotation, active nav tracking
 */

// =============================================================================
// Initialize on DOM Ready
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSmoothScroll();
    initNavigation();
    initCustomCursor();
    initAnimations();
    initRoleRotation();
    initActiveSection();
});

// =============================================================================
// Theme Management
// =============================================================================
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;

    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = savedTheme || 'dark';

    htmlElement.setAttribute('data-theme', currentTheme);

    themeToggle?.addEventListener('click', () => {
        const current = htmlElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';

        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Refresh ScrollTrigger to recalculate positions after theme change
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    });

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            htmlElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

// =============================================================================
// Smooth Scroll with Lenis
// =============================================================================
function initSmoothScroll() {
    // Check if Lenis is available
    if (typeof Lenis === 'undefined') {
        console.warn('Lenis not loaded, falling back to native scroll');
        initNativeSmoothScroll();
        return;
    }

    const lenis = new Lenis({
        duration: 1.4,  // Slower for luxury feel
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.9,  // Slightly slower scroll
        touchMultiplier: 2,
        infinite: false,
    });

    // Connect Lenis to GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && gsap.registerPlugin) {
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
    } else {
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');

            // Handle logo click (href="#") - scroll to top
            if (href === '#') {
                e.preventDefault();
                lenis.scrollTo(0, {
                    duration: 1.4
                });
                return;
            }

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                lenis.scrollTo(target, {
                    offset: -100,
                    duration: 1.4
                });

                closeMobileMenu();
            }
        });
    });

    window.lenis = lenis;
}

function initNativeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');

            // Handle logo click (href="#") - scroll to top
            if (href === '#') {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const offset = 100;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                closeMobileMenu();
            }
        });
    });
}

// =============================================================================
// Navigation
// =============================================================================
function initNavigation() {
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    // Nav scroll effect
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 80) {
            nav?.classList.add('scrolled');
        } else {
            nav?.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Mobile menu toggle
    navToggle?.addEventListener('click', () => {
        const isActive = navToggle.classList.contains('active');

        if (isActive) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
}

function openMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    navToggle?.classList.add('active');
    navToggle?.setAttribute('aria-expanded', 'true');
    mobileMenu?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    navToggle?.classList.remove('active');
    navToggle?.setAttribute('aria-expanded', 'false');
    mobileMenu?.classList.remove('active');
    document.body.style.overflow = '';
}

// =============================================================================
// Custom Cursor
// =============================================================================
function initCustomCursor() {
    // Only on devices with fine pointer (no touch)
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const cursor = document.querySelector('.cursor');
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    if (!cursor || !cursorDot || !cursorRing) return;

    let mouseX = 0;
    let mouseY = 0;
    let dotX = 0;
    let dotY = 0;
    let ringX = 0;
    let ringY = 0;

    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Animate cursor with slower follow for luxury feel
    function animateCursor() {
        // Dot follows with slight delay
        dotX += (mouseX - dotX) * 0.35;
        dotY += (mouseY - dotY) * 0.35;
        cursorDot.style.left = `${dotX}px`;
        cursorDot.style.top = `${dotY}px`;

        // Ring follows with more delay
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Interactive elements
    const interactiveElements = document.querySelectorAll(
        'a, button, .project-card, .writing-card, .exp-card, .image-frame'
    );

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
}

// =============================================================================
// GSAP Animations
// =============================================================================
function initAnimations() {
    // Check if GSAP is loaded
    if (typeof gsap === 'undefined') {
        console.warn('GSAP not loaded, using CSS fallback');
        document.querySelectorAll('[data-animate]').forEach(el => {
            el.classList.add('animated');
        });
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Hero animations on load with luxury timing
    const heroElements = document.querySelectorAll('.hero [data-animate]');

    gsap.to(heroElements, {
        opacity: 1,
        y: 0,
        x: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.3
    });

    // Section animations on scroll
    const sections = document.querySelectorAll('.section');

    sections.forEach(section => {
        const elements = section.querySelectorAll('[data-animate]');

        if (elements.length === 0) return;

        ScrollTrigger.create({
            trigger: section,
            start: 'top 75%',
            onEnter: () => {
                gsap.to(elements, {
                    opacity: 1,
                    y: 0,
                    x: 0,
                    duration: 1,
                    stagger: 0.12,
                    ease: 'power2.out'
                });
            },
            once: true
        });
    });

    // Subtle card hover effects
    const cards = document.querySelectorAll('.project-card, .writing-card, .exp-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                scale: 1.01,
                duration: 0.4,
                ease: 'power2.out'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                scale: 1,
                duration: 0.4,
                ease: 'power2.out'
            });
        });
    });

    // Hero parallax effect
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        gsap.to(heroVisual, {
            y: 80,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.5
            }
        });
    }

    // Hero content fade on scroll
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        gsap.to(heroContent, {
            opacity: 0.4,
            y: 40,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: '60% top',
                scrub: 1,
                invalidateOnRefresh: true  // Recalculate on refresh (e.g., theme toggle)
            }
        });
    }
}

// =============================================================================
// Role Text Rotation
// =============================================================================
function initRoleRotation() {
    const roleElement = document.getElementById('roleText');
    if (!roleElement) return;

    const roles = [
        'Software Engineer',
        'ML Researcher',
        'Systems Builder',
        'Security Enthusiast'
    ];

    let currentIndex = 0;

    // Elegant fade transition
    roleElement.style.transition = 'opacity 0.7s ease, transform 0.7s ease';

    setInterval(() => {
        // Fade out with subtle upward motion
        roleElement.style.opacity = '0';
        roleElement.style.transform = 'translateY(-6px)';

        setTimeout(() => {
            currentIndex = (currentIndex + 1) % roles.length;
            roleElement.textContent = roles[currentIndex];

            // Reset position below
            roleElement.style.transform = 'translateY(6px)';

            // Fade in
            requestAnimationFrame(() => {
                roleElement.style.opacity = '1';
                roleElement.style.transform = 'translateY(0)';
            });
        }, 700);
    }, 5000);  // Slower rotation for contemplative feel
}

// =============================================================================
// Active Section Tracking
// =============================================================================
function initActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (sections.length === 0 || navLinks.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '-25% 0px -75% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
}

// =============================================================================
// Utility Functions
// =============================================================================

// Debounce function
function debounce(func, wait = 100) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Preload critical resources
function preloadResources() {
    const heroImg = document.querySelector('.hero-image');
    if (heroImg) {
        const img = new Image();
        img.src = heroImg.src;
    }
}

// Initialize preloading
preloadResources();
