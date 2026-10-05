import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  X,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Zap,
  CreditCard,
  Link2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Topbar: React.FC = () => {
  const { user, globalSearch, setGlobalSearch, navigateTo, setActiveDesktopNav, activities, notifications, markAllNotifsAsRead, logout } = useApp();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Read notifications tracking
  const [readNotifIds, setReadNotifIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('modexa_read_notif_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notifications List derived from real system activities & silent app notifications
  const notifList = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      desc: string;
      time: string;
      icon: any;
      iconColor: string;
      iconBg: string;
      cardId?: string;
    }> = [];

    // 1. Silent user action notifications (card activated, assigned, settings, etc.)
    notifications.slice(0, 10).forEach((notif) => {
      let icon = Zap;
      let iconColor = '#0B63E5';
      let iconBg = '#EFF6FF';

      if (notif.type === 'success') {
        icon = CheckCircle2;
        iconColor = '#16A34A';
        iconBg = '#DCFCE7';
      } else if (notif.type === 'error') {
        icon = AlertTriangle;
        iconColor = '#DC2626';
        iconBg = '#FEE2E2';
      } else if (notif.type === 'warning') {
        icon = AlertTriangle;
        iconColor = '#EA580C';
        iconBg = '#FFEDD5';
      }

      list.push({
        id: notif.id,
        title: notif.title,
        desc: notif.message,
        time: notif.time,
        icon,
        iconColor,
        iconBg,
        cardId: notif.cardId,
      });
    });

    // 2. Real activity stream
    activities.slice(0, 6).forEach((act) => {
      // Avoid duplicates if already covered in notifications
      if (list.some((existing) => existing.desc.includes(act.cardId))) return;

      let icon = Zap;
      let iconColor = '#0B63E5';
      let iconBg = '#EFF6FF';

      if (act.type === 'Card Activated') {
        icon = CheckCircle2;
        iconColor = '#16A34A';
        iconBg = '#DCFCE7';
      } else if (act.type === 'Card Assigned') {
        icon = CreditCard;
        iconColor = '#2563EB';
        iconBg = '#EFF6FF';
      } else if (act.type === 'Card Disabled') {
        icon = AlertTriangle;
        iconColor = '#DC2626';
        iconBg = '#FEE2E2';
      } else if (act.type === 'Link Updated') {
        icon = Link2;
        iconColor = '#7C3AED';
        iconBg = '#F3E8FF';
      }

      list.push({
        id: act.id,
        title: act.type,
        desc: act.details || `${act.cardId} updated by ${act.source}`,
        time: act.dateTime || 'Just now',
        icon,
        iconColor,
        iconBg,
        cardId: act.cardId,
      });
    });

    // 3. System status notices if stream is small
    const systemNotifs = [
      {
        id: 'sys-gateway',
        title: 'Dynamic Gateway Active',
        desc: 'All cards routing via https://modexacards.web.app/r/{id}',
        time: 'Active now',
        icon: CheckCircle2,
        iconColor: '#10B981',
        iconBg: '#ECFDF5',
      },
      {
        id: 'sys-nfc',
        title: 'NFC Telemetry Live',
        desc: 'Real-time tap count and scan analytics tracking operational.',
        time: 'System alert',
        icon: Zap,
        iconColor: '#0B63E5',
        iconBg: '#EFF6FF',
      },
    ];

    systemNotifs.forEach((sys) => {
      if (list.length < 5) list.push(sys);
    });

    return list;
  }, [notifications, activities]);

  const unreadCount = notifList.filter((n) => !readNotifIds.includes(n.id)).length;

  const markAllAsRead = () => {
    markAllNotifsAsRead();
    const allIds = notifList.map((n) => n.id);
    setReadNotifIds(allIds);
    try {
      localStorage.setItem('modexa_read_notif_ids', JSON.stringify(allIds));
    } catch {}
  };

  const markItemAsRead = (id: string) => {
    if (!readNotifIds.includes(id)) {
      const updated = [...readNotifIds, id];
      setReadNotifIds(updated);
      try {
        localStorage.setItem('modexa_read_notif_ids', JSON.stringify(updated));
      } catch {}
    }
  };

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo('cards');
  };

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* Global Search Input with Pill Corners & Dedicated Search Button */}
      <form
        onSubmit={handleGlobalSearchSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#F8FAFC',
          border: '1.5px solid #CBD5E1',
          borderRadius: '28px',
          padding: '3px 4px 3px 14px',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          transition: 'all 0.15s ease',
        }}
      >
        <Search
          size={16}
          style={{
            color: '#64748B',
            flexShrink: 0,
            marginRight: '4px',
          }}
        />
        <input
          type="text"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          placeholder="Search category, business, card ID..."
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
        {globalSearch && (
          <button
            type="button"
            onClick={() => setGlobalSearch('')}
            title="Clear search"
            style={{
              border: 'none',
              background: 'transparent',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={14} />
          </button>
        )}
        <button
          type="submit"
          className="btn-primary"
          style={{
            borderRadius: '22px',
            padding: '6px 14px',
            fontSize: '12.5px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Search size={13} />
          <span>Search</span>
        </button>
      </form>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Notification Bell with Anchored Dropdown pointing to the Bell Icon */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            aria-label="Notifications"
            style={{
              position: 'relative',
              padding: '8px',
              color: isNotifOpen ? '#2563EB' : '#64748B',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isNotifOpen ? '#EFF6FF' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <Bell size={19} />
            {/* Unread Indicator Badge */}
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '3px',
                  right: '3px',
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '8px',
                  backgroundColor: '#EF4444',
                  border: '2px solid #FFFFFF',
                  color: '#FFFFFF',
                  fontSize: '9.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                  boxShadow: '0 1px 3px rgba(239, 68, 68, 0.4)',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Anchored Notification Dropdown Popup Pointing Directly to the Bell Icon */}
          {isNotifOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                right: '-8px',
                width: '380px',
                maxWidth: '92vw',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                boxShadow: '0 20px 35px -5px rgba(15, 23, 42, 0.18), 0 8px 16px -4px rgba(15, 23, 42, 0.08)',
                border: '1px solid #E2E8F0',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Caret Arrow Pointing directly to the Bell Icon */}
              <div
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '20px',
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#FFFFFF',
                  borderLeft: '1px solid #E2E8F0',
                  borderTop: '1px solid #E2E8F0',
                  transform: 'rotate(45deg)',
                  zIndex: 101,
                }}
              />

              {/* Header */}
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px 14px 0 0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '7px',
                      backgroundColor: '#EFF6FF',
                      color: '#0B63E5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Bell size={15} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                      Notifications
                    </h4>
                    {unreadCount > 0 && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          padding: '1px 7px',
                          borderRadius: '10px',
                        }}
                      >
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#0B63E5',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notifications List (Scrollable) */}
              <div
                style={{
                  maxHeight: '340px',
                  overflowY: 'auto',
                  padding: '6px 0',
                }}
              >
                {notifList.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifList.map((notif) => {
                    const IconComponent = notif.icon;
                    const isUnread = !readNotifIds.includes(notif.id);

                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markItemAsRead(notif.id);
                          setIsNotifOpen(false);
                          if (notif.cardId) {
                            navigateTo('business-details', notif.cardId);
                          } else {
                            navigateTo('activity');
                          }
                        }}
                        style={{
                          padding: '10px 16px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          cursor: 'pointer',
                          backgroundColor: isUnread ? '#F8FAFC' : '#FFFFFF',
                          borderBottom: '1px solid #F8FAFC',
                          transition: 'background-color 0.15s ease',
                          position: 'relative',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = isUnread ? '#F8FAFC' : '#FFFFFF')
                        }
                      >
                        {/* Icon */}
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: notif.iconBg,
                            color: notif.iconColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '2px',
                          }}
                        >
                          <IconComponent size={16} />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: isUnread ? 700 : 600, color: '#0F172A' }}>
                              {notif.title}
                            </span>
                            <span style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                              {notif.time}
                            </span>
                          </div>
                          <p
                            style={{
                              margin: '2px 0 0',
                              fontSize: '12px',
                              color: '#64748B',
                              lineHeight: 1.4,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {notif.desc}
                          </p>
                        </div>

                        {/* Unread Dot */}
                        {isUnread && (
                          <div
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: '#2563EB',
                              flexShrink: 0,
                              marginTop: '8px',
                            }}
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: '10px 16px',
                  borderTop: '1px solid #F1F5F9',
                  textAlign: 'center',
                  backgroundColor: '#FAFAFA',
                  borderRadius: '0 0 14px 14px',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigateTo('activity');
                  }}
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#2563EB',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>View all activity history</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 8px',
              borderRadius: '8px',
              border: 'none',
              background: isDropdownOpen ? '#F1F5F9' : 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            {/* Avatar Circle with Online Dot */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#0B63E5',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {user.name.charAt(0)}
              </div>
              <span
                style={{
                  position: 'absolute',
                  bottom: '-1px',
                  right: '-1px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#22C55E',
                  border: '1.5px solid #FFFFFF',
                }}
              />
            </div>

            {/* User Info */}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', lineHeight: 1.2 }}>
                {user.name}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 500, color: '#64748B', lineHeight: 1.2 }}>
                {user.role}
              </div>
            </div>

            <ChevronDown
              size={14}
              style={{
                color: '#94A3B8',
                marginLeft: '2px',
                transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s ease',
              }}
            />
          </button>

          {/* Quick Dropdown Menu */}
          {isDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '8px',
                width: '220px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                padding: '6px',
                zIndex: 100,
                fontSize: '13px',
              }}
            >
              <div style={{ padding: '10px 12px', borderBottom: '1px solid #F1F5F9' }}>
                <p style={{ fontWeight: 600, color: '#0F172A', margin: 0 }}>{user.name}</p>
                <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0' }}>{user.email}</p>
                <div style={{ fontSize: '10px', color: '#0B63E5', fontWeight: 600, marginTop: '4px', backgroundColor: '#EFF6FF', display: 'inline-block', padding: '1px 6px', borderRadius: '4px' }}>
                  {user.department || 'Operations'}
                </div>
              </div>

              <div style={{ padding: '4px 0' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDesktopNav('Profile');
                    navigateTo('profile');
                    setIsDropdownOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    color: '#0F172A',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                  className="hover:bg-slate-50"
                >
                  <User size={16} style={{ color: '#0B63E5' }} />
                  <span>My Profile</span>
                </button>

                {user.role === 'Admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDesktopNav('Create Cards');
                      navigateTo('create-cards');
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      color: '#0F172A',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                    className="hover:bg-slate-50"
                  >
                    <QrCode size={16} style={{ color: '#0B63E5' }} />
                    <span style={{ flex: 1 }}>Create Cards</span>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '4px',
                        backgroundColor: '#EFF6FF',
                        color: '#0B63E5',
                        letterSpacing: '0.3px',
                      }}
                    >
                      ADMIN
                    </span>
                  </button>
                )}

                {user.role === 'Admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDesktopNav('Settings');
                      navigateTo('settings');
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      color: '#0F172A',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                    className="hover:bg-slate-50"
                  >
                    <Settings size={16} style={{ color: '#64748B' }} />
                    <span style={{ flex: 1 }}>Platform Settings</span>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '4px',
                        backgroundColor: '#EFF6FF',
                        color: '#0B63E5',
                        letterSpacing: '0.3px',
                      }}
                    >
                      ADMIN
                    </span>
                  </button>
                )}
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsDropdownOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    color: '#EF4444',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}
                  className="hover:bg-red-50"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
