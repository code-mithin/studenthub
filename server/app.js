const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'StudentHub API is running' });
});

// Route mounting — uncomment as routes are implemented
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/grades', require('./routes/grades'));
app.use('/api/dashboard', require('./routes/dashboard'));

module.exports = app;
