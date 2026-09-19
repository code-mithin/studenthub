import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout/Layout';

function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [totalClasses, setTotalClasses] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (err) {
      setError('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setName(subject.name);
      setCode(subject.code);
      setTotalClasses(subject.total_classes);
    } else {
      setEditingSubject(null);
      setName('');
      setCode('');
      setTotalClasses('');
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (editingSubject) {
        await api.put(`/subjects/${editingSubject.id}`, {
          name,
          code,
          total_classes: totalClasses ? parseInt(totalClasses) : 0
        });
      } else {
        await api.post('/subjects', {
          name,
          code,
          total_classes: totalClasses ? parseInt(totalClasses) : 0
        });
      }
      closeModal();
      fetchSubjects();
    } catch (err) {
      setFormError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'An error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject? All related attendance, tasks, timetable slots, and grades will be deleted as well.')) {
      try {
        await api.delete(`/subjects/${id}`);
        fetchSubjects();
      } catch (err) {
        setError('Failed to delete subject');
      }
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium"
        >
          + Add Subject
        </button>
      </div>

      {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}

      {loading ? (
        <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <div key={subject.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-gray-900 truncate pr-2">{subject.name}</h3>
                  <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">{subject.code}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Total Classes: {subject.total_classes || 'Not set'}</p>
              </div>
              <div className="mt-4 flex space-x-3 border-t border-gray-100 pt-4">
                <button
                  onClick={() => openModal(subject)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(subject.id)}
                  className="text-sm font-medium text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">You haven't added any subjects yet.</p>
          <button
            onClick={() => openModal()}
            className="text-indigo-600 font-medium hover:underline"
          >
            Create your first subject
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingSubject ? 'Edit Subject' : 'Add Subject'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {formError && <div className="mb-4 text-red-600 text-sm bg-red-50 p-2 rounded">{formError}</div>}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Subject Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g. Data Structures"
                  />
                </div>
                
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">Subject Code</label>
                  <input
                    type="text"
                    id="code"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g. CS301"
                  />
                </div>
                
                <div>
                  <label htmlFor="totalClasses" className="block text-sm font-medium text-gray-700">Total Classes (Optional)</label>
                  <input
                    type="number"
                    id="totalClasses"
                    min="0"
                    value={totalClasses}
                    onChange={(e) => setTotalClasses(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g. 40"
                  />
                  <p className="mt-1 text-xs text-gray-500">Used for calculating attendance percentages if you have a fixed number of classes.</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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

export default SubjectsPage;
