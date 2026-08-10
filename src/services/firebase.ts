import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, arrayUnion } from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

export { onAuthStateChanged, type User };
import { Team, TeamRole, TeamMember, UserProfile } from '../types';

// Google Firebase Configuration for tactical-soccer-ai-app
export const firebaseConfig = {
  apiKey: "AIzaSyC_zfDEbSana8A0hM3oxbhDh3xCcvKn1qE",
  projectId: "tactical-soccer-ai-app",
  authDomain: "tactical-soccer-ai-app.firebaseapp.com",
  storageBucket: "tactical-soccer-ai-app.appspot.com",
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with modern persistent local cache (IndexedDB)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});

/**
 * Generate 6-Character Unique Invite Code
 */
export function generateInviteCode(teamName: string): string {
  const prefix = teamName.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase() || 'SOCC';
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}

/**
 * Firebase Auth: Sign In with Google Social Login
 */
export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserProfile(result.user);
  return result.user;
}

/**
 * Firebase Auth: Sign Up with Email & Password
 */
export async function registerWithEmail(email: string, pass: string, name: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  await ensureUserProfile(cred.user, name);
  return cred.user;
}

/**
 * Firebase Auth: Sign In with Email & Password
 */
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  await ensureUserProfile(cred.user);
  return cred.user;
}

/**
 * Firebase Auth: Sign Out
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Ensure User Profile Document in Firestore
 */
export async function ensureUserProfile(user: User, fallbackName?: string): Promise<UserProfile> {
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || fallbackName || user.email?.split('@')[0] || 'Coach',
    photoURL: user.photoURL || undefined,
    teamIds: [],
    activeTeamId: ''
  };

  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      return snap.data() as UserProfile;
    } else {
      await setDoc(userRef, profile).catch(e => console.warn('User profile sync fallback:', e));
      return profile;
    }
  } catch (e) {
    console.warn('Profile fetch fallback active:', e);
    return profile;
  }
}

/**
 * Cloud Sync Team to Firestore
 */
export async function syncTeamToCloud(team: Team, currentUser?: User | null): Promise<boolean> {
  try {
    const updatedTeam: Team = {
      ...team,
      ownerId: team.ownerId || currentUser?.uid || 'guest-owner',
      inviteCode: team.inviteCode || generateInviteCode(team.name),
      members: team.members || (currentUser ? [{
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || 'Head Coach',
        role: 'coach',
        joinedAt: new Date().toISOString()
      }] : [])
    };

    const teamRef = doc(db, 'teams', updatedTeam.id);
    await setDoc(teamRef, updatedTeam, { merge: true });

    // Link teamId to user profile if user is logged in
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        teamIds: arrayUnion(updatedTeam.id),
        activeTeamId: updatedTeam.id
      }).catch(async () => {
        await ensureUserProfile(currentUser);
        await updateDoc(userRef, {
          teamIds: arrayUnion(updatedTeam.id),
          activeTeamId: updatedTeam.id
        });
      });
    }

    return true;
  } catch (e) {
    console.warn('Cloud sync offline fallback active:', e);
    return false;
  }
}

/**
 * Fetch User Teams from Firestore
 */
export async function fetchUserTeams(userUid: string): Promise<Team[]> {
  try {
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where('ownerId', '==', userUid));
    const querySnapshot = await getDocs(q);

    const teams: Team[] = [];
    querySnapshot.forEach((doc) => {
      teams.push(doc.data() as Team);
    });

    // Also fetch teams where user is a member
    const allSnapshot = await getDocs(collection(db, 'teams'));
    allSnapshot.forEach((doc) => {
      const data = doc.data() as Team;
      if (data.members?.some(m => m.uid === userUid) && !teams.some(t => t.id === data.id)) {
        teams.push(data);
      }
    });

    return teams;
  } catch (e) {
    console.warn('Cloud fetch failed, using local teams fallback.');
    return [];
  }
}

/**
 * Join Team using 6-Character Invite Code
 */
export async function joinTeamWithInviteCode(code: string, user: User, targetRole: TeamRole = 'parent'): Promise<Team | null> {
  try {
    const cleanCode = code.trim().toUpperCase();
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where('inviteCode', '==', cleanCode));
    const snap = await getDocs(q);

    if (snap.empty) return null;

    const teamDoc = snap.docs[0];
    const teamData = teamDoc.data() as Team;

    const existingMembers = teamData.members || [];
    if (!existingMembers.some(m => m.uid === user.uid)) {
      const newMember: TeamMember = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Team Member',
        role: targetRole,
        joinedAt: new Date().toISOString()
      };
      const updatedMembers = [...existingMembers, newMember];
      await updateDoc(doc(db, 'teams', teamData.id), { members: updatedMembers });
      teamData.members = updatedMembers;
    }

    // Link team to user profile
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      teamIds: arrayUnion(teamData.id),
      activeTeamId: teamData.id
    });

    return teamData;
  } catch (e) {
    console.error('Error joining team with invite code:', e);
    return null;
  }
}

/**
 * Sync All Local Storage Data (Guest Work) to Firestore Cloud upon Login
 */
export async function syncAllLocalToCloud(user: User, localTeams: Team[], localDrills: any[], localScenarios: any[]): Promise<void> {
  try {
    // 1. Sync teams
    for (const team of localTeams) {
      await syncTeamToCloud(team, user);
    }

    // 2. Sync Custom Drills
    if (localDrills.length > 0) {
      const drillsRef = doc(db, 'users', user.uid, 'custom_drills', 'drills');
      await setDoc(drillsRef, { drills: localDrills }, { merge: true });
    }

    // 3. Sync Tactical Scenarios
    if (localScenarios.length > 0) {
      const scenariosRef = doc(db, 'users', user.uid, 'tactical_scenarios', 'scenarios');
      await setDoc(scenariosRef, { scenarios: localScenarios }, { merge: true });
    }
  } catch (e) {
    console.warn('Error during local to cloud sync:', e);
  }
}
