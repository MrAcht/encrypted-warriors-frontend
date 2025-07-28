import React from "react";

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggleTheme }) => {
  return (
    <button
      onClick={onToggleTheme}
      className="ml-2 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-yellow-400 dark:hover:bg-yellow-600 transition-colors duration-300 shadow"
      aria-label="Toggle dark mode"
    >
      <span className="block transition-transform duration-300">
        {theme === "dark" ? (
          // Sun icon
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 6.95l-1.414-1.414M6.464 6.464L5.05 5.05m12.02 0l-1.414 1.414M6.464 17.536l-1.414 1.414" />
          </svg>
        ) : (
          // Moon icon
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
          </svg>
        )}
      </span>
    </button>
  );
}; 