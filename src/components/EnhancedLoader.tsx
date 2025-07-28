import React from 'react';
import { FaDragon, FaShieldAlt, FaMagic, FaEye } from 'react-icons/fa';

interface EnhancedLoaderProps {
  message?: string;
  type?: 'default' | 'deploy' | 'attack' | 'reveal';
  progress?: number;
}

export function EnhancedLoader({ message = "Loading...", type = "default", progress }: EnhancedLoaderProps) {
  const getIcon = () => {
    switch (type) {
      case 'deploy':
        return <FaShieldAlt className="w-8 h-8 text-blue-400" />;
      case 'attack':
        return <FaDragon className="w-8 h-8 text-red-400" />;
      case 'reveal':
        return <FaMagic className="w-8 h-8 text-purple-400" />;
      default:
        return <FaEye className="w-8 h-8 text-yellow-400" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'deploy':
        return 'border-blue-400';
      case 'attack':
        return 'border-red-400';
      case 'reveal':
        return 'border-purple-400';
      default:
        return 'border-yellow-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-8 border-2 border-gray-700 shadow-2xl max-w-sm w-full mx-4">
        <div className="text-center">
          {/* Animated Icon */}
          <div className="mb-6">
            <div className={`w-20 h-20 mx-auto rounded-full border-4 ${getColor()} flex items-center justify-center animate-pulse`}>
              {getIcon()}
            </div>
          </div>
          
          {/* Message */}
          <h3 className="text-xl font-bold text-white mb-4">{message}</h3>
          
          {/* Progress Bar */}
          {progress !== undefined && (
            <div className="mb-4">
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-400 mt-2">{progress}% Complete</div>
            </div>
          )}
          
          {/* Loading Dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          
          {/* Type-specific message */}
          <div className="mt-4 text-sm text-gray-400">
            {type === 'deploy' && "Encrypting your unit stats..."}
            {type === 'attack' && "Processing confidential combat..."}
            {type === 'reveal' && "Decrypting battle results..."}
            {type === 'default' && "Please wait while we process your request..."}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MiniLoader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-yellow-400`}></div>
  );
}

export function PulseLoader({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-pulse">
      {children}
    </div>
  );
} 