'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default function DashboardLayout({ children }) {
  const [username, setUsername] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Get user info from the token
    const user = getCurrentUser();
    
    if (user && user.username) {
      setUsername(user.username);
    } else {
      setUsername('Admin');
    }
  }, []);

  // Close sidebar when changing routes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Navigation items
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Active Accounts', path: '/dashboard/accounts', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { name: 'Suspended Accounts', path: '/dashboard/accountsuspended', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
    { name: 'Email Domain', path: '/dashboard/emaildomain', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar for mobile */}
      <div 
        className={`fixed inset-y-0 left-0 flex flex-col z-50 lg:hidden transition-all transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex-1 flex flex-col min-h-0 bg-slate-900 w-72">
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-xl font-bold text-white">Admin Panel</span>
              </div>
            </div>
            <button 
              type="button" 
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              onClick={() => setSidebarOpen(false)}
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User section */}
          <div className="pt-5 pb-4 border-b border-slate-800">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <span className="inline-flex h-10 w-10 rounded-full bg-slate-700 text-white text-xl items-center justify-center">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-base font-medium text-white">{username}</p>
                <p className="text-sm font-medium text-slate-400">Administrator</p>
              </div>
            </div>
          </div>

          {/* Mobile navigation */}
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`group flex items-center px-3 py-3 text-base font-medium rounded-md transition-colors ${
                    pathname === item.path || pathname.startsWith(`${item.path}/`)
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <svg 
                    className={`mr-3 h-5 w-5 transition-colors ${
                      pathname === item.path || pathname.startsWith(`${item.path}/`)
                        ? 'text-slate-300'
                        : 'text-slate-400 group-hover:text-slate-300'
                    }`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile sidebar footer */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={async (e) => {
                e.preventDefault();
                await fetch('/api/auth', { method: 'DELETE' });
                window.location.href = '/login';
              }}
              className="flex items-center px-3 py-2 w-full text-base font-medium text-slate-300 rounded-md hover:bg-slate-800 hover:text-white transition-colors"
            >
              <svg 
                className="mr-3 h-5 w-5 text-slate-400" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-slate-900">
            {/* Desktop sidebar header */}
            <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-slate-800">
              <div className="text-xl font-bold text-white">Admin Panel</div>
            </div>

            {/* User section */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="pt-5 pb-4 border-b border-slate-800">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <span className="inline-flex h-10 w-10 rounded-full bg-slate-700 text-white text-xl items-center justify-center">
                      {username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-white">{username}</p>
                    <p className="text-sm font-medium text-slate-400">Administrator</p>
                  </div>
                </div>
              </div>

              {/* Desktop navigation */}
              <nav className="mt-6 px-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                      pathname === item.path || pathname.startsWith(`${item.path}/`)
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <svg 
                      className={`mr-3 h-5 w-5 transition-colors ${
                        pathname === item.path || pathname.startsWith(`${item.path}/`)
                          ? 'text-slate-300'
                          : 'text-slate-400 group-hover:text-slate-300'
                      }`} 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Desktop sidebar footer */}
            <div className="flex-shrink-0 p-4 border-t border-slate-800">
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  await fetch('/api/auth', { method: 'DELETE' });
                  window.location.href = '/login';
                }}
                className="flex items-center px-3 py-2 w-full text-sm font-medium text-slate-300 rounded-md hover:bg-slate-800 hover:text-white transition-colors"
              >
                <svg 
                  className="mr-3 h-5 w-5 text-slate-400" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="lg:hidden px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex-1 px-4 flex items-center justify-between">
            <div className="flex-1 flex">
              <h1 className="text-xl font-semibold text-gray-800">
                {navItems.find(item => pathname === item.path || pathname.startsWith(`${item.path}/`))?.name || 'Dashboard'}
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Mobile profile - shown here but hidden with CSS in desktop view */}
              <div className="lg:hidden flex items-center">
                <span className="text-sm text-gray-700 mr-2">{username}</span>
                <span className="inline-flex h-8 w-8 rounded-full bg-slate-200 text-slate-600 text-sm items-center justify-center">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white p-4 border-t border-gray-200 text-center text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} Admin Dashboard
        </footer>
      </div>
    </div>
  );
}