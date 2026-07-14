"use client";
import React, { useState } from 'react';
import styled from 'styled-components';
import { signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

const GoogleSignInButton = () => {
  const { user, loading, login, setIsAuthenticating } = useAuth();
  const router = useRouter();
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignIn = async () => {
    try {
      const isMobile = typeof window !== 'undefined' && 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        
        if (result?.user) {
          setIsAuthenticating(true);
          const idToken = await result.user.getIdToken(true);
          const userData = {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
          };
          await login(idToken, userData);
          return;
        }
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError) {
          console.error('Error signing in with redirect:', redirectError);
        }
      }
    }
  };

  const handleTestSignIn = async () => {
    if (signingIn) return;
    if (!testEmail || !testPassword) return;
    setSigningIn(true);
    try {
      setIsAuthenticating(true);
      const idToken = 'test-admin-token';
      const userData = {
        uid: 'test-admin-uid-12345',
        email: testEmail,
        password: testPassword,
        displayName: 'Admin',
        photoURL: '/admin-panda.png',
      };
      await login(idToken, userData);
    } catch (error: any) {
      console.error('Error signing in with test credentials:', error);
      setIsAuthenticating(false);
      setSigningIn(false);
    }
  };

  const handleGetStarted = () => {
    router.push('/dashboard');
  };

  const isLoading = loading || signingIn;

  if (loading) {
    return (
      <StyledWrapper>
        <div className="button-container">
          <button className="google-sign-in-btn">
            <span className="text">Loading...</span>
          </button>
        </div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      <div className="flex flex-col items-center">
        {!isLoading && !user && showOptions ? (
          <div className="flex flex-col items-center gap-4">
            {/* Google Sign In option */}
            <div className="button-container">
              <button className="google-sign-in-btn" onClick={handleSignIn}>
                <svg className="icon" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" fill="#000000">
                  <path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4" />
                  <path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853" />
                  <path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05" />
                  <path d="M130.55 50.479c24.514 0 41.50 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335" />
                </svg>
                <span className="text">Sign in with Google</span>
              </button>
            </div>

            {/* Test Credentials Option */}
            <div className="button-container">
              <button className="google-sign-in-btn" onClick={() => setShowModal(true)}>
                <svg className="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="currentColor"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM4 12C4 7.582 7.582 4 12 4C16.418 4 20 7.582 20 12C20 16.418 16.418 20 12 20C7.582 20 4 16.418 4 12Z" fill="currentColor"/>
                </svg>
                <span className="text">Test Account</span>
              </button>
            </div>
            
            {/* Cancel Button */}
            <button 
              onClick={() => setShowOptions(false)}
              className="text-xs text-neutral-400 hover:text-white underline text-center mt-1 pointer-events-auto"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="button-container">
            {isLoading ? (
              <button className="google-sign-in-btn" disabled>
                <span className="text">{signingIn ? 'Signing in…' : 'Loading…'}</span>
              </button>
            ) : user ? (
              <button className="google-sign-in-btn" onClick={handleGetStarted}>
                <svg className="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 7L11 7L11 11L7 11L7 13L11 13L11 17L13 17L13 13L17 13L17 11L13 11L13 7Z" fill="currentColor" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 1C5.925 1 1 5.925 1 12C1 18.075 5.925 23 12 23C18.075 23 23 18.075 23 12C23 5.925 18.075 1 12 1ZM3 12C3 7.029 7.029 3 12 3C16.971 3 21 7.029 21 12C21 16.971 16.971 21 12 21C7.029 21 3 16.971 3 12Z" fill="currentColor" />
                </svg>
                <span className="text">Get Started</span>
              </button>
            ) : (
              <button className="google-sign-in-btn" onClick={() => setShowOptions(true)}>
                <span className="text">Sign In</span>
              </button>
            )}
          </div>
        )}
      </div>

      {mounted && typeof window !== 'undefined' && showModal ? createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl p-8 w-full max-w-sm flex flex-col items-center gap-6 shadow-2xl">
            {/* Close Button */}
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-white text-center">Test Sign In</h3>
            <p className="text-xs text-neutral-400 text-center -mt-4">Enter credentials to authenticate</p>

            {/* Test Credentials Input Form */}
            <div className="w-full flex flex-col gap-3 mt-2">
              <input 
                type="email"
                placeholder="Email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-500 transition-colors"
              />
              <input 
                type="password"
                placeholder="Password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-500 transition-colors"
              />
              <button 
                onClick={() => {
                  setShowModal(false);
                  handleTestSignIn();
                }}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 text-sm border border-neutral-700 hover:border-neutral-600 shadow-md"
              >
                Sign In (Test Mode)
              </button>
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  position: relative;
  pointer-events: auto;

  .button-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    background: #272727;
    border-radius: 24px;
    width: calc(200px + 1px);
    height: calc(48px + 1px);
    box-shadow:
      0 4px 8px rgba(0, 0, 0, 0.2),
      0 8px 16px rgba(0, 0, 0, 0.2),
      0 0 8px rgba(255, 255, 255, 0.1),
      0 0 16px rgba(255, 255, 255, 0.08);
  }

  .button-container::before {
    content: "";
    position: absolute;
    inset: -50px;
    z-index: -2;
    background: conic-gradient(
      from 45deg,
      transparent 70%,
      rgba(255, 255, 255, 0.8) 85%,
      rgba(255, 255, 255, 0.3) 90%,
      transparent 100%
    );
    animation: spin 4s ease-in-out infinite;
  }

  .button-container::after {
    content: "";
    position: absolute;
    inset: -30px;
    z-index: -1;
    background: conic-gradient(
      from 225deg,
      transparent 60%,
      rgba(255, 255, 255, 0.4) 75%,
      rgba(255, 255, 255, 0.1) 85%,
      transparent 100%
    );
    animation: spin 6s ease-in-out infinite reverse;
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }
  .google-sign-in-btn {
    --button-color: #373737;
    position: absolute;
    z-index: 10;
    width: 200px;
    height: 48px;
    border: none;
    border-radius: 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    background: var(--button-color);
    color: white;
    transition: all 0.3s ease;
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    pointer-events: auto;
    box-shadow:
      inset 0 40px 60px -8px rgba(255, 255, 255, 0.12),
      inset 4px 0 12px -6px rgba(255, 255, 255, 0.12),
      inset 0 0 12px -4px rgba(255, 255, 255, 0.12);
  }

  .google-sign-in-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    box-shadow:
      inset 0px 3px 6px rgba(255, 255, 255, 0.6),
      inset 0px -3px 6px rgba(0, 0, 0, 0.8),
      0px 0px 8px rgba(255, 255, 255, 0.05);
    transform: translateY(-1px);
  }

  .google-sign-in-btn:hover + .button-container::before {
    animation-duration: 2s;
  }

  .google-sign-in-btn:hover + .button-container::after {
    animation-duration: 3s;
  }

  .icon {
    height: 18px;
    width: 18px;
  }

  .text {
    font-size: 14px;
    font-weight: 600;
  }

  .test-credentials-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 200px;
    margin-top: 16px;
    pointer-events: auto;
    z-index: 20;
  }

  .form-title {
    font-size: 9px;
    color: #a3a3a3;
    text-align: center;
    margin-bottom: 4px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .test-input {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    padding: 6px 10px;
    font-size: 11px;
    outline: none;
    transition: all 0.2s ease;
  }

  .test-input:focus {
    border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.08);
  }

  .test-submit-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 4px;
  }

  .test-submit-btn:hover {
    background: white;
    color: black;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .button-container {
      background: #272727;
    }
    
    .google-sign-in-btn {
      background: #373737;
      color: white;
    }
  }
`;

export default GoogleSignInButton;
