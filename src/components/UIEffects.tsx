import React from 'react';

export function GlowEffect({ children, color = "yellow" }: { children: React.ReactNode; color?: string }) {
  const colorClasses = {
    yellow: "shadow-yellow-400/50",
    blue: "shadow-blue-400/50",
    green: "shadow-green-400/50",
    red: "shadow-red-400/50",
    purple: "shadow-purple-400/50"
  };

  return (
    <div className={`relative group ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
      {children}
    </div>
  );
}

export function PulseEffect({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-pulse">
      {children}
    </div>
  );
}

export function ShimmerEffect({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      {children}
    </div>
  );
}