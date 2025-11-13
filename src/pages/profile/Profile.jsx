import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../componets/navbar/NavBar'
import styles from './Profile.module.css'

export default function Profile() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('currentUser')
      if (!stored) {
        navigate('/signin')
        return
      }
      const parsed = JSON.parse(stored)
      setCurrentUser(parsed)
      setName(parsed.name || '')
      setEmail(parsed.email || '')
    } catch {
      navigate('/signin')
    }
  }, [navigate])

  const handleSave = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!currentUser) return

    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const idx = users.findIndex((u) => u.id === currentUser.id)
    if (idx === -1) {
      setError('User not found.')
      return
    }

    if (changingPassword) {
      const existing = users[idx]
      if (!password || !newPassword) {
        setError('Enter current and new password.')
        return
      }
      if (existing.password !== password) {
        setError('Current password is incorrect.')
        return
      }
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters.')
        return
      }
      users[idx] = { ...existing, name: name.trim(), password: newPassword }
    } else {
      users[idx] = { ...users[idx], name: name.trim() }
    }

    localStorage.setItem('users', JSON.stringify(users))
    const nextCurrent = { ...currentUser, name: name.trim() }
    localStorage.setItem('currentUser', JSON.stringify(nextCurrent))
    setCurrentUser(nextCurrent)
    setPassword('')
    setNewPassword('')
    setChangingPassword(false)
    setSuccess('Profile updated successfully.')
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    navigate('/')
  }

  const greeting = useMemo(() => {
    const first = name.trim().split(' ')[0]
    return first ? `Hi, ${first}` : 'Hi there'
  }, [name])

  if (!currentUser) return null

  return (
    <>
      <NavBar />
      <main className={styles.page}>
        <section className={styles.content}>
          <div className={styles.leftCol}>
            <div className={styles.card}>
              <h1 className={styles.title}>{greeting}</h1>
              <p className={styles.subtitle}>Manage your account details</p>

              {error ? <div className={styles.error}>{error}</div> : null}
              {success ? <div className={styles.success}>{success}</div> : null}

              <form onSubmit={handleSave} className={styles.form}>
                <label className={styles.label}>
                  <span>Name</span>
                  <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label className={styles.label}>
                  <span>Email</span>
                  <input className={styles.input} value={email} disabled />
                </label>

                {changingPassword ? (
                  <div className={styles.passwordGroup}>
                    <label className={styles.label}>
                      <span>Current password</span>
                      <input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </label>
                    <label className={styles.label}>
                      <span>New password</span>
                      <input className={styles.input} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </label>
                  </div>
                ) : null}

                <div className={styles.actions}>
                  <button className={styles.primary} type="submit">Save changes</button>
                  <button className={styles.ghost} type="button" onClick={() => setChangingPassword((v) => !v)}>
                    {changingPassword ? 'Cancel password change' : 'Change password'}
                  </button>
                </div>
              </form>
            </div>
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Security</h2>
              <p className={styles.sectionText}>You are signed in as <strong>{email}</strong>.</p>
              <div className={styles.actions}>
                <button className={styles.danger} type="button" onClick={handleLogout}>Log out</button>
              </div>
            </div>
          </div>

          <aside className={styles.rightCol}>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Quick Links</h3>
              <ul className={styles.links}>
                <li><a href="/products" className={styles.link}>Browse Products</a></li>
                <li><a href="/" className={styles.link}>Home</a></li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Addresses</h3>
              <p className={styles.sectionText}>No addresses added yet.</p>
            </div>
          </aside>
        </section>
      </main>
    </>
  )
}


