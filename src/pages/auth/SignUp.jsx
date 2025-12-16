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

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const ok = await signUp({ name, email, password })
    if (!ok) {
      setError('Could not create account. Try again.')
      return
    }
    navigate('/profile')
  }

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={onSubmit}>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Join Scrunch &amp; Create for curated accessories.</p>

        {error ? <div className={styles.error}>{error}</div> : null}

        <label className={styles.label}>
          Name
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
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
