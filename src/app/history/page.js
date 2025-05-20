"use client";

import { useState } from 'react';

export default function HistoryPage() {
  const [dateRange, setDateRange] = useState('week');
  const [detectionHistory] = useState([
    {
      id: 1,
      date: '2024-03-20',
      time: '14:30',
      animal: 'Elephant',
      action: 'Ultrasonic Sound',
      success: true,
    },
    {
      id: 2,
      date: '2024-03-19',
      time: '23:15',
      animal: 'Wild Boar',
      action: 'Light Flash',
      success: true,
    },
    {
      id: 3,
      date: '2024-03-18',
      time: '03:45',
      animal: 'Leopard',
      action: 'Sound Alarm',
      success: false,
    },
  ]);

  return (
    <main className="max-w-4xl mx-auto p-6 sm:p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Detection History</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="day">Last 24 Hours</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* History Table */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Animal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action Taken</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {detectionHistory.map((detection) => (
                <tr key={detection.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detection.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detection.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detection.animal}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detection.action}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      detection.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {detection.success ? 'Success' : 'Failed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
} 