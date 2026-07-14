'use client';

import React, { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'react-hot-toast';

// Only Firebase auth globally - Civic is only used locally in confirm page for wallet connection
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#171717',
            color: '#fff',
            border: '1px solid #262626',
          },
        }}
      />
    </AuthProvider>
  );
}
