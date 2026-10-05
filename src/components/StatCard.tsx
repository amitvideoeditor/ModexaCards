import React from 'react';
import { CreditCard, Store, BarChart3, Wifi } from 'lucide-react';

export type StatType = 'active-cards' | 'businesses' | 'today-scans' | 'total-taps';

interface StatCardProps {
  type: StatType;
  title: string;
  value: number | string;
  changeText?: string;
  isCompact?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  type,
  title,
  value,
  changeText,
  isCompact = false,
  className = '',
}) => {
  const getTheme = () => {
    switch (type) {
      case 'active-cards':
        return {
          icon: CreditCard,
          bg: '#DCFCE7', // soft green
          color: '#16A34A',
        };
      case 'businesses':
        return {
          icon: Store,
          bg: '#F3E8FF', // soft purple
          color: '#7E22CE',
        };
      case 'today-scans':
        return {
          icon: BarChart3,
          bg: '#FFEDD5', // soft orange
          color: '#EA580C',
        };
      case 'total-taps':
        return {
          icon: Wifi,
          bg: '#DBEAFE', // soft blue
          color: '#2563EB',
        };
    }
  };

  const theme = getTheme();
  const IconComponent = theme.icon;

  if (isCompact) {
    return (
      <div
        className={className}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '12px 10px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '94px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.bg,
            marginBottom: '8px',
          }}
        >
          <IconComponent size={16} style={{ color: theme.color }} />
        </div>
        <div>
          <div
            style={{
              fontSize: '11px',
              color: '#64748B',
              fontWeight: 500,
              lineHeight: 1.2,
              marginBottom: '4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0F172A',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {value}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.bg,
          }}
        >
          <IconComponent size={20} style={{ color: theme.color }} />
        </div>
      </div>

      <div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: '#64748B', marginBottom: '4px' }}>
          {title}
        </div>
        <div style={{ fontSize: '26px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {value}
        </div>

        {changeText && (
          <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 500, color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{changeText}</span>
          </div>
        )}
      </div>
    </div>
  );
};
