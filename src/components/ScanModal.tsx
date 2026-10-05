import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  QrCode,
  Wifi,
  CheckCircle2,
  Flashlight,
  FlashlightOff,
  Pencil,
  ExternalLink,
  Search,
  RefreshCw,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CardStatusBadge } from './CardStatusBadge';
import cardThumbImg from '../assets/review-card-stand.png';
import type { CardItem } from '../types';

export const ScanModal: React.FC = () => {
  const {
    isScanModalOpen,
    closeScanModal,
    openActivateModal,
    cards,
    showToast,
    isMobile,
  } = useApp();

  const [hasCamera, setHasCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [detectedCard, setDetectedCard] = useState<CardItem | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera when modal opens
  useEffect(() => {
    if (!isScanModalOpen) {
      stopCamera();
      setDetectedCard(null);
      setScanning(false);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isScanModalOpen]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setHasCamera(true);
        setCameraActive(true);
      } else {
        setHasCamera(false);
        setCameraActive(false);
      }
    } catch (err) {
      // Permission denied or camera not available (normal in desktop or iframe)
      setHasCamera(false);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const toggleFlashlight = () => {
    setFlashlightOn((prev) => !prev);
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        const capabilities = (track.getCapabilities && track.getCapabilities()) as any;
        if (capabilities && capabilities.torch) {
          track.applyConstraints({
            advanced: [{ torch: !flashlightOn } as any],
          }).catch(() => {});
        }
      }
    }
  };

  const handleCardDetected = (card: CardItem) => {
    setScanning(true);
    // Haptic feedback if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 60, 40]);
    }

    setTimeout(() => {
      setScanning(false);
      setDetectedCard(card);
      showToast(`QR Code Scanned: ${card.id} (${card.businessName || 'Unassigned'})`, 'success');
    }, 600);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = manualInput.trim().toUpperCase();
    if (!query) return;

    // Check for ID match or URL match
    const matched = cards.find(
      (c) =>
        c.id.toUpperCase() === query ||
        c.id.toUpperCase().includes(query) ||
        (c.googleReviewUrl && c.googleReviewUrl.toUpperCase().includes(query))
    );

    if (matched) {
      handleCardDetected(matched);
      setManualInput('');
    } else {
      showToast(`Card "${query}" not found in system inventory.`, 'warning');
    }
  };

  const handleEditScannedCard = () => {
    if (!detectedCard) return;
    const cardId = detectedCard.id;
    closeScanModal();
    // Directly open the edit / activate drawer
    openActivateModal(cardId);
  };

  const handleResetScan = () => {
    setDetectedCard(null);
    setScanning(false);
    startCamera();
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
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        padding: isMobile ? '0' : '16px',
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes modexaScanLaser {
          0% { top: 6%; opacity: 0.7; }
          50% { top: 92%; opacity: 1; }
          100% { top: 6%; opacity: 0.7; }
        }
        @keyframes modexaScanPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.04); opacity: 1; }
        }
      `}</style>

      {/* Main Scanner Container (Designed as a specialized in-app phone scanner) */}
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
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
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
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
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
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                Modexa Card Scanner
              </div>
              <div style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: detectedCard ? '#22C55E' : '#38BDF8',
                    display: 'inline-block',
                    animation: 'modexaScanPulse 1.5s infinite',
                  }}
                />
                <span>{detectedCard ? 'Card Captured' : cameraActive ? 'Live Camera Ready' : 'NFC & QR Mode Active'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              minHeight: '260px',
              backgroundColor: '#020617',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Live Video Element */}
            {hasCamera && (
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
                  opacity: detectedCard ? 0.25 : 0.85,
                }}
              />
            )}

            {/* Dark Camera Backdrop when Camera stream not active */}
            {!hasCamera && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at center, #1E293B 0%, #020617 100%)',
                  opacity: 0.9,
                }}
              />
            )}

            {/* Dark Vignette Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(2, 6, 23, 0.4)',
                pointerEvents: 'none',
              }}
            />

            {/* Live Scanning Progress Overlay */}
            {scanning && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(11, 99, 229, 0.45)',
                  backdropFilter: 'blur(3px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  zIndex: 20,
                }}
              >
                <Loader2 size={32} className="animate-spin" style={{ color: '#FFFFFF' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF' }}>Reading Modexa Card...</span>
              </div>
            )}

            {/* Viewfinder Targeting Reticle */}
            {!detectedCard ? (
              <div
                style={{
                  position: 'relative',
                  width: '200px',
                  height: '200px',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(148, 163, 184, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                {/* 4 Corner Targeting Brackets */}
                <span style={{ position: 'absolute', top: '-2px', left: '-2px', width: '22px', height: '22px', borderTop: '3px solid #0B63E5', borderLeft: '3px solid #0B63E5', borderTopLeftRadius: '8px' }} />
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '22px', height: '22px', borderTop: '3px solid #0B63E5', borderRight: '3px solid #0B63E5', borderTopRightRadius: '8px' }} />
                <span style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '22px', height: '22px', borderBottom: '3px solid #0B63E5', borderLeft: '3px solid #0B63E5', borderBottomLeftRadius: '8px' }} />
                <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '22px', height: '22px', borderBottom: '3px solid #0B63E5', borderRight: '3px solid #0B63E5', borderBottomRightRadius: '8px' }} />

                {/* Animated Laser Scanning Line */}
                <div
                  style={{
                    position: 'absolute',
                    left: '4px',
                    right: '4px',
                    height: '2px',
                    backgroundColor: '#38BDF8',
                    boxShadow: '0 0 10px 2px #0B63E5, 0 0 20px 4px rgba(56, 189, 248, 0.7)',
                    animation: 'modexaScanLaser 2.2s ease-in-out infinite',
                    zIndex: 3,
                  }}
                />

                {/* Center NFC & QR Hologram */}
                <div style={{ textAlign: 'center', opacity: 0.75 }}>
                  <img
                    src={cardThumbImg}
                    alt="Scan Target"
                    style={{ width: '80px', height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}
                  />
                  <div style={{ fontSize: '11px', color: '#93C5FD', fontWeight: 600, marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Wifi size={13} />
                    <span>NFC + QR Target</span>
                  </div>
                </div>
              </div>
            ) : (
              /* CARD DETECTED CARD OVERLAY */
              <div
                style={{
                  position: 'relative',
                  zIndex: 5,
                  padding: '16px',
                  width: '90%',
                  maxWidth: '340px',
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderRadius: '16px',
                  border: '1.5px solid #0B63E5',
                  boxShadow: '0 0 25px rgba(11, 99, 229, 0.35)',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={16} style={{ color: '#22C55E' }} />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#22C55E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Card Matched
                    </span>
                  </div>
                  <CardStatusBadge status={detectedCard.status} size="sm" />
                </div>

                <div style={{ fontSize: '17px', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>
                  {detectedCard.businessName || 'Unassigned Stock'}
                </div>
                <div style={{ fontSize: '12px', color: '#38BDF8', fontWeight: 600, marginBottom: '6px' }}>
                  {detectedCard.id} • <span style={{ color: '#94A3B8', fontWeight: 500 }}>{detectedCard.location || 'New Delhi'}</span>
                </div>

                {detectedCard.googleReviewUrl && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#94A3B8',
                      backgroundColor: 'rgba(30, 41, 59, 0.8)',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: '12px',
                    }}
                  >
                    🔗 {detectedCard.googleReviewUrl}
                  </div>
                )}

                {/* Primary Action Requested by User: EDIT THE CARD */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleEditScannedCard}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: '10px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      backgroundColor: '#0B63E5',
                      boxShadow: '0 4px 14px rgba(11, 99, 229, 0.4)',
                    }}
                  >
                    <Pencil size={15} />
                    <span>{detectedCard.status === 'Unassigned' ? 'Assign & Edit Card' : 'Edit This Card'}</span>
                    <ArrowRight size={15} />
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {detectedCard.googleReviewUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          closeScanModal();
                          window.open(detectedCard.googleReviewUrl, '_blank');
                        }}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          borderRadius: '8px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          backgroundColor: 'rgba(51, 65, 85, 0.6)',
                          color: '#E2E8F0',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                        }}
                      >
                        <ExternalLink size={13} />
                        <span>Open Link</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleResetScan}
                      style={{
                        flex: 1,
                        padding: '8px 10px',
                        borderRadius: '8px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        backgroundColor: 'rgba(51, 65, 85, 0.6)',
                        color: '#94A3B8',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                      }}
                    >
                      <RefreshCw size={13} />
                      <span>Scan Another</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Scanner Bottom Panel: Quick Card Selector & Manual Input */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#0F172A',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Manual Card Search / QR Input Form */}
            <form onSubmit={handleManualSearch} style={{ display: 'flex', gap: '8px' }}>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#1E293B',
                  borderRadius: '10px',
                  border: '1px solid #334155',
                  padding: '4px 10px',
                }}
              >
                <Search size={15} style={{ color: '#94A3B8', marginRight: '6px' }} />
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Enter Card ID (e.g. CRD-0001)..."
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    outline: 'none',
                  }}
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                Find & Edit
              </button>
            </form>

            {/* Quick-Scan Cards from Inventory */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Tap Any Card to Scan & Edit
                </span>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  {cards.length} cards in stock
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                  scrollbarWidth: 'none',
                }}
              >
                {cards.slice(0, 10).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleCardDetected(c)}
                    style={{
                      flexShrink: 0,
                      padding: '8px 12px',
                      borderRadius: '10px',
                      backgroundColor: detectedCard?.id === c.id ? '#0B63E5' : '#1E293B',
                      border: detectedCard?.id === c.id ? '1px solid #38BDF8' : '1px solid #334155',
                      color: '#FFFFFF',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      minWidth: '120px',
                    }}
                  >
                    <div style={{ fontSize: '11.5px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{c.id}</span>
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: c.status === 'Active' ? '#22C55E' : c.status === 'Unassigned' ? '#F59E0B' : '#EF4444',
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: detectedCard?.id === c.id ? '#DBEAFE' : '#94A3B8',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '120px',
                        marginTop: '2px',
                      }}
                    >
                      {c.businessName || 'Unassigned'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Instruction Footer Note */}
            <div
              style={{
                fontSize: '11.5px',
                color: '#64748B',
                textAlign: 'center',
                lineHeight: 1.4,
              }}
            >
              Scan any physical Modexa NFC tapcard or QR sticker to edit its Google review link, assigned business, or toggle status.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
