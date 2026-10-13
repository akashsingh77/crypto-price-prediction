import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Prediction from './pages/Prediction'
import Favorites from './pages/Favorites'
import Portfolio from './pages/Portfolio'
import Transactions from './pages/Transactions'
import { fetchFavorites, addFavorite, removeFavorite, fetchCoins, fetchProfile } from './api/api'
import ChatBot from "./pages/ChatBot";

function App() {
  const [activePage, setActivePage] = useState('home')
  const [user, setUser] = useState(() => {
    try {
      const stored = window.localStorage.getItem('cryptoUser')
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      return null
    }
  })
  const [favorites, setFavorites] = useState([])
  const [coins, setCoins] = useState([])

  useEffect(() => {
    loadCoins()
  }, [])

  // Listen for global auth:unauthorized events (dispatched by api.js on 401)
  useEffect(() => {
    const handleUnauthorized = () => {
      handleLogout()
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  useEffect(() => {
    if (user) {
      window.localStorage.setItem('cryptoUser', JSON.stringify(user))
      loadProfile()
      loadFavorites()
    } else {
      window.localStorage.removeItem('cryptoUser')
      setFavorites([])
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const profile = await fetchProfile()
      // Preserve token from existing user state since profile response doesn't include it
      setUser((prev) => ({ ...profile, token: prev?.token }))
    } catch (error) {
      console.error('Failed to load profile', error)
      // Don't logout user on profile fetch failure
    }
  }

  const loadFavorites = async () => {
    try {
      const favoriteList = await fetchFavorites()
      setFavorites(favoriteList)
    } catch (error) {
      console.error('Failed to load favorites', error)
      setFavorites([])
    }
  }

  const loadCoins = async () => {
    try {
      const coinList = await fetchCoins()
      setCoins(coinList)
    } catch (error) {
      console.error('Failed to load coins', error)
      setCoins([])
    }
  }

  const handleNavigate = (page) => setActivePage(page)

  const handleLogin = (userData) => {
    setUser(userData)
    setActivePage('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setActivePage('home')
  }

  const handleToggleFavorite = async (coin) => {
    if (!user) {
      setActivePage('login')
      return
    }

    const existingFavorite = favorites.find(
      (favorite) => favorite.coinId === coin.id || favorite.name === coin.name,
    )

    if (existingFavorite) {
      try {
        await removeFavorite(existingFavorite._id)
        setFavorites((prev) => prev.filter((fav) => fav._id !== existingFavorite._id))
      } catch (error) {
        console.error('Error removing favorite', error)
      }
      return
    }

    try {
      const newFavorite = await addFavorite({
        coinId: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        image: coin.image,
        currentPrice: coin.current_price || coin.price,
      })
      setFavorites((prev) => [...prev, newFavorite])
    } catch (error) {
      console.error('Error adding favorite', error)
    }
  }

  const renderPage = () => {
    if (activePage === 'login') {
      return <Login onNavigate={handleNavigate} onLogin={handleLogin} />
    }

    if (activePage === 'register') {
      return <Register onNavigate={handleNavigate} onLogin={handleLogin} />
    }

    if (activePage === 'dashboard') {
      return (
        <Dashboard
          coins={coins}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          user={user}
          onNavigate={handleNavigate}
        />
      )
    }

    if (activePage === 'prediction') {
      return <Prediction />
    }

    if (activePage === 'favorites') {
      return <Favorites favorites={favorites} onToggleFavorite={handleToggleFavorite} />
    }

    if (activePage === 'portfolio') {
      return <Portfolio user={user} onNavigate={handleNavigate} />
    }

    if (activePage === 'transactions') {
      return <Transactions />
    }
      // ChatBot Page
  if (activePage === 'chatbot') {
    return <ChatBot />
  }

    return <Home onNavigate={handleNavigate} />
  }

  return (
    <div className="app-shell">
      <Navbar activePage={activePage} onNavigate={handleNavigate} user={user} onLogout={handleLogout} />
      <main className="main-content">{renderPage()}</main>
      <Footer />
    </div>
  )
}

export default App
