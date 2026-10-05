import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  writeBatch,
  increment,
  deleteDoc,
  type Firestore,
} from 'firebase/firestore';
import type { CardItem, CardStatus, ActivityRecord, StatSummary, PlatformSettings } from '../types';

export interface FirebaseCustomConfig {
  apiKey?: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

// Default Firebase Project Configuration for modexacards
export const DEFAULT_FIREBASE_CONFIG: FirebaseCustomConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBIRJElHKpOix0Nlea3q3ZKgNbQIetZYHE',
  authDomain: 'modexacards.firebaseapp.com',
  projectId: 'modexacards',
  storageBucket: 'modexacards.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '513070703925',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:513070703925:web:c2cfd5154a4f20b82d587c',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-5JSZMDSP7B',
};

// Retrieve stored configuration from localStorage if user updated it in Settings UI
export function getActiveFirebaseConfig(): FirebaseCustomConfig {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('modexa_firebase_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Automatically purge stale references to old or mismatching projects
        if (parsed && (parsed.projectId === 'modexatapcard' || parsed.projectId !== 'modexacards')) {
          console.warn('[Firebase] Purging stale cached firebase config for old project:', parsed.projectId);
          localStorage.removeItem('modexa_firebase_config');
        } else if (parsed && parsed.projectId === 'modexacards') {
          return { ...DEFAULT_FIREBASE_CONFIG, ...parsed };
        }
      }
    } catch {
      // Fallback
    }
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveActiveFirebaseConfig(config: Partial<FirebaseCustomConfig>) {
  if (typeof window !== 'undefined') {
    const updated = { ...getActiveFirebaseConfig(), ...config };
    localStorage.setItem('modexa_firebase_config', JSON.stringify(updated));
  }
}

// Initialize Firebase App Instance
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let isInitialized = false;

try {
  const config = getActiveFirebaseConfig();
  if (getApps().length === 0) {
    app = initializeApp(config);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
  isInitialized = true;
  console.log(`[Firebase] Initialized Firestore client for project: "${config.projectId}"`);
} catch (err) {
  console.warn('Firebase initialization warning (using local persistent fallback):', err);
  isInitialized = false;
}

export { app, db, isInitialized };

// =========================================================================
// FIRESTORE DATABASE SERVICE API
// =========================================================================

export interface SaveBatchResult {
  success: boolean;
  savedCount: number;
  skippedCount: number;
  savedCards: CardItem[];
  skippedIds: string[];
}

/**
 * Fetch all cards from Cloud Firestore
 */
export async function getCardsFromFirestore(): Promise<CardItem[] | null> {
  if (!db) return null;
  try {
    const colRef = collection(db, 'cards');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return null;
    const cards: CardItem[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const card: CardItem = {
        id: docSnap.id, // Guarantee document ID matches card id exactly
        status: (data.status as CardStatus) || 'Unassigned',
        qrScans: typeof data.qrScans === 'number' ? data.qrScans : 0,
        nfcTaps: typeof data.nfcTaps === 'number' ? data.nfcTaps : 0,
        ...(data.createdAt ? { createdAt: data.createdAt } : {}),
        ...(data.lastActivity ? { lastActivity: data.lastActivity } : {}),
        ...(data.businessId ? { businessId: data.businessId } : {}),
        ...(data.businessName ? { businessName: data.businessName } : {}),
        ...(data.googleReviewUrl ? { googleReviewUrl: data.googleReviewUrl } : {}),
        ...(data.category ? { category: data.category } : {}),
        ...(data.location ? { location: data.location } : {}),
        ...(data.owner ? { owner: data.owner } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
        ...(data.thumbnail ? { thumbnail: data.thumbnail } : {}),
      };
      cards.push(card);
    });
    return cards;
  } catch (err) {
    console.error('Firestore fetch cards error:', err);
    return null;
  }
}

/**
 * Fetch a single card by ID (used for live NFC tap & QR scan redirects)
 */
export async function getCardByIdFromFirestore(cardId: string): Promise<CardItem | null> {
  if (!db) return null;
  try {
    const cleanId = cardId.trim();
    const docRef = doc(db, 'cards', cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        ...data,
        id: snap.id, // Document ID is source of truth
        status: data.status || 'Unassigned',
        qrScans: typeof data.qrScans === 'number' ? data.qrScans : 0,
        nfcTaps: typeof data.nfcTaps === 'number' ? data.nfcTaps : 0,
      } as CardItem;
    }
    return null;
  } catch (err) {
    console.error(`Firestore get card ${cardId} error:`, err);
    return null;
  }
}

/**
 * Save single card to Firestore (Path: cards/{CARD_ID})
 * Throws on failure so UI surfaces the error.
 */
