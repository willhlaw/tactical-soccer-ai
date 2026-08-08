import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { Team } from '../types';

// Google Firebase Configuration for tactical-soccer-ai-app
export const firebaseConfig = {
  projectId: "tactical-soccer-ai-app",
  authDomain: "tactical-soccer-ai-app.firebaseapp.com",
  storageBucket: "tactical-soccer-ai-app.appspot.com",
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Enable Offline Persistence for zero-latency pitch use
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, offline persistence enabled in main tab.');
    } else if (err.code === 'unimplemented') {
      console.warn('Browser does not support offline persistence.');
    }
  });
} catch (e) {
  console.log('IndexedDB persistence init:', e);
}

/**
 * Cloud Sync Team to Firestore
 */
export async function syncTeamToCloud(team: Team): Promise<boolean> {
  try {
    const teamRef = doc(db, 'teams', team.id);
    await setDoc(teamRef, team, { merge: true });
    return true;
  } catch (e) {
    console.warn('Cloud sync offline fallback active:', e);
    return false;
  }
}

/**
 * Fetch Cloud Teams from Firestore
 */
export async function fetchTeamsFromCloud(): Promise<Team[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'teams'));
    const teams: Team[] = [];
    querySnapshot.forEach((doc) => {
      teams.push(doc.data() as Team);
    });
    return teams;
  } catch (e) {
    console.warn('Cloud fetch failed, using local teams fallback.');
    return [];
  }
}
