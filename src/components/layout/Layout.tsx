import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import FloatingMenu from './FloatingMenu';
import { useAuth } from '../../contexts/AuthContext';

const Layout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isHomePage = location.pathname === '/';
  const isOnboardingPage = location.pathname === '/onboarding';

  // Redirect to onboarding if logged in but not onboarded
  if (user && !user.onboarded && !isOnboardingPage) {
    return <Navigate to="/onboarding" replace />;
  }

  // If on onboarding page and ALREADY onboarded, redirect to home
  if (user && user.onboarded && isOnboardingPage) {
    return <Navigate to="/" replace />;
  }

  // If on onboarding page but NOT logged in, redirect to login
  if (!user && isOnboardingPage) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 dark:bg-black">
      {!isOnboardingPage && <Header />}
      <motion.main 
        className={`flex-grow ${isHomePage ? '' : 'max-w-screen-2xl mx-auto px-6 pt-24 pb-12 md:pt-32 w-full'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Outlet />
      </motion.main>
      {!isOnboardingPage && <FloatingMenu />}
      {!isOnboardingPage && <Footer />}
    </div>
  );
};

export default Layout;