export async function saveCardToFirestore(card: CardItem): Promise<boolean> {
  if (!db) {
    throw new Error('Firestore database instance not initialized.');
  }
  const cleanId = card.id.trim();
  const docRef = doc(db, 'cards', cleanId);
  const dataToSave: Record<string, any> = {
    ...card,
    id: cleanId,
    qrScans: typeof card.qrScans === 'number' ? card.qrScans : 0,
    nfcTaps: typeof card.nfcTaps === 'number' ? card.nfcTaps : 0,
  };
  // Remove any undefined fields
  Object.keys(dataToSave).forEach((key) => {
    if (dataToSave[key] === undefined) {
      delete dataToSave[key];
    }
  });
  await setDoc(docRef, dataToSave, { merge: true });
  return true;
}

/**
 * Save a batch of bulk-generated unassigned cards to Firestore in atomic batch writes.
 * - Each card document ID is exactly the card ID (e.g. cards/CRD-0002)
 * - Initial fields are strictly: id, status: "Unassigned", qrScans: 0, nfcTaps: 0, createdAt
 * - NO dummy business fields are added.
 * - Crucially: checks existing cards first and SKIPS existing card IDs (e.g. CRD-0001)
 *   so existing card data is never destroyed or overwritten.
 */
export async function saveBatchCardsToFirestore(cards: CardItem[]): Promise<SaveBatchResult> {
  if (!db) {
    throw new Error('Firestore database instance not initialized.');
  }
  if (cards.length === 0) {
    return { success: true, savedCount: 0, skippedCount: 0, savedCards: [], skippedIds: [] };
  }

  const firestoreDb = db;

  // Check which cards already exist in Firestore to prevent overwriting existing data
  const existenceChecks = await Promise.all(
    cards.map(async (card) => {
      const cleanId = card.id.trim();
      const docRef = doc(firestoreDb, 'cards', cleanId);
      const snap = await getDoc(docRef);
      return {
        card,
        cleanId,
        exists: snap.exists(),
        docRef,
      };
    })
  );

  const savedCards: CardItem[] = [];
  const skippedIds: string[] = [];
  const itemsToCreate: { cleanId: string; docRef: any; createdAt: string }[] = [];

  for (const item of existenceChecks) {
    if (item.exists) {
      console.log(`[Firestore] Skipping existing card ${item.cleanId} to preserve existing data.`);
      skippedIds.push(item.cleanId);
    } else {
      const createdAt = item.card.createdAt || new Date().toISOString();
      savedCards.push({
        id: item.cleanId,
        status: 'Unassigned',
        qrScans: 0,
        nfcTaps: 0,
        createdAt,
      });
      itemsToCreate.push({
        cleanId: item.cleanId,
        docRef: item.docRef,
        createdAt,
      });
    }
  }

  if (itemsToCreate.length === 0) {
    return {
      success: true,
      savedCount: 0,
      skippedCount: skippedIds.length,
      savedCards: [],
      skippedIds,
    };
  }

  // Commit in chunks of up to 450 (Firestore limit is 500 operations per batch)
  const BATCH_SIZE = 450;
  for (let i = 0; i < itemsToCreate.length; i += BATCH_SIZE) {
    const chunk = itemsToCreate.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(firestoreDb);

    chunk.forEach((item) => {
      // ONLY initial unassigned inventory fields:
      // id, status ("Unassigned"), qrScans (0), nfcTaps (0), createdAt
      // NO dummy values for businessId, businessName, googleReviewUrl, category, location, owner, phone, thumbnail
      const initialDocData: Record<string, any> = {
        id: item.cleanId,
        status: 'Unassigned',
        qrScans: 0,
        nfcTaps: 0,
        createdAt: item.createdAt,
      };
      batch.set(item.docRef, initialDocData);
    });

    await batch.commit();
  }

  return {
    success: true,
    savedCount: savedCards.length,
    skippedCount: skippedIds.length,
    savedCards,
    skippedIds,
  };
}

/**
 * Update card fields in Firestore (Path: cards/{CARD_ID})
 * Uses setDoc with merge: true to avoid "No document to update" errors,
 * update the SAME document cards/{CARD_ID}, and preserve existing fields (like qrScans and nfcTaps).
 */
export async function updateCardInFirestore(cardId: string, updates: Partial<CardItem>): Promise<boolean> {
  if (!db) {
    throw new Error('Firestore database instance not initialized.');
  }
  const cleanId = cardId.trim();
  const docRef = doc(db, 'cards', cleanId);

  // Clean out any undefined fields so Firestore doesn't reject the payload
  const cleanedUpdates: Record<string, any> = {};
  Object.entries(updates).forEach(([key, val]) => {
    if (val !== undefined) {
      cleanedUpdates[key] = val;
    }
  });

  const dataToSave = {
    ...cleanedUpdates,
    id: cleanId,
  };
  await setDoc(docRef, dataToSave, { merge: true });
  return true;
}

