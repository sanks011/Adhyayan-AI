"use client";

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  googleSignIn?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, googleSignIn = false, children, ...props }, ref) => {
    const { user, loading, isAuthenticated, login, setIsAuthenticating } = useAuth();
    const router = useRouter();
    const [showOptions, setShowOptions] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    const [testEmail, setTestEmail] = React.useState('');
    const [testPassword, setTestPassword] = React.useState('');
    const [signingIn, setSigningIn] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    const handleGoogleSignIn = async () => {
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

    const Comp = asChild ? Slot : "button"
    
    if (googleSignIn) {
      const isLoading = loading || signingIn;

      if (isLoading) {
        return (
          <Comp
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            disabled
            {...props}
          >
            Loading...
          </Comp>
        )
      }
      
      if (isAuthenticated) {
        return (
          <Comp
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            onClick={handleGetStarted}
            {...props}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 7L11 7L11 11L7 11L7 13L11 13L11 17L13 17L13 13L17 13L17 11L13 11L13 7Z" fill="currentColor"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M12 1C5.925 1 1 5.925 1 12C1 18.075 5.925 23 12 23C18.075 23 23 18.075 23 12C23 5.925 18.075 1 12 1ZM3 12C3 7.029 7.029 3 12 3C16.971 3 21 7.029 21 12C21 16.971 16.971 21 12 21C7.029 21 3 16.971 3 12Z" fill="currentColor"/>
            </svg>
            Get Started
          </Comp>
        )
      }

      if (showOptions) {
        return (
          <>
            <div className="flex flex-col sm:flex-row items-center gap-3 p-1">
              {/* Google Sign In option */}
              <button
                type="button"
                className={cn(
                  buttonVariants({ variant, size, className }),
                  "flex items-center gap-2 bg-black text-white hover:bg-gray-800 border border-neutral-800"
                )}
                onClick={handleGoogleSignIn}
              >
                <svg className="w-4 h-4 mr-1" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" fill="#000000">
                  <path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4" />
                  <path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853" />
                  <path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05" />
                  <path d="M130.55 50.479c24.514 0 41.50 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335" />
                </svg>
                Google
              </button>

              {/* Test Account Option */}
              <button
                type="button"
                className={cn(
                  buttonVariants({ variant, size, className }),
                  "flex items-center gap-2 bg-black text-white hover:bg-gray-800 border border-neutral-800"
                )}
                onClick={() => setShowModal(true)}
              >
                <svg className="w-4 h-4 mr-1 text-neutral-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="currentColor"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM4 12C4 7.582 7.582 4 12 4C16.418 4 20 7.582 20 12C20 16.418 16.418 20 12 20C7.582 20 4 16.418 4 12Z" fill="currentColor"/>
                </svg>
                Test Account
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => setShowOptions(false)}
                className="text-xs text-neutral-400 hover:text-white underline px-2 cursor-pointer font-medium"
              >
                Cancel
              </button>
            </div>

            {/* Modal Overlay */}
            {mounted && typeof window !== 'undefined' && showModal ? createPortal(
              <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
                <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl p-8 w-full max-w-sm flex flex-col items-center gap-6 shadow-2xl">
                  {/* Close Button */}
                  <button 
                    type="button"
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
                      placeholder="Email (e.g. admin@adhyayan.ai)"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-500 transition-colors"
                    />
                    <input 
                      type="password"
                      placeholder="Password (e.g. admin)"
                      value={testPassword}
                      onChange={(e) => setTestPassword(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-500 transition-colors"
                    />
                    <button 
                      type="button"
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
          </>
        )
      }
      
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          onClick={() => setShowOptions(true)}
          {...props}
        >
          Sign In
        </Comp>
      )
    }
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
