import React from 'react';
import { Home, CreditCard, QrCode, Store, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { MobileTab } from '../types';

export const MobileBottomNav: React.FC = () => {
  const {
    activeMobileTab,
    setActiveMobileTab,
    navigateTo,
    openScanModal,
  } = useApp();

  const handleTabClick = (tab: MobileTab) => {
    setActiveMobileTab(tab);
    if (tab === 'home') navigateTo('dashboard');
    if (tab === 'cards') navigateTo('cards');
    if (tab === 'businesses') navigateTo('businesses');
    if (tab === 'scan') openScanModal();
    if (tab === 'profile') navigateTo('profile');
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        padding: '6px 8px 8px 8px',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        alignItems: 'center',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.04)',
        userSelect: 'none',
      }}
    >
      {/* 1. Home */}
      <button
        type="button"
        onClick={() => handleTabClick('home')}
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          color: activeMobileTab === 'home' ? '#0B63E5' : '#64748B',
          cursor: 'pointer',
          border: 'none',
          background: 'transparent',
          padding: '4px 0',
          outline: 'none',
        }}
      >
        <Home size={20} strokeWidth={activeMobileTab === 'home' ? 2.3 : 1.8} />
        <span style={{ fontSize: '11px', fontWeight: activeMobileTab === 'home' ? 600 : 500 }}>Home</span>
      </button>

      {/* 2. Cards */}
      <button
        type="button"
        onClick={() => handleTabClick('cards')}
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          color: activeMobileTab === 'cards' ? '#0B63E5' : '#64748B',
          cursor: 'pointer',
          border: 'none',
          background: 'transparent',
          padding: '4px 0',
          outline: 'none',
        }}
      >
        <CreditCard size={20} strokeWidth={activeMobileTab === 'cards' ? 2.3 : 1.8} />
        <span style={{ fontSize: '11px', fontWeight: activeMobileTab === 'cards' ? 600 : 500 }}>Cards</span>
      </button>

      {/* 3. Center Prominent Scan Button */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '-22px',
        }}
      >
        <button
          type="button"
          onClick={() => handleTabClick('scan')}
          aria-label="Scan or Tap Card"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: '#0B63E5',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(11, 99, 229, 0.45)',
            border: '4px solid #FFFFFF',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
            outline: 'none',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <QrCode size={24} strokeWidth={2.2} />
        </button>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', marginTop: '2px' }}>Scan</span>
      </div>

      {/* 4. Businesses */}
      <button
        type="button"
        onClick={() => handleTabClick('businesses')}
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          color: activeMobileTab === 'businesses' ? '#0B63E5' : '#64748B',
          cursor: 'pointer',
          border: 'none',
          background: 'transparent',
          padding: '4px 0',
          outline: 'none',
        }}
      >
        <Store size={20} strokeWidth={activeMobileTab === 'businesses' ? 2.3 : 1.8} />
        <span style={{ fontSize: '11px', fontWeight: activeMobileTab === 'businesses' ? 600 : 500 }}>Businesses</span>
      </button>

      {/* 5. Profile */}
      <button
        type="button"
        onClick={() => handleTabClick('profile')}
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          color: activeMobileTab === 'profile' ? '#0B63E5' : '#64748B',
          cursor: 'pointer',
          border: 'none',
          background: 'transparent',
          padding: '4px 0',
          outline: 'none',
        }}
      >
        <User size={20} strokeWidth={activeMobileTab === 'profile' ? 2.3 : 1.8} />
        <span style={{ fontSize: '11px', fontWeight: activeMobileTab === 'profile' ? 600 : 500 }}>Profile</span>
      </button>
    </div>
  );
};