/**
 * Delete a single card from Firestore (Path: cards/{CARD_ID})
 */
export async function deleteCardFromFirestore(cardId: string): Promise<boolean> {
  if (!db) {
    throw new Error('Firestore database instance not initialized.');
  }
  const cleanId = cardId.trim();
  const docRef = doc(db, 'cards', cleanId);
  await deleteDoc(docRef);
  return true;
}

/**
 * Delete all cards from Firestore (Collection: cards)
 * Uses batched writes (up to 450 per batch).
 */
export async function deleteAllCardsFromFirestore(): Promise<number> {
  if (!db) {
    throw new Error('Firestore database instance not initialized.');
  }
  const colRef = collection(db, 'cards');
  const snapshot = await getDocs(colRef);
  if (snapshot.empty) return 0;

  const docs = snapshot.docs;
  const chunkSize = 450;
  for (let i = 0; i < docs.length; i += chunkSize) {
    const chunk = docs.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    chunk.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  return docs.length;
}

/**
 * Record a live NFC tap or QR scan event in Firestore:
 * Increments card tap counters and platform stats in real time.
 */
export async function recordCardTapInFirestore(cardId: string, type: 'nfc' | 'qr'): Promise<void> {
  if (!db) return;
  try {
    const cardRef = doc(db, 'cards', cardId);
    if (type === 'nfc') {
      await updateDoc(cardRef, {
        nfcTaps: increment(1),
        lastActivity: 'Just now',
      }).catch(async () => {
        // If doc doesn't exist, create it minimally
        await setDoc(cardRef, { id: cardId, nfcTaps: 1, lastActivity: 'Just now' }, { merge: true });
      });
    } else {
      await updateDoc(cardRef, {
        qrScans: increment(1),
        lastActivity: 'Just now',
      }).catch(async () => {
        await setDoc(cardRef, { id: cardId, qrScans: 1, lastActivity: 'Just now' }, { merge: true });
      });
    }

    // Increment overall stats
    const statsRef = doc(db, 'stats', 'summary');
    await updateDoc(statsRef, {
      totalTaps: increment(1),
      todayScans: increment(1),
    }).catch(async () => {
      await setDoc(statsRef, { totalTaps: 1, todayScans: 1 }, { merge: true });
    });
  } catch (err) {
    console.warn('Error recording tap event in Firestore:', err);
  }
}

/**
 * Log activity in Firestore
 */
export async function saveActivityToFirestore(activity: ActivityRecord): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, 'activities', activity.id);
    await setDoc(docRef, activity, { merge: true });
  } catch (err) {
    console.warn('Failed to save activity to Firestore:', err);
  }
}

/**
 * Fetch all activities from Firestore
 */
export async function getActivitiesFromFirestore(): Promise<ActivityRecord[] | null> {
  if (!db) return null;
  try {
    const colRef = collection(db, 'activities');
    const snap = await getDocs(colRef);
    if (snap.empty) return null;
    const list: ActivityRecord[] = [];
    snap.forEach((d) => list.push(d.data() as ActivityRecord));
    return list;
  } catch (err) {
    console.warn('Firestore fetch activities error:', err);
    return null;
  }
}

/**
 * Save / Update Platform Stats
 */
export async function saveStatsToFirestore(stats: StatSummary): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, 'stats', 'summary');
    await setDoc(docRef, stats, { merge: true });
  } catch (err) {
    console.warn('Failed to save stats to Firestore:', err);
  }
}

/**
 * Fetch Stats
 */
export async function getStatsFromFirestore(): Promise<StatSummary | null> {
  if (!db) return null;
  try {
    const docRef = doc(db, 'stats', 'summary');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as StatSummary;
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Save Platform Settings
 */
export async function saveSettingsToFirestore(settings: PlatformSettings): Promise<void> {
  if (!db) return;
  try {
    const docRef = doc(db, 'settings', 'general');
    await setDoc(docRef, settings, { merge: true });
  } catch (err) {
    console.warn('Failed to save settings to Firestore:', err);
  }
}

/**
 * Fetch Settings
 */
export async function getSettingsFromFirestore(): Promise<PlatformSettings | null> {
  if (!db) return null;
  try {
    const docRef = doc(db, 'settings', 'general');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as PlatformSettings;
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Test Firebase Connection
 */
export async function testFirebaseConnection(): Promise<{ success: boolean; message: string }> {
  if (!db) {
    return { success: false, message: 'Firestore SDK not initialized.' };
  }
  try {
    const testDoc = doc(db, 'system', 'connection_test');
    await setDoc(testDoc, {
      lastTested: new Date().toISOString(),
      projectId: 'modexacards',
      status: 'online',
    });
    return { success: true, message: 'Successfully connected to Firebase project modexacards!' };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Could not write to Firestore. Check permissions or network.',
    };
  }
}
