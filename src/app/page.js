'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [detectedAnimal, setDetectedAnimal] = useState('Elephant');
  const [systemActive, setSystemActive] = useState(true);
  const [manualOverride, setManualOverride] = useState(false);
  const [suggestedDeterrent, setSuggestedDeterrent] = useState({
    name: 'Ultrasonic Sound',
    successRate: 87,
  });

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800">Predator Deterrent System</h1>
        <nav className="flex space-x-4">
          <Link href="/settings">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Settings</button>
          </Link>
          <Link href="/detect">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Detect</button>
          </Link>
          <Link href="/history">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">History</button>
          </Link>
        </nav>
      </header>

      {/* Detection Status */}
      <section className="bg-white rounded shadow p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-2">System Status</h2>
        <p>
          Detection System:{" "}
          <span className={`font-bold ${systemActive ? 'text-green-600' : 'text-red-600'}`}>
            {systemActive ? 'Active' : 'Inactive'}
          </span>
        </p>
        <p>Last Detected Animal: <strong>{detectedAnimal}</strong></p>
        <p>Used Deterrent: <strong>{suggestedDeterrent.name}</strong></p>
      </section>

      {/* Camera Feed */}
      <section className="bg-white rounded shadow p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-2">Live Camera / Last Capture</h2>
        <div className="flex justify-center">
          <img
            src="https://source.unsplash.com/600x400/?wild-animal"
            alt="Camera feed or last detected animal"
            className="rounded-lg shadow-md"
          />
        </div>
      </section>

      {/* Manual Override */}
      <section className="bg-white rounded shadow p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Manual Override</h2>
        <p>Suggested Deterrent based on historical data: <strong>{suggestedDeterrent.name}</strong></p>
        <p>Success Rate: <strong>{suggestedDeterrent.successRate}%</strong></p>
        <button
          onClick={() => setManualOverride(prev => !prev)}
          className={`mt-4 px-4 py-2 font-semibold text-white rounded transition duration-300
            ${manualOverride ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {manualOverride ? 'Turn OFF Override' : 'Turn ON Override'}
        </button>
      </section>

      <footer className="mt-12 text-center text-sm text-blue-800">
        &copy; {new Date().getFullYear()} Predator Deterrent System
      </footer>
    </main>
  );
}
