import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for existing token and user data
    const token = localStorage.getItem('token')
    const msisdn = localStorage.getItem('msisdn')
    
    if (token && msisdn) {
      // Verify token is not expired (simple check)
      try {
        // Add JWT expiration check here
        setUser({ msisdn })
        setIsAuthenticated(true)
      } catch (error) {
        localStorage.removeItem('token')
        localStorage.removeItem('msisdn')
      }
    }
  }, [])

  const login = (token, msisdn) => {
    localStorage.setItem('token', token)
    localStorage.setItem('msisdn', msisdn)
    setUser({ msisdn })
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('msisdn')
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    isAuthenticated,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}