import { useState } from 'react'
import { login as loginApi } from '../api/api'

function Login({ onNavigate, onLogin }) {
  const [email, setEmail] = useState('ava@example.com')
  const [password, setPassword] = useState('demo123')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const user = await loginApi(email, password)
      onLogin(user)
    } catch (err) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <section className="auth-card">
      <h2>Welcome back</h2>
      <p>Sign in to unlock your personalized dashboard.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="primary-btn full-width">
          Login
        </button>
      </form>
      <p className="auth-link">
        New here? <button onClick={() => onNavigate('register')}>Create account</button>
      </p>
    </section>
  )
}

export default Login
