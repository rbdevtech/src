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
    { name: 'Dashboard', path: '/dashboard', icon: 'fas fa-home' },
    { name: 'Active Accounts', path: '/dashboard/accounts', icon: 'fas fa-user-check' },
    { name: 'Suspended Accounts', path: '/dashboard/accountsuspended', icon: 'fas fa-user-slash' },
    { name: 'Email Domain', path: '/dashboard/emaildomain', icon: 'fas fa-at' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-800 bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white transition-all duration-300 z-30 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header with close button for mobile */}
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-gray-400 mt-1">Welcome, {username}</p>
            </div>
            {/* Close sidebar button - visible only on mobile */}
            <button 
              className="text-gray-400 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-grow p-4 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    href={item.path} 
                    className={`flex items-center p-2 rounded-md hover:bg-gray-700 transition-colors ${
                      pathname === item.path || pathname.startsWith(`${item.path}/`) 
                        ? 'bg-gray-700 text-white' 
                        : 'text-gray-300'
                    }`}
                  >
                    <i className={`${item.icon} w-5 h-5 mr-3`}></i>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-700">
            <Link 
              href="/api/auth" 
              className="flex items-center p-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
              onClick={async (e) => {
                e.preventDefault();
                await fetch('/api/auth', { method: 'DELETE' });
                window.location.href = '/login';
              }}
            >
              <i className="fas fa-sign-out-alt w-5 h-5 mr-3"></i>
              <span>Logout</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className={`transition-all duration-300 lg:ml-64`}>
        {/* Topbar */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center">
              {/* Mobile menu toggle button */}
              <button
                type="button"
                className="lg:hidden bg-gray-800 text-white hover:bg-gray-700 focus:outline-none p-2 rounded-md"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar menu"
              >
                <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'} w-6 h-6`}></i>
              </button>
              <h2 className="text-xl font-semibold text-gray-800 ml-2 lg:ml-0">
                {navItems.find(item => pathname === item.path || pathname.startsWith(`${item.path}/`))?.name || 'Dashboard'}
              </h2>
            </div>
            
            {/* Mobile user info */}
            <div className="lg:hidden">
              <span className="text-sm text-gray-600">{username}</span>
            </div>
          </div>
        </header>
        
        {/* Floating sidebar toggle for easy access on mobile */}
        <div className="fixed bottom-4 left-4 lg:hidden z-20">
          <button
            className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <i className="fas fa-bars text-white"></i>
          </button>
        </div>
        
        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="bg-white p-4 border-t border-gray-200 text-center text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} Admin Dashboard
        </footer>
      </div>
    </div>
  );
}