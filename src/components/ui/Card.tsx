import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  animate?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  shadow = 'md',
  hover = false,
  animate = false
}) => {
  const baseStyles = "rounded-xl bg-white dark:bg-slate-800 overflow-hidden transition-all duration-300 border border-slate-100 dark:border-slate-700";

  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-8"
  };

  const shadowStyles = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg"
  };

  const hoverStyles = hover
    ? "hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1 cursor-pointer"
    : "";
  
  const Component = animate ? motion.div : 'div';
  
  const motionProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {};
  
  return (
    <Component
      className={clsx(
        baseStyles,
        paddingStyles[padding],
        shadowStyles[shadow],
        hoverStyles,
        className
      )}
      {...motionProps}
    >
      {children}
    </Component>
  );
};

export default Card;