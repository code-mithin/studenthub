const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET /api/profile — get current user's profile
router.get('/', auth, (req, res) => {
  try {
    const user = User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/profile — update profile
router.put(
  '/',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('department').optional().trim(),
    body('semester').optional().isInt({ min: 1, max: 12 }).withMessage('Semester must be between 1 and 12'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, department, semester } = req.body;

    try {
      const user = User.update(req.user.id, {
        name: name || '',
        department: department || '',
        semester: semester || 1,
      });
      res.json(user);
    } catch (err) {
      console.error('Update profile error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
