"use client";

import { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import Navigation from '@/components/Navigation';
import { fetchDetectionRecords, getDeterrentDescription } from '@/utils/fileUtils';
import {
  PrinterIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowPathRoundedSquareIcon,
  SunIcon,
  SwatchIcon,
  ChartBarIcon,
  ClockIcon,
  BoltIcon,
  SpeakerWaveIcon,
  BeakerIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

// Image Controls Panel Component
const ImageControls = ({ 
  rotation, 
  onRotate, 
  brightness, 
  onBrightnessChange,
  contrast,
  onContrastChange,
  onReset,
  scale,
  onZoomIn,
  onZoomOut
}) => (
  <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
    <div className="flex flex-wrap items-center gap-4">
      {/* Zoom Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onZoomOut}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Zoom Out (-)"
        >
          <MagnifyingGlassMinusIcon className="h-5 w-5" />
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Zoom In (+)"
        >
          <MagnifyingGlassPlusIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Rotation Control */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onRotate(-90)}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Rotate Left (L)"
        >
          <ArrowPathRoundedSquareIcon className="h-5 w-5 -scale-x-100" />
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px] text-center">
          {rotation}°
        </span>
        <button
          onClick={() => onRotate(90)}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Rotate Right (R)"
        >
          <ArrowPathRoundedSquareIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Brightness Control */}
      <div className="flex items-center space-x-2 min-w-[200px]">
        <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <input
          type="range"
          min="0"
          max="200"
          value={brightness}
          onChange={(e) => onBrightnessChange(Number(e.target.value))}
          className="flex-1"
          title="Brightness Adjustment"
        />
        <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[40px]">
          {brightness}%
        </span>
      </div>

      {/* Contrast Control */}
      <div className="flex items-center space-x-2 min-w-[200px]">
        <SwatchIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <input
          type="range"
          min="0"
          max="200"
          value={contrast}
          onChange={(e) => onContrastChange(Number(e.target.value))}
          className="flex-1"
          title="Contrast Adjustment"
        />
        <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[40px]">
          {contrast}%
        </span>
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        Reset All
      </button>
    </div>
  </div>
);

