import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  QrCode,
  Flashlight,
  FlashlightOff,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  Camera,
} from 'lucide-react';
import jsQR from 'jsqr';
import { useApp } from '../context/AppContext';
import { getCardByIdFromFirestore } from '../firebase/config';
import type { CardItem } from '../types';

/**
 * Extract ModexaCards Card ID from scanned QR code string.
 * Supports:
 * - Permanent QR URL: https://modexacards.web.app/r/CRD-0025
 * - Local / Custom URLs: http://localhost:5173/r/CRD-0025 or any origin with /r/CRD-XXXX
 * - Direct Card ID format: CRD-XXXX
 */
export function extractCardIdFromQr(rawText: string): { isValid: boolean; cardId?: string } {
  if (!rawText || typeof rawText !== 'string') {
    return { isValid: false };
  }
  const trimmed = rawText.trim();

  // 1. Direct Card ID format (e.g. CRD-0025, CRD-1042)
  const directMatch = trimmed.match(/^CRD-[A-Za-z0-9_-]+$/i);
  if (directMatch) {
    return { isValid: true, cardId: directMatch[0].toUpperCase() };
  }

  // 2. ModexaCards QR URL format (/r/CRD-XXXX)
  const urlPattern = /\/r\/(CRD-[A-Za-z0-9_-]+)/i;
  const urlMatch = trimmed.match(urlPattern);
  if (urlMatch && urlMatch[1]) {
    return { isValid: true, cardId: urlMatch[1].toUpperCase() };
  }

  // 3. Fallback URL with /r/:cardId
  if (trimmed.includes('/r/')) {
    const parts = trimmed.split('/r/');
    if (parts.length >= 2) {
      const potentialId = parts[1].split('?')[0].split('#')[0].replace(/\/+$/, '').trim();
      if (potentialId && potentialId.length >= 3) {
        return { isValid: true, cardId: potentialId.toUpperCase() };
      }
    }
  }

  return { isValid: false };
}

