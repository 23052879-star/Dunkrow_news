import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Newspaper } from 'lucide-react';
import { motion } from 'framer-motion';
import LoginForm from '../components/auth/LoginForm';
import Card from '../components/ui/Card';

const LoginPage: React.FC = () => {
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
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="flex justify-center"
          >
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <Newspaper className="h-10 w-10 text-red-600 dark:text-red-500" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mt-6 font-display tracking-tight">
            Welcome back
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Sign in to access your personalized news feed
          </p>
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