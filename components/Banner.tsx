'use client';
import { useState, useEffect } from 'react';

export default function Banner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner immediately on mount
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-50 transition-opacity duration-500 shadow-lg" style={{ background: 'linear-gradient(90deg, #d32f2f, #f57c00)' }}>
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-white text-2xl" role="img" aria-label="Ribbon">🎗️</span>
          <div>
            <h3 className="text-white font-bold text-sm tracking-wide">
              HONORING OUR CANCER WARRIORS
            </h3>
            <p className="text-white text-xs opacity-90">
              Standing strong together in the fight against breast cancer. Your courage inspires us all.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-200 focus:outline-none p-1"
          aria-label="Close Banner"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
