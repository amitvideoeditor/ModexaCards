import React, { useState } from 'react';
import {
  Store,
  Search,
  CreditCard,
  ChevronRight,
  Star,
  Phone,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MobileHeader } from '../components/MobileHeader';
import { CardStatusBadge } from '../components/CardStatusBadge';

export const BusinessesPage: React.FC = () => {
  const { cards, navigateTo, goBack, showToast, isMobile, globalSearch } = useApp();
  const [searchTerm, setSearchTerm] = useState(globalSearch || '');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Group cards by businessName
  const businessesMap = new Map<string, {
    businessId: string;
    businessName: string;
    category: string;
    location: string;
    owner: string;
    phone?: string;
    thumbnail: string;
    googleReviewUrl: string;
    cards: typeof cards;
    primaryCardId: string;
    activeCardsCount: number;
    totalTaps: number;
    totalScans: number;
    status: 'Active' | 'Unassigned' | 'Inactive';
    rating: number;
    reviewCount: number;
  }>();

  cards.forEach((c) => {
    const key = c.businessName || 'Unassigned Stock';
    if (!businessesMap.has(key)) {
      businessesMap.set(key, {
        businessId: c.businessId || key,
        businessName: c.businessName || 'Unassigned Stock',
        category: c.category || 'Retail & Services',
        location: c.location || 'New Delhi',
        owner: c.owner || '—',
        phone: c.phone,
        thumbnail: c.thumbnail || '',
        googleReviewUrl: c.googleReviewUrl || '',
        cards: [c],
        primaryCardId: c.id,
        activeCardsCount: c.status === 'Active' ? 1 : 0,
        totalTaps: c.nfcTaps,
        totalScans: c.qrScans,
        status: c.status,
        rating: 4.8 + ((c.qrScans % 3) * 0.1),
        reviewCount: Math.round(c.qrScans * 0.45) + 12,
      });
    } else {
      const existing = businessesMap.get(key)!;
      existing.cards.push(c);
      if (c.status === 'Active') existing.activeCardsCount += 1;
      existing.totalTaps += c.nfcTaps;
      existing.totalScans += c.qrScans;
      if (c.status === 'Active') existing.status = 'Active';
    }
  });

  const businessesList = Array.from(businessesMap.values());

  // Distinct categories
  const categories = ['All', ...Array.from(new Set(businessesList.map((b) => b.category).filter(Boolean)))];

  // Filtering
  const term = searchTerm.trim().toLowerCase();
  const filteredBusinesses = businessesList.filter((b) => {
    const matchesSearch =
      !term ||
      b.businessName.toLowerCase().includes(term) ||
      b.category.toLowerCase().includes(term) ||
      b.location.toLowerCase().includes(term) ||
      b.owner.toLowerCase().includes(term);

    const matchesCategory = categoryFilter === 'All' || b.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term) {
      showToast(`Showing ${filteredBusinesses.length} businesses matching "${searchTerm}"`, 'info');
    }
  };

  const totalInteractions = businessesList.reduce((acc, b) => acc + b.totalTaps + b.totalScans, 0);
  const activeBusinessesCount = businessesList.filter((b) => b.status === 'Active').length;

  return (
    <div style={{ minHeight: '100%', backgroundColor: '#F8FAFC' }}>
      {/* Mobile Top Header */}
      {isMobile && (
        <MobileHeader
          type="detail"
          title="Businesses Directory"
          showBack
          onBack={goBack}
          showNotification
        />
      )}

      <div style={{ padding: isMobile ? '16px' : '32px', width: '100%', boxSizing: 'border-box' }}>
        {/* Desktop Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
              Partner Businesses ({businessesList.length})
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '3px', marginBottom: 0 }}>
              Browse partner businesses to view live tap telemetry and active review cards.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => navigateTo('cards')}
              className="btn-secondary"
              style={{ borderRadius: '10px', fontSize: '13px', padding: '9px 16px' }}
            >
              <CreditCard size={15} />
              <span>All Cards ({cards.length})</span>
            </button>
          </div>
        </div>

        {/* High-Level Overview Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: '14px',
            marginBottom: '24px',
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Total Businesses</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{businessesList.length}</div>
            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600, marginTop: '2px' }}>All Delhi NCR Outlets</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Active Outlets</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0B63E5', marginTop: '4px' }}>{activeBusinessesCount}</div>
            <div style={{ fontSize: '11px', color: '#0B63E5', fontWeight: 600, marginTop: '2px' }}>Live NFC Tapcards</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Total Interactions</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>{totalInteractions.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>Taps & Scans Combined</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Average Rating</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#D97706', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>4.9</span>
              <Star size={18} fill="#F59E0B" color="#F59E0B" />
            </div>
            <div style={{ fontSize: '11px', color: '#D97706', fontWeight: 600, marginTop: '2px' }}>On Google Reviews</div>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '16px 20px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          {/* Rounded Pill Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: 1,
              maxWidth: '460px',
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #CBD5E1',
              borderRadius: '28px',
              padding: '4px 6px 4px 14px',
            }}
          >
            <Search size={16} style={{ color: '#64748B', marginRight: '6px', flexShrink: 0 }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search business name, category, location, owner..."
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '13.5px',
                color: '#0F172A',
                outline: 'none',
                minWidth: 0,
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={14} />
              </button>
            )}
            <button
              type="submit"
              className="btn-primary"
              style={{
                borderRadius: '20px',
                padding: '7px 16px',
                fontSize: '12.5px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Search
            </button>
          </form>

          {/* Category Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', maxWidth: '100%' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  border: categoryFilter === cat ? '1.5px solid #0B63E5' : '1px solid #E2E8F0',
                  backgroundColor: categoryFilter === cat ? '#EFF6FF' : '#FFFFFF',
                  color: categoryFilter === cat ? '#0B63E5' : '#475569',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Businesses Directory Grid */}
        {filteredBusinesses.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '60px 24px',
              textAlign: 'center',
            }}
          >
            <Store size={40} style={{ color: '#94A3B8', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
              No Businesses Found
            </h3>
            <p style={{ fontSize: '13.5px', color: '#64748B', maxWidth: '400px', margin: '0 auto 16px' }}>
              No business records match your search criteria. Try a different search query or clear filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('All');
              }}
              className="btn-secondary"
              style={{ borderRadius: '10px' }}
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '20px',
            }}
          >
            {filteredBusinesses.map((b) => (
              <div
                key={b.businessName}
                onClick={() => navigateTo('business-details', b.primaryCardId)}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(11, 99, 229, 0.08)';
                  e.currentTarget.style.borderColor = '#BFDBFE';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.03)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <div>
                  {/* Top Business Card Header: Thumbnail, Name, Status */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={b.thumbnail}
                        alt={b.businessName}
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '14px',
                          objectFit: 'cover',
                          border: '1.5px solid #F1F5F9',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                          {b.businessName}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#0B63E5',
                              backgroundColor: '#EFF6FF',
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            {b.category}
                          </span>
                          <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                            {b.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <CardStatusBadge status={b.status} />
                  </div>

                  {/* Rating & Contact Details */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '10px',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={15} fill="#F59E0B" color="#F59E0B" />
                      <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>{b.rating.toFixed(1)}</span>
                      <span style={{ fontSize: '11.5px', color: '#64748B' }}>({b.reviewCount} reviews)</span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={13} style={{ color: '#64748B' }} />
                      <span>{b.phone || 'Contact on file'}</span>
                    </div>
                  </div>

                  {/* Performance Indicators */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
                    <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '10px' }}>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Assigned Cards</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                        {b.cards.length} {b.cards.length === 1 ? 'Card' : 'Cards'}
                      </div>
                    </div>

                    <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '10px' }}>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>NFC Taps</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#0B63E5', marginTop: '2px' }}>
                        {b.totalTaps}
                      </div>
                    </div>

                    <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '10px' }}>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>QR Scans</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
                        {b.totalScans}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action: View Profile */}
                <div
                  style={{
                    borderTop: '1px solid #F1F5F9',
                    paddingTop: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 600, color: '#64748B' }}>
                    Primary: {b.primaryCardId}
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#0B63E5',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    <span>View Profile & Telemetry</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
