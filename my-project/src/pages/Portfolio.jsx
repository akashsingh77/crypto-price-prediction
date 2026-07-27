import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  fetchPortfolio,
  fetchPortfolioSummary,
  buyCoin as buyCoinApi,
  sellCoin as sellCoinApi,
  fetchCoins,
  fetchTransactions,
} from '../api/api'

function Portfolio({ user, onNavigate }) {
  const [portfolio, setPortfolio] = useState(null)
  const [summary, setSummary] = useState(null)
  const [coins, setCoins] = useState([])
  const [allTransactions, setAllTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // Trade modal state
  const [tradeModal, setTradeModal] = useState({ show: false, type: 'BUY', coin: null })
  const [quantity, setQuantity] = useState('')
  const [confirmModal, setConfirmModal] = useState(false)
  const [tradeResult, setTradeResult] = useState(null)

  // Transaction filters & pagination
  const [txSearch, setTxSearch] = useState('')
  const [txTypeFilter, setTxTypeFilter] = useState('ALL')
  const [txPage, setTxPage] = useState(1)
  const TX_PER_PAGE = 10

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [portfolioData, summaryData, coinList, transactionsData] = await Promise.all([
        fetchPortfolio(),
        fetchPortfolioSummary(),
        fetchCoins(),
        fetchTransactions(),
      ])
      setPortfolio(portfolioData)
      setSummary(summaryData)
      setCoins(coinList)
      setAllTransactions(Array.isArray(transactionsData) ? transactionsData : [])
    } catch (error) {
      console.error('Failed to load portfolio data', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filtered & paginated transactions
  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions

    if (txSearch.trim()) {
      const search = txSearch.toLowerCase()
      filtered = filtered.filter(
        (tx) =>
          tx.coinName?.toLowerCase().includes(search) ||
          tx.coinSymbol?.toLowerCase().includes(search)
      )
    }

    if (txTypeFilter !== 'ALL') {
      filtered = filtered.filter((tx) => tx.type === txTypeFilter)
    }

    return filtered
  }, [allTransactions, txSearch, txTypeFilter])

  const totalTxPages = Math.max(1, Math.ceil(filteredTransactions.length / TX_PER_PAGE))
  const safeTxPage = Math.min(txPage, totalTxPages)
  const paginatedTransactions = filteredTransactions.slice(
    (safeTxPage - 1) * TX_PER_PAGE,
    safeTxPage * TX_PER_PAGE
  )

  const openBuyModal = (coin) => {
    if (!user) {
      setMessage('Please login to buy coins')
      onNavigate('login')
      return
    }
    setTradeModal({ show: true, type: 'BUY', coin })
    setQuantity('')
    setTradeResult(null)
  }

  const openSellModal = (coin) => {
    if (!user) {
      setMessage('Please login to sell coins')
      onNavigate('login')
      return
    }
    setTradeModal({ show: true, type: 'SELL', coin })
    setQuantity('')
    setTradeResult(null)
  }

  const closeTradeModal = () => {
    setTradeModal({ show: false, type: 'BUY', coin: null })
    setQuantity('')
    setConfirmModal(false)
    setTradeResult(null)
  }

  // Helper to get coin price from either a coin object or a portfolio holding
  const getTradeCoinPrice = (coin) => {
    return coin.currentPrice || coin.coinId?.currentPrice || coin.price || 0
  }

  // Helper to get coin ID from either a coin object or a portfolio holding
  const getTradeCoinId = (coin) => {
    return coin.coinId?._id || coin.coinId || coin._id
  }

  const handleConfirmTrade = async () => {
    const qty = parseFloat(quantity)
    if (!qty || qty <= 0) {
      setMessage('Please enter a valid quantity')
      return
    }

    setConfirmModal(false)

    try {
      const price = getTradeCoinPrice(tradeModal.coin)
      const coinId = getTradeCoinId(tradeModal.coin)
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

      // Reload data
      await loadData()
      setMessage(result.message || 'Trade executed successfully')
    } catch (error) {
      setTradeResult({
        success: false,
        message: error.message || 'Trade failed',
      })
      setMessage(error.message || 'Trade failed')
    }
  }

  const handleBuySellClick = () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      setMessage('Please enter a valid quantity')
      return
    }
    setConfirmModal(true)
  }

  const getCoinPrice = (coin) => {
    // Try to find price from coins list
    const match = coins.find(
      (c) => c._id === (coin.coinId?._id || coin.coinId) || c.name === coin.coinName
    )
    return match?.currentPrice || coin.currentPrice || 0
  }

  const getHoldingQuantity = (coinId) => {
    if (!portfolio?.coins) return 0
    const holding = portfolio.coins.find(
      (c) => c.coinId?.toString() === coinId?.toString() || c.coinId?._id === coinId
    )
    return holding?.quantity || 0
  }

  // Calculate total bought quantity per coin from transaction history
  const totalBoughtPerCoin = useMemo(() => {
    const totals = {}
    if (allTransactions.length > 0) {
      allTransactions.forEach((tx) => {
        const coinKey = tx.coinId?._id || tx.coinId || tx.coinName
        if (!totals[coinKey]) {
          totals[coinKey] = { bought: 0, sold: 0 }
        }
        if (tx.type === 'BUY') {
          totals[coinKey].bought += tx.quantity
        } else if (tx.type === 'SELL') {
          totals[coinKey].sold += tx.quantity
        }
      })
    }
    return totals
  }, [allTransactions])

  const getTotalBought = (coinId, coinName) => {
    const key = coinId || coinName
    return totalBoughtPerCoin[key]?.bought || 0
  }

  const formatQuantity = (qty) => {
    if (!qty || qty === 0) return '0'
    if (qty < 0.0001) return qty.toExponential(4)
    return qty.toFixed(8).replace(/\.?0+$/, '')
  }

  // Helper to format INR
  const toINR = (usd) => `₹${(usd * 83).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

  // Helper to format USD
  const toUSD = (usd) => `$${usd.toLocaleString('en-US', { maximumFractionDigits: 2 })}`

  // Helper: get PnL percentage for progress bar
  const getPnlPercent = (pnl, investment) => {
    if (!investment || investment === 0) return 0
    return Math.min(Math.abs((pnl / investment) * 100), 100)
  }

  if (loading) {
    return (
      <section className="page-section">
        <div className="loader">
          <div className="loader-ring" />
          <span>Loading portfolio...</span>
        </div>
      </section>
    )
  }

  const totalInvestment = summary?.totalInvestment || 0
  const currentValue = summary?.currentPortfolioValue || 0
  const profitLoss = summary?.totalProfitLoss || 0
  const roi = summary?.totalProfitLossPercentage || 0
  const cashBalance = summary?.cash || portfolio?.cash || 1000000
  const totalAssets = currentValue + cashBalance
  const coinsCount = portfolio?.coins?.length || 0

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">💰 Virtual Wallet</p>
          <h2>Portfolio Dashboard</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {coinsCount > 0 && (
            <span className="coin-count-badge">
              🪙 <strong>{coinsCount}</strong> Coins
            </span>
          )}
          <button className="ghost-btn" onClick={loadData}>
            Refresh
          </button>
        </div>
      </div>

      {/* Wallet Balance Card */}
      <div className="wallet-card">
        <div className="wallet-balance">
          <p className="eyebrow">Wallet Balance</p>
          <h1 className="balance-amount">{toINR(cashBalance)}</h1>
          <p className="balance-usd">≈ {toUSD(cashBalance)}</p>
        </div>
        <div className="wallet-stats">
          <div className="stat-item">
            <span className="stat-label">Total Investment</span>
            <strong className="stat-value">{toINR(totalInvestment)}</strong>
          </div>
          <div className="stat-item">
            <span className="stat-label">Current Value</span>
            <strong className="stat-value">{toINR(currentValue)}</strong>
          </div>
          <div className="stat-item">
            <span className="stat-label">Profit / Loss</span>
            <strong className={`stat-value ${profitLoss >= 0 ? 'positive' : 'negative'}`}>
              {profitLoss >= 0 ? '+' : ''}{toINR(profitLoss)}
            </strong>
          </div>
          <div className="stat-item">
            <span className="stat-label">ROI</span>
            <strong className={`stat-value ${roi >= 0 ? 'positive' : 'negative'}`}>
              {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
            </strong>
          </div>
        </div>
      </div>

      {/* Total Portfolio Value Card (NEW) */}
      <div className="portfolio-value-card">
        <div className="portfolio-value-left">
          <span className="label">Total Portfolio Value</span>
          <span className="amount">{toINR(totalAssets)}</span>
          <p className="balance-usd" style={{ margin: 0 }}>≈ {toUSD(totalAssets)}</p>
        </div>
        <div className="portfolio-value-right">
          <div className="value-stat">
            <span className="label">Cash</span>
            <span className="number">{toUSD(cashBalance)}</span>
          </div>
          <div className="value-stat">
            <span className="label">Invested</span>
            <span className="number">{toUSD(totalInvestment)}</span>
          </div>
          <div className="value-stat">
            <span className="label">Return</span>
            <span className={`number ${profitLoss >= 0 ? 'positive' : 'negative'}`}>
              {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div className={`trade-message ${message.includes('successful') || message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
          <button className="ghost-btn small" onClick={() => setMessage('')}>✕</button>
        </div>
      )}

      {/* Holdings */}
      <div className="section-heading">
        <div>
          <p className="eyebrow">Your Holdings</p>
          <h3>Portfolio Coins</h3>
        </div>
      </div>

      <div className="holdings-list">
        {(!portfolio?.coins || portfolio.coins.length === 0) ? (
          <div className="empty-state">
            <p>No holdings yet. Buy your first cryptocurrency!</p>
          </div>
        ) : (
          portfolio.coins.map((holding) => {
            const price = getCoinPrice(holding)
            const holdingValue = holding.quantity * price
            const avgCost = holding.quantity * holding.averageBuyPrice
            const holdingPnl = holdingValue - avgCost
            const holdingRoi = avgCost > 0 ? ((price - holding.averageBuyPrice) / holding.averageBuyPrice) * 100 : 0
            const totalBought = getTotalBought(holding.coinId?._id || holding.coinId, holding.coinName)
            const pnlPercent = getPnlPercent(holdingPnl, avgCost)
            const pnlColor = holdingPnl >= 0 ? 'positive' : 'negative'

            return (
              <div key={holding._id || holding.coinId} className="holding-card">
                <div className="holding-info">
                  <div className="holding-name">
                    <strong>{holding.coinName}</strong>
                    <span className="holding-symbol">{holding.coinSymbol}</span>
                    <span className={`pnl-chip ${pnlColor}`} style={{ marginLeft: 'auto' }}>
                      {holdingRoi >= 0 ? '↑' : '↓'} {holdingRoi >= 0 ? '+' : ''}{holdingRoi.toFixed(2)}%
                    </span>
                  </div>
                  <div className="holding-details">
                    <div className="holding-detail">
                      <span>Total Bought 🛒</span>
                      <strong>{formatQuantity(totalBought)}</strong>
                    </div>
                    <div className="holding-detail">
                      <span>Remaining 📦</span>
                      <strong>{formatQuantity(holding.quantity)}</strong>
                    </div>
                    <div className="holding-detail">
                      <span>Avg Price</span>
                      <strong>{toUSD(holding.averageBuyPrice)}</strong>
                    </div>
                    <div className="holding-detail">
                      <span>Current Price</span>
                      <strong>{toUSD(price)}</strong>
                    </div>
                    <div className="holding-detail">
                      <span>Value</span>
                      <strong>{toUSD(holdingValue)}</strong>
                    </div>
                    <div className="holding-detail">
                      <span>P/L</span>
                      <strong className={pnlColor}>
                        {holdingPnl >= 0 ? '+' : ''}{toUSD(holdingPnl)}
                      </strong>
                    </div>
                  </div>
                  {/* PnL Progress Bar (NEW) */}
                  <div className="holding-progress">
                    <div className="progress-bar-wrapper">
                      <div className="progress-bar">
                        <div
                          className={`progress-bar-fill ${pnlColor}`}
                          style={{ width: `${pnlPercent}%` }}
                        />
                      </div>
                      <div className="progress-labels">
                        <span>{holdingPnl >= 0 ? 'Profit' : 'Loss'}</span>
                        <span>{pnlPercent.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="holding-actions">
                  <button className="buy-btn" onClick={() => openBuyModal(holding)}>
                    Buy
                  </button>
                  <button className="sell-btn" onClick={() => openSellModal(holding)}>
                    Sell
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Remaining Coins Summary Section (NEW) */}
      {portfolio?.coins && portfolio.coins.length > 0 && (
        <>
          <div className="section-heading">
            <div>
              <p className="eyebrow">📊 Remaining Coins Overview</p>
              <h3>All Holdings at a Glance</h3>
            </div>
          </div>
          <div className="remaining-coins-grid">
            {portfolio.coins.map((holding) => {
              const price = getCoinPrice(holding)
              const holdingValue = holding.quantity * price
              return (
                <div key={holding._id || holding.coinId} className="remaining-coin-card">
                  <div className="remaining-coin-header">
                    <h4>{holding.coinName}</h4>
                    <span>{holding.coinSymbol}</span>
                  </div>
                  <div className="remaining-coin-qty">{formatQuantity(holding.quantity)}</div>
                  <div className="remaining-coin-value">{toUSD(holdingValue)}</div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* All Coins - Quick Buy/Sell */}
      <div className="section-heading">
        <div>
          <p className="eyebrow">Market</p>
          <h3>Quick Trade</h3>
        </div>
      </div>

      <div className="coin-grid">
        {coins.slice(0, 12).map((coin) => {
          const holdingQty = getHoldingQuantity(coin._id)
          return (
            <div key={coin._id} className="coin-card">
              <div className="coin-card-top">
                <div>
                  <h3>{coin.name}</h3>
                  <p>{coin.symbol}</p>
                </div>
                {holdingQty > 0 && <span className="holding-badge">{holdingQty.toFixed(4)}</span>}
              </div>
              <p className="price">{toUSD(coin.currentPrice || coin.price || 0)}</p>
              <div className="coin-meta">
                <span className={coin.change24h >= 0 ? 'positive' : 'negative'}>
                  {coin.change24h >= 0 ? '+' : ''}{coin.change24h || 0}%
                </span>
              </div>
              <div className="trade-buttons">
                <button className="buy-btn" onClick={() => openBuyModal(coin)}>Buy</button>
                <button
                  className="sell-btn"
                  onClick={() => openSellModal(coin)}
                  disabled={holdingQty <= 0}
                >
                  Sell
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Transaction History - Full with Search & Pagination (ENHANCED) */}
      <div className="section-heading">
        <div>
          <p className="eyebrow">📜 Transaction History</p>
          <h3>All Activity ({filteredTransactions.length})</h3>
        </div>
      </div>

      {/* Filter Bar (NEW) */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by coin name..."
          value={txSearch}
          onChange={(e) => { setTxSearch(e.target.value); setTxPage(1) }}
        />
        <select
          value={txTypeFilter}
          onChange={(e) => { setTxTypeFilter(e.target.value); setTxPage(1) }}
        >
          <option value="ALL">All Types</option>
          <option value="BUY">Buy Only</option>
          <option value="SELL">Sell Only</option>
        </select>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <p>No transactions found {txSearch || txTypeFilter !== 'ALL' ? 'matching your filters' : 'yet. Start buying and selling!'}</p>
        </div>
      ) : (
        <>
          <div className="transaction-table-wrapper">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Coin</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Price (USD)</th>
                  <th>Price (INR)</th>
                  <th>Total (INR)</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((tx) => {
                  const txDate = new Date(tx.transactionDate || tx.createdAt)
                  return (
                    <tr key={tx._id}>
                      <td className="tx-date">
                        {txDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="tx-coin">
                        <strong>{tx.coinName}</strong>
                        <span className="tx-symbol">{tx.coinSymbol}</span>
                      </td>
                      <td>
                        <span className={`tx-type ${tx.type === 'BUY' ? 'tx-buy' : 'tx-sell'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="tx-qty">{tx.quantity.toFixed(6)}</td>
                      <td className="tx-price">{toUSD(tx.price)}</td>
                      <td className="tx-price-inr">{toINR(tx.price)}</td>
                      <td className="tx-total">{toINR(tx.totalAmount)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination (NEW) */}
          {totalTxPages > 1 && (
            <div className="pagination">
              <button
                disabled={safeTxPage <= 1}
                onClick={() => setTxPage((p) => Math.max(1, p - 1))}
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(totalTxPages, 5) }, (_, i) => {
                let pageNum
                if (totalTxPages <= 5) {
                  pageNum = i + 1
                } else if (safeTxPage <= 3) {
                  pageNum = i + 1
                } else if (safeTxPage >= totalTxPages - 2) {
                  pageNum = totalTxPages - 4 + i
                } else {
                  pageNum = safeTxPage - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    className={safeTxPage === pageNum ? 'active' : ''}
                    onClick={() => setTxPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                )
              })}
              {totalTxPages > 5 && safeTxPage < totalTxPages - 2 && (
                <span className="page-info">... {totalTxPages}</span>
              )}
              <button
                disabled={safeTxPage >= totalTxPages}
                onClick={() => setTxPage((p) => Math.min(totalTxPages, p + 1))}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Trade Modal */}
      {tradeModal.show && (
        <div className="modal-overlay" onClick={closeTradeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeTradeModal}>✕</button>
            <h3>{tradeModal.type === 'BUY' ? 'Buy' : 'Sell'} {tradeModal.coin?.coinName || tradeModal.coin?.name}</h3>
            <p className="modal-subtitle">
              Current Price: ${getTradeCoinPrice(tradeModal.coin).toLocaleString()}
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
                      Total: ${(parseFloat(quantity) * getTradeCoinPrice(tradeModal.coin)).toFixed(2)}
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
              <p>Coin: <strong>{tradeModal.coin?.coinName || tradeModal.coin?.name}</strong></p>
              <p>Type: <strong>{tradeModal.type}</strong></p>
              <p>Quantity: <strong>{parseFloat(quantity)}</strong></p>
              <p>Price: <strong>${getTradeCoinPrice(tradeModal.coin).toLocaleString()}</strong></p>
              <p>Total: <strong>${(parseFloat(quantity) * getTradeCoinPrice(tradeModal.coin)).toFixed(2)}</strong></p>
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

export default Portfolio

