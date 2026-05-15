import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface RegisterFormProps {
  redirectTo?: string;
}

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ redirectTo = '/' }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { register: registerUser, signInWithGoogle } = useAuth();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    console.log('Attempting registration for:', data.email);
    
    try {
      const { error, session } = await registerUser(data.email, data.password, data.username);
      
      if (error) {
        console.error('Registration failed in component:', error);
        setErrorMessage(error.message || 'Registration failed. Please try again.');
      } else {
        console.log('Registration call successful. Session:', session ? 'Found' : 'Null (Expected if email confirmation is on)');
        if (session) {
          navigate(redirectTo);
        } else {
          setIsSuccess(true);
        }
      }
    } catch (error: any) {
      console.error('Unexpected error in RegisterForm onSubmit:', error);
      setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMessage(error.message || 'Failed to sign up with Google');
        setIsGoogleLoading(false);
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred during Google sign up.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isLoading}
        className="google-btn"
      >
        {isGoogleLoading ? (
          <div className="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </>
        )}
      </button>

      <div className="auth-divider">
        <span className="px-3 text-sm text-neutral-500 font-medium">or continue with email</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 rounded-md bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 mb-4 flex items-start"
          >
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{errorMessage}</p>
          </motion.div>
        )}

        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 rounded-lg bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 mb-6 border border-green-100 dark:border-green-900/30"
          >
            <div className="flex items-center mb-2">
              <div className="p-1 bg-green-100 dark:bg-green-900/40 rounded-full mr-2">
                <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-bold">Account created!</p>
            </div>
            <p className="text-sm">
              Please check your email to confirm your account before signing in.
            </p>
            <Button 
              onClick={() => navigate('/login')} 
              variant="outline" 
              size="sm" 
              className="mt-4 w-full border-green-200 hover:bg-green-100 dark:border-green-800 dark:hover:bg-green-900/40"
            >
              Go to Login
            </Button>
          </motion.div>
        )}
        
        {!isSuccess && (
          <>
            <Input
              label="Username"
              fullWidth
              placeholder="johndoe"
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

            <Input
              label="Email"
              type="email"
              fullWidth
              placeholder="your.email@example.com"
              error={errors.email?.message}
              {...register('email', { 
                required: 'Email is required', 
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address'
                }
              })}
            />
            
            <Input
              label="Password"
              type="password"
              fullWidth
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must have at least 6 characters'
                }
              })}
            />
            
            <Input
              label="Confirm Password"
              type="password"
              fullWidth
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', { 
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              })}
            />
            
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              disabled={isGoogleLoading}
              className="mt-2"
            >
              Create Account
            </Button>
          </>
        )}
      </form>
    </motion.div>
  );
};

export default RegisterForm;