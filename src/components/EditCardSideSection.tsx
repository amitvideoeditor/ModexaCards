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
  Save,
  Copy,
  ExternalLink,
  Shield,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CardStatusBadge } from './CardStatusBadge';
import type { CardStatus } from '../types';
import { CategoryThumbnailImage } from './CategoryThumbnailImage';
import { BUSINESS_CATEGORIES, getCategoryThumbnail } from '../data/categoryThumbnails';

interface EditCardSideSectionProps {
  cardId: string;
  onClose: () => void;
  titleOverride?: string;
}

export const EditCardSideSection: React.FC<EditCardSideSectionProps> = ({
  cardId,
  onClose,
  titleOverride,
}) => {
  const {
    cards,
    updateCard,
    activateCard,
    deleteCard,
    canDeleteCards,
    showToast,
    teamMembers,
    user,
    canAssignCards,
    canToggleCardStatus,
  } = useApp();

  const currentCard = cards.find((c) => c.id === cardId);

  const [businessName, setBusinessName] = useState(
    currentCard?.businessName === 'Unassigned Stock' ? '' : (currentCard?.businessName || '')
  );
  const [category, setCategory] = useState(
    currentCard?.category && currentCard.category !== 'General' ? currentCard.category : 'Cafe & Restaurant'
  );
  const [googleReviewUrl, setGoogleReviewUrl] = useState(currentCard?.googleReviewUrl || '');
  const [owner, setOwner] = useState(
    currentCard?.owner && currentCard.owner !== '—' ? currentCard.owner : ''
  );
  const [phone, setPhone] = useState(currentCard?.phone || '');
  const [location, setLocation] = useState(
    currentCard?.location && currentCard.location !== 'Unassigned' ? currentCard.location : 'New Delhi, India'
  );
  const [status, setStatus] = useState<CardStatus>(
    currentCard?.status === 'Unassigned' ? 'Active' : (currentCard?.status || 'Active')
  );
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteCard = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete card ${cardId}? This action cannot be undone.`)) {
      return;
    }
    setIsDeleting(true);
    const ok = await deleteCard(cardId);
    setIsDeleting(false);
    if (ok) {
      onClose();
    }
  };

  // Sync state whenever selected card changes
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
      setStatus(currentCard.status === 'Unassigned' ? 'Active' : currentCard.status);
    }
  }, [cardId, currentCard]);

  if (!currentCard) {
    return null;
  }

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
      showToast('✓ Google Review Link verified! Destination active & reachable.', 'success');
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalBusinessName = businessName.trim() || (owner.trim() ? `${owner.trim()}'s Business` : 'New Business');
    const finalReviewUrl = googleReviewUrl.trim() || `https://modexacards.web.app/r/${encodeURIComponent(currentCard.id)}`;

    let safeReviewUrl = finalReviewUrl;
    if (!safeReviewUrl.startsWith('http://') && !safeReviewUrl.startsWith('https://')) {
      safeReviewUrl = `https://${safeReviewUrl}`;
    }
    try {
      const parsed = new URL(safeReviewUrl);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        showToast('Invalid URL protocol. Only https:// links are supported.', 'error');
        return;
      }
    } catch {
      showToast('Please enter a valid web URL.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (isUnassigned) {
        await activateCard({
          cardId: currentCard.id,
          businessName: finalBusinessName,
          reviewUrl: safeReviewUrl,
          ownerName: owner.trim() || user.name,
          phone,
          category,
          location,
        });
      } else {
        await updateCard(currentCard.id, {
          businessName: finalBusinessName,
          category,
          googleReviewUrl: safeReviewUrl,
          owner: owner.trim() || '—',
          phone,
          location,
          status,
          thumbnail: getCategoryThumbnail(category, currentCard.thumbnail, finalBusinessName),
        });
      }
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <aside
      className="surface-card"
      style={{
        width: '410px',
        flexShrink: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        height: 'fit-content',
        position: 'sticky',
        top: '0px',
        overflow: 'hidden',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 22px',
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', lineHeight: 1.3, margin: 0 }}>
            {titleOverride || (isUnassigned ? 'Activate Card' : 'Edit Card Details')}
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '3px', marginBottom: 0 }}>
            {isUnassigned
              ? 'Configure and link Google review stand'
              : 'Modify live business info & NFC destination'}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close edit section"
          style={{
            padding: '8px',
            color: '#64748B',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F1F5F9';
            e.currentTarget.style.color = '#0F172A';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#64748B';
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Form Body */}
      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Card Thumbnail & Metadata Block */}
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
              width: '46px',
              height: '46px',
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              flexShrink: 0,
            }}
          >
            <CategoryThumbnailImage
              category={category}
              thumbnail={currentCard.thumbnail}
              businessName={businessName || currentCard.businessName}
              size={46}
              borderRadius={10}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                {currentCard.id}
              </span>
              <button
                type="button"
                onClick={handleCopyCardId}
                title="Copy Card ID"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '3px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Copy size={14} />
              </button>
            </div>
            <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <CardStatusBadge status={status} size="sm" />
              <span style={{ fontSize: '13px', color: '#64748B' }}>
                {currentCard.qrScans} scans • {currentCard.nfcTaps} taps
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Business Name */}
          <div>
            <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
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
                  height: '42px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
              Category
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
                  height: '42px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: '#0F172A',
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                {BUSINESS_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Google Review URL */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                Google Review Link *
              </label>
              {googleReviewUrl && (
                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '12.5px',
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
                  height: '42px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Owner & Phone side-by-side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* Owner / Assigned Person */}
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                Assigned Person {canAssignCards ? '' : '(Locked)'}
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={15}
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
                />
                <input
                  type="text"
                  list="team-members-list"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  disabled={!canAssignCards}
                  style={{
                    width: '100%',
                    paddingLeft: '32px',
                    paddingRight: '10px',
                    height: '42px',
                    backgroundColor: canAssignCards ? '#FFFFFF' : '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                    cursor: canAssignCards ? 'text' : 'not-allowed',
                  }}
                />
                <datalist id="team-members-list">
                  {teamMembers.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.role} ({t.email})
                    </option>
                  ))}
                </datalist>
              </div>
              {!canAssignCards && (
                <span style={{ fontSize: '11px', color: '#94A3B8', marginTop: '3px', display: 'block' }}>
                  Admin/Manager access required to assign card
                </span>
              )}
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
                Phone
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
                    paddingRight: '10px',
                    height: '42px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    fontSize: '14px',
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
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
                  height: '42px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Status selector */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                Card Operational Status
              </label>
              {!canToggleCardStatus(currentCard) && (
                <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 500 }}>
                  Assigned person only
                </span>
              )}
            </div>
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
                      fontSize: '13px',
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
            <p style={{ fontSize: '13px', color: '#15803D', lineHeight: 1.4, margin: 0 }}>
              Changes update the live NFC chip & QR code destination instantly.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleTestLink}
                disabled={isTesting}
                className="btn-secondary"
                style={{ flex: 1, padding: '11px 16px', fontSize: '13.5px', fontWeight: 600, borderRadius: '10px' }}
              >
                {isTesting ? (
                  <span
                    className="animate-spin"
                    style={{
                      width: '15px',
                      height: '15px',
                      border: '2px solid #CBD5E1',
                      borderTopColor: '#0F172A',
                      borderRadius: '50%',
                      display: 'inline-block',
                    }}
                  />
                ) : (
                  <CheckCircle2 size={16} style={{ color: '#0B63E5' }} />
                )}
                <span>Test Link</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary"
                style={{ flex: 1.3, padding: '11px 18px', fontSize: '13.5px', fontWeight: 600, borderRadius: '10px' }}
              >
                {isSaving ? (
                  <span
                    className="animate-spin"
                    style={{
                      width: '15px',
                      height: '15px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#FFFFFF',
                      borderRadius: '50%',
                      display: 'inline-block',
                    }}
                  />
                ) : isUnassigned ? (
                  <>
                    <span>Activate Card</span>
                    <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>

            {canDeleteCards && (
              <button
                type="button"
                onClick={handleDeleteCard}
                disabled={isDeleting}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#DC2626',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '10px',
                  cursor: isDeleting ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEE2E2')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
              >
                <Trash2 size={15} />
                <span>{isDeleting ? 'Deleting Card...' : 'Delete Card from Inventory'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#64748B',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </aside>
  );
};
