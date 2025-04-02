import NavLink from './NavLink';
import { useAuth } from '../../contexts/AuthContext';

const MobileMenu = ({ isMenuOpen, isAuthenticated }) => {
  const { logout } = useAuth();

  const navItems = isAuthenticated 
    ? ['/dashboard', '/profile', '/settings']
    : ['/', '/features', '/about', '/contact'];

  return (
    <div
      className={`
        md:hidden 
        fixed left-0 right-0 
        top-16
        bg-white 
        shadow-[0_8px_16px_rgba(0,0,0,0.1)]
        transition-all duration-300 ease-in-out
        ${isMenuOpen 
          ? "opacity-100 visible translate-y-0" 
          : "opacity-0 invisible -translate-y-2"
        }
      `}
    >
      <div className="px-4 py-3 space-y-3">
        {navItems.map((path) => (
          <NavLink
            key={path}
            to={path}
            className="block"
          >
            {path === '/' ? 'Home' : path.slice(1).charAt(0).toUpperCase() + path.slice(2)}
          </NavLink>
        ))}
        {isAuthenticated ? (
          <button
            onClick={logout}
            className="w-full text-left text-red-500 hover:text-red-600 px-3 py-2"
          >
            Logout
          </button>
        ) : (
          <NavLink to="/login" className="block">
            Login
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
