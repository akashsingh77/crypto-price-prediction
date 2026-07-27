# Cryptocurrency Price Prediction API Documentation

## Overview
This is a comprehensive REST API for a cryptocurrency price prediction application built with Express.js, MongoDB, and Mongoose.

## Project Structure
```
backend/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/          # MongoDB schemas
├── routes/          # API routes
├── services/        # Business logic services
├── utils/           # Utility functions
└── app.js          # Express application
```

## MongoDB Models

### 1. User Model
- **Fields**: name, email (unique), password (hashed), role, profileImage, bio, phone, isVerified, timestamps
- **Methods**: matchPassword() for password comparison
- **Hooks**: Pre-save hook for password hashing with bcryptjs

### 2. Coin Model
- **Fields**: name, symbol (unique), currentPrice, marketCap, volume24h, change24h, change7d, change30d, image, description, rank, lastUpdated, timestamps
- **Indexes**: symbol, name (text search)

### 3. Prediction Model
- **Fields**: userId (ref: User), coinId (ref: Coin), coinSymbol, currentPrice, predictedPrice, actualPrice, confidence (0-100), recommendation (Buy/Sell/Hold), predictionDate, expiryDate, accuracy, status (pending/completed/expired), notes, timestamps
- **Indexes**: userId + predictionDate, coinId, status

### 4. Portfolio Model
- **Fields**: userId (unique), coins (array with coinId, quantity, averageBuyPrice, currentValue, profitLoss), totalInvestment, currentPortfolioValue, totalProfitLoss, totalProfitLossPercentage, cash, timestamps

### 5. Transaction Model
- **Fields**: userId, coinId, coinSymbol, coinName, type (BUY/SELL), quantity, price, totalAmount, fee, netAmount, transactionDate, status (pending/completed/cancelled), notes, timestamps
- **Indexes**: userId + transactionDate, coinId, type

### 6. Favorite Model
- **Fields**: userId, coinId, coinSymbol, coinName, timestamps
- **Unique Index**: userId + coinId

## API Endpoints

### Authentication Endpoints

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
}

Response: { success: true, token: "jwt_token", user: {...} }
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { success: true, token: "jwt_token", user: {...} }
```

#### Get Profile
```
GET /api/auth/profile
Authorization: Bearer <token>

Response: { success: true, user: {...} }
```

#### Update Profile
```
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "bio": "Crypto enthusiast",
  "phone": "+1234567890",
  "profileImage": "url_to_image"
}

Response: { success: true, message: "Profile updated successfully", user: {...} }
```

### Coins Endpoints

#### Get All Coins (Paginated)
```
GET /api/coins?page=1&limit=20&search=bitcoin&sortBy=-rank

Response: { success: true, count: 20, total: 100, pages: 5, currentPage: 1, coins: [...] }
```

#### Get Coin Details
```
GET /api/coins/:id

Response: { success: true, coin: {...} }
```

#### Get Coin by Symbol
```
GET /api/coins/symbol/BTC

Response: { success: true, coin: {...} }
```

#### Search Coins
```
GET /api/coins/search/bit?limit=10

Response: { success: true, count: 5, coins: [...] }
```

#### Get Trending Coins
```
GET /api/coins/trending?limit=10

Response: { success: true, count: 10, coins: [...] }
```

#### Get Top Gainers
```
GET /api/coins/gainers?limit=10

Response: { success: true, count: 10, coins: [...] }
```

#### Get Top Losers
```
GET /api/coins/losers?limit=10

Response: { success: true, count: 10, coins: [...] }
```

#### Get Historical Prices
```
GET /api/coins/:id/history?days=7

Response: { success: true, message: "Historical prices retrieved", data: {...} }
```

### Predictions Endpoints

#### Create Prediction
```
POST /api/predictions
Authorization: Bearer <token>
Content-Type: application/json

{
  "coinId": "coin_id",
  "predictedPrice": 50000,
  "confidence": 85,
  "recommendation": "Buy",
  "notes": "Based on technical analysis"
}

Response: { success: true, message: "Prediction created successfully", prediction: {...} }
```

#### Get Prediction History
```
GET /api/predictions/history?page=1&limit=10&status=pending&coinId=coin_id
Authorization: Bearer <token>

Response: { success: true, count: 10, total: 50, pages: 5, currentPage: 1, predictions: [...] }
```

#### Get Single Prediction
```
GET /api/predictions/:id
Authorization: Bearer <token>

Response: { success: true, prediction: {...} }
```

#### Update Prediction
```
PUT /api/predictions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "predictedPrice": 52000,
  "confidence": 90,
  "recommendation": "Buy"
}

Response: { success: true, message: "Prediction updated successfully", prediction: {...} }
```

#### Delete Prediction
```
DELETE /api/predictions/:id
Authorization: Bearer <token>

Response: { success: true, message: "Prediction deleted successfully" }
```

### Portfolio Endpoints

#### Get Portfolio
```
GET /api/portfolio
Authorization: Bearer <token>

Response: { success: true, portfolio: {...} }
```

#### Add Coin to Portfolio
```
POST /api/portfolio/add-coin
Authorization: Bearer <token>
Content-Type: application/json

