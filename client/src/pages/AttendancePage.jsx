import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout/Layout';

function AttendancePage() {
  const [stats, setStats] = useState([]);
  const [records, setRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Mark attendance state
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('present');
  const [markLoading, setMarkLoading] = useState(false);
  const [markError, setMarkError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, recordsRes, subjectsRes] = await Promise.all([
        api.get('/attendance/stats'),
        api.get('/attendance'),
        api.get('/subjects')
      ]);
      setStats(statsRes.data);
      setRecords(recordsRes.data);
      setSubjects(subjectsRes.data);
      if (subjectsRes.data.length > 0 && !selectedSubject) {
        setSelectedSubject(subjectsRes.data[0].id);
      }
    } catch (err) {
      setError('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!selectedSubject) {
      setMarkError('Please select a subject');
      return;
    }

    try {
      setMarkLoading(true);
      setMarkError('');
      await api.post('/attendance', {
        subject_id: selectedSubject,
        date,
        status
      });
      fetchData(); // Refresh data
    } catch (err) {
      setMarkError(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setMarkLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await api.delete(`/attendance/${id}`);
        fetchData();
      } catch (err) {
        setError('Failed to delete attendance record');
      }
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Attendance</h1>

      {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}

      {loading ? (
        <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Mark Attendance Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Mark Attendance</h2>
              
              {subjects.length === 0 ? (
                <p className="text-sm text-gray-500">Please add subjects first to mark attendance.</p>
              ) : (
                <form onSubmit={handleMarkAttendance} className="space-y-4">
                  {markError && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{markError}</div>}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                    >
                      {subjects.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-2 flex items-center space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          value="present"
                          checked={status === 'present'}
                          onChange={(e) => setStatus(e.target.value)}
                        />
                        <span className="ml-2 text-sm text-gray-700">Present</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          value="absent"
                          checked={status === 'absent'}
                          onChange={(e) => setStatus(e.target.value)}
                        />
                        <span className="ml-2 text-sm text-gray-700">Absent</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          value="cancelled"
                          checked={status === 'cancelled'}
                          onChange={(e) => setStatus(e.target.value)}
                        />
                        <span className="ml-2 text-sm text-gray-700">Cancelled</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={markLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {markLoading ? 'Saving...' : 'Mark Attendance'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Stats & Records */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Subject Statistics</h2>
              {stats.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {stats.map(stat => (
                    <div key={stat.subject_id} className="border border-gray-100 p-4 rounded-lg bg-gray-50 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{stat.subject_code}</p>
                        <p className="text-xs text-gray-500">P:{stat.present} A:{stat.absent} C:{stat.cancelled}</p>
                      </div>
                      <div className={`text-xl font-bold ${stat.percentage < 75 ? 'text-red-600' : 'text-green-600'}`}>
                        {stat.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No attendance data yet.</p>
              )}
            </div>

            {/* Recent Records */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Recent Records</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.length > 0 ? records.map(record => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.subject_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${record.status === 'present' ? 'bg-green-100 text-green-800' : 
                              record.status === 'absent' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </Layout>
  );
}

export default AttendancePage;
