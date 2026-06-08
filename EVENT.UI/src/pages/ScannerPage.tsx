/// <reference path="../types.d.ts" />
import React from 'react';
import ScannerApp from '../components/ScannerApp';

interface ScannerPageProps {
  setToast: (toast: { type: 'success' | 'error'; message: string } | null) => void;
}

export default function ScannerPage({ setToast }: ScannerPageProps) {
  return (
    <div style={{ width: '100%' }}>
      <ScannerApp setToast={setToast} />
    </div>
  );
}
