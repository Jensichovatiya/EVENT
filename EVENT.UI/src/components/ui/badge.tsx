import React from 'react';

export const Badge = ({ children, className, variant, style, ...props }: any) => {
  const isSecondary = variant === 'secondary';
  return (
    <span
      style={{
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        backgroundColor: isSecondary ? 'rgba(255,255,255,0.05)' : 'rgba(168,85,247,0.15)',
        color: isSecondary ? 'var(--text-muted)' : 'var(--primary-color)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
      className={className}
      {...props}
    >
      {children}
    </span>
  );
};
