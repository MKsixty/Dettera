import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DEFAULT_MOCK_DIR = path.join(process.cwd(), 'public', 'mock');

// Helper function to get animal type from filename
function getAnimalType(filename) {
  const lowerFilename = filename.toLowerCase();
  if (lowerFilename.includes('penguin')) return 'Penguin';
  if (lowerFilename.includes('deer')) return 'Deer';
  if (lowerFilename.includes('fox')) return 'Fox';
  return 'Unknown';
}

function getAllImages() {
  try {
    const files = fs.readdirSync(DEFAULT_MOCK_DIR);
    return files.filter(file => 
      file.toLowerCase().endsWith('.jpg') || 
      file.toLowerCase().endsWith('.jpeg')
    );
  } catch (error) {
    console.error('Error reading image files:', error);
    return [];
  }
}

function readDetectionRecords() {
  try {
    const recordsPath = path.join(DEFAULT_MOCK_DIR, 'DetectionRecords.txt');
    console.log('Reading records from:', recordsPath);
    
    const content = fs.readFileSync(recordsPath, 'utf8');
    const records = content.split('========================================\n')
      .filter(record => record.trim())
      .map(record => {
        const lines = record.trim().split('\n');
        const imageName = lines[0].replace('Image Name: ', '').trim();
        const duration = parseFloat(lines[1].replace('Duration: ', '').trim());
        
        const deterrence = {
          LED: {},
          Speaker: {},
          motor: 'OFF'
        };

        // Parse deterrence data
        for (let i = 3; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith('LED:')) {
            const [freq, duty] = line.replace('LED:', '').split(',');
            deterrence.LED.frequency = parseInt(freq.split('=')[1].trim());
            deterrence.LED.dutyCycle = parseFloat(duty.split('=')[1].trim());
          } else if (line.startsWith('Speaker:')) {
            const [freq, duty] = line.replace('Speaker:', '').split(',');
            deterrence.Speaker.frequency = parseInt(freq.split('=')[1].trim());
            deterrence.Speaker.dutyCycle = parseFloat(duty.split('=')[1].trim());
          } else if (line.startsWith('motor:')) {
            deterrence.motor = line.split(':')[1].trim();
          }
        }

        return {
          imageName,
          duration,
          deterrence
        };
      });

    return records;
  } catch (error) {
    console.error('Error reading detection records:', error);
    return [];
  }
}

export async function GET() {
  try {
    const records = readDetectionRecords();
    const allImages = getAllImages();
    
    // Create a map of existing records
    const recordMap = new Map(records.map(r => [r.imageName, r]));
    
    // Transform all images into detections
    const detections = allImages.map((imageName, index) => {
      const record = recordMap.get(imageName) || {
        duration: 2.5, // Default duration
        deterrence: {
          LED: { frequency: 50, dutyCycle: 0.5 },
          Speaker: { frequency: 500, dutyCycle: 0.5 },
          motor: 'ON'
        }
      };

      // Extract timestamp from filename or use file stats
      let timestamp;
      if (imageName.startsWith('Image_')) {
        const dateStr = imageName.replace('Image_', '').replace('.jpg', '');
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        const hour = dateStr.substring(9, 11);
        const minute = dateStr.substring(11, 13);
        const second = dateStr.substring(13, 15);
        timestamp = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
      } else {
        // For other files, use current date
        const now = new Date();
        timestamp = now.toISOString().replace('T', ' ').split('.')[0];
      }

      return {
        id: index + 1,
        timestamp,
        imageName,
        duration: record.duration,
        deterrence: record.deterrence,
        imagePath: `/mock/${imageName}`,
        animalType: getAnimalType(imageName)
      };
    });

    // Sort by timestamp (most recent first)
    detections.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return NextResponse.json({ detections });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate incoming data
    if (!data.image || !data.timestamp || !data.animalType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For now, we'll just append the detection to the records file
    const recordsPath = process.env.NEXT_PUBLIC_RECORDS_PATH || path.join(DEFAULT_MOCK_DIR, 'DetectionRecords.txt');
    
    // Format the record entry
    const record = `Image Name: ${data.timestamp}.jpg
Duration: ${data.duration || 0}
Deterrence:
  LED: Frequency = ${data.deterrence?.LED?.frequency || 0}, Duty Cycle = ${data.deterrence?.LED?.dutyCycle || 0}
  Speaker: Frequency = ${data.deterrence?.Speaker?.frequency || 0}, Duty Cycle = ${data.deterrence?.Speaker?.dutyCycle || 0}
  motor: ${data.deterrence?.motor || 'OFF'}
========================================\n`;

    // Append to file
    fs.appendFileSync(recordsPath, record);

    // Save the image if provided
    if (data.image) {
      const imagesPath = process.env.NEXT_PUBLIC_IMAGES_PATH || DEFAULT_MOCK_DIR;
      const imagePath = path.join(imagesPath, `${data.timestamp}.jpg`);
      
      // Ensure the directory exists
      if (!fs.existsSync(imagesPath)) {
        fs.mkdirSync(imagesPath, { recursive: true });
      }

      // Convert base64 to image and save
      const imageBuffer = Buffer.from(data.image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      fs.writeFileSync(imagePath, imageBuffer);
    }

    return NextResponse.json({
      message: 'Detection saved successfully',
      detection: data
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 