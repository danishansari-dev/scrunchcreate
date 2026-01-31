import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Helper to read users from localStorage
function getUsers() {
  try {
    const raw = localStorage.getItem('users')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Helper to save users to localStorage
function saveUsers(users) {
  try {
    localStorage.setItem('users', JSON.stringify(users))
  } catch (err) {
    console.error('Error saving users:', err)
  }
}

// Generate a simple unique ID
function generateId() {
  return 'user-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount, load the current user from localStorage
  useEffect(() => {
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

  /**
   * Sign up a new user
   * @param {Object} param0 - { name, email, password }
   * @returns {boolean} - true if successful, false if email already exists
   */
  const signUp = ({ name, email, password }) => {
    const users = getUsers()

    // Check if email already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      return false // User already exists
    }

    // Create new user
    const newUser = {
      id: generateId(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password, // In a real app, you'd hash this!
    }

    // Save to users list
    users.push(newUser)
    saveUsers(users)

    // Log in the new user immediately
    const userData = { id: newUser.id, name: newUser.name, email: newUser.email }
    localStorage.setItem('currentUser', JSON.stringify(userData))
    setCurrentUser(userData)

    return true
  }

  /**
   * Sign in an existing user
   * @param {string} email
   * @param {string} password
   * @returns {boolean} - true if successful, false if credentials are invalid
   */
  const signIn = (email, password) => {
    const users = getUsers()

    // Find user by email
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim())

    if (!user) {
      return false // User not found
    }

    // Check password
    if (user.password !== password) {
      return false // Wrong password
    }

    // Set current user (don't store password in session)
    const userData = { id: user.id, name: user.name, email: user.email }
    localStorage.setItem('currentUser', JSON.stringify(userData))
    setCurrentUser(userData)

    return true
  }

  /**
   * Log out the current user
   */
  const logout = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
  }

  /**
   * Update the current user's data
   * @param {Object} userData - fields to update
   */
  const updateUser = (userData) => {
    const updatedUser = { ...currentUser, ...userData }
    localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    setCurrentUser(updatedUser)
  }

  // Alias for backward compatibility
  const login = signIn

  const value = {
    currentUser,
    loading,
    signUp,
    signIn,
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


