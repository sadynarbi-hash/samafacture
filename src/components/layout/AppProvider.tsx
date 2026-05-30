'use client';

import { useState } from 'react';
import { AppContext } from '@/lib/store';
import type { Business, Profile } from '@/types';

interface AppProviderProps {
  children: React.ReactNode;
  user: Profile | null;
  initialBusiness: Business | null;
}

export default function AppProvider({ children, user, initialBusiness }: AppProviderProps) {
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(initialBusiness);

  return (
    <AppContext.Provider value={{ user, currentBusiness, setCurrentBusiness }}>
      {children}
    </AppContext.Provider>
  );
}
