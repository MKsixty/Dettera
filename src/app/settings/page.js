"use client";

import { useState } from "react";
import { Switch } from "@headlessui/react";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  return (
    <main className="max-w-4xl mx-auto p-6 sm:p-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

      {/* Profile Section */}
      <section className="bg-white shadow-md rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Profile</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Full Name
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Email Address
            </label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>
        </form>
      </section>

      {/* Notifications Section */}
      <section className="bg-white shadow-md rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Notifications
        </h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span>Email Notifications</span>
            <Switch
              checked={emailNotifications}
              onChange={setEmailNotifications}
              className={`${
                emailNotifications ? "bg-blue-600" : "bg-gray-300"
              } relative inline-flex h-6 w-11 items-center rounded-full transition`}
            >
              <span
                className={`${
                  emailNotifications ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform bg-white rounded-full transition`}
              />
            </Switch>
          </div>

          <div className="flex items-center justify-between">
            <span>SMS Notifications</span>
            <Switch
              checked={smsNotifications}
              onChange={setSmsNotifications}
              className={`${
                smsNotifications ? "bg-blue-600" : "bg-gray-300"
              } relative inline-flex h-6 w-11 items-center rounded-full transition`}
            >
              <span
                className={`${
                  smsNotifications ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform bg-white rounded-full transition`}
              />
            </Switch>
          </div>
        </div>
      </section>

      {/* Account Preferences Section */}
      <section className="bg-white shadow-md rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Account Preferences
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Language
            </label>
            <select className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
          <div>
            <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Delete Account
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
  


