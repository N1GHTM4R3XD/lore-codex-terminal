import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { X, ZoomIn, ZoomOut, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  src: string;
  aspect: number; // 1 = square, 16/9 = wide
  shape: "circle" | "rect";
  onCrop: (dataUrl: string) => void;
  onCancel: () => void;
}

/** Resize + compress an image via canvas. Returns a data URL. */
function compressImage(src: string, maxW = 1200, quality = 0.85, type = "image/jpeg"): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const ratio = Math.min(maxW / img.naturalWidth, 1);
      const w = Math.round(img.naturalWidth * ratio);
      const h = Math.round(img.naturalHeight * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL(type, quality));
    };
    img.onerror = reject;
    img.src = src;
  });
}

export const ImageCropper = ({ src, aspect, shape, onCrop, onCancel }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy });
  }, [dragging]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  // Touch support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    setDragging(true);
    dragStart.current = { x: t.clientX, y: t.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging) return;
    const t = e.touches[0];
    const dx = t.clientX - dragStart.current.x;
    const dy = t.clientY - dragStart.current.y;
    setPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy });
  }, [dragging]);

  const handleTouchEnd = useCallback(() => setDragging(false), []);

  const apply = async () => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img || !imgLoaded) return;

    const containerRect = container.getBoundingClientRect();
    const cropSize = Math.min(containerRect.width, containerRect.height) * 0.75;
    const cropW = cropSize;
    const cropH = cropSize / aspect;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(cropW * zoom);
    canvas.height = Math.round(cropH * zoom);
    const ctx = canvas.getContext("2d")!;

    // Center of the image relative to container center
    const imgRect = img.getBoundingClientRect();
    const scale = img.naturalWidth / imgRect.width;

    const containerCenterX = containerRect.left + containerRect.width / 2;
    const containerCenterY = containerRect.top + containerRect.height / 2;
    const imgCenterX = imgRect.left + imgRect.width / 2;
    const imgCenterY = imgRect.top + imgRect.height / 2;

    const offsetX = (containerCenterX - imgCenterX + pan.x) * scale;
    const offsetY = (containerCenterY - imgCenterY + pan.y) * scale;

    // Draw the portion of the image that falls within the crop area
    const sx = offsetX - (canvas.width / 2);
    const sy = offsetY - (canvas.height / 2);

    ctx.drawImage(
      img,
      sx, sy, canvas.width, canvas.height,
      0, 0, canvas.width, canvas.height
    );

    // Compress before returning
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    const compressed = await compressImage(dataUrl, 800, 0.9, "image/jpeg");
    onCrop(compressed);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in p-4">
      {/* Header */}
      <div className="w-full max-w-lg flex items-center justify-between mb-4">
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Przytnij obraz
        </span>
        <button onClick={onCancel} className="h-8 w-8 grid place-items-center rounded-full border border-border hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Crop area */}
      <div
        ref={containerRef}
        className="relative w-full max-w-lg aspect-square bg-muted/50 overflow-hidden cursor-grab active:cursor-grabbing select-none rounded-xl"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imgRef}
          src={src}
          alt=""
          className="absolute top-1/2 left-1/2 max-w-none pointer-events-none"
          style={{
            transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: dragging ? "none" : "transform 0.15s ease-out",
            opacity: imgLoaded ? 1 : 0,
          }}
          onLoad={() => setImgLoaded(true)}
        />

        {/* Overlay mask */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-black/60" />
          {/* Crop window (hole) */}
          <div
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              "border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]",
              shape === "circle" ? "rounded-full" : "rounded-lg"
            )}
            style={{
              width: "75%",
              aspectRatio: `${aspect}`,
            }}
          >
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/3 left-0 right-0 h-px bg-white/60" />
              <div className="absolute top-2/3 left-0 right-0 h-px bg-white/60" />
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/60" />
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/60" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-lg mt-4 space-y-3">
        <div className="flex items-center gap-3">
          <ZoomOut className="h-3.5 w-3.5 text-muted-foreground" />
          <Slider
            value={[zoom]}
            onValueChange={(v) => setZoom(v[0])}
            min={0.5}
            max={3}
            step={0.05}
            className="flex-1"
          />
          <ZoomIn className="h-3.5 w-3.5 text-muted-foreground" />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={apply} disabled={!imgLoaded} className="font-mono uppercase text-xs">
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Zastosuj
          </Button>
          <Button variant="ghost" size="sm" onClick={onCancel} className="font-mono text-xs">
            Anuluj
          </Button>
        </div>
      </div>
    </div>
  );
};
