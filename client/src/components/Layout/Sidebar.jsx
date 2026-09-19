import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Subjects', href: '/subjects', icon: '📚' },
    { name: 'Attendance', href: '/attendance', icon: '✅' },
    { name: 'Tasks', href: '/tasks', icon: '📝' },
    { name: 'Timetable', href: '/timetable', icon: '📅' },
    { name: 'Grades', href: '/grades', icon: '📈' },
    { name: 'Profile', href: '/profile', icon: '👤' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-indigo-600">StudentHub</h1>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;
