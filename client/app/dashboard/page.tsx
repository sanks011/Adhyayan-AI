"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { FloatingDock } from "@/components/ui/floating-dock";
import DarkVeil from "@/components/DarkVeil";
import BlackHoleLoader from "@/components/ui/black-hole-loader";
import { GyanPointsDisplay } from "@/components/custom/GyanPointsDisplay";
import confetti from "canvas-confetti";
import { Card, CardBody, Button, Input, Skeleton } from "@heroui/react";
import toast from 'react-hot-toast';
import {
  IconHome,
  IconUsers,
  IconBrain,
  IconSettings,
  IconLogout,
  IconPlus,
  IconMap,
  IconCalendar,
  IconEye,
  IconChevronRight,
  IconSearch,
  IconFilter,
  IconGridDots,
  IconList,
  IconSortAscending,
  IconSortDescending
} from "@tabler/icons-react";

interface MindMap {
  id: string;
  title: string;
  subject: string;
  created_at: string;
  updated_at: string;
  nodes_count?: number;
}

export default function Dashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [displayName, setDisplayName] = useState('');

  // Trigger confetti on first dashboard load after sign-in
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isAuthenticated && user && !loading) {
      // Check if this is a new session (just signed in)
      const confettiShown = sessionStorage.getItem('adhyayan-confetti-shown');
      
      if (!confettiShown) {
        console.log('Scheduling confetti!');
        
        // Small delay to ensure page is loaded
        timer = setTimeout(() => {
          // Mark as shown only when actually fired to handle React StrictMode double-mounts
          sessionStorage.setItem('adhyayan-confetti-shown', 'true');
          
          // Fire a big burst from the center
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'],
          });
        }, 500);
      }
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isAuthenticated, user, loading]);

  // Update display name when user changes or when profile is updated
  useEffect(() => {
    const updateDisplayName = () => {
      const savedProfile = localStorage.getItem('adhyayan-profile');
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          setDisplayName(profile.displayName || user?.displayName || '');
        } catch (error) {
          setDisplayName(user?.displayName || '');
        }
      } else {
        setDisplayName(user?.displayName || '');
      }
    };

    updateDisplayName();

    // Listen for profile updates
    const handleProfileUpdate = () => {
      updateDisplayName();
    };

    const handleSettingsUpdate = (event: CustomEvent) => {
      if (event.detail?.profile?.displayName) {
        setDisplayName(event.detail.profile.displayName);
      }
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    window.addEventListener('settingsUpdated', handleSettingsUpdate as EventListener);

    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
      window.removeEventListener('settingsUpdated', handleSettingsUpdate as EventListener);
    };
  }, [user]);

  const handleSignOut = async () => {
    try {
      // Clear confetti flag so it triggers on next sign-in
      sessionStorage.removeItem('adhyayan-confetti-shown');
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Generate a fallback avatar URL
  const getFallbackAvatar = () => {
    const name = displayName || user?.displayName || user?.email || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=374151&color=ffffff&size=80&font-size=0.33`;
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };
  // Redirect unauthenticated users inside an effect to avoid calling router.push() during render
  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      setIsRedirecting(true);
      router.push('/');
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <BlackHoleLoader />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }
  const dockLinks = [
    {
      title: "Home",
      icon: (
        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/",
    },
    {
      title: "Dashboard",
      icon: (
        <IconBrain className="h-full w-full text-red-400 dark:text-red-400" />
      ),
      href: "/dashboard",
    },
    {
      title: "Mind Map",
      icon: (
        <IconMap className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/mind-map",
    },
    {
      title: "Settings",
      icon: (
        <IconSettings className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/settings",
    },
    {
      title: "Sign Out",
      icon: (
        <IconLogout className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
      onClick: handleSignOut,
    },
  ];

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-8 overflow-hidden bg-black">
      {/* Background Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <DarkVeil
          hueShift={0}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={0.5}
          scanlineFrequency={0}
          warpAmount={0}
          resolutionScale={1}
        />
      </div>
          {/* Gyan Points Display - Top Right Corner */}
        <div className="fixed top-4 right-4 z-50 md:top-6 md:right-8 lg:right-12">
          <GyanPointsDisplay />
        </div>{/* Welcome Message */}
        <div className="text-center mb-16 z-10">
          <div className="flex items-center justify-center mb-6">
            <div className="relative mr-4">
              {/* Fallback/Loading avatar */}
              <div className="w-20 h-20 rounded-full border-4 border-neutral-700 bg-neutral-800 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {(displayName?.charAt(0) || user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
                </span>
              </div>
              
              {/* Actual user image */}
              {user?.photoURL && !imageError && (
                <img 
                  src={user.photoURL} 
                  alt={displayName || user.displayName || user.email || 'User'} 
                  className={`absolute inset-0 w-20 h-20 rounded-full border-4 border-neutral-700 object-cover transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}
              
              {/* Fallback to generated avatar if no photoURL or image failed */}
              {(!user?.photoURL || imageError) && (
                <img 
                  src={getFallbackAvatar()} 
                  alt={displayName || user?.displayName || user?.email || 'User'} 
                  className="absolute inset-0 w-20 h-20 rounded-full border-4 border-neutral-700 object-cover"
                />
              )}
            </div>
            <div className="flex flex-col items-start">
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-2">
                Welcome back, {displayName?.split(' ')[0] || user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}!
                <img 
                  src="/waving-hand.png" 
                  alt="Waving Hand" 
                  className="w-10 h-10 object-contain animate-wave-hand"
                  style={{ transformOrigin: '70% 70%' }}
                />
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes wave-hand {
                    0% { transform: rotate( 0.0deg) }
                    10% { transform: rotate(14.0deg) }
                    20% { transform: rotate(-8.0deg) }
                    30% { transform: rotate(14.0deg) }
                    40% { transform: rotate(-4.0deg) }
                    50% { transform: rotate(10.0deg) }
                    60% { transform: rotate( 0.0deg) }
                    100% { transform: rotate( 0.0deg) }
                  }
                  .animate-wave-hand {
                    animation: wave-hand 2.5s infinite;
                  }
                `}} />
              </h1>
              <p className="text-neutral-200 text-lg">
                Ready to explore the future of AI-powered learning?
              </p>
            </div>
          </div>
        </div>        {/* Floating Dock positioned like macOS taskbar */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <FloatingDock
            mobileClassName="translate-y-20"
            items={dockLinks}
            activeItem="/dashboard"
          />
        </div>
    </div>
  );
}
