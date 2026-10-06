import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Move, Loader2 } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => Promise<void> | void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // References for drag calculation
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({
    x: 0,
    y: 0,
    panX: 0,
    panY: 0,
  });

  // Touch pinch-to-zoom tracking
  const initialPinchDistRef = useRef<number | null>(null);
  const initialPinchZoomRef = useRef<number>(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset controls when a new image is loaded
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setIsDragging(false);
      setIsProcessing(false);
    }
  }, [isOpen, imageSrc]);

  // Pointer Down (Mouse or Touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag with primary pointer if single touch/click
    if (e.isPrimary) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  // Pointer Move (Mouse or Touch)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setPan({
      x: dragStartRef.current.panX + deltaX,
      y: dragStartRef.current.panY + deltaY,
    });
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Touch event listeners for 2-finger pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDistRef.current = dist;
      initialPinchZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && initialPinchDistRef.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDist / initialPinchDistRef.current;
      const nextZoom = Math.min(3.5, Math.max(1, initialPinchZoomRef.current * factor));
      setZoom(nextZoom);
    }
  };

  const handleTouchEnd = () => {
    initialPinchDistRef.current = null;
  };

  // Wheel to zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.12 : -0.12;
    setZoom((prev) => Math.min(3.5, Math.max(1, prev + zoomDelta)));
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Reset position & zoom
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  // Crop & Export to circular high-quality JPEG
  const handleSaveCrop = useCallback(async () => {
    if (!imgRef.current || !containerRef.current) return;
    setIsProcessing(true);

    try {
      const img = imgRef.current;
      const CROP_BOX_SIZE = 260; // diameter of viewport circle in px
      const OUTPUT_SIZE = 480; // High-res output avatar canvas
      const scaleToOutput = OUTPUT_SIZE / CROP_BOX_SIZE;

      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      // Smooth anti-aliased image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Move origin to canvas center
      ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);

      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply user pan (scaled to output dimensions)
      // Note: pan is in screen space before rotation
      const rad = (-rotation * Math.PI) / 180;
      const rotatedPanX = pan.x * Math.cos(rad) - pan.y * Math.sin(rad);
      const rotatedPanY = pan.x * Math.sin(rad) + pan.y * Math.cos(rad);

      ctx.translate(rotatedPanX * scaleToOutput, rotatedPanY * scaleToOutput);

      // Apply user zoom
      ctx.scale(zoom, zoom);

      // Compute natural aspect ratio and cover fit for base size
      const imgWidth = img.naturalWidth || img.width;
      const imgHeight = img.naturalHeight || img.height;
      const aspect = imgWidth / imgHeight;

      let drawWidth = OUTPUT_SIZE;
      let drawHeight = OUTPUT_SIZE;

      if (aspect >= 1) {
        drawHeight = OUTPUT_SIZE;
        drawWidth = OUTPUT_SIZE * aspect;
      } else {
        drawWidth = OUTPUT_SIZE;
        drawHeight = OUTPUT_SIZE / aspect;
      }

      // Draw image centered
      ctx.drawImage(
        img,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );

      // Export as high-quality JPEG
      const finalCroppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);

      await onCropComplete(finalCroppedDataUrl);
      onClose();
    } catch (err) {
      console.error('Failed to crop image:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [pan, zoom, rotation, onCropComplete, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-modal-title"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <div>
            <h3
              id="crop-modal-title"
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: '#0F172A',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              Adjust Profile Photo
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
              Drag to position • Zoom to fit circle
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Cancel"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Interactive Viewport Area */}
        <div
          style={{
            padding: '20px 16px',
            backgroundColor: '#0F172A',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
          }}
        >
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            style={{
              position: 'relative',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              overflow: 'hidden',
              cursor: isDragging ? 'grabbing' : 'grab',
              touchAction: 'none',
              backgroundColor: '#1E293B',
              boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.75)',
            }}
          >
            {/* Inner Circular Guide Outline */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '2.5px solid rgba(255, 255, 255, 0.9)',
                pointerEvents: 'none',
                zIndex: 3,
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
              }}
            />

            {/* Rule of Thirds Guidelines (visible during adjustment) */}
            {isDragging && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  zIndex: 2,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gridTemplateRows: '1fr 1fr 1fr',
                  opacity: 0.35,
                }}
              >
                <div style={{ borderRight: '1px dashed #FFFFFF', borderBottom: '1px dashed #FFFFFF' }} />
                <div style={{ borderRight: '1px dashed #FFFFFF', borderBottom: '1px dashed #FFFFFF' }} />
                <div style={{ borderBottom: '1px dashed #FFFFFF' }} />
                <div style={{ borderRight: '1px dashed #FFFFFF', borderBottom: '1px dashed #FFFFFF' }} />
                <div style={{ borderRight: '1px dashed #FFFFFF', borderBottom: '1px dashed #FFFFFF' }} />
                <div style={{ borderBottom: '1px dashed #FFFFFF' }} />
                <div style={{ borderRight: '1px dashed #FFFFFF' }} />
                <div style={{ borderRight: '1px dashed #FFFFFF' }} />
                <div />
              </div>
            )}

            {/* Croppable Image Element */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Adjustment preview"
              draggable={false}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                maxWidth: 'none',
                maxHeight: 'none',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.05s ease-out',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Quick Helper Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              color: '#E2E8F0',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 500,
              marginTop: '14px',
            }}
          >
            <Move size={12} />
            <span>Drag image to reposition inside circle</span>
          </div>
        </div>

        {/* Controls Section */}
        <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Zoom Slider Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(1, prev - 0.2))}
              aria-label="Zoom Out"
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ZoomOut size={17} />
            </button>

            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="range"
                min="1"
                max="3.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                aria-label="Zoom slider"
                style={{
                  width: '100%',
                  accentColor: '#0B63E5',
                  height: '6px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(3.5, prev + 0.2))}
              aria-label="Zoom In"
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ZoomIn size={17} />
            </button>

            {/* Rotate Button */}
            <button
              type="button"
              onClick={handleRotate}
              title="Rotate 90 degrees"
              aria-label="Rotate 90 degrees"
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#0F172A',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
              }}
            >
              <RotateCw size={14} />
              <span>Rotate</span>
            </button>
          </div>

          {/* Action Buttons: Cancel, Reset, Apply */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveCrop}
              disabled={isProcessing}
              className="btn-primary"
              style={{
                flex: 2,
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.75 : 1,
              }}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Photo...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Set Profile Photo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
