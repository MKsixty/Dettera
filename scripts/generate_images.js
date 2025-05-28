const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const imageNames = [
  'Image_20240327_143000.jpg',
  'Image_20240327_143500.jpg',
  'Image_20240327_144000.jpg'
];

const imagesDir = path.join(process.cwd(), 'public', 'data', 'images');

// Ensure the directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Create a placeholder image
function createPlaceholderImage(width, height, text) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, height);

  // Add text
  ctx.fillStyle = '#666666';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  return canvas.toBuffer('image/jpeg');
}

// Generate images
imageNames.forEach((imageName) => {
  const imageBuffer = createPlaceholderImage(400, 300, 'Detection Image');
  fs.writeFileSync(path.join(imagesDir, imageName), imageBuffer);
  console.log(`Created ${imageName}`);
}); 