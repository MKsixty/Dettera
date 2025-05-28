'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  CameraIcon,
  ClockIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  BellIcon,
  SpeakerWaveIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <>
      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold text-blue-900 cursor-pointer">Dettera</h1>
              </Link>
            </div>
            <div className="flex space-x-4">
              {[
                { href: '/', icon: HomeIcon, text: 'Home' },
                { href: '/detect', icon: CameraIcon, text: 'Detect' },
                { href: '/history', icon: ClockIcon, text: 'History' },
                { href: '/settings', icon: Cog6ToothIcon, text: 'Settings' },
                { href: '/logs', icon: DocumentTextIcon, text: 'Logs' },
                { href: '/about', icon: InformationCircleIcon, text: 'About' },
              ].map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium 
                    ${isActive(item.href) 
                      ? 'text-blue-800 bg-blue-50' 
                      : 'text-gray-900 hover:text-blue-800 hover:bg-blue-50'
                    }`}
                >
                  <item.icon className="h-5 w-5 mr-1" />
                  <span className="hidden md:block">{item.text}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Quick Actions Panel */}
      <div className="fixed top-16 left-0 right-0 bg-white shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h2 className="text-lg font-bold text-gray-900 whitespace-nowrap">Quick Actions</h2>
              <div className="flex space-x-4">
                {[
                  { icon: CameraIcon, text: 'Detect Now', href: '/detect' },
                  { icon: SpeakerWaveIcon, text: 'Trigger Deterrent', href: '/detect' },
                  { icon: DocumentChartBarIcon, text: 'View Report', href: '/history' },
                ].map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    passHref
                    className="flex items-center px-4 py-2 bg-blue-700 text-white font-medium rounded-md hover:bg-blue-800 whitespace-nowrap"
                  >
                    <action.icon className="h-5 w-5 mr-2" />
                    {action.text}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden under the fixed navigation */}
      <div className="h-32"></div>
    </>
  );
} 