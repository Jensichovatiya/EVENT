import React from 'react';
import { Card, CardContent, CardHeader, CardProps } from '@mui/material';

interface AppCardProps extends CardProps {
  title?: string;
  subheader?: string;
  action?: React.ReactNode;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  title,
  subheader,
  action,
  ...props
}) => {
  return (
    <Card
      {...props}
      style={{
        borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
        border: '1px solid #f3f4f6',
        background: '#ffffff',
        ...props.style
      }}
    >
      {(title || subheader || action) && (
        <CardHeader
          title={title}
          subheader={subheader}
          action={action}
          titleTypographyProps={{ variant: 'h6', style: { fontWeight: 600, fontSize: '1.1rem', color: '#1f2937' } }}
          subheaderTypographyProps={{ variant: 'body2', style: { color: '#6b7280' } }}
          style={{ borderBottom: '1px solid #f3f4f6', padding: '16px 24px' }}
        />
      )}
      <CardContent style={{ padding: 24 }}>{children}</CardContent>
    </Card>
  );
};
export default AppCard;
