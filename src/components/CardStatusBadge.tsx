import React from 'react';
import type { CardStatus } from '../types';

interface CardStatusBadgeProps {
  status: CardStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const CardStatusBadge: React.FC<CardStatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const styles = {
    Active: {
      bg: '#DCFCE7',
      text: '#15803D',
      dot: '#22C55E',
      label: 'Active',
    },
    Unassigned: {
      bg: '#FEF3C7',
      text: '#B45309',
      dot: '#F59E0B',
      label: 'Unassigned',
    },
    Inactive: {
      bg: '#F1F5F9',
      text: '#64748B',
      dot: '#94A3B8',
      label: 'Inactive',
    },
  }[status];

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-[11px] gap-1.5'
    : 'px-2.5 py-1 text-[12px] gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClasses} ${className}`}
      style={{
        backgroundColor: styles.bg,
        color: styles.text,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: styles.dot }}
      />
      <span>{styles.label}</span>
    </span>
  );
};
