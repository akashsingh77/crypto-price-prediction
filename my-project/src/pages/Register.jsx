import { useState } from 'react'
import { register as registerApi } from '../api/api'

function Register({ onNavigate, onLogin }) {
  const [name, setName] = useState('Ava Stone')
  const [email, setEmail] = useState('ava@example.com')
  const [password, setPassword] = useState('demo123')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const user = await registerApi(name, email, password)
      onLogin(user)
    } catch (err) {
      setError(err.message || 'Registration failed')
    }
  }

  return (
    <section className="auth-card">
      <h2>Create your account</h2>
      <p>Join NovaCrypto to save favorites and track forecasts.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
          Register
        </button>
      </form>
      <p className="auth-link">
        Already have an account? <button onClick={() => onNavigate('login')}>Login</button>
      </p>
    </section>
  )
}

export default Register
