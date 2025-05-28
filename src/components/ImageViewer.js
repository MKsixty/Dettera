import { useState, useRef, useEffect } from 'react';
import {
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  ArrowPathRoundedSquareIcon,
  SunIcon,
  SwatchIcon,
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

// Image Viewer Component
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
    link.download = `image-${Date.now()}.jpg`;
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
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
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

export default ImageViewer; 