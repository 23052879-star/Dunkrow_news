import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, ChevronDown, Moon, Sun, Settings, LayoutDashboard, Sparkles, SmilePlus, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

interface Category {
  name: string;
  slug: string;
}

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === 'your-supabase-url' || 
        supabaseKey === 'your-supabase-anon-key' ||
        supabaseUrl.includes('your-project-id') ||
        supabaseUrl.includes('undefined') ||
        supabaseKey.includes('undefined') ||
        !supabaseUrl.startsWith('https://') ||
        !supabaseUrl.includes('.supabase.co')) {
      console.warn('Supabase not configured properly, using demo categories');
      // Use demo categories when Supabase is not configured
      setCategories([
        { name: 'Politics', slug: 'politics' },
        { name: 'Sports', slug: 'sports' },
        { name: 'Technology', slug: 'technology' },
        { name: 'Entertainment', slug: 'entertainment' },
        { name: 'Business', slug: 'business' }
      ]);
      return;
    }

    try {
      const { data } = await supabase
        .from('categories')
        .select('name, slug')
        .order('name');
      
      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to demo categories on error
      setCategories([
        { name: 'Politics', slug: 'politics' },
        { name: 'Sports', slug: 'sports' },
        { name: 'Technology', slug: 'technology' },
        { name: 'Entertainment', slug: 'entertainment' },
        { name: 'Business', slug: 'business' }
      ]);
    }
  };

  useEffect(() => {
    setIsOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${
        isScrolled
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-lg shadow-slate-900/5 dark:shadow-black/20 py-2'
          : 'bg-transparent border-transparent py-4'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="flex justify-between items-center h-16 lg:h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 lg:space-x-3 group flex-shrink-0 min-w-0">
            <motion.div 
              className="relative flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-slate-900 dark:bg-white border border-slate-200 dark:border-white/20 shadow-sm"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <img 
                src="/logo-removebg-preview.png" 
                alt="Dunkrow Logo" 
                className="h-6 w-6 lg:h-7 lg:w-7 object-contain filter invert dark:invert-0"
              />
            </motion.div>
            <div className="flex flex-col min-w-0 justify-center">
              <motion.span 
                className="text-2xl lg:text-3xl font-medium text-slate-900 dark:text-white font-['Playfair_Display'] tracking-tight whitespace-nowrap leading-none"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Dunkrow <span className="italic text-slate-500 dark:text-slate-400">News.</span>
              </motion.span>
              <motion.span 
                className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase whitespace-nowrap"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                The Online Newspaper
              </motion.span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center flex-1 justify-center max-w-4xl mx-4 min-w-0">
            {/* Combined Explore Dropdown */}
            <div className="relative group py-4">
              <button className="flex items-center space-x-2 text-sm font-bold transition-all duration-300 px-4 py-2.5 rounded-2xl text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 group-hover:shadow-sm">
                <Sparkles size={16} className="text-red-500" />
                <span>Explore</span>
                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300 opacity-50" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute top-[85%] left-1/2 -translate-x-1/2 mt-2 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top scale-95 group-hover:scale-100 z-50">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 p-3 border border-slate-100 dark:border-slate-700 backdrop-blur-xl">
                  {/* Featured Sections */}
                  <div className="grid grid-cols-1 gap-1 mb-3 pb-3 border-b border-slate-100 dark:border-slate-700/50">
                    <Link
                      to="/whispers"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-2xl transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400">
                        <MessageSquare size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span>Weekend Whispers</span>
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Insider Stories</span>
                      </div>
                    </Link>
                    <Link
                      to="/jokes-trivia"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 rounded-2xl transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400">
                        <SmilePlus size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span>Daily Digest</span>
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Jokes & Trivia</span>
                      </div>
                    </Link>
                  </div>

                  {/* Categories Label */}
                  <div className="px-4 py-1 mb-1">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Categories</span>
                  </div>

                  {/* Categories Grid */}
                  <div className="grid grid-cols-1 gap-0.5">
                    {categories.map(category => (
                      <Link
                        key={category.slug}
                        to={`/category/${category.slug}`}
                        className="block px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Right side: User menu */}
          <div className="hidden lg:flex items-center space-x-2 flex-shrink-0 min-w-0">
            {/* Theme Toggle Removed */}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors duration-300"
                >
                  <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="w-8 h-8 xl:w-10 xl:h-10 rounded-full object-cover" />
                    ) : (
                      <User size={16} className="xl:w-[18px] xl:h-[18px] text-slate-500 dark:text-slate-400" />
                    )}
                  </div>
                  <span className="font-medium hidden xl:block max-w-20 truncate">{user.username}</span>
                  <ChevronDown size={16} className="xl:w-[18px] xl:h-[18px]" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-48 xl:w-56 py-2 bg-white dark:bg-neutral-800 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 backdrop-blur-sm"
                    >
                      <Link
                        to="/profile"
                        className="block px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <span className="flex items-center">
                          <Settings size={16} className="mr-3" />
                          Profile Settings
                        </span>
                      </Link>
                      
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <span className="flex items-center">
                            <LayoutDashboard size={16} className="mr-3" />
                            Admin Dashboard
                          </span>
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200"
                      >
                        <span className="flex items-center">
                          <LogOut size={16} className="mr-3" />
                          Logout
                        </span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2 min-w-0">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors duration-300 whitespace-nowrap"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu buttons */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Mobile Theme Toggle Removed */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-800 dark:text-slate-200 rounded-xl"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-xl overflow-y-auto max-h-[calc(100vh-6rem)]"
          >
            <div className="max-w-screen-2xl mx-auto px-6 py-6">
              {user && (
                <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <User size={22} className="text-slate-500 dark:text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-lg">
                      {user.username}
                    </div>
                    <Link
                      to="/profile"
                      className="text-sm font-medium text-red-600 dark:text-red-400"
                      onClick={() => setIsOpen(false)}
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              )}

              <nav className="flex flex-col space-y-2">
                {categories.map(category => (
                  <Link
                    key={category.slug}
                    to={`/category/${category.slug}`}
                    className={`text-base font-semibold py-3 px-4 rounded-xl transition-all duration-300 ${
                      location.pathname === `/category/${category.slug}`
                        ? 'text-white bg-gradient-to-r from-red-600 to-red-700'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
                <Link
                  to="/whispers"
                  className={`text-base font-semibold py-3 px-4 rounded-xl transition-all duration-300 ${
                    location.pathname === '/whispers' 
                      ? 'text-white bg-gradient-to-r from-red-600 to-red-700' 
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Weekend Whispers
                </Link>
                <Link
                  to="/jokes-trivia"
                  className={`text-base font-semibold py-3 px-4 rounded-xl transition-all duration-300 ${
                    location.pathname === '/jokes-trivia' 
                      ? 'text-white bg-gradient-to-r from-red-600 to-red-700' 
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Jokes & Trivia
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`text-base font-semibold py-3 px-4 rounded-xl transition-all duration-300 ${
                      location.pathname.startsWith('/admin') 
                        ? 'text-white bg-gradient-to-r from-red-600 to-red-700' 
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
              </nav>

              {!user && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col space-y-3">
                    <Link
                      to="/login"
                      className="w-full py-3 text-center font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="w-full py-3 text-center font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl"
                      onClick={() => setIsOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                </div>
              )}

              {user && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center w-full py-4 rounded-2xl font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 transition-colors"
                  >
                    <LogOut size={20} className="mr-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;