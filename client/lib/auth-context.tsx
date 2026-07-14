"use client";
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged, getRedirectResult, browserPopupRedirectResolver } from 'firebase/auth';
import { auth } from './firebase';
import { apiService } from './api';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LemniscateBloom } from '@/components/ui/lemniscate-bloom';

interface CustomUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  setIsAuthenticating: (val: boolean) => void;
  login: (idToken: string, user: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData?: () => Promise<void>;
  updateUserProfile?: (profileData: { displayName?: string; bio?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  isAuthenticating: false,
  setIsAuthenticating: () => {},
  login: async () => {},
  logout: async () => {},
  refreshUserData: async () => {},
  updateUserProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const router = useRouter();

  // Track whether we've already run the backend auth call for the current Firebase session.
  // This prevents duplicate backend calls when both localStorage restore AND
  // onAuthStateChanged fire for the same user.
  const backendAuthDoneRef = useRef(false);

  // ─── Update user profile ──────────────────────────────────────────────────
  const updateUserProfile = async (profileData: { displayName?: string; bio?: string }) => {
    const isTestUser = user?.uid === 'test-admin-uid-12345';
    if (!auth.currentUser && !isTestUser) throw new Error('No authenticated user');

    try {
      if (!isTestUser && profileData.displayName && profileData.displayName !== auth.currentUser?.displayName) {
        await import('firebase/auth').then(({ updateProfile }) =>
          updateProfile(auth.currentUser!, { displayName: profileData.displayName })
        );
      }

      setUser(prev =>
        prev ? { ...prev, displayName: profileData.displayName || prev.displayName } : null
      );

      if (typeof window !== 'undefined') {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, displayName: profileData.displayName || currentUser.displayName };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        const profileSettings = JSON.parse(localStorage.getItem('adhyayan-profile') || '{}');
        localStorage.setItem('adhyayan-profile', JSON.stringify({ ...profileSettings, ...profileData }));

        window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: { ...profileSettings, ...profileData } }));
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // ─── Refresh user data from Firebase ─────────────────────────────────────
  const refreshUserData = async () => {
    if (user?.uid === 'test-admin-uid-12345') return;
    if (!auth.currentUser) return;
    try {
      await auth.currentUser.reload();
      const refreshedUser = auth.currentUser;
      const userData: CustomUser = {
        uid: refreshedUser.uid,
        email: refreshedUser.email,
        displayName: refreshedUser.displayName,
        photoURL: refreshedUser.photoURL,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('firebaseUserId', userData.uid);
      }
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // ─── Core backend auth call ───────────────────────────────────────────────
  // Calls the backend, persists the JWT, and updates React state.
  // Returns true on success, false on failure.
  const authenticateWithBackend = async (firebaseUser: User): Promise<boolean> => {
    try {
      const idToken = await firebaseUser.getIdToken(/* forceRefresh */ true);
      const userData: CustomUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      };

      const response = await apiService.authenticateWithGoogle(idToken, userData);

      if (!response?.token) {
        console.error('Backend returned no token');
        return false;
      }

      setUser(userData);
      setIsAuthenticated(true);
      backendAuthDoneRef.current = true;

      if (typeof window !== 'undefined') {
        localStorage.setItem('firebaseUserId', userData.uid);
      }

      return true;
    } catch (error) {
      console.error('Backend authentication failed:', error);
      return false;
    }
  };

  // ─── login() — called explicitly by sign-in buttons ─────────────────────
  const login = async (idToken: string, userData: any) => {
    try {
      setIsAuthenticating(true);
      const response = await apiService.authenticateWithGoogle(idToken, userData);

      if (!response?.token) {
        throw new Error('No token received from server');
      }

      setUser(userData);
      setIsAuthenticated(true);
      backendAuthDoneRef.current = true;

      if (typeof window !== 'undefined') {
        localStorage.setItem('firebaseUserId', userData.uid);
      }

      // Navigate client-side — no full page reload
      router.push('/dashboard');
      setIsAuthenticating(false);
    } catch (error) {
      setIsAuthenticating(false);
      console.error('Login failed:', error);
      throw error;
    }
  };

  // ─── logout() ─────────────────────────────────────────────────────────────
  const logout = async () => {
    await apiService.logout();

    setUser(null);
    setIsAuthenticated(false);
    backendAuthDoneRef.current = false;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('firebaseUserId');
      localStorage.removeItem('adhyayan-profile');
    }

    if (auth.currentUser) {
      try {
        await auth.signOut();
      } catch (error) {
        console.error('Firebase sign-out error (non-critical):', error);
      }
    }
  };

  // ─── Main auth effect ─────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // 1. Fast-path: restore from localStorage so the UI isn't blank.
      const storedUser = apiService.getStoredUser();
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      if (storedUser && token) {
        setUser(storedUser);
        setIsAuthenticated(true);
        backendAuthDoneRef.current = true;

        if (typeof window !== 'undefined') {
          localStorage.setItem('firebaseUserId', storedUser.uid);
        }
      }

      // 2. Handle redirect sign-in result BEFORE subscribing to onAuthStateChanged.
      //    This is critical for mobile / popup-blocked flows.
      try {
        const redirectResult = await getRedirectResult(auth, browserPopupRedirectResolver);
        if (redirectResult?.user && mounted) {
          console.log('Redirect sign-in completed, authenticating with backend…');
          setIsAuthenticating(true);
          backendAuthDoneRef.current = false; // force a fresh backend call
          const ok = await authenticateWithBackend(redirectResult.user);
          if (ok && mounted) {
            router.push('/dashboard');
          }
          if (mounted) setIsAuthenticating(false);
        }
      } catch (redirectError) {
        console.error('Error handling redirect result:', redirectError);
        if (mounted) setIsAuthenticating(false);
      }

      // 3. Subscribe to Firebase auth state changes.
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!mounted) return;

        if (firebaseUser) {
          // If we haven't done the backend auth yet for this Firebase user, do it now.
          if (!backendAuthDoneRef.current) {
            setIsAuthenticating(true);
            const ok = await authenticateWithBackend(firebaseUser);
            if (mounted) {
              setIsAuthenticating(false);
              if (ok && typeof window !== 'undefined' && window.location.pathname === '/') {
                // Use client-side navigation — no full reload
                router.push('/dashboard');
              }
            }
          }
        } else {
          // Firebase says no user — clean up if we had one.
          // BUT: do not clean up if the current logged-in user is the test-admin!
          const storedUser = apiService.getStoredUser();
          const isTestUser = storedUser?.uid === 'test-admin-uid-12345';
          if (backendAuthDoneRef.current && !isTestUser) {
            setUser(null);
            setIsAuthenticated(false);
            backendAuthDoneRef.current = false;
            if (typeof window !== 'undefined') {
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
              localStorage.removeItem('firebaseUserId');
            }
          }
        }

        // Loading is resolved once Firebase has responded.
        if (mounted) setLoading(false);
      });

      return unsubscribe;
    };

    let unsubscribeAuth: (() => void) | undefined;
    initAuth().then((unsub) => {
      if (unsub) unsubscribeAuth = unsub;
    });

    return () => {
      mounted = false;
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    user,
    loading,
    isAuthenticated,
    isAuthenticating,
    setIsAuthenticating,
    login,
    logout,
    refreshUserData,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {isAuthenticating && <AuthLoadingOverlay />}
    </AuthContext.Provider>
  );
};

const AuthLoadingOverlay = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/85 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center space-y-6"
      >
        <div className="relative w-48 h-48">
          <LemniscateBloom
            className="w-full h-full text-cyan-400"
            particleCount={70}
            trailSpan={0.4}
            durationMs={5600}
            strokeWidth={4.8}
            lemniscateA={20}
            lemniscateBoost={7}
            color="currentColor"
          />
        </div>

        <div className="space-y-1 text-center">
          <h3 className="text-white font-medium text-lg tracking-wide">Authenticating</h3>
          <p className="text-neutral-400 text-sm">Setting up your secure session...</p>
        </div>
      </motion.div>
    </motion.div>
  );
};
