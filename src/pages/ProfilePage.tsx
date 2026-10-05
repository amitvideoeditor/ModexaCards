import React, { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  Shield,
  CreditCard,
  Store,
  LogOut,
  ChevronRight,
  Settings,
  Phone,
  MapPin,
  Save,
  KeyRound,
  Laptop,
  Smartphone,
  Pencil,
  X,
  Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfilePage: React.FC = () => {
  const { user, updateUserProfile, stats, logout, updatePassword, navigateTo, goBack, showToast, isMobile } = useApp();

  // Mobile edit toggle state
  const [isMobileEditing, setIsMobileEditing] = useState(false);

  // Form states
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '+91 98111 22334');
  const [location, setLocation] = useState(user.location || 'New Delhi, India');
  const [bio, setBio] = useState(user.bio || 'Lead Administrator managing enterprise Modexa TapCard NFC deployments.');
  const [department, setDepartment] = useState(user.department || 'Operations & Field Success');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogout = () => {
    logout();
  };

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateUserProfile({
      name,
      email,
      phone,
      location,
      bio,
      department,
    });
    setIsMobileEditing(false);
    showToast('Profile updated successfully.', 'success');
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Please enter both current and new password.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    const res = updatePassword(currentPassword, newPassword);
    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  // ========================================================
  // DESKTOP PROFILE VIEW
  // ========================================================
  if (!isMobile) {
    return (
      <div style={{ padding: '32px', backgroundColor: '#F8FAFC', minHeight: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                Administrator Account & Profile
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: '#EFF6FF',
                  color: '#0B63E5',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  border: '1px solid #BFDBFE',
                }}
              >
                {user.role}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
              Manage your personal credentials, region assignments, security privileges, and Modexa TapCard settings.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #FCA5A5',
              color: '#DC2626',
              padding: '8px 16px',
              borderRadius: '9px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(220, 38, 38, 0.05)',
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* 2-Column Desktop Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '4fr 8fr', gap: '24px', alignItems: 'start' }}>
          {/* Left Column: Identity & Metrics Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* User Profile Card - Circular Photo */}
            <div className="surface-card" style={{ padding: '24px', textAlign: 'center' }}>
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  backgroundColor: '#0B63E5',
                  color: '#FFFFFF',
                  fontSize: '34px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 24px rgba(11, 99, 229, 0.28)',
                  border: '3px solid #FFFFFF',
                }}
              >
                {user.name.charAt(0)}
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                {user.name}
              </h2>
              <div style={{ fontSize: '13px', color: '#0B63E5', fontWeight: 600, marginTop: '2px' }}>
                {user.department}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                {user.email}
              </div>

              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                  color: '#475569',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={13} style={{ color: '#94A3B8' }} />
                  <span>{user.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={13} style={{ color: '#94A3B8' }} />
                  <span>{user.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={13} style={{ color: '#16A34A' }} />
                  <span style={{ color: '#16A34A', fontWeight: 600 }}>2FA Protected • Level 3 Access</span>
                </div>
              </div>
            </div>

            {/* Scope Stats - Strictly NO taps and NO scans as requested */}
            <div className="surface-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '14px' }}>
                Operational Scope
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', textAlign: 'center' }}>
                <div style={{ padding: '12px 10px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <CreditCard size={18} style={{ color: '#0B63E5', margin: '0 auto 4px' }} />
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>{stats.activeCards}</div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Assigned Cards</div>
                </div>
                <div style={{ padding: '12px 10px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <Store size={18} style={{ color: '#7C3AED', margin: '0 auto 4px' }} />
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>{stats.businesses}</div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Active Businesses</div>
                </div>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="surface-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
                Active Devices & Sessions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Laptop size={18} style={{ color: '#0B63E5' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#0F172A' }}>Windows 11 PC (Chrome 124)</div>
                    <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>Current Active Session • Delhi, India</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Smartphone size={18} style={{ color: '#64748B' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#0F172A' }}>iPhone 15 Pro (Safari Mobile)</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Last active 32 mins ago • Delhi, India</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editable Forms */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Profile Information Form */}
            <div className="surface-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    Personal Information
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', marginBottom: 0 }}>
                    Update your public administrator details and field contact numbers.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        color: '#0F172A',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        color: '#0F172A',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        color: '#0F172A',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Assigned Territory / Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        color: '#0F172A',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Department / Division
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Administrator Bio
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#0F172A',
                      outline: 'none',
                      resize: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <button type="submit" className="btn-primary" style={{ padding: '9px 20px', fontSize: '13px' }}>
                    <Save size={15} />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Security & Password Form */}
            <div className="surface-card" style={{ padding: '28px' }}>
              <div style={{ marginBottom: '18px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Security & Password
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', marginBottom: 0 }}>
                  Ensure your account has a strong password to safeguard customer Google Review cards.
                </p>
              </div>

              <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%',
                      maxWidth: '360px',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '640px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        color: '#0F172A',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        color: '#0F172A',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '6px' }}>
                  <button
                    type="submit"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#0F172A',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <KeyRound size={14} />
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // MOBILE PROFILE VIEW
  // ========================================================
  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100%', paddingBottom: '90px' }}>
      {/* Header with Top Right Corner Pencil Edit Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={goBack}
            aria-label="Back"
            style={{
              padding: '6px',
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            {isMobileEditing ? 'Edit Profile' : 'Administrator Profile'}
          </h1>
        </div>

        {/* Top Right Actions: Pencil Edit Icon Button requested by user */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setIsMobileEditing((prev) => !prev)}
            aria-label="Edit Profile"
            title="Edit Profile"
            style={{
              padding: '7px',
              color: isMobileEditing ? '#FFFFFF' : '#0B63E5',
              backgroundColor: isMobileEditing ? '#0B63E5' : '#EFF6FF',
              border: `1px solid ${isMobileEditing ? '#0B63E5' : '#BFDBFE'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            {isMobileEditing ? <X size={18} /> : <Pencil size={18} />}
          </button>

          {user.role === 'Admin' && (
            <button
              type="button"
              onClick={() => navigateTo('settings')}
              aria-label="Settings"
              style={{
                padding: '7px',
                color: '#64748B',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Settings size={19} />
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* MOBILE EDIT FORM (Toggled by Pencil Button) */}
        {isMobileEditing ? (
          <div className="surface-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#0B63E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pencil size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Edit Administrator Details
                </h3>
                <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>
                  Update your contact and territory credentials
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    color: '#0F172A',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    color: '#0F172A',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    color: '#0F172A',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Assigned Location / Territory
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    color: '#0F172A',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Department / Division
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    color: '#0F172A',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Bio
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    color: '#0F172A',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsMobileEditing(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Save size={15} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STANDARD MOBILE PROFILE VIEW */
          <>
            {/* User Card - Photo in Circle as requested */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {/* Circular Avatar Photo */}
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#0B63E5',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(11, 99, 229, 0.25)',
                  flexShrink: 0,
                  border: '2px solid #FFFFFF',
                }}
              >
                {user.name.charAt(0)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                    {user.name}
                  </h2>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: '#EFF6FF',
                      color: '#0B63E5',
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      border: '1px solid #BFDBFE',
                    }}
                  >
                    {user.role}
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '3px', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Mail size={13} style={{ color: '#94A3B8' }} />
                  <span>{user.email}</span>
                </p>
                <p style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px', marginBottom: 0 }}>
                  Modexa TapCard Field Operations • {user.location}
                </p>
              </div>
            </div>

            {/* Quick Details Card */}
            <div className="surface-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={13} style={{ color: '#94A3B8' }} />
                  Phone:
                </span>
                <strong style={{ color: '#0F172A' }}>{user.phone}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={13} style={{ color: '#94A3B8' }} />
                  Department:
                </span>
                <strong style={{ color: '#0F172A' }}>{user.department}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={13} style={{ color: '#16A34A' }} />
                  Access Level:
                </span>
                <span style={{ color: '#16A34A', fontWeight: 600 }}>Level 3 Administrator</span>
              </div>
            </div>

            {/* System Scope Metrics - ZERO taps and ZERO scans as requested */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '14px 10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                  <CreditCard size={16} />
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
                  {stats.activeCards}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>
                  Managed Cards
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '14px 10px',
                  textAlign: 'center',
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#F3E8FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                  <Store size={16} />
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
                  {stats.businesses}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>
                  Businesses
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <div
                onClick={() => setIsMobileEditing(true)}
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  borderBottom: '1px solid #F1F5F9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Pencil size={18} style={{ color: '#0B63E5' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Edit Profile Information</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Change name, phone, email & bio</div>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: '#94A3B8' }} />
              </div>

              {user.role === 'Admin' && (
                <div
                  onClick={() => navigateTo('settings')}
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    borderBottom: '1px solid #F1F5F9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Settings size={18} style={{ color: '#7C3AED' }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Platform Settings</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Smart-routing rules, system settings</div>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: '#94A3B8' }} />
                </div>
              )}

              <div
                onClick={() => showToast('Modexa TapCard v2.0 • Security Verified', 'info')}
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Shield size={18} style={{ color: '#16A34A' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>Security & Compliance</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>SOC2 Certified, Google OAuth 2.0</div>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: '#94A3B8' }} />
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '13px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #FCA5A5',
                borderRadius: '12px',
                color: '#DC2626',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(220, 38, 38, 0.05)',
                marginTop: '4px',
              }}
            >
              <LogOut size={16} />
              <span>Sign Out of Modexa TapCard</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

