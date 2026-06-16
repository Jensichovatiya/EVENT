import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom style={{ fontWeight: 700, color: '#ef4444' }}>
            Oops! Something went wrong.
          </Typography>
          <Typography variant="body1" color="textSecondary" style={{ marginBottom: 24, maxWidth: 500 }}>
            {this.state.error?.message || 'An unexpected error occurred in the application.'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            style={{ borderRadius: 8, textTransform: 'none', fontWeight: 600 }}
          >
            Reload Application
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
