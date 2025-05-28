# Predator Dettera

A smart wildlife detection and deterrence system built with Next.js that helps monitor and manage wildlife interactions using automated detection and customizable deterrence methods.

## Features

- 🦊 Wildlife Detection: Automatically detects and classifies different types of animals (Penguin, Deer, Fox)
- 📸 Image Management: Stores and manages detection images with timestamps
- 🚨 Deterrence System: Configurable deterrence methods including:
  - LED controls (frequency and duty cycle)
  - Speaker controls (frequency and duty cycle)
  - Motor controls (ON/OFF)
- 📊 Detection Records: Maintains detailed logs of all detections and deterrence actions
- 🌐 REST API: Full API support for retrieving detections and adding new records

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/your-username/predator_dettera.git
cd predator_dettera
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## API Endpoints

### GET /api/detections
Retrieves all detection records with their associated images and deterrence settings.

### POST /api/detections
Add a new detection record with the following structure:
```json
{
  "image": "base64_encoded_image",
  "timestamp": "YYYY-MM-DD HH:mm:ss",
  "animalType": "Penguin|Deer|Fox",
  "duration": 2.5,
  "deterrence": {
    "LED": {
      "frequency": 50,
      "dutyCycle": 0.5
    },
    "Speaker": {
      "frequency": 500,
      "dutyCycle": 0.5
    },
    "motor": "ON|OFF"
  }
}
```

## Project Structure

- `/public/mock`: Contains mock images and detection records for testing
- `/src/app/api`: API routes for handling detections
- `/src/app/components`: React components for the UI

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](https://choosealicense.com/licenses/mit/)
