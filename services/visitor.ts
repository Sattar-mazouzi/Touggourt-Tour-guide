
import { db } from '../firebase';
import { doc, writeBatch, increment } from 'firebase/firestore';

/**
 * Tracks a visitor session exactly once per app load/session.
 * Increments global total and daily snapshots atomically.
 */
export const trackVisitorSession = async () => {
  // 1. Session Protection: ensure we only count once per browser session
  const TRACKING_KEY = 'touggourt_session_tracked';
  if (sessionStorage.getItem(TRACKING_KEY)) {
    return;
  }

  try {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const batch = writeBatch(db);

    // 2. Global Total Increment
    const globalRef = doc(db, 'appStats', 'global');
    batch.set(globalRef, { 
      totalSessions: increment(1),
      lastUpdated: Date.now()
    }, { merge: true });

    // 3. Daily Snapshot Increment
    const dailyRef = doc(db, 'dailyStats', today);
    batch.set(dailyRef, { 
      count: increment(1),
      date: today
    }, { merge: true });

    // 4. Atomic Commit
    await batch.commit();
    
    // Mark as tracked in current session
    sessionStorage.setItem(TRACKING_KEY, 'true');
    console.log(`Session tracked successfully for ${today}`);
  } catch (error) {
    // Fail silently in UI but log for debugging
    console.error("Visitor tracking error:", error);
  }
};
