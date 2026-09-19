const { getDb, saveDatabase } = require('../config/db');

const Subject = {
  // Find all subjects for a user
  findByUserId(userId) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM subjects WHERE user_id = ? ORDER BY name ASC');
    stmt.bind([userId]);
    const subjects = [];
    while (stmt.step()) {
      subjects.push(stmt.getAsObject());
    }
    stmt.free();
    return subjects;
  },

  // Find a specific subject by id and user_id
  findByIdAndUserId(id, userId) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM subjects WHERE id = ? AND user_id = ?');
    stmt.bind([id, userId]);
    let subject = null;
    if (stmt.step()) {
      subject = stmt.getAsObject();
    }
    stmt.free();
    return subject;
  },

  // Create new subject
  create({ userId, name, code, total_classes }) {
    const db = getDb();
    db.run('INSERT INTO subjects (user_id, name, code, total_classes) VALUES (?, ?, ?, ?)', [userId, name, code, total_classes || 0]);
    saveDatabase();
    
    const stmt = db.prepare('SELECT last_insert_rowid() as id');
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();
    return result.id;
  },

  // Update subject
  update(id, userId, { name, code, total_classes }) {
    const db = getDb();
    db.run('UPDATE subjects SET name = ?, code = ?, total_classes = ? WHERE id = ? AND user_id = ?', [name, code, total_classes, id, userId]);
    saveDatabase();
    return this.findByIdAndUserId(id, userId);
  },

  // Delete subject
  delete(id, userId) {
    const db = getDb();
    db.run('DELETE FROM subjects WHERE id = ? AND user_id = ?', [id, userId]);
    saveDatabase();
    return true;
  }
};

module.exports = Subject;
