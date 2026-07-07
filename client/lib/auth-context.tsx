"use client";
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
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
    // Use a ref to track if we've already processed the initial auth state
  const hasProcessedInitialAuth = useRef(false);
  
  // Function to update user profile
  const updateUserProfile = async (profileData: { displayName?: string; bio?: string }) => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      // Update Firebase profile if displayName changed
      if (profileData.displayName && profileData.displayName !== auth.currentUser.displayName) {
        await import('firebase/auth').then(({ updateProfile }) => 
          updateProfile(auth.currentUser!, { displayName: profileData.displayName })
        );
      }

      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        displayName: profileData.displayName || prev.displayName
      } : null);

      // Update localStorage
      if (typeof window !== 'undefined') {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          displayName: profileData.displayName || currentUser.displayName
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Store profile data separately for other components to use
        const profileSettings = JSON.parse(localStorage.getItem('adhyayan-profile') || '{}');
        const updatedProfile = {
          ...profileSettings,
          ...profileData
        };
        localStorage.setItem('adhyayan-profile', JSON.stringify(updatedProfile));
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('userProfileUpdated', {
          detail: updatedProfile
        }));
      }

      console.log('User profile updated successfully');
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // Function to refresh user data from Firebase
  const refreshUserData = async () => {
    if (auth.currentUser) {
      try {
        // Force refresh the user token to get latest data
        await auth.currentUser.reload();
        const refreshedUser = auth.currentUser;
        
        const userData = {
          uid: refreshedUser.uid,
          email: refreshedUser.email,
          displayName: refreshedUser.displayName,
          photoURL: refreshedUser.photoURL,
        };
          // Update stored user data with fresh data
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('firebaseUserId', userData.uid); // Store Firebase UID separately for payment system
        }
        
        setUser(userData);
        console.log('User data refreshed:', userData);
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };
  const login = async (idToken: string, userData: any) => {
    try {
      setIsAuthenticating(true);
      const response = await apiService.authenticateWithGoogle(idToken, userData);
      setUser(userData);
      setIsAuthenticated(true);
      
      // Store Firebase UID for payment system
      if (typeof window !== 'undefined') {
        localStorage.setItem('firebaseUserId', userData.uid);
      }
      
      // Only redirect to dashboard if user is on the home page (fresh sign-in)
      if (typeof window !== 'undefined' && window.location.pathname === '/') {
        window.location.href = '/dashboard';
      } else {
        setIsAuthenticating(false);
      }
    } catch (error) {
      setIsAuthenticating(false);
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    // apiService.logout() is fire-and-forget safe – it clears localStorage internally.
    await apiService.logout();

    // Clear React state
    setUser(null);
    setIsAuthenticated(false);
    hasProcessedInitialAuth.current = false;

    // Sign out of Firebase
    if (auth.currentUser) {
      try {
        await auth.signOut();
      } catch (error) {
        console.error('Firebase sign-out error (non-critical):', error);
      }
    }
  };

  useEffect(() => {
    let isComponentMounted = true;
    
    // Check if user is already authenticated on page load
    const storedUser = apiService.getStoredUser();
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (storedUser && token) {
      // Validate that stored user has required fields
      if (storedUser.uid && (storedUser.email || storedUser.displayName)) {
        setUser(storedUser);
        setIsAuthenticated(true);
        hasProcessedInitialAuth.current = true;
        
        // Ensure Firebase UID is stored for payment system
        if (typeof window !== 'undefined') {
          localStorage.setItem('firebaseUserId', storedUser.uid);
        }
        
        // Refresh user data in the background to ensure it's up to date
        setTimeout(() => {
          refreshUserData();
        }, 1000);
      } else {        // Clear invalid stored data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('firebaseUserId'); // Clear Firebase UID
        }
      }
    }

    // Handle redirect result to log success or catch errors
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log('Redirect sign-in completed successfully');
        }
      })
      .catch((error) => {
        console.error('Error handling redirect result:', error);
      });

    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isComponentMounted) return;
      
      if (firebaseUser && !hasProcessedInitialAuth.current) {
        // User just signed in via Firebase for the first time, authenticate with backend
        setIsAuthenticating(true);
        try {
          const idToken = await firebaseUser.getIdToken();
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          };          // Call login function directly to avoid circular dependency
          const response = await apiService.authenticateWithGoogle(idToken, userData);
          setUser(userData);
          setIsAuthenticated(true);
          hasProcessedInitialAuth.current = true;
          
          // Store Firebase UID for payment system
          if (typeof window !== 'undefined') {
            localStorage.setItem('firebaseUserId', userData.uid);
          }
          
          // Only redirect to dashboard if user is on the home page (fresh sign-in)
          if (typeof window !== 'undefined' && window.location.pathname === '/') {
            window.location.href = '/dashboard';
          } else {
            setIsAuthenticating(false);
          }
        } catch (error) {
          console.error('Backend authentication failed:', error);
          setIsAuthenticating(false);
        }
      } else if (!firebaseUser && hasProcessedInitialAuth.current) {
        // User signed out of Firebase, clean up our auth state
        setUser(null);
        setIsAuthenticated(false);
        hasProcessedInitialAuth.current = false;        // Clear local storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('firebaseUserId'); // Clear Firebase UID
        }
      }
      
      if (isComponentMounted) {
        setLoading(false);
      }
    });    return () => {
      isComponentMounted = false;
      unsubscribe();
    };
  }, []); // Remove router dependency
  const value = {
    user,
    loading,
    isAuthenticated,
    isAuthenticating,
    setIsAuthenticating,
    login,
    logout,
    refreshUserData, // Expose this function for manual refresh if needed
    updateUserProfile, // Add the new update function
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
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center space-y-6"
      >
        {/* Lemniscate Bloom Loader */}
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
          <h3 className="text-white font-medium text-lg tracking-wide">
            Authenticating
          </h3>
          <p className="text-neutral-400 text-sm">
            Setting up your secure session...
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
