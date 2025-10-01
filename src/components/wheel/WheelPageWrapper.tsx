'use client';

import dynamic from 'next/dynamic';

// Charger WheelPage dynamiquement pour éviter les problèmes SSR avec D3
const WheelPage = dynamic(() => import('./WheelPage'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex justify-center items-center px-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement de la roue...</p>
      </div>
    </div>
  )
});

export default WheelPage;
