import React, { useState } from 'react';
import {
  TrendingUp,
  Download,
  Smartphone,
  Star,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Wifi,
  QrCode,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sevenDaysChartData, thirtyDaysChartData } from '../data/mockData';
import { CategoryThumbnailImage } from '../components/CategoryThumbnailImage';

export const AnalyticsPage: React.FC = () => {
  const { cards, stats, navigateTo, showToast, isMobile } = useApp();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'today'>('7d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const chartData = timeRange === '30d' ? thirtyDaysChartData : sevenDaysChartData;

  const totalChartScans = chartData.reduce((acc, curr) => acc + curr.qrScans, 0);
  const totalChartTaps = chartData.reduce((acc, curr) => acc + curr.nfcTaps, 0);
  const totalInteractions = totalChartScans + totalChartTaps;
  const nfcPercentage = Math.round((totalChartTaps / totalInteractions) * 100) || 68;

  const handleExportCSV = () => {
    showToast('Analytics report for ' + (timeRange === 'today' ? 'Today' : timeRange === '7d' ? 'Last 7 Days' : 'Last 30 Days') + ' downloaded as CSV.', 'success');
  };

  const filteredCards = cards.filter((c) => {
    if (selectedCategory === 'all') return true;
    return Boolean(c.category && c.category.toLowerCase().includes(selectedCategory.toLowerCase()));
  });

  // Calculate highest values for chart scaling
  const maxDayVal = Math.max(...chartData.map((d) => Math.max(d.qrScans, d.nfcTaps)), 1);

  return (
    <div style={{ padding: isMobile ? '16px' : '32px', backgroundColor: '#F8FAFC', minHeight: '100%' }}>
      {/* Header with Title and Range Filters */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
              Analytics & Insights
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#16A34A',
                backgroundColor: '#DCFCE7',
                padding: '2px 8px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
              Live Sync
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
            Comprehensive telemetry across {stats.activeCards} active Google Review NFC cards & {stats.businesses} registered venues.
          </p>
        </div>

        {/* Right Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Timeframe Pill Selector */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            {(['today', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '7px',
                  fontSize: '12px',
                  fontWeight: timeRange === range ? 600 : 500,
                  color: timeRange === range ? '#0B63E5' : '#64748B',
                  backgroundColor: timeRange === range ? '#EFF6FF' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {range === 'today' ? 'Today' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>

          {/* Export Report CTA */}
          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#334155',
              padding: '8px 14px',
              borderRadius: '9px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Performance KPI Cards (2x2 Grid on Mobile) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '10px' : '16px',
          marginBottom: '24px',
        }}
      >
        {/* Total Engagements */}
        <div className="surface-card" style={{ padding: isMobile ? '12px 14px' : '20px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: isMobile ? '11.5px' : '13px', fontWeight: 600, color: '#64748B' }}>Total Interactions</span>
            <div style={{ width: isMobile ? '30px' : '36px', height: isMobile ? '30px' : '36px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#0B63E5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp size={isMobile ? 15 : 18} />
            </div>
          </div>
          <div style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 700, color: '#0F172A', marginTop: isMobile ? '8px' : '12px' }}>
            {totalInteractions.toLocaleString()}
          </div>
          <div style={{ fontSize: isMobile ? '10.5px' : '12px', color: '#16A34A', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ArrowUpRight size={isMobile ? 12 : 14} />
            <span>+24.5% vs previous period</span>
          </div>
        </div>

        {/* NFC Tap Dominance */}
        <div className="surface-card" style={{ padding: isMobile ? '12px 14px' : '20px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: isMobile ? '11.5px' : '13px', fontWeight: 600, color: '#64748B' }}>NFC Tap Rate</span>
            <div style={{ width: isMobile ? '30px' : '36px', height: isMobile ? '30px' : '36px', borderRadius: '8px', backgroundColor: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Wifi size={isMobile ? 15 : 18} />
            </div>
          </div>
          <div style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 700, color: '#0F172A', marginTop: isMobile ? '8px' : '12px' }}>
            {nfcPercentage}%
          </div>
          <div style={{ fontSize: isMobile ? '10.5px' : '12px', color: '#64748B', fontWeight: 500, marginTop: '4px', lineHeight: 1.3 }}>
            {totalChartTaps} NFC taps vs {totalChartScans} QR scans
          </div>
        </div>

        {/* Google Reviews Generated */}
        <div className="surface-card" style={{ padding: isMobile ? '12px 14px' : '20px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: isMobile ? '11.5px' : '13px', fontWeight: 600, color: '#64748B' }}>Reviews Generated</span>
            <div style={{ width: isMobile ? '30px' : '36px', height: isMobile ? '30px' : '36px', borderRadius: '8px', backgroundColor: '#FEF9C3', color: '#CA8A04', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Star size={isMobile ? 15 : 18} />
            </div>
          </div>
          <div style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 700, color: '#0F172A', marginTop: isMobile ? '8px' : '12px' }}>
            486
          </div>
          <div style={{ fontSize: isMobile ? '10.5px' : '12px', color: '#16A34A', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ArrowUpRight size={isMobile ? 12 : 14} />
            <span>26.4% conversion from tap</span>
          </div>
        </div>

        {/* Rating Growth */}
        <div className="surface-card" style={{ padding: isMobile ? '12px 14px' : '20px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: isMobile ? '11.5px' : '13px', fontWeight: 600, color: '#64748B' }}>Avg Venue Rating</span>
            <div style={{ width: isMobile ? '30px' : '36px', height: isMobile ? '30px' : '36px', borderRadius: '8px', backgroundColor: '#FAF5FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={isMobile ? 15 : 18} />
            </div>
          </div>
          <div style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 700, color: '#0F172A', marginTop: isMobile ? '8px' : '12px' }}>
            4.8 ★
          </div>
          <div style={{ fontSize: isMobile ? '10.5px' : '12px', color: '#16A34A', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ArrowUpRight size={isMobile ? 12 : 14} />
            <span>+0.6★ rating boost</span>
          </div>
        </div>
      </div>

      {/* Main Visuals Row: Interactive Interaction Chart + Device Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '8fr 4fr',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {/* Interactive Growth Bar Chart */}
        <div className="surface-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                NFC Taps & QR Scans Trend
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', marginBottom: 0 }}>
                Day-by-day comparison of NFC contactless taps against QR camera scans
              </p>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#0B63E5' }} />
                <span>NFC Taps ({totalChartTaps})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#94A3B8' }} />
                <span>QR Scans ({totalChartScans})</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div
            style={{
              height: '240px',
              display: 'flex',
              alignItems: 'flex-end',
              gap: timeRange === '30d' ? '4px' : '18px',
              paddingTop: '20px',
              borderBottom: '1px solid #E2E8F0',
            }}
          >
            {chartData.map((d, idx) => {
              const tapHeight = Math.round((d.nfcTaps / maxDayVal) * 180);
              const qrHeight = Math.round((d.qrScans / maxDayVal) * 180);

              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                  title={`${d.label}: ${d.nfcTaps} NFC Taps, ${d.qrScans} QR Scans`}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', width: '100%', justifyContent: 'center' }}>
                    {/* NFC Tap Bar */}
                    <div
                      style={{
                        width: timeRange === '30d' ? '6px' : '14px',
                        height: `${Math.max(tapHeight, 8)}px`,
                        backgroundColor: '#0B63E5',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease',
                      }}
                    />
                    {/* QR Scan Bar */}
                    <div
                      style={{
                        width: timeRange === '30d' ? '6px' : '14px',
                        height: `${Math.max(qrHeight, 6)}px`,
                        backgroundColor: '#CBD5E1',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease',
                      }}
                    />
                  </div>
                  {/* Label */}
                  {timeRange === '7d' && (
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginTop: '8px' }}>
                      {d.label}
                    </span>
                  )}
                  {timeRange === '30d' && idx % 5 === 0 && (
                    <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 500, marginTop: '8px' }}>
                      {d.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              Peak Traffic Day: <strong>Friday (Apr 16) with 83 total engagements</strong>
            </span>
            <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>
              99.8% Successful Google Redirects
            </span>
          </div>
        </div>

        {/* Device & Platform Breakdown */}
        <div className="surface-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Customer Hardware Share
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', marginBottom: '20px' }}>
              Detected OS & device type during card interactions
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Apple iOS */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Smartphone size={15} style={{ color: '#0B63E5' }} /> Apple iPhone (iOS NFC)
                  </span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>58%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '58%', height: '100%', backgroundColor: '#0B63E5', borderRadius: '9999px' }} />
                </div>
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                  Native background NFC tag reader
                </span>
              </div>

              {/* Android */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Wifi size={15} style={{ color: '#16A34A' }} /> Android (Samsung / Pixel / 1+)
                  </span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>34%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '34%', height: '100%', backgroundColor: '#16A34A', borderRadius: '9999px' }} />
                </div>
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                  Instant Chrome direct deep-link
                </span>
              </div>

              {/* Camera QR */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <QrCode size={15} style={{ color: '#64748B' }} /> Camera QR Fallback
                  </span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>8%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '8%', height: '100%', backgroundColor: '#94A3B8', borderRadius: '9999px' }} />
                </div>
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                  Printed high-contrast QR backplate
                </span>
              </div>
            </div>
          </div>

          {/* Smart Routing Insight Box */}
          <div
            style={{
              marginTop: '20px',
              padding: '12px 14px',
              backgroundColor: '#EFF6FF',
              borderRadius: '10px',
              border: '1px solid #BFDBFE',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} />
              <span>Smart Routing Active</span>
            </div>
            <p style={{ fontSize: '11px', color: '#1E3A8A', margin: '4px 0 0', lineHeight: 1.4 }}>
              Negative rating shielding filtered 14 low ratings away from public Google Maps into private owner feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Top Venues Performance Leaderboard */}
      <div className="surface-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Venue Performance Leaderboard
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', marginBottom: 0 }}>
              Ranking locations by customer volume, NFC taps, and Google Review conversions
            </p>
          </div>

          {/* Filter by Category */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'Cafe', 'Salon', 'Clinic', 'Restaurant'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: selectedCategory === cat ? 600 : 500,
                  backgroundColor: selectedCategory === cat ? '#0B63E5' : '#F1F5F9',
                  color: selectedCategory === cat ? '#FFFFFF' : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Venue & Location</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Card ID</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Total Taps</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>QR Scans</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Est. Google Reviews</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Conversion Rate</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.map((card) => {
                const total = card.nfcTaps + card.qrScans;
                const estReviews = Math.round(total * 0.28);
                const convRate = total > 0 ? Math.round((estReviews / total) * 100) : 0;

                return (
                  <tr
                    key={card.id}
                    style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                    className="hover:bg-slate-50"
                  >
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CategoryThumbnailImage
                          category={card.category}
                          thumbnail={card.thumbnail}
                          businessName={card.businessName}
                          size={36}
                          borderRadius={8}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>{card.businessName}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{card.location}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: '#0B63E5', backgroundColor: '#EFF6FF', padding: '3px 8px', borderRadius: '6px' }}>
                        {card.id}
                      </span>
                    </td>
                    <td style={{ padding: '14px', fontWeight: 600, color: '#0F172A' }}>
                      {card.nfcTaps}
                    </td>
                    <td style={{ padding: '14px', color: '#64748B' }}>
                      {card.qrScans}
                    </td>
                    <td style={{ padding: '14px', fontWeight: 600, color: '#16A34A' }}>
                      +{estReviews} reviews
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '60px', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${convRate}%`, height: '100%', backgroundColor: '#0B63E5', borderRadius: '9999px' }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>{convRate}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => navigateTo('business-details', card.id)}
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#0B63E5',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>Inspect</span>
                        <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
