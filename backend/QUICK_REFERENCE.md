# Quick Reference Guide - Cryptocurrency Prediction API

## 🚀 Getting Started

### 1. Setup
```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB URI and JWT secret
```

### 2. Run Server
```bash
npm run dev    # Development with auto-reload
npm start      # Production mode
```

### 3. API Base URL
```
http://localhost:5000/api
```

---

## 🔐 Authentication Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "passwordConfirm": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

## 📝 Protected Endpoints Usage

All protected endpoints require the Authorization header:

```bash
curl -X GET http://localhost:5000/api/predictions/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## 💱 Common Tasks

### Get All Coins
```bash
# Get first 20 coins
curl "http://localhost:5000/api/coins?page=1&limit=20"

# Search coins
curl "http://localhost:5000/api/coins?search=bitcoin"

# Get trending
curl "http://localhost:5000/api/coins/trending?limit=10"

# Get top gainers
curl "http://localhost:5000/api/coins/gainers?limit=10"
```

### Get Specific Coin
```bash
# By ID
curl "http://localhost:5000/api/coins/64a1b2c3d4e5f6g7h8i9j0k1"

# By Symbol
curl "http://localhost:5000/api/coins/symbol/BTC"

# Search
curl "http://localhost:5000/api/coins/search/bit?limit=5"
```

---

### Portfolio Operations

#### Get User Portfolio
```bash
curl -X GET http://localhost:5000/api/portfolio \
  -H "Authorization: Bearer TOKEN"
```

#### Buy Coin
```bash
curl -X POST http://localhost:5000/api/portfolio/buy \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "coinId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "quantity": 0.5,
    "price": 42000
  }'
```

#### Sell Coin
```bash
curl -X POST http://localhost:5000/api/portfolio/sell \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "coinId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "quantity": 0.25,
    "price": 45000
  }'
```

#### Get Portfolio Summary
```bash
curl -X GET http://localhost:5000/api/portfolio/summary \
  -H "Authorization: Bearer TOKEN"
```

---

### Price Predictions

#### Create Prediction
```bash
curl -X POST http://localhost:5000/api/predictions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "coinId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "predictedPrice": 50000,
    "confidence": 85,
    "recommendation": "Buy",
    "notes": "Based on technical analysis"
  }'
```

#### Get Prediction History
```bash
curl -X GET "http://localhost:5000/api/predictions/history?page=1&limit=10&status=pending" \
  -H "Authorization: Bearer TOKEN"
```

---

### Transactions

#### Create Transaction
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "coinId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "type": "BUY",
    "quantity": 1,
    "price": 42000,
    "fee": 50
  }'
```

#### Get Transaction History
```bash
curl -X GET "http://localhost:5000/api/transactions?page=1&limit=20&type=BUY" \
  -H "Authorization: Bearer TOKEN"
```

#### Get Transaction Stats
```bash
curl -X GET http://localhost:5000/api/transactions/stats \
  -H "Authorization: Bearer TOKEN"
```

---

### Favorites

#### Add to Favorites
```bash
curl -X POST http://localhost:5000/api/favorites \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "coinId": "64a1b2c3d4e5f6g7h8i9j0k1"
  }'
```

#### Get Favorites
```bash
curl -X GET "http://localhost:5000/api/favorites?page=1&limit=20" \
  -H "Authorization: Bearer TOKEN"
```

#### Toggle Favorite
```bash
curl -X POST http://localhost:5000/api/favorites/toggle/64a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer TOKEN"
```

#### Check if Favorited
```bash
curl -X GET http://localhost:5000/api/favorites/check/64a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer TOKEN"
```

#### Remove Favorite
```bash
curl -X DELETE http://localhost:5000/api/favorites/64a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer TOKEN"
```

---

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### List Response with Pagination
```json
{
  "success": true,
  "count": 20,
  "total": 100,
  "pages": 5,
  "currentPage": 1,
  "items": [ /* array of items */ ]
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🔄 Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### Filtering
- `search` - Search by name/symbol
- `status` - Filter by status (pending, completed, expired)
- `type` - Filter by type (BUY, SELL)
- `coinId` - Filter by specific coin

### Sorting
- `sortBy` - Sort field with direction (e.g., `-rank`, `change24h`)

---

## ✅ Validation Rules

| Field | Rules |
|-------|-------|
| Email | Valid email format, unique |
| Password | Minimum 6 characters |
| Name | Minimum 2 characters |
| Confidence | 0-100 (percentage) |
| Recommendation | Buy, Sell, or Hold |
| Transaction Type | BUY or SELL |
| Quantity | Must be positive number |
| Price | Must be positive number |

---

## 🐛 Common Issues & Solutions

### 401 Unauthorized
- Ensure token is included in Authorization header
- Check token hasn't expired (30 days)
- Token format should be: `Bearer <token>`

### 400 Bad Request
- Check all required fields are provided
- Validate field formats (email, numbers, enums)
- Check query parameters syntax

### 404 Not Found
- Verify the ID is valid (ObjectId format)
- Ensure the resource exists in database

### 500 Internal Server Error
- Check MongoDB connection
- Review server logs
- Verify .env variables are set correctly

---

## 📚 Documentation Files

- **API_DOCUMENTATION.md** - Complete API reference
- **IMPLEMENTATION_SUMMARY.md** - Feature overview
- **.env.example** - Environment setup template

---

## 🔑 Key Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/crypto-prediction
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

---

## 📖 API Endpoint Summary

```
AUTH (4 endpoints)
├── POST   /auth/register
├── POST   /auth/login
├── GET    /auth/profile
└── PUT    /auth/profile

COINS (8 endpoints)
├── GET    /coins
├── GET    /coins/:id
├── GET    /coins/symbol/:symbol
├── GET    /coins/search/:query
├── GET    /coins/trending
├── GET    /coins/gainers
├── GET    /coins/losers
└── GET    /coins/:id/history

PREDICTIONS (5 endpoints)
├── POST   /predictions
├── GET    /predictions/history
├── GET    /predictions/:id
├── PUT    /predictions/:id
└── DELETE /predictions/:id

PORTFOLIO (5 endpoints)
├── GET    /portfolio
├── POST   /portfolio/add-coin
├── POST   /portfolio/buy
├── POST   /portfolio/sell
└── GET    /portfolio/summary

TRANSACTIONS (4 endpoints)
├── POST   /transactions
├── GET    /transactions
├── GET    /transactions/:id
└── GET    /transactions/stats

FAVORITES (6 endpoints)
├── POST   /favorites
├── GET    /favorites
├── POST   /favorites/toggle/:coinId
├── GET    /favorites/check/:coinId
├── GET    /favorites/count
└── DELETE /favorites/:coinId
```

---

**Total: 40+ fully functional endpoints with authentication, validation, and error handling**
