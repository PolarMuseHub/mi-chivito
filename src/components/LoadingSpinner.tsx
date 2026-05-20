import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fcf3e5' }}>
      <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
        <img 
          src="/icons/android-chrome-192x192.png"
          alt="Mi Chivito Logo" 
          className="w-16 h-16 object-contain mb-4"
        />
        <div className="w-8 h-8 border-4 rounded-full animate-spin mb-4" style={{ borderColor: '#728c6a40', borderTopColor: '#728c6a' }} />
        <p className="text-gray-600 font-medium">Cargando Mi Chivito...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;