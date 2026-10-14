document.addEventListener("DOMContentLoaded", (event) => {
    const isMobile = window.innerWidth <= 768;

    // Graceful fallback if GSAP is not loaded
    if (typeof gsap === 'undefined') {
        document.querySelectorAll('.layer-1, .layer-2, .layer-3, .intro-text, .node, .artisan-workbench-bar, .workbench-element-card').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = '';
        });
        return;
    }

    // Ensure ScrollTrigger plugin is registered safely
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // ==========================================
    // SECTION 1: ARTISTIC INTRO
    // ==========================================
    if (isMobile) {
        // Mobile: Snappy, natural load sequence
        gsap.set('.intro-text', { opacity: 0, y: 15 });
        gsap.set('.hero-layers-showcase', { opacity: 0, scale: 0.96 });

        gsap.to('.intro-text', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out"
        });

        gsap.to('.hero-layers-showcase', {
            opacity: 1,
            scale: 1,
            duration: 0.7,
            delay: 0.2,
            ease: "power2.out"
        });

        // Ensure layers are fully rendered
        document.querySelectorAll('.layer-1, .layer-2, .layer-3').forEach(el => {
            el.style.opacity = '';
        });
    } else {
        // Desktop: Layered 3D Pop-Up sequence
        const introTl = gsap.timeline({
            onComplete: () => {
                document.querySelectorAll('.layer-1, .layer-2, .layer-3, .intro-text').forEach(el => {
                    el.style.opacity = '';
                    el.style.transform = '';
                });
            }
        });

        gsap.set('.layer-1, .layer-2, .layer-3', { opacity: 0, scale: 0.95, y: 30 });
        gsap.set('.intro-text', { opacity: 0, y: 20 });

        // 1st: Meditating Buddha
        introTl.to('.layer-1', {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
        })
        // 2nd: Shiva Parvati (0.3s delay)
        .to('.layer-2', {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out"
        }, 0.3)
        // 3rd: Yogi Chakra bloom (0.5s delay)
        .to('.layer-3', {
            opacity: 0.35,
            scale: 1,
            y: 0,
            duration: 1.0,
            ease: "power1.inOut"
        }, 0.5)
        // Headline & CTA Buttons fade in smoothly
        .to('.intro-text', {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out"
        }, 0.7);
    }

    // Universal Safeguard: Ensure full visibility after 1.5s
    setTimeout(() => {
        document.querySelectorAll('.layer-1, .layer-2, .layer-3, .intro-text, .hero-layers-showcase').forEach(el => {
            el.style.opacity = '';
        });
    }, 1500);


    // ==========================================
    // SECTION 2: SACRED VINE SCROLL
    // ==========================================

    // The SVG path growing (Desktop only)
    const vinePath = document.getElementById("vine-path");
    if (vinePath && !isMobile && typeof ScrollTrigger !== 'undefined') {
        try {
            const pathLength = vinePath.getTotalLength();
            gsap.set(vinePath, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

            ScrollTrigger.create({
                trigger: ".vine-section",
                start: "top center",
                end: "bottom bottom",
                scrub: 1,
                animation: gsap.to(vinePath, { strokeDashoffset: 0, ease: "none" })
            });
        } catch (e) {
            console.warn("Vine SVG path animation initialized safely:", e);
        }
    }

    // Etsy Spotlight Banner Animation
    const etsySpotlight = document.querySelector('.etsy-artisan-spotlight-card');
    if (etsySpotlight && typeof ScrollTrigger !== 'undefined') {
        gsap.fromTo(etsySpotlight,
            { opacity: 0, y: 35, scale: 0.98 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.9,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: etsySpotlight,
                    start: "top 92%",
                    toggleActions: "play none none none"
                }
            }
        );
    }

    // Artisan Workbench & Sacred Craft Mediums Reveal (Art pack elements)
    const workbenchBar = document.querySelector('.artisan-workbench-bar');
    if (workbenchBar && typeof ScrollTrigger !== 'undefined') {
        gsap.fromTo(workbenchBar,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.85,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: workbenchBar,
                    start: "top 92%",
                    toggleActions: "play none none none"
                }
            }
        );

        const craftCards = document.querySelectorAll('.workbench-element-card');
        if (craftCards.length > 0) {
            gsap.fromTo(craftCards,
                { opacity: 0, y: 25, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    stagger: 0.12,
                    duration: 0.7,
                    ease: "back.out(1.4)",
                    scrollTrigger: {
                        trigger: workbenchBar,
                        start: "top 88%",
                        toggleActions: "play none none none"
                    }
                }
            );
        }
    }

    // Sprouting Artisan Story Nodes
    const nodes = document.querySelectorAll('.node');
    nodes.forEach((node, index) => {
        if (typeof ScrollTrigger !== 'undefined') {
            if (isMobile) {
                // Mobile: Gentle fade-in as user scrolls down the vertical stream
                gsap.fromTo(node,
                    { opacity: 0.2, y: 25 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "power2.out",
                        scrollTrigger: {
                            trigger: node,
                            start: "top 95%",
                            toggleActions: "play none none none"
                        }
                    }
                );
            } else {
                // Desktop: Elegant upward reveal with smooth settle
                const slideX = node.classList.contains('left-node') ? -25 : (node.classList.contains('right-node') ? 25 : 0);
                gsap.fromTo(node, 
                    { opacity: 0, x: slideX, y: 40 },
                    {
                        opacity: 1,
                        x: 0,
                        y: 0,
                        duration: 0.85,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: node,
                            start: "top 90%",
                            toggleActions: "play none none none"
                        }
                    }
                );
            }
        } else {
            node.style.opacity = '1';
            node.style.transform = 'none';
        }
    });

    // Special Wiggle for Node 5 (Desktop only)
    const wiggleNode = document.querySelector('.wiggle-node');
    if (wiggleNode && !isMobile && typeof ScrollTrigger !== 'undefined') {
        gsap.to(wiggleNode, {
            rotation: "+=4",
            yoyo: true,
            repeat: -1,
            duration: 1.6,
            ease: "sine.inOut",
            scrollTrigger: {
                trigger: wiggleNode,
                start: "top 90%"
            }
        });
    }

    // Scroll to Vine CTA Button
    const scrollBtn = document.querySelector('.scroll-to-vine');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => {
            const vineSection = document.querySelector('.vine-section');
            if (vineSection) {
                const headerEl = document.getElementById('header');
                const headerHeight = headerEl ? headerEl.offsetHeight : 60;
                const targetPos = vineSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
            }
        });
    }

    // ==========================================
    // SECTION 4: CONCEPT 3 — THE HORIZONTAL "SWAYING FRAMES" GALLERY
    // ==========================================
    const horizontalGallery = document.getElementById('horizontalGalleryContainer');
    const galleryTrack = document.getElementById('galleryTrack');

    if (horizontalGallery && galleryTrack && typeof ScrollTrigger !== 'undefined') {
        const slides = document.querySelectorAll('.gallery-slide');
        const dots = document.querySelectorAll('.station-dot');
        const swayingFrames = document.querySelectorAll('.swaying-frame-unit');
        const hudIndicator = document.getElementById('hudStationIndicator');
        const progressBar = document.getElementById('galleryProgressBar');

        function getScrollAmount() {
            return Math.max(0, galleryTrack.scrollWidth - window.innerWidth);
        }

        let swayResetTimeout = null;
        let lastActiveIndex = -1;

        // Anchor suspension: frames swing from ceiling picture rail
        gsap.set(swayingFrames, { transformOrigin: "50% -120px" });

        // Pinned Horizontal Timeline driven smoothly by vertical scroll
        const horizontalTween = gsap.to(galleryTrack, {
            x: () => -getScrollAmount(),
            ease: "none",
            scrollTrigger: {
                trigger: horizontalGallery,
                start: "top top",
                end: () => "+=" + (getScrollAmount() + 500),
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
                anticipatePin: 1,
                onUpdate: (self) => {
                    const p = self.progress;

                    // Spatial binaural audio panning across gallery walk (-0.85 to +0.85)
                    if (window.atelierAudio && typeof window.atelierAudio.setSpatialPan === 'function') {
                        window.atelierAudio.setSpatialPan((p * 2) - 1);
                    }

                    // 1. Bottom progress bar width
                    if (progressBar) {
                        progressBar.style.width = (p * 100) + '%';
                    }

                    // 2. Physics Dual-Chain Pendulum Sway: Calculate tilt from scroll velocity
                    const velocity = self.getVelocity(); // px / sec
                    // Clamped tilt angle between -8.5 and +8.5 degrees with natural damping
                    const targetAngle = gsap.utils.clamp(-8.5, 8.5, velocity / -175);

                    // Organic inertia tilt on frames with staggered phase lag
                    swayingFrames.forEach((frame, idx) => {
                        gsap.to(frame, {
                            rotation: targetAngle,
                            duration: 0.32,
                            delay: idx * 0.015,
                            ease: "power2.out",
                            overwrite: "auto"
                        });
                    });

                    // Settle physics: when scrolling stops, settle like heavy museum glass
                    clearTimeout(swayResetTimeout);
                    swayResetTimeout = setTimeout(() => {
                        swayingFrames.forEach((frame, idx) => {
                            gsap.to(frame, {
                                rotation: 0,
                                duration: 1.6,
                                delay: idx * 0.02,
                                ease: "elastic.out(1.25, 0.38)",
                                overwrite: "auto"
                            });
                        });
                    }, 90);

                    // 3. Dynamic Station Indicator & Dots Synchronization
                    const viewportCenter = window.innerWidth / 2;
                    let closestIndex = 0;
                    let minDistance = Infinity;

                    slides.forEach((slide, idx) => {
                        const rect = slide.getBoundingClientRect();
                        const slideCenter = rect.left + rect.width / 2;
                        const dist = Math.abs(slideCenter - viewportCenter);
                        if (dist < minDistance) {
                            minDistance = dist;
                            closestIndex = idx;
                        }
                    });

                    if (closestIndex !== lastActiveIndex) {
                        lastActiveIndex = closestIndex;
                        
                        // Update dots
                        dots.forEach((dot, idx) => {
                            if (idx === closestIndex) {
                                dot.classList.add('active');
                            } else {
                                dot.classList.remove('active');
                            }
                        });

                        // Update HUD status
                        if (hudIndicator && slides[closestIndex]) {
                            const title = slides[closestIndex].getAttribute('data-title') || 'The Gallery';
                            hudIndicator.innerHTML = title;
                        }
                    }
                }
            }
        });

        // Tactile Pointer Tug & Release Physics on Hanging Frames
        swayingFrames.forEach((frame) => {
            let isDragging = false;
            let startX = 0;

            const onPointerDown = (e) => {
                isDragging = true;
                startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
                gsap.killTweensOf(frame);
            };

            const onPointerMove = (e) => {
                if (!isDragging) return;
                const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
                const diffX = currentX - startX;
                const dynamicAngle = gsap.utils.clamp(-12, 12, diffX * 0.12);
                gsap.to(frame, { rotation: dynamicAngle, duration: 0.1, ease: "power1.out" });
            };

            const onPointerUp = () => {
                if (!isDragging) return;
                isDragging = false;
                // Elastic spring recoil when released
                gsap.to(frame, {
                    rotation: 0,
                    duration: 1.5,
                    ease: "elastic.out(1.3, 0.35)",
                    overwrite: "auto"
                });
                if (window.playAtelierChime) window.playAtelierChime(528);
            };

            frame.addEventListener('pointerdown', onPointerDown);
            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);

            // Subtle mouse hover sway for desktop
            frame.addEventListener('mouseenter', () => {
                if (!isDragging) {
                    gsap.to(frame, {
                        rotation: 3.5,
                        duration: 0.35,
                        ease: "power2.out",
                        onComplete: () => {
                            gsap.to(frame, {
                                rotation: 0,
                                duration: 1.3,
                                ease: "elastic.out(1.2, 0.35)"
                            });
                        }
                    });
                }
            });

            // Dynamic museum track lighting spotlight beam following pointer
            const spotlight = frame.querySelector('.frame-spotlight');
            if (spotlight) {
                frame.addEventListener('mousemove', (e) => {
                    const rect = frame.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    spotlight.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255, 245, 220, 0.28) 0%, rgba(212, 175, 55, 0.08) 45%, transparent 75%)`;
                });
            }
        });

        // Mobile Touch Horizontal Gesture Handler
        let touchStartX = 0;
        let touchStartY = 0;
        let isHorizontalSwipe = false;

        horizontalGallery.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                isHorizontalSwipe = false;
            }
        }, { passive: true });

        horizontalGallery.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                const deltaX = touchStartX - e.touches[0].clientX;
                const deltaY = touchStartY - e.touches[0].clientY;
                if (!isHorizontalSwipe && Math.abs(deltaX) > Math.abs(deltaY) + 10) {
                    isHorizontalSwipe = true;
                }
                if (isHorizontalSwipe) {
                    // Translate horizontal swipe distance into vertical page scroll
                    window.scrollBy({ top: deltaX * 0.8, behavior: 'auto' });
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                }
            }
        }, { passive: true });

        // Global Navigation helper: Glide to Station index (0 to 8)
        window.glideToStation = function(index) {
            const targetSlide = document.getElementById('slide' + index);
            if (!targetSlide || !horizontalTween.scrollTrigger) return;

            const st = horizontalTween.scrollTrigger;
            const scrollDistance = getScrollAmount();
            if (scrollDistance <= 0) return;

            // Compute target offset centered in viewport
            const slideOffset = targetSlide.offsetLeft - (window.innerWidth - targetSlide.offsetWidth) / 2;
            const clampedOffset = Math.max(0, Math.min(scrollDistance, slideOffset));
            const targetScrollY = st.start + (clampedOffset / scrollDistance) * (st.end - st.start);

            window.scrollTo({
                top: targetScrollY,
                behavior: 'smooth'
            });
        };

        window.glideToNextStation = function() {
            const currentActive = document.querySelector('.station-dot.active');
            const currentIndex = currentActive ? parseInt(currentActive.getAttribute('data-index') || 0) : 0;
            const nextIndex = Math.min(9, currentIndex + 1);
            window.glideToStation(nextIndex);
        };

        window.glideToPrevStation = function() {
            const currentActive = document.querySelector('.station-dot.active');
            const currentIndex = currentActive ? parseInt(currentActive.getAttribute('data-index') || 0) : 0;
            const prevIndex = Math.max(0, currentIndex - 1);
            window.glideToStation(prevIndex);
        };

        // Keyboard arrow navigation
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'PageDown') {
                window.glideToNextStation();
            } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                window.glideToPrevStation();
            }
        });

        // Recalculate ScrollTrigger on window resize
        window.addEventListener('resize', () => {
            ScrollTrigger.refresh();
        });
    }

    // Lightbox modal functionality
    window.openLightbox = function(src, caption) {
        const modal = document.getElementById('presentation-modal');
        const img = document.getElementById('presentation-image');
        const cap = document.getElementById('presentation-caption');
        if (modal && img) {
            img.src = src;
            if (cap) cap.textContent = caption || '';
            modal.classList.add('active');
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeLightbox = function(e) {
        if (e && e.target && e.target.id === 'presentation-image') return;
        const modal = document.getElementById('presentation-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
    };
});
