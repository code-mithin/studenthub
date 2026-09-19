import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout/Layout';

function GradesPage() {
  const [grades, setGrades] = useState([]);
  const [gpa, setGpa] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [subjectId, setSubjectId] = useState('');
  const [examName, setExamName] = useState('');
  const [marksObtained, setMarksObtained] = useState('');
  const [maxMarks, setMaxMarks] = useState('');
  const [gradePoints, setGradePoints] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gradesRes, subjectsRes] = await Promise.all([
        api.get('/grades'),
        api.get('/subjects')
      ]);
      setGrades(gradesRes.data.grades);
      setGpa(gradesRes.data.gpa);
      setSubjects(subjectsRes.data);
      if (subjectsRes.data.length > 0) {
        setSubjectId(subjectsRes.data[0].id);
      }
    } catch (err) {
      setError('Failed to fetch grades data');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (grade = null) => {
    if (grade) {
      setEditingGrade(grade);
      setSubjectId(grade.subject_id);
      setExamName(grade.exam_name);
      setMarksObtained(grade.marks_obtained);
      setMaxMarks(grade.max_marks);
      setGradePoints(grade.grade_points || '');
    } else {
      setEditingGrade(null);
      if (subjects.length > 0) setSubjectId(subjects[0].id);
      setExamName('');
      setMarksObtained('');
      setMaxMarks('');
      setGradePoints('');
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subjectId) {
      setFormError('Please select a subject');
      return;
    }
    setFormLoading(true);
    setFormError('');

    try {
      const payload = { 
        subject_id: subjectId, 
        exam_name: examName, 
        marks_obtained: parseFloat(marksObtained), 
        max_marks: parseFloat(maxMarks), 
        grade_points: gradePoints ? parseFloat(gradePoints) : 0 
      };
      
      if (editingGrade) {
        await api.put(`/grades/${editingGrade.id}`, payload);
      } else {
        await api.post('/grades', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save grade');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this grade?')) {
      try {
        await api.delete(`/grades/${id}`);
        fetchData();
      } catch (err) {
        setError('Failed to delete grade');
      }
    }
  };

  // Group grades by subject
  const groupedGrades = grades.reduce((acc, grade) => {
    if (!acc[grade.subject_name]) acc[grade.subject_name] = [];
    acc[grade.subject_name].push(grade);
    return acc;
  }, {});

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
          <p className="text-sm text-gray-500 mt-1">Keep track of your academic performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-2 text-center">
            <span className="block text-xs font-medium text-indigo-500 uppercase tracking-wider">Overall GPA</span>
            <span className="block text-2xl font-bold text-indigo-700">{gpa > 0 ? gpa : '-'}</span>
          </div>
          <button
            onClick={() => openModal()}
            disabled={subjects.length === 0}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50 h-full py-3"
          >
            + Add Grade
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}
      
      {subjects.length === 0 && !loading && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-sm text-yellow-700">You need to add subjects first before recording grades.</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(groupedGrades).map(subject => (
            <div key={subject} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">{subject}</h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {groupedGrades[subject].map(grade => (
                  <li key={grade.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{grade.exam_name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Score: <span className="font-semibold text-gray-700">{grade.marks_obtained}</span> / {grade.max_marks}
                          <span className="text-xs text-gray-400 ml-2">({Math.round((grade.marks_obtained / grade.max_marks) * 100)}%)</span>
                        </p>
                      </div>
                      <div className="text-right">
                        {grade.grade_points > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                            {grade.grade_points} GP
                          </span>
                        )}
                        <div className="flex space-x-2 justify-end">
                          <button onClick={() => openModal(grade)} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">Edit</button>
                          <button onClick={() => handleDelete(grade.id)} className="text-xs font-medium text-red-600 hover:text-red-800">Delete</button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {grades.length === 0 && (
            <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No grades recorded yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingGrade ? 'Edit Grade' : 'Add Grade'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{formError}</div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <select
                  required
                  value={subjectId}
                  onChange={e => setSubjectId(e.target.value)}
                  disabled={!!editingGrade}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                >
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Exam / Assignment Name</label>
                <input
                  type="text"
                  required
                  value={examName}
                  onChange={e => setExamName(e.target.value)}
                  placeholder="e.g. Midterm 1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marks Obtained</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={marksObtained}
                    onChange={e => setMarksObtained(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Marks</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={maxMarks}
                    onChange={e => setMaxMarks(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Grade Points (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={gradePoints}
                  onChange={e => setGradePoints(e.target.value)}
                  placeholder="e.g. 9.5 for GPA calc"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Only exams with grade points > 0 are included in the overall GPA.</p>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default GradesPage;
