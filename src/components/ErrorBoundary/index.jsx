/**
 * Why this file exists:
 * Production-ready React Error Boundary class component.
 * Prevents a single component crash from taking down the entire application.
 * Renders a premium, brand-aligned fallback UI to allow visitors to recover.
 */

import React, { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    // Why: Updates state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Why: Log the error to console or error-reporting service.
    console.error('ErrorBoundary caught an unhandled exception:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Why: Render a beautiful, styled fallback UI matching the brand aesthetics.
      return (
        <div style={fallbackStyles.container}>
          <div style={fallbackStyles.card}>
            <div style={fallbackStyles.icon}>🌸</div>
            <h1 style={fallbackStyles.title}>Something went wrong</h1>
            <p style={fallbackStyles.description}>
              We apologize for the inconvenience. A minor issue occurred while rendering this page.
            </p>
            <div style={fallbackStyles.actions}>
              <button 
                onClick={this.handleReset}
                style={fallbackStyles.primaryBtn}
              >
                Return Home
              </button>
              <button 
                onClick={() => window.location.reload()}
                style={fallbackStyles.secondaryBtn}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Inline styles for absolute isolation and reliability (CSS modules might not load during runtime crashes)
const fallbackStyles = {
  container: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    backgroundColor: '#fdf6ef', // --color-cream
    fontFamily: "'Figtree', system-ui, -apple-system, sans-serif"
  },
  card: {
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '40px 32px',
    boxShadow: '0 10px 30px rgba(74, 28, 64, 0.04)',
    border: '1px solid #eeeeee'
  },
  icon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  title: {
    fontSize: '28px',
    color: '#4a1c40', // --color-secondary
    margin: '0 0 12px 0',
    fontWeight: 500
  },
  description: {
    fontSize: '15px',
    color: '#777777',
    lineHeight: 1.6,
    margin: '0 0 28px 0'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
  },
  primaryBtn: {
    backgroundColor: '#4a1c40',
    color: '#ffffff',
    border: 'none',
    padding: '11px 24px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(74, 28, 64, 0.15)'
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    color: '#4a1c40',
    border: '1px solid #4a1c40',
    padding: '10px 23px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
}
