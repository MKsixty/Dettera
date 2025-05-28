export async function fetchDetectionRecords() {
  try {
    const response = await fetch('/api/detections');
    const data = await response.json();
    return data.detections;
  } catch (error) {
    console.error('Error fetching detection records:', error);
    return [];
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