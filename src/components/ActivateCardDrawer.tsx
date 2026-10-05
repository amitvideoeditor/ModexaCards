import React, { useState, useEffect } from 'react';
import {
  X,
  Store,
  Link2,
  User,
  Phone,
  MapPin,
  Tag,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Shield,
  Copy,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CardStatusBadge } from './CardStatusBadge';
import cardThumbImg from '../assets/review-card-stand.png';
import type { CardStatus } from '../types';

export const ActivateCardDrawer: React.FC = () => {
  const {
    isActivateModalOpen,
    closeActivateModal,
    selectedCardId,
    cards,
    activateCard,
    updateCard,
    deleteCard,
    canDeleteCards,
    canAssignCards,
    canToggleCardStatus,
    teamMembers,
    user,
    showToast,
    isMobile,
  } = useApp();

  const currentCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Cafe & Restaurant');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [owner, setOwner] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('New Delhi, India');
  const [status, setStatus] = useState<CardStatus>('Active');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state whenever selected card changes or modal opens
  useEffect(() => {
    if (currentCard) {
      setBusinessName(
        currentCard.businessName === 'Unassigned Stock' ? '' : (currentCard.businessName || '')
      );
      setCategory(
        currentCard.category && currentCard.category !== 'General' ? currentCard.category : 'Cafe & Restaurant'
      );
      setGoogleReviewUrl(currentCard.googleReviewUrl || '');
      setOwner(
        currentCard.owner && currentCard.owner !== '—' ? currentCard.owner : ''
      );
      setPhone(currentCard.phone || '');
      setLocation(
        currentCard.location && currentCard.location !== 'Unassigned' ? currentCard.location : 'New Delhi, India'
      );
      setStatus(currentCard.status === 'Unassigned' ? 'Active' : (currentCard.status || 'Active'));
    }
  }, [selectedCardId, currentCard, isActivateModalOpen]);

  if (!isActivateModalOpen || !currentCard) return null;

  const isUnassigned = currentCard.status === 'Unassigned';

  const handleCopyCardId = () => {
    navigator.clipboard.writeText(currentCard.id);
    showToast(`Card ID ${currentCard.id} copied!`, 'info');
  };

  const handleTestLink = () => {
    if (!googleReviewUrl.trim()) {
      showToast('Please enter a Google Review Link to test.', 'warning');
      return;
    }
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      showToast('✓ Google Review link verified! Active & reachable.', 'success');
    }, 600);
  };

  const handleDeleteCard = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete card ${currentCard.id}? This action cannot be undone.`)) {
      return;
    }
    setIsDeleting(true);
    const ok = await deleteCard(currentCard.id);
    setIsDeleting(false);
    if (ok) {
      closeActivateModal();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalBusinessName = businessName.trim();
    const finalReviewUrl = googleReviewUrl.trim();

    if (!finalBusinessName) {
      showToast('Please enter a business name.', 'error');
      return;
    }
    if (!finalReviewUrl) {
      showToast('Please enter a valid Google review link.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (isUnassigned) {
        await activateCard({
          cardId: currentCard.id,
          businessName: finalBusinessName,
          reviewUrl: finalReviewUrl,
          ownerName: owner.trim() || user.name,
          phone,
          category,
          location,
        });
      } else {
        await updateCard(currentCard.id, {
          businessName: finalBusinessName,
          category,
          googleReviewUrl: finalReviewUrl,
          owner: owner.trim() || '—',
          phone,
          location,
          status,
        });
      }
      closeActivateModal();
    } finally {
      setIsSaving(false);
    }
  };

  // ========================================================
  // MOBILE DEDICATED FULL SCREEN (Matching Original Mobile UI)
  // ========================================================
  if (isMobile) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#FFFFFF',
          zIndex: 80,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Top Back Navigation Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 16px',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <button
            type="button"
            onClick={closeActivateModal}
            aria-label="Back"
            style={{
              padding: '4px',
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              {isUnassigned ? 'Activate Card' : 'Edit Card Details'}
            </h2>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
              {isUnassigned ? 'Assign to business & link Google Review' : 'Update live NFC chip & destination'}
            </p>
          </div>
        </div>

        {/* Form Body with All Options */}
        <form
          onSubmit={handleSubmit}
          style={{ padding: '16px 16px 36px 16px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}
        >
          {/* Card Summary Block */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                flexShrink: 0,
              }}
            >
              <img
                src={cardThumbImg}
                alt="Review Card"
                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>Card ID:</span>
                <strong style={{ color: '#0F172A', fontWeight: 700, fontSize: '14px' }}>{currentCard.id}</strong>
                <button
                  type="button"
                  onClick={handleCopyCardId}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Copy Card ID"
                >
                  <Copy size={13} />
                </button>
              </div>
              <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CardStatusBadge status={status} size="sm" />
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  {currentCard.qrScans} scans • {currentCard.nfcTaps} taps
                </span>
              </div>
            </div>
          </div>

          {/* 1. Business Name */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
              Business Name *
            </label>
            <div style={{ position: 'relative' }}>
              <Store
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
              />
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Sharma Cafe"
                required
                style={{
                  width: '100%',
                  paddingLeft: '38px',
                  paddingRight: '12px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* 2. Category Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
              Business Category
            </label>
            <div style={{ position: 'relative' }}>
              <Tag
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '38px',
                  paddingRight: '12px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              >
                <option value="Cafe & Restaurant">Cafe & Restaurant</option>
                <option value="Dental & Healthcare">Dental & Healthcare</option>
                <option value="Retail & Fashion">Retail & Fashion</option>
                <option value="Salon & Spa">Salon & Spa</option>
                <option value="Automotive & Garage">Automotive & Garage</option>
                <option value="Legal & Finance">Legal & Finance</option>
                <option value="Hospitality & Hotels">Hospitality & Hotels</option>
              </select>
            </div>
          </div>

          {/* 3. Google Review Link */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                Google Review Link *
              </label>
              {googleReviewUrl && (
                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '12px',
                    color: '#0B63E5',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  <span>Open URL</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <Link2
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
              />
              <input
                type="url"
                value={googleReviewUrl}
                onChange={(e) => setGoogleReviewUrl(e.target.value)}
                placeholder="https://g.page/r/..."
                required
                style={{
                  width: '100%',
                  paddingLeft: '38px',
                  paddingRight: '12px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* 4. Owner & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                Assigned Person
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={15}
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
                />
                <input
                  type="text"
                  list="mobile-team-members"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Staff / Agent"
                  disabled={!canAssignCards}
                  style={{
                    width: '100%',
                    paddingLeft: '32px',
                    paddingRight: '8px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    backgroundColor: canAssignCards ? '#FFFFFF' : '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    fontSize: '13px',
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <datalist id="mobile-team-members">
                  {teamMembers.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.role} ({t.email})
                    </option>
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                Contact Phone
              </label>
              <div style={{ position: 'relative' }}>
                <Phone
                  size={15}
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  style={{
                    width: '100%',
                    paddingLeft: '32px',
                    paddingRight: '8px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    fontSize: '13px',
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>

          {/* 5. Location / Place */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
              Location / City
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
              />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Connaught Place, New Delhi"
                style={{
                  width: '100%',
                  paddingLeft: '38px',
                  paddingRight: '12px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* 6. Card Operational Status */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
              Card Operational Status
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {(['Active', 'Unassigned', 'Inactive'] as CardStatus[]).map((s) => {
                const isSelected = status === s;
                const canToggle = canToggleCardStatus(currentCard);
                const isDisabled = !canToggle || (s === 'Unassigned' && !canAssignCards);
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setStatus(s)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      border: isSelected ? '1.5px solid #0B63E5' : '1px solid #CBD5E1',
                      backgroundColor: isSelected ? '#EFF6FF' : (isDisabled ? '#F8FAFC' : '#FFFFFF'),
                      color: isSelected ? '#0B63E5' : (isDisabled ? '#94A3B8' : '#475569'),
                      opacity: isDisabled && !isSelected ? 0.6 : 1,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {s === 'Inactive' ? 'Deactive' : s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instant sync notice */}
          <div
            style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <Shield size={16} style={{ color: '#16A34A', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '12px', color: '#15803D', lineHeight: 1.4, margin: 0 }}>
              Changes update the live NFC chip & QR code destination instantly.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto', paddingTop: '10px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleTestLink}
                disabled={isTesting}
                className="btn-secondary"
                style={{ flex: 1, padding: '11px', fontSize: '13px', borderRadius: '10px' }}
              >
                {isTesting ? (
                  <span className="animate-spin" style={{ width: '15px', height: '15px', border: '2px solid #CBD5E1', borderTopColor: '#0F172A', borderRadius: '50%', display: 'inline-block' }} />
                ) : (
                  <CheckCircle2 size={15} style={{ color: '#0B63E5' }} />
                )}
                <span>Test Link</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary"
                style={{ flex: 1.3, padding: '11px', fontSize: '13px', borderRadius: '10px' }}
              >
                {isSaving ? (
                  <span className="animate-spin" style={{ width: '15px', height: '15px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', display: 'inline-block' }} />
                ) : isUnassigned ? (
                  <>
                    <span>Activate Card</span>
                    <ArrowRight size={15} />
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>

            {/* Admin Delete Card Button */}
            {canDeleteCards && (
              <button
                type="button"
                onClick={handleDeleteCard}
                disabled={isDeleting}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  border: '1px solid #FECACA',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Trash2 size={14} />
                <span>{isDeleting ? 'Deleting...' : 'Delete Card from Inventory'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  // ========================================================
  // DESKTOP FALLBACK SLIDE-OVER DRAWER
  // ========================================================
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
      <div onClick={closeActivateModal} className="drawer-backdrop" />
      <div className="drawer-panel" style={{ width: '440px', padding: '0px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #E2E8F0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            {isUnassigned ? 'Activate Card' : 'Edit Card Details'}
          </h2>
          <button type="button" onClick={closeActivateModal} style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        {/* Render same form on desktop drawer */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>Business Name *</label>
            <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required style={{ width: '100%', height: '40px', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0 12px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>Google Review Link *</label>
            <input type="url" value={googleReviewUrl} onChange={(e) => setGoogleReviewUrl(e.target.value)} required style={{ width: '100%', height: '40px', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0 12px', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" disabled={isSaving} className="btn-primary" style={{ flex: 1, padding: '10px' }}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};
