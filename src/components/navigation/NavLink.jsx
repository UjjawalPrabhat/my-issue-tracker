import { Link, useLocation } from 'react-router-dom';

const NavLink = ({ to, children, className = '', ...props }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.hash === to;
  
  return (
    <Link
      to={to}
      className={`
        text-base font-medium 
        ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'} 
        transition-colors duration-200
        ${className}
      `}
      {...props}
    >
      {children}
    </Link>
  );
};

export default NavLink;
