"use client";

import {
  type HTMLAttributes,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { type FisheyeGridItem, RANGRITICO_ARTWORKS } from "./artworks-data";

export interface InfiniteImageFieldProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  className?: string;
  items?: FisheyeGridItem[] | string[];
  imageWidth?: number;
  imageHeight?: number;
  gap?: number;
  maxSpeed?: number;
  smoothing?: number;
  borderRadius?: number;
  theme?: "dark" | "light";
  onItemClick?: (item: FisheyeGridItem | string, index: number) => void;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
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

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  if (!img || !img.naturalWidth) return;
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

export function InfiniteImageField({
  className = "",
  items = RANGRITICO_ARTWORKS,
  imageWidth = 220,
  imageHeight = 290,
  gap = 28,
  maxSpeed = 5.5,
  smoothing = 0.075,
  borderRadius = 12,
  theme = "dark",
  onItemClick,
  ...rest
}: InfiniteImageFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadedImagesRef = useRef<HTMLImageElement[]>([]);
  const dimsRef = useRef({ w: 0, h: 0 });
  const camRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const isInsideRef = useRef(false);
  const rafRef = useRef<number>(0);

  // Pre-load images
  useEffect(() => {
    const imgs = items.map((item) => {
      const src = typeof item === "string" ? item : item.image;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = src;
      return img;
    });
    loadedImagesRef.current = imgs;
  }, [items]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w: W, h: H } = dimsRef.current;
    if (W === 0 || H === 0) {
      rafRef.current = requestAnimationFrame(draw);
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cellW = imageWidth + gap;
    const cellH = imageHeight + gap;
    const imgs = loadedImagesRef.current;
    const numImages = Math.max(1, imgs.length);

    // Physics — cursor offset from center drives velocity
    const tx = isInsideRef.current
      ? (mouseRef.current.x - 0.5) * 2 * maxSpeed
      : 0;
    const ty = isInsideRef.current
      ? (mouseRef.current.y - 0.5) * 2 * maxSpeed
      : 0;

    velRef.current.x += (tx - velRef.current.x) * smoothing;
    velRef.current.y += (ty - velRef.current.y) * smoothing;

    camRef.current.x += velRef.current.x;
    camRef.current.y += velRef.current.y;

    const camX = camRef.current.x;
    const camY = camRef.current.y;

    ctx.clearRect(0, 0, W, H);

    // Compute visible cell range
    const colMin = Math.floor((camX - W / 2) / cellW) - 1;
    const colMax = Math.ceil((camX + W / 2) / cellW) + 1;
    const rowMin = Math.floor((camY - H / 2) / cellH) - 1;
    const rowMax = Math.ceil((camY + H / 2) / cellH) + 1;

    const isLight = theme === "light";

    for (let row = rowMin; row <= rowMax; row++) {
      for (let col = colMin; col <= colMax; col++) {
        // Top-left corner in screen space
        const sx = col * cellW - camX + W / 2 - imageWidth / 2;
        const sy = row * cellH - camY + H / 2 - imageHeight / 2;

        const imgIdx =
          Math.abs(col * 7 + row * 13 + ((col * row * 3) | 0)) % numImages;
        const img = imgs[imgIdx];
        const rawItem = items[imgIdx];
        const item = typeof rawItem === "string" ? { title: "Sacred Art" } : rawItem;

        ctx.save();
        drawRoundedRect(ctx, sx, sy, imageWidth, imageHeight, borderRadius);
        ctx.clip();

        if (img && img.complete && img.naturalWidth > 0) {
          drawCoverImage(ctx, img, sx, sy, imageWidth, imageHeight);
        } else {
          ctx.fillStyle = isLight ? "rgba(220,215,205,0.7)" : "rgba(20,18,16,0.85)";
          ctx.fillRect(sx, sy, imageWidth, imageHeight);
        }

        // Bottom gradient scrim
        const grad = ctx.createLinearGradient(sx, sy + imageHeight - 65, sx, sy + imageHeight);
        grad.addColorStop(0, "rgba(0,0,0,0)");
        grad.addColorStop(1, "rgba(0,0,0,0.82)");
        ctx.fillStyle = grad;
        ctx.fillRect(sx, sy + imageHeight - 65, imageWidth, 65);

        if (item?.title) {
          ctx.font = "600 11px sans-serif";
          ctx.fillStyle = "#F7E7B4";
          const title = item.title.toUpperCase();
          ctx.fillText(
            title.length > 20 ? `${title.slice(0, 19)}…` : title,
            sx + 12,
            sy + imageHeight - 24
          );
        }

        ctx.restore();

        // Subtle border overlay for gilded glass-panel effect
        ctx.save();
        drawRoundedRect(ctx, sx, sy, imageWidth, imageHeight, borderRadius);
        ctx.strokeStyle = isLight ? "rgba(170,130,10,0.3)" : "rgba(212,175,55,0.35)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      }
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [imageWidth, imageHeight, gap, maxSpeed, smoothing, borderRadius, theme, items]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      dimsRef.current = { w: rect.width, h: rect.height };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };

    const onEnter = () => {
      isInsideRef.current = true;
    };
    const onLeave = () => {
      isInsideRef.current = false;
    };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseenter", onEnter);
    canvas.addEventListener("mouseleave", onLeave);

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseenter", onEnter);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [draw]);

  return (
    <div
      {...rest}
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="block w-full h-full bg-transparent" />
    </div>
  );
}
