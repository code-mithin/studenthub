import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex-1"></div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">
          Hello, {user?.name}
        </span>
        <button
          onClick={logout}
          className="text-sm font-medium text-red-600 hover:text-red-800"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
