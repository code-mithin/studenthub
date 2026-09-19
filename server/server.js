require('dotenv').config();
const app = require('./app');
const { initDatabase, getDb, saveDatabase } = require('./config/db');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

async function start() {
  // Initialize the database
  await initDatabase();
  const db = getDb();

  // Run schema.sql to create tables on startup
  const schemaPath = path.resolve(__dirname, 'db/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.run(schema);
  saveDatabase();

  console.log('Database initialized successfully');

  app.listen(PORT, () => {
    console.log(`StudentHub server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
