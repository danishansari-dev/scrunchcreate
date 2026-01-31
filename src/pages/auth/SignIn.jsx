import React, { useState } from 'react'
import styles from './SignIn.module.css'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function SignIn() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password')
      return
    }

    const success = signIn(email, password)
    if (!success) {
      setError('Invalid email or password. Please try again or create an account.')
      return
    }
    navigate('/profile')
  }

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={onSubmit}>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.subtitle}>Access your account and saved styles.</p>

        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <label className={styles.label}>
          Password
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        <button type="submit" className={styles.button}>Continue</button>
        <p className={styles.inlineText}>
          New here? <Link to="/signup" className={styles.link}>Create an account</Link>
        </p>
      </form>
    </main>
  )
}

