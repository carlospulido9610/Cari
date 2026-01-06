import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  className = '',
  disabled,
  ...props
}) => {

  const baseStyles = "inline-flex items-center justify-center font-bold tracking-widest uppercase transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-brand-ink hover:bg-brand-ink/90 text-brand-ivory shadow-lg shadow-brand-ink/20 hover:shadow-brand-ink/30 focus:ring-brand-ink border border-transparent",
    secondary: "bg-brand-ivory hover:bg-brand-ivory/90 text-brand-ink shadow-sm hover:shadow-md focus:ring-brand-ink border border-brand-ink/10",
    outline: "bg-transparent border border-brand-ink/30 hover:border-brand-ink text-brand-ink hover:bg-brand-ink hover:text-brand-ivory focus:ring-brand-ink",
    ghost: "bg-transparent hover:bg-brand-ink/5 text-brand-ink/60 hover:text-brand-ink",
  };

  const sizes = {
    sm: "text-[10px] px-5 py-2.5",
    md: "text-[11px] px-7 py-3.5",
    lg: "text-xs px-10 py-4",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};