// Image Viewer Modal Component
const ImageViewer = ({ image, title, subtitle, isOpen, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Reset state when image changes
  useEffect(() => {
    resetAllAdjustments();
  }, [image]);

  // Reset all image adjustments
  const resetAllAdjustments = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setBrightness(100);
    setContrast(100);
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e) => {
      switch (e.key.toLowerCase()) {
        case 'escape':
          onClose();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
        case '_':
          handleZoomOut();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case '0':
          resetAllAdjustments();
          break;
        case 'l':
          handleRotate(-90);
          break;
        case 'r':
          handleRotate(90);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image;
    link.download = `${title.replace(/[: ]/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      const newScale = Math.max(0.5, Math.min(3, scale + delta));
      setScale(newScale);
    }
  };

  // Pan/drag functionality
  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Calculate bounds
      const container = containerRef.current;
      const image = imageRef.current;
      if (container && image) {
        const bounds = {
          x: {
            min: container.clientWidth - (image.width * scale),
            max: 0
          },
          y: {
            min: container.clientHeight - (image.height * scale),
            max: 0
          }
        };

        setPosition({
          x: Math.max(bounds.x.min, Math.min(bounds.x.max, newX)),
          y: Math.max(bounds.y.min, Math.min(bounds.y.max, newY))
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Rotation handler
  const handleRotate = (degrees) => {
    setRotation((prev) => {
      const newRotation = (prev + degrees) % 360;
      return newRotation < 0 ? newRotation + 360 : newRotation;
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        ref={containerRef}
        className="relative bg-white dark:bg-gray-800 w-full max-w-[90vw] mx-4 rounded-lg flex flex-col"
        style={{ height: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Toggle Fullscreen (F)"
            >
              {isFullscreen ? (
                <ArrowsPointingInIcon className="h-5 w-5" />
              ) : (
                <ArrowsPointingOutIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              title="Download Image"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-1" />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Close (Esc)"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div 
          className="flex-1 relative overflow-hidden bg-gray-100 dark:bg-gray-900"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              ref={imageRef}
              src={image}
              alt={title}
              className="max-h-full max-w-none select-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'all 0.2s ease-out',
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                transformOrigin: 'center',
              }}
              draggable="false"
            />
          </div>
        </div>

        {/* Controls at the bottom */}
        <div className="border-t dark:border-gray-700">
          <ImageControls
            rotation={rotation}
            onRotate={handleRotate}
            brightness={brightness}
            onBrightnessChange={setBrightness}
            contrast={contrast}
            onContrastChange={setContrast}
            onReset={resetAllAdjustments}
            scale={scale}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
          />

          {/* Keyboard Shortcuts Help */}
          <div className="p-2 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-700">
            <span className="mr-4">Shortcuts:</span>
            <span className="mr-3">+/- : Zoom</span>
            <span className="mr-3">0 : Reset</span>
            <span className="mr-3">F : Fullscreen</span>
            <span className="mr-3">L/R : Rotate</span>
            <span>Esc : Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for the printable content
const PrintableContent = ({ detections }) => (
  <div className="p-8">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900">Dettera Detection History</h1>
      <p className="text-gray-600 mt-2">Generated on {new Date().toLocaleDateString()}</p>
    </div>

    <div className="space-y-8">
      {detections.map((detection) => (
        <div key={detection.id} className="border rounded-lg p-6 page-break-inside-avoid">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{detection.animal} Detection</h2>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Time</dt>
                  <dd className="text-sm text-gray-900">{detection.timestamp}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="text-sm text-gray-900">{detection.location}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Deterrent Method</dt>
                  <dd className="text-sm text-gray-900">{detection.deterrentMethod}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Duration</dt>
                  <dd className="text-sm text-gray-900">{detection.duration}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Outcome</dt>
                  <dd className={`text-sm font-medium ${
                    detection.outcome === 'Deterred' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {detection.outcome}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="relative h-48 rounded-lg overflow-hidden">
              <img
                src={detection.image}
                alt={`${detection.animal} detection`}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function HistoryPage() {
  const [detections, setDetections] = useState([]);
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterDeterrent, setFilterDeterrent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');
  const [detectionStats, setDetectionStats] = useState({
    animalTypes: {},
    deterrentEffectiveness: {
      successful: 0,
      total: 0
    },
    averageDuration: 0,
    deterrentUsage: {
      led: 0,
      sound: 0,
      spray: 0,
      total: 0
    },
    deterrentCombinations: []
  });
  
  const printRef = useRef();

  // Date filter options
  const dateFilterOptions = [
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'week' },
    { label: 'Last 30 Days', value: 'month' },
    { label: 'Custom Range', value: 'custom' }
  ];

  // Handle quick date filter changes
  const handleDateFilterChange = (filterValue) => {
    setSelectedDateFilter(filterValue);
    const today = new Date();
    let start = '';
    let end = today.toISOString().split('T')[0];

    switch (filterValue) {
      case 'today':
        start = end;
        break;
      case 'week':
        start = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
        break;
      case 'month':
        start = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];
        break;
      case 'all':
        start = '';
        end = '';
        break;
      case 'custom':
        // Keep existing custom range if set
        return;
      default:
        break;
    }

    setDateRange({ start, end });
  };

  // Helper function to calculate variability (standard deviation)
  function calculateVariability(durations) {
    const mean = durations.reduce((a, b) => a + b, 0) / durations.length;
    const variance = durations.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / durations.length;
    return Math.sqrt(variance);
  }

  useEffect(() => {
    async function loadDetections() {
      try {
        const records = await fetchDetectionRecords();
        console.log('Fetched records:', records);
        
        // Transform records into the format needed for display
        const transformedRecords = records.map(record => ({
          id: record.id,
          timestamp: record.timestamp,
          image: record.imagePath,
          duration: `${record.duration.toFixed(2)} seconds`,
          deterrentMethod: getDeterrentDescription(record.deterrence),
          outcome: 'Deterred',
          animalType: record.animalType || 'Unknown'
        }));

        // Calculate statistics
        const stats = {
          animalTypes: {},
          deterrentEffectiveness: {
            successful: records.length,
            total: records.length
          },
          averageDuration: 0,
          deterrentUsage: {
            led: 0,
            sound: 0,
            spray: 0,
            total: records.length
          },
          deterrentCombinations: []
        };

        let totalDuration = 0;
        const combinationsMap = new Map();

        records.forEach(record => {
          // Count animal types
          stats.animalTypes[record.animalType] = (stats.animalTypes[record.animalType] || 0) + 1;

          // Sum duration
          totalDuration += record.duration;

          // Count deterrent methods
          if (record.deterrence.LED.frequency) stats.deterrentUsage.led++;
          if (record.deterrence.Speaker.frequency) stats.deterrentUsage.sound++;
          if (record.deterrence.motor === 'ON') stats.deterrentUsage.spray++;

          // Analyze deterrent combinations
          const methods = [];
          if (record.deterrence.LED.frequency) methods.push('LED');
          if (record.deterrence.Speaker.frequency) methods.push('Sound');
          if (record.deterrence.motor === 'ON') methods.push('Spray');
          
          const combinationKey = methods.sort().join(' + ');
          if (!combinationsMap.has(combinationKey)) {
            combinationsMap.set(combinationKey, {
              methods: combinationKey,
              count: 0,
              totalDuration: 0,
              durations: []
            });
          }
          
          const combo = combinationsMap.get(combinationKey);
          combo.count++;
          combo.totalDuration += record.duration;
          combo.durations.push(record.duration);
        });

        stats.averageDuration = totalDuration / records.length;

        // Process combinations data
        stats.deterrentCombinations = Array.from(combinationsMap.values())
          .map(combo => ({
            ...combo,
            averageDuration: combo.totalDuration / combo.count,
            effectiveness: combo.count / records.length,
            variability: calculateVariability(combo.durations)
          }))
          .sort((a, b) => a.averageDuration - b.averageDuration);

        setDetectionStats(stats);
        setDetections(transformedRecords);
      } catch (error) {
        console.error('Error loading detections:', error);
      }
    }

    loadDetections();
  }, []);
  
  // Handle printing
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Dettera_Detection_History',
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        .page-break-inside-avoid {
          page-break-inside: avoid;
        }
      }
    `
  });

  // Sort detections
  const sortedDetections = [...detections].sort((a, b) => {
    if (sortField === 'timestamp') {
      return sortDirection === 'asc'
        ? new Date(a.timestamp) - new Date(b.timestamp)
        : new Date(b.timestamp) - new Date(a.timestamp);
    }
    const aValue = a[sortField];
    const bValue = b[sortField];
    return sortDirection === 'asc' 
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  // Filter detections based on all criteria
  const filteredDetections = sortedDetections.filter(detection => {
    const matchesDeterrent = !filterDeterrent || 
      detection.deterrentMethod.toLowerCase().includes(filterDeterrent.toLowerCase());
    
    // Date filtering
    const detectionDate = new Date(detection.timestamp).toISOString().split('T')[0];
    const matchesDateRange = (!dateRange.start || detectionDate >= dateRange.start) &&
                           (!dateRange.end || detectionDate <= dateRange.end);

    return matchesDeterrent && matchesDateRange;
  });

  // Toggle sort direction
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Title */}
          <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Detection History</h1>
            <p className="mt-2 text-gray-600">
              A comprehensive analysis and record of all animal detections and deterrent actions.
            </p>
          </div>

          {/* Analysis Section */}
          <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-2 border-b">
              Detection Analysis
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Deterrent Effectiveness Analysis */}
              <section className="bg-white border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-medium text-gray-900 mb-4 pb-2 border-b">
                  Deterrent Effectiveness
                </h3>
                <div className="space-y-4">
                  {detectionStats.deterrentCombinations.map((combo, index) => (
                    <div key={combo.methods} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{combo.methods}</span>
                        <span className={`text-sm font-medium ${
                          index === 0 ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {combo.averageDuration.toFixed(1)}s avg
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Usage Rate:</span>
                          <span>{(combo.effectiveness * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Consistency:</span>
                          <span>{combo.variability.toFixed(2)} σ</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              index === 0 ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${combo.effectiveness * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Animal Distribution */}
                <section className="bg-white border rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-medium text-gray-900 mb-4 pb-2 border-b">
                    Animal Distribution
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(detectionStats.animalTypes).map(([animal, count]) => (
                      <div key={animal} className="flex items-center bg-gray-50 p-3 rounded-lg border">
                        <span className="text-sm font-medium text-gray-900 w-24">{animal}</span>
                        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden mx-2">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(count / detectionStats.deterrentEffectiveness.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600 w-16 text-right">
                          {((count / detectionStats.deterrentEffectiveness.total) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Deterrent Usage */}
                <section className="bg-white border rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-medium text-gray-900 mb-4 pb-2 border-b">
                    Deterrent Method Usage
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <BoltIcon className="h-6 w-6 text-blue-500" />
                        <span className="text-lg font-medium text-gray-900">
                          {((detectionStats.deterrentUsage.led / detectionStats.deterrentUsage.total) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-600 mt-2">LED</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <SpeakerWaveIcon className="h-6 w-6 text-purple-500" />
                        <span className="text-lg font-medium text-gray-900">
                          {((detectionStats.deterrentUsage.sound / detectionStats.deterrentUsage.total) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-600 mt-2">Sound</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <BeakerIcon className="h-6 w-6 text-green-500" />
                        <span className="text-lg font-medium text-gray-900">
                          {((detectionStats.deterrentUsage.spray / detectionStats.deterrentUsage.total) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-600 mt-2">Spray</p>
                    </div>
                  </div>
                </section>

                {/* Performance Metrics */}
                <section className="bg-white border rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-medium text-gray-900 mb-4 pb-2 border-b">
                    Performance Metrics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <ChartBarIcon className="h-6 w-6 text-indigo-500" />
                        <span className="text-lg font-medium text-gray-900">
                          {((detectionStats.deterrentEffectiveness.successful / detectionStats.deterrentEffectiveness.total) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-600 mt-2">Success Rate</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <ClockIcon className="h-6 w-6 text-indigo-500" />
                        <span className="text-lg font-medium text-gray-900">
                          {detectionStats.averageDuration.toFixed(1)}s
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-600 mt-2">Avg Duration</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* History Table Section */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="sm:flex sm:items-center mb-6">
              <div className="sm:flex-auto">
                <h2 className="text-2xl font-semibold text-gray-900">Detection Records</h2>
                <p className="mt-2 text-gray-600">
                  Detailed history of all detection events and outcomes.
                </p>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={handlePrint}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
                  <PrinterIcon className="h-4 w-4 mr-2" />
            Print Report
          </button>
              </div>
        </div>

            {/* Enhanced Filters Section */}
            <div className="space-y-4 mb-6">
              {/* Date Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
              </label>
                  <div className="flex flex-wrap gap-2">
                    {dateFilterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleDateFilterChange(option.value)}
                        className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                          selectedDateFilter === option.value
                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        } border`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {(selectedDateFilter === 'custom') && (
                  <div className="flex items-end gap-2">
                    <div>
                      <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                <input
                        type="date"
                        id="start-date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
                    <div>
                      <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
              </label>
                      <input
                        type="date"
                        id="end-date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Deterrent Method Filter */}
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={filterDeterrent}
                  onChange={(e) => setFilterDeterrent(e.target.value)}
                  placeholder="Filter by deterrent method..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {filterDeterrent && (
                  <button
                    onClick={() => setFilterDeterrent('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  </button>
                )}
            </div>

              {/* Active Filters Display */}
              {(filterDeterrent || dateRange.start || dateRange.end) && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-sm text-gray-500">Active filters:</span>
                  {filterDeterrent && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Method: {filterDeterrent}
                      <button
                        onClick={() => setFilterDeterrent('')}
                        className="ml-1 inline-flex items-center"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </span>
                  )}
                  {(dateRange.start || dateRange.end) && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Date: {dateRange.start || 'Any'} to {dateRange.end || 'Any'}
                      <button
                        onClick={() => {
                          setDateRange({ start: '', end: '' });
                          setSelectedDateFilter('all');
                        }}
                        className="ml-1 inline-flex items-center"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </span>
                  )}
          </div>
              )}
        </div>

            {/* Table */}
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                          <th
                    scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('timestamp')}
                  >
                    <div className="flex items-center space-x-1">
                              <span>Timestamp</span>
                              {sortField === 'timestamp' && (
                        sortDirection === 'asc' ? (
                          <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4" />
                        )
                      )}
                    </div>
                  </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('deterrentMethod')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Deterrent Method</span>
                              {sortField === 'deterrentMethod' && (
                                sortDirection === 'asc' ? (
                                  <ChevronUpIcon className="h-4 w-4" />
                                ) : (
                                  <ChevronDownIcon className="h-4 w-4" />
                                )
                              )}
                            </div>
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Duration
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Outcome
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Image
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDetections.map((detection) => (
                <tr key={detection.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {detection.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {detection.deterrentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {detection.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {detection.outcome}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div 
                      className="h-12 w-12 rounded-md overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                      onClick={() => setSelectedImage(detection)}
                    >
                      <img
                        src={detection.image}
                                  alt={`Detection at ${detection.timestamp}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Printable Content (hidden) */}
        <div className="hidden">
          <div ref={printRef}>
            <PrintableContent detections={filteredDetections} />
          </div>
        </div>

        {/* Image Viewer Modal */}
        <ImageViewer
          image={selectedImage?.image}
          title={`Detection at ${selectedImage?.timestamp}`}
          subtitle={`Duration: ${selectedImage?.duration} | Method: ${selectedImage?.deterrentMethod}`}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
          </div>
    </>
  );
} 