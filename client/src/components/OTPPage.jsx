import { useState } from 'react';
import { verifyOtp } from '../api';
import { useAuth } from '../context/AuthContext';

export default function OTPPage({ msisdn, onLogin }) {
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }
    
    setIsVerifying(true);
    setError('');
    try {
      const { data } = await verifyOtp(msisdn, otp);
      
      // Store token and user data
      login(data.token, msisdn);
      
      // Navigate to dashboard
      onLogin();
    } catch (err) {
      setError('Invalid OTP. Please try again.');
      console.error('OTP verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md fade-in">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Verify Your Number</h1>
        <p className="text-gray-600 text-center mb-6">
          Enter the OTP sent to <span className="font-semibold">{msisdn}</span>
        </p>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="otp">
            Verification Code
          </label>
          <input
            id="otp"
            type="text"
            value={otp}
            onChange={e => {
              setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
              setError('');
            }}
            placeholder="Enter 6-digit OTP"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-xl tracking-widest"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
        
        <button
          onClick={handleVerifyOtp}
          disabled={otp.length !== 6 || isVerifying}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isVerifying ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </>
          ) : 'Verify OTP'}
        </button>
        
        <p className="text-sm text-gray-500 mt-6 text-center">
          Didn't receive the code? <button className="text-blue-600 hover:underline">Resend OTP</button>
        </p>
      </div>
    </div>
  );
}