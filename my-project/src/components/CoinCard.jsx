function CoinCard({ coin, isFavorite, onToggleFavorite, onBuy, onSell }) {
  return (
    <article className="coin-card">
      <div className="coin-card-top">
        <div>
          <h3>{coin.name}</h3>
          <p>{coin.symbol}</p>
        </div>
        <button className="favorite-btn" onClick={() => onToggleFavorite(coin)}>
          {isFavorite ? '★' : '☆'}
        </button>
      </div>

      <p className="price">${coin.currentPrice || coin.price}</p>
      <div className="coin-meta">
        <span className={(coin.change24h || coin.change || 0) >= 0 ? 'positive' : 'negative'}>
          24h {(coin.change24h || coin.change || 0)}%
        </span>
        <span>Market cap {coin.marketCap || '—'}</span>
      </div>
      {(onBuy || onSell) && (
        <div className="trade-buttons">
          {onBuy && <button className="buy-btn" onClick={() => onBuy(coin)}>Buy</button>}
          {onSell && <button className="sell-btn" onClick={() => onSell(coin)}>Sell</button>}
        </div>
      )}
    </article>
  )
}

export default CoinCard
