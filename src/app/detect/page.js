"use client";

import { useState } from 'react';

export default function DetectPage() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastDetection, setLastDetection] = useState(null);

  return (
    <main className="max-w-4xl mx-auto p-6 sm:p-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Detection System</h1>

      {/* Live Camera Feed */}
      <section className="bg-white shadow-md rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Live Camera Feed</h2>
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <img
            src="https://source.unsplash.com/1600x900/?wildlife-camera"
            alt="Live camera feed"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Detection Controls */}
      <section className="bg-white shadow-md rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Detection Controls</h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-700">Detection Status</h3>
            <p className={`mt-1 ${isDetecting ? 'text-green-600' : 'text-red-600'}`}>
              {isDetecting ? 'Active' : 'Inactive'}
            </p>
          </div>
          <button
            onClick={() => setIsDetecting(!isDetecting)}
            className={`px-6 py-2 rounded-lg font-medium transition-colors
              ${isDetecting 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            {isDetecting ? 'Stop Detection' : 'Start Detection'}
          </button>
        </div>
      </section>

      {/* Recent Detections */}
      <section className="bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Recent Detections</h2>
        {lastDetection ? (
          <div className="space-y-4">
            <p>Last detected: {lastDetection}</p>
          </div>
        ) : (
          <p className="text-gray-500">No recent detections</p>
        )}
      </section>
    </main>
  );
}
