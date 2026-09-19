const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Subject = require('../models/Subject');

// GET /api/subjects
router.get('/', auth, (req, res) => {
  try {
    const subjects = Subject.findByUserId(req.user.id);
    res.json(subjects);
  } catch (err) {
    console.error('Get subjects error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/subjects
router.post(
  '/',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Subject name is required'),
    body('code').trim().notEmpty().withMessage('Subject code is required'),
    body('total_classes').optional().isInt({ min: 0 }).withMessage('Total classes must be a positive number'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, code, total_classes } = req.body;

    try {
      const subjectId = Subject.create({
        userId: req.user.id,
        name,
        code,
        total_classes: total_classes || 0
      });
      
      const newSubject = Subject.findByIdAndUserId(subjectId, req.user.id);
      res.status(201).json(newSubject);
    } catch (err) {
      console.error('Create subject error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/subjects/:id
router.put(
  '/:id',
  auth,
  [
    body('name').trim().notEmpty().withMessage('Subject name is required'),
    body('code').trim().notEmpty().withMessage('Subject code is required'),
    body('total_classes').optional().isInt({ min: 0 }).withMessage('Total classes must be a positive number'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, code, total_classes } = req.body;

    try {
      const subject = Subject.findByIdAndUserId(req.params.id, req.user.id);
      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      const updatedSubject = Subject.update(req.params.id, req.user.id, {
        name,
        code,
        total_classes: total_classes || 0
      });
      res.json(updatedSubject);
    } catch (err) {
      console.error('Update subject error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// DELETE /api/subjects/:id
router.delete('/:id', auth, (req, res) => {
  try {
    const subject = Subject.findByIdAndUserId(req.params.id, req.user.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    Subject.delete(req.params.id, req.user.id);
    res.json({ message: 'Subject deleted successfully' });
  } catch (err) {
    console.error('Delete subject error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
