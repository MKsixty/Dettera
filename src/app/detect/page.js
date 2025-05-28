"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageViewer from '@/components/ImageViewer';
import Navigation from '@/components/Navigation';
import { fetchDetectionRecords, getDeterrentDescription } from '@/utils/fileUtils';
import {
  ChartBarIcon,
  ClockIcon,
  SpeakerWaveIcon,
  BeakerIcon,
  ArrowTrendingDownIcon,
  PlayCircleIcon,
  StopCircleIcon,
} from '@heroicons/react/24/outline';
import { BluetoothAudioController, playAudioFile, stopAudio } from '@/utils/bluetoothUtils';

export default function DetectPage() {
  const router = useRouter();
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastDetection, setLastDetection] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSound, setSelectedSound] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [bluetoothController] = useState(new BluetoothAudioController());
  const [currentAudio, setCurrentAudio] = useState(null);

  const soundOptions = [
    { name: 'Man Sound', file: 'man.weba' },
    { name: 'Badger Sound', file: 'badger.m4a' },
    { name: 'Hyena Sound', file: 'hyena.m4a' },
    { name: 'Lion Sound', file: 'lion.weba' }
  ];

  useEffect(() => {
    async function loadData() {
      const records = await fetchDetectionRecords();
      if (records.length > 0) {
        // Sort records by timestamp (most recent first)
        const sortedRecords = [...records].sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        // Set latest detection
        const latestRecord = sortedRecords[0];
        setLastDetection({
          id: latestRecord.id,
          timestamp: latestRecord.timestamp,
          duration: `${latestRecord.duration.toFixed(2)} seconds`,
          deterrentMethod: getDeterrentDescription(latestRecord.deterrence),
          outcome: 'Deterred',
          image: latestRecord.imagePath,
          animalType: latestRecord.animalType
        });
      }
    }

    loadData();
  }, []);

  const playSound = async () => {
    if (!selectedSound) return;
    
    const audio = await playAudioFile(`/sounds/${selectedSound}`);
    if (audio) {
      setCurrentAudio(audio);
      setIsPlaying(true);
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      });
    }
  };

  const stopSound = () => {
    if (currentAudio) {
      stopAudio(currentAudio);
      setCurrentAudio(null);
      setIsPlaying(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        stopAudio(currentAudio);
      }
    };
  }, []);

  const toggleDetection = async () => {
    if (!isDetecting) {
      // Check if a sound is selected
      if (!selectedSound) {
        alert('Please select a deterrent sound first.');
        return;
      }

      // Start detection and play sound
      setIsDetecting(true);
      playSound();
    } else {
      // Stop detection
      stopSound();
      setIsDetecting(false);
    }
  };

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Detection Panel */}
          <section className="bg-white shadow-md rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Latest Detection</h2>
            {lastDetection ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{lastDetection.animalType}</p>
                    <p className="text-sm text-gray-600">{lastDetection.timestamp}</p>
                    <p className="text-sm text-gray-600">Duration: {lastDetection.duration}</p>
                    <p className="text-sm text-gray-600">Method: {lastDetection.deterrentMethod}</p>
                    <p className="text-sm text-gray-600">
                      Outcome: <span className="text-green-600 font-medium">{lastDetection.outcome}</span>
                    </p>
                  </div>
                </div>
                <div 
                  className="relative h-64 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedImage(lastDetection)}
                >
                  <img
                    src={lastDetection.image}
                    alt={`Detection at ${lastDetection.timestamp}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No recent detections</p>
            )}
          </section>

          {/* Sound Control Panel */}
          <section className="bg-white shadow-md rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Deterrent Controls</h2>
            
            {/* Trigger Deterrent Button - Moved to top */}
            <div className="mb-6">
              <button
                onClick={toggleDetection}
                className={`
                  w-full flex items-center justify-center px-6 py-4 rounded-lg font-medium text-white text-lg
                  transition-all duration-200 ${
                    isDetecting 
                      ? 'bg-red-600 hover:bg-red-700 shadow-red-100' 
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                  } shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                `}
              >
                <SpeakerWaveIcon className="h-6 w-6 mr-3" />
                {isDetecting ? 'Stop Deterrent' : 'Trigger Deterrent'}
              </button>
              {!selectedSound && (
                <p className="mt-2 text-sm text-red-600 text-center">
                  Please select a deterrent sound before triggering
                </p>
              )}
            </div>

            {/* Sound Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Select Deterrent Sound
              </label>
              <div className="grid grid-cols-2 gap-4">
                {soundOptions.map((sound) => (
                  <button
                    key={sound.file}
                    onClick={() => setSelectedSound(sound.file)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedSound === sound.file
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <SpeakerWaveIcon className="h-5 w-5 mr-2 text-gray-600" />
                      <span className="text-gray-900">{sound.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Image Viewer Modal */}
        <ImageViewer
          image={selectedImage?.image}
          title={`Detection at ${selectedImage?.timestamp}`}
          subtitle={`Duration: ${selectedImage?.duration} | Method: ${selectedImage?.deterrentMethod}`}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      </main>
    </>
  );
}
