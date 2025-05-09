'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication status and redirect accordingly
    const checkAuth = () => {
      if (isAuthenticated()) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    };
    
    // Small delay to ensure cookies are loaded
    const timer = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4">Redirecting...</p>
      </div>
    </div>
  );
}