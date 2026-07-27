import CoinCard from '../components/CoinCard'

function Favorites({ favorites, onToggleFavorite }) {
  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Your watchlist</p>
          <h2>Favorites</h2>
        </div>
      </div>

      <div className="coin-grid">
        {favorites.map((coin) => (
          <CoinCard
            key={coin._id}
            coin={{
              id: coin.coinId,
              name: coin.name,
              symbol: coin.symbol,
              price: coin.currentPrice || 'N/A',
              change: '0.0',
              marketCap: 'N/A',
            }}
            isFavorite
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  )
}

export default Favorites
