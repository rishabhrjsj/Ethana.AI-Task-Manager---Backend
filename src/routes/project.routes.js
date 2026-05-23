const express = require('express');
const projectController = require('../controllers/project.controller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const {
  createProjectValidation,
  addMemberValidation,
} = require('../validations/project.validation');

const router = express.Router();

router.use(authMiddleware);

router.post('/', roleMiddleware('ADMIN'), createProjectValidation, validate, projectController.createProject);
router.get('/', projectController.getAllProjects);
router.get('/users/all', roleMiddleware('ADMIN'), projectController.getAllUsers);
router.get('/:id', projectController.getProjectById);
router.get('/:id/members', projectController.getMembers);
router.post(
  '/:id/members',
  roleMiddleware('ADMIN'),
  addMemberValidation,
  validate,
  projectController.addMember
);
router.delete(
  '/:id/members/:userId',
  roleMiddleware('ADMIN'),
  projectController.removeMember
);

module.exports = router;
