import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle2, X, Share2, PlusSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallAppButtonProps {
  variant?: 'sidebar' | 'header' | 'floating' | 'banner' | 'icon';
  className?: string;
  style?: React.CSSProperties;
}

export const InstallAppButton: React.FC<InstallAppButtonProps> = ({
  variant = 'sidebar',
  className = '',
  style = {},
}) => {
  const { showToast } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      showToast('Modexa Cards installed successfully as an App!', 'success');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [showToast]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          showToast('Installing Modexa Cards app...', 'info');
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    } else {
      // Check if iOS
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIos) {
        setShowIosModal(true);
      } else {
        showToast(
          'To install on Desktop, click the Install App icon (🖥️ / ⬇️) in your browser address bar.',
          'info'
        );
      }
    }
  };

  // If already installed, hide or render subtle installed indicator
  if (isInstalled) {
    if (variant === 'sidebar') {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '10px',
            backgroundColor: '#F0FDF4',
            border: '1px solid #DCFCE7',
            fontSize: '11.5px',
            color: '#166534',
            fontWeight: 600,
            marginTop: '10px',
            ...style,
          }}
        >
          <CheckCircle2 size={15} style={{ color: '#16A34A', flexShrink: 0 }} />
          <span>App Installed</span>
        </div>
      );
    }
    return null;
  }

  // Variant 1: Sidebar Button (Desktop Nav)
  if (variant === 'sidebar') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className={className}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '10px 12px',
            borderRadius: '10px',
            backgroundColor: '#EFF6FF',
            border: '1.5px solid #BFDBFE',
            color: '#0B63E5',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            marginTop: '12px',
            ...style,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#DBEAFE';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#EFF6FF';
          }}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '7px',
              backgroundColor: '#0B63E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            <Download size={14} />
          </div>
          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div>Install as App</div>
            <div style={{ fontSize: '10.5px', fontWeight: 500, color: '#3B82F6', marginTop: '2px' }}>
              Desktop & Mobile PWA
            </div>
          </div>
        </button>

        {showIosModal && <IosInstallModal onClose={() => setShowIosModal(false)} />}
      </>
    );
  }

  // Variant 2: Header Button
  if (variant === 'header') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className={className}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#0B63E5',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            ...style,
          }}
        >
          <Download size={13} />
          <span>Install App</span>
        </button>

        {showIosModal && <IosInstallModal onClose={() => setShowIosModal(false)} />}
      </>
    );
  }

  // Variant 3: Icon (Mobile header or compact circular)
  if (variant === 'icon') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className={className}
          aria-label="Install App"
          title="Install Modexa Cards as an App"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0B63E5',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.15s ease',
            flexShrink: 0,
            ...style,
          }}
        >
          <Download size={18} />
        </button>

        {showIosModal && <IosInstallModal onClose={() => setShowIosModal(false)} />}
      </>
    );
  }

  // Default / Floating / Banner
  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          padding: '8px 14px',
          borderRadius: '10px',
          backgroundColor: '#0B63E5',
          color: '#FFFFFF',
          border: 'none',
          fontSize: '12.5px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(11, 99, 229, 0.25)',
          ...style,
        }}
      >
        <Smartphone size={14} />
        <span>Install Modexa App</span>
      </button>

      {showIosModal && <IosInstallModal onClose={() => setShowIosModal(false)} />}
    </>
  );
};

/**
 * Friendly iOS Safari installation instruction modal
 */
const IosInstallModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '24px',
          maxWidth: '380px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            backgroundColor: '#0B63E5',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 14px rgba(11, 99, 229, 0.3)',
          }}
        >
          <Smartphone size={32} />
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
          Install Modexa Cards
        </h3>
        <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px 0', lineHeight: 1.5 }}>
          Install as a native app on your iPhone or iPad for quick 1-tap access and full-screen experience.
        </p>

        <div
          style={{
            textAlign: 'left',
            backgroundColor: '#F8FAFC',
            borderRadius: '12px',
            padding: '14px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontSize: '12.5px',
            color: '#334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                color: '#0B63E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '11px',
                flexShrink: 0,
              }}
            >
              1
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>Tap the</span>
              <Share2 size={15} style={{ color: '#0B63E5' }} />
              <strong>Share button</strong>
              <span>in Safari</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                color: '#0B63E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '11px',
                flexShrink: 0,
              }}
            >
              2
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>Scroll &amp; tap</span>
              <PlusSquare size={15} style={{ color: '#0B63E5' }} />
              <strong>Add to Home Screen</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                color: '#0B63E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '11px',
                flexShrink: 0,
              }}
            >
              3
            </span>
            <div>
              <span>Tap <strong>Add</strong> in the top-right corner</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '11px',
            borderRadius: '10px',
            backgroundColor: '#0B63E5',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '13.5px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Got It
        </button>
      </div>
    </div>
  );
};
