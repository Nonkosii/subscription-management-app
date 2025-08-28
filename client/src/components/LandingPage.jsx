import { useState } from 'react'
import { sendOtp } from '../api'

export default function LandingPage({ onNext }) {
  const [msisdn, setMsisdn] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const validateMsisdn = (number) => {
    const regex = /^[0-9]{10,15}$/
    return regex.test(number)
  }

  const handleSendOtp = async () => {
    if (!validateMsisdn(msisdn)) {
      setError('Please enter a valid mobile number')
      return
    }
    
    setIsLoading(true)
    setError('')
    try {
      await sendOtp(msisdn)
      onNext(msisdn)
    } catch (err) {
      setError('Error sending OTP. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md fade-in">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Welcome to VAS Portal</h1>
        <p className="text-gray-600 text-center mb-6">Manage your mobile subscriptions easily</p>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="msisdn">
            Mobile Number
          </label>
          <input
            id="msisdn"
            type="tel"
            value={msisdn}
            onChange={e => {
              setMsisdn(e.target.value)
              setError('')
            }}
            placeholder="Enter your mobile number"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
        
        <button
          onClick={handleSendOtp}
          disabled={!msisdn || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : 'Send OTP'}
        </button>
        
        <p className="text-xs text-gray-500 mt-6 text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}