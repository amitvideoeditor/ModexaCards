import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DisableCardModal: React.FC = () => {
  const {
    isDisableCardModalOpen,
    closeDisableCardModal,
    selectedCardId,
    cards,
    disableCard,
    enableCard,
  } = useApp();

  const currentCard = cards.find((c) => c.id === selectedCardId) || cards[0];
  if (!isDisableCardModalOpen) return null;

  const isAlreadyInactive = currentCard.status === 'Inactive';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={closeDisableCardModal}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(2px)',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 95,
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #E2E8F0',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              backgroundColor: isAlreadyInactive ? '#ECFDF5' : '#FEF2F2',
              color: isAlreadyInactive ? '#10B981' : '#EF4444',
            }}
          >
            <AlertTriangle size={20} />
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
              {isAlreadyInactive ? 'Reactivate Review Card?' : 'Disable Review Card?'}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', lineHeight: 1.5 }}>
              {isAlreadyInactive
                ? `Enable ${currentCard.id} for ${currentCard.businessName}. Taps and scans will begin redirecting to Google again.`
                : `Are you sure you want to disable ${currentCard.id} for ${currentCard.businessName}? NFC taps and QR scans will be temporarily paused.`}
            </p>
          </div>

          <button
            type="button"
            onClick={closeDisableCardModal}
            style={{
              padding: '4px',
              color: '#94A3B8',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
          <button
            type="button"
            onClick={closeDisableCardModal}
            className="btn-secondary"
            style={{ padding: '8px 16px' }}
          >
            Cancel
          </button>

          {isAlreadyInactive ? (
            <button
              type="button"
              onClick={() => {
                enableCard(currentCard.id);
                closeDisableCardModal();
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Reactivate Card
            </button>
          ) : (
            <button
              type="button"
              onClick={() => disableCard(currentCard.id)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Yes, Disable Card
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
