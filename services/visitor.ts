
import { db } from '../firebase';
import { doc, writeBatch, increment } from 'firebase/firestore';

/**
 * IMPORTANT: FIRESTORE SECURITY RULES REQUIREMENT
 * 
 * Your rules are strict. This service now only sends 'count', 'date', 'lastUpdated' 
 * for dailyStats and 'totalSessions', 'lastUpdated' for appStats/global to match 
 * your 'hasOnly' or implicit field checks.
 */

const TRACKING_KEY = 'touggourt_session_tracked';
let isTrackingInProgress = false;

export const trackVisitorSession = async () => {
  // 1. Session Protection
  if (sessionStorage.getItem(TRACKING_KEY)) {
    return;
  }

  // 2. Prevent concurrent execution
  if (isTrackingInProgress) {
    return;
  }

  isTrackingInProgress = true;

  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`; 

    const batch = writeBatch(db);

    // Global Total Increment
    // We only send exactly what the rules expect to validate
    const globalRef = doc(db, 'appStats', 'global');
    batch.set(globalRef, { 
      totalSessions: increment(1),
      lastUpdated: Date.now()
    }, { merge: true });

    // Daily Snapshot Increment
    const dailyRef = doc(db, 'dailyStats', today);
    batch.set(dailyRef, { 
      count: increment(1),
      date: today,
      lastUpdated: Date.now()
    }, { merge: true });

    await batch.commit();
    
    sessionStorage.setItem(TRACKING_KEY, 'true');
    console.log(`[VisitorTracker] Success: Recorded session for ${today}`);
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("[VisitorTracker] Permission Denied. Ensure your Firestore rules allow 'create' for the first hit and permit 'lastUpdated' field.");
    } else {
      console.error("[VisitorTracker] Error recording session:", error);
    }
  } finally {
    isTrackingInProgress = false;
  }
};
