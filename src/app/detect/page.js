"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ImageViewer from '@/components/ImageViewer';
import Navigation from '@/components/Navigation';
import { fetchDetectionRecords, getDeterrentDescription, getOptimizedDeterrentSettings } from '@/utils/fileUtils';
import {
  ChartBarIcon,
  ClockIcon,
  SpeakerWaveIcon,
  BeakerIcon,
  ArrowTrendingDownIcon,
  PlayCircleIcon,
  StopCircleIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon
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
  const [deterrenceSettings, setDeterrenceSettings] = useState({
    LED: { frequency: 50, dutyCycle: 0.5 },
    Speaker: { frequency: 500, dutyCycle: 0.5 },
    motor: 'ON'
  });
  const [isAutoOptimized, setIsAutoOptimized] = useState(false);
  const [effectiveDeterrents, setEffectiveDeterrents] = useState([]);

  const soundOptions = [
    { name: 'High Pitch Alarm', file: 'high_pitch.weba' },
    { name: 'Predator Sound', file: 'predator.m4a' },
    { name: 'Aggressive Noise', file: 'aggressive.m4a' },
    { name: 'Warning Siren', file: 'siren.weba' }
  ];

  useEffect(() => {
    async function loadData() {
      const records = await fetchDetectionRecords();
      if (records.length > 0) {
        // Filter for honey badger detections and sort by timestamp
        const honeyBadgerRecords = records.filter(record => 
          record.animalType === 'Honey Badger'
        ).sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        if (honeyBadgerRecords.length > 0) {
          // Set latest detection
          const latestRecord = honeyBadgerRecords[0];
          setLastDetection({
            id: latestRecord.id,
            timestamp: latestRecord.timestamp,
            duration: `${latestRecord.duration.toFixed(2)} seconds`,
            deterrentMethod: getDeterrentDescription(latestRecord.deterrence),
            outcome: 'Deterred',
            image: latestRecord.imagePath,
            animalType: latestRecord.animalType
          });

          // Automatically fetch optimized settings for honey badger
          optimizeSettings('Honey Badger');
        }
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

  // Function to optimize settings based on animal type
  const optimizeSettings = async (animalType) => {
    try {
      const topSettings = await getOptimizedDeterrentSettings(animalType);
      setEffectiveDeterrents(topSettings);
      // Set the most effective settings as current
      if (topSettings.length > 0) {
        setDeterrenceSettings(topSettings[0].settings);
        setIsAutoOptimized(true);
      }
    } catch (error) {
      console.error('Failed to optimize settings:', error);
    }
  };

  // Function to apply a specific deterrent combination
  const applyDeterrentSettings = (settings) => {
    setDeterrenceSettings(settings);
    setIsAutoOptimized(true);
  };

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Detection Panel */}
          <section className="bg-white shadow-md rounded-2xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Latest Honey Badger Detection</h2>
            {lastDetection ? (
              <div className="space-y-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <h3 className="text-xl font-semibold text-gray-900">Honey Badger</h3>
                      <span className="ml-3 px-3 py-1 text-sm font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                        High Risk
                      </span>
                    </div>
                    <button
                      onClick={() => optimizeSettings('Honey Badger')}
                      className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                    >
                      <SparklesIcon className="h-5 w-5 mr-2" />
                      <span className="font-medium">Optimize Settings</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-base">
                    <div>
                      <p className="text-gray-600">Detection Time:</p>
                      <p className="font-medium text-gray-900">{lastDetection.timestamp}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration:</p>
                      <p className="font-medium text-gray-900">{lastDetection.duration}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Deterrent Method:</p>
                      <p className="font-medium text-gray-900">{lastDetection.deterrentMethod}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Outcome:</p>
                      <p className="font-medium text-green-600">{lastDetection.outcome}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Honey Badger Alert</h3>
                      <p className="mt-1 text-sm text-yellow-700">
                        Known for their persistence and aggression. Recommended to use maximum deterrence settings.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative rounded-xl overflow-hidden h-80 border-2 border-gray-200">
                  <img
                    src={lastDetection.image}
                    alt={`Honey Badger Detection at ${lastDetection.timestamp}`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(lastDetection)}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white text-sm">Click to view full image</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No honey badger detections</p>
              </div>
            )}
          </section>

          {/* Deterrence Control Panel */}
          <section className="bg-white shadow-md rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-gray-800">Deterrence Controls</h2>
              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-lg">
                <span className={`text-sm font-medium ${isAutoOptimized ? 'text-green-600' : 'text-gray-500'}`}>
                  {isAutoOptimized ? 'Auto-optimized for Honey Badger' : 'Manual settings'}
                </span>
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Effective Deterrents Section */}
            {effectiveDeterrents.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Top Effective Deterrents
                </h3>
                <div className="space-y-4">
                  {effectiveDeterrents.map((deterrent, index) => (
                    <div
                      key={index}
                      className={`p-6 rounded-xl border-2 ${
                        JSON.stringify(deterrent.settings) === JSON.stringify(deterrenceSettings)
                          ? 'border-green-500 bg-green-50'
                          : index === 0 ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg font-medium text-gray-900">
                            Combination #{index + 1}
                          </span>
                          {index === 0 && (
                            <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">
                              Recommended
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => applyDeterrentSettings(deterrent.settings)}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                        >
                          Apply Settings
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white p-3 rounded-lg">
                          <span className="text-gray-600">Avg. Duration:</span>
                          <p className="text-lg font-medium text-gray-900">{deterrent.averageDuration.toFixed(1)}s</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <span className="text-gray-600">Success Rate:</span>
                          <p className="text-lg font-medium text-gray-900">{(deterrent.effectiveness * 100).toFixed(1)}%</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <span className="text-gray-600">Total Uses:</span>
                          <p className="text-lg font-medium text-gray-900">{deterrent.totalUses}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg">
                          <span className="text-gray-600">Consistency:</span>
                          <p className="text-lg font-medium text-gray-900">{deterrent.variability.toFixed(2)} σ</p>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">LED Settings:</span>
                          <span className="font-medium text-gray-900">
                            {deterrent.settings.LED.frequency}Hz @ {(deterrent.settings.LED.dutyCycle * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Speaker Settings:</span>
                          <span className="font-medium text-gray-900">
                            {deterrent.settings.Speaker.frequency}Hz @ {(deterrent.settings.Speaker.dutyCycle * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Spray Status:</span>
                          <span className={`font-medium ${deterrent.settings.motor === 'ON' ? 'text-green-600' : 'text-gray-900'}`}>
                            {deterrent.settings.motor}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Controls */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Manual Controls</h3>
                <div className="space-y-6">
                  {/* LED Controls */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <label className="block text-lg font-medium text-gray-900 mb-4">
                      LED Settings
                    </label>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Frequency (Hz)</label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="range"
                            min="0"
                            max="1000"
                            value={deterrenceSettings.LED.frequency}
                            onChange={(e) => setDeterrenceSettings(prev => ({
                              ...prev,
                              LED: { ...prev.LED, frequency: parseInt(e.target.value) }
                            }))}
                            className="flex-1"
                          />
                          <span className="w-20 text-right font-medium text-gray-900">
                            {deterrenceSettings.LED.frequency} Hz
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Duty Cycle</label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={deterrenceSettings.LED.dutyCycle * 100}
                            onChange={(e) => setDeterrenceSettings(prev => ({
                              ...prev,
                              LED: { ...prev.LED, dutyCycle: parseInt(e.target.value) / 100 }
                            }))}
                            className="flex-1"
                          />
                          <span className="w-20 text-right font-medium text-gray-900">
                            {(deterrenceSettings.LED.dutyCycle * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Speaker Controls */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <label className="block text-lg font-medium text-gray-900 mb-4">
                      Speaker Settings
                    </label>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Frequency (Hz)</label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="range"
                            min="20"
                            max="20000"
                            value={deterrenceSettings.Speaker.frequency}
                            onChange={(e) => setDeterrenceSettings(prev => ({
                              ...prev,
                              Speaker: { ...prev.Speaker, frequency: parseInt(e.target.value) }
                            }))}
                            className="flex-1"
                          />
                          <span className="w-20 text-right font-medium text-gray-900">
                            {deterrenceSettings.Speaker.frequency} Hz
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Volume</label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={deterrenceSettings.Speaker.dutyCycle * 100}
                            onChange={(e) => setDeterrenceSettings(prev => ({
                              ...prev,
                              Speaker: { ...prev.Speaker, dutyCycle: parseInt(e.target.value) / 100 }
                            }))}
                            className="flex-1"
                          />
                          <span className="w-20 text-right font-medium text-gray-900">
                            {(deterrenceSettings.Speaker.dutyCycle * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Motor Control */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <label className="block text-lg font-medium text-gray-900 mb-4">
                      Deterrent Spray
                    </label>
                    <button
                      onClick={() => setDeterrenceSettings(prev => ({
                        ...prev,
                        motor: prev.motor === 'ON' ? 'OFF' : 'ON'
                      }))}
                      className={`w-full py-3 px-4 rounded-lg font-medium text-lg ${
                        deterrenceSettings.motor === 'ON'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      } transition-colors`}
                    >
                      {deterrenceSettings.motor === 'ON' ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  {/* Sound Selection */}
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <label className="block text-lg font-medium text-gray-900 mb-4">
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
                            <SpeakerWaveIcon className="h-6 w-6 mr-3 text-gray-600" />
                            <span className="text-base font-medium text-gray-900">{sound.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detection Toggle */}
              <button
                onClick={toggleDetection}
                className={`w-full py-4 px-6 rounded-xl font-medium text-xl ${
                  isDetecting
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } transition-colors`}
              >
                <div className="flex items-center justify-center">
                  {isDetecting ? (
                    <>
                      <StopCircleIcon className="h-7 w-7 mr-3" />
                      Stop Detection
                    </>
                  ) : (
                    <>
                      <PlayCircleIcon className="h-7 w-7 mr-3" />
                      Start Detection
                    </>
                  )}
                </div>
              </button>
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
