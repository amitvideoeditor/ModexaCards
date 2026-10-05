import React, { useState } from 'react';
import {
  ArrowLeft,
  Pencil,
  Copy,
  QrCode,
  Wifi,
  ExternalLink,
  Ban,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GoogleIcon } from '../components/GoogleIcon';
import { ScansChart } from '../components/ScansChart';
import { MobileHeader } from '../components/MobileHeader';
import { EditCardSideSection } from '../components/EditCardSideSection';

export const BusinessDetailsPage: React.FC = () => {
  const {
    cards,
    selectedCardId,
    navigateTo,
    openChangeLinkModal,
    openDisableCardModal,
    showToast,
    isMobile,
  } = useApp();

  const [isEditingSectionOpen, setIsEditingSectionOpen] = useState(false);

  const currentCard =
    cards.find((c) => c.id === selectedCardId) ||
    cards.find((c) => c.id === 'CRD-0042') ||
    cards[0];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'info');
  };

  if (!currentCard) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', backgroundColor: '#F8FAFC', minHeight: '60vh' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
          No Business Selected
        </h2>
        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>
          There are currently no assigned cards in inventory to view.
        </p>
        <button
          type="button"
          onClick={() => navigateTo('cards')}
          className="btn-primary"
          style={{ padding: '10px 20px', borderRadius: '10px' }}
        >
          Return to Cards
        </button>
      </div>
    );
  }

  const isInactive = currentCard.status === 'Inactive';

  // ========================================================
  // MOBILE BUSINESS DETAILS (matching Reference Image 3 Screen 4)
  // ========================================================
  if (isMobile) {
    return (
      <div style={{ paddingBottom: '90px', backgroundColor: '#FFFFFF', minHeight: '100%' }}>
        <MobileHeader
          type="detail"
          title={currentCard.businessName}
          showBack
          onBack={() => navigateTo('businesses')}
          showMenu
          onMenuClick={() => showToast('Card Actions: Sharma Cafe (CRD-0042) is live and operational.', 'info')}
        />

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Top Business Card */}
          <div
            className="surface-card"
            style={{
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={currentCard.thumbnail}
                alt={currentCard.businessName}
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  border: '1px solid #E2E8F0',
                  flexShrink: 0,
                }}
              />
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                  {currentCard.businessName}
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  {currentCard.category} • {currentCard.location}
                </p>
              </div>
            </div>

            <ChevronRight size={18} style={{ color: '#94A3B8' }} />
          </div>

          {/* Card Info Section (Card ID & Status) */}
          <div
            className="surface-card"
            style={{
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#64748B' }}>Card:</span>
              <strong style={{ color: '#0F172A' }}>{currentCard.id}</strong>
              <button
                type="button"
                onClick={() => handleCopy(currentCard.id, 'Card ID')}
                style={{ color: '#94A3B8', padding: '2px', border: 'none', background: 'transparent' }}
              >
                <Copy size={13} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#64748B' }}>Status:</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontWeight: 600,
                  color: isInactive ? '#64748B' : '#16A34A',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isInactive ? '#94A3B8' : '#22C55E',
                  }}
                />
                <span>{isInactive ? 'Inactive' : 'Active'}</span>
              </span>
            </div>
          </div>

          {/* Two Stat Cards (QR Scans & NFC Taps) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div className="surface-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QrCode size={18} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>QR Scans</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>
                  {currentCard.qrScans}
                </div>
              </div>
            </div>

            <div className="surface-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wifi size={18} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>NFC Taps</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>
                  {currentCard.nfcTaps}
                </div>
              </div>
            </div>
          </div>

          {/* Google Review Destination */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
              Google Review Destination
            </label>
            <div
              className="surface-card"
              style={{
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <GoogleIcon size={18} />
              <span style={{ fontSize: '13px', color: '#0F172A', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {currentCard.googleReviewUrl}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(currentCard.googleReviewUrl || '', 'Destination URL')}
                style={{ color: '#94A3B8', padding: '2px', border: 'none', background: 'transparent' }}
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          {/* Green Card Live Banner matching Mobile Screen 4 */}
          {!isInactive && (
            <div
              style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <CheckCircle2 size={20} style={{ color: '#059669', flexShrink: 0, marginTop: '1px' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#065F46' }}>
                  Card Live
                </div>
                <div style={{ fontSize: '12px', color: '#047857', marginTop: '2px', lineHeight: 1.4 }}>
                  This card is active and redirecting to your Google review page.
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={() => openChangeLinkModal(currentCard.id)}
              className="btn-blue-outline"
              style={{ padding: '10px', fontSize: '13px', borderRadius: '10px' }}
            >
              <ExternalLink size={14} />
              <span>Change Link</span>
            </button>

            <button
              type="button"
              onClick={() => openDisableCardModal(currentCard.id)}
              className={isInactive ? 'btn-secondary' : 'btn-danger-outline'}
              style={{ padding: '10px', fontSize: '13px', borderRadius: '10px' }}
            >
              <Ban size={14} />
              <span>{isInactive ? 'Enable Card' : 'Disable Card'}</span>
            </button>
          </div>

          {/* Business-Specific Tap & Scan History (Mobile - only place where taps/scans history appears) */}
          <div className="surface-card" style={{ padding: '16px', marginTop: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Customer Tap & Scan History
                </h4>
                <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Live contactless interactions for this business
                </p>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '2px 7px', borderRadius: '9999px' }}>
                Live Stream
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'm-ts-1', type: 'NFC Tap', source: 'Front Counter Stand', dateTime: 'Just now', device: 'iPhone 15 Pro' },
                { id: 'm-ts-2', type: 'QR Scan', source: 'Acrylic Table Standee', dateTime: '14 mins ago', device: 'Samsung Galaxy S24' },
                { id: 'm-ts-3', type: 'NFC Tap', source: 'Billing Desk Card', dateTime: '38 mins ago', device: 'Google Pixel 8' },
                { id: 'm-ts-4', type: 'NFC Tap', source: 'Front Counter Stand', dateTime: '1 hour ago', device: 'OnePlus 12' },
                { id: 'm-ts-5', type: 'QR Scan', source: 'Window Sticker QR', dateTime: '2 hours ago', device: 'iPhone 14' },
              ].map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        backgroundColor: item.type === 'NFC Tap' ? '#DCFCE7' : '#DBEAFE',
                        color: item.type === 'NFC Tap' ? '#16A34A' : '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.type === 'NFC Tap' ? <Wifi size={14} /> : <QrCode size={14} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '12px' }}>
                        {item.type} • {item.device}
                      </div>
                      <div style={{ color: '#64748B', fontSize: '10.5px' }}>{item.source}</div>
                    </div>
                  </div>

                  <span style={{ color: '#64748B', fontSize: '11px', whiteSpace: 'nowrap' }}>
                    {item.dateTime}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // DESKTOP BUSINESS DETAILS
  // ========================================================
  return (
    <div style={{ padding: '24px 32px' }}>
      {/* Main Split Layout: Business Details (Left) + Edit Section (Right when editing) */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top Breadcrumb & Action Button inside 1st Section (Ends at end of 1st section) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => navigateTo('businesses')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#64748B', cursor: 'pointer', border: 'none', background: 'transparent' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Businesses</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEditingSectionOpen((prev) => !prev)}
              className={isEditingSectionOpen ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              <Pencil size={13} />
              <span>{isEditingSectionOpen ? 'Close Edit Panel' : 'Edit Business'}</span>
            </button>
          </div>

          {/* Business Profile Banner Card */}
          <div className="surface-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          {/* Left: Thumbnail & Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <img
              src={currentCard.thumbnail}
              alt={currentCard.businessName}
              style={{
                width: '120px',
                height: '84px',
                borderRadius: '12px',
                objectFit: 'cover',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                flexShrink: 0,
              }}
            />

            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {currentCard.businessName}
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>
                {currentCard.category} • {currentCard.location}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                {/* Card ID */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '4px 10px', borderRadius: '6px' }}>
                  <span>Card ID:</span>
                  <strong style={{ color: '#0F172A' }}>{currentCard.id}</strong>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentCard.id, 'Card ID')}
                    style={{ color: '#94A3B8', display: 'flex', alignItems: 'center', marginLeft: '2px', cursor: 'pointer', border: 'none', background: 'transparent' }}
                  >
                    <Copy size={13} />
                  </button>
                </div>

                {/* Status */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: isInactive ? '#94A3B8' : '#22C55E',
                    }}
                  />
                  <span style={{ color: isInactive ? '#64748B' : '#16A34A' }}>
                    {isInactive ? 'Inactive' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick Stats (QR Scans & NFC Taps) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* QR Scans */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '12px 18px',
                borderRadius: '12px',
                minWidth: '140px',
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <QrCode size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 500, color: '#64748B' }}>QR Scans</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>
                  {currentCard.qrScans}
                </div>
              </div>
            </div>

            {/* NFC Taps */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '12px 18px',
                borderRadius: '12px',
                minWidth: '140px',
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wifi size={20} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 500, color: '#64748B' }}>NFC Taps</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', lineHeight: 1.1 }}>
                  {currentCard.nfcTaps}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Google Review Destination Bar */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '8px' }}>
            Google Review Destination:
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '320px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px 14px', borderRadius: '8px' }}>
              <GoogleIcon size={18} />
              <span style={{ fontSize: '13px', color: '#0F172A', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {currentCard.googleReviewUrl}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(currentCard.googleReviewUrl || '', 'Destination URL')}
                style={{ color: '#94A3B8', padding: '4px', cursor: 'pointer', border: 'none', background: 'transparent' }}
              >
                <Copy size={15} />
              </button>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => openChangeLinkModal(currentCard.id)}
                className="btn-blue-outline"
              >
                <ExternalLink size={14} />
                <span>Change Link</span>
              </button>

              <button
                type="button"
                onClick={() => openDisableCardModal(currentCard.id)}
                className={isInactive ? 'btn-secondary' : 'btn-danger-outline'}
              >
                <Ban size={14} />
                <span>{isInactive ? 'Enable Card' : 'Disable Card'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Row: Scan & Tap Activity (30 days) + Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '24px', alignItems: 'start' }}>
        {/* Chart */}
        <div>
          <ScansChart title="Scan & Tap Activity" defaultPeriod="30" />
        </div>

        {/* NFC Tap & QR Scan History for this Business */}
        <div className="surface-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                NFC Tap & QR Scan History
              </h3>
              <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0 0' }}>
                Customer contactless interactions for this business
              </p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '9999px' }}>
              Live Stream
            </span>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Method</th>
                <th style={{ width: '35%' }}>Customer Device</th>
                <th style={{ width: '25%' }}>Hardware Source</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'd-ts-1', type: 'NFC Tap', source: 'Front Counter Stand', dateTime: 'Just now', device: 'iPhone 15 Pro' },
                { id: 'd-ts-2', type: 'QR Scan', source: 'Acrylic Table Standee', dateTime: '14 mins ago', device: 'Samsung Galaxy S24' },
                { id: 'd-ts-3', type: 'NFC Tap', source: 'Billing Desk Card', dateTime: '38 mins ago', device: 'Google Pixel 8' },
                { id: 'd-ts-4', type: 'NFC Tap', source: 'Front Counter Stand', dateTime: '1 hour ago', device: 'OnePlus 12' },
                { id: 'd-ts-5', type: 'QR Scan', source: 'Window Sticker QR', dateTime: '2 hours ago', device: 'iPhone 14' },
              ].map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#0F172A' }}>
                      {item.type === 'QR Scan' ? (
                        <QrCode size={14} style={{ color: '#0B63E5' }} />
                      ) : (
                        <Wifi size={14} style={{ color: '#16A34A' }} />
                      )}
                      <span>{item.type}</span>
                    </div>
                  </td>
                  <td style={{ color: '#334155', fontWeight: 500 }}>{item.device}</td>
                  <td style={{ color: '#64748B' }}>{item.source}</td>
                  <td style={{ color: '#64748B', whiteSpace: 'nowrap', textAlign: 'right' }}>{item.dateTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Right Column: Embedded Edit Section */}
    {isEditingSectionOpen && (
      <EditCardSideSection
        cardId={currentCard.id}
        onClose={() => setIsEditingSectionOpen(false)}
        titleOverride="Edit Business Profile"
      />
    )}
  </div>
</div>
);
};
