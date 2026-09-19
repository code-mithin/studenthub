import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout/Layout';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function TimetablePage() {
  const [slots, setSlots] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [subjectId, setSubjectId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [room, setRoom] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slotsRes, subjectsRes] = await Promise.all([
        api.get('/timetable'),
        api.get('/subjects')
      ]);
      setSlots(slotsRes.data);
      setSubjects(subjectsRes.data);
      if (subjectsRes.data.length > 0) {
        setSubjectId(subjectsRes.data[0].id);
      }
    } catch (err) {
      setError('Failed to fetch timetable data');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (slot = null) => {
    if (slot) {
      setEditingSlot(slot);
      setSubjectId(slot.subject_id);
      setDayOfWeek(slot.day_of_week);
      setStartTime(slot.start_time);
      setEndTime(slot.end_time);
      setRoom(slot.room || '');
    } else {
      setEditingSlot(null);
      if (subjects.length > 0) setSubjectId(subjects[0].id);
      setDayOfWeek('Monday');
      setStartTime('09:00');
      setEndTime('10:00');
      setRoom('');
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
      const payload = { subject_id: subjectId, day_of_week: dayOfWeek, start_time: startTime, end_time: endTime, room };
      if (editingSlot) {
        await api.put(`/timetable/${editingSlot.id}`, payload);
      } else {
        await api.post('/timetable', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save timetable slot');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this slot?')) {
      try {
        await api.delete(`/timetable/${id}`);
        fetchData();
      } catch (err) {
        setError('Failed to delete slot');
      }
    }
  };

  // Group slots by day
  const groupedSlots = DAYS.reduce((acc, day) => {
    acc[day] = slots.filter(s => s.day_of_week === day);
    return acc;
  }, {});

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Weekly Timetable</h1>
        <button
          onClick={() => openModal()}
          disabled={subjects.length === 0}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50"
        >
          + Add Slot
        </button>
      </div>

      {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>}
      
      {subjects.length === 0 && !loading && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">You need to add subjects first before creating a timetable.</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="space-y-6">
          {DAYS.map(day => (
            groupedSlots[day].length > 0 && (
              <div key={day} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">{day}</h3>
                </div>
                <ul className="divide-y divide-gray-200">
                  {groupedSlots[day].map(slot => (
                    <li key={slot.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                      <div>
                        <p className="text-sm font-bold text-indigo-600">{slot.start_time} - {slot.end_time}</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">{slot.subject_name} ({slot.subject_code})</p>
                        {slot.room && <p className="text-xs text-gray-500 mt-0.5">Room: {slot.room}</p>}
                      </div>
                      <div className="flex space-x-3">
                        <button onClick={() => openModal(slot)} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Edit</button>
                        <button onClick={() => handleDelete(slot.id)} className="text-sm font-medium text-red-600 hover:text-red-800">Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          ))}
          {slots.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">Your timetable is empty.</p>
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
                {editingSlot ? 'Edit Slot' : 'Add Slot'}
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
                  disabled={!!editingSlot}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                >
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Day of Week</label>
                <select
                  required
                  value={dayOfWeek}
                  onChange={e => setDayOfWeek(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Room (Optional)</label>
                <input
                  type="text"
                  value={room}
                  onChange={e => setRoom(e.target.value)}
                  placeholder="e.g. Room 204"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
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

export default TimetablePage;
