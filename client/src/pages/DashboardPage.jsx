import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard')
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        setError('Failed to load dashboard data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Layout><div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div></Layout>;
  }

  if (error) {
    return <Layout><div className="text-red-500">{error}</div></Layout>;
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Overall Attendance</h3>
          <p className={`text-3xl font-bold mt-2 ${data.overallAttendance < 75 ? 'text-red-600' : 'text-green-600'}`}>
            {data.overallAttendance}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Pending Tasks</h3>
          <p className="text-3xl font-bold mt-2 text-indigo-600">{data.pendingTasksCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Today's Classes</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">{data.todaysClasses.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Attendance per Subject</h2>
          {data.attendanceStats.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.attendanceStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="code" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#4f46e5" name="Attendance %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <p className="text-gray-500">No attendance data yet.</p>
          )}
        </div>

        {/* Pending Tasks & Today's Schedule */}
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Pending Tasks</h2>
            {data.pendingTasks.length > 0 ? (
              <ul className="space-y-3">
                {data.pendingTasks.map(task => (
                  <li key={task.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">Due: {task.due_date || 'No date'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-800' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {task.priority}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">All caught up!</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Today's Schedule ({data.dayOfWeek})</h2>
            {data.todaysClasses.length > 0 ? (
              <ul className="space-y-3">
                {data.todaysClasses.map(slot => (
                  <li key={slot.id} className="flex justify-between items-center border-l-4 border-indigo-500 pl-3 py-1">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{slot.subject_name}</p>
                      <p className="text-xs text-gray-500">Room: {slot.room}</p>
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      {slot.start_time} - {slot.end_time}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No classes today!</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default DashboardPage;
