const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');

// GET /api/attendance — all attendance for current user
router.get('/', auth, (req, res) => {
  try {
    const records = Attendance.findByUserId(req.user.id);
    res.json(records);
  } catch (err) {
    console.error('Get attendance error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/attendance/stats — attendance stats per subject
router.get('/stats', auth, (req, res) => {
  try {
    const stats = Attendance.getStatsByUserId(req.user.id);
    res.json(stats);
  } catch (err) {
    console.error('Get attendance stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/attendance — mark attendance
router.post(
  '/',
  auth,
  [
    body('subject_id').isInt().withMessage('Subject ID is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('status').isIn(['present', 'absent', 'cancelled']).withMessage('Status must be present, absent, or cancelled'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject_id, date, status } = req.body;

    try {
      // Verify subject belongs to user
      const subject = Subject.findByIdAndUserId(subject_id, req.user.id);
      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      Attendance.mark({ subjectId: subject_id, date, status });
      res.status(201).json({ message: 'Attendance marked successfully' });
    } catch (err) {
      console.error('Mark attendance error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// DELETE /api/attendance/:id
router.delete('/:id', auth, (req, res) => {
  try {
    Attendance.delete(req.params.id);
    res.json({ message: 'Attendance record deleted' });
  } catch (err) {
    console.error('Delete attendance error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
