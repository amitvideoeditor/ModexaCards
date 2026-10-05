import React from 'react';
import { X, Bell, CheckCircle2, AlertTriangle, ArrowRight, Zap, Store } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationsModal: React.FC = () => {
  const { isNotificationsOpen, closeNotifications, showToast, navigateTo, isMobile } = useApp();

  // Only render on mobile view; desktop uses the anchored Topbar notification dropdown
  if (!isNotificationsOpen || !isMobile) return null;

  const notifications = [
    {
      id: '1',
      title: 'New 5-Star Google Review',
      desc: 'Sharma Cafe just received a 5-star review via NFC Tap.',
      time: '4 mins ago',
      icon: Zap,
      iconColor: '#16A34A',
      iconBg: '#DCFCE7',
      action: () => {
        closeNotifications();
        navigateTo('business-details', 'CRD-0042');
      },
    },
    {
      id: '2',
      title: 'Card Ready for Activation',
      desc: 'Physical card CRD-0042 is unassigned and awaiting business link.',
      time: '1 hour ago',
      icon: AlertTriangle,
      iconColor: '#EA580C',
      iconBg: '#FFEDD5',
      action: () => {
        closeNotifications();
        navigateTo('cards');
      },
    },
    {
      id: '3',
      title: 'High Scan Volume Alert',
      desc: 'RK Salon exceeded 40 scans today (+28% above daily average).',
      time: '3 hours ago',
      icon: Store,
      iconColor: '#0B63E5',
      iconBg: '#EFF6FF',
      action: () => {
        closeNotifications();
        navigateTo('business-details', 'CRD-0038');
      },
    },
    {
      id: '4',
      title: 'Gateway Online',
      desc: 'All 24 active NFC acrylic cards are redirecting properly.',
      time: 'Yesterday',
      icon: CheckCircle2,
      iconColor: '#10B981',
      iconBg: '#ECFDF5',
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: isMobile ? 'center' : 'flex-end',
        padding: isMobile ? '0' : '24px 32px',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={closeNotifications}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(3px)',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'relative',
          zIndex: 160,
          width: '100%',
          maxWidth: isMobile ? '100%' : '400px',
          maxHeight: isMobile ? '80vh' : '560px',
          backgroundColor: '#FFFFFF',
          borderRadius: isMobile ? '20px 20px 0 0' : '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#0B63E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={17} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Notifications
              </h3>
              <span style={{ fontSize: '11px', color: '#64748B' }}>3 new alerts today</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => showToast('All notifications marked as read.', 'info')}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#0B63E5',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              Mark all read
            </button>
            <button
              type="button"
              onClick={closeNotifications}
              style={{
                padding: '6px',
                color: '#64748B',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {notifications.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={item.action}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '6px',
                  cursor: item.action ? 'pointer' : 'default',
                  transition: 'background-color 0.15s ease',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #F1F5F9',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: item.iconBg,
                    color: item.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                      {item.title}
                    </h4>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>{item.time}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748B', marginTop: '3px', marginBottom: 0, lineHeight: 1.4 }}>
                    {item.desc}
                  </p>
                </div>

                {item.action && (
                  <ArrowRight size={14} style={{ color: '#CBD5E1', flexShrink: 0, marginTop: '10px' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #F1F5F9', backgroundColor: '#F8FAFC', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            Modexa TapCard System Engine • Connected
          </span>
        </div>
      </div>
    </div>
  );
};
