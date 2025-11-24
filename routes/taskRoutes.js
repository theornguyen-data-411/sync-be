const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const taskController = require('../controller/taskController');

// Protect all task routes
router.use(authMiddleware);

// CRUD endpoints
router.post('/', taskController.createTask);
router.get('/', taskController.listTasks);
// AI scoring preview without persisting
router.post('/ai/preview', taskController.previewScore);

router.get('/:id', taskController.getTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;

