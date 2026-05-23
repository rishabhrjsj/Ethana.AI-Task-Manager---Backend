const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');

const signup = async (req, res, next) => {
  try {
    const result = await authService.signup(req.body);
    return successResponse(res, result, 'Account created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return successResponse(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => {
  return successResponse(res, { user: req.user }, 'User profile fetched');
};

module.exports = { signup, login, getMe };
