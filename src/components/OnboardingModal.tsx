import React from "react";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    title: "Connect Your Wallet",
    description: "Start by connecting your Ethereum wallet. You can use MetaMask or any WalletConnect-compatible wallet.",
    icon: (
      <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm0 0c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3zm0 0v2m0 4h.01" />
      </svg>
    )
  },
  {
    title: "Join the Game",
    description: "Click 'Join Game' to enter the battlefield. Wait for another player to join.",
    icon: (
      <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  },
  {
    title: "Deploy Your Unit",
    description: "Choose your unit's secret attack and defense stats. Only you know them!",
    icon: (
      <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
      </svg>
    )
  },
  {
    title: "Battle & Win!",
    description: "Attack your opponent. All combat is confidential. Reveal the outcome and claim victory!",
    icon: (
      <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
      </svg>
    )
  }
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-lg w-full relative animate-slide-up">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-yellow-200">How to Play</h2>
        <ol className="space-y-6">
          {steps.map((step, idx) => (
            <li key={idx} className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {step.icon}
              </div>
              <div>
                <div className="font-semibold text-lg text-gray-700 dark:text-yellow-100">{step.title}</div>
                <div className="text-gray-500 dark:text-gray-300 text-sm">{step.description}</div>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex justify-center">
          <button
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold shadow transition-colors"
            onClick={onClose}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}; 