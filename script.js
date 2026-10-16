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
        // Skip particle DOM nodes on mobile devices to preserve battery and frame rate
        if (window.innerWidth <= 768) {
            fallingLeavesContainer.innerHTML = '';
            return;
        }
        fallingLeavesContainer.innerHTML = '';
        const leafCount = 8;
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

        let isRippleRunning = false;
        let isSectionVisible = true;

        // Use IntersectionObserver to stop animation when out of view
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                isSectionVisible = entries[0].isIntersecting;
                if (isSectionVisible && ripples.length > 0 && !isRippleRunning) {
                    isRippleRunning = true;
                    requestAnimationFrame(animateRipples);
                }
            }, { threshold: 0.05 });
            observer.observe(waterContainer);
        }

        function queueRippleAnimation() {
            if (!isRippleRunning && isSectionVisible && animActive) {
                isRippleRunning = true;
                requestAnimationFrame(animateRipples);
            }
        }

        waterContainer.addEventListener('mousemove', (e) => {
            const rect = waterContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            createRipple(x, y);
            queueRippleAnimation();
        }, { passive: true });

        // Trigger gentle ripples when hovering over individual river pebble cards
        document.querySelectorAll('.river-pebble-card, .scatter-item').forEach(pebble => {
            pebble.addEventListener('mouseenter', (e) => {
                const rect = waterContainer.getBoundingClientRect();
                const pRect = pebble.getBoundingClientRect();
                const x = (pRect.left + pRect.width / 2) - rect.left;
                const y = (pRect.top + pRect.height / 2) - rect.top;
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        createRipple(x + (Math.random() * 24 - 12), y + (Math.random() * 24 - 12));
                        queueRippleAnimation();
                    }, i * 140);
                }
            }, { passive: true });
        });

        function animateRipples() {
            if (!isSectionVisible || !animActive || ripples.length === 0) {
                isRippleRunning = false;
                ctx.clearRect(0, 0, rippleCanvas.width, rippleCanvas.height);
                return;
            }

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

            if (ripples.length > 0) {
                requestAnimationFrame(animateRipples);
            } else {
                isRippleRunning = false;
                ctx.clearRect(0, 0, rippleCanvas.width, rippleCanvas.height);
            }
        }
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

/* ==========================================================================
   HIMALAYAN ATELIER PROCEDURAL AUDIO ENGINE (WEB AUDIO API)
   Zero-dependency sacred ambient synthesizer:
   - 432Hz & 528Hz Tibetan Singing Bowls with harmonic overtones
   - Flowing Ganga River stream simulation with bandpass-filtered pink noise
   - Warm acoustic Tanpura meditative drones (Pa-Sa intervals)
   ========================================================================== */
class AtelierAudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isPlaying = false;
        this.currentPreset = localStorage.getItem('rangritico_audio_preset') || 'dhyana';
        this.volume = parseFloat(localStorage.getItem('rangritico_audio_volume') || '0.5');
        this.nodes = [];
        this.strikeTimer = null;
        this.streamSource = null;
        this.initUI();
    }

    initContext() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return null;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
            
            // Spatial Stereo Panner for gallery audio walk
            if (this.ctx.createStereoPanner) {
                this.panner = this.ctx.createStereoPanner();
                this.masterGain.connect(this.panner);
                this.panner.connect(this.ctx.destination);
            } else {
                this.masterGain.connect(this.ctx.destination);
            }
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    setSpatialPan(panValue) {
        if (this.panner && this.ctx) {
            const clamped = Math.max(-0.85, Math.min(0.85, panValue));
            this.panner.pan.setValueAtTime(clamped, this.ctx.currentTime);
        }
    }

    // Strike Tibetan Singing Bowl Harmonic Tone
    strikeSingingBowl(freq = 432, duration = 4.5, gainLevel = 0.4) {
        if (!this.initContext()) return;
        const now = this.ctx.currentTime;
        const harmonics = [
            { mult: 1.0, level: gainLevel },
            { mult: 1.225, level: gainLevel * 0.45 }, // Minor third overtone
            { mult: 2.0, level: gainLevel * 0.25 },   // Octave
            { mult: 2.76, level: gainLevel * 0.12 }   // High ring
        ];

        harmonics.forEach(h => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq * h.mult, now);
            // Subtle frequency shimmer
            osc.frequency.linearRampToValueAtTime((freq * h.mult) * 0.998, now + duration);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(h.level, now + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + duration);
        });
    }

    // Ganges River Water Flow Stream (Filtered Pink Noise with Slow Wave LFO)
    createGangaStream() {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
            b6 = white * 0.115926;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, this.ctx.currentTime);
        filter.Q.setValueAtTime(0.85, this.ctx.currentTime);

        // LFO to modulate filter frequency simulating gentle river current ripples
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime); // 0.18 Hz slow swell
        lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
        lfo.connect(filter.frequency);

        const streamGain = this.ctx.createGain();
        streamGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

        noise.connect(filter);
        filter.connect(streamGain);
        streamGain.connect(this.masterGain);

        noise.start(0);
        lfo.start(0);

        return { noise, lfo, streamGain };
    }

    // Meditative Tanpura Drone (Pa-Sa intervals)
    createTanpuraDrone() {
        if (!this.ctx) return [];
        // Root Sa at 108Hz, Pancham Pa at 162Hz, High Sa at 216Hz
        const droneFreqs = [108, 162, 216];
        const droneNodes = [];

        droneFreqs.forEach((f, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, this.ctx.currentTime);
            // Gentle detune for acoustic shimmer
            osc.detune.setValueAtTime(idx === 1 ? 4 : (idx === 2 ? -3 : 0), this.ctx.currentTime);

            gain.gain.setValueAtTime(0.06 / (idx + 1), this.ctx.currentTime);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(0);
            droneNodes.push({ osc, gain });
        });

        return droneNodes;
    }

    startPreset(presetName) {
        this.stopAllNodes();
        if (!this.initContext()) return;
        this.currentPreset = presetName;
        localStorage.setItem('rangritico_audio_preset', presetName);

        if (presetName === 'dhyana') {
            // Himalayan Dhyana: Singing Bowls struck every 9 seconds + gentle drone
            const tanpura = this.createTanpuraDrone();
            this.nodes.push(...tanpura);
            this.strikeSingingBowl(432, 5.5, 0.45);
            let strikeToggle = false;
            this.strikeTimer = setInterval(() => {
                strikeToggle = !strikeToggle;
                // Alternate between 432Hz (Root) and 528Hz (Heart Chakra)
                const freq = strikeToggle ? 528 : 432;
                this.strikeSingingBowl(freq, 6.0, 0.4);
            }, 9000);
        } else if (presetName === 'ganga') {
            // Ganga Ghats: River water pink noise stream + occasional temple bell
            const stream = this.createGangaStream();
            if (stream) this.nodes.push(stream);
            this.strikeSingingBowl(864, 4.0, 0.25);
            this.strikeTimer = setInterval(() => {
                this.strikeSingingBowl(1056, 3.5, 0.22);
            }, 12000);
        } else if (presetName === 'tanpura') {
            // Deep Tanpura Meditative Drone
            const tanpura = this.createTanpuraDrone();
            this.nodes.push(...tanpura);
        }
    }

    stopAllNodes() {
        if (this.strikeTimer) {
            clearInterval(this.strikeTimer);
            this.strikeTimer = null;
        }
        if (this.nodes && this.nodes.length > 0) {
            this.nodes.forEach(n => {
                try {
                    if (n.osc) n.osc.stop();
                    if (n.noise) n.noise.stop();
                    if (n.lfo) n.lfo.stop();
                } catch (e) {}
            });
            this.nodes = [];
        }
    }

    play() {
        this.initContext();
        this.isPlaying = true;
        this.startPreset(this.currentPreset);
        this.updateWidgetUI();
    }

    pause() {
        this.isPlaying = false;
        this.stopAllNodes();
        this.updateWidgetUI();
    }

    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    setPreset(name) {
        this.currentPreset = name;
        if (this.isPlaying) {
            this.startPreset(name);
        }
        this.updateWidgetUI();
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        localStorage.setItem('rangritico_audio_volume', this.volume.toString());
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
    }

    // Build or Bind Floating Atelier Audio Player Widget
    initUI() {
        if (document.querySelector('.atelier-audio-widget')) return;

        const widget = document.createElement('div');
        widget.className = 'atelier-audio-widget';
        widget.id = 'atelierAudioWidget';
        widget.innerHTML = `
            <div class="audio-widget-main">
                <button class="audio-play-btn" id="audioPlayToggle" aria-label="Toggle Atelier Soundscape" title="Play / Pause Himalayan Soundscape">
                    <svg class="play-icon" viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>
                    <svg class="pause-icon" viewBox="0 0 24 24" style="display:none;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                </button>

                <div class="audio-info-wrap">
                    <div class="audio-title-row">
                        <span class="audio-kicker">Atelier Ambiance</span>
                        <div class="audio-equalizer">
                            <span class="eq-bar"></span>
                            <span class="eq-bar"></span>
                            <span class="eq-bar"></span>
                            <span class="eq-bar"></span>
                        </div>
                    </div>
                    <span class="audio-state-text" id="audioStateText">Himalayan Dhyana (432Hz)</span>
                </div>

                <div class="audio-preset-selector">
                    <button class="audio-preset-btn ${this.currentPreset === 'dhyana' ? 'active' : ''}" data-preset="dhyana" title="Singing Bowls & Tanpura">Dhyana</button>
                    <button class="audio-preset-btn ${this.currentPreset === 'ganga' ? 'active' : ''}" data-preset="ganga" title="Ganges River & Bells">Ganga</button>
                    <button class="audio-preset-btn ${this.currentPreset === 'tanpura' ? 'active' : ''}" data-preset="tanpura" title="Pure Meditative Tanpura">Tanpura</button>
                </div>

                <div class="audio-vol-wrap">
                    <input type="range" class="audio-vol-slider" id="audioVolSlider" min="0" max="1" step="0.05" value="${this.volume}" aria-label="Audio Volume">
                </div>
            </div>
        `;

        document.body.appendChild(widget);

        // Bind Events
        const playBtn = widget.querySelector('#audioPlayToggle');
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        widget.querySelectorAll('.audio-preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const preset = btn.getAttribute('data-preset');
                this.setPreset(preset);
                if (!this.isPlaying) {
                    this.play();
                }
            });
        });

        const volSlider = widget.querySelector('#audioVolSlider');
        volSlider.addEventListener('input', (e) => {
            this.setVolume(parseFloat(e.target.value));
        });
    }

    updateWidgetUI() {
        const widget = document.getElementById('atelierAudioWidget');
        if (!widget) return;

        const playIcon = widget.querySelector('.play-icon');
        const pauseIcon = widget.querySelector('.pause-icon');
        const stateText = widget.querySelector('#audioStateText');

        if (this.isPlaying) {
            widget.classList.add('playing');
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = 'block';

            const presetNames = {
                'dhyana': 'Himalayan Dhyana (Singing Bowl)',
                'ganga': 'Ganga Ghats (River & Chimes)',
                'tanpura': 'Meditative Tanpura (108Hz)'
            };
            if (stateText) stateText.textContent = presetNames[this.currentPreset] || 'Ambiance Playing';
        } else {
            widget.classList.remove('playing');
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
            if (stateText) stateText.textContent = 'Ambiance Paused (Click Play)';
        }

        widget.querySelectorAll('.audio-preset-btn').forEach(btn => {
            if (btn.getAttribute('data-preset') === this.currentPreset) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

// Global instantiation of Atelier Audio Engine
let atelierAudio = null;
window.addEventListener('DOMContentLoaded', () => {
    atelierAudio = new AtelierAudioEngine();
    window.atelierAudio = atelierAudio;

    // Optional chime on station navigation or artwork zoom
    window.playAtelierChime = function(freq = 528) {
        if (atelierAudio) {
            atelierAudio.strikeSingingBowl(freq, 3.2, 0.3);
        }
    };
});

/* ==========================================================================
   ARTISAN BESPOKE COMMISSION STUDIO CONFIGURATOR
   Interactive medium selector, themes, sizing & direct WhatsApp link generator
   ========================================================================== */
window.initCommissionConfigurator = function() {
    const mediumCards = document.querySelectorAll('.medium-option-item');
    const themePills = document.querySelectorAll('.theme-pill-item');
    const sizeCards = document.querySelectorAll('.size-option-card');
    const summaryText = document.getElementById('commissionSummaryText');
    const timelineTag = document.getElementById('commissionTimelineTag');
    const whatsappBtn = document.getElementById('commissionWhatsappBtn');

    let currentMedium = "Dried Peepal Skeleton Leaf Miniature";
    let currentTheme = "Meditating Buddha (Dhyana Mudra)";
    let currentSize = "Small Shadowbox (8×10 in)";
    let currentDuration = "14 – 21 Days (Multi-week leaf vein curing & 000-fine bristle gouache)";

    const mediumTimeframes = {
        "leaf": {
            name: "Dried Peepal Skeleton Leaf Miniature",
            time: "14 – 21 Days (Multi-week leaf skeleton curing & 000-fine bristle gouache)"
        },
        "stone": {
            name: "Sacred Ganges River Quartz Pebble",
            time: "10 – 14 Days (River quartz priming, mineral pigments & archival varnish)"
        },
        "canvas": {
            name: "Spiritual Linen Canvas (Oil & 24K Gold Leaf)",
            time: "30 – 45 Days (Traditional gesso linen prep, layered pigments & gilding)"
        },
        "lippan": {
            name: "Pichwai & Lippan Mirror Art Roundel",
            time: "21 – 30 Days (Hand-sculpted mud relief, mirror cut mosaic & fine Pichwai)"
        },
        "terracotta": {
            name: "Hand-Molded Terracotta Jewelry Set",
            time: "12 – 18 Days (Clay sculpting, kiln baking, cowrie shell assembly)"
        },
        "furniture": {
            name: "Functional Hardwood Mandala Furniture",
            time: "35 – 50 Days (Hardwood seasoning, sacred geometry, glass-gloss resin)"
        }
    };

    function updateLiveSummary() {
        if (summaryText) {
            summaryText.textContent = `${currentMedium} • ${currentTheme}`;
        }
        if (timelineTag) {
            timelineTag.textContent = `⏱ Estimated Atelier Timeline: ${currentDuration}`;
        }
        if (whatsappBtn) {
            const rawMessage = `Namaste Prachi ji, I would like to commission a bespoke sacred artwork from the Rangritico Atelier:

🎨 Medium: ${currentMedium}
🕉️ Sacred Iconography: ${currentTheme}
📐 Dimensions / Framing: ${currentSize}
⏳ Estimated Creation Timeframe: ${currentDuration}

Could we please discuss consultation details, pricing, and curation?`;
            whatsappBtn.href = `https://wa.me/919762767258?text=${encodeURIComponent(rawMessage)}`;
        }
    }

    mediumCards.forEach(card => {
        card.addEventListener('click', () => {
            mediumCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            const key = card.getAttribute('data-medium-key');
            if (mediumTimeframes[key]) {
                currentMedium = mediumTimeframes[key].name;
                currentDuration = mediumTimeframes[key].time;
            }
            updateLiveSummary();
            if (window.playAtelierChime) window.playAtelierChime(432);
        });
    });

    themePills.forEach(pill => {
        pill.addEventListener('click', () => {
            themePills.forEach(p => p.classList.remove('selected'));
            pill.classList.add('selected');
            currentTheme = pill.textContent.trim();
            updateLiveSummary();
            if (window.playAtelierChime) window.playAtelierChime(528);
        });
    });

    sizeCards.forEach(card => {
        card.addEventListener('click', () => {
            sizeCards.forEach(s => s.classList.remove('selected'));
            card.classList.add('selected');
            const name = card.querySelector('.size-card-name')?.textContent || '';
            const dim = card.querySelector('.size-card-dim')?.textContent || '';
            currentSize = `${name} (${dim})`;
            updateLiveSummary();
            if (window.playAtelierChime) window.playAtelierChime(648);
        });
    });

    updateLiveSummary();
};

// Form submission for bespoke commission
window.handleCommissionSubmit = function(e) {
    if (e) e.preventDefault();
    const form = document.getElementById('commissionInquiryForm');
    const statusEl = document.getElementById('commissionFormStatus');
    const name = document.getElementById('commName')?.value || 'Collector';
    const email = document.getElementById('commEmail')?.value || '';

    if (statusEl) {
        statusEl.innerHTML = `
            <div style="background: rgba(212, 175, 55, 0.15); border: 1px solid #D4AF37; border-radius: 8px; padding: 1.25rem; text-align: center; margin-top: 1rem;">
                <h4 style="font-family: 'Cinzel Decorative', serif; color: #1A1A1A; margin-bottom: 0.5rem;">✨ Sacred Commission Inquiry Received</h4>
                <p style="font-size: 0.9rem; color: #333; line-height: 1.5;">Thank you, <strong>${name}</strong>. Prachi Mandal will review your vision notes and contact you at <strong>${email}</strong> within 24–48 hours with curatorial sketches and timeline specifics.</p>
            </div>
        `;
        statusEl.style.display = 'block';
    }

    if (window.playAtelierChime) window.playAtelierChime(864);
    if (form) form.reset();
    return false;
};

// Auto-run commission configurator if section exists on page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('commission-studio')) {
        window.initCommissionConfigurator();
    }
    window.initJewelersLoupe();
    window.initLightingModes();
    window.initRoomMockupStudio();
    window.initCertificateOfAuthenticity();
});

