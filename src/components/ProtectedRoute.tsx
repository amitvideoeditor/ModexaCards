import React from 'react';
import { useApp } from '../context/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Reusable AuthGuard / ProtectedRoute
 * - If auth state is still resolving, displays an authentic loading screen
 * - If unauthenticated, denies access and renders nothing (AppContent renders LoginPage)
 * - If authenticated with active authorized role, renders protected children
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, authLoading } = useApp();

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8FAFC',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '3px solid #E2E8F0',
              borderTopColor: '#0B63E5',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', margin: '0 0 6px 0' }}>
            Verifying Security Credentials...
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Checking Firebase Authentication session & permissions
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
