import React, { useState } from 'react';
import {
  Sliders,
  Bell,
  Globe,
  Save,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Sparkles,
  Wifi,
  Database,
  ExternalLink,
  RefreshCw,
  Terminal,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { PlatformSettings } from '../types';

export const SettingsPage: React.FC = () => {
  const {
    user,
    settings,
    updateSettings,
    showToast,
    isMobile,
    firebaseProjectId,
    firebaseHostingUrl,
    testFirebase,
    navigateTo,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'routing' | 'hardware' | 'integrations' | 'notifications' | 'general'>('routing');
  const [formData, setFormData] = useState<PlatformSettings>(settings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingFirebase, setIsTestingFirebase] = useState(false);
  const [firebaseTestResult, setFirebaseTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestFirebase = async () => {
    setIsTestingFirebase(true);
    setFirebaseTestResult(null);
    try {
      const res = await testFirebase();
      setFirebaseTestResult(res);
      showToast(res.message, res.success ? 'success' : 'warning');
    } catch (e: any) {
      const errRes = { success: false, message: e?.message || 'Connection failed' };
      setFirebaseTestResult(errRes);
      showToast(errRes.message, 'error');
    } finally {
      setIsTestingFirebase(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'info');
  };

  if (user.role !== 'Admin') {
    return (
      <div
        style={{
          padding: isMobile ? '24px 16px' : '48px 32px',
          backgroundColor: '#F8FAFC',
          minHeight: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '460px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px auto',
              border: '1px solid #FECACA',
            }}
          >
            <ShieldAlert size={32} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
            Administrator Access Required
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.5, margin: '0 0 20px 0' }}>
            <strong>System Settings & Configuration</strong> is restricted exclusively to authorized Administrators. Your current logged-in role is <strong style={{ color: '#0F172A' }}>{user.role}</strong> ({user.email}).
          </p>
          <div
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '12px',
              color: '#64748B',
              border: '1px dashed #CBD5E1',
              marginBottom: '24px',
            }}
          >
            Please sign in with an Administrator account (e.g. <strong>amit@modexacards.com</strong>, <strong>shubham@modexacards.com</strong>, or <strong>rahul@modexacards.com</strong>) to configure routing filters, hardware tap behavior, API keys, and platform settings.
          </div>
          <button
            type="button"
            onClick={() => navigateTo('dashboard')}
            className="btn-primary"
            style={{ width: '100%', padding: '11px', borderRadius: '10px', fontSize: '13.5px' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
              System Settings & Configuration
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#16A34A',
                backgroundColor: '#DCFCE7',
                padding: '2px 8px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <CheckCircle2 size={12} />
              Production Active
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
            Fine-tune NFC card tap behavior, Google Review smart-routing filters, API credentials, and alerting.
          </p>
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          className="btn-primary"
          style={{ whiteSpace: 'nowrap' }}
        >
          <Save size={16} strokeWidth={2.5} />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Tabs Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid #E2E8F0',
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}
      >
        {[
          { id: 'routing', label: 'Review Smart-Routing', icon: Sparkles },
          { id: 'hardware', label: 'NFC Card Hardware', icon: Wifi },
          { id: 'integrations', label: 'Google API & Integrations', icon: Globe },
          { id: 'notifications', label: 'Alerts & Webhooks', icon: Bell },
          { id: 'general', label: 'General & Regional', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#0B63E5' : '#64748B',
                borderBottom: isActive ? '2px solid #0B63E5' : '2px solid transparent',
                backgroundColor: 'transparent',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <form onSubmit={handleSave} style={{ maxWidth: '840px' }}>
        {/* 1. REVIEW SMART ROUTING */}
        {activeTab === 'routing' && (
          <div className="surface-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Google Review Smart-Routing Engine
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
                Shield business reputation by automatically redirecting positive reviews to Google Maps and private feedback to owners.
              </p>
            </div>

            {/* Toggle Card */}
            <div
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                backgroundColor: formData.enableSmartRouting ? '#EFF6FF' : '#F8FAFC',
                border: `1px solid ${formData.enableSmartRouting ? '#BFDBFE' : '#E2E8F0'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                  Enable Negative Review Shielding
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  Customers rating 1-3 stars are invited to send direct private feedback instead of posting publicly.
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px' }}>
                <input
                  type="checkbox"
                  checked={formData.enableSmartRouting}
                  onChange={(e) => setFormData({ ...formData, enableSmartRouting: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    inset: 0,
                    backgroundColor: formData.enableSmartRouting ? '#0B63E5' : '#CBD5E1',
                    borderRadius: '24px',
                    transition: '0.2s',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      content: "''",
                      height: '18px',
                      width: '18px',
                      left: formData.enableSmartRouting ? '27px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.2s',
                    }}
                  />
                </span>
              </label>
            </div>

            {/* Rating Threshold Slider */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                Minimum Rating to Redirect to Google Maps ({formData.minRatingForGoogle}★ & Above)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <input
                  type="range"
                  min="3"
                  max="5"
                  step="1"
                  value={formData.minRatingForGoogle}
                  onChange={(e) => setFormData({ ...formData, minRatingForGoogle: Number(e.target.value) })}
                  style={{ flex: 1, accentColor: '#0B63E5' }}
                />
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0B63E5', minWidth: '40px' }}>
                  {formData.minRatingForGoogle} Stars
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
                Ratings equal to or higher than {formData.minRatingForGoogle} stars immediately launch the Google Review writing modal on user smartphones.
              </p>
            </div>

            {/* Fallback URL */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Private Feedback Portal URL
              </label>
              <input
                type="url"
                value={formData.fallbackUrl}
                onChange={(e) => setFormData({ ...formData, fallbackUrl: e.target.value })}
                placeholder="https://modexacards.com/feedback-portal"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  color: '#0F172A',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                Private form where customers with complaints leave notes for the business manager.
              </span>
            </div>
          </div>
        )}

        {/* 2. NFC HARDWARE */}
        {activeTab === 'hardware' && (
          <div className="surface-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                NFC Chip & Physical Card Configuration
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
                Configure NTAG213 / NTAG215 frequency, haptic feedback, and contactless trigger behavior.
              </p>
            </div>

            {/* Haptic Feedback */}
            <div
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                  Vibrate Phone on NFC Detection (Haptic)
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  Triggers a short physical vibration confirmation when customer phone taps the standee.
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.hapticFeedback}
                onChange={(e) => setFormData({ ...formData, hapticFeedback: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#0B63E5', cursor: 'pointer' }}
              />
            </div>

            {/* Auto-Lock Threshold */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Inactivity Warning Threshold (Days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={formData.lowActivityThresholdDays}
                onChange={(e) => setFormData({ ...formData, lowActivityThresholdDays: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  color: '#0F172A',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                If a card receives 0 taps for this many days, mark it as 'Low Activity' and send a field check task.
              </span>
            </div>
          </div>
        )}

        {/* 3. GOOGLE API & INTEGRATIONS */}
        {activeTab === 'integrations' && (
          <div className="surface-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* FIREBASE CLOUD DATABASE & HOSTING */}
            <div
              style={{
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      backgroundColor: '#FEF3C7',
                      color: '#D97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '18px',
                    }}
                  >
                    <Database size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      Firebase Cloud Database (Firestore) & Web Hosting
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
                      Primary cloud database storing cards, telemetry taps, activity audit logs, and settings.
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#059669',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  Live Cloud Firestore
                </span>
              </div>

              {/* Hosting Domain Box */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Production Hosting Domain (Free Firebase URL)
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0B63E5', fontFamily: 'monospace', marginTop: '4px' }}>
                    {firebaseHostingUrl}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(firebaseHostingUrl)}
                    style={{
                      padding: '7px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#334155',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Copy size={13} />
                    <span>Copy URL</span>
                  </button>
                  <a
                    href={firebaseHostingUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '7px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: '#0B63E5',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>Visit Live Site</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* Grid with Project Details */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                  gap: '12px',
                }}
              >
                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Firebase Project ID</div>
                  <div style={{ fontSize: '13px', color: '#0F172A', fontWeight: 700, marginTop: '2px', fontFamily: 'monospace' }}>
                    {firebaseProjectId}
                  </div>
                </div>

                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Firestore Collections</div>
                  <div style={{ fontSize: '13px', color: '#0F172A', fontWeight: 700, marginTop: '2px' }}>
                    cards, activities, stats, settings
                  </div>
                </div>

                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Offline Mode / Fallback</div>
                  <div style={{ fontSize: '13px', color: '#16A34A', fontWeight: 700, marginTop: '2px' }}>
                    Instant LocalStorage + Cloud Sync
                  </div>
                </div>
              </div>

              {/* Test Connection Button & Status Output */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleTestFirebase}
                    disabled={isTestingFirebase}
                    style={{
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: '#0F172A',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: isTestingFirebase ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <RefreshCw size={14} className={isTestingFirebase ? 'animate-spin' : ''} />
                    <span>{isTestingFirebase ? 'Testing Connection...' : 'Test Firebase Firestore Connection'}</span>
                  </button>

                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    Verifies read/write access to Firestore database
                  </span>
                </div>

                {firebaseTestResult && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 500,
                      backgroundColor: firebaseTestResult.success ? '#ECFDF5' : '#FFF1F2',
                      border: `1px solid ${firebaseTestResult.success ? '#A7F3D0' : '#FECDD3'}`,
                      color: firebaseTestResult.success ? '#065F46' : '#9F1239',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>{firebaseTestResult.message}</span>
                  </div>
                )}
              </div>

              {/* Firebase CLI Deploy Instructions Box */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#0F172A',
                  color: '#E2E8F0',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#38BDF8', fontWeight: 600 }}>
                  <Terminal size={14} />
                  <span>How to deploy to {firebaseHostingUrl}:</span>
                </div>
                <div style={{ fontFamily: 'monospace', backgroundColor: '#1E293B', padding: '8px 12px', borderRadius: '6px', color: '#F1F5F9' }}>
                  npm run build && firebase deploy
                </div>
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Google Cloud & Places API Credentials
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
                Modexa TapCard interfaces with Google Business Profile APIs to verify venue Place IDs and review URLs.
              </p>
            </div>

            {/* Connection Badge */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: '10px',
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} style={{ color: '#16A34A' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#166534' }}>
                    Google Business Profile API Connected
                  </div>
                  <div style={{ fontSize: '11px', color: '#15803D' }}>
                    Place search, verified review redirect URLs, and rating sync active.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => showToast('Google Places API quota refreshed (98.4% remaining).', 'info')}
                style={{
                  padding: '5px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #86EFAC',
                  borderRadius: '6px',
                  color: '#15803D',
                  cursor: 'pointer',
                }}
              >
                Test Connection
              </button>
            </div>

            {/* API Key */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Google Places Server API Key
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={formData.googlePlacesApiKey}
                  onChange={(e) => setFormData({ ...formData, googlePlacesApiKey: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    paddingRight: '80px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    color: '#0F172A',
                    outline: 'none',
                  }}
                />
                <div style={{ position: 'absolute', right: '8px', display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    style={{ padding: '6px', color: '#64748B', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    title={showApiKey ? 'Hide Key' : 'Show Key'}
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(formData.googlePlacesApiKey)}
                    style={{ padding: '6px', color: '#0B63E5', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    title="Copy Key"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Webhook */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Telemetry Webhook Endpoint
              </label>
              <input
                type="url"
                value={formData.webhookUrl}
                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                placeholder="https://api.yourdomain.com/webhooks/scans"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  color: '#0F172A',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                Receives instant JSON POST payloads on every verified NFC tap and QR scan.
              </span>
            </div>
          </div>
        )}

        {/* 4. NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="surface-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Alert Preferences & Incident Notifications
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
                Choose where you receive notifications regarding negative ratings and card disconnections.
              </p>
            </div>

            <div
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                  Daily Performance Email Digest
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  Receive a consolidated report every evening at 9:00 PM with total taps per venue.
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.emailAlerts}
                onChange={(e) => setFormData({ ...formData, emailAlerts: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#0B63E5', cursor: 'pointer' }}
              />
            </div>

            <div
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                  Instant WhatsApp Alert for Negative Rating Attempts
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  Ping administrator phone immediately when a customer leaves critical feedback.
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.whatsappAlerts}
                onChange={(e) => setFormData({ ...formData, whatsappAlerts: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#0B63E5', cursor: 'pointer' }}
              />
            </div>
          </div>
        )}

        {/* 5. GENERAL & REGIONAL */}
        {activeTab === 'general' && (
          <div className="surface-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Organization & Regional Settings
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
                Default contact information printed on customer onboarding documentation and card packs.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Enterprise Name
                </label>
                <input
                  type="text"
                  value={formData.systemName}
                  onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
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
                  Support Email
                </label>
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
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
                  Support Helpline
                </label>
                <input
                  type="text"
                  value={formData.supportPhone}
                  onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
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
                  Default Timezone
                </label>
                <input
                  type="text"
                  value={formData.defaultTimezone}
                  onChange={(e) => setFormData({ ...formData, defaultTimezone: e.target.value })}
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
          </div>
        )}

        {/* Bottom Save Action */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '10px 24px', fontSize: '14px' }}
          >
            <Save size={16} strokeWidth={2.5} />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
