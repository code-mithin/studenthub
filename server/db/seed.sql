-- Sample user (password: password123)
INSERT OR IGNORE INTO users (id, name, email, password_hash, department, semester)
VALUES (999, 'Mithin', 'mithin@example.com', '$2a$10$M2eRG6W5JeCztanEkv8ij.EJYprIA2PZbfnk7O0DyKA0txj7Aa1EO', 'Computer Science', 5);

-- Sample subjects
INSERT OR IGNORE INTO subjects (id, user_id, name, code, total_classes) VALUES
(1, 999, 'Data Structures', 'CS301', 40),
(2, 999, 'Operating Systems', 'CS302', 38),
(3, 999, 'Database Systems', 'CS303', 35);

-- Sample attendance
INSERT OR IGNORE INTO attendance (subject_id, date, status) VALUES
(1, '2026-08-25', 'present'),
(1, '2026-08-26', 'present'),
(1, '2026-08-27', 'absent'),
(2, '2026-08-25', 'present'),
(2, '2026-08-27', 'present'),
(3, '2026-08-26', 'present');

-- Sample tasks
INSERT OR IGNORE INTO tasks (user_id, title, description, priority, due_date, is_completed) VALUES
(999, 'Complete DS Assignment', 'Binary tree traversal problems', 'high', '2026-09-05', 0),
(999, 'Read OS Chapter 5', 'Process scheduling algorithms', 'medium', '2026-09-03', 0),
(999, 'Submit DB Lab Report', 'Normalization exercises', 'high', '2026-09-02', 1);

-- Sample timetable
INSERT OR IGNORE INTO timetable_slots (subject_id, day_of_week, start_time, end_time, room) VALUES
(1, 'Monday', '09:00', '10:00', 'Room 201'),
(1, 'Wednesday', '09:00', '10:00', 'Room 201'),
(2, 'Monday', '11:00', '12:00', 'Room 305'),
(2, 'Thursday', '11:00', '12:00', 'Room 305'),
(3, 'Tuesday', '14:00', '15:30', 'Lab 102'),
(3, 'Friday', '14:00', '15:30', 'Lab 102');

-- Sample grades
INSERT OR IGNORE INTO grades (subject_id, exam_name, marks_obtained, max_marks, grade_points) VALUES
(1, 'Mid Semester', 38, 50, 8.5),
(2, 'Mid Semester', 42, 50, 9.0),
(3, 'Mid Semester', 35, 50, 7.5);
