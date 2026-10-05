import React, { useState } from 'react';
import { X, Link2, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ChangeLinkModal: React.FC = () => {
  const {
    isChangeLinkModalOpen,
    closeChangeLinkModal,
    selectedCardId,
    cards,
    changeCardLink,
  } = useApp();

  const currentCard = cards.find((c) => c.id === selectedCardId) || cards[0];
  const [newUrl, setNewUrl] = useState(currentCard?.googleReviewUrl || '');

  if (!isChangeLinkModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUrl.trim()) {
      await changeCardLink(currentCard.id, newUrl.trim());
    }
  };

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
        onClick={closeChangeLinkModal}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>
              Change Review Destination
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Card: <strong>{currentCard.id}</strong> ({currentCard.businessName})
            </p>
          </div>
          <button
            type="button"
            onClick={closeChangeLinkModal}
            style={{
              padding: '6px',
              color: '#64748B',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
              Google Review URL
            </label>
            <div style={{ position: 'relative' }}>
              <Link2
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
              />
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://g.page/r/..."
                style={{
                  width: '100%',
                  paddingLeft: '38px',
                  paddingRight: '12px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#0F172A',
                  outline: 'none',
                }}
                required
              />
            </div>
            <p style={{ fontSize: '11px', color: '#64748B', marginTop: '6px', lineHeight: 1.4 }}>
              Customers tapping this NFC card or scanning its QR code will be redirected to this new address.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
            <button
              type="button"
              onClick={closeChangeLinkModal}
              className="btn-secondary"
              style={{ padding: '8px 16px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '8px 18px' }}
            >
              <Check size={16} />
              <span>Save & Update</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
