import { useEffect, useMemo, useState } from 'react'
import CoinCard from '../components/CoinCard'
import { buyCoin as buyCoinApi, sellCoin as sellCoinApi } from '../api/api'

const storageKeys = {
  portfolio: 'cryptoPortfolio',
  alerts: 'cryptoAlerts',
}

const defaultPortfolio = [
  { id: 1, coinId: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', amount: 0.42, avgPrice: 61200 },
  { id: 2, coinId: 'ethereum', symbol: 'ETH', name: 'Ethereum', amount: 1.8, avgPrice: 3200 },
]

const defaultAlerts = [
  { id: 1, symbol: 'BTC', targetPrice: 70000, direction: 'above' },
  { id: 2, symbol: 'ETH', targetPrice: 3800, direction: 'below' },
]

const newsItems = [
  { title: 'BTC consolidates near resistance as ETF flows remain strong', tag: 'Market' },
  { title: 'Ethereum upgrade boosts staking confidence ahead of next rally', tag: 'Technology' },
  { title: 'Altcoins rebound as risk-on sentiment returns to the market', tag: 'Sentiment' },
]

function Dashboard({ coins, favorites, onToggleFavorite, user, onNavigate }) {
  const [portfolio, setPortfolio] = useState(() => {
    if (typeof window === 'undefined') return defaultPortfolio
    try {
      const stored = window.localStorage.getItem(storageKeys.portfolio)
      return stored ? JSON.parse(stored) : defaultPortfolio
    } catch (error) {
      return defaultPortfolio
    }
  })

  const [alerts, setAlerts] = useState(() => {
    if (typeof window === 'undefined') return defaultAlerts
    try {
      const stored = window.localStorage.getItem(storageKeys.alerts)
      return stored ? JSON.parse(stored) : defaultAlerts
    } catch (error) {
      return defaultAlerts
    }
  })

  const [alertForm, setAlertForm] = useState({ symbol: 'BTC', targetPrice: '70000', direction: 'above' })

  // Trade modal state
  const [tradeModal, setTradeModal] = useState({ show: false, type: 'BUY', coin: null })
  const [quantity, setQuantity] = useState('')
  const [confirmModal, setConfirmModal] = useState(false)
  const [tradeResult, setTradeResult] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    window.localStorage.setItem(storageKeys.portfolio, JSON.stringify(portfolio))
  }, [portfolio])

  useEffect(() => {
    window.localStorage.setItem(storageKeys.alerts, JSON.stringify(alerts))
  }, [alerts])

  // Trade handlers
  const handleBuy = (coin) => {
    if (!user) {
      setMessage('Please login to buy coins')
      onNavigate('login')
      return
    }
    setTradeModal({ show: true, type: 'BUY', coin })
    setQuantity('')
    setTradeResult(null)
    setMessage('')
  }

  const handleSell = (coin) => {
    if (!user) {
      setMessage('Please login to sell coins')
      onNavigate('login')
      return
    }
    setTradeModal({ show: true, type: 'SELL', coin })
    setQuantity('')
    setTradeResult(null)
    setMessage('')
  }

  const closeTradeModal = () => {
    setTradeModal({ show: false, type: 'BUY', coin: null })
    setQuantity('')
    setConfirmModal(false)
    setTradeResult(null)
  }

  const handleBuySellClick = () => {
    const qty = parseFloat(quantity)
    if (!qty || qty <= 0) {
      setMessage('Please enter a valid quantity')
      return
    }
    setConfirmModal(true)
  }

  const handleConfirmTrade = async () => {
    const qty = parseFloat(quantity)
    if (!qty || qty <= 0) {
      setMessage('Please enter a valid quantity')
      return
    }

    setConfirmModal(false)

    try {
      const price = tradeModal.coin.currentPrice || tradeModal.coin.current_price || tradeModal.coin.price || 0
      const coinId = tradeModal.coin._id || tradeModal.coin.id
      let result

      if (tradeModal.type === 'BUY') {
        result = await buyCoinApi(coinId, qty, price)
      } else {
        result = await sellCoinApi(coinId, qty, price)
      }

      setTradeResult({
        success: true,
        type: tradeModal.type,
        quantity: qty,
        price,
        total: qty * price,
        message: result.message || `${tradeModal.type} successful`,
      })
      setMessage(result.message || 'Trade executed successfully')
    } catch (error) {
      setTradeResult({
        success: false,
        message: error.message || 'Trade failed',
      })
      setMessage(error.message || 'Trade failed')
    }
  }

  const marketStats = useMemo(() => {
    const baseCoin = (coins || [])[0] || {}
    const marketCap = baseCoin.market_cap ? `$${(baseCoin.market_cap / 1e12).toFixed(2)}T` : '$2.63T'
    const volume = baseCoin.total_volume ? `$${(baseCoin.total_volume / 1e9).toFixed(1)}B` : '$48.2B'

    return [
      { label: 'Market cap', value: marketCap, detail: '+3.4%' },
      { label: '24h volume', value: volume, detail: '+8.2%' },
      { label: 'BTC dominance', value: '52.7%', detail: '+0.4%' },
    ]
  }, [coins])

  const watchlistCoins = (favorites?.length ? favorites : (coins || []).slice(0, 4)).slice(0, 4)

  const portfolioValue = useMemo(() => {
    return portfolio.reduce((total, holding) => {
      const coin = (coins || []).find((item) => item.id === holding.coinId)
      const price = coin?.current_price || coin?.price || holding.avgPrice || 0
      return total + holding.amount * price
    }, 0)
  }, [coins, portfolio])

  const portfolioGain = useMemo(() => {
    return portfolio.reduce((total, holding) => {
      const coin = (coins || []).find((item) => item.id === holding.coinId)
      const price = coin?.current_price || coin?.price || holding.avgPrice || 0
      return total + (price - holding.avgPrice) * holding.amount
    }, 0)
  }, [coins, portfolio])

  const handleAlertSubmit = (event) => {
    event.preventDefault()
    if (!alertForm.symbol || !alertForm.targetPrice) return

    setAlerts((prev) => [
      ...prev,
      {
        id: Date.now(),
        symbol: alertForm.symbol.toUpperCase(),
        targetPrice: Number(alertForm.targetPrice),
        direction: alertForm.direction,
      },
    ])
    setAlertForm({ symbol: 'BTC', targetPrice: '', direction: 'above' })
  }

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Live market overview</p>
          <h2>Market overview</h2>
        </div>
        <button className="ghost-btn" onClick={() => window.location.reload()}>
          Refresh
        </button>
      </div>

      <div className="stats-grid">
        {marketStats.map((stat) => (
          <article key={stat.label} className="metric-card alt">
            <p className="eyebrow">{stat.label}</p>
            <strong>{stat.value}</strong>
            <p>{stat.detail}</p>
          </article>
        ))}
      </div>

      <div className="feature-grid">
        <article className="feature-card">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">⭐ Watchlist</p>
              <h3>Follow your favorites</h3>
            </div>
          </div>
          <div className="feature-list">
            {(watchlistCoins || []).map((item) => (
              <div key={item._id || item.id || item.coinId || item.name} className="feature-pill">
                <span>{item.name || item.coinId}</span>
                <strong>{item.symbol || '—'}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="feature-card">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">💼 Portfolio tracker</p>
              <h3>Your balance</h3>
            </div>
          </div>
          <div className="portfolio-summary">
            <div>
              <p className="muted">Estimated value</p>
              <strong>${portfolioValue.toFixed(2)}</strong>
            </div>
            <div>
              <p className="muted">P/L</p>
              <strong className={portfolioGain >= 0 ? 'positive' : 'negative'}>
                {portfolioGain >= 0 ? '+' : ''}${portfolioGain.toFixed(2)}
              </strong>
            </div>
          </div>
          <div className="feature-list">
            {portfolio.map((holding) => (
              <div key={holding.id} className="feature-pill">
                <span>{holding.name}</span>
                <strong>{holding.amount} {holding.symbol}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="feature-grid">
        <article className="feature-card">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">🔔 Price alerts</p>
              <h3>Stay ahead of the move</h3>
            </div>
          </div>
          <form className="alert-form" onSubmit={handleAlertSubmit}>
            <input
              value={alertForm.symbol}
              onChange={(event) => setAlertForm((prev) => ({ ...prev, symbol: event.target.value }))}
              placeholder="BTC"
            />
            <select
              value={alertForm.direction}
              onChange={(event) => setAlertForm((prev) => ({ ...prev, direction: event.target.value }))}
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
            <input
              type="number"
              value={alertForm.targetPrice}
              onChange={(event) => setAlertForm((prev) => ({ ...prev, targetPrice: event.target.value }))}
              placeholder="70000"
            />
            <button className="primary-btn" type="submit">Add alert</button>
          </form>
          <div className="feature-list">
            {alerts.map((alert) => (
              <div key={alert.id} className="feature-pill">
                <span>
                  {alert.symbol} {alert.direction} ${alert.targetPrice}
                </span>
                <button className="ghost-btn small" onClick={() => removeAlert(alert.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="feature-card">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">📰 Crypto news</p>
              <h3>Latest market headlines</h3>
            </div>
          </div>
          <div className="news-list">
            {newsItems.map((item) => (
              <div key={item.title} className="news-item">
                <p className="eyebrow">{item.tag}</p>
                <p>{item.title}</p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="section-heading">
        <div>
          <p className="eyebrow">Live market overview</p>
          <h2>Trending assets</h2>
        </div>
      </div>

      {message && (
        <div className={`trade-message ${message.includes('successful') || message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
          <button className="ghost-btn small" onClick={() => setMessage('')}>✕</button>
        </div>
      )}

      <div className="coin-grid">
        {(coins || []).map((coin) => (
          <CoinCard
            key={coin.id || coin.name}
            coin={coin}
            isFavorite={favorites.some((fav) => fav.coinId === coin.id || fav.name === coin.name)}
            onToggleFavorite={onToggleFavorite}
            onBuy={handleBuy}
            onSell={handleSell}
          />
        ))}
      </div>

      {/* Trade Modal */}
      {tradeModal.show && (
        <div className="modal-overlay" onClick={closeTradeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeTradeModal}>✕</button>
            <h3>{tradeModal.type === 'BUY' ? 'Buy' : 'Sell'} {tradeModal.coin?.name}</h3>
            <p className="modal-subtitle">
              Current Price: ${(tradeModal.coin.currentPrice || tradeModal.coin.current_price || tradeModal.coin.price || 0).toLocaleString()}
            </p>

            {tradeResult ? (
              <div className="trade-result">
                <div className={`result-icon ${tradeResult.success ? 'success' : 'error'}`}>
                  {tradeResult.success ? '✓' : '✕'}
                </div>
                <p>{tradeResult.message}</p>
                {tradeResult.success && (
                  <div className="result-details">
                    <p>Type: <strong>{tradeResult.type}</strong></p>
                    <p>Quantity: <strong>{tradeResult.quantity}</strong></p>
                    <p>Price: <strong>${tradeResult.price}</strong></p>
                    <p>Total: <strong>${tradeResult.total?.toFixed(2)}</strong></p>
                  </div>
                )}
                <button className="primary-btn full-width" onClick={closeTradeModal}>Done</button>
              </div>
            ) : (
              <>
                <div className="modal-form">
                  <label>Quantity</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="Enter quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    autoFocus
                  />
                  {quantity && parseFloat(quantity) > 0 && (
                    <p className="modal-total">
                      Total: ${(parseFloat(quantity) * (tradeModal.coin.currentPrice || tradeModal.coin.current_price || tradeModal.coin.price || 0)).toFixed(2)}
                    </p>
                  )}
                </div>
                <button className={`primary-btn full-width ${tradeModal.type === 'BUY' ? 'buy-btn' : 'sell-btn'}`} onClick={handleBuySellClick}>
                  {tradeModal.type === 'BUY' ? 'Buy' : 'Sell'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="modal-overlay" onClick={() => setConfirmModal(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm {tradeModal.type === 'BUY' ? 'Purchase' : 'Sale'}</h3>
            <div className="confirm-details">
              <p>Coin: <strong>{tradeModal.coin?.name}</strong></p>
              <p>Type: <strong>{tradeModal.type}</strong></p>
              <p>Quantity: <strong>{parseFloat(quantity)}</strong></p>
              <p>Price: <strong>${(tradeModal.coin.currentPrice || tradeModal.coin.current_price || tradeModal.coin.price || 0).toLocaleString()}</strong></p>
              <p>Total: <strong>${(parseFloat(quantity) * (tradeModal.coin.currentPrice || tradeModal.coin.current_price || tradeModal.coin.price || 0)).toFixed(2)}</strong></p>
            </div>
            <div className="confirm-actions">
              <button className="ghost-btn" onClick={() => setConfirmModal(false)}>Cancel</button>
              <button
                className={`primary-btn ${tradeModal.type === 'BUY' ? 'buy-btn' : 'sell-btn'}`}
                onClick={handleConfirmTrade}
              >
                Confirm {tradeModal.type === 'BUY' ? 'Buy' : 'Sell'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Dashboard
