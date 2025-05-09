'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate, formatDateOnly } from '@/lib/dateUtils';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalAccounts: 0,
    activeAccounts: 0,
    suspendedAccounts: 0,
    emailDomain: 'domain.com',
  });
  const [recentAccounts, setRecentAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch active accounts
        const activeAccountsResponse = await fetch('/api/accounts?limit=5&suspended=false');
        if (!activeAccountsResponse.ok) {
          throw new Error('Failed to fetch active accounts');
        }
        const activeAccountsData = await activeAccountsResponse.json();
        
        // Fetch suspended accounts
        const suspendedAccountsResponse = await fetch('/api/accounts?limit=0&suspended=true');
        if (!suspendedAccountsResponse.ok) {
          throw new Error('Failed to fetch suspended accounts');
        }
        const suspendedAccountsData = await suspendedAccountsResponse.json();
        
        // Fetch email domain
        const domainResponse = await fetch('/api/email-domain');
        if (!domainResponse.ok) {
          throw new Error('Failed to fetch email domain');
        }
        const domainData = await domainResponse.json();
        
        // Set stats
        setStats({
          totalAccounts: activeAccountsData.total + suspendedAccountsData.total,
          activeAccounts: activeAccountsData.total,
          suspendedAccounts: suspendedAccountsData.total,
          emailDomain: domainData.domain,
        });
        
        setRecentAccounts(activeAccountsData.accounts);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-4 md:space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-xs sm:text-sm">Total Accounts</p>
              <h2 className="text-xl md:text-2xl font-semibold">
                {loading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  stats.totalAccounts
                )}
              </h2>
            </div>
          </div>
        </div>
        
        <Link href="/dashboard/accounts" className="block">
          <div className="bg-white rounded-lg shadow p-4 md:p-6 hover:bg-blue-50 transition-colors">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-xs sm:text-sm">Active Accounts</p>
                <h2 className="text-xl md:text-2xl font-semibold">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    stats.activeAccounts
                  )}
                </h2>
              </div>
            </div>
          </div>
        </Link>
        
        <Link href="/dashboard/accountsuspended" className="block">
          <div className="bg-white rounded-lg shadow p-4 md:p-6 hover:bg-red-50 transition-colors">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-xs sm:text-sm">Suspended Accounts</p>
                <h2 className="text-xl md:text-2xl font-semibold">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    stats.suspendedAccounts
                  )}
                </h2>
              </div>
            </div>
          </div>
        </Link>
        
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-xs sm:text-sm">Email Domain</p>
              <h2 className="text-sm font-semibold break-all">
                {loading ? (
                  <div className="h-6 w-28 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  `@${stats.emailDomain}`
                )}
              </h2>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/accounts"
            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 transition-colors"
          >
            <h3 className="font-medium text-blue-800 mb-1">Manage Accounts</h3>
            <p className="text-blue-600 text-sm">
              View, create, edit, and delete accounts
            </p>
          </Link>
          
          <Link
            href="/dashboard/emaildomain"
            className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 transition-colors"
          >
            <h3 className="font-medium text-purple-800 mb-1">Email Domain</h3>
            <p className="text-purple-600 text-sm">
              Update the email domain for account generation
            </p>
          </Link>
          
          <button
            onClick={async () => {
              try {
                setLoading(true);
                
                const response = await fetch('/api/accounts', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ generateRandom: true }),
                });
                
                if (!response.ok) {
                  throw new Error('Failed to generate account');
                }
                
                const data = await response.json();
                
                // Redirect to the account detail page
                router.push(`/dashboard/account/${data.account.OrderIdAccount}`);
                
              } catch (err) {
                setError(err.message);
              } finally {
                setLoading(false);
              }
            }}
            className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 transition-colors"
          >
            <h3 className="font-medium text-green-800 mb-1">Generate Account</h3>
            <p className="text-green-600 text-sm">
              Quickly create a random account
            </p>
          </button>
        </div>
      </div>
      
      {/* Recent Accounts */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
          <h2 className="text-lg font-medium">Recent Active Accounts</h2>
          <div className="flex space-x-4">
            <Link
              href="/dashboard/accounts"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All Active
            </Link>
            <Link
              href="/dashboard/accountsuspended"
              className="text-red-600 hover:text-red-800 text-sm"
            >
              View Suspended
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Email
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && !recentAccounts.length ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan="5" className="px-3 sm:px-6 py-4">
                        <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : recentAccounts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-3 sm:px-6 py-4 text-center text-gray-500">
                      No accounts found
                    </td>
                  </tr>
                ) : (
                  recentAccounts.map((account) => (
                    <tr key={account.OrderIdAccount}>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/dashboard/account/${account.OrderIdAccount}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-xs sm:text-sm"
                        >
                          {account.OrderIdAccount.substring(0, 8)}...
                        </Link>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm">
                        {account.FirstName} {account.LastName}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell text-xs sm:text-sm">
                        {account.Email}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            account.Suspended
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {account.Suspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs text-gray-500 hidden sm:table-cell">
                        {formatDateOnly(account.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}