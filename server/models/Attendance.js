const { getDb, saveDatabase } = require('../config/db');

const Attendance = {
  // Find all attendance records for a subject
  findBySubjectId(subjectId) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM attendance WHERE subject_id = ? ORDER BY date DESC');
    stmt.bind([subjectId]);
    const records = [];
    while (stmt.step()) {
      records.push(stmt.getAsObject());
    }
    stmt.free();
    return records;
  },

  // Find all attendance for a user (via subjects)
  findByUserId(userId) {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT a.*, s.name as subject_name, s.code as subject_code
      FROM attendance a
      JOIN subjects s ON a.subject_id = s.id
      WHERE s.user_id = ?
      ORDER BY a.date DESC
    `);
    stmt.bind([userId]);
    const records = [];
    while (stmt.step()) {
      records.push(stmt.getAsObject());
    }
    stmt.free();
    return records;
  },

  // Mark attendance (upsert — insert or update for same subject+date)
  mark({ subjectId, date, status }) {
    const db = getDb();
    // Check if record exists
    const checkStmt = db.prepare('SELECT id FROM attendance WHERE subject_id = ? AND date = ?');
    checkStmt.bind([subjectId, date]);
    let existing = null;
    if (checkStmt.step()) {
      existing = checkStmt.getAsObject();
    }
    checkStmt.free();

    if (existing) {
      db.run('UPDATE attendance SET status = ? WHERE id = ?', [status, existing.id]);
    } else {
      db.run('INSERT INTO attendance (subject_id, date, status) VALUES (?, ?, ?)', [subjectId, date, status]);
    }
    saveDatabase();
  },

  // Delete attendance record
  delete(id) {
    const db = getDb();
    db.run('DELETE FROM attendance WHERE id = ?', [id]);
    saveDatabase();
  },

  // Get attendance stats per subject for a user
  getStatsByUserId(userId) {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT 
        s.id as subject_id,
        s.name as subject_name,
        s.code as subject_code,
        s.total_classes,
        COALESCE(SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END), 0) as present,
        COALESCE(SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END), 0) as absent,
        COALESCE(SUM(CASE WHEN a.status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelled,
        COUNT(a.id) as total_marked
      FROM subjects s
      LEFT JOIN attendance a ON a.subject_id = s.id
      WHERE s.user_id = ?
      GROUP BY s.id
      ORDER BY s.name ASC
    `);
    stmt.bind([userId]);
    const stats = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      const total = row.present + row.absent;
      row.percentage = total > 0 ? Math.round((row.present / total) * 100) : 0;
      stats.push(row);
    }
    stmt.free();
    return stats;
  }
};

module.exports = Attendance;
