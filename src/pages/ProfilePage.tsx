import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Mail,
  Shield,
  CreditCard,
  Store,
  LogOut,
  Settings,
  Phone,
  MapPin,
  Save,
  KeyRound,
  Laptop,
  Smartphone,
  Pencil,
  X,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ImageCropModal } from '../components/ImageCropModal';

export const ProfilePage: React.FC = () => {
  const { user, updateUserProfile, stats, logout, updatePassword, navigateTo, goBack, showToast, isMobile } = useApp();

  // Desktop & Mobile edit toggle states
  const [isDesktopEditing, setIsDesktopEditing] = useState(false);
  const [isMobileEditing, setIsMobileEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Instagram-style Image Crop States
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedRawImage, setSelectedRawImage] = useState<string>('');

  // Hidden photo upload input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states initialized directly from user
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [location, setLocation] = useState(user.location || '');
  const [bio, setBio] = useState(user.bio || '');
  const [department, setDepartment] = useState(user.department || '');

  // Keep form in sync when user profile is loaded from Firebase on page refresh or after update
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setLocation(user.location || '');
      setBio(user.bio || '');
      setDepartment(user.department || '');
    }
  }, [user]);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogout = () => {
    logout();
  };

  /**
   * Handle profile photo selection and open Instagram-style Crop & Adjust screen
   */
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP).', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image size exceeds 10MB limit. Please choose a smaller photo.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const rawDataUrl = uploadEvent.target?.result as string;
      if (rawDataUrl) {
        setSelectedRawImage(rawDataUrl);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected if desired
    e.target.value = '';
  };

  /**
   * Save final adjusted and cropped profile image to Firebase and local profile
   */
  const handleCropComplete = async (croppedDataUrl: string) => {
    setIsUploadingPhoto(true);
    try {
      const res = await updateUserProfile({ avatarUrl: croppedDataUrl });
      if (res.success) {
        showToast('Profile photo updated successfully!', 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('Failed to update profile photo.', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  /**
   * Remove custom avatar photo and revert to initial letter avatar
   */
  const handleRemovePhoto = async () => {
    setIsUploadingPhoto(true);
    try {
      const res = await updateUserProfile({ avatarUrl: '' });
      if (res.success) {
        showToast('Profile photo removed.', 'info');
      }
    } catch {
      showToast('Failed to remove photo.', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateUserProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim(),
        bio: bio.trim(),
        department: department.trim(),
      });
      setIsMobileEditing(false);
      setIsDesktopEditing(false);
      if (res && !res.success) {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to save profile changes to Firebase.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Please enter both current and new password.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    const res = await updatePassword(currentPassword, newPassword);
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
        {/* Hidden File Picker Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handlePhotoSelect}
        />

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
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  border: '1px solid #A7F3D0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                Firebase Cloud Synced
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
            {/* User Profile Card with Photo Upload */}
            <div className="surface-card" style={{ padding: '24px', textAlign: 'center' }}>
              {/* Circular Avatar with Camera Button */}
              <div style={{ position: 'relative', width: '92px', height: '92px', margin: '0 auto 12px' }}>
                <div
                  style={{
                    width: '92px',
                    height: '92px',
                    borderRadius: '50%',
                    backgroundColor: '#0B63E5',
                    color: '#FFFFFF',
                    fontSize: '34px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(11, 99, 229, 0.28)',
                    border: '3px solid #FFFFFF',
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

                {/* Upload Photo Button Badge */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  title="Upload profile photo"
                  aria-label="Upload profile photo"
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#0B63E5',
                    color: '#FFFFFF',
                    border: '2.5px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#094ec2')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0B63E5')}
                >
                  <Camera size={14} />
                </button>
              </div>

              {/* Photo Actions: Change Photo / Remove */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '14px' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#0B63E5',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: '2px 4px',
                  }}
                >
                  {isUploadingPhoto ? 'Uploading...' : user.avatarUrl ? 'Change Photo' : 'Upload Photo'}
                </button>
                {user.avatarUrl && (
                  <>
                    <span style={{ color: '#CBD5E1', fontSize: '11px' }}>•</span>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={isUploadingPhoto}
                      style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#DC2626',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: '2px 4px',
                      }}
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                {user.name}
              </h2>
              <div style={{ fontSize: '13px', color: '#0B63E5', fontWeight: 600, marginTop: '2px' }}>
                {user.department || 'Executive Administration'}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                {user.email}
              </div>

              {/* Quick Details Box */}
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
                  <span>{user.phone || 'No contact phone set'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={13} style={{ color: '#94A3B8' }} />
                  <span>{user.location || 'New Delhi, India'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={13} style={{ color: '#16A34A' }} />
                  <span style={{ color: '#16A34A', fontWeight: 600 }}>2FA Protected • Level 3 Access</span>
                </div>
              </div>

              {/* Edit Profile Button in Left Card */}
              <button
                type="button"
                onClick={() => setIsDesktopEditing((prev) => !prev)}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  border: isDesktopEditing ? '1.5px solid #0B63E5' : '1px solid #CBD5E1',
                  backgroundColor: isDesktopEditing ? '#EFF6FF' : '#FFFFFF',
                  color: '#0B63E5',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {isDesktopEditing ? (
                  <>
                    <X size={15} />
                    <span>Close Edit Mode</span>
                  </>
                ) : (
                  <>
                    <Pencil size={15} />
                    <span>Edit Profile Details</span>
                  </>
                )}
              </button>
            </div>

            {/* Scope Stats */}
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

          {/* Right Column: Editable Profile Section OR Clean View-Only Details (Toggled by Pencil) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {isDesktopEditing ? (
              /* DESKTOP EDIT FORM (Only shown when Pencil button is clicked) */
              <div className="surface-card" style={{ padding: '28px', border: '1.5px solid #BFDBFE' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: '#EFF6FF',
                        color: '#0B63E5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Pencil size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        Edit Personal Information
                      </h3>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                        Modify your administrator details and sync directly to Firebase Cloud.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDesktopEditing(false)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#64748B',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <X size={14} />
                    <span>Cancel</span>
                  </button>
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
                        placeholder="e.g. Amit Maurya"
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
                        placeholder="e.g. admin@modexacards.com"
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
                        placeholder="+91 98111 22334"
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
                        placeholder="e.g. Delhi NCR & Gurugram"
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
                      placeholder="e.g. Executive Administration"
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
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Describe your role or administrative responsibilities..."
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

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setIsDesktopEditing(false)}
                      style={{
                        padding: '9px 18px',
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
                      disabled={isSaving}
                      style={{
                        padding: '9px 22px',
                        fontSize: '13px',
                        opacity: isSaving ? 0.7 : 1,
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Save size={15} />
                      <span>{isSaving ? 'Saving to Firebase...' : 'Save Profile Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* CLEAN DESKTOP OVERVIEW VIEW (Shown by default) */
              <div className="surface-card" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      Personal Information
                    </h3>
                    <p style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px', marginBottom: 0 }}>
                      Public credentials and territory details for this Modexa account.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDesktopEditing(true)}
                    className="btn-primary"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    <Pencil size={14} />
                    <span>Edit Profile</span>
                  </button>
                </div>

                {/* Information Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Full Name
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                      {user.name}
                    </div>
                  </div>

                  <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Email Address
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#0B63E5', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{user.email}</span>
                      <CheckCircle2 size={15} style={{ color: '#16A34A', flexShrink: 0 }} />
                    </div>
                  </div>

                  <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Contact Phone
                    </div>
                    <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#0F172A', marginTop: '4px' }}>
                      {user.phone || '—'}
                    </div>
                  </div>

                  <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Assigned Location / Territory
                    </div>
                    <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#0F172A', marginTop: '4px' }}>
                      {user.location || 'New Delhi, India'}
                    </div>
                  </div>

                  <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      Department
                    </div>
                    <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#0F172A', marginTop: '4px' }}>
                      {user.department || 'Executive Administration'}
                    </div>
                  </div>

                  <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      System Role
                    </div>
                    <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#0B63E5', marginTop: '4px' }}>
                      {user.role} (Superadmin privileges)
                    </div>
                  </div>
                </div>

                {/* Bio Block */}
                <div style={{ marginTop: '20px', padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Administrator Bio
                  </div>
                  <div style={{ fontSize: '13.5px', color: '#334155', marginTop: '6px', lineHeight: 1.6 }}>
                    {user.bio || 'Enterprise administrator for Modexa TapCard operations and NFC Google Review stands.'}
                  </div>
                </div>
              </div>
            )}

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

        {/* Instagram-style Image Crop & Adjust Modal */}
        <ImageCropModal
          isOpen={cropModalOpen}
          imageSrc={selectedRawImage}
          onClose={() => setCropModalOpen(false)}
          onCropComplete={handleCropComplete}
        />
      </div>
    );
  }

  // ========================================================
  // MOBILE PROFILE VIEW
  // ========================================================
  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100%', paddingBottom: '90px' }}>
      {/* Hidden File Picker Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handlePhotoSelect}
      />

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

        {/* Top Right Actions: Pencil Edit Icon Button */}
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
                  disabled={isSaving}
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
                    opacity: isSaving ? 0.7 : 1,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Save size={15} />
                  <span>{isSaving ? 'Saving to Firebase...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STANDARD MOBILE PROFILE VIEW */
          <>
            {/* User Card with Photo Upload */}
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
              {/* Circular Avatar Photo with Camera button */}
              <div style={{ position: 'relative', width: '68px', height: '68px', flexShrink: 0 }}>
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    backgroundColor: '#0B63E5',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '26px',
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(11, 99, 229, 0.25)',
                    border: '2px solid #FFFFFF',
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

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  title="Upload profile photo"
                  aria-label="Upload profile photo"
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: '#0B63E5',
                    color: '#FFFFFF',
                    border: '2px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  <Camera size={12} />
                </button>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: '#ECFDF5',
                      color: '#059669',
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      border: '1px solid #A7F3D0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                    Firebase
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '3px', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Mail size={13} style={{ color: '#94A3B8' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
                </p>

                {/* Mobile Photo Action links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#0B63E5',
                      border: 'none',
                      background: 'none',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  >
                    {isUploadingPhoto ? 'Uploading...' : user.avatarUrl ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  {user.avatarUrl && (
                    <>
                      <span style={{ color: '#CBD5E1', fontSize: '10px' }}>•</span>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={isUploadingPhoto}
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 500,
                          color: '#DC2626',
                          border: 'none',
                          background: 'none',
                          padding: 0,
                          cursor: 'pointer',
                        }}
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Scope Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: '#EFF6FF',
                    color: '#0B63E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CreditCard size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
                    {stats.activeCards}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Assigned Cards</div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: '#F3E8FF',
                    color: '#7C3AED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Store size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
                    {stats.businesses}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Businesses</div>
                </div>
              </div>
            </div>

            {/* Account Details Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Account Credentials</span>
                <button
                  type="button"
                  onClick={() => setIsMobileEditing(true)}
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#0B63E5',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Pencil size={12} />
                  <span>Edit</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F8FAFC' }}>
                  <span style={{ color: '#64748B' }}>Phone</span>
                  <span style={{ fontWeight: 600 }}>{user.phone || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F8FAFC' }}>
                  <span style={{ color: '#64748B' }}>Territory</span>
                  <span style={{ fontWeight: 600 }}>{user.location || 'New Delhi'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F8FAFC' }}>
                  <span style={{ color: '#64748B' }}>Department</span>
                  <span style={{ fontWeight: 600 }}>{user.department || 'Operations'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Role Tier</span>
                  <span style={{ fontWeight: 700, color: '#0B63E5' }}>{user.role}</span>
                </div>
              </div>
            </div>

            {/* Password Update Card on Mobile */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                padding: '16px',
              }}
            >
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 12px 0' }}>
                Security & Password
              </h3>

              <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: '4px',
                    padding: '9px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <KeyRound size={13} />
                  <span>Update Password</span>
                </button>
              </form>
            </div>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 1px 2px rgba(220, 38, 38, 0.05)',
              }}
            >
              <LogOut size={16} />
              <span>Sign Out from Modexa</span>
            </button>
          </>
        )}
      </div>

      {/* Instagram-style Image Crop & Adjust Modal (Mobile) */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={selectedRawImage}
        onClose={() => setCropModalOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};
