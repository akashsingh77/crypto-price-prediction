import PredictionCard from '../components/PredictionCard'

function Prediction() {
  const predictions = [
    {
      asset: 'Bitcoin',
      confidence: 91,
      currentPrice: '68,240',
      predictedPrice: '72,000',
      nextDay: '68,900',
      nextWeek: '71,200',
      signal: 'Buy',
      riskLevel: 'Medium',
      history: ['+4.2% last week', '+2.1% this week', '+1.8% today'],
      reason: 'Breakout above key resistance with positive institutional flow.',
      target: '72,000',
      window: 'Next 7 days',
    },
    {
      asset: 'Ethereum',
      confidence: 84,
      currentPrice: '3,620',
      predictedPrice: '4,100',
      nextDay: '3,690',
      nextWeek: '3,980',
      signal: 'Hold',
      riskLevel: 'Low',
      history: ['+1.1% last week', 'Flat this week', '+0.6% today'],
      reason: 'Layer-2 activity and staking inflows are supporting higher ranges.',
      target: '4,100',
      window: 'Next 10 days',
    },
    {
      asset: 'Solana',
      confidence: 78,
      currentPrice: '183',
      predictedPrice: '205',
      nextDay: '188',
      nextWeek: '198',
      signal: 'Sell',
      riskLevel: 'High',
      history: ['-2.3% last week', '-1.5% this week', '-0.8% today'],
      reason: 'Volume trends suggest growth potential if network activity stays strong.',
      target: '205',
      window: 'Next 14 days',
    },
  ]

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Forecast engine</p>
          <h2>Market predictions</h2>
        </div>
      </div>

      <div className="prediction-list">
        {predictions.map((item) => (
          <PredictionCard key={item.asset} item={item} />
        ))}
      </div>
    </section>
  )
}

export default Prediction
