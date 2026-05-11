import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Check, AlertCircle } from 'lucide-react';

const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ email: email.trim().toLowerCase() }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setMessage({ type: 'error', text: 'This email is already subscribed to our newsletter' });
        } else {
          throw error;
        }
      } else {
        setMessage({ type: 'success', text: 'Successfully subscribed to our newsletter!' });
        setEmail('');
      }
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      setMessage({ type: 'error', text: 'Failed to subscribe. Please try again later.' });
    } finally {
      setIsLoading(false);
    }

    // Clear message after 5 seconds
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="max-w-md mx-auto">
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`mb-4 p-3 rounded-lg flex items-center ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <Check size={16} className="mr-2 flex-shrink-0" />
          ) : (
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          )}
          <span className="text-sm">{message.text}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="px-4 py-3 rounded-lg flex-grow focus:outline-none focus:ring-2 focus:ring-white text-neutral-900 disabled:opacity-50"
          disabled={isLoading}
          required
        />
        <motion.button
          type="submit"
          disabled={isLoading}
          className="relative px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={!isLoading ? { scale: 1.02 } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative z-10 group-hover:text-white transition-colors duration-300">
            {isLoading ? 'Subscribing...' : 'Subscribe'}
          </span>
        </motion.button>
      </form>
    </div>
  );
};

export default NewsletterForm;