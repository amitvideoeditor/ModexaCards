import React, { useState } from 'react';
import { ArrowLeft, Bell, MoreVertical, Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InstallAppButton } from './InstallAppButton';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showMenu?: boolean;
  onMenuClick?: () => void;
  showNotification?: boolean;
  showSearch?: boolean;
  type?: 'dashboard' | 'detail' | 'form';
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  showMenu = false,
  onMenuClick,
  showNotification = false,
  showSearch = true,
  type = 'detail',
}) => {
  const { user, openNotifications, globalSearch, setGlobalSearch, navigateTo, showToast } = useApp();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [headerSearchTerm, setHeaderSearchTerm] = useState(globalSearch || '');

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchTerm.trim()) {
      setGlobalSearch(headerSearchTerm.trim());
      navigateTo('cards');
      showToast(`Searching for "${headerSearchTerm.trim()}"`, 'info');
    }
  };

  return (
    <div style={{ width: '100%', backgroundColor: '#FFFFFF', userSelect: 'none', borderBottom: '1px solid #F1F5F9' }}>
      {/* Screen Specific Header Bar */}
      {type === 'dashboard' ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
          }}
        >
          <div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748B', display: 'block', lineHeight: 1.3 }}>
              Good Morning,
            </span>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2, margin: 0, letterSpacing: '-0.02em' }}>
              {user.name}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Install as Native App */}
            <InstallAppButton variant="icon" />

            {/* Mobile Header Search Button */}
            {showSearch && (
              <button
                type="button"
                onClick={() => setIsSearchOpen((prev) => !prev)}
                aria-label="Search"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: isSearchOpen ? '#EFF6FF' : '#F8FAFC',
                  border: isSearchOpen ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSearchOpen ? '#0B63E5' : '#0F172A',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Search size={18} />
              </button>
            )}

            <button
              type="button"
              onClick={openNotifications}
              aria-label="Open notifications"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0F172A',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                outline: 'none',
                transition: 'background-color 0.15s ease',
              }}
            >
              <Bell size={19} />
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  border: '2px solid #FFFFFF',
                }}
              />
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            {showBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Go back"
                style={{
                  padding: '6px',
                  color: '#0F172A',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={21} />
              </button>
            )}
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#0F172A',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Install as Native App */}
            <InstallAppButton variant="icon" style={{ width: '36px', height: '36px' }} />

            {/* Mobile Header Search Button */}
            {showSearch && (
              <button
                type="button"
                onClick={() => setIsSearchOpen((prev) => !prev)}
                aria-label="Search"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSearchOpen ? '#0B63E5' : '#0F172A',
                  backgroundColor: isSearchOpen ? '#EFF6FF' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Search size={18} />
              </button>
            )}

            {showNotification && (
              <button
                type="button"
                onClick={openNotifications}
                aria-label="Notifications"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0F172A',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <Bell size={19} />
                <span
                  style={{
                    position: 'absolute',
                    top: '7px',
                    right: '7px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#EF4444',
                  }}
                />
              </button>
            )}

            {showMenu && (
              <button
                type="button"
                onClick={onMenuClick}
                aria-label="Menu options"
                style={{
                  padding: '6px',
                  color: '#64748B',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <MoreVertical size={20} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Expandable Rounded Search Bar with Search Button */}
      {isSearchOpen && (
        <div style={{ padding: '0 16px 12px 16px', backgroundColor: '#FFFFFF' }}>
          <form
            onSubmit={handleHeaderSearchSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: '1.5px solid #CBD5E1',
              borderRadius: '28px',
              padding: '3px 4px 3px 12px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
            }}
          >
            <Search size={16} style={{ color: '#64748B', flexShrink: 0, marginRight: '4px' }} />
            <input
              type="text"
              value={headerSearchTerm}
              onChange={(e) => setHeaderSearchTerm(e.target.value)}
              placeholder="Search category, business, card..."
              autoFocus
              style={{
                flex: 1,
                padding: '7px 6px',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '13px',
                color: '#0F172A',
                outline: 'none',
                minWidth: 0,
              }}
            />
            {headerSearchTerm && (
              <button
                type="button"
                onClick={() => setHeaderSearchTerm('')}
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
                padding: '6px 13px',
                fontSize: '12px',
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
        </div>
      )}
    </div>
  );
};
