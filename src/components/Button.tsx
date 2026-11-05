import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-neon-indigo to-neon-violet text-white hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:brightness-110',
  secondary:
    'bg-neon-emerald text-white hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:brightness-110',
  ghost: 'bg-white/5 text-white hover:bg-white/10 border border-white/10',
  outline: 'bg-transparent text-white border border-white/20 hover:border-white/40 hover:bg-white/5',
  danger: 'bg-red-500/90 text-white hover:bg-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-7 py-3.5 text-base rounded-xl',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: undefined;
  };

type LinkProps = CommonProps & {
  to: string;
  onClick?: () => void;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', children, className = '', ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...rest}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export function LinkButton({ variant = 'primary', size = 'md', children, className = '', to, onClick }: LinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
