const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getDb } = require('../config/db');

router.get('/', auth, (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;
    
    // 1. Get subjects for this user
    const subjectsStmt = db.prepare('SELECT * FROM subjects WHERE user_id = ?');
    subjectsStmt.bind([userId]);
    const subjects = [];
    while (subjectsStmt.step()) {
      subjects.push(subjectsStmt.getAsObject());
    }
    subjectsStmt.free();
    
    const subjectIds = subjects.map(s => s.id);
    const placeholders = subjectIds.map(() => '?').join(',');

    // 2. Get attendance stats
    let totalPresent = 0;
    let totalClasses = 0;
    const attendanceStats = [];
    
    if (subjectIds.length > 0) {
       const attStmt = db.prepare(`SELECT subject_id, status, count(*) as count FROM attendance WHERE subject_id IN (${placeholders}) GROUP BY subject_id, status`);
       attStmt.bind([...subjectIds]);
       const attData = [];
       while (attStmt.step()) {
         attData.push(attStmt.getAsObject());
       }
       attStmt.free();
       
       subjects.forEach(subject => {
          const present = attData.find(a => a.subject_id === subject.id && a.status === 'present')?.count || 0;
          const absent = attData.find(a => a.subject_id === subject.id && a.status === 'absent')?.count || 0;
          const cancelled = attData.find(a => a.subject_id === subject.id && a.status === 'cancelled')?.count || 0;
          
          const total = present + absent; // Ignoring cancelled for percentage
          const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
          
          totalPresent += present;
          totalClasses += total;
          
          attendanceStats.push({
            subjectName: subject.name,
            code: subject.code,
            present,
            absent,
            percentage
          });
       });
    }
    
    const overallAttendance = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

    // 3. Get pending tasks
    const tasksStmt = db.prepare('SELECT * FROM tasks WHERE user_id = ? AND is_completed = 0 ORDER BY due_date ASC LIMIT 5');
    tasksStmt.bind([userId]);
    const pendingTasks = [];
    while (tasksStmt.step()) {
      pendingTasks.push(tasksStmt.getAsObject());
    }
    tasksStmt.free();
    
    const countTasksStmt = db.prepare('SELECT count(*) as count FROM tasks WHERE user_id = ? AND is_completed = 0');
    countTasksStmt.bind([userId]);
    let pendingTasksCount = 0;
    if (countTasksStmt.step()) {
      pendingTasksCount = countTasksStmt.getAsObject().count;
    }
    countTasksStmt.free();

    // 4. Get today's classes (timetable)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayStr = days[new Date().getDay()];
    
    let todaysClasses = [];
    if (subjectIds.length > 0) {
      const ttStmt = db.prepare(`
        SELECT t.*, s.name as subject_name, s.code as subject_code 
        FROM timetable_slots t
        JOIN subjects s ON t.subject_id = s.id
        WHERE t.subject_id IN (${placeholders}) AND t.day_of_week = ?
        ORDER BY t.start_time ASC
      `);
      ttStmt.bind([...subjectIds, todayStr]);
      while (ttStmt.step()) {
        todaysClasses.push(ttStmt.getAsObject());
      }
      ttStmt.free();
    }

    res.json({
      attendanceStats,
      overallAttendance,
      pendingTasks,
      pendingTasksCount,
      todaysClasses,
      dayOfWeek: todayStr
    });
    
  } catch (err) {
    console.error('Dashboard route error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
