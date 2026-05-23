const express = require('express');
const taskController = require('../controllers/task.controller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const {
  createTaskValidation,
  updateTaskValidation,
} = require('../validations/task.validation');

const router = express.Router();

router.use(authMiddleware);

router.post('/', roleMiddleware('ADMIN'), createTaskValidation, validate, taskController.createTask);
router.get('/project/:projectId', taskController.getTasksByProject);
router.get('/:id', taskController.getTaskById);
router.patch('/:id', updateTaskValidation, validate, taskController.updateTask);
router.delete('/:id', roleMiddleware('ADMIN'), taskController.deleteTask);

module.exports = router;
