/**
 * InfiniteImageField — Vanilla Canvas 2D Drifting Physics Engine
 * Curated for RANGRITICO Sacred Himalayan Art Atelier
 * Implements smooth cursor-driven camera physics, infinite cyclic grid wrapping,
 * rounded-corner clipping with gold gilded glassmorphic borders, and tile click handling.
 */

(function (global) {
  function drawRoundedRect(ctx, x, y, w, h, r) {
    const clampedR = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + clampedR, y);
    ctx.lineTo(x + w - clampedR, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + clampedR);
    ctx.lineTo(x + w, y + h - clampedR);
    ctx.quadraticCurveTo(x + w, y + h, x + w - clampedR, y + h);
    ctx.lineTo(x + clampedR, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - clampedR);
    ctx.lineTo(x, y + clampedR);
    ctx.quadraticCurveTo(x, y, x + clampedR, y);
    ctx.closePath();
  }

  function drawCoverImage(ctx, img, x, y, w, h) {
    if (!img || !img.naturalWidth) return;
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const sw = w / scale;
    const sh = h / scale;
    const sx = (img.naturalWidth - sw) / 2;
    const sy = (img.naturalHeight - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  class InfiniteImageField {
    constructor(container, options = {}) {
      this.container = typeof container === "string" ? document.querySelector(container) : container;
      if (!this.container) {
        throw new Error("InfiniteImageField: Invalid container element");
      }

      this.options = Object.assign(
        {
          items: global.RANGRITICO_ARTWORKS || [],
          imageWidth: 230,
          imageHeight: 310,
          gap: 32,
          maxSpeed: 6.5,
          smoothing: 0.075,
          borderRadius: 14,
          theme: "dark",
          onItemClick: null,
        },
        options
      );

      this.items = this.options.items.length > 0 ? this.options.items : [];
      this.imageWidth = this.options.imageWidth;
      this.imageHeight = this.options.imageHeight;
      this.gap = this.options.gap;
      this.maxSpeed = this.options.maxSpeed;
      this.smoothing = this.options.smoothing;
      this.borderRadius = this.options.borderRadius;
      this.theme = this.options.theme;

      this.dims = { w: 0, h: 0 };
      this.cam = { x: 0, y: 0 };
      this.vel = { x: 0, y: 0 };
      this.mouse = { x: 0.5, y: 0.5 };
      this.isInside = false;
      this.raf = 0;
      this.disposed = false;

      this.initDOM();
      this.preloadImages();
      this.initEvents();
    }

    initDOM() {
      this.container.classList.add("infinite-image-field-root");
      this.container.style.position = "relative";
      this.container.style.overflow = "hidden";
      this.container.style.userSelect = "none";
      this.container.style.cursor = "crosshair";

      this.canvas = document.createElement("canvas");
      this.canvas.className = "infinite-image-field-canvas";
      this.canvas.style.display = "block";
      this.canvas.style.width = "100%";
      this.canvas.style.height = "100%";
      this.canvas.style.background = "transparent";

      this.container.appendChild(this.canvas);
      this.ctx = this.canvas.getContext("2d");
    }

    preloadImages() {
      this.loadedImages = this.items.map((item) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = typeof item === "string" ? item : item.image;
        return img;
      });
    }

    draw = () => {
      if (this.disposed) return;
      const ctx = this.ctx;
      const { w: W, h: H } = this.dims;

      if (W === 0 || H === 0) {
        this.raf = requestAnimationFrame(this.draw);
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cellW = this.imageWidth + this.gap;
      const cellH = this.imageHeight + this.gap;
      const imgs = this.loadedImages;
      const numImages = Math.max(1, imgs.length);

      // Cursor offset from center drives physics
      const tx = this.isInside ? (this.mouse.x - 0.5) * 2 * this.maxSpeed : 0;
      const ty = this.isInside ? (this.mouse.y - 0.5) * 2 * this.maxSpeed : 0;

      this.vel.x += (tx - this.vel.x) * this.smoothing;
      this.vel.y += (ty - this.vel.y) * this.smoothing;

      this.cam.x += this.vel.x;
      this.cam.y += this.vel.y;

      const camX = this.cam.x;
      const camY = this.cam.y;

      ctx.clearRect(0, 0, W, H);

      const colMin = Math.floor((camX - W / 2) / cellW) - 1;
      const colMax = Math.ceil((camX + W / 2) / cellW) + 1;
      const rowMin = Math.floor((camY - H / 2) / cellH) - 1;
      const rowMax = Math.ceil((camY + H / 2) / cellH) + 1;

      const isLight = this.theme === "light";

      for (let row = rowMin; row <= rowMax; row++) {
        for (let col = colMin; col <= colMax; col++) {
          const sx = col * cellW - camX + W / 2 - this.imageWidth / 2;
          const sy = row * cellH - camY + H / 2 - this.imageHeight / 2;

          const imgIdx = Math.abs(col * 7 + row * 13 + ((col * row * 3) | 0)) % numImages;
          const img = imgs[imgIdx];
          const item = this.items[imgIdx] || {};

          // Card shadow
          ctx.save();
          drawRoundedRect(ctx, sx, sy, this.imageWidth, this.imageHeight, this.borderRadius);
          ctx.fillStyle = isLight ? "rgba(42, 35, 24, 0.08)" : "rgba(0, 0, 0, 0.45)";
          ctx.shadowColor = isLight ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.6)";
          ctx.shadowBlur = 18;
          ctx.shadowOffsetY = 10;
          ctx.fill();
          ctx.restore();

          // Artwork clipped inside rounded rectangle
          ctx.save();
          drawRoundedRect(ctx, sx, sy, this.imageWidth, this.imageHeight, this.borderRadius);
          ctx.clip();

          if (img && img.complete && img.naturalWidth > 0) {
            drawCoverImage(ctx, img, sx, sy, this.imageWidth, this.imageHeight);
          } else {
            ctx.fillStyle = isLight ? "rgba(230,225,215,0.8)" : "rgba(20,18,16,0.85)";
            ctx.fillRect(sx, sy, this.imageWidth, this.imageHeight);
          }

          // Bottom gradient scrim for title readability
          const gradient = ctx.createLinearGradient(sx, sy + this.imageHeight - 75, sx, sy + this.imageHeight);
          gradient.addColorStop(0, "rgba(0,0,0,0)");
          gradient.addColorStop(1, "rgba(0,0,0,0.85)");
          ctx.fillStyle = gradient;
          ctx.fillRect(sx, sy + this.imageHeight - 75, this.imageWidth, 75);

          // Card typography overlay
          const title = (item.title || "Sacred Himalayan").toUpperCase();
          const truncated = title.length > 21 ? title.slice(0, 20) + "…" : title;
          ctx.font = "600 11px 'Outfit', sans-serif";
          ctx.fillStyle = "#F7E7B4";
          ctx.fillText(truncated, sx + 14, sy + this.imageHeight - 26);

          const meta = (item.meta || "Original Atelier Artwork").toUpperCase();
          ctx.font = "400 9px monospace";
          ctx.fillStyle = "#D4AF37";
          ctx.fillText(meta.length > 24 ? meta.slice(0, 23) + "…" : meta, sx + 14, sy + this.imageHeight - 12);

          ctx.restore();

          // Gilded glass border overlay
          ctx.save();
          drawRoundedRect(ctx, sx, sy, this.imageWidth, this.imageHeight, this.borderRadius);
          ctx.strokeStyle = isLight ? "rgba(170,130,10,0.35)" : "rgba(212,175,55,0.4)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
        }
      }

      this.raf = requestAnimationFrame(this.draw);
    };

    initEvents() {
      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = this.canvas.getBoundingClientRect();
        this.dims = { w: rect.width, h: rect.height };
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
      };

      resize();
      this.resizeObserver = new ResizeObserver(resize);
      this.resizeObserver.observe(this.canvas);

      const onMove = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse = {
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        };
      };

      const onEnter = () => {
        this.isInside = true;
      };
      const onLeave = () => {
        this.isInside = false;
      };

      // Click detection to open lightbox
      let clickStartPos = { x: 0, y: 0 };
      this.container.addEventListener("pointerdown", (e) => {
        clickStartPos = { x: e.clientX, y: e.clientY };
      });

      this.container.addEventListener("pointerup", (e) => {
        const dist = Math.hypot(e.clientX - clickStartPos.x, e.clientY - clickStartPos.y);
        if (dist < 8 && this.options.onItemClick) {
          const clicked = this.getTileAtScreenPoint(e.clientX, e.clientY);
          if (clicked) {
            this.options.onItemClick(clicked.item, clicked.index);
          }
        }
      });

      this.container.addEventListener("mousemove", onMove);
      this.container.addEventListener("mouseenter", onEnter);
      this.container.addEventListener("mouseleave", onLeave);

      // Touch drag support for mobile
      let touchLast = { x: 0, y: 0 };
      this.container.addEventListener("touchstart", (e) => {
        if (e.touches.length > 0) {
          touchLast = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
      }, { passive: true });

      this.container.addEventListener("touchmove", (e) => {
        if (e.touches.length > 0) {
          const dx = e.touches[0].clientX - touchLast.x;
          const dy = e.touches[0].clientY - touchLast.y;
          touchLast = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          this.cam.x -= dx * 1.5;
          this.cam.y -= dy * 1.5;
        }
      }, { passive: true });

      this.raf = requestAnimationFrame(this.draw);
    }

    getTileAtScreenPoint(clientX, clientY) {
      const rect = this.canvas.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      const { w: W, h: H } = this.dims;

      const cellW = this.imageWidth + this.gap;
      const cellH = this.imageHeight + this.gap;
      const camX = this.cam.x;
      const camY = this.cam.y;

      const colMin = Math.floor((camX - W / 2) / cellW) - 1;
      const colMax = Math.ceil((camX + W / 2) / cellW) + 1;
      const rowMin = Math.floor((camY - H / 2) / cellH) - 1;
      const rowMax = Math.ceil((camY + H / 2) / cellH) + 1;

      for (let row = rowMin; row <= rowMax; row++) {
        for (let col = colMin; col <= colMax; col++) {
          const sx = col * cellW - camX + W / 2 - this.imageWidth / 2;
          const sy = row * cellH - camY + H / 2 - this.imageHeight / 2;
          if (px >= sx && px <= sx + this.imageWidth && py >= sy && py <= sy + this.imageHeight) {
            const imgIdx = Math.abs(col * 7 + row * 13 + ((col * row * 3) | 0)) % this.items.length;
            return {
              item: this.items[imgIdx],
              index: imgIdx,
            };
          }
        }
      }
      return null;
    }

    setMaxSpeed(val) {
      this.maxSpeed = Math.max(1, Math.min(20, Number(val)));
    }

    setTheme(theme) {
      this.theme = theme;
    }

    destroy() {
      this.disposed = true;
      cancelAnimationFrame(this.raf);
      if (this.resizeObserver) this.resizeObserver.disconnect();
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  }

  global.InfiniteImageField = InfiniteImageField;
})(window);
