import React from 'react'

const previewPredictions = [
  {
    coin: 'Bitcoin',
    symbol: 'BTC',
    icon: '₿',
    currentPrice: '$68,240',
    predictedPrice: '$72,000',
    recommendation: 'Buy',
    recommendationEmoji: '🟢',
    confidence: 91,
    reason: 'Breakout above key resistance with positive institutional flow.',
  },
  {
    coin: 'Ethereum',
    symbol: 'ETH',
    icon: '⟠',
    currentPrice: '$3,620',
    predictedPrice: '$4,100',
    recommendation: 'Hold',
    recommendationEmoji: '🟡',
    confidence: 84,
    reason: 'Layer-2 activity and staking inflows are supporting higher ranges.',
  },
  {
    coin: 'Solana',
    symbol: 'SOL',
    icon: '◎',
    currentPrice: '$183',
    predictedPrice: '$205',
    recommendation: 'Sell',
    recommendationEmoji: '🔴',
    confidence: 78,
    reason: 'Volume trends suggest growth potential if network activity stays strong.',
  },
]

function Home({ onNavigate }) {
  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">AI-powered crypto intelligence</p>
          <h1>Track prices, forecast trends, and stay ahead of the market.</h1>
          <p className="hero-text">
            Explore live crypto market sentiment, get daily predictions, and build a personalized watchlist in one place.
          </p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => onNavigate('dashboard')}>
              Explore Dashboard
            </button>
            <button className="ghost-btn" onClick={() => onNavigate('prediction')}>
              View Predictions
            </button>
          </div>
        </div>

        <div className="hero-panel">
          <div className="metric-card">
            <span>Market Pulse</span>
            <strong>+8.42%</strong>
            <p>Broader crypto momentum improving</p>
          </div>
          <div className="metric-card alt">
            <span>Prediction Score</span>
            <strong>87/100</strong>
            <p>Momentum favors breakout assets</p>
          </div>
        </div>
      </section>

      {/* ========== AI Prediction Preview Section ========== */}
      <section className="prediction-preview-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">AI forecast engine</p>
            <h2>AI Prediction Preview</h2>
          </div>
          <button className="ghost-btn" onClick={() => onNavigate('prediction')}>
            View All Predictions →
          </button>
        </div>

        <div className="prediction-preview-grid">
          {previewPredictions.map((item) => (
            <article key={item.coin} className="preview-card">
              <div className="preview-card-header">
                <span className="preview-card-icon">{item.icon}</span>
                <div>
                  <h3>{item.coin}</h3>
                  <span className="preview-card-symbol">{item.symbol}</span>
                </div>
              </div>

              <div className="preview-card-prices">
                <div className="preview-price-box">
                  <span>Current Price</span>
                  <strong>{item.currentPrice}</strong>
                </div>
                <div className="preview-price-box predicted">
                  <span>Predicted Price</span>
                  <strong>{item.predictedPrice}</strong>
                </div>
              </div>

              <div className="preview-card-rec">
                <span className={`preview-rec-badge ${item.recommendation.toLowerCase()}`}>
                  {item.recommendationEmoji} {item.recommendation}
                </span>
              </div>

              <div className="preview-card-confidence">
                <div className="confidence-label">
                  <span>Confidence</span>
                  <strong>{item.confidence}%</strong>
                </div>
                <div className="confidence-bar-track">
                  <div
                    className="confidence-bar-fill"
                    style={{ width: `${item.confidence}%` }}
                  />
                </div>
              </div>

              <p className="preview-card-reason">{item.reason}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

export default Home
