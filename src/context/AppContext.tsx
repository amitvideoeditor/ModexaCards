import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  CardItem,
  CardStatus,
  ActivityRecord,
  StatSummary,
  ViewScreen,
  DesktopNav,
  MobileTab,
  ToastNotification,
  AppNotification,
  TeamMember,
  UserProfile,
  PlatformSettings,
} from '../types';
import {
  initialCards,
  initialStats,
  recentActivities,
  initialTeamMembers,
  defaultPlatformSettings,
} from '../data/mockData';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword as fbUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User,
} from 'firebase/auth';
import {
  auth,
  getUserDocFromFirestore,
  type FirestoreUserData,
  isInitialized as isFirebaseInitialized,
  getCardsFromFirestore,
  saveCardToFirestore,
  saveBatchCardsToFirestore,
  updateCardInFirestore,
  recordCardTapInFirestore,
  saveActivityToFirestore,
  getActivitiesFromFirestore,
  saveStatsToFirestore,
  getStatsFromFirestore,
  saveSettingsToFirestore,
  getSettingsFromFirestore,
  testFirebaseConnection,
  deleteCardFromFirestore,
  deleteAllCardsFromFirestore,
} from '../firebase/config';

interface AppContextType {
  user: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  authLoading: boolean;
  firebaseUser: User | null;
  authUserDoc: FirestoreUserData | null;
  cards: CardItem[];
  stats: StatSummary;
  activities: ActivityRecord[];
  addActivity: (activity: Omit<ActivityRecord, 'id' | 'dateTime'>) => void;
  simulateNfcTap: (cardId?: string) => void;
  teamMembers: TeamMember[];
  addTeamMember: (member: Omit<TeamMember, 'id' | 'lastActive'>, initialPassword?: string) => void;
  removeTeamMember: (id: string) => void;
  updateTeamMemberRole: (id: string, newRole: TeamMember['role']) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>, newPassword?: string) => void;
  updateUserPasswordByAdmin: (email: string, newPass?: string) => Promise<{ success: boolean; message: string }>;
  settings: PlatformSettings;
  updateSettings: (updates: Partial<PlatformSettings>) => void;
  currentView: ViewScreen;
  activeDesktopNav: DesktopNav;
  activeMobileTab: MobileTab;
  selectedCardId: string;
  isActivateModalOpen: boolean;
  isChangeLinkModalOpen: boolean;
  isDisableCardModalOpen: boolean;
  isScanModalOpen: boolean;
  isNotificationsOpen: boolean;
  toasts: ToastNotification[];
  notifications: AppNotification[];
  unreadNotifsCount: number;
  markAllNotifsAsRead: () => void;
  markNotifAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  previewDevice: 'auto' | 'desktop' | 'mobile';
  setPreviewDevice: (device: 'auto' | 'desktop' | 'mobile') => void;
  isMobile: boolean;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  openActivateModal: (cardId?: string) => void;
  closeActivateModal: () => void;
  openChangeLinkModal: (cardId?: string) => void;
  closeChangeLinkModal: () => void;
  openDisableCardModal: (cardId?: string) => void;
  closeDisableCardModal: () => void;
  openScanModal: () => void;
  closeScanModal: () => void;
  openNotifications: () => void;
  closeNotifications: () => void;
  activateCard: (params: { cardId: string; businessName: string; reviewUrl: string; ownerName: string; phone?: string; category?: string; location?: string }) => void;
  updateCard: (cardId: string, updates: Partial<CardItem>) => void;
  changeCardLink: (cardId: string, newUrl: string) => void;
  disableCard: (cardId: string) => void;
  enableCard: (cardId: string) => void;
  addBatchCards: (newCards: CardItem[], batchNote?: string) => void;
  addNewSingleCard: (newCard: CardItem) => void;
  navigateTo: (view: ViewScreen, cardId?: string, replace?: boolean) => void;
  goBack: () => void;
  setActiveDesktopNav: (nav: DesktopNav) => void;
  setActiveMobileTab: (tab: MobileTab) => void;
  globalSearch: string;
  setGlobalSearch: (val: string) => void;
  isFirebaseConnected: boolean;
  firebaseProjectId: string;
  firebaseHostingUrl: string;
  testFirebase: () => Promise<{ success: boolean; message: string }>;
  deleteCard: (cardId: string) => Promise<boolean>;
  clearAllCards: () => Promise<boolean>;
  assignCard: (cardId: string, personName: string, businessName?: string, location?: string) => void;
  canManageInventory: boolean;
  canAssignCards: boolean;
  canDeleteCards: boolean;
  canToggleCardStatus: (card: CardItem) => boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updatePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, currentPass?: string, newPass?: string) => Promise<{ success: boolean; message: string }>;
  sendPasswordResetLink: (email: string) => Promise<{ success: boolean; message: string }>;
}

export function getHashForView(view: ViewScreen, cardId?: string): string {
  switch (view) {
    case 'dashboard':
      return '#/dashboard';
    case 'cards':
      return '#/cards';
    case 'create-cards':
      return '#/create-cards';
    case 'businesses':
      return '#/businesses';
    case 'business-details':
      return cardId ? `#/business-details?card=${encodeURIComponent(cardId)}` : '#/business-details';
    case 'analytics':
      return '#/analytics';
    case 'activity':
      return '#/activity';
    case 'team':
      return '#/team';
    case 'settings':
      return '#/settings';
    case 'profile':
      return '#/profile';
    case 'login':
      return '#/login';
    default:
      return '#/dashboard';
  }
}

