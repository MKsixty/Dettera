export async function fetchDetectionRecords() {
  try {
    // Get API records
    const response = await fetch('/api/detections');
    const data = await response.json();
    const apiRecords = data.detections || [];
    
    // Generate mock honey badger data
    const mockHoneyBadgerRecords = generateMockHoneyBadgerData();
    
    // Combine API and mock data, sort by timestamp
    const allRecords = [...apiRecords, ...mockHoneyBadgerRecords].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return allRecords;
  } catch (error) {
    console.error('Error fetching detection records:', error);
    // If API fetch fails, return only mock data
    return generateMockHoneyBadgerData();
  }
}

export function getDeterrentDescription(deterrence) {
  const methods = [];
  if (deterrence.LED.frequency) {
    methods.push(`LED (${deterrence.LED.frequency}Hz)`);
  }
  if (deterrence.Speaker.frequency) {
    methods.push(`Sound (${deterrence.Speaker.frequency}Hz)`);
  }
  if (deterrence.motor === 'ON') {
    methods.push('deterrent spray');
  }
  return methods.join(' + ');
}

export function getTimeAgo(timestamp) {
  const now = new Date();
  const detectionTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now - detectionTime) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

export async function getOptimizedDeterrentSettings(animalType) {
  try {
    const records = await fetchDetectionRecords();
    
    // Filter records for the specific animal type
    const animalRecords = records.filter(record => 
      record.animalType.toLowerCase() === animalType.toLowerCase()
    );

    if (animalRecords.length === 0) {
      // Default settings if no data available
      const defaultSettings = {
        LED: { frequency: 50, dutyCycle: 0.5 },
        Speaker: { frequency: 500, dutyCycle: 0.5 },
        motor: 'ON'
      };
      return [{
        settings: defaultSettings,
        averageDuration: 0,
        effectiveness: 0,
        variability: 0,
        totalUses: 0
      }];
    }

    // Group records by deterrent combinations
    const combinationsMap = new Map();
    
    animalRecords.forEach(record => {
      const key = JSON.stringify({
        LED: record.deterrence.LED,
        Speaker: record.deterrence.Speaker,
        motor: record.deterrence.motor
      });

      if (!combinationsMap.has(key)) {
        combinationsMap.set(key, {
          settings: record.deterrence,
          count: 0,
          totalDuration: 0,
          durations: []
        });
      }

      const combo = combinationsMap.get(key);
      combo.count++;
      combo.totalDuration += record.duration;
      combo.durations.push(record.duration);
    });

    // Calculate effectiveness metrics
    const effectivenessData = Array.from(combinationsMap.entries()).map(([key, data]) => ({
      settings: data.settings,
      averageDuration: data.totalDuration / data.count,
      effectiveness: data.count / animalRecords.length,
      variability: calculateVariability(data.durations),
      totalUses: data.count
    }));

    // Sort by effectiveness (lower duration is better) and consistency (lower variability is better)
    effectivenessData.sort((a, b) => {
      // Prioritize effectiveness (duration)
      const durationDiff = a.averageDuration - b.averageDuration;
      if (Math.abs(durationDiff) > 1) return durationDiff;
      
      // If durations are similar, prefer more consistent results
      return a.variability - b.variability;
    });

    // Return top 3 most effective settings
    return effectivenessData.slice(0, 3);
  } catch (error) {
    console.error('Error getting optimized settings:', error);
    // Return default settings on error
    const defaultSettings = {
      LED: { frequency: 50, dutyCycle: 0.5 },
      Speaker: { frequency: 500, dutyCycle: 0.5 },
      motor: 'ON'
    };
    return [{
      settings: defaultSettings,
      averageDuration: 0,
      effectiveness: 0,
      variability: 0,
      totalUses: 0
    }];
  }
}

// Helper function to calculate variability (standard deviation)
function calculateVariability(durations) {
  const mean = durations.reduce((a, b) => a + b, 0) / durations.length;
  const variance = durations.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / durations.length;
  return Math.sqrt(variance);
}

// Mock data generator for honey badger detections
function generateMockHoneyBadgerData() {
  const now = new Date();
  const mockDetections = [];

  // Different deterrent combinations we'll simulate
  const deterrentCombos = [
    {
      LED: { frequency: 800, dutyCycle: 0.8 },
      Speaker: { frequency: 15000, dutyCycle: 0.9 },
      motor: 'ON'
    },
    {
      LED: { frequency: 600, dutyCycle: 0.7 },
      Speaker: { frequency: 12000, dutyCycle: 0.85 },
      motor: 'ON'
    },
    {
      LED: { frequency: 1000, dutyCycle: 0.9 },
      Speaker: { frequency: 18000, dutyCycle: 0.95 },
      motor: 'ON'
    },
    {
      LED: { frequency: 400, dutyCycle: 0.6 },
      Speaker: { frequency: 10000, dutyCycle: 0.8 },
      motor: 'OFF'
    }
  ];

  // Generate 20 mock detections
  for (let i = 0; i < 20; i++) {
    const timeOffset = i * 3600000; // Each detection 1 hour apart
    const deterrenceIndex = i % deterrentCombos.length;
    const baseDuration = [8, 12, 15, 20][deterrenceIndex]; // Different base durations for different combos
    const randomVariation = (Math.random() - 0.5) * 4; // ±2 seconds variation

    mockDetections.push({
      id: `hb_${i + 1}`,
      timestamp: new Date(now.getTime() - timeOffset).toISOString(),
      imagePath: '/mock/Image_20250527_200152.jpg', // Using the specified image
      duration: baseDuration + randomVariation,
      animalType: 'Honey Badger',
      deterrence: deterrentCombos[deterrenceIndex]
    });
  }

  return mockDetections;
}