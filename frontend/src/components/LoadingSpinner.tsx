"use client";

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const LoadingContent = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Futuristic Spinner */}
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-transparent border-t-cyber-blue border-r-cyber-purple animate-spin`}></div>

        {/* Middle ring */}
        <div className={`${sizeClasses[size]} absolute inset-0 rounded-full border-4 border-transparent border-b-cyber-green animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>

        {/* Inner glow */}
        <div className={`${sizeClasses[size]} absolute inset-0 rounded-full bg-gradient-cyber opacity-20 blur-md animate-pulse`}></div>
      </div>

      {/* Loading Message */}
      {message && (
        <div className="text-center">
          <p className="text-white font-medium animate-pulse">{message}</p>
          <p className="text-xs text-cyan-400 mt-1">Processing gasless transaction...</p>
        </div>
      )}

      {/* Loading dots */}
      {message && (
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-cyber-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-cyber-purple rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-cyber-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="glass p-8 rounded-2xl">
          <LoadingContent />
        </div>
      </div>
    );
  }

  return <LoadingContent />;
};

export default LoadingSpinner;
