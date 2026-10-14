document.addEventListener('DOMContentLoaded', () => {
    // 1. Current Year for Footer (Safe Guarded)
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // 2. Sticky Header Logic
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // 3. Mobile Navigation Toggle & Drawer
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    let navBackdrop = document.querySelector('.nav-backdrop');

    if (!navBackdrop) {
        navBackdrop = document.createElement('div');
        navBackdrop.className = 'nav-backdrop';
        document.body.appendChild(navBackdrop);
    }

    function toggleMobileNav(forceState) {
        if (!navToggle || !mainNav) return;
        const shouldOpen = typeof forceState === 'boolean' ? forceState : !navToggle.classList.contains('open');
        if (shouldOpen) {
            navToggle.classList.add('open');
            mainNav.classList.add('active');
            if (navBackdrop) navBackdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            navToggle.classList.remove('open');
            mainNav.classList.remove('active');
            if (navBackdrop) navBackdrop.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (navToggle) {
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileNav();
        });
    }

    if (navBackdrop) {
        navBackdrop.addEventListener('click', () => {
            toggleMobileNav(false);
        });
    }

    const navCloseDrawer = document.querySelector('.nav-close-drawer');
    if (navCloseDrawer) {
        navCloseDrawer.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileNav(false);
        });
    }

    // Auto-close mobile drawer when any navigation link is clicked
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', () => {
            toggleMobileNav(false);
        });
    });

    // 4. Precise Smooth Scrolling with Header Offset
    document.querySelectorAll('a[href*="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#' || href.startsWith('#modal-')) return;
            
            let targetId = '';
            if (href.startsWith('#')) {
                targetId = href;
            } else if (href.includes('#')) {
                const parts = href.split('#');
                const page = parts[0];
                const hash = '#' + parts[1];
                const currentPath = window.location.pathname;
                const isCurrentPage = currentPath.endsWith(page) || 
                    (page === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('/index.html') || !currentPath.includes('.')));
                if (isCurrentPage) {
                    targetId = hash;
                }
            }

            if (targetId) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    toggleMobileNav(false);
                    
                    const headerEl = document.getElementById('header');
                    const headerHeight = headerEl ? headerEl.offsetHeight : 65;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 12;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // 5. Scroll Animations (Reveal on Scroll) with Safe Viewport & Fallback Trigger
    const revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-scale, .reveal-slide-left');
    
    if (revealElements.length > 0) {
        // Immediate reveal check function for fast rendering
        const revealIfInViewport = () => {
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            revealElements.forEach(el => {
                if (!el.classList.contains('visible')) {
                    const rect = el.getBoundingClientRect();
                    // If element is in or near viewport (within 120px below)
                    if (rect.top <= windowHeight + 120 && rect.bottom >= -60) {
                        el.classList.add('visible');
                    }
                }
            });
        };

        // Run immediately so above-the-fold content is instantly visible!
        revealIfInViewport();

        // IntersectionObserver if available
        if ('IntersectionObserver' in window) {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.05,
                rootMargin: "0px 0px 80px 0px"
            });

            revealElements.forEach(el => revealObserver.observe(el));
        }

        // Event listeners as backup
        window.addEventListener('scroll', revealIfInViewport, { passive: true });
        window.addEventListener('resize', revealIfInViewport, { passive: true });

        // Absolute safeguard: reveal all after 1.2 seconds so nothing ever stays hidden
        setTimeout(() => {
            revealElements.forEach(el => el.classList.add('visible'));
        }, 1200);
    }

    // 6. Global Presentation Modal Logic
    const modal = document.getElementById('presentation-modal');
    const modalImg = document.getElementById('presentation-image');
    const closeBtn = document.getElementById('modal-close');
    const fallingLeavesContainer = document.getElementById('falling-leaves');

    function createLeaves() {
        if (!fallingLeavesContainer) return;
        fallingLeavesContainer.innerHTML = '';
        const leafCount = 15;
        for (let i = 0; i < leafCount; i++) {
            const leaf = document.createElement('div');
            leaf.classList.add('falling-leaf');
            leaf.style.left = Math.random() * 100 + 'vw';
            leaf.style.animationDuration = (Math.random() * 5 + 5) + 's';
            leaf.style.animationDelay = (Math.random() * 5) + 's';
            leaf.style.opacity = (Math.random() * 0.3 + 0.1);
            fallingLeavesContainer.appendChild(leaf);
        }
    }

    function openPresentation(src) {
        if (!modal || !modalImg) return;
        modalImg.src = src;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        createLeaves();
    }

    function closePresentation() {
        if (!modal) return;
        modal.classList.remove('open');
        document.body.style.overflow = '';
        if (fallingLeavesContainer) {
            setTimeout(() => { fallingLeavesContainer.innerHTML = ''; }, 500);
        }
    }

    // Attach click to all artwork images
    const artworkImages = document.querySelectorAll(
        '.art-frame img, .masonry-portfolio img, .portfolio-item img, .hero-img, .bio-image img, ' +
        '.chapter-image img, .royal-mirror-showcase img, .breathe-card img, .scatter-item img, ' +
        '.node img, .painted-pebbles-hero, .pebble-thumb-img, .tool-img, .tool-img-secondary'
    );
    
    artworkImages.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', (e) => {
            // Don't hijack links or buttons unless within mirror showcase
            if (img.closest('a') && !img.closest('.mirror-artwork-container')) return;
            e.preventDefault();
            openPresentation(img.src);
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closePresentation);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target === fallingLeavesContainer) {
                closePresentation();
            }
        });
    }

    // Butterfly Interactive Click Flutter
    const butterfly = document.querySelector('.jeweled-butterfly-badge');
    if (butterfly) {
        butterfly.addEventListener('click', () => {
            butterfly.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
            butterfly.style.transform = 'scale(1.4) translateY(-30px) rotate(15deg)';
            setTimeout(() => {
                butterfly.style.transform = '';
            }, 900);
        });
    }

    // 7. Atelier Support Modals Handler
    document.querySelectorAll('.atelier-modal-trigger').forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.getAttribute('data-modal');
            const targetModal = document.getElementById(modalId);
            if (targetModal) {
                targetModal.classList.add('open');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    document.querySelectorAll('.atelier-info-modal .modal-close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const m = this.closest('.atelier-info-modal');
            if (m) {
                m.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    });

    document.querySelectorAll('.atelier-info-modal').forEach(m => {
        m.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    });

    
    // ==========================================
    // 8. WATER RIPPLE HOVER PHYSICS (Pebble Art)
    // ==========================================
    const rippleCanvas = document.getElementById('waterRippleCanvas');
    const waterContainer = document.getElementById('waterPebbleContainer') || document.querySelector('.water-container');
    
    if (rippleCanvas && waterContainer) {
        const ctx = rippleCanvas.getContext('2d');
        let ripples = [];
        let animActive = true;

        function resizeCanvas() {
            rippleCanvas.width = waterContainer.offsetWidth;
            rippleCanvas.height = waterContainer.offsetHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        function createRipple(x, y) {
            ripples.push({
                x,
                y,
                radius: 6,
                maxRadius: 100,
                opacity: 0.7,
                lineWidth: 2.2,
                speed: 2.4
            });
            if (ripples.length > 20) ripples.shift();
        }

        waterContainer.addEventListener('mousemove', (e) => {
            const rect = waterContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            createRipple(x, y);
        });

        // Trigger gentle ripples when hovering over individual river pebble cards
        document.querySelectorAll('.river-pebble-card, .scatter-item').forEach(pebble => {
            pebble.addEventListener('mouseenter', (e) => {
                const rect = waterContainer.getBoundingClientRect();
                const pRect = pebble.getBoundingClientRect();
                const x = (pRect.left + pRect.width / 2) - rect.left;
                const y = (pRect.top + pRect.height / 2) - rect.top;
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => createRipple(x + (Math.random() * 24 - 12), y + (Math.random() * 24 - 12)), i * 140);
                }
            });
        });

        function animateRipples() {
            ctx.clearRect(0, 0, rippleCanvas.width, rippleCanvas.height);
            for (let i = ripples.length - 1; i >= 0; i--) {
                const r = ripples[i];
                
                // Outer cyan/turquoise river ring
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(14, 139, 153, " + r.opacity + ")";
                ctx.lineWidth = r.lineWidth;
                ctx.stroke();

                // Inner sacred gold concentric ring
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius * 0.65, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(212, 175, 55, " + (r.opacity * 0.6) + ")";
                ctx.lineWidth = Math.max(0.8, r.lineWidth * 0.7);
                ctx.stroke();

                r.radius += r.speed;
                r.opacity *= 0.965;
                r.lineWidth = Math.max(0.5, r.lineWidth * 0.98);

                if (r.opacity < 0.02 || r.radius > r.maxRadius) {
                    ripples.splice(i, 1);
                }
            }
            if (animActive) requestAnimationFrame(animateRipples);
        }
        animateRipples();
    }

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.atelier-info-modal.open').forEach(m => {
                m.classList.remove('open');
            });
            closePresentation();
            document.body.style.overflow = '';
        }
    });

    // Artisan Paintbrush Click Pigment Bloom
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        document.addEventListener('pointerdown', (e) => {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
            const dab = document.createElement('div');
            dab.className = 'brush-paint-dab';
            dab.style.left = e.clientX + 'px';
            dab.style.top = e.clientY + 'px';
            document.body.appendChild(dab);
            requestAnimationFrame(() => {
                const scale = (Math.random() * 0.8 + 1.2).toFixed(2);
                dab.style.transform = `translate(-50%, -50%) scale(${scale})`;
                dab.style.opacity = '0';
            });
            setTimeout(() => {
                if (dab.parentNode) dab.parentNode.removeChild(dab);
            }, 650);
        });
    }
});

// Global Newsletter Handler
window.handleNewsletterSubmit = function(e) {
    if (e) e.preventDefault();
    const emailInput = document.getElementById('newsletter-email');
    const statusEl = document.getElementById('newsletter-status');
    if (emailInput && emailInput.value) {
        if (statusEl) {
            statusEl.textContent = '✨ Welcome to the Atelier Circle! A confirmation has been sent to ' + emailInput.value;
            statusEl.style.display = 'block';
            statusEl.style.color = '#D4AF37';
        }
        emailInput.value = '';
        setTimeout(() => {
            if (statusEl) statusEl.style.display = 'none';
        }, 6000);
    }
    return false;
};
