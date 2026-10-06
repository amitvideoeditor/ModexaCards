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
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8FAFC',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: '3px solid rgba(11, 99, 229, 0.15)',
            borderTopColor: '#0B63E5',
            animation: 'spin 0.7s linear infinite',
          }}
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
