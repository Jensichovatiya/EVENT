import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/Ui/card';
import { cn } from '@/lib/utils';

interface AppCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subheader?: string;
  action?: React.ReactNode;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  title,
  subheader,
  action,
  className,
  ...props
}) => {
  return (
    <Card className={cn('overflow-hidden border border-border bg-card shadow-sm rounded-xl', className)} {...props}>
      {(title || subheader || action) && (
        <CardHeader className="flex flex-row items-center justify-between border-b border-border p-4 px-6">
          <div className="flex flex-col space-y-1">
            {title && <CardTitle className="font-semibold text-lg text-foreground">{title}</CardTitle>}
            {subheader && <CardDescription className="text-sm text-muted-foreground">{subheader}</CardDescription>}
          </div>
          {action && <div className="flex items-center">{action}</div>}
        </CardHeader>
      )}
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
};

export default AppCard;
