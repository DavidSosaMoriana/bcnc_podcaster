import React from 'react';
import { LoadingSpinnerProps } from '@/types';
import './LoadingSpinner.css';

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  show = true,
}) => {
  if (!show) {
    return null;
  }

  return (
    <div
      className={`loading-spinner loading-spinner--${size}`}
      role="status"
      aria-live="polite"
    >
      <div className="loading-spinner__circle"></div>
      <span className="visually-hidden">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
