'use client';

import { useState, useEffect } from 'react';

export default function EmailDomainPage() {
  const [domain, setDomain] = useState('domain.com');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  // Fetch current email domain
  useEffect(() => {
    const fetchDomain = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch('/api/email-domain');
        
        if (!response.ok) {
          throw new Error('Failed to fetch email domain');
        }
        
        const data = await response.json();
        setDomain(data.domain);
        setEditValue(data.domain);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDomain();
  }, []);

  // Handle domain update
  const handleUpdateDomain = async (e) => {
    e.preventDefault();
    
    if (!editValue.trim()) {
      setError('Domain cannot be empty');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await fetch('/api/email-domain', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: editValue.trim() }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update email domain');
      }
      
      setDomain(editValue.trim());
      setSuccess('Email domain updated successfully');
      setIsEditing(false);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <h1 className="text-xl md:text-2xl font-semibold">Email Domain Settings</h1>
        
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full sm:w-auto"
          >
            Edit Domain
          </button>
        )}
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
      
      <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Current Email Domain</h2>
        
        {loading && !domain ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : isEditing ? (
          <form onSubmit={handleUpdateDomain} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Domain
              </label>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="border rounded-md px-3 py-2 w-full"
              />
              <p className="mt-1 text-sm text-gray-500">
                This domain will be used for all randomly generated email addresses.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditValue(domain);
                }}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full sm:w-auto"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Domain'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="bg-white border rounded-md px-3 py-2 overflow-x-auto break-all">
              @{domain}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              This domain is used for all randomly generated email addresses.
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-6 md:mt-8">
        <h2 className="text-lg font-medium mb-4">Email Domain Information</h2>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">How Email Domains Work</h3>
          <p className="text-blue-700 mb-2 text-sm md:text-base">
            When accounts are randomly generated, their email addresses will use the domain specified above.
          </p>
          <p className="text-blue-700 text-sm md:text-base">
            For example, if the domain is set to <span className="font-mono">domain.com</span>, 
            generated emails will look like <span className="font-mono break-all">username123@domain.com</span>.
          </p>
        </div>
      </div>
    </div>
  );
}