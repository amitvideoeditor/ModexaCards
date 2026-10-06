import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LoginPage, MobileLoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CardsPage } from './pages/CardsPage';
import { BusinessesPage } from './pages/BusinessesPage';
import { BusinessDetailsPage } from './pages/BusinessDetailsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ActivityPage } from './pages/ActivityPage';
import { TeamPage } from './pages/TeamPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { CreateCardsPage } from './pages/CreateCardsPage';
import { ActivateCardDrawer } from './components/ActivateCardDrawer';
import { ChangeLinkModal } from './components/ChangeLinkModal';
import { DisableCardModal } from './components/DisableCardModal';
import { ScanModal } from './components/ScanModal';
import { NotificationsModal } from './components/NotificationsModal';
import { ToastContainer } from './components/Toast';
import { CustomerTapRedirectPage } from './pages/CustomerTapRedirectPage';

import { ProtectedRoute } from './components/ProtectedRoute';

function getTapCardIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  // Path match: /r/CRD-0001 (or /c/CRD-0001)
  const pathMatch = window.location.pathname.match(/\/(?:r|c)\/([^/?#]+)/i);
  if (pathMatch && pathMatch[1]) return decodeURIComponent(pathMatch[1]);

  // Hash match: #/r/CRD-0001 (or #/c/CRD-0001)
  const hashMatch = window.location.hash.match(/#\/?(?:r|c)\/([^/?#]+)/i);
  if (hashMatch && hashMatch[1]) return decodeURIComponent(hashMatch[1]);

  // Search parameter: ?r=CRD-0001 or ?c=CRD-0001 or ?card=CRD-0001
  const searchParams = new URLSearchParams(window.location.search);
  const paramCard = searchParams.get('r') || searchParams.get('c') || searchParams.get('card');
  if (paramCard) return paramCard;

  return null;
}

const AppContent: React.FC = () => {
  const {
    currentView,
    isAuthenticated,
    authLoading,
    isMobile,
    cards,
  } = useApp();

  const [tapCardId, setTapCardId] = React.useState<string | null>(getTapCardIdFromUrl);

  React.useEffect(() => {
    const handleUrlChange = () => {
      setTapCardId(getTapCardIdFromUrl());
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // 0. CUSTOMER LIVE TAP / QR SCAN REDIRECT SCREEN (Always Public)
  if (tapCardId) {
    return (
      <CustomerTapRedirectPage
        cardId={tapCardId}
        cards={cards}
        onOpenAdmin={() => {
          if (!isAuthenticated) {
            window.history.pushState(null, '', '/#/login');
            window.location.hash = '#/login';
          } else {
            window.history.pushState(null, '', '/#/dashboard');
            window.location.hash = '#/dashboard';
          }
          setTapCardId(null);
        }}
      />
    );
  }

  // 1. AUTH LOADING (Clean minimal smooth spinner like Google & Instagram, no intrusive text)
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

  // 2. LOGIN SCREEN
  if (!isAuthenticated || currentView === 'login') {
    if (isMobile) {
      return (
        <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#FFFFFF' }}>
          <MobileLoginPage />
          <ToastContainer />
        </div>
      );
    }

    return (
      <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#F8FAFC' }}>
        <LoginPage />
        <ToastContainer />
      </div>
    );
  }

  // Active Main Content based on currentView
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage />;
      case 'cards':
        return <CardsPage />;
      case 'create-cards':
        return <CreateCardsPage />;
      case 'businesses':
        return <BusinessesPage />;
      case 'business-details':
        return <BusinessDetailsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'activity':
        return <ActivityPage />;
      case 'team':
        return <TeamPage />;
      case 'settings':
        return <SettingsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  // 3. MOBILE VIEW (Screen width < 1024px)
  if (isMobile) {
    return (
      <ProtectedRoute>
        <div
          style={{
            minHeight: '100vh',
            width: '100%',
            backgroundColor: '#FFFFFF',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <main style={{ flex: 1, paddingBottom: '76px', width: '100%' }}>
            {renderCurrentView()}
          </main>

          {/* Fixed Mobile Bottom Navigation */}
          <MobileBottomNav />

          {/* Overlays & Modals */}
          <ActivateCardDrawer />
          <ChangeLinkModal />
          <DisableCardModal />
          <ScanModal />
          <NotificationsModal />
          <ToastContainer />
        </div>
      </ProtectedRoute>
    );
  }

  // 4. DESKTOP SAAS DASHBOARD (Desktop viewport >= 1024px)
  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#F8FAFC', display: 'flex' }}>
        {/* Desktop Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh' }}>
          <Topbar />
          <main style={{ flex: 1, overflowY: 'auto' }}>
            {renderCurrentView()}
          </main>
        </div>

        {/* Desktop Modals */}
        <ChangeLinkModal />
        <DisableCardModal />
        <ScanModal />
        <NotificationsModal />
        <ToastContainer />
      </div>
    </ProtectedRoute>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
