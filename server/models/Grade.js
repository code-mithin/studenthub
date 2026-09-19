const { getDb, saveDatabase } = require('../config/db');

const Grade = {
  findByUserId(userId) {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT g.*, s.name as subject_name, s.code as subject_code
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      WHERE s.user_id = ?
      ORDER BY s.name ASC, g.exam_name ASC
    `);
    stmt.bind([userId]);
    const grades = [];
    while (stmt.step()) {
      grades.push(stmt.getAsObject());
    }
    stmt.free();
    return grades;
  },

  findById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM grades WHERE id = ?');
    stmt.bind([id]);
    let grade = null;
    if (stmt.step()) {
      grade = stmt.getAsObject();
    }
    stmt.free();
    return grade;
  },

  create({ subjectId, exam_name, marks_obtained, max_marks, grade_points }) {
    const db = getDb();
    db.run(
      'INSERT INTO grades (subject_id, exam_name, marks_obtained, max_marks, grade_points) VALUES (?, ?, ?, ?, ?)',
      [subjectId, exam_name, marks_obtained, max_marks, grade_points || 0]
    );
    saveDatabase();
    const stmt = db.prepare('SELECT last_insert_rowid() as id');
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();
    return result.id;
  },

  update(id, { exam_name, marks_obtained, max_marks, grade_points }) {
    const db = getDb();
    db.run(
      'UPDATE grades SET exam_name = ?, marks_obtained = ?, max_marks = ?, grade_points = ? WHERE id = ?',
      [exam_name, marks_obtained, max_marks, grade_points || 0, id]
    );
    saveDatabase();
    return this.findById(id);
  },

  delete(id) {
    const db = getDb();
    db.run('DELETE FROM grades WHERE id = ?', [id]);
    saveDatabase();
  },

  // Compute GPA for a user
  getGPA(userId) {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT AVG(g.grade_points) as gpa
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      WHERE s.user_id = ? AND g.grade_points > 0
    `);
    stmt.bind([userId]);
    let gpa = 0;
    if (stmt.step()) {
      const row = stmt.getAsObject();
      gpa = row.gpa ? Math.round(row.gpa * 100) / 100 : 0;
    }
    stmt.free();
    return gpa;
  }
};

module.exports = Grade;
