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

// Safe, embedded fallback configuration from firebase-applet-config.json or environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB3TnU9HFn22A7jYUY8t86HXMtBQ8c1nV8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0193743078.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0193743078",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0193743078.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "79558992702",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:79558992702:web:dbe18c64b5ed44fa77c26f"
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
  
  // If user-defined custom Firebase environment variables are provided, initialize with the default database.
  // Otherwise, use the custom AI Studio database ID to avoid breaking the fallback database connection.
  if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    db = getFirestore(app);
  } else {
    db = getFirestore(app, "ai-studio-jhoraai-b515adab-0d0d-4cd6-aed5-99cdb77486ac");
  }
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
}

// User profile schema
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phoneNumber?: string;
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
 * Save user profile to Google Drive as jhora_user_profile.json
 */
export async function saveProfileToGoogleDrive(accessToken: string, profile: UserProfile): Promise<void> {
  try {
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='jhora_user_profile.json' and trashed=false&fields=files(id)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    let fileId: string | null = null;
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.files && searchData.files.length > 0) {
        fileId = searchData.files[0].id;
      }
    }

    const metadata = {
      name: "jhora_user_profile.json",
      mimeType: "application/json"
    };
    const fileContent = JSON.stringify(profile, null, 2);

    const boundary = "314159265358979323846";
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;
    const body = 
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      closeDelimiter;

    const url = fileId 
      ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
      : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
    const method = fileId ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`
      },
      body
    });
    if (!response.ok) {
      console.error("Google Drive API response error:", response.statusText);
    } else {
      console.log("Successfully saved profile to Google Drive.");
    }
  } catch (err) {
    console.error("Error writing user profile to Google Drive:", err);
  }
}

/**
 * Fetch phone number from Google People API using Google OAuth Access Token
 */
export async function fetchGooglePhoneNumber(accessToken: string): Promise<string | undefined> {
  try {
    const response = await fetch(
      "https://people.googleapis.com/v1/people/me?personFields=phoneNumbers",
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    if (!response.ok) {
      console.warn("Google People API returned error status:", response.status, response.statusText);
      return undefined;
    }
    const data = await response.json();
    if (data.phoneNumbers && data.phoneNumbers.length > 0) {
      const primary = data.phoneNumbers.find((p: any) => p.metadata?.primary) || data.phoneNumbers[0];
      return primary.value;
    }
  } catch (err) {
    console.error("Error fetching Google phone number:", err);
  }
  return undefined;
}

/**
 * Save user profile to Express Backend
 */
export async function saveProfileToBackend(profile: UserProfile): Promise<void> {
  try {
    const response = await fetch("/api/user-profile/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(profile)
    });
    if (!response.ok) {
      console.error("Express backend user-profile save error:", response.statusText);
    } else {
      console.log("Successfully saved profile to backend.");
    }
  } catch (err) {
    console.error("Error sending user profile to backend:", err);
  }
}

/**
 * Encode MIME email message format into web-safe base64
 */
export function encodeEmail(to: string, subject: string, htmlBody: string): string {
  const email = [
    `To: ${to}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    htmlBody
  ].join("\r\n");

  return btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Send personalized astrology analysis directly via the user's Gmail API (Google OAuth integration)
 */
export async function sendEmailViaGmail(accessToken: string, to: string, subject: string, htmlBody: string): Promise<void> {
  try {
    const raw = encodeEmail(to, subject, htmlBody);
    const response = await fetch("https://gmail.googleapis.com/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ raw })
    });
    if (!response.ok) {
      const errText = await response.text();
      console.error("Gmail API failed with status:", response.status, response.statusText, errText);
      throw new Error(`Gmail Send Error: ${response.statusText}`);
    } else {
      console.log("Email successfully dispatched via Google Gmail API!");
    }
  } catch (err) {
    console.error("Error in sendEmailViaGmail:", err);
    throw err;
  }
}

/**
 * SessionManager handles active token refresh, local storage auth tracking, and auto sign-in states.
 */
export const SessionManager = {
  saveSession(user: FirebaseUser, accessToken?: string) {
    localStorage.setItem("jhora_auth_session", JSON.stringify({
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL,
      accessToken,
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
  async syncUserProfile(firebaseUser: FirebaseUser, accessToken?: string, forcePhone?: string): Promise<UserProfile> {
    const existing = await UserProfileRepository.getProfile(firebaseUser.uid);
    const nowISO = new Date().toISOString();
    
    let phoneNumber = forcePhone || existing?.phoneNumber;
    if (!phoneNumber && accessToken) {
      phoneNumber = await fetchGooglePhoneNumber(accessToken);
    }

    let updatedProfile: UserProfile;
    
    if (existing) {
      updatedProfile = {
        ...existing,
        name: firebaseUser.displayName || existing.name || "Vedic Astrologer",
        email: firebaseUser.email || existing.email || "",
        phoneNumber: phoneNumber || existing.phoneNumber || "",
        photoURL: firebaseUser.photoURL || existing.photoURL || "",
        lastLogin: nowISO
      };
    } else {
      updatedProfile = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || "Vedic Astrologer",
        email: firebaseUser.email || "",
        phoneNumber: phoneNumber || "",
        photoURL: firebaseUser.photoURL || "",
        createdDate: nowISO,
        lastLogin: nowISO,
        savedProfiles: [],
        favorites: [],
        history: [],
        settings: {
          theme: "light",
          ayanamsa: "Lahiri (Chitra Paksha)",
          chartStyle: "north",
          language: "English",
          autoUpdate: true
        }
      };
    }

    // Save to Firestore
    await UserProfileRepository.saveProfile(updatedProfile);

    // Save to local storage for offline support
    localStorage.setItem("jhora_user_profile", JSON.stringify(updatedProfile));

    // Save to Express Backend for analysis & reporting
    await saveProfileToBackend(updatedProfile);

    // Save to Google Drive if OAuth accessToken is available
    if (accessToken) {
      await saveProfileToGoogleDrive(accessToken, updatedProfile);
    }

    return updatedProfile;
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

  async signInWithGoogle(): Promise<{ user: FirebaseUser; accessToken?: string; profile: UserProfile }> {
    if (!auth) throw new Error("Firebase Auth is not initialized.");
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/userinfo.email');
    provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
    provider.addScope('https://www.googleapis.com/auth/drive.file');
    provider.addScope('https://www.googleapis.com/auth/user.phonenumbers.read');
    provider.addScope('https://www.googleapis.com/auth/gmail.send');
    
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken || undefined;
    
    SessionManager.saveSession(result.user, accessToken);
    const profile = await AuthRepository.syncUserProfile(result.user, accessToken);
    return { user: result.user, accessToken, profile };
  },

  async logout(): Promise<void> {
    if (!auth) return;
    await signOut(auth);
    SessionManager.clearSession();
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
