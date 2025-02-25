import NavLink from './NavLink';

const MobileMenu = ({ isMenuOpen }) => (
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
      {['/', '/features', '/about', '/contact', '/login'].map((path) => (
        <NavLink
          key={path}
          to={path}
          className="block"
        >
          {path === '/' ? 'Home' : path.slice(1).charAt(0).toUpperCase() + path.slice(2)}
        </NavLink>
      ))}
    </div>
  </div>
);

export default MobileMenu;
