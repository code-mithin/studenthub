const { getDb, saveDatabase } = require('../config/db');

const Task = {
  findByUserId(userId, filter = 'all') {
    const db = getDb();
    let sql = 'SELECT * FROM tasks WHERE user_id = ?';
    if (filter === 'active') sql += ' AND is_completed = 0';
    if (filter === 'completed') sql += ' AND is_completed = 1';
    sql += ' ORDER BY is_completed ASC, due_date ASC, created_at DESC';

    const stmt = db.prepare(sql);
    stmt.bind([userId]);
    const tasks = [];
    while (stmt.step()) {
      tasks.push(stmt.getAsObject());
    }
    stmt.free();
    return tasks;
  },

  findByIdAndUserId(id, userId) {
    const db = getDb();
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?');
    stmt.bind([id, userId]);
    let task = null;
    if (stmt.step()) {
      task = stmt.getAsObject();
    }
    stmt.free();
    return task;
  },

  create({ userId, title, description, priority, due_date }) {
    const db = getDb();
    db.run(
      'INSERT INTO tasks (user_id, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?)',
      [userId, title, description || '', priority || 'medium', due_date || null]
    );
    saveDatabase();
    const stmt = db.prepare('SELECT last_insert_rowid() as id');
    stmt.step();
    const result = stmt.getAsObject();
    stmt.free();
    return this.findByIdAndUserId(result.id, userId);
  },

  update(id, userId, { title, description, priority, due_date }) {
    const db = getDb();
    db.run(
      'UPDATE tasks SET title = ?, description = ?, priority = ?, due_date = ? WHERE id = ? AND user_id = ?',
      [title, description || '', priority || 'medium', due_date || null, id, userId]
    );
    saveDatabase();
    return this.findByIdAndUserId(id, userId);
  },

  toggleComplete(id, userId) {
    const db = getDb();
    db.run('UPDATE tasks SET is_completed = CASE WHEN is_completed = 0 THEN 1 ELSE 0 END WHERE id = ? AND user_id = ?', [id, userId]);
    saveDatabase();
    return this.findByIdAndUserId(id, userId);
  },

  delete(id, userId) {
    const db = getDb();
    db.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
    saveDatabase();
  }
};

module.exports = Task;
