import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance safely (singleton pattern)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Official Google Workspace Scopes requested by user
// Official Google Workspace Scopes configured via OAuth setup
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const provider = new GoogleAuthProvider();
// Add Google Workspace scopes
WORKSPACE_SCOPES.forEach((scope) => provider.addScope(scope));
// Force prompt to ensure refresh/consent if needed
provider.setCustomParameters({
  prompt: 'select_account',
});

// Flag to track sign-in in progress
let isSigningIn = false;

// IN-MEMORY ONLY access token storage (Security Rule: never store in localStorage)
let cachedAccessToken: string | null = null;
let currentGoogleUser: User | null = null;

// Auth state listeners
type AuthListener = (user: User | null, token: string | null) => void;
const listeners: Set<AuthListener> = new Set();

export const subscribeToGoogleAuth = (listener: AuthListener) => {
  listeners.add(listener);
  // Initial emit
  listener(currentGoogleUser, cachedAccessToken);
  return () => {
    listeners.delete(listener);
  };
};

function notifyListeners() {
  listeners.forEach((l) => l(currentGoogleUser, cachedAccessToken));
}

// Initialize Auth Listener on app start
export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    currentGoogleUser = user;
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token was cleared on page reload or expired, notify failure so user can click reconnect
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
    notifyListeners();
  });
};

/**
 * Initiates Sign-In with Google to access Google Sheets & Drive
 */
export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('गूगल से एक्सेस टोकन प्राप्त नहीं हो सका। कृपया पुनः प्रयास करें।');
    }

    cachedAccessToken = credential.accessToken;
    currentGoogleUser = result.user;
    notifyListeners();
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get the in-memory access token
 */
export const getGoogleAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Check if Google Sheets API is currently connected and authenticated
 */
export const isGoogleConnected = (): boolean => {
  return !!cachedAccessToken && !!currentGoogleUser;
};

/**
 * Get currently authenticated Google User details
 */
export const getGoogleUser = (): User | null => {
  return currentGoogleUser;
};

/**
 * Disconnect/Sign out from Google
 */
export const signOutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  currentGoogleUser = null;
  notifyListeners();
};
