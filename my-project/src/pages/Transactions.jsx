import { useState, useEffect, useCallback } from 'react'
import { fetchTransactions } from '../api/api'

function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const loadTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchTransactions()
      setTransactions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load transactions', error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (value) => {
    return `₹${(value * 83).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
  }

  if (loading) {
    return (
      <section className="page-section">
        <div className="loader">
          <div className="loader-ring" />
          <span>Loading transactions...</span>
        </div>
      </section>
    )
  }

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">📜 Transaction History</p>
          <h2>All Transactions</h2>
        </div>
        <button className="ghost-btn" onClick={loadTransactions}>
          Refresh
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state">
          <p>No transactions yet. Start buying and selling cryptocurrencies!</p>
        </div>
      ) : (
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
              {transactions.map((tx) => (
                <tr key={tx._id}>
                  <td className="tx-date">{formatDate(tx.transactionDate || tx.createdAt)}</td>
                  <td className="tx-coin">
                    <strong>{tx.coinName}</strong>
                    <span className="tx-symbol">{tx.coinSymbol}</span>
                  </td>
                  <td>
                    <span className={`tx-type ${tx.type === 'BUY' ? 'tx-buy' : 'tx-sell'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="tx-qty">{tx.quantity.toFixed(8)}</td>
                  <td className="tx-price">${tx.price.toLocaleString()}</td>
                  <td className="tx-price-inr">{formatCurrency(tx.price)}</td>
                  <td className="tx-total">{formatCurrency(tx.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default Transactions

