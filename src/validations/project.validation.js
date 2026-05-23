const { body } = require('express-validator');

const createProjectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('description').optional().trim(),
];

const addMemberValidation = [
  body('userId').notEmpty().withMessage('User ID is required'),
];

module.exports = {
  createProjectValidation,
  addMemberValidation,
};
