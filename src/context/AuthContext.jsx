import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage on mount
    try {
      const stored = localStorage.getItem('currentUser')
      if (stored) {
        setCurrentUser(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error)
      localStorage.removeItem('currentUser')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (user) => {
    const userData = { id: user.id, name: user.name, email: user.email }
    localStorage.setItem('currentUser', JSON.stringify(userData))
    setCurrentUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
  }

  const updateUser = (userData) => {
    const updatedUser = { ...currentUser, ...userData }
    localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    setCurrentUser(updatedUser)
  }

  const value = {
    currentUser,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!currentUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

