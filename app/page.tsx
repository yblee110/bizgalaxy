"use client";

import React, { useEffect, useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import LoginPage from '@/components/auth/LoginPage';
import MainView from '@/components/MainView';

export default function HomePage() {
  const { isLoggedIn } = useProjectStore();
  const [isMounted, setIsMounted] = useState(false);

  // Ensure client-side only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render until mounted on client to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return <MainView />;
}
