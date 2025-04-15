import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentUser, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Sections', path: '/sections' },
    { name: 'Designs', path: '/designs' },
    { name: 'Builder', path: '/builder' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  };

  if (!currentUser) return null;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 shadow-xl ${
        isDarkMode 
          ? (isScrolled ? 'bg-gray-900' : 'bg-gray-900/90 backdrop-blur-sm') 
          : (isScrolled ? 'bg-white' : 'bg-white/90 backdrop-blur-sm')
      }`}
    >
      <div className="max-container padding-x">
        <div className="flex justify-between h-14">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-500 hover:to-purple-500 transition-all duration-300">
                Portfolio Builder
              </Link>
            </div>
            <div className="hidden lg:ml-8 lg:flex lg:space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}  
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 hover:border-indigo-400'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden lg:ml-6 lg:flex lg:items-center">
            {/* Theme toggle button */}
            <button
              type='button'
              onClick={toggleTheme}
              className={`p-2 rounded-full mr-3 transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            
            {/* User info */}
            <div className="mr-4 flex items-center">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm mr-2">
                {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : currentUser.email?.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm">
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  {currentUser.displayName || currentUser.email}
                </p>
              </div>
            </div>
            <div className="ml-3 relative">
              <button
                type='button'
                onClick={handleSignOut}
                className={`${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:border-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-200'
                } px-3 py-2 rounded-md text-sm font-medium border border-transparent transition-all duration-200`}
              >
                Sign Out
              </button>
            </div>
          </div>
          <div className="lg:hidden flex items-center">
            {/* Mobile theme toggle */}
            <button
             type='button'
              onClick={toggleTheme}
              className={`p-2 rounded-full mr-2 transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 text-yellow-300' 
                  : 'bg-gray-100 text-gray-700'
              }`}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
            </button>
            
            <button
              type='button'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`inline-flex items-center justify-center py-0.5 pt-1 px-6 ml-2 rounded-md ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-indigo-400 hover:bg-gray-800' 
                  : 'text-gray-400 hover:text-indigo-400 hover:bg-gray-100'
              } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-200`}
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <div className="relative w-6 h-6 -ms-6 mt-4">
                <span 
                  className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
                  }`}
                />
                <span 
                  className={`absolute h-0.5 bg-current transform transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? 'opacity-0 w-0' : 'opacity-100 w-6'
                  }`}
                />
                <span 
                  className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 ease-in-out ${
                    isMobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu with animation */}
      <div 
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className={`shadow-inner ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          {/* User info in mobile view */}
          <div className={`flex items-center px-3 py-2 mb-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm mr-2">
              {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : currentUser.email?.charAt(0).toUpperCase()}
            </div>
            <div className="text-sm">
              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                {currentUser.displayName || currentUser.email}
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{currentUser.email}</p>
            </div>
          </div>
          
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 border-l-4 border-indigo-500'
                  : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-400 border-l-4 border-transparent hover:border-indigo-400'
              }`}
            >
              {item.name}
            </Link>
          ))}
          <button
            type='button'
            onClick={handleSignOut}
            className={`w-full mt-2 text-left px-3 py-2 rounded-md text-base font-medium text-red-500 ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-red-50'
            } transition-colors duration-200 border-l-4 border-transparent hover:border-red-400`}
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 