{
  "coinId": "coin_id",
  "quantity": 10,
  "averageBuyPrice": 45000
}

Response: { success: true, message: "Coin added to portfolio successfully", portfolio: {...} }
```

#### Buy Coin
```
POST /api/portfolio/buy
Authorization: Bearer <token>
Content-Type: application/json

{
  "coinId": "coin_id",
  "quantity": 5,
  "price": 48000
}

Response: { success: true, message: "Coin purchased successfully", portfolio: {...} }
```

#### Sell Coin
```
POST /api/portfolio/sell
Authorization: Bearer <token>
Content-Type: application/json

{
  "coinId": "coin_id",
  "quantity": 3,
  "price": 50000
}

Response: { success: true, message: "Coin sold successfully", saleAmount: 150000, portfolio: {...} }
```

#### Get Portfolio Summary
```
GET /api/portfolio/summary
Authorization: Bearer <token>

Response: { 
  success: true, 
  summary: {
    totalInvestment: 500000,
    currentPortfolioValue: 550000,
    totalProfitLoss: 50000,
    totalProfitLossPercentage: 10,
    cash: 450000,
    totalAssets: 1000000,
    coinsCount: 3
  }
}
```

### Transactions Endpoints

#### Create Transaction
```
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "coinId": "coin_id",
  "type": "BUY",
  "quantity": 5,
  "price": 48000,
  "fee": 50
}

Response: { success: true, message: "Transaction created successfully", transaction: {...} }
```

#### Get Transaction History
```
GET /api/transactions?page=1&limit=20&type=BUY&coinId=coin_id&status=completed
Authorization: Bearer <token>

Response: { success: true, count: 20, total: 100, pages: 5, currentPage: 1, transactions: [...] }
```

#### Get Single Transaction
```
GET /api/transactions/:id
Authorization: Bearer <token>

Response: { success: true, transaction: {...} }
```

#### Get Transaction Statistics
```
GET /api/transactions/stats
Authorization: Bearer <token>

Response: { 
  success: true, 
  stats: {
    totalTransactions: 50,
    totalBuys: 30,
    totalSells: 20,
    totalBuyAmount: 500000,
    totalSellAmount: 450000,
    totalFeesPaid: 1000
  }
}
```

### Favorites Endpoints

#### Add Favorite
```
POST /api/favorites
Authorization: Bearer <token>
Content-Type: application/json

{
  "coinId": "coin_id"
}

Response: { success: true, message: "Coin added to favorites", favorite: {...} }
```

#### Get Favorites
```
GET /api/favorites?page=1&limit=20
Authorization: Bearer <token>

Response: { success: true, count: 20, total: 50, pages: 3, currentPage: 1, favorites: [...] }
```

#### Check if Favorited
```
GET /api/favorites/check/:coinId
Authorization: Bearer <token>

Response: { success: true, isFavorited: true }
```

#### Get Favorite Count
```
GET /api/favorites/count
Authorization: Bearer <token>

Response: { success: true, count: 15 }
```

#### Toggle Favorite
```
POST /api/favorites/toggle/:coinId
Authorization: Bearer <token>

Response: { success: true, message: "Coin added/removed from favorites", isFavorited: true/false }
```

#### Remove Favorite
```
DELETE /api/favorites/:coinId
Authorization: Bearer <token>

Response: { success: true, message: "Coin removed from favorites" }
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

HTTP Status Codes:
- 200: OK
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

Token is obtained after successful login or registration and expires after 30 days.

## Validation

### User Input Validation
- Email: Must be valid email format
- Password: Minimum 6 characters
- Name: Minimum 2 characters
- Price: Must be positive number
- Quantity: Must be positive number
- Confidence: Between 0 and 100
- Recommendation: Must be Buy, Sell, or Hold
- Transaction Type: Must be BUY or SELL

### Database Validation
- Unique emails for users
- Unique symbols for coins
- Unique combination of userId + coinId for favorites
- ObjectId validation for all reference fields

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Create .env file from .env.example and set your values:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/crypto-prediction
   JWT_SECRET=your_secret_key
   NODE_ENV=development
   ```

3. Ensure MongoDB is running

4. Start the server:
   ```
   npm start
   ```
   
   Or for development with auto-reload:
   ```
   npm run dev
   ```

## Features Implemented

- ✅ User Authentication (Register, Login)
- ✅ User Profile Management
- ✅ Coin Management (CRUD, Search, Trending, Top Gainers/Losers)
- ✅ Price Predictions with Confidence Levels
- ✅ Portfolio Management (Buy, Sell, Track Holdings)
- ✅ Transaction History
- ✅ Favorite Coins
- ✅ Profit/Loss Calculations
- ✅ Password Hashing with bcryptjs
- ✅ JWT Authentication
- ✅ Input Validation
- ✅ Error Handling
- ✅ Pagination
- ✅ Filtering and Sorting
- ✅ Database Indexing for Performance

## Future Enhancements

- Email verification
- Two-factor authentication
- Real-time price updates via WebSocket
- Advanced analytics and charts
- Prediction accuracy tracking
- Notification system
- Social features (follow users, share predictions)
- API rate limiting
- Webhooks for transaction updates
