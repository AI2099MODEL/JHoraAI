/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  deleteUser, 
  sendPasswordResetEmail, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  User as FirebaseUser,
  Auth
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc,
  Firestore
} from "firebase/firestore";

// Safe, embedded fallback configuration from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyB3TnU9HFn22A7jYUY8t86HXMtBQ8c1nV8",
  authDomain: "gen-lang-client-0193743078.firebaseapp.com",
  projectId: "gen-lang-client-0193743078",
  storageBucket: "gen-lang-client-0193743078.firebasestorage.app",
  messagingSenderId: "79558992702",
  appId: "1:79558992702:web:dbe18c64b5ed44fa77c26f"
};

let app;
let auth: Auth;
let db: Firestore;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
}

// User profile schema
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  createdDate: string;
  lastLogin: string;
  savedProfiles: any[];
  favorites: string[];
  history: any[];
  settings: {
    theme: "dark" | "light";
    ayanamsa: string;
    chartStyle: "north" | "south";
    language: string;
    autoUpdate: boolean;
  };
}

/**
 * UserProfileRepository handles syncing of the UserProfile collections.
 */
export const UserProfileRepository = {
  async getProfile(uid: string): Promise<UserProfile | null> {
    if (!db) return null;
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
    } catch (err) {
      console.error("Error reading profile:", err);
    }
    return null;
  },

  async saveProfile(profile: UserProfile): Promise<void> {
    if (!db) return;
    try {
      const docRef = doc(db, "users", profile.uid);
      await setDoc(docRef, profile, { merge: true });
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  },

  async updateSettings(uid: string, settings: Partial<UserProfile["settings"]>): Promise<void> {
    if (!db) return;
    try {
      const docRef = doc(db, "users", uid);
      await updateDoc(docRef, { settings });
    } catch (err) {
      console.error("Error updating settings:", err);
    }
  },

  async updateSavedProfiles(uid: string, savedProfiles: any[]): Promise<void> {
    if (!db) return;
    try {
      const docRef = doc(db, "users", uid);
      await updateDoc(docRef, { savedProfiles });
    } catch (err) {
      console.error("Error updating profiles:", err);
    }
  }
};

/**
 * SessionManager handles active token refresh, local storage auth tracking, and auto sign-in states.
 */
export const SessionManager = {
  saveSession(user: FirebaseUser) {
    localStorage.setItem("jhora_auth_session", JSON.stringify({
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      lastActive: Date.now()
    }));
  },

  clearSession() {
    localStorage.removeItem("jhora_auth_session");
  },

  getLocalSession() {
    const data = localStorage.getItem("jhora_auth_session");
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
};

/**
 * AuthRepository coordinates user profiles with Firebase Auth services.
 */
export const AuthRepository = {
  async syncUserProfile(firebaseUser: FirebaseUser): Promise<UserProfile> {
    const existing = await UserProfileRepository.getProfile(firebaseUser.uid);
    const nowISO = new Date().toISOString();
    
    if (existing) {
      const updated: UserProfile = {
        ...existing,
        name: firebaseUser.displayName || existing.name || "Vedic Astrologer",
        email: firebaseUser.email || existing.email || "",
        photoURL: firebaseUser.photoURL || existing.photoURL || "",
        lastLogin: nowISO
      };
      await UserProfileRepository.saveProfile(updated);
      return updated;
    } else {
      const defaultProfile: UserProfile = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || "Vedic Astrologer",
        email: firebaseUser.email || "",
        photoURL: firebaseUser.photoURL || "",
        createdDate: nowISO,
        lastLogin: nowISO,
        savedProfiles: [],
        favorites: [],
        history: [],
        settings: {
          theme: "dark",
          ayanamsa: "Lahiri (Chitra Paksha)",
          chartStyle: "north",
          language: "English",
          autoUpdate: true
        }
      };
      await UserProfileRepository.saveProfile(defaultProfile);
      return defaultProfile;
    }
  }
};

/**
 * AuthManager contains core Firebase Auth workflows.
 */
export const AuthManager = {
  get auth() {
    return auth;
  },

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    if (!auth) return () => {};
    return onAuthStateChanged(auth, callback);
  },

  async signInWithGoogle(): Promise<FirebaseUser> {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    SessionManager.saveSession(result.user);
    await AuthRepository.syncUserProfile(result.user);
    return result.user;
  },

  async signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    const result = await signInWithEmailAndPassword(auth, email, password);
    SessionManager.saveSession(result.user);
    await AuthRepository.syncUserProfile(result.user);
    return result.user;
  },

  async signUpWithEmail(email: string, password: string, name: string): Promise<FirebaseUser> {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    SessionManager.saveSession(result.user);
    await AuthRepository.syncUserProfile(result.user);
    return result.user;
  },

  async logout(): Promise<void> {
    if (!auth) return;
    await signOut(auth);
    SessionManager.clearSession();
  },

  async sendPasswordReset(email: string): Promise<void> {
    if (!auth) return;
    await sendPasswordResetEmail(auth, email);
  },

  async deleteAccount(): Promise<void> {
    if (!auth || !auth.currentUser) return;
    const user = auth.currentUser;
    // Attempt delete doc
    try {
      if (db) {
        await deleteDoc(doc(db, "users", user.uid));
      }
    } catch (e) {
      console.warn("Could not delete user profile document from Firestore, proceeding to delete auth profile", e);
    }
    await deleteUser(user);
    SessionManager.clearSession();
  }
};
