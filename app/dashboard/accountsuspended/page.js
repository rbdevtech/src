'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CopyButton from '@/components/CopyButton';
import { formatDate } from '@/lib/dateUtils';

export default function SuspendedAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const router = useRouter();

  // Fetch accounts with pagination and search
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(
        `/api/accounts?limit=${limit}&offset=${offset}${search ? `&search=${search}` : ''}&suspended=true`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch suspended accounts');
      }
      
      const data = await response.json();
      setAccounts(data.accounts);
      setTotal(data.total);
    } catch (err) {
      setError('Error fetching suspended accounts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load accounts on mount and when pagination/search changes
  useEffect(() => {
    fetchAccounts();
  }, [limit, offset, search]);

  // Handle input change for search
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setOffset(0); // Reset to first page on new search
  };

  // Delete all suspended accounts
  const handleDeleteAllSuspended = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await fetch('/api/accounts/delete-suspended', {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete suspended accounts');
      }
      
      setSuccess(`Successfully deleted ${data.count} suspended accounts`);
      setShowDeleteAllModal(false);
      
      // Refresh the list
      fetchAccounts();
      
    } catch (err) {
      setError('Error deleting suspended accounts: ' + err.message);
      setShowDeleteAllModal(false);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Suspended Accounts</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage suspended accounts - <Link href="/dashboard/accounts" className="text-blue-500 hover:underline">View active accounts</Link>
          </p>
        </div>
        <div className="w-full sm:w-auto">
          {total > 0 && (
            <button
              onClick={() => setShowDeleteAllModal(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md w-full sm:w-auto"
            >
              Delete All Suspended Accounts
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {/* Search and filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            placeholder="Search suspended accounts..."
            value={search}
            onChange={handleSearchChange}
            className="border rounded-md px-4 py-2 w-full"
          />
          <button
            onClick={fetchAccounts}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md w-full sm:w-auto"
          >
            Search
          </button>
        </div>
      </div>
      
      {/* Accounts table */}
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
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Country
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  User ID
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Created
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && !accounts.length ? (
                <tr>
                  <td colSpan="8" className="px-3 sm:px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-3 sm:px-6 py-4 text-center text-gray-500">
                    No suspended accounts found
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.OrderIdAccount}>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Link 
                          href={`/dashboard/account/${account.OrderIdAccount}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline mr-2 text-xs sm:text-sm"
                        >
                          {account.OrderIdAccount.substring(0, 8)}...
                        </Link>
                        <CopyButton text={account.OrderIdAccount} />
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm">
                      <div className="flex items-center">
                        <span className="mr-2 truncate max-w-[100px] sm:max-w-none">
                          {account.FirstName} {account.LastName}
                        </span>
                        <CopyButton text={`${account.FirstName} ${account.LastName}`} />
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center">
                        <span className="mr-2 text-xs sm:text-sm truncate max-w-[150px] lg:max-w-none">
                          {account.Email}
                        </span>
                        <CopyButton text={account.Email} />
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell text-xs sm:text-sm">
                      <div className="flex items-center">
                        <span className="mr-2">{account.Country || '-'}</span>
                        {account.Country && <CopyButton text={account.Country} />}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell text-xs sm:text-sm">
                      <div className="flex items-center">
                        <span className="mr-2">{account.UserID || '-'}</span>
                        {account.UserID && <CopyButton text={account.UserID} />}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Suspended
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs text-gray-500 hidden md:table-cell">
                      {formatDate(account.created_at)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                      <Link
                        href={`/dashboard/account/${account.OrderIdAccount}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      <div className="mt-4 border-t border-gray-200 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{total > 0 ? offset + 1 : 0}</span> to{' '}
              <span className="font-medium">
                {Math.min(offset + limit, total)}
              </span>{' '}
              of <span className="font-medium">{total}</span> results
            </p>
          </div>
          {totalPages > 0 && (
            <div className="flex justify-between sm:justify-end space-x-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                  offset === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <div className="hidden sm:flex space-x-1">
                {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => {
                  // Calculate which pages to show
                  let pageNum;
                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage <= 2) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 1) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setOffset((pageNum - 1) * limit)}
                      className={`relative inline-flex items-center px-3 py-2 border ${
                        currentPage === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      } text-sm font-medium rounded-md`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
                className={`relative inline-flex items-center px-2 py-2 rounded-md border ${
                  offset + limit >= total
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete All Confirmation Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete <strong>all {total} suspended accounts</strong>? This action cannot be undone.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllSuspended}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md w-full sm:w-auto"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete All Suspended Accounts'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}