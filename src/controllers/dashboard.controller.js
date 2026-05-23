const dashboardService = require('../services/dashboard.service');
const { successResponse } = require('../utils/response');

const getDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboard(req.user);
    return successResponse(res, data, 'Dashboard data fetched successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
