const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return errorResponse(res, err.message, 400);
  }

  if (err.code === 'P2002') {
    return errorResponse(res, 'A record with this value already exists.', 409);
  }

  if (err.code === 'P2025') {
    return errorResponse(res, 'Record not found.', 404);
  }

  return errorResponse(res, err.message || 'Internal server error', err.statusCode || 500);
};

module.exports = errorHandler;
