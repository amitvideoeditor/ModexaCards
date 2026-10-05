import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  CreditCard,
  UserPlus,
  Shield,
  Link2,
  AlertTriangle,
  Search,
  Download,
  ExternalLink,
  Users,
  RefreshCw,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ActivityType } from '../types';

export const ActivityPage: React.FC = () => {
  const {
    activities,
    navigateTo,
    showToast,
    isMobile,
    cards,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [isLiveActive, setIsLiveActive] = useState(true);

  const q = searchQuery.trim().toLowerCase();
  const filteredActivities = activities.filter((act) => {
    const card = cards.find(
      (c) =>
        c.id.toLowerCase() === act.cardId.toLowerCase() ||
        (act.businessName && c.businessName && c.businessName.toLowerCase() === act.businessName.toLowerCase())
    );
    const matchesCategory = Boolean(card && card.category && card.category.toLowerCase().includes(q));

    const matchesSearch =
      !q ||
      (act.businessName && act.businessName.toLowerCase().includes(q)) ||
      act.cardId.toLowerCase().includes(q) ||
      act.source.toLowerCase().includes(q) ||
      (act.performer && act.performer.toLowerCase().includes(q)) ||
      (act.location && act.location.toLowerCase().includes(q)) ||
      matchesCategory;

    const matchesType = selectedType === 'All' || act.type === selectedType;

    return matchesSearch && matchesType;
  });

  const handleExportCSV = () => {
    showToast(`Exported ${filteredActivities.length} management audit logs as CSV.`, 'success');
  };

  const getActivityBadge = (type: ActivityType) => {
    switch (type) {
      case 'Card Activated':
        return {
          icon: CheckCircle2,
          bg: '#ECFDF5',
          color: '#059669',
          border: '#A7F3D0',
          label: 'Card Activated',
        };
      case 'Card Assigned':
        return {
          icon: CreditCard,
          bg: '#EFF6FF',
          color: '#1D4ED8',
          border: '#BFDBFE',
          label: 'Card Assigned',
        };
      case 'Card Disabled':
        return {
          icon: AlertTriangle,
          bg: '#FEF2F2',
          color: '#DC2626',
          border: '#FECACA',
          label: 'Card Disabled',
        };
      case 'Member Joined':
        return {
          icon: UserPlus,
          bg: '#FAF5FF',
          color: '#7E22CE',
          border: '#E9D5FF',
          label: 'Member Joined',
        };
      case 'Role Updated':
        return {
          icon: Shield,
          bg: '#EEF2FF',
          color: '#4F46E5',
          border: '#C7D2FE',
          label: 'Role Updated',
        };
      case 'Link Updated':
        return {
          icon: Link2,
          bg: '#F0FDFA',
          color: '#0D9488',
          border: '#99F6E4',
          label: 'Link Changed',
        };
      default:
        return {
          icon: Activity,
          bg: '#F8FAFC',
          color: '#475569',
          border: '#E2E8F0',
          label: type,
        };
    }
  };

  const activatedCount = activities.filter((a) => a.type === 'Card Activated').length;
  const assignedCount = activities.filter((a) => a.type === 'Card Assigned').length;
  const disabledCount = activities.filter((a) => a.type === 'Card Disabled').length;

  return (
    <div style={{ padding: isMobile ? '16px' : '32px', backgroundColor: '#F8FAFC', minHeight: '100%' }}>
      {/* Header */}
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
              System & Team Activity Log
            </h1>
            <button
              type="button"
              onClick={() => {
                setIsLiveActive(!isLiveActive);
                showToast(isLiveActive ? 'Audit stream paused.' : 'Audit stream resumed.', 'info');
              }}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: isLiveActive ? '#16A34A' : '#64748B',
                backgroundColor: isLiveActive ? '#DCFCE7' : '#F1F5F9',
                border: isLiveActive ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
                padding: '2px 8px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isLiveActive ? '#22C55E' : '#94A3B8',
                }}
              />
              <span>{isLiveActive ? 'Audit Stream Live' : 'Stream Paused'}</span>
            </button>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
            Audit history of card activations, team member allocations, deactivated cards, and permission updates.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => showToast('Activity log refreshed.', 'info')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#0B63E5',
              padding: '8px 14px',
              borderRadius: '9px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} />
            <span>Refresh Audit Log</span>
          </button>

          {/* Export CSV */}
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
            }}
          >
            <Download size={14} />
            <span>Export Log</span>
          </button>
        </div>
      </div>

      {/* 4 Management Metrics - Strictly NO taps and NO scans */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="surface-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>Total Events</span>
            <Activity size={18} style={{ color: '#0B63E5' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginTop: '8px' }}>
            {activities.length}
          </div>
          <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 500 }}>System audit records</span>
        </div>

        <div className="surface-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>Cards Activated</span>
            <CheckCircle2 size={18} style={{ color: '#16A34A' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginTop: '8px' }}>
            {activatedCount}
          </div>
          <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 500 }}>Successfully linked</span>
        </div>

        <div className="surface-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>Cards Assigned</span>
            <CreditCard size={18} style={{ color: '#7C3AED' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginTop: '8px' }}>
            {assignedCount}
          </div>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Allocated to agents</span>
        </div>

        <div className="surface-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>Cards Deactivated</span>
            <AlertTriangle size={18} style={{ color: '#DC2626' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginTop: '8px' }}>
            {disabledCount}
          </div>
          <span style={{ fontSize: '11px', color: '#64748B' }}>Retired or paused cards</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="surface-card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        {/* Search Input with 28px rounded pill & Search button */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) {
              showToast(`Found ${filteredActivities.length} logs matching "${searchQuery}"`, 'info');
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: isMobile ? '100%' : '380px',
            backgroundColor: '#F8FAFC',
            border: '1.5px solid #CBD5E1',
            borderRadius: '28px',
            padding: '3px 4px 3px 14px',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <Search size={16} style={{ color: '#64748B', flexShrink: 0, marginRight: '4px' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search venue, card, or agent name..."
            style={{
              flex: 1,
              padding: '7px 8px',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '13.5px',
              color: '#0F172A',
              outline: 'none',
              minWidth: 0,
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              style={{
                border: 'none',
                background: 'transparent',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
              }}
            >
              <X size={14} />
            </button>
          )}
          <button
            type="submit"
            className="btn-primary"
            style={{
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Search size={13} />
            <span>Search</span>
          </button>
        </form>

        {/* Activity Type Filters - Strictly Management Events */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {['All', 'Card Activated', 'Card Assigned', 'Card Disabled', 'Member Joined', 'Role Updated'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: selectedType === type ? 600 : 500,
                backgroundColor: selectedType === type ? '#0B63E5' : '#F1F5F9',
                color: selectedType === type ? '#FFFFFF' : '#475569',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Table */}
      <div className="surface-card" style={{ padding: '20px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Event Type</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Time</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Target / Business</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Action Performed By</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Source / Channel</th>
                <th style={{ padding: '12px 14px', fontWeight: 600 }}>Details</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                    No management activities found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act) => {
                  const badge = getActivityBadge(act.type);
                  const Icon = badge.icon;

                  return (
                    <tr
                      key={act.id}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}
                      className="hover:bg-slate-50"
                    >
                      {/* Badge */}
                      <td style={{ padding: '14px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                            fontSize: '11px',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Icon size={13} />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Time */}
                      <td style={{ padding: '14px', color: '#0F172A', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {act.dateTime}
                      </td>

                      {/* Target / Business & Card */}
                      <td style={{ padding: '14px' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>
                            {act.businessName || 'Modexa TapCard'}
                          </div>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#0B63E5',
                              cursor: act.cardId.startsWith('CRD') ? 'pointer' : 'default',
                            }}
                            onClick={() => {
                              if (act.cardId.startsWith('CRD')) {
                                navigateTo('business-details', act.cardId);
                              }
                            }}
                          >
                            {act.cardId}
                          </span>
                        </div>
                      </td>

                      {/* Action Performer */}
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F172A', fontWeight: 500 }}>
                          <Users size={14} style={{ color: '#0B63E5', flexShrink: 0 }} />
                          <span style={{ fontSize: '12px' }}>{act.performer || 'Amit Maurya (Admin)'}</span>
                        </div>
                      </td>

                      {/* Source */}
                      <td style={{ padding: '14px', color: '#64748B', fontSize: '12px' }}>
                        {act.source}
                      </td>

                      {/* Details */}
                      <td style={{ padding: '14px', color: '#475569', fontSize: '12px', maxWidth: '300px' }}>
                        {act.details || 'Event logged successfully'}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        {act.cardId.startsWith('CRD') ? (
                          <button
                            type="button"
                            onClick={() => navigateTo('business-details', act.cardId)}
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
                            <span>View Card</span>
                            <ExternalLink size={12} />
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94A3B8' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

