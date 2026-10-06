import React from 'react';
import { Plus, ArrowRight, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/StatCard';
import { CardStatusBadge } from '../components/CardStatusBadge';
import { ScansChart } from '../components/ScansChart';
import { MobileHeader } from '../components/MobileHeader';
import { CategoryThumbnailImage } from '../components/CategoryThumbnailImage';

export const DashboardPage: React.FC = () => {
  const {
    user,
    stats,
    cards,
    openActivateModal,
    navigateTo,
    isMobile,
  } = useApp();

  const handleActivateNewCard = () => {
    const unassigned = cards.find((c) => c.status === 'Unassigned');
    if (unassigned) {
      openActivateModal(unassigned.id);
    } else if (cards.length > 0) {
      openActivateModal(cards[0].id);
    } else {
      navigateTo('create-cards');
    }
  };

  const recentBusinesses = cards
    .filter((c) => c.status !== 'Unassigned')
    .slice(0, 4)
    .map((c) => ({
      id: c.businessId || c.id,
      cardId: c.id,
      name: c.businessName,
      category: c.category,
      status: c.status,
      lastActivity: c.lastActivity,
      thumbnail: c.thumbnail,
    }));

  // ========================================================
  // MOBILE DASHBOARD (matching Reference Image 3 Screen 2)
  // ========================================================
  if (isMobile) {
    return (
      <div style={{ paddingBottom: '90px', backgroundColor: '#FFFFFF', minHeight: '100%' }}>
        <MobileHeader type="dashboard" />

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Big CTA Button matching Reference Image 3 Screen 2 */}
          <button
            type="button"
            onClick={handleActivateNewCard}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px' }}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Activate New Card</span>
          </button>

          {/* 3 Summary Cards in One Horizontal Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <StatCard
              type="active-cards"
              title="Active Cards"
              value={stats.activeCards}
              isCompact
            />
            <StatCard
              type="businesses"
              title="Businesses"
              value={stats.businesses}
              isCompact
            />
            <StatCard
              type="today-scans"
              title="Today's Scans"
              value={stats.todayScans}
              isCompact
            />
          </div>

          {/* Recent Businesses Section */}
          <div style={{ marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                Recent Businesses
              </h2>
              <button
                type="button"
                onClick={() => navigateTo('cards')}
                style={{ fontSize: '12px', fontWeight: 600, color: '#0B63E5', border: 'none', background: 'transparent' }}
              >
                View all
              </button>
            </div>

            {/* Business List Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentBusinesses.length === 0 ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: '#64748B', fontSize: '13px', backgroundColor: '#F8FAFC', borderRadius: '12px' }}>
                  No active businesses yet. Cards will appear here once activated.
                </div>
              ) : (
                recentBusinesses.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigateTo('business-details', item.cardId)}
                    className="surface-card"
                    style={{
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <CategoryThumbnailImage
                        category={item.category}
                        thumbnail={item.thumbnail}
                        businessName={item.name}
                        size={44}
                        borderRadius={10}
                      />
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                          {item.name}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                          <span>{item.cardId}</span>
                          <span>•</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#16A34A', fontWeight: 500 }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
                            <span>Active</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight size={18} style={{ color: '#94A3B8' }} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // DESKTOP DASHBOARD (matching Reference Image 2 Screen 2)
  // ========================================================
  return (
    <div style={{ padding: '32px' }}>
      {/* Header Greeting & CTA Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 500, display: 'block' }}>
            Good Morning,
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {user.name}
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
            Here’s what’s happening with your Google Review Cards today.
          </p>
        </div>

        <button
          type="button"
          onClick={handleActivateNewCard}
          className="btn-primary"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Activate New Card</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-4 gap-5" style={{ marginBottom: '24px' }}>
        <StatCard
          type="active-cards"
          title="Active Cards"
          value={stats.activeCards}
          changeText={stats.activeCardsChange}
        />
        <StatCard
          type="businesses"
          title="Businesses"
          value={stats.businesses}
          changeText={stats.businessesChange}
        />
        <StatCard
          type="today-scans"
          title="Today’s Scans"
          value={stats.todayScans}
          changeText={stats.todayScansChange}
        />
        <StatCard
          type="total-taps"
          title="Total Taps"
          value={stats.totalTaps}
          changeText={stats.totalTapsChange}
        />
      </div>

      {/* Lower Row: Recent Businesses + Scans & Taps Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '24px', alignItems: 'start' }}>
        {/* Recent Businesses Table */}
        <div className="surface-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Recent Businesses
            </h3>
            <button
              type="button"
              onClick={() => navigateTo('cards')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#0B63E5', border: 'none', background: 'transparent' }}
            >
              <span>View all</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '42%' }}>Business</th>
                <th style={{ width: '22%' }}>Card ID</th>
                <th style={{ width: '18%' }}>Status</th>
                <th style={{ width: '18%' }}>Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {recentBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '36px', color: '#64748B', fontSize: '13px' }}>
                    No active businesses yet. Generated cards will appear here once assigned and activated.
                  </td>
                </tr>
              ) : (
                recentBusinesses.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => navigateTo('business-details', item.cardId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CategoryThumbnailImage
                          category={item.category}
                          thumbnail={item.thumbnail}
                          businessName={item.name}
                          size={36}
                          borderRadius={8}
                        />
                        <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '13px' }}>
                          {item.name}
                        </span>
                      </div>
                    </td>

                    <td style={{ color: '#64748B', fontWeight: 500 }}>
                      {item.cardId}
                    </td>

                    <td>
                      <CardStatusBadge status={item.status} size="sm" />
                    </td>

                    <td style={{ color: '#64748B' }}>
                      {item.lastActivity}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Scans & Taps Chart */}
        <div>
          <ScansChart title="Scans & Taps" defaultPeriod="7" />
        </div>
      </div>
    </div>
  );
};
