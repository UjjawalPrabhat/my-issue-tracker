import { Link, useLocation } from "react-router-dom";

const NavLink = ({ to, children, className = "" }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const isLoginButton = to === '/login';

  return (
    <Link
      to={to}
      className={`
        transition-all duration-300 text-[15px] font-medium relative
        ${isLoginButton 
          ? "bg-[#2563EB] text-white px-5 py-2 rounded-lg hover:bg-[#1d4ed8]" 
          : isActive 
            ? "bg-[#2563EB] text-white px-5 py-2 rounded-lg"
            : "text-[#445781] hover:text-[#111827] px-3 py-2 hover:bg-gray-50 rounded-lg"
        } 
        ${className}
      `}
    >
      {children}
    </Link>
  );
};

export default NavLink;
