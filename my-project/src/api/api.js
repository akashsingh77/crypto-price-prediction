const getAuthHeaders = () => {
  const stored = window.localStorage.getItem('cryptoUser')
  const user = stored ? JSON.parse(stored) : null
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {}
}

const request = async (path, options = {}) => {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const payload = await response.json().catch(() => null)

  if (response.status === 401) {
    // Dispatch a global event so App can redirect to login
    window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: payload }))
    throw new Error(payload?.message || 'Not authorized, please login')
  }

  if (!response.ok) {
    throw new Error(payload?.message || 'Server error')
  }

  return payload
}

export const login = async (email, password) => {
  const payload = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  // Backend returns { success, token, user: { id, name, email, ... } }
  // Flatten so user.token exists
  return { ...payload.user, token: payload.token }
}

export const register = async (name, email, password) => {
  const payload = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
  // Backend returns { success, token, user: { id, name, email, ... } }
  return { ...payload.user, token: payload.token }
}

export const fetchCoins = async () => {
  const payload = await request('/api/coins')
  // Backend returns { success, count, coins: [...] }
  return payload.coins || payload
}

export const fetchProfile = async () => {
  return request('/api/users/profile', {
    method: 'GET',
    headers: getAuthHeaders(),
  })
}

export const fetchFavorites = async () => {
  const payload = await request('/api/users/favorites', {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  // userController returns array directly
  return Array.isArray(payload) ? payload : (payload.favorites || payload || [])
}

export const addFavorite = async (favorite) => {
  const payload = await request('/api/users/favorites', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(favorite),
  })
  return payload
}

export const removeFavorite = async (favoriteId) => {
  const payload = await request(`/api/users/favorites/${favoriteId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return payload
}

export const placeBuyTrade = async (tradeData) => {
  return request('/api/users/trade', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(tradeData),
  })
}

// ========== Portfolio APIs ==========

export const fetchPortfolio = async () => {
  const payload = await request('/api/portfolio', {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return payload.portfolio || payload
}

export const fetchPortfolioSummary = async () => {
  const payload = await request('/api/portfolio/summary', {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return payload.summary || payload
}

export const buyCoin = async (coinId, quantity, price) => {
  return request('/api/portfolio/buy', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ coinId, quantity, price }),
  })
}

export const sellCoin = async (coinId, quantity, price) => {
  return request('/api/portfolio/sell', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ coinId, quantity, price }),
  })
}

// ========== Transaction APIs ==========

export const fetchTransactions = async () => {
  const payload = await request('/api/transactions', {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return payload.transactions || payload
}
