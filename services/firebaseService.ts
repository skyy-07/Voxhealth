import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, User } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, deleteDoc, doc } from "firebase/firestore";
import { ScanResult, UserProfile } from "../types";

// NOTE: In a production app, these would be populated via process.env
// For this generated code to run immediately without user config, we will use a hybrid approach:
// We try to initialize Firebase, but if config is missing, we use LocalStorage to mock the DB.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "mock_key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "mock_domain",
  projectId: process.env.FIREBASE_PROJECT_ID || "mock_project",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Mock storage key
const MOCK_STORAGE_KEY = 'voxhealth_scans';

export const signInUser = async (): Promise<User | null> => {
  try {
    // Attempt anonymous sign in
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.warn("Firebase Auth failed (likely due to missing config), using mock user.");
    // Return a mock user structure if Firebase fails
    return { uid: "mock-user-123", isAnonymous: true } as User;
  }
};

export const saveScanResult = async (userId: string, result: ScanResult): Promise<void> => {
  try {
    if (process.env.FIREBASE_API_KEY) {
      await addDoc(collection(db, "users", userId, "scans"), result);
    } else {
      throw new Error("No config");
    }
  } catch (e) {
    console.log("Saving to local storage (Mock Mode)");
    const existing = localStorage.getItem(MOCK_STORAGE_KEY);
    const scans = existing ? JSON.parse(existing) : [];
    scans.unshift(result);
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(scans));
  }
};

export const deleteScanResult = async (userId: string, scanId: string): Promise<void> => {
  try {
    if (process.env.FIREBASE_API_KEY) {
      await deleteDoc(doc(db, "users", userId, "scans", scanId));
    } else {
      throw new Error("No config");
    }
  } catch (e) {
    console.log("Deleting from local storage (Mock Mode)");
    const existing = localStorage.getItem(MOCK_STORAGE_KEY);
    if (existing) {
      const scans = JSON.parse(existing) as ScanResult[];
      const filtered = scans.filter(s => s.id !== scanId);
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(filtered));
    }
  }
};

export const getScanHistory = async (userId: string): Promise<ScanResult[]> => {
  try {
    if (process.env.FIREBASE_API_KEY) {
      const q = query(collection(db, "users", userId, "scans"), orderBy("date", "desc"), limit(20));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScanResult));
    } else {
       throw new Error("No config");
    }
  } catch (e) {
    console.log("Reading from local storage (Mock Mode)");
    const existing = localStorage.getItem(MOCK_STORAGE_KEY);
    if (!existing) return [];
    
    try {
        const parsed = JSON.parse(existing) as ScanResult[];
        // Basic validation filter to remove corrupt records that cause crashes
        return parsed.filter(scan => 
            scan && 
            scan.data && 
            scan.data.frontend_state && 
            scan.data.clinical_inference
        );
    } catch (err) {
        console.error("Corrupt local storage data", err);
        return [];
    }
  }
};