const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Grade = require('../models/Grade');
const Subject = require('../models/Subject');

// GET /api/grades
router.get('/', auth, (req, res) => {
  try {
    const grades = Grade.findByUserId(req.user.id);
    const gpa = Grade.getGPA(req.user.id);
    res.json({ grades, gpa });
  } catch (err) {
    console.error('Get grades error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/grades
router.post(
  '/',
  auth,
  [
    body('subject_id').isInt().withMessage('Subject ID is required'),
    body('exam_name').trim().notEmpty().withMessage('Exam name is required'),
    body('marks_obtained').isFloat({ min: 0 }).withMessage('Marks obtained is required'),
    body('max_marks').isFloat({ min: 1 }).withMessage('Max marks is required'),
    body('grade_points').optional().isFloat({ min: 0 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject_id, exam_name, marks_obtained, max_marks, grade_points } = req.body;

    try {
      const subject = Subject.findByIdAndUserId(subject_id, req.user.id);
      if (!subject) return res.status(404).json({ message: 'Subject not found' });

      const gradeId = Grade.create({ subjectId: subject_id, exam_name, marks_obtained, max_marks, grade_points });
      const grade = Grade.findById(gradeId);
      res.status(201).json(grade);
    } catch (err) {
      console.error('Create grade error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// PUT /api/grades/:id
router.put(
  '/:id',
  auth,
  [
    body('exam_name').trim().notEmpty().withMessage('Exam name is required'),
    body('marks_obtained').isFloat({ min: 0 }).withMessage('Marks obtained is required'),
    body('max_marks').isFloat({ min: 1 }).withMessage('Max marks is required'),
    body('grade_points').optional().isFloat({ min: 0 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const existing = Grade.findById(req.params.id);
      if (!existing) return res.status(404).json({ message: 'Grade not found' });

      const grade = Grade.update(req.params.id, req.body);
      res.json(grade);
    } catch (err) {
      console.error('Update grade error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// DELETE /api/grades/:id
router.delete('/:id', auth, (req, res) => {
  try {
    const existing = Grade.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Grade not found' });

    Grade.delete(req.params.id);
    res.json({ message: 'Grade deleted' });
  } catch (err) {
    console.error('Delete grade error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
