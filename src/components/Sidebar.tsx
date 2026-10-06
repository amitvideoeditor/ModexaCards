import React from 'react';
import {
  LayoutDashboard,
  Store,
  CreditCard,
  BarChart3,
  Activity,
  Users,
  Settings,
  ChevronRight,
  QrCode,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ReviewTapLogo } from './ReviewTapLogo';
import { InstallAppButton } from './InstallAppButton';
import type { DesktopNav, ViewScreen } from '../types';

export const Sidebar: React.FC = () => {
  const { activeDesktopNav, setActiveDesktopNav, navigateTo, user } = useApp();

  const navItems: { label: DesktopNav; icon: React.ElementType; view: ViewScreen; adminOnly?: boolean; badge?: string }[] = [
    { label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' },
    { label: 'Businesses', icon: Store, view: 'businesses' },
    { label: 'Cards', icon: CreditCard, view: 'cards' },
    { label: 'Create Cards', icon: QrCode, view: 'create-cards', adminOnly: true, badge: 'Admin' },
    { label: 'Analytics', icon: BarChart3, view: 'analytics' },
    { label: 'Activity', icon: Activity, view: 'activity' },
    { label: 'Team', icon: Users, view: 'team' },
    { label: 'Settings', icon: Settings, view: 'settings', adminOnly: true, badge: 'Admin' },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    setActiveDesktopNav(item.label);
    navigateTo(item.view);
  };

  const isProfileActive = activeDesktopNav === 'Profile';

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      <div>
        {/* Brand Logo Header */}
        <div style={{ padding: '0 8px', marginBottom: '28px' }}>
          <ReviewTapLogo
            size="md"
            onClick={() => {
              setActiveDesktopNav('Dashboard');
              navigateTo('dashboard');
            }}
          />
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems
            .filter((item) => !item.adminOnly || user.role === 'Admin')
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeDesktopNav === item.label;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#0B63E5' : '#64748B',
                    backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                    border: isActive ? '1px solid #DBEAFE' : '1px solid transparent',
                    outline: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon
                    size={19}
                    style={{ color: isActive ? '#0B63E5' : '#64748B', flexShrink: 0 }}
                  />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '6px',
                        backgroundColor: isActive ? '#0B63E5' : '#F1F5F9',
                        color: isActive ? '#FFFFFF' : '#475569',
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>
      </div>

      {/* Bottom Section: User Profile & System Status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
        {/* Install as Progressive Web App (PWA) */}
        <InstallAppButton variant="sidebar" />

        {/* Clickable Profile Card in Sidebar Bottom */}
        <button
          type="button"
          onClick={() => {
            setActiveDesktopNav('Profile');
            navigateTo('profile');
          }}
          title="Access your Administrator Profile"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 10px',
            borderRadius: '10px',
            backgroundColor: isProfileActive ? '#EFF6FF' : '#F8FAFC',
            border: `1px solid ${isProfileActive ? '#BFDBFE' : '#E2E8F0'}`,
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.15s ease',
          }}
        >
          {/* Avatar with Status Dot */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#0B63E5',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(11, 99, 229, 0.2)',
                overflow: 'hidden',
              }}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <span
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                backgroundColor: '#22C55E',
                border: '1.5px solid #FFFFFF',
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
              My Profile
            </div>
          </div>

          <ChevronRight size={15} style={{ color: isProfileActive ? '#0B63E5' : '#94A3B8' }} />
        </button>

        {/* System Status Tag */}
        <div style={{ padding: '0 4px', fontSize: '11px', color: '#94A3B8', fontWeight: 500, lineHeight: 1.4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Modexa TapCard Enterprise</span>
            <span style={{ fontSize: '10px', color: '#64748B' }}>v1.2</span>
          </div>
          <div style={{ fontSize: '10px', color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
            NFC Telemetry Online
          </div>
        </div>
      </div>
    </aside>
  );
};
