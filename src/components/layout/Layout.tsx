import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import FloatingMenu from './FloatingMenu';

const Layout: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />
      <motion.main 
        className={`flex-grow ${isHomePage ? '' : 'max-w-screen-2xl mx-auto px-6 pt-24 pb-12 md:pt-32 w-full'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Outlet />
      </motion.main>
      <FloatingMenu />
      <Footer />
    </div>
  );
};

export default Layout;