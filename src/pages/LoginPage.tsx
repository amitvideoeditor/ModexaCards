import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Zap, BarChart2, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ReviewTapLogo } from '../components/ReviewTapLogo';
import cardWithTextImg from '../assets/review-card-with-text.png';

export const LoginPage: React.FC = () => {
  const { login, sendPasswordResetLink, navigateTo, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Forgot / Reset Password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    const cleanMail = resetEmail.trim().toLowerCase();
    if (!cleanMail) {
      setResetError('Please enter your registered email address.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await sendPasswordResetLink(cleanMail);
      if (res.success) {
        setResetSuccess(res.message);
        showToast(res.message, 'success');
      } else {
        setResetError(res.message);
        showToast(res.message, 'error');
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email.trim() || !password) {
      const msg = 'Please enter both email and password.';
      setErrorMessage(msg);
      showToast(msg, 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        showToast(res.message, 'success');
        navigateTo('dashboard');
      } else {
        setErrorMessage(res.message);
        showToast(res.message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      {/* Container Card matching Desktop Reference Screen 1 */}
      <div
        style={{
          width: '100%',
          maxWidth: '960px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 24px rgba(15, 23, 42, 0.06)',
          display: 'flex',
          overflow: 'hidden',
          minHeight: '560px',
        }}
      >
        {/* LEFT COLUMN: Login Form */}
        <div
          style={{
            flex: 1,
            padding: '48px 44px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {/* Logo */}
            <div style={{ marginBottom: '24px' }}>
              <ReviewTapLogo size="md" />
            </div>

            {/* Title & Subtitle */}
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#0F172A',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                marginBottom: '8px',
              }}
            >
              Modexa TapCard
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '32px' }}>
              Manage Google Review Cards<br />for local businesses
            </p>

            {/* Form */}
            {isForgotPassword ? (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setResetError('');
                      setResetSuccess('');
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#0B63E5',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Login</span>
                  </button>
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                    Reset Password
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                    Enter your registered email address to receive a secure Firebase password reset link.
                  </p>
                </div>

                {/* Email */}
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94A3B8',
                    }}
                  />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter registered email address"
                    required
                    style={{
                      width: '100%',
                      paddingLeft: '40px',
                      paddingRight: '14px',
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                </div>

                {resetError && (
                  <div
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '8px',
                      color: '#DC2626',
                      fontSize: '12.5px',
                      lineHeight: 1.4,
                    }}
                  >
                    {resetError}
                  </div>
                )}

                {resetSuccess && (
                  <div
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      borderRadius: '8px',
                      color: '#065F46',
                      fontSize: '12.5px',
                      lineHeight: 1.4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <CheckCircle2 size={16} color="#059669" />
                    <span>{resetSuccess}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isResetting}
                  className="btn-primary"
                  style={{ width: '100%', padding: '11px', borderRadius: '8px', marginTop: '2px' }}
                >
                  {isResetting ? 'Sending Reset Link...' : 'Send Password Reset Link'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Email */}
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94A3B8',
                    }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter registered email"
                    required
                    style={{
                      width: '100%',
                      paddingLeft: '40px',
                      paddingRight: '14px',
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Password */}
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={17}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94A3B8',
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    style={{
                      width: '100%',
                      paddingLeft: '40px',
                      paddingRight: '40px',
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#0F172A',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94A3B8',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {errorMessage && (
                  <div
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '8px',
                      color: '#DC2626',
                      fontSize: '12.5px',
                      lineHeight: 1.4,
                    }}
                  >
                    {errorMessage}
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                  style={{ width: '100%', padding: '11px', borderRadius: '8px', marginTop: '4px' }}
                >
                  {isLoading ? (
                    <span className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', display: 'inline-block' }} />
                  ) : (
                    'Login'
                  )}
                </button>

                {/* Forgot Password */}
                <div style={{ textAlign: 'center', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email.trim());
                      setResetError('');
                      setResetSuccess('');
                      setIsForgotPassword(true);
                    }}
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#0B63E5',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
            )}
          </div>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #F1F5F9', fontSize: '11px', color: '#94A3B8' }}>
            Modexa TapCard internal platform • Authorized field agents only
          </div>
        </div>

        {/* RIGHT COLUMN: Illustration & Features */}
        <div
          style={{
            flex: 1.1,
            backgroundColor: '#F8FAFC',
            borderLeft: '1px solid #E2E8F0',
            padding: '36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Card Stand Illustration with Handwritten text & arrow */}
          <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ maxWidth: '380px', width: '100%' }}>
              <img
                src={cardWithTextImg}
                alt="NFC + QR Google Review Card Stand"
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 16px rgba(11, 99, 229, 0.08))',
                }}
              />
            </div>
          </div>

          {/* 3 Benefit Pills at Bottom matching Desktop Reference */}
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              paddingTop: '20px',
              borderTop: '1px solid #E2E8F0',
            }}
          >
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '12px 8px', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#0B63E5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                <Zap size={14} />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#0F172A', lineHeight: 1.3 }}>
                Get more genuine reviews
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '12px 8px', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#0B63E5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                <BarChart2 size={14} />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#0F172A', lineHeight: 1.3 }}>
                Easy setup in seconds
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '12px 8px', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#0B63E5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                <ShieldCheck size={14} />
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#0F172A', lineHeight: 1.3 }}>
                Trusted by local businesses
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MobileLoginPage: React.FC = () => {
  const { login, sendPasswordResetLink, navigateTo, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Mobile Forgot / Reset Password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    const cleanMail = resetEmail.trim().toLowerCase();
    if (!cleanMail) {
      setResetError('Please enter your registered email address.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await sendPasswordResetLink(cleanMail);
      if (res.success) {
        setResetSuccess(res.message);
        showToast(res.message, 'success');
      } else {
        setResetError(res.message);
        showToast(res.message, 'error');
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email.trim() || !password) {
      const msg = 'Please enter both email and password.';
      setErrorMessage(msg);
      showToast(msg, 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        showToast(res.message, 'success');
        navigateTo('dashboard');
      } else {
        setErrorMessage(res.message);
        showToast(res.message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        boxSizing: 'border-box',
      }}
    >
      {/* Centered Grouped Container matching Phone_Login_Page_Reference.png */}
      <div
        style={{
          width: '100%',
          maxWidth: '340px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Star Logo */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#1A73E8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            boxShadow: '0 6px 16px rgba(26, 115, 232, 0.28)',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '32px', height: '32px' }}>
            <path
              d="M12 2.5L14.9 8.4L21.4 9.3L16.7 13.9L17.8 20.4L12 17.3L6.2 20.4L7.3 13.9L2.6 9.3L9.1 8.4L12 2.5Z"
              fill="white"
            />
          </svg>
        </div>

        {/* Title & Subtitle */}
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#111827',
            letterSpacing: '-0.03em',
            margin: '0 0 4px 0',
            lineHeight: 1.2,
          }}
        >
          {isForgotPassword ? 'Reset Password' : 'Modexa TapCard'}
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: '#64748B',
            marginTop: '0',
            marginBottom: '18px',
            fontWeight: 400,
          }}
        >
          {isForgotPassword ? 'Enter registered email address to receive password reset link' : 'Activate Google Review Cards instantly'}
        </p>

        {isForgotPassword ? (
          /* Forgot / Reset Password Form */
          <form
            onSubmit={handleResetPassword}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Email Container */}
            <div
              style={{
                border: '1.5px solid #E2E8F0',
                borderRadius: '14px',
                backgroundColor: '#FFFFFF',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
              }}
            >
              <Mail size={18} style={{ color: '#64748B', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, lineHeight: 1 }}>
                  Registered Email
                </span>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter registered email"
                  required
                  style={{
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#0F172A',
                    padding: '3px 0 0 0',
                    width: '100%',
                  }}
                />
              </div>
            </div>

            {resetError && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '12px',
                  color: '#DC2626',
                  fontSize: '12.5px',
                  lineHeight: 1.4,
                  textAlign: 'left',
                }}
              >
                {resetError}
              </div>
            )}

            {resetSuccess && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: '12px',
                  color: '#065F46',
                  fontSize: '12.5px',
                  lineHeight: 1.4,
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle2 size={16} color="#059669" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {/* Send Reset Link Button */}
            <button
              type="submit"
              disabled={isResetting}
              style={{
                width: '100%',
                height: '46px',
                backgroundColor: '#1A73E8',
                color: '#FFFFFF',
                borderRadius: '14px',
                border: 'none',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '4px',
                boxShadow: '0 4px 14px rgba(26, 115, 232, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              {isResetting ? (
                <span
                  className="animate-spin"
                  style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#FFFFFF',
                    borderRadius: '50%',
                    display: 'inline-block',
                  }}
                />
              ) : (
                'Send Password Reset Link'
              )}
            </button>

            {/* Back to Login Button */}
            <div style={{ marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setResetError('');
                  setResetSuccess('');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#1A73E8',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <ArrowLeft size={15} />
                Back to Login
              </button>
            </div>
          </form>
        ) : (
          /* Login Form */
          <form
            onSubmit={handleLogin}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Email Container with stacked label */}
            <div
              style={{
                border: '1.5px solid #E2E8F0',
                borderRadius: '14px',
                backgroundColor: '#FFFFFF',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
                transition: 'border-color 0.15s ease',
              }}
            >
              <Mail size={18} style={{ color: '#64748B', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, lineHeight: 1 }}>
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter registered email"
                  required
                  style={{
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#0F172A',
                    padding: '3px 0 0 0',
                    width: '100%',
                  }}
                />
              </div>
            </div>

            {/* Password Container with stacked label & eye toggle */}
            <div
              style={{
                border: '1.5px solid #E2E8F0',
                borderRadius: '14px',
                backgroundColor: '#FFFFFF',
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
                transition: 'border-color 0.15s ease',
              }}
            >
              <Lock size={18} style={{ color: '#64748B', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, lineHeight: 1 }}>
                  Password
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  style={{
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#0F172A',
                    padding: '3px 0 0 0',
                    width: '100%',
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errorMessage && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '12px',
                  color: '#DC2626',
                  fontSize: '12.5px',
                  lineHeight: 1.4,
                  textAlign: 'left',
                }}
              >
                {errorMessage}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                height: '46px',
                backgroundColor: '#1A73E8',
                color: '#FFFFFF',
                borderRadius: '14px',
                border: 'none',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '4px',
                boxShadow: '0 4px 14px rgba(26, 115, 232, 0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              {isLoading ? (
                <span
                  className="animate-spin"
                  style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#FFFFFF',
                    borderRadius: '50%',
                    display: 'inline-block',
                  }}
                />
              ) : (
                'Login'
              )}
            </button>

            {/* Forgot Password Link */}
            <div style={{ marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setResetEmail(email);
                  setResetError('');
                  setResetSuccess('');
                }}
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#1A73E8',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                Forgot password?
              </button>
            </div>
          </form>
        )}

        {/* Acrylic Stand Illustration placed directly below with tight gap */}
        <div
          style={{
            width: '100%',
            maxWidth: '270px',
            marginTop: '16px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <img
            src={cardWithTextImg}
            alt="NFC + QR Google Review Stand"
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 6px 16px rgba(11, 99, 229, 0.08))',
            }}
          />
        </div>
      </div>
    </div>
  );
};
