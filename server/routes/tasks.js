const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// GET /api/tasks?filter=all|active|completed
router.get('/', auth, (req, res) => {
  try {
    const filter = req.query.filter || 'all';
    const tasks = Task.findByUserId(req.user.id, filter);
    res.json(tasks);
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/tasks
router.post(
  '/',
  auth,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const task = Task.create({ userId: req.user.id, ...req.body });
      res.status(201).json(task);
    } catch (err) {
      console.error('Create task error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/tasks/:id
router.put(
  '/:id',
  auth,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const existing = Task.findByIdAndUserId(req.params.id, req.user.id);
      if (!existing) return res.status(404).json({ message: 'Task not found' });

      const task = Task.update(req.params.id, req.user.id, req.body);
      res.json(task);
    } catch (err) {
      console.error('Update task error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PATCH /api/tasks/:id/toggle — toggle complete status
router.patch('/:id/toggle', auth, (req, res) => {
  try {
    const existing = Task.findByIdAndUserId(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ message: 'Task not found' });

    const task = Task.toggleComplete(req.params.id, req.user.id);
    res.json(task);
  } catch (err) {
    console.error('Toggle task error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', auth, (req, res) => {
  try {
    const existing = Task.findByIdAndUserId(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ message: 'Task not found' });

    Task.delete(req.params.id, req.user.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