export const ScanModal: React.FC = () => {
  const {
    isScanModalOpen,
    closeScanModal,
    openActivateModal,
    cards,
    showToast,
    isMobile,
  } = useApp();

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [flashlightOn, setFlashlightOn] = useState<boolean>(false);
  const [hasFlashlightSupport, setHasFlashlightSupport] = useState<boolean>(false);
  const [isProcessingScan, setIsProcessingScan] = useState<boolean>(false);
  const [scanStatusMessage, setScanStatusMessage] = useState<string>('Align physical card QR inside frame');
  const [manualInput, setManualInput] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scanLoopRef = useRef<number | null>(null);
  const isHandlingScanRef = useRef<boolean>(false);
  const isStartingCameraRef = useRef<boolean>(false);

  // Stop camera tracks and release stream
  const stopCamera = useCallback(() => {
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setFlashlightOn(false);
    setHasFlashlightSupport(false);
  }, []);

  // Dispatch administrative card action based on card status
  const handleProcessCardFound = useCallback(
    (card: CardItem) => {
      // Close camera and modal immediately
      stopCamera();
      closeScanModal();

      if (card.status === 'Unassigned') {
        // Unassigned physical inventory -> Open Assign/Activate card drawer
        openActivateModal(card.id);
        showToast(`✓ Physical Card ${card.id} identified (Unassigned) — Opening Assign/Activate screen`, 'success');
      } else {
        // Active / Assigned card -> Open Edit card details drawer
        openActivateModal(card.id);
        showToast(
          `✓ Physical Card ${card.id} identified (${card.businessName || 'Active'}) — Opening Edit screen`,
          'success'
        );
      }
    },
    [closeScanModal, openActivateModal, showToast, stopCamera]
  );

  // Core administrative QR resolution logic
  const handleScannedRawText = useCallback(
    async (rawText: string) => {
      if (isHandlingScanRef.current) return;
      isHandlingScanRef.current = true;
      setIsProcessingScan(true);
      setScanStatusMessage('Analyzing scanned code...');

      // Haptic feedback buzz on capture
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([40, 60, 40]);
        } catch {}
      }

      // Step 1: Validate ModexaCards QR format & extract Card ID
      const extraction = extractCardIdFromQr(rawText);

      if (!extraction.isValid || !extraction.cardId) {
        setScanStatusMessage('Invalid ModexaCards QR code');
        showToast('Invalid ModexaCards QR code. Please scan an authentic Modexa card QR.', 'error');

        // Allow retry after 2.5s cooldown
        setTimeout(() => {
          isHandlingScanRef.current = false;
          setIsProcessingScan(false);
          setScanStatusMessage('Align physical card QR inside frame');
        }, 2500);
        return;
      }

      const targetCardId = extraction.cardId;
      setScanStatusMessage(`Searching inventory for ${targetCardId}...`);

      // Step 2: Search in local cached inventory
      const localMatch = cards.find(
        (c) => c.id.trim().toUpperCase() === targetCardId.toUpperCase()
      );

      if (localMatch) {
        handleProcessCardFound(localMatch);
        isHandlingScanRef.current = false;
        setIsProcessingScan(false);
        return;
      }

      // Step 3: Search directly in Cloud Firestore (in case card was created on another device)
      try {
        const firestoreMatch = await getCardByIdFromFirestore(targetCardId);
        if (firestoreMatch) {
          handleProcessCardFound(firestoreMatch);
          isHandlingScanRef.current = false;
          setIsProcessingScan(false);
          return;
        }
      } catch (err) {
        console.warn('Firestore query during scan:', err);
      }

      // Step 4: Card ID not found in system
      setScanStatusMessage(`Card not found: ${targetCardId}`);
      showToast(`Card not found: ${targetCardId} is not in inventory.`, 'error');

      setTimeout(() => {
        isHandlingScanRef.current = false;
        setIsProcessingScan(false);
        setScanStatusMessage('Align physical card QR inside frame');
      }, 2500);
    },
    [cards, handleProcessCardFound, showToast]
  );

  // Real-time camera video frame analysis loop
  const startScanLoop = useCallback(() => {
    let lastScanTime = 0;
    const SCAN_INTERVAL_MS = 100; // Scan every 100ms for high responsiveness with low battery usage

    // Native BarcodeDetector instance if browser supports it (Chromium / Android Chrome)
    const BarcodeDetectorClass = typeof window !== 'undefined' ? (window as any).BarcodeDetector : null;
    let barcodeDetectorInstance: any = null;
    if (BarcodeDetectorClass) {
      try {
        barcodeDetectorInstance = new BarcodeDetectorClass({ formats: ['qr_code'] });
      } catch {
        barcodeDetectorInstance = null;
      }
    }

    const scanFrame = async (timestamp: number) => {
      const video = videoRef.current;

      if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        scanLoopRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      if (isHandlingScanRef.current) {
        scanLoopRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      if (timestamp - lastScanTime >= SCAN_INTERVAL_MS) {
        lastScanTime = timestamp;

        try {
          // Engine 1: Native BarcodeDetector (Hardware-accelerated)
          if (barcodeDetectorInstance) {
            const detectedBarcodes = await barcodeDetectorInstance.detect(video);
            if (detectedBarcodes && detectedBarcodes.length > 0 && detectedBarcodes[0].rawValue) {
              handleScannedRawText(detectedBarcodes[0].rawValue);
              return;
            }
          }

          // Engine 2: Pure client-side canvas jsQR (100% universal across iOS Safari & Android)
          if (!canvasRef.current) {
            canvasRef.current = document.createElement('canvas');
          }
          const canvas = canvasRef.current;
          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;

          if (videoWidth > 0 && videoHeight > 0) {
            // Keep analysis dimensions reasonable to prevent lag
            const maxDim = 640;
            let targetWidth = videoWidth;
            let targetHeight = videoHeight;
            if (targetWidth > maxDim || targetHeight > maxDim) {
              if (targetWidth > targetHeight) {
                targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
                targetWidth = maxDim;
              } else {
                targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
                targetHeight = maxDim;
              }
            }

            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });

            if (ctx) {
              ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
              const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
              const qrResult = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
              });

              if (qrResult && qrResult.data) {
                handleScannedRawText(qrResult.data);
                return;
              }
            }
          }
        } catch {
          // Ignore transient frame read errors
        }
      }

      scanLoopRef.current = requestAnimationFrame(scanFrame);
    };

    scanLoopRef.current = requestAnimationFrame(scanFrame);
  }, [handleScannedRawText]);

  // Request camera stream with mobile environment preference and robust fallbacks
  const startCamera = useCallback(async () => {
    if (isStartingCameraRef.current) return;
    isStartingCameraRef.current = true;
    setCameraError(null);
    setScanStatusMessage('Requesting camera permissions...');

    // 1. HTTPS / Localhost security check
    if (
      typeof window !== 'undefined' &&
      !window.isSecureContext &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      setCameraError('Camera access requires HTTPS or localhost under browser security policy.');
      setCameraActive(false);
      isStartingCameraRef.current = false;
      return;
    }

    // 2. Check if mediaDevices API is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access (getUserMedia) is not supported in this browser.');
      setCameraActive(false);
      isStartingCameraRef.current = false;
      return;
    }

    // Stop any existing stream before creating new one
    stopCamera();

    let stream: MediaStream | null = null;

    // Constraint Attempt 1: Rear environment camera with optimal resolution
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    } catch (firstErr: any) {
      console.warn('Environment camera constraint failed, trying basic fallback:', firstErr);
      // Constraint Attempt 2: Basic environment or any available video source
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
      } catch (secondErr: any) {
        console.warn('Generic environment camera failed, trying any video input:', secondErr);
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (fatalErr: any) {
          console.error('All camera attempts failed:', fatalErr);
          isStartingCameraRef.current = false;
          setCameraActive(false);

          if (fatalErr.name === 'NotAllowedError' || fatalErr.name === 'PermissionDeniedError') {
            setCameraError(
              'Camera permission was denied. Please allow camera permissions in your browser address bar (lock/camera icon) or device settings, then tap Retry.'
            );
          } else if (fatalErr.name === 'NotFoundError' || fatalErr.name === 'DevicesNotFoundError') {
            setCameraError('No camera was detected on this device. You can look up cards manually below.');
          } else if (fatalErr.name === 'NotReadableError' || fatalErr.name === 'TrackStartError') {
            setCameraError(
              'Camera is currently in use by another application or browser tab. Please close other camera apps and retry.'
            );
          } else {
            setCameraError(
              fatalErr.message || 'Unable to access camera. Please check camera permissions and retry.'
            );
          }
          return;
        }
      }
    }

    if (stream) {
      streamRef.current = stream;
      setCameraActive(true);
      setScanStatusMessage('Align physical card QR inside frame');

      // Check flashlight/torch capability
      try {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const capabilities = (videoTrack.getCapabilities && videoTrack.getCapabilities()) as any;
          if (capabilities && capabilities.torch) {
            setHasFlashlightSupport(true);
          }
        }
      } catch {}

      if (videoRef.current) {
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.muted = true;
        videoRef.current.autoplay = true;
        videoRef.current.srcObject = stream;
        videoRef.current
          .play()
          .then(() => {
            startScanLoop();
          })
          .catch((e) => {
            console.warn('Video play interrupted:', e);
            startScanLoop();
          });
      }
    }

    isStartingCameraRef.current = false;
  }, [startScanLoop, stopCamera]);

  // Lifecycle: open/close camera cleanly
  useEffect(() => {
    if (!isScanModalOpen) {
      stopCamera();
      setIsProcessingScan(false);
      isHandlingScanRef.current = false;
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isScanModalOpen, startCamera, stopCamera]);

  // Toggle Hardware Torch / Flashlight
  const toggleFlashlight = () => {
    if (!streamRef.current) return;
    const nextState = !flashlightOn;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        track
          .applyConstraints({
            advanced: [{ torch: nextState } as any],
          })
          .then(() => {
            setFlashlightOn(nextState);
          })
          .catch(() => {
            setFlashlightOn(false);
          });
      } catch {}
    }
  };

  // Manual Card ID or URL Search Handler
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = manualInput.trim();
    if (!query) return;

    handleScannedRawText(query);
    setManualInput('');
  };

  if (!isScanModalOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(8px)',
        padding: isMobile ? '0' : '16px',
        userSelect: 'none',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="scanner-title"
    >
      <style>{`
        @keyframes modexaScanLaser {
          0% { top: 6%; opacity: 0.7; }
          50% { top: 92%; opacity: 1; }
          100% { top: 6%; opacity: 0.7; }
        }
        @keyframes modexaScanPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>

      {/* Main Scanner Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: isMobile ? '100%' : '440px',
          height: isMobile ? '100%' : 'auto',
          maxHeight: isMobile ? '100%' : '92vh',
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          borderRadius: isMobile ? '0' : '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: isMobile ? 'none' : '1px solid rgba(51, 65, 85, 0.6)',
        }}
      >
        {/* Scanner HUD Header */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(51, 65, 85, 0.6)',
            backgroundColor: 'rgba(15, 23, 42, 0.96)',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#0B63E5',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(11, 99, 229, 0.5)',
              }}
            >
              <QrCode size={20} />
            </div>
            <div>
              <div
                id="scanner-title"
                style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em' }}
              >
                Physical Card QR Scanner
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: cameraActive ? '#22C55E' : cameraError ? '#EF4444' : '#F59E0B',
                    display: 'inline-block',
                    animation: cameraActive ? 'modexaScanPulse 1.5s infinite' : 'none',
                  }}
                />
                <span>
                  {cameraActive
                    ? 'Rear Camera Live'
                    : cameraError
                    ? 'Camera Offline'
                    : 'Initializing Camera...'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {hasFlashlightSupport && (
              <button
                type="button"
                onClick={toggleFlashlight}
                aria-label="Toggle Flashlight"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: flashlightOn ? '#F59E0B' : 'rgba(51, 65, 85, 0.5)',
                  color: flashlightOn ? '#000000' : '#E2E8F0',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title={flashlightOn ? 'Torch On' : 'Torch Off'}
              >
                {flashlightOn ? <Flashlight size={17} /> : <FlashlightOff size={17} />}
              </button>
            )}

            <button
              type="button"
              onClick={closeScanModal}
              aria-label="Close Scanner"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(51, 65, 85, 0.5)',
                color: '#E2E8F0',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Viewfinder Content Area */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Main Visual Camera / HUD Viewfinder */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: isMobile ? '360px' : '320px',
              backgroundColor: '#020617',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Live Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: cameraActive ? 0.95 : 0,
                transition: 'opacity 0.2s ease',
              }}
            />

            {/* Dark Vignette Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(2, 6, 23, 0.35)',
                pointerEvents: 'none',
              }}
            />

            {/* Camera Error Message Display */}
            {cameraError && (
              <div
                style={{
                  position: 'absolute',
                  inset: '20px',
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderRadius: '16px',
                  border: '1px solid #EF4444',
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: '12px',
                  zIndex: 20,
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AlertCircle size={26} />
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
                  Camera Permission / Access Issue
                </div>
                <p style={{ fontSize: '12.5px', color: '#CBD5E1', lineHeight: 1.5, margin: 0, maxWidth: '300px' }}>
                  {cameraError}
                </p>
                <button
                  type="button"
                  onClick={startCamera}
                  style={{
                    marginTop: '6px',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#0B63E5',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Retry Camera</span>
                </button>
              </div>
            )}

            {/* Live Scanning Progress Overlay */}
            {isProcessingScan && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(11, 99, 229, 0.65)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  zIndex: 25,
                }}
              >
                <Loader2 size={36} className="animate-spin" style={{ color: '#FFFFFF' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
                  {scanStatusMessage}
                </span>
              </div>
            )}

            {/* Viewfinder Responsive Targeting Reticle */}
            {!cameraError && (
              <div
                style={{
                  position: 'relative',
                  width: isMobile ? 'min(240px, 68vw)' : '220px',
                  height: isMobile ? 'min(240px, 68vw)' : '220px',
                  borderRadius: '20px',
                  border: '1.5px solid rgba(148, 163, 184, 0.35)',
                  boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                {/* 4 Corner Targeting Brackets */}
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    left: '-2px',
                    width: '24px',
                    height: '24px',
                    borderTop: '3.5px solid #0B63E5',
                    borderLeft: '3.5px solid #0B63E5',
                    borderTopLeftRadius: '10px',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '24px',
                    height: '24px',
                    borderTop: '3.5px solid #0B63E5',
                    borderRight: '3.5px solid #0B63E5',
                    borderTopRightRadius: '10px',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: '-2px',
                    width: '24px',
                    height: '24px',
                    borderBottom: '3.5px solid #0B63E5',
                    borderLeft: '3.5px solid #0B63E5',
                    borderBottomLeftRadius: '10px',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '24px',
                    height: '24px',
                    borderBottom: '3.5px solid #0B63E5',
                    borderRight: '3.5px solid #0B63E5',
                    borderBottomRightRadius: '10px',
                  }}
                />

                {/* Animated Laser Scanning Line */}
                <div
                  style={{
                    position: 'absolute',
                    left: '6px',
                    right: '6px',
                    height: '2px',
                    backgroundColor: '#38BDF8',
                    boxShadow: '0 0 12px 2px #0B63E5, 0 0 24px 4px rgba(56, 189, 248, 0.8)',
                    animation: 'modexaScanLaser 2.2s ease-in-out infinite',
                    zIndex: 3,
                  }}
                />

                {/* Center QR Helper Icon */}
                <div style={{ textAlign: 'center', opacity: 0.55, pointerEvents: 'none' }}>
                  <QrCode size={44} style={{ color: '#93C5FD' }} />
                </div>
              </div>
            )}
          </div>

          {/* Status Hint Bar */}
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
              borderTop: '1px solid rgba(51, 65, 85, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '11.5px',
              color: '#CBD5E1',
              textAlign: 'center',
            }}
          >
            <Camera size={13} style={{ color: '#38BDF8' }} />
            <span>{scanStatusMessage}</span>
          </div>

          {/* Scanner Bottom Panel: Manual Card ID Input & Verification Info */}
          <div
            style={{
              padding: '18px 20px',
              backgroundColor: '#0F172A',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.4 }}>
              <strong>ModexaCards Admin Mode:</strong> Scanning a physical card identifies it immediately.
              Unassigned cards open the <em>Assign/Activate</em> screen; active cards open the <em>Edit</em> screen.
            </div>

            {/* Manual Card Search / QR URL Input Form */}
            <form onSubmit={handleManualSearch} style={{ display: 'flex', gap: '8px' }}>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#1E293B',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  padding: '6px 12px',
                }}
              >
                <Search size={15} style={{ color: '#94A3B8', marginRight: '8px' }} />
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Paste URL or ID (e.g. CRD-0025)..."
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                Identify Card
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
