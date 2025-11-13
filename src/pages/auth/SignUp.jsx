import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../componets/navbar/NavBar'
import styles from './SignUp.module.css'

export default function SignUp() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      setError('Please fill all fields.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email.')
      return
    }
    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const existing = users.find((u) => u.email === trimmedEmail)
    if (existing) {
      setError('An account with this email already exists.')
      return
    }

    const newUser = { id: Date.now(), name: trimmedName, email: trimmedEmail, password: trimmedPassword }
    const nextUsers = [...users, newUser]
    localStorage.setItem('users', JSON.stringify(nextUsers))
    localStorage.setItem('currentUser', JSON.stringify({ id: newUser.id, name: newUser.name, email: newUser.email }))
    navigate('/')
  }

  return (
    <>
      <NavBar />
      <main className={styles.page}>
        <form className={styles.card} onSubmit={handleSubmit}>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join to get exclusive offers and updates.</p>

          {error ? <div className={styles.error} role="alert">{error}</div> : null}

          <label className={styles.label}>
            <span>Name</span>
            <input
              className={styles.input}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </label>

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
              placeholder="Minimum 6 characters"
            />
          </label>

          <button className={styles.button} type="submit">Sign Up</button>

          <p className={styles.inlineText}>
            Already have an account?{' '}
            <a className={styles.link} href="/signin">Sign in</a>
          </p>
        </form>
      </main>
    </>
  )
}


