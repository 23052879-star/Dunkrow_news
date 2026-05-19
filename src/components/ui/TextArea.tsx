import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, label, error, fullWidth = false, id, rows = 4, ...props }, ref) => {
    const textAreaId = id || Math.random().toString(36).substring(2, 9);
    
    return (
      <div className={clsx('mb-4', fullWidth && 'w-full')}>
        {label && (
          <label 
            htmlFor={textAreaId} 
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
          >
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textAreaId}
          rows={rows}
          className={clsx(
            'block px-3 py-2 bg-white dark:bg-neutral-800 border rounded-md shadow-sm placeholder-neutral-400 text-sm sm:text-base',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'disabled:bg-neutral-100 disabled:text-neutral-500 disabled:border-neutral-200 disabled:shadow-none',
            'dark:text-white dark:border-neutral-700 dark:placeholder-neutral-500',
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-neutral-300 dark:border-neutral-700',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;