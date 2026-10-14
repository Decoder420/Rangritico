# 🌿 RANGRITICO — Sacred Himalayan Art & Aesthetics Atelier

[![Etsy Star Seller](https://img.shields.io/badge/Etsy-Star%20Seller-orange?style=for-the-badge&logo=etsy)](https://www.etsy.com/shop/Rangritico)
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=google-chrome)](https://www.etsy.com/shop/Rangritico)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> An immersive, museum-grade web experience celebrating the sacred handcrafts, skeleton leaf miniatures, and river-stone artworks of **Prachi Mandal** — B.F.A., M.A. History of Arts, UGC-NET Recognized Visual Arts Researcher & Former Museum Curator based in **Rishikesh, Himalayas, India**.

---

## ✨ Overview

**RANGRITICO** bridges centuries of traditional Indian art history with modern digital aesthetics. Each piece is crafted using naturally shed peepal skeleton leaves, river-smoothed Ganga stones, and kiln-baked Himalayan terracotta, painted with single-hair microscopic brushes and archival mineral pigments.

This web showcase is designed as an interactive virtual gallery and curatorial portfolio, featuring tactile museum framing, horizontal scrolling exhibition tracks, and bespoke artisan cursor interactions.

---

## 🎨 Key Features & Aesthetic Experience

- **🖌️ Artisan Paintbrush Cursor & Splash Feedback**:
  - Custom SVG artist brush cursor dynamically reacts over interactive frames and links.
  - Interactive golden mineral paint dab micro-effects on click.

- **🏛️ Museum-Grade Exhibition Framing**:
  - **Guilded Royal Frames**: Rich multi-layer gold bevels with specular lighting.
  - **Double-Glass Floating Frames**: Transparent glass effect highlighting delicate skeleton leaf venation.
  - **Filigree & Shadowbox Pedestals**: Curated exhibit displays with museum accession plaques.

- **📜 Section 2: Etsy Star Seller Spotlight & Workbench**:
  - Verified Star Seller credential badge, customer review metrics, and trust pillars.
  - Interactive **Sacred Craft Mediums Bar** showcasing mineral palettes, detail brushes, terracotta jars, and preserved Bodhi leaves.
  - Animated ambient elements: fluttering monarch butterfly, drifting lotus petals, and rotating golden mandalas.

- **🍃 Section 3: The Skeleton Leaf Philosophy**:
  - Educational deep-dive into the sacred lacy venation of Peepal leaves.
  - Interactive before/after leaf skeletonization showcase.

- **🎧 Himalayan Audio Ambiance Engine (Web Audio API)**:
  - Zero-dependency procedural synthesizer delivering 432Hz & 528Hz Tibetan singing bowl resonance with exponential decay.
  - Flowing Ganga River stream simulation using bandpass-filtered pink noise with breath LFO modulation.
  - Meditative four-string Tanpura drone (Pa-Sa intervals at 108Hz, 144Hz, 216Hz, 288Hz).
  - Floating brass-trimmed widget (`#atelierAudioWidget`) with play/pause, gold equalizer bars, preset selector, and volume slider.

- **⛓️ Fluid GSAP Dual-Chain Pendulum Inertia Gallery**:
  - Pinned horizontal scrolling exhibition with authentic ceiling-anchor rotation (`transform-origin: 50% -120px`).
  - Dynamic scroll-velocity angular sway (-8.5° to +8.5°) and heavy museum glass elastic settlement.
  - Interactive pointer drag-and-release with tactile spring recoil and harmonic singing bowl chime.
  - Real-time halogen spotlight beam tracking cursor coordinates across canvases.
  - Mobile touch horizontal swipe gesture detection.

- **🎨 Section 6: Artisan Bespoke Commission Studio**:
  - Multi-step interactive configurator for sacred mediums (Peepal leaf, Ganga river quartz, gilded linen, Lippan mirror roundels, terracotta jewelry, hardwood mandala tables).
  - Sacred iconography selection and sizing/framing specifications.
  - Live dynamic creation timeline and materials calculator.
  - Direct pre-filled WhatsApp consultation link (`https://wa.me/918979803131`) and consultation inquiry form.

- **🏛️ The Curatorial Vault & Archive (45 Authentic Artworks)**:
  - Permanent digital catalog showcasing all 45 authentic artworks mapped from `prachi-mandal-portfolio-001` through `045`.
  - Instant category filter tabs: *All Artworks*, *Peepal Leaf Miniatures*, *Pichwai & Lippan Art*, *Spiritual Canvases*, *Ganges River Stones*, *Mandalas & Hardwood*, *Terracotta Adornments*, and *Pedagogy & Studies*.
  - High-resolution zoom Lightbox modal with curatorial accession metadata.

- **🗄️ Preserved Original Design Backup**:
  - Complete, untouched archive in `backup_original_design/` for one-click rollback at any time (`cp backup_original_design/* .`).

## 🛠️ Technology Stack

- **Markup & Semantics**: HTML5 with rich accessibility attributes (`aria-*`, schema meta)
- **Styling**: Vanilla CSS3 (Custom Design System, CSS Variables, Glassmorphism, 3D Transforms, Custom Keyframes)
- **Animation Engine**: [GSAP (GreenSock)](https://greensock.com/) & ScrollTrigger plugin
- **Typography**: *Playfair Display*, *Cinzel*, *Great Vibes*, *Outfit*, and *Inter* via Google Fonts
- **Assets**: Transparent vector SVG icons and high-definition photography of authentic handcrafts

---

## 📂 Project Structure

```text
Rangritico/
├── index.html              # Main interactive atelier experience
├── about.html              # Artist biography, pedagogy & curator statement
├── portfolio.html          # Extended curatorial archive & gallery
├── styles.css              # Unified design system & responsive styling
├── script.js               # Interactive gallery modal & cursor physics
├── gsap-animations.js      # ScrollTrigger animations & timeline reveals
├── assets/                 # High-resolution artwork images, icons & elements
│   ├── elements/           # Transparent art pack elements (brushes, palette, butterfly, petals)
│   └── ...
├── backup_original_design/ # Untouched backup archive of original site version
├── RESUME_PRACHI_MANDAL.pdf # Academic & curatorial credentials
└── README.md               # Project documentation
```

---

## 🚀 Getting Started Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Decoder420/Rangritico.git
   cd Rangritico
   ```

2. **Serve locally**:
   You can serve the static files with any local HTTP server, for example with Python 3:
   ```bash
   python3 -m http.server 8000
   ```

3. **Open in browser**:
   Navigate to [http://localhost:8000](http://localhost:8000) to explore the atelier.

---

## 🛍️ Official Shop & Inquiries

* **Etsy Atelier**: [etsy.com/shop/Rangritico](https://www.etsy.com/shop/Rangritico)
* **Custom Commissions & Inquiries**: Available for worldwide insured shipping via Etsy.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Artwork designs and photography &copy; Prachi Mandal / Rangritico. All rights reserved.
