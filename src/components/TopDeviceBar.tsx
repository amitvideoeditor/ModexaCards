import React, { useState } from 'react';
import { Smartphone, Monitor, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ViewScreen } from '../types';

export const TopDeviceBar: React.FC = () => {
  const {
    previewDevice,
    setPreviewDevice,
    currentView,
    navigateTo,
    openActivateModal,
    isAuthenticated,
    setIsAuthenticated,
    user,
  } = useApp();

  const [isMinimized, setIsMinimized] = useState(false);

  const screens: { id: ViewScreen; label: string; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'cards', label: 'Cards' },
    { id: 'business-details', label: 'Business Details' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'activity', label: 'Activity' },
    { id: 'team', label: 'Team' },
    { id: 'settings', label: 'Settings', adminOnly: true },
    { id: 'profile', label: 'Profile' },
    { id: 'login', label: 'Login Screen' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 90,
        userSelect: 'none',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(8px)',
          color: '#FFFFFF',
          borderRadius: '9999px',
          padding: '6px 14px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(51, 65, 85, 0.8)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '12px',
        }}
      >
        {/* Collapse Toggle */}
        <button
          type="button"
          onClick={() => setIsMinimized(!isMinimized)}
          style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', padding: '2px', cursor: 'pointer' }}
          title={isMinimized ? 'Expand Studio Controls' : 'Minimize Controls'}
        >
          {isMinimized ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {!isMinimized ? (
          <>
            {/* Title Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, paddingRight: '10px', borderRight: '1px solid #334155' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0B63E5', display: 'inline-block' }} />
              <span>Modexa TapCard Studio</span>
            </div>

            {/* Device Mode Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: '9999px', padding: '2px', border: '1px solid #334155' }}>
              <button
                type="button"
                onClick={() => setPreviewDevice('auto')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: previewDevice === 'auto' ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: previewDevice === 'auto' ? '#0B63E5' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: previewDevice === 'desktop' ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: previewDevice === 'desktop' ? '#0B63E5' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Monitor size={12} />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: previewDevice === 'mobile' ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: previewDevice === 'mobile' ? '#0B63E5' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Smartphone size={12} />
                <span>Mobile</span>
              </button>
            </div>

            {/* Screen Jumper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {screens
                .filter((s) => !s.adminOnly || user?.role === 'Admin')
                .map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (s.id === 'login') {
                      setIsAuthenticated(false);
                    } else {
                      setIsAuthenticated(true);
                    }
                    navigateTo(s.id);
                  }}
                  style={{
                    padding: '4px 9px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: currentView === s.id && (s.id !== 'login' || !isAuthenticated) ? '#FFFFFF' : '#94A3B8',
                    backgroundColor: currentView === s.id && (s.id !== 'login' || !isAuthenticated) ? '#334155' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  {s.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => openActivateModal('CRD-0042')}
                style={{
                  padding: '4px 9px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#FBBF24',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                <Sparkles size={11} />
                <span>Drawer</span>
              </button>
            </div>
          </>
        ) : (
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8' }}>
            <span>Modexa TapCard • {previewDevice.toUpperCase()}</span>
          </div>
        )}
      </div>
    </div>
  );
};
