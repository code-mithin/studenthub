const { getDb, saveDatabase } = require('../config/db');

const User = {
  // Find user by email
  findByEmail(email) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    stmt.bind([email]);
    let user = null;
    if (stmt.step()) {
      user = stmt.getAsObject();
    }
    stmt.free();
    return user;
  },

  // Find user by id
  findById(id) {
    const db = getDb();
    const stmt = db.prepare('SELECT id, name, email, department, semester, created_at FROM users WHERE id = ?');
    stmt.bind([id]);
    let user = null;
    if (stmt.step()) {
      user = stmt.getAsObject();
    }
    stmt.free();
    return user;
  },

  // Create new user
  create({ name, email, password_hash }) {
    const db = getDb();
    db.run('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, password_hash]);
    saveDatabase();
    // Get the last inserted id
    const stmt = db.prepare('SELECT last_insert_rowid() as id');
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();
    return result.id;
  },

  // Update user profile
  update(id, { name, department, semester }) {
    const db = getDb();
    db.run('UPDATE users SET name = ?, department = ?, semester = ? WHERE id = ?', [name, department, semester, id]);
    saveDatabase();
    return User.findById(id);
  }
};

module.exports = User;
