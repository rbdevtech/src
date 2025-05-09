'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CopyInput from '@/components/CopyInput';
import CopyButton from '@/components/CopyButton';
import { formatDate, formatDateOnly } from '@/lib/dateUtils';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [formData, setFormData] = useState({
    OrderIdAccount: '',
    FirstName: '',
    LastName: '',
    Email: '',
    Password: '',
    Country: '',
    UserID: '',
    Suspended: false
  });
  const [countries, setCountries] = useState([]);
  const router = useRouter();

  // Fetch countries list
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/countries');
        if (response.ok) {
          const data = await response.json();
          setCountries(data.countries);
        }
      } catch (err) {
        console.error('Error fetching countries:', err);
      }
    };
    
    fetchCountries();
  }, []);

  // Fetch accounts with pagination and search
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(
        `/api/accounts?limit=${limit}&offset=${offset}${search ? `&search=${search}` : ''}&suspended=false`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }
      
      const data = await response.json();
      setAccounts(data.accounts);
      setTotal(data.total);
    } catch (err) {
      setError('Error fetching accounts: ' + err.message);
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

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Create account
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }
      
      // Reset form
      setFormData({
        OrderIdAccount: '',
        FirstName: '',
        LastName: '',
        Email: '',
        Password: '',
        Country: '',
        UserID: '',
        Suspended: false
      });
      
      // Close modal
      setShowCreateModal(false);
      
      // Redirect to the account detail page
      router.push(`/dashboard/account/${data.account.OrderIdAccount}`);
      
    } catch (err) {
      setError('Error creating account: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate random account data (without saving)
  const handleGenerateRandom = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch a random account without saving it
      const response = await fetch('/api/accounts/generate-random');
      
      if (!response.ok) {
        throw new Error('Failed to generate random account');
      }
      
      const data = await response.json();
      
      // Fill the form with the generated data
      setFormData({
        OrderIdAccount: data.account.OrderIdAccount,
        FirstName: data.account.FirstName,
        LastName: data.account.LastName,
        Email: data.account.Email,
        Password: data.account.Password,
        Country: data.account.Country,
        UserID: formData.UserID || '', // Keep existing UserID if provided
        Suspended: false
      });
      
    } catch (err) {
      setError('Error generating random account data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for generating random account
  const handleGenerateRandomSubmit = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generateRandom: true,
          UserID: formData.UserID || '' // Use UserID from form if provided
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate random account');
      }
      
      // Reset form
      setFormData({
        OrderIdAccount: '',
        FirstName: '',
        LastName: '',
        Email: '',
        Password: '',
        Country: '',
        UserID: '',
        Suspended: false
      });
      
      // Close modal
      setShowCreateModal(false);
      
      // Redirect to the account detail page
      router.push(`/dashboard/account/${data.account.OrderIdAccount}`);
      
    } catch (err) {
      setError('Error generating random account: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  // Open PicClick seller page in new tab
  const openPicClickSeller = (userId) => {
    if (userId) {
      window.open(`https://picclick.es/seller/${userId}`, '_blank');
    }
  };

  // Mark account as suspended
  const suspendAccount = async (accountId) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Suspended: true }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to suspend account');
      }
      
      setSuccess(`Account ${accountId} suspended successfully`);
      
      // Refresh the accounts list
      fetchAccounts();
      
    } catch (err) {
      setError('Error suspending account: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show delete confirmation modal
  const confirmDelete = (account) => {
    setAccountToDelete(account);
    setShowDeleteModal(true);
  };

  // Delete account
  const deleteAccount = async () => {
    if (!accountToDelete) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/accounts/${accountToDelete.OrderIdAccount}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }
      
      setSuccess(`Account ${accountToDelete.OrderIdAccount} deleted successfully`);
      setShowDeleteModal(false);
      setAccountToDelete(null);
      
      // Refresh the accounts list
      fetchAccounts();
      
    } catch (err) {
      setError('Error deleting account: ' + err.message);
      setShowDeleteModal(false);
    } finally {
      setLoading(false);
    }
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Active Accounts</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage active accounts - <Link href="/dashboard/accountsuspended" className="text-blue-500 hover:underline">View suspended accounts</Link>
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full sm:w-auto"
          >
            Create Account
          </button>
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
            placeholder="Search accounts..."
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
                  Email
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Password
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && !accounts.length ? (
                <tr>
                  <td colSpan="6" className="px-3 sm:px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-3 sm:px-6 py-4 text-center text-gray-500">
                    No accounts found
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
                          {account.OrderIdAccount}
                        </Link>
                        <CopyButton text={account.OrderIdAccount} />
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="mr-2 text-xs sm:text-sm truncate max-w-[150px] lg:max-w-none">
                          {account.Email}
                        </span>
                        <CopyButton text={account.Email} />
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="mr-2 text-xs sm:text-sm font-mono">
                          {account.Password}
                        </span>
                        <CopyButton text={account.Password} />
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {account.UserID ? (
                          <>
                            <a
                              href={`https://picclick.es/seller/${account.UserID}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mr-2 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-xs sm:text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              {account.UserID}
                            </a>
                            <CopyButton text={account.UserID} />
                          </>
                        ) : (
                          <span className="mr-2 text-gray-400">-</span>
                        )}
                      </div>
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
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Link
                          href={`/dashboard/account/${account.OrderIdAccount}`}
                          className="bg-blue-100 text-blue-700 hover:bg-blue-200 p-2 rounded"
                          title="Edit Account"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => suspendAccount(account.OrderIdAccount)}
                          className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 p-2 rounded"
                          title="Mark as Suspended"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => confirmDelete(account)}
                          className="bg-red-100 text-red-700 hover:bg-red-200 p-2 rounded"
                          title="Delete Account"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
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
              Showing <span className="font-medium">{offset + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(offset + limit, total)}
              </span>{' '}
              of <span className="font-medium">{total}</span> results
            </p>
          </div>
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
        </div>
      </div>
      
      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Account</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500 text-xl"
              >
                &times;
              </button>
            </div>
            
            <div className="mb-4 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleGenerateRandom}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex-1"
              >
                Generate Form Data
              </button>
              <button
                type="button"
                onClick={handleGenerateRandomSubmit}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex-1"
              >
                Create Random Account
              </button>
            </div>
            
            <div className="mb-2 text-center">
              <span className="text-gray-500">- OR FILL FORM MANUALLY -</span>
            </div>
            
            <form onSubmit={handleCreateAccount}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CopyInput
                  label="Order ID"
                  name="OrderIdAccount"
                  value={formData.OrderIdAccount}
                  onChange={handleInputChange}
                  required
                />
                
                <CopyInput
                  label="Email"
                  name="Email"
                  type="email"
                  value={formData.Email}
                  onChange={handleInputChange}
                  required
                />
                
                <CopyInput
                  label="First Name"
                  name="FirstName"
                  value={formData.FirstName}
                  onChange={handleInputChange}
                />
                
                <CopyInput
                  label="Last Name"
                  name="LastName"
                  value={formData.LastName}
                  onChange={handleInputChange}
                />
                
                <CopyInput
                  label="Password"
                  name="Password"
                  value={formData.Password}
                  onChange={handleInputChange}
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <div className="relative">
                    <select
                      name="Country"
                      value={formData.Country}
                      onChange={handleInputChange}
                      className="border rounded-md px-3 py-2 w-full appearance-none pr-10"
                    >
                      <option value="">-- Select Country --</option>
                      {countries.map((country, index) => (
                        <option key={index} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    {formData.Country && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <CopyButton text={formData.Country} />
                      </div>
                    )}
                  </div>
                </div>
                
                <CopyInput
                  label="User ID"
                  name="UserID"
                  value={formData.UserID}
                  onChange={handleInputChange}
                />
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="Suspended"
                      checked={formData.Suspended}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm text-gray-700">Suspended</span>
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full sm:w-auto"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && accountToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete account <strong>{accountToDelete.OrderIdAccount}</strong>? This action cannot be undone.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setAccountToDelete(null);
                }}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md w-full sm:w-auto"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}