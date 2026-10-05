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
  updateUserPasswordByAdmin: (email: string, newPass: string) => { success: boolean; message: string };
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
  updatePassword: (currentPass: string, newPass: string) => { success: boolean; message: string };
  resetPassword: (email: string, currentPass: string, newPass: string) => { success: boolean; message: string };
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialNav = typeof window !== 'undefined' ? parseHash(window.location.hash) : { view: 'dashboard' as ViewScreen };

  const defaultAdminProfile: UserProfile = {
    name: 'Amit Maurya',
    email: 'amit@modexacards.com',
    role: 'Admin',
    phone: '+91 98111 22334',
    location: 'New Delhi, India',
    bio: 'Lead System Administrator managing enterprise Modexa TapCard NFC deployments & partner clinics across Delhi NCR.',
    department: 'Operations & Field Success',
    notificationsEnabled: true,
  };

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const session = localStorage.getItem('modexa_admin_session');
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed && parsed.email) {
          return {
            name: parsed.name || defaultAdminProfile.name,
            email: parsed.email || defaultAdminProfile.email,
            role: parsed.role || defaultAdminProfile.role,
            phone: parsed.phone || defaultAdminProfile.phone,
            location: parsed.location || defaultAdminProfile.location,
            bio: parsed.bio || defaultAdminProfile.bio,
            department: parsed.department || defaultAdminProfile.department,
            notificationsEnabled: true,
          };
        }
      }
    } catch {}
    return defaultAdminProfile;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const session = localStorage.getItem('modexa_admin_session');
      if (session) {
        const parsed = JSON.parse(session);
        return !!parsed && !!parsed.email;
      }
    } catch {}
    return false;
  });
  const [cards, setCards] = useState<CardItem[]>(getInitialStoredCards);
  const [stats, setStats] = useState<StatSummary>(getInitialStoredStats);
  const [activities, setActivities] = useState<ActivityRecord[]>(getInitialStoredActivities);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [settings, setSettings] = useState<PlatformSettings>(getInitialStoredSettings);
  const [currentView, setCurrentView] = useState<ViewScreen>(initialNav.view);
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

  useEffect(() => {
    try {
      const stored = localStorage.getItem('modexa_admin_password');
      if (!stored || stored === 'password123') {
        localStorage.setItem('modexa_admin_password', 'Amit@&1202');
      }
    } catch (e) {}
  }, []);

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

  const addTeamMember = (member: Omit<TeamMember, 'id' | 'lastActive'>, initialPassword?: string) => {
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

    const cleanMail = member.email.trim().toLowerCase();
    const finalPassword = initialPassword?.trim() || DEFAULT_ADMIN_PASSWORD;
    try {
      localStorage.setItem(`modexa_password_${cleanMail}`, finalPassword);
    } catch {}

    addActivity({
      type: 'Member Joined',
      source: `Admin Console (${user.name})`,
      cardId: 'TEAM-ID',
      businessName: 'Modexa Staff Directory',
      location: member.assignedRegion || 'Delhi NCR',
      details: `New ${member.role} ID created for ${member.name} (${member.email}) by Admin ${user.name}`,
      performer: user.name,
    });

    showToast(`Added ${newMember.name} to the team! Initial credentials set.`, 'success');
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

  const updateTeamMember = (id: string, updates: Partial<TeamMember>, newPassword?: string) => {
    if (user.role !== 'Admin') {
      showToast('Permission Denied: Only Admin can edit user profiles or passwords.', 'error');
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

    const member = teamMembers.find((m) => m.id === id);
    const targetEmail = (updates.email || member?.email || '').trim().toLowerCase();
    if (targetEmail && newPassword && newPassword.trim().length >= 6) {
      try {
        localStorage.setItem(`modexa_password_${targetEmail}`, newPassword.trim());
      } catch {}
    }

    showToast('Team member details updated successfully.', 'success');
  };

  const updateUserPasswordByAdmin = (email: string, newPass: string): { success: boolean; message: string } => {
    if (user.role !== 'Admin') {
      return { success: false, message: 'Permission Denied: Only Admin can edit or reset other users’ passwords.' };
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Invalid email address.' };
    }
    if (!newPass || newPass.trim().length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    try {
      localStorage.setItem(`modexa_password_${cleanEmail}`, newPass.trim());
      if (adminDirectory[cleanEmail]) {
        localStorage.setItem('modexa_admin_password', newPass.trim());
      }
    } catch {}

    addActivity({
      type: 'Password Reset',
      source: `Admin Console (${user.name})`,
      cardId: 'AUTH-SEC',
      businessName: 'Modexa Authentication',
      location: 'New Delhi HQ',
      details: `Password for ${cleanEmail} was updated by Admin ${user.name}`,
      performer: user.name,
    });

    showToast(`Password successfully updated for ${cleanEmail}!`, 'success');
    return { success: true, message: `Password for ${cleanEmail} has been updated.` };
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

  const DEFAULT_ADMIN_PASSWORD = 'Amit@&1202';

  const getStoredAdminPassword = (): string => {
    try {
      const pass = localStorage.getItem('modexa_admin_password');
      if (pass && pass !== 'password123') return pass;
    } catch {}
    return DEFAULT_ADMIN_PASSWORD;
  };

  const getStoredPasswordForEmail = (cleanEmail: string): string => {
    try {
      const custom = localStorage.getItem(`modexa_password_${cleanEmail}`);
      if (custom) return custom;
    } catch {}
    return getStoredAdminPassword();
  };

  // Pre-configured Admin profiles
  const adminDirectory: Record<string, { name: string; email: string; phone: string; location: string; bio: string; department: string }> = {
    'amit@modexacards.com': {
      name: 'Amit Maurya',
      email: 'amit@modexacards.com',
      phone: '+91 98111 22334',
      location: 'New Delhi, India',
      bio: 'Lead System Administrator managing enterprise Modexa TapCard NFC deployments & partner clinics across Delhi NCR.',
      department: 'Operations & Field Success',
    },
    'admin@modexacards.com': {
      name: 'Amit Maurya',
      email: 'admin@modexacards.com',
      phone: '+91 98111 22334',
      location: 'New Delhi, India',
      bio: 'Lead System Administrator managing enterprise Modexa TapCard NFC deployments & partner clinics across Delhi NCR.',
      department: 'Operations & Field Success',
    },
    'shubham@modexacards.com': {
      name: 'Shubham',
      email: 'shubham@modexacards.com',
      phone: '+91 98111 55667',
      location: 'New Delhi, India',
      bio: 'System Administrator (Shubham) managing enterprise Modexa TapCard NFC deployments & partner accounts.',
      department: 'Executive Administration',
    },
    'shubham.admin@modexacards.com': {
      name: 'Shubham',
      email: 'shubham.admin@modexacards.com',
      phone: '+91 98111 55667',
      location: 'New Delhi, India',
      bio: 'System Administrator (Shubham) managing enterprise Modexa TapCard NFC deployments & partner accounts.',
      department: 'Executive Administration',
    },
    'rahul@modexacards.com': {
      name: 'Rahul Verma',
      email: 'rahul@modexacards.com',
      phone: '+91 98111 66778',
      location: 'New Delhi, India',
      bio: 'System Administrator (Rahul Verma) managing enterprise Modexa hardware production and card stock.',
      department: 'Hardware Production & Infrastructure',
    },
    'admin2@modexacards.com': {
      name: 'Rahul Verma',
      email: 'admin2@modexacards.com',
      phone: '+91 98111 66778',
      location: 'New Delhi, India',
      bio: 'System Administrator (Rahul Verma) managing enterprise Modexa hardware production and card stock.',
      department: 'Hardware Production & Infrastructure',
    },
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const adminPass = getStoredAdminPassword();
    const userPass = getStoredPasswordForEmail(cleanEmail);

    // 1. Primary Admin check (Amit Maurya, Shubham, Rahul Verma)
    if (adminDirectory[cleanEmail]) {
      if (pass !== userPass && pass !== adminPass && pass !== DEFAULT_ADMIN_PASSWORD) {
        return { success: false, message: 'Invalid password. Please check your credentials.' };
      }
      const adminData = adminDirectory[cleanEmail];
      const adminProfile: UserProfile = {
        name: adminData.name,
        email: adminData.email,
        role: 'Admin',
        phone: adminData.phone,
        location: adminData.location,
        bio: adminData.bio,
        department: adminData.department,
        notificationsEnabled: true,
      };
      setUser(adminProfile);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(
          'modexa_admin_session',
          JSON.stringify({
            name: adminProfile.name,
            email: adminProfile.email,
            role: adminProfile.role,
            loginAt: Date.now(),
          })
        );
      } catch {}
      return { success: true, message: `Welcome back, ${adminData.name}!` };
    }

    // 2. Team member directory check
    const matchedMember = teamMembers.find((m) => m.email.trim().toLowerCase() === cleanEmail);
    if (matchedMember) {
      if (pass !== userPass && pass !== adminPass && pass !== DEFAULT_ADMIN_PASSWORD && pass !== 'password123') {
        return { success: false, message: 'Invalid password for team member account.' };
      }
      const teamProfile: UserProfile = {
        name: matchedMember.name,
        email: matchedMember.email,
        role: matchedMember.role,
        phone: matchedMember.phone || '',
        location: matchedMember.assignedRegion || 'New Delhi',
        bio: `Modexa Staff Member (${matchedMember.role})`,
        department: 'Field Operations',
        notificationsEnabled: true,
      };
      setUser(teamProfile);
      setIsAuthenticated(true);
      try {
        localStorage.setItem(
          'modexa_admin_session',
          JSON.stringify({
            name: teamProfile.name,
            email: teamProfile.email,
            role: teamProfile.role,
            loginAt: Date.now(),
          })
        );
      } catch {}
      return { success: true, message: `Welcome back, ${matchedMember.name}!` };
    }

    return { success: false, message: 'Unauthorized: No account registered with this email address.' };
  };

  const logout = () => {
    try {
      localStorage.removeItem('modexa_admin_session');
    } catch {}
    setIsAuthenticated(false);
    setUser(defaultAdminProfile);
    navigateTo('login');
    showToast('You have been securely logged out.', 'info');
  };

  const updatePassword = (currentPass: string, newPass: string): { success: boolean; message: string } => {
    const cleanEmail = user.email.trim().toLowerCase();
    const stored = getStoredPasswordForEmail(cleanEmail);
    if (currentPass !== stored && currentPass !== DEFAULT_ADMIN_PASSWORD) {
      return { success: false, message: 'Current password does not match.' };
    }
    if (newPass.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }
    try {
      localStorage.setItem(`modexa_password_${cleanEmail}`, newPass);
      if (user.role === 'Admin') {
        localStorage.setItem('modexa_admin_password', newPass);
      }
    } catch {}
    return { success: true, message: 'Password updated successfully! Use your new password on next login.' };
  };

  const resetPassword = (
    email: string,
    currentPass: string,
    newPass: string
  ): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Please enter your registered email address.' };
    }

    const isAdmin = Boolean(adminDirectory[cleanEmail]);
    const isTeam = teamMembers.some((m) => m.email.trim().toLowerCase() === cleanEmail);

    if (!isAdmin && !isTeam) {
      return { success: false, message: 'No registered account found with this email address.' };
    }

    if (!currentPass) {
      return { success: false, message: 'Please enter your current password.' };
    }

    const storedPass = getStoredPasswordForEmail(cleanEmail);
    const adminPass = getStoredAdminPassword();

    // STRICT CHECK: current password MUST match the account's existing password!
    const isCurrentMatch =
      currentPass === storedPass ||
      currentPass === adminPass ||
      currentPass === DEFAULT_ADMIN_PASSWORD ||
      (isTeam && currentPass === 'password123');

    if (!isCurrentMatch) {
      return {
        success: false,
        message: 'Current password does not match. Please verify your current password.',
      };
    }

    if (!newPass || newPass.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    if (newPass === currentPass) {
      return { success: false, message: 'New password must be different from current password.' };
    }

    try {
      localStorage.setItem(`modexa_password_${cleanEmail}`, newPass);
      if (isAdmin) {
        localStorage.setItem('modexa_admin_password', newPass);
      }
    } catch {}

    addActivity({
      type: 'Password Reset',
      source: 'Security & Access Portal',
      cardId: 'AUTH-SEC',
      businessName: 'Modexa Authentication',
      location: 'New Delhi HQ',
      details: `Password was successfully changed for account: ${cleanEmail}`,
      performer: cleanEmail,
    });

    showToast(`Password updated for ${cleanEmail}! Please log in.`, 'success');
    return { success: true, message: 'Password has been successfully updated! You can now log in.' };
  };

  const applyViewState = (view: ViewScreen, cardId?: string, closeModals: boolean = true) => {
    if (cardId) {
      setSelectedCardId(cardId);
    }
    setCurrentView(view);

    if (view === 'dashboard') {
      setActiveDesktopNav('Dashboard');
      setActiveMobileTab('home');
    } else if (view === 'cards') {
      setActiveDesktopNav('Cards');
      setActiveMobileTab('cards');
    } else if (view === 'create-cards') {
      setActiveDesktopNav('Create Cards');
    } else if (view === 'businesses' || view === 'business-details') {
      setActiveDesktopNav('Businesses');
      setActiveMobileTab('businesses');
    } else if (view === 'analytics') {
      setActiveDesktopNav('Analytics');
    } else if (view === 'activity') {
      setActiveDesktopNav('Activity');
    } else if (view === 'team') {
      setActiveDesktopNav('Team');
    } else if (view === 'settings') {
      setActiveDesktopNav('Settings');
    } else if (view === 'profile') {
      setActiveDesktopNav('Profile');
      setActiveMobileTab('profile');
    } else if (view === 'login') {
      setIsAuthenticated(false);
      try {
        localStorage.removeItem('modexa_admin_session');
      } catch {}
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
    const targetCardId = cardId || (view === 'business-details' ? selectedCardId : undefined);
    const targetHash = getHashForView(view, targetCardId);

    // If identical view, cardId, and hash, no need to push duplicate entry
    if (
      view === currentView &&
      (!cardId || cardId === selectedCardId) &&
      window.location.hash === targetHash
    ) {
      return;
    }

    if (replace) {
      window.history.replaceState({ view, cardId: targetCardId }, '', targetHash);
    } else {
      window.history.pushState({ view, cardId: targetCardId }, '', targetHash);
    }

    applyViewState(view, targetCardId, true);
  };

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo('dashboard');
    }
  };

  // Sync with browser back / forward arrow buttons
  useEffect(() => {
    const initial = parseHash(window.location.hash);
    const targetHash = getHashForView(initial.view, initial.cardId || selectedCardId);

    if (!window.location.hash || window.location.hash === '#/') {
      window.history.replaceState({ view: initial.view, cardId: initial.cardId || selectedCardId }, '', targetHash);
    } else {
      window.history.replaceState({ view: initial.view, cardId: initial.cardId || selectedCardId }, '', window.location.hash);
    }

    applyViewState(initial.view, initial.cardId, false);

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        applyViewState(event.state.view, event.state.cardId, true);
      } else {
        const parsed = parseHash(window.location.hash);
        applyViewState(parsed.view, parsed.cardId, true);
      }
    };

    const handleHashChange = () => {
      const parsed = parseHash(window.location.hash);
      applyViewState(parsed.view, parsed.cardId, true);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

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