/* ==========================================================================
   1. ARTISAN JEWELER'S LOUPE (MICROSCOPIC INSPECTION LENS)
   ========================================================================== */
window.initJewelersLoupe = function() {
    // Only run on desktop devices with a precision mouse cursor; never on mobile touchscreens
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let loupe = document.querySelector('.jewelers-loupe');
    if (!loupe) {
        loupe = document.createElement('div');
        loupe.className = 'jewelers-loupe';
        loupe.innerHTML = `
            <div class="loupe-reticle"></div>
            <span class="loupe-zoom-badge">3.2× Micro-Veins</span>
        `;
        document.body.appendChild(loupe);
    }

    let activeImg = null;
    const zoomLevel = 3.2;

    function moveLoupe(e) {
        if (!activeImg) return;
        const rect = activeImg.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        if (!clientX || !clientY) return;

        // Check bounds
        if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
            loupe.style.display = 'none';
            return;
        }

        loupe.style.display = 'block';
        loupe.style.left = clientX + 'px';
        loupe.style.top = clientY + 'px';

        const xPos = ((clientX - rect.left) / rect.width) * 100;
        const yPos = ((clientY - rect.top) / rect.height) * 100;

        loupe.style.backgroundImage = `url('${activeImg.src}')`;
        loupe.style.backgroundSize = `${rect.width * zoomLevel}px ${rect.height * zoomLevel}px`;
        loupe.style.backgroundPosition = `${xPos}% ${yPos}%`;
    }

    function attachInspectable(img) {
        img.addEventListener('mouseenter', (e) => {
            activeImg = img;
            loupe.style.display = 'block';
            moveLoupe(e);
        });

        img.addEventListener('mousemove', moveLoupe);

        img.addEventListener('mouseleave', () => {
            if (activeImg === img) {
                loupe.style.display = 'none';
                activeImg = null;
            }
        });

        // Touch handling
        img.addEventListener('touchmove', (e) => {
            activeImg = img;
            moveLoupe(e);
        }, { passive: true });

        img.addEventListener('touchend', () => {
            loupe.style.display = 'none';
            activeImg = null;
        });
    }

    // Attach to gallery frames & modal presentation images
    document.querySelectorAll('.frame-interactive img, .double-glass-frame img, .pebble-oval-frame img, #presentation-image').forEach(attachInspectable);
};

