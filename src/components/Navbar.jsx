import React, { useState, useEffect } from "react";
import Logo from "./navigation/Logo";
import DesktopMenu from "./navigation/DesktopMenu";
import MobileMenu from "./navigation/MobileMenu";

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ease-out
        ${isScrolled 
          ? "bg-white/100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-sm" 
          : "bg-white shadow-[0_2px_15px_rgb(0,0,0,0.08)]"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Logo />
          <DesktopMenu />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 flex flex-col justify-center items-center w-10 h-10 relative"
            aria-label="Toggle menu"
          >
            {["-translate-y-2", "", "translate-y-2"].map((transform, i) => (
              <span
                key={i}
                className={`w-6 h-0.5 bg-gray-900 transition-all duration-300 absolute
                  ${isMenuOpen && (i === 0 ? "rotate-45 translate-y-0" : 
                    i === 1 ? "opacity-0" : "-rotate-45 translate-y-0")}
                  ${!isMenuOpen && transform}`}
              />
            ))}
          </button>
        </div>
      </div>
      <MobileMenu isMenuOpen={isMenuOpen} />
    </nav>
  );
}

export default Navbar;
