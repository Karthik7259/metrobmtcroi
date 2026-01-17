import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "./ThemeContext";

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/bmtc", label: "BMTC Operations" },
    { path: "/metro", label: "Metro Network" },
    { path: "/integration", label: "Integration" },
    { path: "/investment", label: "Smart Investment" },
  ];

  return (
    <>
      {/* Font import */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
        `}
      </style>

      <nav className="fixed top-0 left-0 right-0 z-50">
        {/* NAVBAR BACKGROUND */}
        <div
          className={`relative w-full transition-all duration-300 ${
            scrolled
              ? "bg-gray-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl"
              : "bg-gradient-to-b from-gray-900/95 to-gray-900/90 backdrop-blur-xl border-b border-white/5"
          }`}
        >
          {/* Glow Effects - contained within navbar */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -right-10 top-[-40px] w-96 h-96 bg-violet-600 rounded-full blur-[100px] opacity-40" />
            <div className="absolute right-32 top-[-30px] w-72 h-72 bg-rose-400 rounded-full blur-[80px] opacity-30" />
            <div className="absolute -left-10 top-[-20px] w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-25" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 md:h-20 items-center justify-between">
              
              {/* LOGO */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-rose-500 flex items-center justify-center shadow-lg ring-2 ring-white/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    className="w-6 h-6 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                    />
                  </svg>
                </div>

                <div className="hidden sm:block">
                  <h1
                    className="text-xl md:text-2xl font-bold text-white tracking-tight"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    Transport ROI
                  </h1>
                  <p className="text-[10px] text-gray-300 tracking-[0.15em] uppercase">
                    Intelligent Analytics
                  </p>
                </div>
              </div>

              {/* DESKTOP NAV */}
              <div className="hidden md:flex items-center space-x-2">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? "text-white bg-white/10"
                          : "text-gray-300 hover:text-white hover:bg-white/5"
                      }`}
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {link.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-violet-500 to-rose-400 rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* THEME TOGGLE BUTTON */}
              <button
                onClick={toggleTheme}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 ml-4"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? "☀️" : "🌙"}
              </button>

              {/* MOBILE MENU BUTTON */}
              <div className="md:hidden flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {isDarkMode ? "☀️" : "🌙"}
                </button>
                <span className="text-sm text-gray-300 truncate max-w-[120px]">
                  {navLinks.find(l => l.path === location.pathname)?.label || "Menu"}
                </span>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Toggle menu"
                >
                  {isMenuOpen ? "✕" : "☰"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`md:hidden absolute top-full left-0 right-0 transition-all duration-300 ${
            isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          style={{
            backdropFilter: "blur(20px)",
            backgroundColor: "rgba(15, 23, 42, 0.98)",
          }}
        >
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base transition-colors ${
                    isActive
                      ? "text-white bg-white/10 border-l-4 border-rose-400"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;