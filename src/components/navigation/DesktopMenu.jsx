import NavLink from './NavLink';

const DesktopMenu = () => (
  <>
    <div className="hidden md:flex items-center space-x-7">
      {['/', '/features', '/about', '/contact'].map((path) => (
        <NavLink key={path} to={path}>
          {path === '/' ? 'Home' : path.slice(1).charAt(0).toUpperCase() + path.slice(2)}
        </NavLink>
      ))}
    </div>
    <div className="hidden md:flex items-center">
      <NavLink
        to="/login"
        className="bg-[#2563EB] text-white px-5 py-2 rounded-lg hover:bg-[#1d4ed8] text-[15px] font-medium"
      >
        Login
      </NavLink>
    </div>
  </>
);

export default DesktopMenu;
