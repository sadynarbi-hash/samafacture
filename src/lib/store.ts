'use client';

import { createContext, useContext } from 'react';
import type { Business, Profile } from '@/types';

interface AppStore {
  user: Profile | null;
  currentBusiness: Business | null;
  setCurrentBusiness: (b: Business | null) => void;
}

export const AppContext = createContext<AppStore>({
  user: null,
  currentBusiness: null,
  setCurrentBusiness: () => {},
});

export const useApp = () => useContext(AppContext);
