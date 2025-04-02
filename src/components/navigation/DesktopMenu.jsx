import NavLink from './NavLink';
import { useAuth } from '../../contexts/AuthContext';

const DesktopMenu = ({ isAuthenticated }) => {
  const { logout } = useAuth();

  const navItems = isAuthenticated 
    ? ['/dashboard', '/profile', '/settings']
    : ['/', '/features', '/about', '/contact'];

  return (
    <>
      <div className="hidden md:flex items-center space-x-7">
        {navItems.map((path) => (
          <NavLink key={path} to={path}>
            {path === '/' ? 'Home' : path.slice(1).charAt(0).toUpperCase() + path.slice(2)}
          </NavLink>
        ))}
      </div>
      <div className="hidden md:flex items-center">
        {isAuthenticated ? (
          <button
            onClick={logout}
            className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 text-[15px] font-medium"
          >
            Logout
          </button>
        ) : (
          <NavLink
            to="/login"
            className="bg-[#2563EB] text-white px-5 py-2 rounded-lg hover:bg-[#1d4ed8] text-[15px] font-medium"
          >
            Login
          </NavLink>
        )}
      </div>
    </>
  );
};

export default DesktopMenu;
