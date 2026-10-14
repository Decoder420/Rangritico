/**
 * FisheyeInfiniteGrid — Vanilla WebGL Engine
 * Curated for RANGRITICO Sacred Himalayan Art Atelier
 * Implements real-time spherical lens curvature / fisheye shader warping,
 * texture atlas generation, pointer inertia momentum, wheel impulse,
 * keyboard navigation, and raycasted tile click detection.
 */

(function (global) {
  const VERTEX_SHADER = `
    attribute vec2 a_position;
    varying vec2 v_uv;

    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const FRAGMENT_SHADER = `
    precision highp float;

    uniform sampler2D u_texture;
    uniform vec2 u_resolution;
    uniform vec2 u_atlas_size;
    uniform vec2 u_offset;
    uniform float u_curvature;
    varying vec2 v_uv;

    void main() {
      vec2 centered = v_uv * 2.0 - 1.0;
      float aspect = u_resolution.x / max(u_resolution.y, 1.0);
      vec2 lens = vec2(centered.x * aspect, centered.y);
      float radius = dot(lens, lens) / (aspect * aspect + 1.0);
      float curve = u_curvature * (0.34 * radius + 0.12 * radius * radius);
      vec2 warped = lens / (1.0 + curve);
      vec2 warped_uv = vec2(warped.x / aspect, warped.y) * 0.5 + 0.5;
      vec2 world = vec2(
        warped_uv.x * u_resolution.x - u_offset.x,
        (1.0 - warped_uv.y) * u_resolution.y - u_offset.y
      );
      vec2 atlas_uv = fract(world / u_atlas_size);
      vec4 color = texture2D(u_texture, vec2(atlas_uv.x, 1.0 - atlas_uv.y));
      float edgeShade = clamp(radius * u_curvature * 0.14, 0.0, 0.32);
      color.rgb *= 1.0 - edgeShade;
      gl_FragColor = color;
    }
  `;

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createProgram(gl, vsSource, fsSource) {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return null;

    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    return program;
  }

  function drawCoverImage(ctx, img, x, y, w, h) {
    if (!img || !img.naturalWidth || !img.naturalHeight) return;
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const sw = w / scale;
    const sh = h / scale;
    const sx = (img.naturalWidth - sw) / 2;
    const sy = (img.naturalHeight - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  class FisheyeInfiniteGrid {
    constructor(container, options = {}) {
      this.container = typeof container === "string" ? document.querySelector(container) : container;
      if (!this.container) {
        throw new Error("FisheyeInfiniteGrid: Invalid container element");
      }

      this.options = Object.assign(
        {
          items: global.RANGRITICO_ARTWORKS || [],
          tileWidth: 260,
          tileHeight: 310,
          gap: 0,
          lensStrength: 0.38,
          theme: "dark", // 'dark' | 'light'
          hoverNudge: 16,
          inertia: 0.94,
          wheelSensitivity: 0.45,
          onItemClick: null,
        },
        options
      );

      this.items = this.options.items.length > 0 ? this.options.items : [];
      this.lensStrength = this.options.lensStrength;
      this.theme = this.options.theme;
      this.inertia = this.options.inertia;

      this.pos = { x: 0, y: 0 };
      this.vel = { x: 0, y: 0 };
      this.drag = { active: false, pointerId: -1, x: 0, y: 0, startX: 0, startY: 0, time: 0, moved: false };
      this.nudge = null;
      this.reducedMotion = false;
      this.disposed = false;
      this.animationFrame = 0;
      this.prevFrame = performance.now();
      this.viewWidth = 1;
      this.viewHeight = 1;

      this.initDOM();
      this.initWebGL();
      this.initAtlas();
      this.initEvents();
      this.requestRender();
    }

    initDOM() {
      this.container.classList.add("fisheye-grid-root");
      this.container.style.position = "relative";
      this.container.style.overflow = "hidden";
      this.container.style.userSelect = "none";
      this.container.style.touchAction = "none";
      this.container.style.cursor = "grab";

      this.canvas = document.createElement("canvas");
      this.canvas.className = "fisheye-grid-canvas";
      this.canvas.style.display = "block";
      this.canvas.style.width = "100%";
      this.canvas.style.height = "100%";
      this.canvas.style.pointerEvents = "none";

      this.container.appendChild(this.canvas);
    }

    initWebGL() {
      const gl = this.canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        depth: false,
        powerPreference: "high-performance",
      });
      if (!gl) {
        console.warn("WebGL not supported, falling back");
        return;
      }
      this.gl = gl;

      this.program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
      if (!this.program) return;

      this.posBuffer = gl.createBuffer();
      this.texture = gl.createTexture();

      gl.useProgram(this.program);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW
      );

      const aPos = gl.getAttribLocation(this.program, "a_position");
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      this.locs = {
        resolution: gl.getUniformLocation(this.program, "u_resolution"),
        atlasSize: gl.getUniformLocation(this.program, "u_atlas_size"),
        offset: gl.getUniformLocation(this.program, "u_offset"),
        curvature: gl.getUniformLocation(this.program, "u_curvature"),
        texture: gl.getUniformLocation(this.program, "u_texture"),
      };
    }

    initAtlas() {
      this.safeTileWidth = Math.max(160, this.options.tileWidth);
      this.safeTileHeight = Math.max(180, this.options.tileHeight);
      this.safeGap = Math.max(0, this.options.gap);
      this.cellWidth = this.safeTileWidth + this.safeGap;
      this.cellHeight = this.safeTileHeight + this.safeGap;

      const count = Math.max(1, this.items.length);
      // Grid dimensions for texture atlas (up to 6 columns)
      this.atlasColumns = Math.max(2, Math.min(6, Math.ceil(Math.sqrt(count * 1.4))));
      this.atlasRows = Math.max(2, Math.ceil(count / this.atlasColumns));

      this.atlasCanvas = document.createElement("canvas");
      this.atlasCanvas.width = Math.ceil(this.atlasColumns * this.cellWidth);
      this.atlasCanvas.height = Math.ceil(this.atlasRows * this.cellHeight);
      this.atlasCtx = this.atlasCanvas.getContext("2d");

      this.loadedImages = new Array(count).fill(null);

      // Pre-load images
      this.items.forEach((item, idx) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          if (this.disposed) return;
          this.loadedImages[idx] = img;
          this.drawAtlas();
          this.requestRender();
        };
        img.onerror = () => {
          if (this.disposed) return;
          this.drawAtlas();
          this.requestRender();
        };
        img.src = item.image;
      });

      this.drawAtlas();
    }

    uploadAtlas() {
      if (!this.gl || !this.texture) return;
      const gl = this.gl;
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.atlasCanvas);
    }

    drawAtlas() {
      const ctx = this.atlasCtx;
      if (!ctx) return;
      const isLight = this.theme === "light";

      // Background canvas fill
      ctx.fillStyle = isLight ? "#f4f1ea" : "#080706";
      ctx.fillRect(0, 0, this.atlasCanvas.width, this.atlasCanvas.height);
      ctx.textBaseline = "middle";

      const totalTiles = this.atlasColumns * this.atlasRows;

      for (let i = 0; i < totalTiles; i++) {
        const item = this.items[i % this.items.length];
        const img = this.loadedImages[i % this.items.length];
        const col = i % this.atlasColumns;
        const row = Math.floor(i / this.atlasColumns);
        const x = col * this.cellWidth;
        const y = row * this.cellHeight;

        const inset = Math.max(10, Math.round(this.safeTileWidth * 0.06));
        const footerHeight = Math.max(38, Math.round(this.safeTileHeight * 0.16));
        const imgW = this.safeTileWidth - inset * 2;
        const imgH = this.safeTileHeight - inset * 2 - footerHeight;

        // Tile base card
        ctx.fillStyle = isLight ? "#FAF8F5" : "#11100f";
        ctx.fillRect(x, y, this.safeTileWidth, this.safeTileHeight);

        // Tile exterior border (gold gilded touch)
        ctx.strokeStyle = isLight ? "rgba(170,130,10,0.22)" : "rgba(212,175,55,0.25)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, this.safeTileWidth - 1, this.safeTileHeight - 1);

        // Image container background placeholder
        ctx.fillStyle = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.03)";
        ctx.fillRect(x + inset, y + inset, imgW, imgH);

        // Draw image cover
        if (img && img.complete && img.naturalWidth > 0) {
          drawCoverImage(ctx, img, x + inset, y + inset, imgW, imgH);
          // Very subtle lighting tint
          ctx.fillStyle = isLight ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.15)";
          ctx.fillRect(x + inset, y + inset, imgW, imgH);
        } else {
          // Loading indicator placeholder
          ctx.fillStyle = isLight ? "rgba(0,0,0,0.15)" : "rgba(212,175,55,0.2)";
          ctx.font = "11px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("Loading...", x + inset + imgW / 2, y + inset + imgH / 2);
          ctx.textAlign = "left";
        }

        // Image inner gilded bevel line
        ctx.strokeStyle = isLight ? "rgba(0,0,0,0.08)" : "rgba(212,175,55,0.4)";
        ctx.strokeRect(x + inset + 0.5, y + inset + 0.5, imgW - 1, imgH - 1);

        // Curatorial Plaque (Title & Meta)
        const labelY = y + this.safeTileHeight - inset - footerHeight / 2 + 3;
        const fontSize = Math.max(9, Math.round(this.safeTileWidth * 0.042));
        ctx.font = `600 ${fontSize}px "Outfit", "Playfair Display", Georgia, serif`;
        ctx.fillStyle = isLight ? "#1A1A1A" : "#F7E7B4";

        const titleText = (item.title || "Untitled Artwork").toUpperCase();
        const truncatedTitle = titleText.length > 20 ? titleText.slice(0, 19) + "…" : titleText;
        ctx.fillText(truncatedTitle, x + inset, labelY - 7);

        // Meta / medium pill
        ctx.font = `400 ${Math.max(8, fontSize - 2)}px ui-monospace, SFMono-Regular, monospace`;
        ctx.fillStyle = isLight ? "#8C6D1F" : "#D4AF37";
        const metaText = (item.meta || item.medium || "Sacred Himalayan").toUpperCase();
        const truncatedMeta = metaText.length > 26 ? metaText.slice(0, 25) + "…" : metaText;
        ctx.fillText(truncatedMeta, x + inset, labelY + 9);
      }

      this.uploadAtlas();
    }

    renderGrid(time) {
      if (!this.gl || !this.program) return false;
      const gl = this.gl;

      const nudge = this.currentNudge(time);
      gl.useProgram(this.program);
      gl.uniform2f(this.locs.resolution, this.viewWidth, this.viewHeight);
      gl.uniform2f(this.locs.atlasSize, this.atlasCanvas.width, this.atlasCanvas.height);
      gl.uniform2f(this.locs.offset, this.pos.x + nudge.x, this.pos.y + nudge.y);
      gl.uniform1f(this.locs.curvature, clamp(this.lensStrength, 0, 2.5));

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.uniform1i(this.locs.texture, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      return nudge.active;
    }

    currentNudge(time) {
      if (!this.nudge) return { x: 0, y: 0, active: false };
      const elapsed = Math.max(0, time - this.nudge.startedAt);
      const progress = clamp(elapsed / 520, 0, 1);
      const settled = 1 - Math.pow(1 - progress, 3);
      const breathing = 1 + Math.sin(elapsed * 0.0042) * 0.07;
      const amount = settled * breathing;
      return {
        x: this.nudge.x * amount,
        y: this.nudge.y * amount,
        active: true,
      };
    }

    commitNudge(time) {
      const nudge = this.currentNudge(time);
      if (!this.nudge && !nudge.active) return;
      this.pos.x += nudge.x;
      this.pos.y += nudge.y;
      this.nudge = null;
    }

    tick = (time) => {
      if (this.disposed) return;
      const delta = Math.min(32, time - this.prevFrame);
      this.prevFrame = time;

      if (!this.drag.active && !this.reducedMotion) {
        this.pos.x += this.vel.x * delta;
        this.pos.y += this.vel.y * delta;
        const decay = Math.pow(clamp(this.inertia, 0, 0.98), delta / 16.667);
        this.vel.x *= decay;
        this.vel.y *= decay;
      } else if (!this.drag.active) {
        this.vel.x = 0;
        this.vel.y = 0;
      }

      const nudgeActive = this.renderGrid(time);
      const hasVelocity = Math.hypot(this.vel.x, this.vel.y) > 0.006;

      if (this.drag.active || hasVelocity || nudgeActive) {
        this.animationFrame = requestAnimationFrame(this.tick);
      } else {
        this.vel.x = 0;
        this.vel.y = 0;
        this.animationFrame = 0;
      }
    };

    requestRender() {
      if (this.animationFrame) return;
      this.prevFrame = performance.now();
      this.animationFrame = requestAnimationFrame(this.tick);
    }

    resize = () => {
      const rect = this.container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.viewWidth = Math.max(1, rect.width);
      this.viewHeight = Math.max(1, rect.height);
      this.canvas.width = Math.max(1, Math.round(this.viewWidth * dpr));
      this.canvas.height = Math.max(1, Math.round(this.viewHeight * dpr));
      if (this.gl) {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      }
      this.requestRender();
    };

    initEvents() {
      this.resizeObserver = new ResizeObserver(this.resize);
      this.resizeObserver.observe(this.container);
      this.resize();

      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      this.reducedMotion = motionQuery.matches;
      motionQuery.addEventListener("change", (e) => {
        this.reducedMotion = e.matches;
      });

      this.container.addEventListener("pointerenter", (e) => {
        if (e.pointerType !== "mouse" || e.buttons !== 0 || this.reducedMotion || this.drag.active) return;
        const rect = this.container.getBoundingClientRect();
        const fromLeft = e.clientX < rect.left + rect.width / 2;
        const fromTop = e.clientY < rect.top + rect.height / 2;
        this.nudge = {
          startedAt: performance.now(),
          x: (fromLeft ? 1 : -1) * this.options.hoverNudge,
          y: (fromTop ? 1 : -1) * this.options.hoverNudge * 0.42,
        };
        this.requestRender();
      });

      this.container.addEventListener("pointerleave", () => {
        if (this.drag.active) return;
        this.commitNudge(performance.now());
      });

      this.container.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        this.commitNudge(performance.now());
        this.drag = {
          active: true,
          pointerId: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          startX: e.clientX,
          startY: e.clientY,
          time: performance.now(),
          moved: false,
        };
        this.vel = { x: 0, y: 0 };
        this.container.style.cursor = "grabbing";
        this.container.setPointerCapture(e.pointerId);
        this.requestRender();
      });

      this.container.addEventListener("pointermove", (e) => {
        if (!this.drag.active || this.drag.pointerId !== e.pointerId) return;
        const time = performance.now();
        const dt = Math.max(8, time - this.drag.time);
        const dx = e.clientX - this.drag.x;
        const dy = e.clientY - this.drag.y;

        if (Math.hypot(e.clientX - this.drag.startX, e.clientY - this.drag.startY) > 6) {
          this.drag.moved = true;
        }

        this.pos.x += dx;
        this.pos.y += dy;
        this.vel.x = clamp(dx / dt, -2.5, 2.5);
        this.vel.y = clamp(dy / dt, -2.5, 2.5);

        this.drag.x = e.clientX;
        this.drag.y = e.clientY;
        this.drag.time = time;
        this.requestRender();
      });

      const onPointerEnd = (e) => {
        if (!this.drag.active || this.drag.pointerId !== e.pointerId) return;
        const wasClick = !this.drag.moved;
        this.drag.active = false;
        this.container.style.cursor = "grab";
        try {
          this.container.releasePointerCapture(e.pointerId);
        } catch (_) {}

        if (wasClick && this.options.onItemClick) {
          const item = this.getTileAtScreenPoint(e.clientX, e.clientY);
          if (item) {
            this.options.onItemClick(item.item, item.index);
          }
        }
        this.requestRender();
      };

      this.container.addEventListener("pointerup", onPointerEnd);
      this.container.addEventListener("pointercancel", onPointerEnd);

      this.container.addEventListener(
        "wheel",
        (e) => {
          if (this.drag.active) return;
          e.preventDefault();
          this.commitNudge(performance.now());
          const mult = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : 1;
          const impulse = Math.max(0, this.options.wheelSensitivity) * 0.003;
          this.vel.x = clamp(this.vel.x - e.deltaX * mult * impulse, -1.4, 1.4);
          this.vel.y = clamp(this.vel.y - e.deltaY * mult * impulse, -1.4, 1.4);
          this.requestRender();
        },
        { passive: false }
      );

      // Keyboard arrow keys
      this.container.setAttribute("tabindex", "0");
      this.container.addEventListener("keydown", (e) => {
        const map = {
          ArrowLeft: [45, 0],
          ArrowRight: [-45, 0],
          ArrowUp: [0, 45],
          ArrowDown: [0, -45],
        };
        const delta = map[e.key];
        if (delta) {
          e.preventDefault();
          this.commitNudge(performance.now());
          this.pos.x += delta[0];
          this.pos.y += delta[1];
          this.vel = { x: 0, y: 0 };
          this.requestRender();
        }
      });
    }

    getTileAtScreenPoint(clientX, clientY) {
      const rect = this.container.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x < 0 || x > rect.width || y < 0 || y > rect.height) return null;

      const uvX = x / this.viewWidth;
      const uvY = (this.viewHeight - y) / this.viewHeight;

      const centeredX = uvX * 2.0 - 1.0;
      const centeredY = uvY * 2.0 - 1.0;
      const aspect = this.viewWidth / Math.max(this.viewHeight, 1.0);

      const lensX = centeredX * aspect;
      const lensY = centeredY;
      const radius = (lensX * lensX + lensY * lensY) / (aspect * aspect + 1.0);
      const curve = this.lensStrength * (0.34 * radius + 0.12 * radius * radius);
      const warpedX = lensX / (1.0 + curve);
      const warpedY = lensY / (1.0 + curve);

      const warpedUvX = (warpedX / aspect) * 0.5 + 0.5;
      const warpedUvY = warpedY * 0.5 + 0.5;

      const worldX = warpedUvX * this.viewWidth - this.pos.x;
      const worldY = (1.0 - warpedUvY) * this.viewHeight - this.pos.y;

      const atlasW = this.atlasCanvas.width;
      const atlasH = this.atlasCanvas.height;

      // Positive modulo
      const atlasX = ((worldX % atlasW) + atlasW) % atlasW;
      const atlasY = ((worldY % atlasH) + atlasH) % atlasH;

      const col = Math.floor(atlasX / this.cellWidth);
      const row = Math.floor(atlasY / this.cellHeight);
      const index = (row * this.atlasColumns + col) % this.items.length;

      return {
        item: this.items[index],
        index,
      };
    }

    setCurvature(value) {
      this.lensStrength = clamp(Number(value), 0, 2.0);
      this.requestRender();
    }

    setTheme(theme) {
      this.theme = theme;
      this.drawAtlas();
      this.requestRender();
    }

    setInertia(value) {
      this.inertia = clamp(Number(value), 0.5, 0.98);
    }

    destroy() {
      this.disposed = true;
      cancelAnimationFrame(this.animationFrame);
      if (this.resizeObserver) this.resizeObserver.disconnect();
      if (this.gl) {
        this.gl.deleteTexture(this.texture);
        this.gl.deleteBuffer(this.posBuffer);
        this.gl.deleteProgram(this.program);
      }
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  }

  global.FisheyeInfiniteGrid = FisheyeInfiniteGrid;
})(window);
