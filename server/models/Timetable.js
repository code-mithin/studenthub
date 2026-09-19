const { getDb, saveDatabase } = require('../config/db');

const Timetable = {
  findByUserId(userId) {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT t.*, s.name as subject_name, s.code as subject_code
      FROM timetable_slots t
      JOIN subjects s ON t.subject_id = s.id
      WHERE s.user_id = ?
      ORDER BY CASE t.day_of_week
        WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7 END, t.start_time ASC
    `);
    stmt.bind([userId]);
    const slots = [];
    while (stmt.step()) {
      slots.push(stmt.getAsObject());
    }
    stmt.free();
    return slots;
  },

  findById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM timetable_slots WHERE id = ?');
    stmt.bind([id]);
    let slot = null;
    if (stmt.step()) {
      slot = stmt.getAsObject();
    }
    stmt.free();
    return slot;
  },

  create({ subjectId, day_of_week, start_time, end_time, room }) {
    const db = getDb();
    db.run(
      'INSERT INTO timetable_slots (subject_id, day_of_week, start_time, end_time, room) VALUES (?, ?, ?, ?, ?)',
      [subjectId, day_of_week, start_time, end_time, room || '']
    );
    saveDatabase();
    const stmt = db.prepare('SELECT last_insert_rowid() as id');
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();
    return result.id;
  },

  update(id, { day_of_week, start_time, end_time, room }) {
    const db = getDb();
    db.run(
      'UPDATE timetable_slots SET day_of_week = ?, start_time = ?, end_time = ?, room = ? WHERE id = ?',
      [day_of_week, start_time, end_time, room || '', id]
    );
    saveDatabase();
    return this.findById(id);
  },

  delete(id) {
    const db = getDb();
    db.run('DELETE FROM timetable_slots WHERE id = ?', [id]);
    saveDatabase();
  }
};

module.exports = Timetable;
