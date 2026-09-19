const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Timetable = require('../models/Timetable');
const Subject = require('../models/Subject');

// GET /api/timetable
router.get('/', auth, (req, res) => {
  try {
    const slots = Timetable.findByUserId(req.user.id);
    res.json(slots);
  } catch (err) {
    console.error('Get timetable error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/timetable
router.post(
  '/',
  auth,
  [
    body('subject_id').isInt().withMessage('Subject ID is required'),
    body('day_of_week').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage('Valid day is required'),
    body('start_time').notEmpty().withMessage('Start time is required'),
    body('end_time').notEmpty().withMessage('End time is required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject_id, day_of_week, start_time, end_time, room } = req.body;

    try {
      const subject = Subject.findByIdAndUserId(subject_id, req.user.id);
      if (!subject) return res.status(404).json({ message: 'Subject not found' });

      const slotId = Timetable.create({ subjectId: subject_id, day_of_week, start_time, end_time, room });
      const slot = Timetable.findById(slotId);
      res.status(201).json(slot);
    } catch (err) {
      console.error('Create timetable slot error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/timetable/:id
router.put(
  '/:id',
  auth,
  [
    body('day_of_week').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage('Valid day is required'),
    body('start_time').notEmpty().withMessage('Start time is required'),
    body('end_time').notEmpty().withMessage('End time is required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const existing = Timetable.findById(req.params.id);
      if (!existing) return res.status(404).json({ message: 'Slot not found' });

      const slot = Timetable.update(req.params.id, req.body);
      res.json(slot);
    } catch (err) {
      console.error('Update timetable slot error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// DELETE /api/timetable/:id
router.delete('/:id', auth, (req, res) => {
  try {
    const existing = Timetable.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Slot not found' });

    Timetable.delete(req.params.id);
    res.json({ message: 'Timetable slot deleted' });
  } catch (err) {
    console.error('Delete timetable slot error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
