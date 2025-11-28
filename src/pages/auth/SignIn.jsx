import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import NavBar from '../../componets/navbar/NavBar'
import styles from './SignIn.module.css'
import { useAuth } from '../../context/AuthContext'

export default function SignIn() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()
    if (!trimmedEmail || !trimmedPassword) {
      setError('Enter email and password.')
      return
    }
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const match = users.find((u) => u.email === trimmedEmail && u.password === trimmedPassword)
    if (!match) {
      setError('Invalid credentials.')
      return
    }
    login(match)
    navigate('/')
  }

  return (
    <>
      <NavBar />
      <main className={styles.page}>
        <form className={styles.card} onSubmit={handleSubmit}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to continue.</p>

          {error ? <div className={styles.error} role="alert">{error}</div> : null}

          <label className={styles.label}>
            <span>Email</span>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label className={styles.label}>
            <span>Password</span>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />
          </label>

          <button className={styles.button} type="submit">Sign In</button>

          <p className={styles.inlineText}>
            New here?{' '}
            <Link className={styles.link} to="/signup">Create an account</Link>
          </p>
        </form>
      </main>
    </>
  )
}


