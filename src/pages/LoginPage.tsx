import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Newspaper } from 'lucide-react';
import { motion } from 'framer-motion';
import LoginForm from '../components/auth/LoginForm';
import Card from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { user } = useAuth();

  // If already logged in & onboarded, redirect to home
  if (user && user.onboarded) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Login | Dunkrow</title>
        <meta name="description" content="Sign in to your Dunkrow account" />
      </Helmet>

      <div className="max-w-md mx-auto py-12 px-4 sm:px-0">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="flex justify-center"
          >
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 dark:bg-white border-2 border-red-600 dark:border-red-500 shadow-xl shadow-red-600/10">
              <img 
                src="/logo-removebg-preview.png" 
                alt="Dunkrow Logo" 
                className="h-9 w-9 object-contain filter invert dark:invert-0"
              />
            </div>
          </motion.div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mt-6 font-['Playfair_Display'] tracking-tight italic">
            Welcome back.
          </h1>
          <p className="text-xs font-light uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-3 max-w-sm mx-auto leading-relaxed">
            Sign in to access your personalized news feed
          </p>
          <div className="w-12 h-1 bg-red-600 mx-auto mt-4 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-xl shadow-red-900/5 dark:shadow-red-900/10 border-neutral-200 dark:border-neutral-800">
            <div className="p-2">
              <LoginForm />
              
              <div className="mt-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-red-600 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400 font-semibold transition-colors">
                  Create one now
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;