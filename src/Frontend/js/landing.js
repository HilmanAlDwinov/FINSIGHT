// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    const floatingBtn = document.getElementById('floatingBtn');
    
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Show floating button when scrolled
    if (window.scrollY > 300) {
        floatingBtn.classList.add('show');
    } else {
        floatingBtn.classList.remove('show');
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Counter animation for stats
function animateCounter(element, target, duration) {
    let current = 0;
    const increment = target / (duration / 16);
    const isPlus = element.textContent.includes('+');
    const isDollar = element.textContent.includes('$');
    const isPercent = element.textContent.includes('%');
    const isMoney = element.textContent.includes('M');
    const isK = element.textContent.includes('K');
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        let display = Math.floor(current);
        
        if (isDollar && isMoney) {
            display = '$' + display + 'M';
        } else if (isDollar && isK) {
            display = '$' + display + 'K';
        } else if (isK) {
            display = display + 'K';
        } else if (isPercent) {
            display = display + '%';
        } else {
            display = display;
        }
        
        if (isPlus && current === target) {
            display += '+';
        }
        
        element.textContent = display;
    }, 16);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            
            // Trigger counter animation for stats
            if (entry.target.classList.contains('stats')) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const text = stat.textContent;
                    const number = parseInt(text.replace(/[^0-9]/g, ''));
                    animateCounter(stat, number, 2000);
                });
                observer.unobserve(entry.target);
            }
        }
    });
}, observerOptions);

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Observe sections for animation
    const sections = document.querySelectorAll('.features, .how-works, .about, .stats');
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Staggered animation for feature cards
    const featureBoxes = document.querySelectorAll('.feature-box');
    featureBoxes.forEach((box, index) => {
        box.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Staggered animation for step cards
    const stepBoxes = document.querySelectorAll('.step-box');
    stepBoxes.forEach((box, index) => {
        box.style.animationDelay = `${index * 0.15}s`;
    });
    
    // Staggered animation for price cards
    const priceCards = document.querySelectorAll('.price-card');
    priceCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Add hover effect to all buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    const heroImage = document.querySelector('.hero-image');
    
    if (heroContent && window.innerWidth > 768) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        if (heroImage) {
            heroImage.style.transform = `translateY(${scrolled * 0.2}px)`;
        }
    }
});