import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';

export default function AdminDashboard({ onLogout }) {
  const [users, setUsers] = useState({});
  const [servicesUsage, setServicesUsage] = useState({});
  const { user } = useAuth();

  // Service names mapping
  const serviceNames = {
    '1': 'Music Streaming',
    '2': 'Video Streaming', 
    '3': 'Daily News'
  };

  // Function to calculate service usage from all users
  const calculateServiceUsage = useCallback((usersData) => {
    const usage = {};
    
    Object.values(usersData).forEach(subscriptions => {
      subscriptions.forEach(serviceId => {
        usage[serviceId] = (usage[serviceId] || 0) + 1;
      });
    });
    
    return usage;
  }, []);

  // Custom socket hook
  const { socket, disconnect: disconnectSocket } = useSocket('http://localhost:5000', {
    transports: ['websocket', 'polling']
  });

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleSubscriptionUpdate = (data) => {
      console.log('📊 Subscription update received:', data);
      
      setUsers(prevUsers => {
        const updatedUsers = { ...prevUsers, [data.user]: data.subscriptions };
        
        setServicesUsage(calculateServiceUsage(updatedUsers));
        
        return updatedUsers;
      });
    };

    const handleUserConnected = (msisdn) => {
      console.log('User connected:', msisdn);
    };

    const handleUserDisconnected = (msisdn) => {
      setUsers(prevUsers => {
        const updatedUsers = { ...prevUsers };
        delete updatedUsers[msisdn];
        
        setServicesUsage(calculateServiceUsage(updatedUsers));
        
        return updatedUsers;
      });
    };

    socket.on('subscription-update', handleSubscriptionUpdate);
    socket.on('user-connected', handleUserConnected);
    socket.on('user-disconnected', handleUserDisconnected);

    return () => {
      socket.off('subscription-update', handleSubscriptionUpdate);
      socket.off('user-connected', handleUserConnected);
      socket.off('user-disconnected', handleUserDisconnected);
    };
  }, [socket, calculateServiceUsage]);

  const handleLogout = () => {
    disconnectSocket();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Admin: {user.msisdn}</span>
            <button 
              onClick={handleLogout}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Users Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Active Users</h2>
            <p className="text-3xl font-bold text-blue-600">{Object.keys(users).length}</p>
          </div>

          {/* Service Usage Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Service Usage</h2>
            <div className="space-y-2">
              {Object.entries(servicesUsage)
                .sort(([, a], [, b]) => b - a)
                .map(([serviceId, count]) => (
                  <div key={serviceId} className="flex justify-between items-center">
                    <span className="text-gray-600">{serviceNames[serviceId] || `Service ${serviceId}`}</span>
                    <span className="font-semibold">{count} users</span>
                  </div>
                ))}
              {Object.keys(servicesUsage).length === 0 && (
                <p className="text-gray-500">No active subscriptions</p>
              )}
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="mt-6 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Active Users & Subscriptions</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {Object.entries(users).map(([msisdn, subscriptions]) => (
              <div key={msisdn} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{msisdn}</p>
                    <p className="text-sm text-gray-500">
                      {subscriptions.length} active subscription(s)
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {subscriptions.map(serviceId => (
                    <span
                      key={serviceId}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {serviceNames[serviceId] || `Service ${serviceId}`}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(users).length === 0 && (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500">No active users</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}