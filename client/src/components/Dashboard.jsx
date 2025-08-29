import { useEffect, useState } from 'react';
import { 
  getServices, 
  getSubscriptions, 
  subscribeService, 
  unsubscribeService, 
  getTransactions 
} from '../api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import ServicesList from './ServiceList';
import ActiveSubscriptions from './ActiveSubscriptions';
import Transactions from './Transactions';

// Connection Status
function ConnectionStatus({ isConnected, connectionError }) {
  const status = isConnected ? 'connected' : connectionError ? 'error' : 'disconnected';

  const statusColors = {
    connected: 'bg-green-500',
    disconnected: 'bg-red-500',
    reconnecting: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  const statusMessages = {
    connected: 'Connected',
    disconnected: 'Disconnected',
    reconnecting: 'Reconnecting...',
    error: 'Connection Error'
  };

  return (
    <div className="flex items-center text-sm text-gray-600">
      <div className={`w-3 h-3 rounded-full mr-2 ${statusColors[status]}`}></div>
      {statusMessages[status]}
      {status === 'reconnecting' && (
        <div className="ml-2 animate-spin">⟳</div>
      )}
    </div>
  );
}

export default function Dashboard({ onLogout }) {
  const [services, setServices] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('services');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  // Custom socket hook
  const { socket, isConnected, connectionError, disconnect: disconnectSocket } = useSocket('http://localhost:5000', {
    transports: ['websocket', 'polling'],
    timeout: 10000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // Check token expiration on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          logout();
          window.location.href = '/';
        }
      } catch (error) {
        logout();
        window.location.href = '/';
      }
    }
  }, [logout]);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const [servicesRes, subsRes, txRes] = await Promise.all([
          getServices(),
          getSubscriptions(),
          getTransactions()
        ]);
        
        setServices(servicesRes.data);
        setSubscriptions(subsRes.data.subscriptions || []);
        setTransactions(txRes.data.transactions || []);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        if (err.message === 'Token expired') {
          logout();
          window.location.href = '/';
        } else {
          setError('Failed to load data. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, logout]);

  // Realtime updates
  useEffect(() => {
    if (!socket) return;

    const handleSubscriptionUpdate = ({ user: updatedUser, subscriptions: updatedSubs }) => {
      if (updatedUser === user.msisdn) {
        setSubscriptions(updatedSubs);
        
        // Refresh transactions
        getTransactions().then(res => {
          setTransactions(res.data.transactions || []);
        }).catch(err => {
          console.error('Error refreshing transactions:', err);
        });
      }
    };

    socket.on('subscription-update', handleSubscriptionUpdate);

    return () => {
      socket.off('subscription-update', handleSubscriptionUpdate);
    };
  }, [socket, user]);

  const handleSubscribe = async (id, name) => {
    try {
      const response = await subscribeService(id);
      
      if (response.status === 402 || (response.data.billing && !response.data.billing.success)) {
        alert(`Payment failed: ${response.data.message || 'Insufficient funds'}`);
        return;
      }
      
      setSubscriptions(prev => [...prev, id]);
      
      const txRes = await getTransactions();
      setTransactions(txRes.data.transactions || []);
      
      alert(`Successfully subscribed to ${name}!`);
    } catch (err) {
      if (err.message === 'Token expired') {
        logout();
        window.location.href = '/';
      } else if (err.response?.status === 402) {
        alert(`Payment failed: ${err.response.data.message || 'Insufficient funds'}`);
      } else if (err.response?.status === 400) {
        alert(`${err.response.data.message}`);
      } else {
        console.error('Subscription error:', err);
        alert('Failed to subscribe. Please try again.');
      }
    }
  };

  const handleUnsubscribe = async (id, name) => {
    try {
      await unsubscribeService(id);
      setSubscriptions(prev => prev.filter(subId => subId !== id));
      
      const txRes = await getTransactions();
      setTransactions(txRes.data.transactions || []);
      
      alert(`Successfully unsubscribed from ${name}!`);
    } catch (err) {
      if (err.message === 'Token expired') {
        logout();
        window.location.href = '/';
      } else {
        console.error(err);
        alert('Failed to unsubscribe. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    disconnectSocket();
    onLogout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Subscription Portal</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user?.msisdn}</span>
            <button 
              onClick={handleLogout}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Error message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      )}

      {/* Socket connection status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        <ConnectionStatus isConnected={isConnected} connectionError={connectionError} />
      </div>

      {/* Rest of the dashboard content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('services')}
              className={`py-4 px-1 text-sm font-medium ${activeTab === 'services' ? 'tab-active' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Services
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`py-4 px-1 text-sm font-medium ${activeTab === 'subscriptions' ? 'tab-active' : 'text-gray-500 hover:text-gray-700'}`}
            >
              My Subscriptions
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 text-sm font-medium ${activeTab === 'transactions' ? 'tab-active' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Transaction History
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-6">
          {activeTab === 'services' && (
            <ServicesList 
              services={services} 
              subscriptions={subscriptions}
              onSubscribe={handleSubscribe}
              onUnsubscribe={handleUnsubscribe}
            />
          )}
          {activeTab === 'subscriptions' && (
            <ActiveSubscriptions 
              services={services} 
              subscriptions={subscriptions}
              onUnsubscribe={handleUnsubscribe}
            />
          )}
          {activeTab === 'transactions' && (
            <Transactions transactions={transactions} />
          )}
        </div>
      </div>
    </div>
  );
}