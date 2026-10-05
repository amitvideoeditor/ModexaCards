export type CardStatus = 'Active' | 'Unassigned' | 'Inactive';

export interface CardItem {
  id: string; // e.g. "CRD-0042"
  businessId?: string;
  businessName?: string;
  category?: string;
  location?: string;
  status: CardStatus;
  owner?: string;
  phone?: string;
  lastActivity?: string;
  qrScans: number;
  nfcTaps: number;
  googleReviewUrl?: string;
  thumbnail?: string;
  createdAt?: string;
}

export type ActivityType =
  | 'Card Activated'
  | 'Card Assigned'
  | 'Card Disabled'
  | 'Member Joined'
  | 'Role Updated'
  | 'Link Updated'
  | 'Cards Generated'
  | 'Password Reset'
  | 'Settings Updated';

export interface ActivityRecord {
  id: string;
  type: ActivityType;
  source: string;
  dateTime: string;
  cardId: string;
  businessName?: string;
  location?: string;
  details?: string;
  performer?: string;
}

export interface StatSummary {
  activeCards: number;
  activeCardsChange: string;
  businesses: number;
  businessesChange: string;
  todayScans: number;
  todayScansChange: string;
  totalTaps: number;
  totalTapsChange: string;
}

export interface ActivatedCardInfo {
  cardId: string;
  businessName: string;
  activatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Manager' | 'Field Agent' | 'Support';
  status: 'Active' | 'Away' | 'Invited';
  assignedCards: number;
  assignedCardIds?: string[];
  activatedCards?: ActivatedCardInfo[];
  assignedBy?: string;
  assignedRegion: string;
  lastActive: string;
  avatarColor?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  phone: string;
  location: string;
  bio: string;
  department: string;
  notificationsEnabled: boolean;
}

export interface PlatformSettings {
  systemName: string;
  supportEmail: string;
  supportPhone: string;
  defaultTimezone: string;
  currency: string;
  enableSmartRouting: boolean;
  minRatingForGoogle: number;
  hapticFeedback: boolean;
  fallbackUrl: string;
  emailAlerts: boolean;
  whatsappAlerts: boolean;
  lowActivityThresholdDays: number;
  googlePlacesApiKey: string;
  googleConnected: boolean;
  webhookUrl: string;
}

export type ViewScreen =
  | 'login'
  | 'dashboard'
  | 'cards'
  | 'create-cards'
  | 'businesses'
  | 'business-details'
  | 'analytics'
  | 'activity'
  | 'team'
  | 'settings'
  | 'profile';

export type DesktopNav =
  | 'Dashboard'
  | 'Businesses'
  | 'Cards'
  | 'Create Cards'
  | 'Analytics'
  | 'Activity'
  | 'Team'
  | 'Settings'
  | 'Profile';

export type MobileTab = 'home' | 'cards' | 'scan' | 'businesses' | 'profile';

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

export interface AppNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
  cardId?: string;
  read: boolean;
}

