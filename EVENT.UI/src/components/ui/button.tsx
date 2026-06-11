import React from 'react';

export const Button = React.forwardRef(({ children, className, variant, size, style, ...props }: any, ref: any) => {
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  let btnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
    height: '44px',
    padding: '0 20px',
    border: 'none',
    gap: '8px',
    ...style
  };

  if (isOutline) {
    btnStyle = {
      ...btnStyle,
      background: 'transparent',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      color: 'white',
    };
  } else if (isGhost) {
    btnStyle = {
      ...btnStyle,
      background: 'transparent',
      color: 'var(--text-muted)',
    };
  } else {
    btnStyle = {
      ...btnStyle,
      background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
      color: 'white',
    };
  }

  return (
    <button ref={ref} style={btnStyle} className={className} {...props}>
      {children}
    </button>
  );
});
Button.displayName = 'Button';
