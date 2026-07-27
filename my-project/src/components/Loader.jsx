function Loader({ message = 'Loading insights...' }) {
  return (
    <div className="loader">
      <div className="loader-ring" />
      <p>{message}</p>
    </div>
  )
}

export default Loader
