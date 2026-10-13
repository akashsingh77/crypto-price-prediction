import React from 'react'

function Navbar({ activePage, onNavigate, user, onLogout }) {
  const links = [
    { key: 'home', label: 'Home' },
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'prediction', label: 'Prediction' },
    { key: 'favorites', label: 'Favorites' },
  ]

  const userLinks = [
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'transactions', label: 'History' },
    { key: 'chatbot', label: 'ChatBot' },
  ]

  return (
    <header className="navbar">
      <div className="brand" onClick={() => onNavigate('home')}>
        <span className="brand-mark">₿</span>
        <div>
          <h2>NovaCrypto</h2>
          <p>Predict smarter</p>
        </div>
      </div>

      <nav className="nav-links">
        {links.map((link) => (
          <button
            key={link.key}
            className={activePage === link.key ? 'nav-link active' : 'nav-link'}
            onClick={() => onNavigate(link.key)}
          >
            {link.label}
          </button>
        ))}
        {user && userLinks.map((link) => (
          <button
            key={link.key}
            className={activePage === link.key ? 'nav-link active' : 'nav-link'}
            onClick={() => onNavigate(link.key)}
          >
            {link.label}
          </button>
        ))}
      </nav>

      <div className="nav-actions">
        {user ? (
          <>
            <span className="user-chip">{user.name}</span>
            <button className="ghost-btn" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="ghost-btn" onClick={() => onNavigate('login')}>
              Login
            </button>
            <button className="primary-btn" onClick={() => onNavigate('register')}>
              Register
            </button>
          </>
        )}
      </div>
    </header>
  )
}

export default Navbar
