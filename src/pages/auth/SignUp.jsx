import React, { useState } from 'react'
import styles from './SignUp.module.css'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function SignUp() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields')
      return
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters')
      return
    }

    const success = signUp({ name, email, password })
    if (!success) {
      setError('An account with this email already exists. Try signing in instead.')
      return
    }
    navigate('/profile')
  }

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={onSubmit}>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Join Scrunch &amp; Create for curated accessories.</p>

        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.label}>
          Name
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </label>

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
            autoComplete="new-password"
          />
        </label>

        <button type="submit" className={styles.button}>Create account</button>
        <p className={styles.inlineText}>
          Already have an account? <Link to="/signin" className={styles.link}>Sign in</Link>
        </p>
      </form>
    </main>
  )
}

