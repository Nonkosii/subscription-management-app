// src/App.jsx
import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import OTPPage from './components/OTPPage';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

// routing logic
function AppContent() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [msisdn, setMsisdn] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Check authentication status on component mount and when auth changes
  useEffect(() => {
    if (isAuthenticated && user) {
      // User is logged in, redirect to appropriate dashboard
      if (user.msisdn === '27820000000') {
        setIsAdmin(true);
        setCurrentPage('admin');
      } else {
        setIsAdmin(false);
        setCurrentPage('dashboard');
      }
    } else {
      setCurrentPage('landing');
    }
  }, [isAuthenticated, user]);

  const handleSendOtp = (number) => {
    setMsisdn(number);
    setCurrentPage('otp');
  };

  const handleLogin = () => {
    if (msisdn === '27820000000') {
      setIsAdmin(true);
      setCurrentPage('admin');
    } else {
      setIsAdmin(false);
      setCurrentPage('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentPage('landing');
    setMsisdn('');
    setIsAdmin(false);
  };

  return (
    <div className="App">
      {currentPage === 'landing' && <LandingPage onNext={handleSendOtp} />}
      {currentPage === 'otp' && (
        <OTPPage msisdn={msisdn} onLogin={handleLogin} />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard onLogout={handleLogout} />
      )}
      {currentPage === 'admin' && (
        <AdminDashboard onLogout={handleLogout} />
      )}
    </div>
  );
}

// Main App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;