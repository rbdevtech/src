'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CopyInput from '@/components/CopyInput';
import CopyButton from '@/components/CopyButton';
import ProgressSignup from '@/components/ProgressSignup';
import { formatDate } from '@/lib/dateUtils';

export default function AccountDetailPage() {
  const { orderId } = useParams();
  const router = useRouter();
  
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [countries, setCountries] = useState([]);
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    Email: '',
    Password: '',
    Country: '',
    UserID: '',
    Suspended: false
  });

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

  // Fetch account details
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch(`/api/accounts/${orderId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Account not found');
          }
          throw new Error('Failed to fetch account details');
        }
        
        const data = await response.json();
        setAccount(data);
        
        // Initialize form data
        setFormData({
          FirstName: data.FirstName || '',
          LastName: data.LastName || '',
          Email: data.Email || '',
          Password: data.Password || '',
          Country: data.Country || '',
          UserID: data.UserID || '',
          Suspended: data.Suspended || false
        });
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) {
      fetchAccount();
    }
  }, [orderId]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Save account changes
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await fetch(`/api/accounts/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update account');
      }
      
      setAccount(data.account);
      setSuccess('Account updated successfully');
      setIsEditing(false);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/accounts/${orderId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }
      
      // Redirect to accounts list
      router.push('/dashboard/accounts');
      
    } catch (err) {
      setError(err.message);
      setShowDeleteModal(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !account) {
    return (
      <div className="bg-white rounded-lg shadow p-6 flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !account) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link
          href="/dashboard/accounts"
          className="text-blue-500 hover:text-blue-700"
        >
          &larr; Back to Accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            href="/dashboard/accounts"
            className="text-blue-500 hover:text-blue-700 inline-flex items-center"
          >
            &larr; Back to Accounts
          </Link>
          <h1 className="text-2xl font-semibold mt-2">
            Account: {account?.OrderIdAccount}
          </h1>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Edit Account
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
              >
                Delete
              </button>
            </>
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
      
      {/* Account Information Section */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-medium mb-4">Account Information</h2>
        
        {isEditing ? (
          <form onSubmit={handleSaveChanges}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={account.OrderIdAccount}
                    disabled
                    className="border rounded-md px-3 py-2 w-full bg-gray-100 pr-10"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <CopyButton text={account.OrderIdAccount} />
                  </div>
                </div>
              </div>
              
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
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Order ID</h3>
              <div className="mt-1 flex items-center">
                <p className="mr-2">{account.OrderIdAccount}</p>
                <CopyButton text={account.OrderIdAccount} />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <div className="mt-1 flex items-center">
                <p className="mr-2">{account.Email}</p>
                <CopyButton text={account.Email} />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <div className="mt-1 flex items-center">
                <p className="mr-2">
                  {account.FirstName} {account.LastName}
                </p>
                <CopyButton text={`${account.FirstName} ${account.LastName}`} />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Password</h3>
              <div className="mt-1 flex items-center">
                <p className="mr-2">{account.Password}</p>
                <CopyButton text={account.Password} />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Country</h3>
              <div className="mt-1 flex items-center">
                <p className="mr-2">{account.Country || '-'}</p>
                {account.Country && <CopyButton text={account.Country} />}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">User ID</h3>
              <div className="mt-1 flex items-center">
                <p className="mr-2">{account.UserID || '-'}</p>
                {account.UserID && <CopyButton text={account.UserID} />}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className="mt-1">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    account.Suspended
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {account.Suspended ? 'Suspended' : 'Active'}
                </span>
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created At</h3>
              <p className="mt-1">
                {formatDate(account.created_at)}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Progress Signup Section */}
      <ProgressSignup accountId={account.OrderIdAccount} />
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete account <strong>{account.OrderIdAccount}</strong>? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
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