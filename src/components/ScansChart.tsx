import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { sevenDaysChartData, thirtyDaysChartData, type ChartDayData } from '../data/mockData';

interface ScansChartProps {
  title?: string;
  defaultPeriod?: '7' | '30';
  className?: string;
}

export const ScansChart: React.FC<ScansChartProps> = ({
  title = 'Scans & Taps',
  defaultPeriod = '7',
  className = '',
}) => {
  const [period, setPeriod] = useState<'7' | '30'>(defaultPeriod);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data: ChartDayData[] = period === '7' ? sevenDaysChartData : thirtyDaysChartData;
  const maxY = 80;
  const yTicks = [80, 60, 40, 20, 0];

  return (
    <div
      className={`surface-card ${className}`}
      style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
          {title}
        </h3>

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setPeriod((prev) => (prev === '7' ? '30' : '7'))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 500,
              color: '#0F172A',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '6px 10px',
              cursor: 'pointer',
            }}
          >
            <span>{period === '7' ? 'Last 7 days' : 'Last 30 days'}</span>
            <ChevronDown size={14} style={{ color: '#64748B' }} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#64748B', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#93C5FD', display: 'inline-block' }} />
          <span>QR Scans</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#1D4ED8', display: 'inline-block' }} />
          <span>NFC Taps</span>
        </div>
      </div>

      {/* Chart Graphic Area */}
      <div style={{ position: 'relative', height: '160px', width: '100%', marginTop: '6px' }}>
        {/* Y Axis Grid & Labels */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
          {yTicks.map((val) => (
            <div key={val} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#94A3B8', width: '22px', textAlign: 'right', flexShrink: 0 }}>
                {val}
              </span>
              <div style={{ width: '100%', height: '1px', backgroundColor: '#F1F5F9', marginLeft: '8px' }} />
            </div>
          ))}
        </div>

        {/* Bar Columns Container */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            marginLeft: '30px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            paddingTop: '6px',
            paddingBottom: '22px',
            paddingRight: '6px',
          }}
        >
          {data.map((item, idx) => {
            const tapHeightPct = (item.nfcTaps / maxY) * 100;
            const scanHeightPct = (item.qrScans / maxY) * 100;
            const totalHeightPct = Math.min(100, tapHeightPct + scanHeightPct);
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={item.label}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  height: '100%',
                  flex: 1,
                  maxWidth: period === '7' ? '32px' : '14px',
                  margin: '0 3px',
                  cursor: 'pointer',
                }}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '105%',
                      zIndex: 30,
                      backgroundColor: '#0F172A',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      pointerEvents: 'none',
                      whiteSpace: 'nowrap',
                      marginBottom: '4px',
                    }}
                  >
                    <div style={{ fontWeight: 600, color: '#E2E8F0' }}>{item.label}</div>
                    <div style={{ color: '#93C5FD' }}>QR Scans: {item.qrScans}</div>
                    <div style={{ color: '#93C5FD' }}>NFC Taps: {item.nfcTaps}</div>
                    <div style={{ fontWeight: 700, borderTop: '1px solid #334155', marginTop: '2px', paddingTop: '2px' }}>
                      Total: {item.qrScans + item.nfcTaps}
                    </div>
                  </div>
                )}

                {/* Stacked Bar with Rounded Top */}
                <div
                  style={{
                    width: '100%',
                    height: `${totalHeightPct}%`,
                    borderTopLeftRadius: '4px',
                    borderTopRightRadius: '4px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    transform: isHovered ? 'scaleY(1.03)' : 'none',
                    filter: isHovered ? 'brightness(1.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Top: QR Scans (light sky blue) */}
                  <div
                    style={{
                      height: `${(scanHeightPct / (tapHeightPct + scanHeightPct)) * 100}%`,
                      backgroundColor: '#93C5FD',
                      width: '100%',
                    }}
                  />
                  {/* Bottom: NFC Taps (royal deep blue) */}
                  <div
                    style={{
                      height: `${(tapHeightPct / (tapHeightPct + scanHeightPct)) * 100}%`,
                      backgroundColor: '#1D4ED8',
                      width: '100%',
                    }}
                  />
                </div>

                {/* X-axis date label */}
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-18px',
                    fontSize: '10px',
                    fontWeight: 500,
                    color: '#64748B',
                    whiteSpace: 'nowrap',
                    display:
                      period === '30' && idx % 4 !== 0 && idx !== data.length - 1
                        ? 'none'
                        : 'block',
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
