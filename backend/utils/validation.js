// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Password validation
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Name validation
const isValidName = (name) => {
  return name && typeof name === 'string' && name.length >= 2;
};

// Validate email format
const validateEmail = (email) => {
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }
  if (!isValidEmail(email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  return { valid: true };
};

// Validate password
const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  return { valid: true };
};

// Validate name
const validateName = (name) => {
  if (!name) {
    return { valid: false, message: 'Name is required' };
  }
  if (name.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }
  return { valid: true };
};

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return id && id.match(/^[0-9a-fA-F]{24}$/);
};

// Validate number fields
const isValidNumber = (value) => {
  return typeof value === 'number' && value >= 0;
};

// Validate positive number
const isPositiveNumber = (value) => {
  return typeof value === 'number' && value > 0;
};

// Validate percentage (0-100)
const isValidPercentage = (value) => {
  return typeof value === 'number' && value >= 0 && value <= 100;
};

// Validate recommendation
const isValidRecommendation = (recommendation) => {
  return ['Buy', 'Sell', 'Hold'].includes(recommendation);
};

// Validate transaction type
const isValidTransactionType = (type) => {
  return ['BUY', 'SELL'].includes(type);
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidName,
  isValidObjectId,
  isValidNumber,
  isPositiveNumber,
  isValidPercentage,
  isValidRecommendation,
  isValidTransactionType,
  validateEmail,
  validatePassword,
  validateName
};
