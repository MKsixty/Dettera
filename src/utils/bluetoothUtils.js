export class BluetoothAudioController {
  constructor() {
    this.device = null;
    this.server = null;
    this.service = null;
    this.characteristic = null;
    this.isBluetoothSupported = typeof navigator !== 'undefined' && navigator.bluetooth;
  }

  async connect(deviceName = 'WH-CH510') {
    if (!this.isBluetoothSupported) {
      console.warn('Web Bluetooth API is not supported in this browser or is disabled.');
      return false;
    }

    try {
      // The A2DP Sink service UUID for audio streaming
      const A2DP_SINK_UUID = '0000110b-0000-1000-8000-00805f9b34fb';
      // The AVRCP (Audio/Video Remote Control Profile) service UUID
      const AVRCP_UUID = '0000110e-0000-1000-8000-00805f9b34fb';

      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ name: deviceName }],
        optionalServices: [A2DP_SINK_UUID, AVRCP_UUID]
      });

      console.log('Bluetooth device selected:', this.device.name);

      this.server = await this.device.gatt.connect();
      console.log('Connected to GATT server');

      // Try to get the A2DP service
      try {
        this.service = await this.server.getPrimaryService(A2DP_SINK_UUID);
        console.log('Got A2DP service');
      } catch (error) {
        console.log('A2DP service not available, trying AVRCP');
        this.service = await this.server.getPrimaryService(AVRCP_UUID);
        console.log('Got AVRCP service');
      }

      return true;
    } catch (error) {
      console.error('Bluetooth connection failed:', error);
      return false;
    }
  }

  async disconnect() {
    if (this.device && this.device.gatt.connected) {
      await this.device.gatt.disconnect();
      console.log('Disconnected from device');
    }
  }

  isConnected() {
    return this.device && this.device.gatt.connected;
  }

  getDeviceName() {
    return this.device ? this.device.name : null;
  }

  isSupported() {
    return this.isBluetoothSupported;
  }
}

export const playAudioFile = async (filePath) => {
  try {
    const audio = new Audio(filePath);
    
    // Only try to set Bluetooth output if the API is available
    if (navigator.mediaDevices && navigator.mediaDevices.selectAudioOutput) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const bluetoothDevice = devices.find(device => 
          device.kind === 'audiooutput' && 
          device.label.includes('WH-CH510')
        );
        
        if (bluetoothDevice) {
          await audio.setSinkId(bluetoothDevice.deviceId);
          console.log('Audio output set to Bluetooth device');
        } else {
          console.log('Using default audio output');
        }
      } catch (error) {
        console.warn('Could not set audio output:', error);
      }
    } else {
      console.log('Audio output selection not supported, using system default');
    }

    await audio.play();
    return audio;
  } catch (error) {
    console.error('Error playing audio:', error);
    return null;
  }
};

export const stopAudio = (audio) => {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}; 