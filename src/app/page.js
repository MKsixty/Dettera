'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ImageViewer from '@/components/ImageViewer';
import Navigation from '@/components/Navigation';
import { fetchDetectionRecords, getDeterrentDescription, getTimeAgo } from '@/utils/fileUtils';
import {
  HomeIcon,
  CameraIcon,
  ClockIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  BellIcon,
  ArrowPathIcon,
  SpeakerWaveIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const [detectedAnimal, setDetectedAnimal] = useState(null);
  const [systemActive, setSystemActive] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [recentDetections, setRecentDetections] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    async function loadDetections() {
      const records = await fetchDetectionRecords();
      
      // Sort records by timestamp (most recent first)
      const sortedRecords = [...records].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Take only the last 4 detections for recent activity
      const recentRecords = sortedRecords.slice(0, 4);

      // Transform records into the format needed for display
      const detections = recentRecords.map(record => ({
        id: record.id,
        timestamp: record.timestamp,
        image: record.imagePath,
        duration: `${record.duration.toFixed(2)} seconds`,
        deterrentMethod: getDeterrentDescription(record.deterrence),
        outcome: 'Deterred',
        animalType: record.animalType || 'Unknown'
      }));

      setRecentDetections(detections);

      // Set the most recent detection as the current detected animal
      if (detections.length > 0) {
        setDetectedAnimal(detections[0]);
      }
    }

    loadDetections();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Overview Panel */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">System Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-medium">System Status</span>
                <button
                  onClick={() => setSystemActive(!systemActive)}
                  className={`px-4 py-2 rounded-full ${
                    systemActive ? 'bg-green-600' : 'bg-red-600'
                  } text-white font-medium`}
                >
                  {systemActive ? 'Active' : 'Inactive'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-medium">Manual Control</span>
                <Link href="/detect">
                  <button className="px-4 py-2 bg-blue-700 text-white font-medium rounded-md hover:bg-blue-800">
                    Go to Detection
                  </button>
                </Link>
              </div>
            </div>
          </section>

          {/* Recent Feed Card */}
          <section className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Feed</h2>
              <button className="text-blue-700 hover:text-blue-900">
                <ArrowPathIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="relative h-64 md:h-96 bg-gray-200 rounded-lg overflow-hidden">
              {recentDetections[0] && (
                <div className="w-full h-full relative cursor-pointer" onClick={() => setSelectedImage(recentDetections[0])}>
                  <img
                    src={recentDetections[0].image}
                    alt="Latest detection"
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <div className="text-white">
                      <p className="font-semibold">{recentDetections[0].time}</p>
                      <p className="text-sm opacity-90">{recentDetections[0].deterrentMethod}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Recent Activity */}
        <section className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <Link 
              href="/history"
              passHref
              className="text-blue-700 hover:text-blue-900 font-medium"
            >
              View Full History
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentDetections.map((detection) => (
              <div key={detection.id} className="flex flex-col p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{detection.time}</p>
                    <p className="text-xs text-gray-500">{detection.timestamp}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {detection.outcome}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration: {detection.duration}</p>
                  <p className="text-sm text-gray-600">Method: {detection.deterrentMethod}</p>
                </div>
                <div 
                  className="mt-2 h-32 rounded-md overflow-hidden cursor-pointer"
                  onClick={() => setSelectedImage(detection)}
                >
                  <img
                    src={detection.image}
                    alt={`Detection at ${detection.timestamp}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Image Viewer Modal */}
      <ImageViewer
        image={selectedImage?.image}
        title={`Detection at ${selectedImage?.timestamp}`}
        subtitle={`Duration: ${selectedImage?.duration} | Method: ${selectedImage?.deterrentMethod}`}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-900">Dettera</h2>
            <p className="text-gray-700 font-medium mt-2">Smart protection from unwanted animal intrusions — anytime, anywhere.</p>
            <p className="text-sm text-gray-600 mt-4">&copy; {new Date().getFullYear()} Dettera. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
