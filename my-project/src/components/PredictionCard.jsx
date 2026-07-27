import { useState } from 'react'
import { placeBuyTrade } from '../api/api'

function PredictionCard({ item }) {
  const [status, setStatus] = useState('')
  const signalClass = item.signal?.toLowerCase() || 'hold'
  const riskClass = item.riskLevel?.toLowerCase() || 'medium'

  const handleBuy = async () => {
    try {
      setStatus('Processing...')
      const result = await placeBuyTrade({
        symbol: item.symbol || item.asset?.slice(0, 3).toUpperCase() || 'BTC',
        name: item.asset,
        quantity: 0.1,
        price: Number(item.predictedPrice.replace(/,/g, '')),
        type: 'buy',
      })
      setStatus(result.message || 'Buy order placed successfully')
    } catch (error) {
      setStatus(error.message || 'Unable to place buy order')
    }
  }

  return (
    <article className="prediction-card">
      <div className="prediction-title">
        <div>
          <h3>{item.asset}</h3>
          <p className="muted">{item.reason}</p>
        </div>
        <span className="prediction-badge">{item.confidence}% confidence</span>
      </div>

      <div className="prediction-metrics">
        <div className="metric-box">
          <span>Current Price</span>
          <strong>${item.currentPrice}</strong>
        </div>
        <div className="metric-box">
          <span>Predicted Price</span>
          <strong>${item.predictedPrice}</strong>
        </div>
        <div className="metric-box">
          <span>Next Day</span>
          <strong>${item.nextDay}</strong>
        </div>
        <div className="metric-box">
          <span>Next Week</span>
          <strong>${item.nextWeek}</strong>
        </div>
        <div className="metric-box">
          <span>Confidence Score</span>
          <strong>{item.confidence}/100</strong>
        </div>
        <div className="metric-box signal-box">
          <span>Signal</span>
          <strong className={`signal ${signalClass}`}>{item.signal}</strong>
        </div>
        <div className="metric-box">
          <span>Risk Level</span>
          <strong className={`risk ${riskClass}`}>{item.riskLevel}</strong>
        </div>
      </div>

      {item.history && (
        <div className="history-box">
          <p className="eyebrow">Prediction History</p>
          <ul>
            {item.history.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="prediction-footer">
        <button className="primary-btn" onClick={handleBuy}>
          Buy Now
        </button>
        <span>{item.window}</span>
      </div>
      {status && <p className="trade-status">{status}</p>}
    </article>
  )
}

export default PredictionCard
