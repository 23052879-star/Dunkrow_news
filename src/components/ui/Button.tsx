import React, { useState } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  magnetic?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  magnetic = false,
  onMouseMove,
  onMouseLeave,
  ...props
}) => {
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = (e.clientX - centerX) * 0.3;
    const distanceY = (e.clientY - centerY) * 0.3;

    setMagneticOffset({
      x: Math.max(Math.min(distanceX, 15), -15),
      y: Math.max(Math.min(distanceY, 15), -15),
    });

    onMouseMove?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    setMagneticOffset({ x: 0, y: 0 });
    setIsHovering(false);
    onMouseLeave?.(e);
  };

  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden";

  const variants = {
    primary: "bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg hover:shadow-red-600/50 focus:ring-red-500",
    secondary: "bg-neutral-200 text-neutral-900 hover:bg-neutral-300 focus:ring-neutral-500 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600",
    outline: "bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50 focus:ring-neutral-500 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800",
    ghost: "bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500 dark:text-neutral-300 dark:hover:bg-neutral-800",
    danger: "bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg hover:shadow-red-600/50 focus:ring-red-500"
  };

  const sizes = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      ref={buttonRef}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        widthClass,
        (disabled || isLoading) && "opacity-70 cursor-not-allowed",
        magnetic && "cursor-none",
        className
      )}
      disabled={disabled || isLoading}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovering(true)}
      style={magnetic && isHovering ? {
        transform: `translate(${magneticOffset.x}px, ${magneticOffset.y}px)`,
      } : undefined}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;