export function parseHash(hash: string): { view: ViewScreen; cardId?: string } {
  if (!hash || hash === '#' || hash === '#/') {
    return { view: 'dashboard' };
  }
  const clean = hash.replace(/^#\/?/, '');
  const [path, queryStr] = clean.split('?');
  const params = new URLSearchParams(queryStr || '');
  const cardId = params.get('card') || undefined;

  const validViews: ViewScreen[] = [
    'login',
    'dashboard',
    'cards',
    'create-cards',
    'businesses',
    'business-details',
    'analytics',
    'activity',
    'team',
    'settings',
    'profile',
  ];

  const view = validViews.includes(path as ViewScreen) ? (path as ViewScreen) : 'dashboard';
  return { view, cardId };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function getInitialStoredCards(): CardItem[] {
  if (typeof window === 'undefined') return initialCards;
  try {
    // Purge legacy storage from previous builds if present
    if (localStorage.getItem('modexa_cards')) {
      localStorage.removeItem('modexa_cards');
    }
    const raw = localStorage.getItem('modexa_cards_v5');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse cached cards:', e);
  }
  return initialCards;
}

function getInitialStoredStats(): StatSummary {
  if (typeof window === 'undefined') return initialStats;
  try {
    const raw = localStorage.getItem('modexa_stats');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return initialStats;
}

function getInitialStoredActivities(): ActivityRecord[] {
  if (typeof window === 'undefined') return recentActivities;
  try {
    const raw = localStorage.getItem('modexa_activities');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return recentActivities;
}

function getInitialStoredSettings(): PlatformSettings {
  if (typeof window === 'undefined') return defaultPlatformSettings;
  try {
    const raw = localStorage.getItem('modexa_settings');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return defaultPlatformSettings;
}

export const guestProfile: UserProfile = {
  name: 'Staff Member',
  email: '',
  role: 'Viewer',
  phone: '',
  location: 'New Delhi, India',
  bio: 'Unauthenticated visitor',
  department: 'Field Operations',
  notificationsEnabled: false,
};

export function mapFirestoreUserToProfile(userDoc: FirestoreUserData, fbUser: User): UserProfile {
  const roleRaw = (userDoc.role || 'admin').trim();
  const capitalizedRole = roleRaw.charAt(0).toUpperCase() + roleRaw.slice(1).toLowerCase();
  return {
    name: userDoc.name || fbUser.displayName || 'Administrator',
    email: fbUser.email || userDoc.email || '',
    role: capitalizedRole,
    phone: userDoc.phone || '',
    location: userDoc.location || 'New Delhi, India',
    bio: userDoc.bio || 'Modexa TapCard System Administrator',
    department: userDoc.department || 'Executive Administration',
    notificationsEnabled: true,
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialNav = typeof window !== 'undefined' ? parseHash(window.location.hash) : { view: 'dashboard' as ViewScreen };

  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authUserDoc, setAuthUserDoc] = useState<FirestoreUserData | null>(null);
  const [isAuthenticated, setIsAuthenticatedState] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile>(guestProfile);

  const setIsAuthenticated = (val: boolean) => {
    if (!val) {
      if (auth) {
        signOut(auth).catch(() => {});
      }
      setIsAuthenticatedState(false);
      setUser(guestProfile);
    } else {
      console.warn('[Security] Authentication cannot be set manually. Firebase Authentication is the sole source of truth.');
    }
  };

  const [cards, setCards] = useState<CardItem[]>(getInitialStoredCards);
  const [stats, setStats] = useState<StatSummary>(getInitialStoredStats);
  const [activities, setActivities] = useState<ActivityRecord[]>(getInitialStoredActivities);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [settings, setSettings] = useState<PlatformSettings>(getInitialStoredSettings);
  const [currentView, setCurrentView] = useState<ViewScreen>(initialNav.view || 'login');
  const [activeDesktopNav, setActiveDesktopNav] = useState<DesktopNav>('Dashboard');
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('home');
  const [selectedCardId, setSelectedCardId] = useState<string>(initialNav.cardId || '');
  const [isActivateModalOpen, setIsActivateModalOpen] = useState<boolean>(false);
  const [isChangeLinkModalOpen, setIsChangeLinkModalOpen] = useState<boolean>(false);
  const [isDisableCardModalOpen, setIsDisableCardModalOpen] = useState<boolean>(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('modexa_notifications_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('modexa_notifications_v3', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  const markAllNotifsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markNotifAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const [previewDevice, setPreviewDevice] = useState<'auto' | 'desktop' | 'mobile'>('auto');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync to localStorage using modern v5 key
  useEffect(() => {
    try {
      localStorage.setItem('modexa_cards_v5', JSON.stringify(cards));
    } catch (e) {}
  }, [cards]);

  useEffect(() => {
    try {
      localStorage.setItem('modexa_stats', JSON.stringify(stats));
    } catch (e) {}
  }, [stats]);

  useEffect(() => {
    try {
      localStorage.setItem('modexa_activities', JSON.stringify(activities));
    } catch (e) {}
  }, [activities]);

  useEffect(() => {
    try {
      localStorage.setItem('modexa_settings', JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);


  // Sync with Firestore Cloud Database on mount
  useEffect(() => {
    let isMounted = true;
    async function syncFirestoreData() {
      try {
        const remoteCards = await getCardsFromFirestore();
        if (isMounted && remoteCards && remoteCards.length > 0) {
          // Filter out legacy sample cards (CRD-0042 to CRD-0038)
          const validCards = remoteCards.filter(
            (c) => !['CRD-0042', 'CRD-0041', 'CRD-0040', 'CRD-0039', 'CRD-0038'].includes(c.id)
          );
          setCards(validCards);
        }
      } catch (err) {
        console.warn('Firestore card sync error:', err);
      }

      try {
        const remoteActivities = await getActivitiesFromFirestore();
        if (isMounted && remoteActivities && remoteActivities.length > 0) {
          setActivities(remoteActivities);
        }
      } catch (err) {}

      try {
        const remoteStats = await getStatsFromFirestore();
        if (isMounted && remoteStats) {
          setStats(remoteStats);
        }
      } catch (err) {}

      try {
        const remoteSettings = await getSettingsFromFirestore();
        if (isMounted && remoteSettings) {
          setSettings((prev) => ({ ...prev, ...remoteSettings }));
        }
      } catch (err) {}
    }

    syncFirestoreData();
    return () => {
      isMounted = false;
    };
  }, []);

  const isMobile =
    previewDevice === 'mobile' ? true : previewDevice === 'desktop' ? false : windowWidth < 1024;

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success', cardId?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    // Add silently to in-app notification center
    const newNotif: AppNotification = {
      id,
      type,
      title: type === 'success' ? 'Completed' : type === 'error' ? 'Error Alert' : type === 'warning' ? 'Notice' : 'Update',
      message,
      time: 'Just now',
      cardId,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
    showToast('Profile information updated successfully!', 'success');
  };

  const updateSettings = (updates: Partial<PlatformSettings>) => {
    if (user.role !== 'Admin') {
      showToast('Permission Denied: System Settings can only be modified by an Administrator.', 'error');
      return;
    }
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      saveSettingsToFirestore(next).catch(console.warn);
      return next;
    });
    showToast('Platform settings saved successfully!', 'success');
  };

  const addTeamMember = (member: Omit<TeamMember, 'id' | 'lastActive'>, _initialPassword?: string) => {
    if (user.role !== 'Admin') {
      showToast('Permission Denied: Only Admin can create new users or IDs.', 'error');
      return;
    }
    const colors = ['#0B63E5', '#7C3AED', '#059669', '#D97706', '#DB2777', '#0284C7'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newMember: TeamMember = {
      ...member,
      id: `team-${Date.now()}`,
      lastActive: 'Just now',
      avatarColor: randomColor,
    };
    setTeamMembers((prev) => [newMember, ...prev]);

    addActivity({
      type: 'Member Joined',
      source: `Admin Console (${user.name})`,
      cardId: 'TEAM-ID',
      businessName: 'Modexa Staff Directory',
      location: member.assignedRegion || 'Delhi NCR',
      details: `New ${member.role} profile registered for ${member.name} (${member.email}) by Admin ${user.name}`,
      performer: user.name,
    });

    showToast(`Added ${newMember.name} to the team!`, 'success');
  };

  const removeTeamMember = (id: string) => {
    if (user.role !== 'Admin') {
      showToast('Permission Denied: Only Admin can delete users/IDs.', 'error');
      return;
    }
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    showToast('Team member removed from active directory.', 'info');
  };

  const updateTeamMemberRole = (id: string, newRole: TeamMember['role']) => {
    if (user.role !== 'Admin') {
      showToast('Permission Denied: Only Admin can edit user roles.', 'error');
      return;
    }
    setTeamMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role: newRole } : m)));
    showToast('Member role permissions updated.', 'success');
  };

  const updateTeamMember = (id: string, updates: Partial<TeamMember>, _newPassword?: string) => {
    if (user.role !== 'Admin') {
      showToast('Permission Denied: Only Admin can edit user profiles.', 'error');
      return;
    }
    setTeamMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return { ...m, ...updates };
        }
        return m;
      })
    );

    showToast('Team member details updated successfully.', 'success');
  };

  const updateUserPasswordByAdmin = async (email: string, _newPass?: string): Promise<{ success: boolean; message: string }> => {
    if (user.role !== 'Admin') {
      return { success: false, message: 'Permission Denied: Only Admin can manage user credentials.' };
    }
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return { success: false, message: 'Invalid email address.' };
    }

    try {
      if (auth) {
        await sendPasswordResetEmail(auth, cleanEmail);
      }
      addActivity({
        type: 'Password Reset',
        source: `Admin Console (${user.name})`,
        cardId: 'AUTH-SEC',
        businessName: 'Modexa Authentication',
        location: 'New Delhi HQ',
        details: `Password reset link sent to ${cleanEmail} by Admin ${user.name}`,
        performer: user.name,
      });

      showToast(`Password reset link sent to ${cleanEmail}!`, 'success');
      return { success: true, message: `Password reset link sent to ${cleanEmail}.` };
    } catch (err: any) {
      console.warn('[Firebase Auth] Admin reset email error:', err);
      return { success: false, message: 'Could not send password reset link. Please verify the email.' };
    }
  };

  const addActivity = (activity: Omit<ActivityRecord, 'id' | 'dateTime'>) => {
    const newAct: ActivityRecord = {
      ...activity,
      id: `act-${Date.now()}`,
      dateTime: 'Just now',
    };
    setActivities((prev) => [newAct, ...prev]);
    saveActivityToFirestore(newAct).catch(console.warn);
  };

  const simulateNfcTap = (cardId: string = 'CRD-0041') => {
    const card = cards.find((c) => c.id === cardId) || cards[0];

    const nextStats = {
      ...stats,
      totalTaps: stats.totalTaps + 1,
      todayScans: stats.todayScans + 1,
    };
    setStats(nextStats);
    saveStatsToFirestore(nextStats).catch(console.warn);

    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, nfcTaps: c.nfcTaps + 1, lastActivity: 'Just now' } : c))
    );

    recordCardTapInFirestore(card.id, 'nfc').catch(console.warn);

    showToast(`Live Tap detected & recorded for ${card.businessName}!`, 'success');
  };

  const openActivateModal = (cardId: string = 'CRD-0042') => {
    setSelectedCardId(cardId);
    setIsActivateModalOpen(true);
    if (!isMobile && currentView !== 'cards' && currentView !== 'business-details') {
      navigateTo('cards', cardId);
    }
  };

  const closeActivateModal = () => {
    setIsActivateModalOpen(false);
  };

  const openChangeLinkModal = (cardId?: string) => {
    if (cardId) setSelectedCardId(cardId);
    setIsChangeLinkModalOpen(true);
  };

  const closeChangeLinkModal = () => {
    setIsChangeLinkModalOpen(false);
  };

  const openDisableCardModal = (cardId?: string) => {
    if (cardId) setSelectedCardId(cardId);
    setIsDisableCardModalOpen(true);
  };

  const closeDisableCardModal = () => {
    setIsDisableCardModalOpen(false);
  };

  const openScanModal = () => setIsScanModalOpen(true);
  const closeScanModal = () => setIsScanModalOpen(false);

  const openNotifications = () => setIsNotificationsOpen(true);
  const closeNotifications = () => setIsNotificationsOpen(false);

  const activateCard = async ({
    cardId,
    businessName,
    reviewUrl,
    ownerName,
    phone,
    category,
    location,
  }: {
    cardId: string;
    businessName: string;
    reviewUrl: string;
    ownerName: string;
    phone?: string;
    category?: string;
    location?: string;
  }) => {
    const cleanId = cardId.trim();
    const finalBusinessName = businessName.trim() || 'Activated Business';
    const finalReviewUrl = reviewUrl.trim();
    const finalOwner = ownerName.trim() || user.name;
    const finalPhone = phone ? phone.trim() : '';
    const finalCategory = category?.trim() || 'Retail & Services';
    const finalLocation = location?.trim() || 'New Delhi';

    try {
      const updates: Partial<CardItem> = {
        id: cleanId,
        businessName: finalBusinessName,
        status: 'Active',
        googleReviewUrl: finalReviewUrl,
        owner: finalOwner,
        phone: finalPhone,
        category: finalCategory,
        location: finalLocation,
        lastActivity: 'Just now',
      };

      await updateCardInFirestore(cleanId, updates);

      setCards((prev) =>
        prev.map((c) => {
          if (c.id === cleanId) {
            return {
              ...c,
              ...updates,
              id: cleanId,
              status: 'Active',
            };
          }
          return c;
        })
      );

      setStats((prev) => {
        const next = {
          ...prev,
          activeCards: prev.activeCards + 1,
        };
        saveStatsToFirestore(next).catch(console.warn);
        return next;
      });

      addActivity({
        type: 'Card Activated',
        source: `Admin Portal (${user.name})`,
        cardId: cleanId,
        businessName: finalBusinessName,
        location: finalLocation,
        details: `Card activated and assigned to ${finalOwner}`,
      });

      showToast(`Card ${cleanId} activated successfully for ${finalBusinessName}!`, 'success');
      closeActivateModal();
    } catch (err: any) {
      console.error(`[Firestore Error] Failed to activate card ${cleanId}:`, err);
      showToast(`Firestore write failed for ${cleanId}: ${err?.message || 'Check Firestore security rules'}`, 'error');
    }
  };

  const updateCard = async (cardId: string, updates: Partial<CardItem>) => {
    const cleanId = cardId.trim();
    try {
      await updateCardInFirestore(cleanId, { ...updates, id: cleanId });

      setCards((prev) =>
        prev.map((c) => {
          if (c.id === cleanId) {
            return {
              ...c,
              ...updates,
              id: cleanId,
              lastActivity: 'Just now',
            };
          }
          return c;
        })
      );

      addActivity({
        type: 'Card Activated',
        source: `Admin Portal (${user.name})`,
        cardId: cleanId,
        businessName: updates.businessName,
        location: updates.location,
        details: 'Card details updated via Desktop Editor',
      });

      showToast(`Card ${cleanId} details saved successfully!`, 'success');
    } catch (err: any) {
      console.error(`[Firestore Error] Failed to update card ${cleanId}:`, err);
      showToast(`Firestore write failed for ${cleanId}: ${err?.message || 'Check Firestore security rules'}`, 'error');
    }
  };

  const changeCardLink = async (cardId: string, newUrl: string) => {
    const cleanId = cardId.trim();
    const cleanUrl = newUrl.trim();
    try {
      await updateCardInFirestore(cleanId, { googleReviewUrl: cleanUrl, id: cleanId });

      setCards((prev) =>
        prev.map((c) => (c.id === cleanId ? { ...c, googleReviewUrl: cleanUrl } : c))
      );

      const card = cards.find((c) => c.id === cleanId);
      addActivity({
        type: 'Link Updated',
        source: `Admin Portal (${user.name})`,
        cardId: cleanId,
        businessName: card?.businessName,
        location: card?.location,
        details: `Review link destination updated to ${cleanUrl}`,
      });

      showToast(`Destination URL updated for card ${cleanId}`, 'success');
      closeChangeLinkModal();
    } catch (err: any) {
      console.error(`[Firestore Error] Failed to update review URL for ${cleanId}:`, err);
      showToast(`Firestore write failed for ${cleanId}: ${err?.message || 'Check Firestore security rules'}`, 'error');
    }
  };

  const disableCard = async (cardId: string) => {
    const cleanId = cardId.trim();
    try {
      await updateCardInFirestore(cleanId, { status: 'Inactive', id: cleanId });

      setCards((prev) =>
        prev.map((c) => (c.id === cleanId ? { ...c, status: 'Inactive' } : c))
      );
      setStats((prev) => {
        const next = {
          ...prev,
          activeCards: Math.max(0, prev.activeCards - 1),
        };
        saveStatsToFirestore(next).catch(console.warn);
        return next;
      });

      const card = cards.find((c) => c.id === cleanId);
      addActivity({
        type: 'Card Disabled',
        source: `Admin Portal (${user.name})`,
        cardId: cleanId,
        businessName: card?.businessName,
        location: card?.location,
        details: 'Card temporarily deactivated',
      });

      showToast(`Card ${cleanId} has been disabled.`, 'warning');
      closeDisableCardModal();
    } catch (err: any) {
      console.error(`[Firestore Error] Failed to disable card ${cleanId}:`, err);
      showToast(`Firestore write failed for ${cleanId}: ${err?.message || 'Check Firestore security rules'}`, 'error');
    }
  };

  const enableCard = async (cardId: string) => {
    const cleanId = cardId.trim();
    try {
      await updateCardInFirestore(cleanId, { status: 'Active', id: cleanId });

      setCards((prev) =>
        prev.map((c) => (c.id === cleanId ? { ...c, status: 'Active' } : c))
      );
      setStats((prev) => {
        const next = {
          ...prev,
          activeCards: prev.activeCards + 1,
        };
        saveStatsToFirestore(next).catch(console.warn);
        return next;
      });

      const card = cards.find((c) => c.id === cleanId);
      addActivity({
        type: 'Card Activated',
        source: `Admin Portal (${user.name})`,
        cardId: cleanId,
        businessName: card?.businessName,
        location: card?.location,
        details: 'Card reactivated to Active status',
      });

      showToast(`Card ${cleanId} has been reactivated.`, 'success');
    } catch (err: any) {
      console.error(`[Firestore Error] Failed to enable card ${cleanId}:`, err);
      showToast(`Firestore write failed for ${cleanId}: ${err?.message || 'Check Firestore security rules'}`, 'error');
    }
  };

  const addBatchCards = async (newCards: CardItem[], batchNote?: string) => {
    if (!newCards || newCards.length === 0) return;

    const cleanCards = newCards.map((c) => ({
      id: c.id.trim(),
      status: 'Unassigned' as CardStatus,
      qrScans: typeof c.qrScans === 'number' ? c.qrScans : 0,
      nfcTaps: typeof c.nfcTaps === 'number' ? c.nfcTaps : 0,
      createdAt: c.createdAt || new Date().toISOString(),
    }));

    try {
      const result = await saveBatchCardsToFirestore(cleanCards);
      const { savedCards, skippedIds, savedCount, skippedCount } = result;

      if (savedCount > 0) {
        // Prepend only truly new cards to state; never duplicate or overwrite existing cards
        setCards((prev) => {
          const existingSet = new Set(prev.map((c) => c.id.trim().toUpperCase()));
          const trulyNew = savedCards.filter((c) => !existingSet.has(c.id.trim().toUpperCase()));
          return [...trulyNew, ...prev];
        });

        const firstId = savedCards[0].id;
        const lastId = savedCards[savedCards.length - 1].id;

        addActivity({
          type: 'Cards Generated',
          source: `Admin Console (${user.name})`,
          cardId: `${firstId} - ${lastId}`,
          businessName: batchNote || `Bulk Physical Inventory (${savedCount} cards)`,
          location: 'New Delhi HQ',
          details: `Generated ${savedCount} unassigned physical cards.`,
          performer: user.name,
        });

        if (skippedCount > 0) {
          showToast(
            `Saved ${savedCount} new unassigned cards to Firestore. Skipped ${skippedCount} existing cards (${skippedIds.join(', ')}).`,
            'success'
          );
        } else {
          showToast(
            `Successfully saved ${savedCount} unassigned cards (${firstId} - ${lastId}) to Firestore inventory!`,
            'success'
          );
        }
      } else {
        showToast(
          `All ${skippedCount} cards already exist in inventory (${skippedIds.join(', ')}). Existing card data was preserved and skipped.`,
          'info'
        );
      }
    } catch (err: any) {
      console.error('[Firestore Error] Failed to save batch cards:', err);
      showToast(`Failed to save batch cards in Firestore: ${err?.message || 'Check Firestore security rules'}`, 'error');
    }
  };

  const addNewSingleCard = async (newCard: CardItem) => {
    const cleanCard: CardItem = {
      ...newCard,
      id: newCard.id.trim(),
      qrScans: typeof newCard.qrScans === 'number' ? newCard.qrScans : 0,
      nfcTaps: typeof newCard.nfcTaps === 'number' ? newCard.nfcTaps : 0,
    };

    try {
      await saveCardToFirestore(cleanCard);

      setCards((prev) => [cleanCard, ...prev]);

      if (cleanCard.status === 'Active') {
        setStats((prev) => {
          const next = {
            ...prev,
            activeCards: prev.activeCards + 1,
          };
          saveStatsToFirestore(next).catch(console.warn);
          return next;
        });
      }

      addActivity({
        type: cleanCard.status === 'Active' ? 'Card Activated' : 'Cards Generated',
        source: `Admin Console (${user.name})`,
        cardId: cleanCard.id,
        businessName: cleanCard.businessName || 'Unassigned Stock',
        location: cleanCard.location || 'New Delhi HQ',
        details: `Generated dynamic card ${cleanCard.id} with scannable QR code.`,
        performer: user.name,
      });

      showToast(`Card ${cleanCard.id} generated and registered to Firestore inventory!`, 'success');
    } catch (err: any) {
      console.error(`[Firestore Error] Failed to save card ${cleanCard.id}:`, err);
      showToast(`Failed to save card in Firestore: ${err?.message || 'Check Firestore security rules'}`, 'error');
    }
  };

  const deleteCard = async (cardId: string): Promise<boolean> => {
    const cleanId = cardId.trim();
    try {
      await deleteCardFromFirestore(cleanId);

      setCards((prev) => prev.filter((c) => c.id !== cleanId));
      try {
        const stored = localStorage.getItem('modexa_cards_v5');
        if (stored) {
          const parsed = JSON.parse(stored);
          const filtered = parsed.filter((c: CardItem) => c.id !== cleanId);
          localStorage.setItem('modexa_cards_v5', JSON.stringify(filtered));
        }
      } catch (e) {}

      addActivity({
        type: 'Card Disabled',
        source: `Admin Portal (${user.name})`,
        cardId: cleanId,
        details: `Card ${cleanId} permanently deleted by Admin`,
        performer: user.name,
      });

      showToast(`Card ${cleanId} deleted from inventory.`, 'info');
      return true;
    } catch (err: any) {
      console.error(`[Firestore Error] Failed to delete card ${cleanId}:`, err);
      showToast(`Failed to delete ${cleanId} from Firestore: ${err?.message || 'Check Firestore rules'}`, 'error');
      return false;
    }
  };

  const clearAllCards = async (): Promise<boolean> => {
    try {
      const count = await deleteAllCardsFromFirestore();
      setCards([]);
      try {
        localStorage.setItem('modexa_cards_v5', JSON.stringify([]));
      } catch (e) {}
      setStats((prev) => ({
        ...prev,
        activeCards: 0,
        businesses: 0,
        todayScans: 0,
        totalTaps: 0,
      }));
      showToast(`All ${count} cards deleted permanently from Firestore.`, 'info');
      return true;
    } catch (err: any) {
      console.error('[Firestore Error] Failed to delete all cards:', err);
      showToast(`Failed to clear cards in Firestore: ${err?.message || 'Check Firestore rules'}`, 'error');
      return false;
    }
  };

  const assignCard = async (cardId: string, personName: string, businessName?: string, location?: string) => {
    const cleanId = cardId.trim();
    const finalPerson = personName.trim();
    const finalBusiness = businessName?.trim() || `${finalPerson}'s Business`;
    const finalLocation = location?.trim() || 'New Delhi';

    try {
      await updateCardInFirestore(cleanId, {
        id: cleanId,
        owner: finalPerson,
        businessName: finalBusiness,
        location: finalLocation,
        status: 'Active',
        lastActivity: 'Just assigned',
      });

      setCards((prev) =>
        prev.map((c) => {
          if (c.id === cleanId) {
            return {
              ...c,
              id: cleanId,
              owner: finalPerson,
              businessName: finalBusiness,
              location: finalLocation,
              status: 'Active',
              lastActivity: 'Just assigned',
            };
          }
          return c;
        })
      );

      setStats((prev) => {
        const next = {
          ...prev,
          activeCards: prev.activeCards + 1,
        };
        saveStatsToFirestore(next).catch(console.warn);
        return next;
      });

      addActivity({
        type: 'Card Assigned',
        source: `Admin Portal (${user.name})`,
        cardId: cleanId,
        businessName: finalBusiness,
        location: finalLocation,
        details: `Card ${cleanId} assigned to ${finalPerson}`,
        performer: user.name,
      });

      showToast(`Card ${cleanId} assigned to ${finalPerson}!`, 'success');
    } catch (err: any) {
      console.error(`[Firestore Error] Failed to assign card ${cleanId}:`, err);
      showToast(`Firestore write failed for ${cleanId}: ${err?.message || 'Check Firestore security rules'}`, 'error');
    }
  };

  const canManageInventory = user.role === 'Admin' || user.role === 'Manager';
  const canAssignCards = user.role === 'Admin' || user.role === 'Manager';
  const canDeleteCards = user.role === 'Admin';

  const canToggleCardStatus = (card: CardItem): boolean => {
    if (user.role === 'Admin' || user.role === 'Manager') return true;
    if (!card || !card.owner) return false;
    const cleanOwner = card.owner.trim().toLowerCase();
    const cleanUserName = user.name.trim().toLowerCase();
    const cleanUserEmail = user.email.trim().toLowerCase();
    return cleanOwner !== '—' && (cleanOwner === cleanUserName || cleanOwner === cleanUserEmail);
  };

  const applyViewState = (view: ViewScreen, cardId?: string, closeModals: boolean = true) => {
    const isAuthed = isAuthenticated;
    const targetView: ViewScreen = !isAuthed && !authLoading && view !== 'login' ? 'login' : view;

    if (cardId) {
      setSelectedCardId(cardId);
    }
    setCurrentView(targetView);

    if (targetView === 'login') {
      if (typeof window !== 'undefined' && window.location.hash !== '#/login') {
        window.history.replaceState({ view: 'login' }, '', '#/login');
      }
    } else if (targetView === 'dashboard') {
      setActiveDesktopNav('Dashboard');
      setActiveMobileTab('home');
    } else if (targetView === 'cards') {
      setActiveDesktopNav('Cards');
      setActiveMobileTab('cards');
    } else if (targetView === 'create-cards') {
      setActiveDesktopNav('Create Cards');
    } else if (targetView === 'businesses' || targetView === 'business-details') {
      setActiveDesktopNav('Businesses');
      setActiveMobileTab('businesses');
    } else if (targetView === 'analytics') {
      setActiveDesktopNav('Analytics');
    } else if (targetView === 'activity') {
      setActiveDesktopNav('Activity');
    } else if (targetView === 'team') {
      setActiveDesktopNav('Team');
    } else if (targetView === 'settings') {
      setActiveDesktopNav('Settings');
    } else if (targetView === 'profile') {
      setActiveDesktopNav('Profile');
      setActiveMobileTab('profile');
    }

    if (closeModals) {
      setIsActivateModalOpen(false);
      setIsChangeLinkModalOpen(false);
      setIsDisableCardModalOpen(false);
      setIsScanModalOpen(false);
      setIsNotificationsOpen(false);
    }
  };

  const navigateTo = (view: ViewScreen, cardId?: string, replace: boolean = false) => {
    const isAuthed = isAuthenticated;
    const targetView: ViewScreen = !isAuthed && !authLoading && view !== 'login' ? 'login' : view;
    const targetCardId = cardId || (targetView === 'business-details' ? selectedCardId : undefined);
    const targetHash = getHashForView(targetView, targetCardId);

    if (
      targetView === currentView &&
      (!cardId || cardId === selectedCardId) &&
      window.location.hash === targetHash
    ) {
      return;
    }

    if (replace) {
      window.history.replaceState({ view: targetView, cardId: targetCardId }, '', targetHash);
    } else {
      window.history.pushState({ view: targetView, cardId: targetCardId }, '', targetHash);
    }

    applyViewState(targetView, targetCardId, true);
  };

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo('dashboard');
    }
  };

  // Firebase Authentication State Listener: Sole source of truth for session
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      setIsAuthenticatedState(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          // Check corresponding Firestore user record in users/{uid}
          const userDoc = await getUserDocFromFirestore(fbUser.uid);
          const role = (userDoc?.role || '').trim().toLowerCase();
          const isAllowed = ['admin', 'team', 'manager', 'support', 'field agent'].includes(role);

          if (userDoc && userDoc.active === true && isAllowed) {
            const profile = mapFirestoreUserToProfile(userDoc, fbUser);
            setFirebaseUser(fbUser);
            setAuthUserDoc(userDoc);
            setUser(profile);
            setIsAuthenticatedState(true);

            // On initial session restoration: if on login, navigate to dashboard; otherwise restore destination
            const parsed = parseHash(typeof window !== 'undefined' ? window.location.hash : '');
            if (parsed.view === 'login') {
              applyViewState('dashboard', undefined, false);
            } else {
              applyViewState(parsed.view, parsed.cardId, false);
            }
          } else {
            console.warn('[Firebase Auth] User lacks authorized Firestore record or is inactive. Signing out:', fbUser.email);
            if (auth) {
              await signOut(auth);
            }
            setFirebaseUser(null);
            setAuthUserDoc(null);
            setUser(guestProfile);
            setIsAuthenticatedState(false);
            applyViewState('login', undefined, true);
          }
        } catch (err) {
          console.error('[Firebase Auth] Error fetching authorization doc:', err);
          if (auth) {
            await signOut(auth);
          }
          setFirebaseUser(null);
          setAuthUserDoc(null);
          setUser(guestProfile);
          setIsAuthenticatedState(false);
          applyViewState('login', undefined, true);
        }
      } else {
        setFirebaseUser(null);
        setAuthUserDoc(null);
        setUser(guestProfile);
        setIsAuthenticatedState(false);
        applyViewState('login', undefined, true);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync with browser back / forward arrow buttons and enforce auth
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const isAuthed = isAuthenticated;
      if (event.state && event.state.view) {
        const v = !isAuthed && !authLoading && event.state.view !== 'login' ? 'login' : event.state.view;
        applyViewState(v, event.state.cardId, true);
      } else {
        const parsed = parseHash(window.location.hash);
        const v = !isAuthed && !authLoading && parsed.view !== 'login' ? 'login' : parsed.view;
        applyViewState(v, parsed.cardId, true);
      }
    };

    const handleHashChange = () => {
      const isAuthed = isAuthenticated;
      const parsed = parseHash(window.location.hash);
      const v = !isAuthed && !authLoading && parsed.view !== 'login' ? 'login' : parsed.view;
      applyViewState(v, parsed.cardId, true);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isAuthenticated, authLoading]);

  // Real Firebase signInWithEmailAndPassword + Firestore users/{uid} authorization
  const login = async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    if (!auth) {
      return { success: false, message: 'Authentication service is unavailable. Please verify Firebase initialization.' };
    }
    const cleanEmail = email.trim();
    if (!cleanEmail || !pass) {
      return { success: false, message: 'Please enter both email and password.' };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const fbUser = userCredential.user;

      // Verify Firestore user record: users/{uid}
      const userDoc = await getUserDocFromFirestore(fbUser.uid);
      if (!userDoc) {
        console.warn(`[Auth] Account authenticated but no Firestore user record found for uid: ${fbUser.uid}`);
        await signOut(auth);
        return { success: false, message: 'Access denied: No authorized profile found for this account.' };
      }

      if (userDoc.active !== true) {
        console.warn(`[Auth] Account is inactive: ${fbUser.email}`);
        await signOut(auth);
        return { success: false, message: 'Access denied: Your account has been deactivated. Please contact an administrator.' };
      }

      const role = (userDoc.role || '').trim().toLowerCase();
      const isAllowed = ['admin', 'team', 'manager', 'support', 'field agent'].includes(role);
      if (!isAllowed) {
        console.warn(`[Auth] Account role not permitted for dashboard: ${role}`);
        await signOut(auth);
        return { success: false, message: 'Access denied: You do not have permission to access the management dashboard.' };
      }

      const profile = mapFirestoreUserToProfile(userDoc, fbUser);
      setFirebaseUser(fbUser);
      setAuthUserDoc(userDoc);
      setUser(profile);
      setIsAuthenticatedState(true);
      applyViewState('dashboard', undefined, true);
      return { success: true, message: `Welcome back, ${profile.name}!` };
    } catch (error: any) {
      console.warn('[Firebase Auth] Sign in error:', error?.code, error?.message);
      const code = error?.code || '';
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-email'
      ) {
        return { success: false, message: 'Invalid email or password.' };
      }
      if (code === 'auth/too-many-requests') {
        return { success: false, message: 'Too many unsuccessful attempts. Please try again later.' };
      }
      if (code === 'auth/user-disabled') {
        return { success: false, message: 'This account has been disabled. Please contact support.' };
      }
      return { success: false, message: 'Invalid email or password.' };
    }
  };

  // Real Firebase signOut
  const logout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error('[Firebase Auth] Logout error:', err);
      }
    }
    setFirebaseUser(null);
    setAuthUserDoc(null);
    setIsAuthenticatedState(false);
    setUser(guestProfile);

    // Clean up any residual local storage keys
    try {
      localStorage.removeItem('modexa_admin_session');
      localStorage.removeItem('modexa_admin_password');
    } catch {}

    if (typeof window !== 'undefined') {
      window.history.replaceState({ view: 'login' }, '', '#/login');
    }
    setCurrentView('login');
    showToast('You have been securely logged out.', 'info');
  };

  // Password update via Firebase Auth
  const updatePassword = async (currentPass: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    if (!auth || !auth.currentUser || !auth.currentUser.email) {
      return { success: false, message: 'No authenticated user session found.' };
    }
    if (newPass.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    try {
      const cred = EmailAuthProvider.credential(auth.currentUser.email, currentPass);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await fbUpdatePassword(auth.currentUser, newPass);
      return { success: true, message: 'Password updated successfully in Firebase Authentication!' };
    } catch (err: any) {
      console.warn('[Firebase Auth] Update password error:', err);
      if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        return { success: false, message: 'Current password does not match.' };
      }
      if (err?.code === 'auth/weak-password') {
        return { success: false, message: 'Password is too weak. Please choose a stronger password.' };
      }
      return { success: false, message: 'Failed to update password. Please check your credentials.' };
    }
  };

  // Dispatch official Firebase password reset email
  const sendPasswordResetLink = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (!auth) {
      return { success: false, message: 'Authentication service is unavailable.' };
    }
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return { success: false, message: 'Please enter your registered email address.' };
    }
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return {
        success: true,
        message: 'Password reset link sent! Please check your email inbox and spam folder.',
      };
    } catch (err: any) {
      console.warn('[Firebase Auth] Password reset error:', err);
      return {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      };
    }
  };

  const resetPassword = async (
    email: string,
    _currentPass?: string,
    _newPass?: string
  ): Promise<{ success: boolean; message: string }> => {
    return sendPasswordResetLink(email);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        updateUserProfile,
        isAuthenticated,
        setIsAuthenticated,
        cards,
        stats,
        activities,
        addActivity,
        simulateNfcTap,
        teamMembers,
        addTeamMember,
        removeTeamMember,
        updateTeamMemberRole,
        updateTeamMember,
        updateUserPasswordByAdmin,
        settings,
        updateSettings,
        currentView,
        activeDesktopNav,
        activeMobileTab,
        selectedCardId,
        isActivateModalOpen,
        isChangeLinkModalOpen,
        isDisableCardModalOpen,
        isScanModalOpen,
        isNotificationsOpen,
        toasts,
        notifications,
        unreadNotifsCount,
        markAllNotifsAsRead,
        markNotifAsRead,
        clearAllNotifications,
        previewDevice,
        setPreviewDevice,
        isMobile,
        showToast,
        removeToast,
        openActivateModal,
        closeActivateModal,
        openChangeLinkModal,
        closeChangeLinkModal,
        openDisableCardModal,
        closeDisableCardModal,
        openScanModal,
        closeScanModal,
        openNotifications,
        closeNotifications,
        activateCard,
        updateCard,
        changeCardLink,
        disableCard,
        enableCard,
        addBatchCards,
        addNewSingleCard,
        navigateTo,
        goBack,
        setActiveDesktopNav,
        setActiveMobileTab,
        globalSearch,
        setGlobalSearch,
        isFirebaseConnected: isFirebaseInitialized,
        firebaseProjectId: 'modexacards',
        firebaseHostingUrl: 'https://modexacards.web.app',
        testFirebase: testFirebaseConnection,
        deleteCard,
        clearAllCards,
        assignCard,
        canManageInventory,
        canAssignCards,
        canDeleteCards,
        canToggleCardStatus,
        login,
        logout,
        updatePassword,
        resetPassword,
        sendPasswordResetLink,
        authLoading,
        firebaseUser,
        authUserDoc,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};


export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
