import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

interface OnboardingFormValues {
  username: string;
}

const OnboardingPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<OnboardingFormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: OnboardingFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const { error } = await completeOnboarding(data.username);
      
      if (error) {
        setErrorMessage(error.message || 'Failed to complete onboarding. Please try again.');
      } else {
        // Success! The Layout component will automatically redirect to "/"
        navigate('/', { replace: true });
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-100 dark:bg-black">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white font-serif mb-2">Welcome to Dunkrow</h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Let's complete your profile before you dive in.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-md bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 flex items-start"
              >
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{errorMessage}</p>
              </motion.div>
            )}

            <div className="flex justify-center mb-6">
              <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-neutral-100 dark:border-neutral-800">
                <img 
                  src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.email || 'User'}&background=random`} 
                  alt="Avatar" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <Input
              label="Choose a Username"
              fullWidth
              placeholder="e.g. news_junkie99"
              error={errors.username?.message}
              {...register('username', { 
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must have at least 3 characters'
                },
                maxLength: {
                  value: 20,
                  message: 'Username cannot exceed 20 characters'
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Username can only contain letters, numbers, and underscores'
                }
              })}
            />

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="mt-4"
            >
              Complete Profile
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