/* ==========================================================================
   2. ATELIER ATMOSPHERIC LIGHTING SWITCHER (Dawn, Museum, Diya)
   ========================================================================== */
window.initLightingModes = function() {
    const savedTheme = localStorage.getItem('rangritico_lighting_theme') || 'dawn';
    document.documentElement.setAttribute('data-theme', savedTheme);

    function updateSwitcherButtons(current) {
        document.querySelectorAll('.light-mode-btn').forEach(btn => {
            if (btn.getAttribute('data-theme') === current) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    window.setLightingTheme = function(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('rangritico_lighting_theme', themeName);
        updateSwitcherButtons(themeName);

        if (themeName === 'diya' && window.atelierAudio) {
            window.atelierAudio.strikeSingingBowl(432, 4.0, 0.3);
        } else if (window.playAtelierChime) {
            window.playAtelierChime(528);
        }
    };

    document.querySelectorAll('.light-mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const target = btn.getAttribute('data-theme');
            window.setLightingTheme(target);
        });
    });

    updateSwitcherButtons(savedTheme);
};

/* ==========================================================================
   3. "VIEW ON YOUR WALL" (INTERIOR SCALE & ROOM MOCKUP STUDIO)
   ========================================================================== */
window.initRoomMockupStudio = function() {
    let modal = document.getElementById('room-mockup-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'room-mockup-modal';
        modal.className = 'room-mockup-modal';
        modal.innerHTML = `
            <div class="room-mockup-wrapper" onclick="event.stopPropagation()">
                <div class="room-mockup-header">
                    <h3 class="room-mockup-title">🏛️ View On Your Wall &bull; Scale Studio</h3>
                    <button class="modal-close-btn" onclick="window.closeRoomMockup()" aria-label="Close room studio">&times;</button>
                </div>

                <div class="room-mockup-stage" id="mockupWallStage">
                    <div class="mockup-artwork-wrap" id="mockupArtworkWrap">
                        <img src="" id="mockupArtworkImg" class="mockup-artwork-img" alt="Artwork Scale View">
                    </div>
                    <div class="mockup-floor"></div>
                    <div class="mockup-furniture" id="mockupFurniture">
                        <div class="furniture-sofa" id="furnitureProp"></div>
                    </div>
                </div>

                <div class="room-mockup-controls">
                    <div class="mockup-setting-group">
                        <span class="mockup-label">Interior:</span>
                        <button class="room-setting-btn active" data-furniture="sofa" onclick="setMockupRoom('sofa')">Living Room Sofa</button>
                        <button class="room-setting-btn" data-furniture="console" onclick="setMockupRoom('console')">Teakwood Console</button>
                    </div>

                    <div class="mockup-setting-group">
                        <span class="mockup-label">Wall Paint:</span>
                        <button class="wall-swatch-btn active" style="background:#F7F5F0;" title="Ivory Silk" onclick="setMockupWallColor('#F7F5F0')"></button>
                        <button class="wall-swatch-btn" style="background:#5A695B;" title="Himalayan Sage" onclick="setMockupWallColor('#5A695B')"></button>
                        <button class="wall-swatch-btn" style="background:#8C452D;" title="Terracotta Ochre" onclick="setMockupWallColor('#8C452D')"></button>
                        <button class="wall-swatch-btn" style="background:#1C2536;" title="Deep Temple Indigo" onclick="setMockupWallColor('#1C2536')"></button>
                        <button class="wall-swatch-btn" style="background:#282624;" title="Warm Charcoal" onclick="setMockupWallColor('#282624')"></button>
                    </div>

                    <div class="mockup-setting-group">
                        <span class="mockup-label" id="mockupDimLabel">Proportional Scale</span>
                        <a href="index.html#commission-studio" class="btn-print-coa" style="text-decoration:none; padding: 4px 12px; font-size:11px;">Commission This Size &rarr;</a>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) window.closeRoomMockup();
        });
    }

    window.openRoomMockup = function(imgSrc, title, dimensions) {
        const m = document.getElementById('room-mockup-modal');
        const img = document.getElementById('mockupArtworkImg');
        const dimLabel = document.getElementById('mockupDimLabel');
        const wrap = document.getElementById('mockupArtworkWrap');

        if (!m || !img) return;

        img.src = imgSrc;
        if (dimLabel) dimLabel.textContent = `Scale: ${dimensions || 'Bespoke Size'}`;

        // Compute proportional scale
        if (wrap) {
            const dims = (dimensions || '').toLowerCase();
            if (dims.includes('8') || dims.includes('leaf') || dims.includes('pebble')) {
                wrap.style.transform = 'translate(-50%, -50%) scale(0.65)';
            } else if (dims.includes('18') || dims.includes('16')) {
                wrap.style.transform = 'translate(-50%, -50%) scale(0.95)';
            } else if (dims.includes('36') || dims.includes('48') || dims.includes('60')) {
                wrap.style.transform = 'translate(-50%, -50%) scale(1.35)';
            } else {
                wrap.style.transform = 'translate(-50%, -50%) scale(1.0)';
            }
        }

        m.classList.add('open');
        document.body.style.overflow = 'hidden';
        if (window.playAtelierChime) window.playAtelierChime(528);
    };

    window.closeRoomMockup = function() {
        const m = document.getElementById('room-mockup-modal');
        if (m) {
            m.classList.remove('open');
            document.body.style.overflow = '';
        }
    };

    window.setMockupWallColor = function(color) {
        const stage = document.getElementById('mockupWallStage');
        if (stage) stage.style.backgroundColor = color;
        document.querySelectorAll('.wall-swatch-btn').forEach(b => {
            if (b.getAttribute('onclick').includes(color)) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
    };

    window.setMockupRoom = function(type) {
        const prop = document.getElementById('furnitureProp');
        if (!prop) return;
        if (type === 'console') {
            prop.className = 'furniture-console';
        } else {
            prop.className = 'furniture-sofa';
        }
        document.querySelectorAll('.room-setting-btn').forEach(b => {
            if (b.getAttribute('data-furniture') === type) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
    };
};

/* ==========================================================================
   4. ARCHIVAL CERTIFICATE OF AUTHENTICITY (COA) PROVENANCE CARD
   ========================================================================== */
window.initCertificateOfAuthenticity = function() {
    let modal = document.getElementById('coa-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'coa-modal';
        modal.className = 'coa-modal';
        modal.innerHTML = `
            <div class="coa-certificate-card" onclick="event.stopPropagation()">
                <button class="modal-close-btn" onclick="window.closeCoA()" aria-label="Close Certificate">&times;</button>
                <div class="coa-inner-border">
                    <div class="coa-header">
                        <h2 class="coa-brand-title">RANGRITICO</h2>
                        <span class="coa-subtitle">Curatorial Studio &bull; Rishikesh, Himalayas</span>
                    </div>

                    <p class="coa-body-text">
                        This document certifies that the accompanying creation is an authentic, original sacred artwork handcrafted by visual arts researcher and curator <strong>Prachi Mandal</strong> in the Himalayan atelier of Rishikesh, Uttarakhand.
                    </p>

                    <div class="coa-spec-grid">
                        <div class="coa-spec-item">
                            <strong>Artwork Accession Title:</strong>
                            <span id="coaTitle">Meditating Buddha (Dhyana Mudra)</span>
                        </div>
                        <div class="coa-spec-item">
                            <strong>Curatorial Medium:</strong>
                            <span id="coaMedium">Natural Mineral Pigments & 24K Gold Leaf</span>
                        </div>
                        <div class="coa-spec-item">
                            <strong>Accession ID & Year:</strong>
                            <span id="coaID">RG-2024-PL016 &bull; 2024</span>
                        </div>
                        <div class="coa-spec-item">
                            <strong>Sacred Botanical / Earth Origin:</strong>
                            <span id="coaOrigin">Ficus Religiosa, Riverbed Ganges Ghats</span>
                        </div>
                    </div>

                    <div class="coa-signature-row">
                        <div class="coa-seal-wrap">
                            <div class="coa-gold-seal">
                                <span>SEAL OF<br>AUTHENTICITY</span>
                            </div>
                        </div>

                        <div class="coa-sign-block">
                            <span class="coa-sign-img">Prachi Mandal</span>
                            <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: #555;">
                                Prachi Mandal (B.F.A., M.A. History of Arts)<br>UGC-NET Visual Arts Researcher & Curator
                            </span>
                        </div>
                    </div>

                    <div class="coa-actions">
                        <button class="btn-print-coa" onclick="window.print()">🖨️ Print / Save Provenance PDF</button>
                        <button class="btn-print-coa" style="background:#FFF; color:#1A1A1A;" onclick="window.closeCoA()">Close</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) window.closeCoA();
        });
    }

    window.openCoA = function(id, title, medium, origin) {
        const m = document.getElementById('coa-modal');
        if (!m) return;
        document.getElementById('coaID').textContent = id || 'RG-2024-ATELIER';
        document.getElementById('coaTitle').textContent = title || 'Sacred Creation';
        document.getElementById('coaMedium').textContent = medium || 'Organic Sourced Medium';
        if (origin) document.getElementById('coaOrigin').textContent = origin;

        m.classList.add('open');
        document.body.style.overflow = 'hidden';
        if (window.playAtelierChime) window.playAtelierChime(648);
    };

    window.closeCoA = function() {
        const m = document.getElementById('coa-modal');
        if (m) {
            m.classList.remove('open');
            document.body.style.overflow = '';
        }
    };
};

/* Bridge functions for presentation modal */
window.openCurrentInRoomMockup = function() {
    const img = document.getElementById('presentation-image');
    const cap = document.getElementById('presentation-caption');
    if (img && img.src) {
        const title = cap ? cap.textContent.split('—')[0].trim() : 'Masterpiece';
        window.openRoomMockup(img.src, title, '30 × 40 in');
    }
};

window.openCurrentInCoA = function() {
    const cap = document.getElementById('presentation-caption');
    const fullText = cap ? cap.textContent : 'Masterpiece';
    const parts = fullText.split('—');
    const title = parts[0] ? parts[0].trim() : 'Sacred Masterpiece';
    const medium = parts[1] ? parts[1].trim() : 'Fine Art / Organic Himalayan Media';
    window.openCoA('RG-2025-ARCHIVE', title, medium, 'Rishikesh Himalayan Studio, Ganga Riverbank');
};


