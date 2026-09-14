'use client';

import React from 'react';
import {
  LayoutDashboard,
  Table,
  MapPinned,
  Database,
  History,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'datatables', label: 'Data Tables', icon: Table },
    { id: 'programa', label: 'Preaching Program', icon: MapPinned },
    { id: 'querybuilder', label: 'Query Builder', icon: Database },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const bottomItems = [
    { id: 'support', label: 'Support', icon: HelpCircle },
    { id: 'signout', label: 'Sign Out', icon: LogOut },
  ];

  return (
    <aside className="w-64 bg-sidebar text-gray-400 flex flex-col justify-between min-h-screen border-r border-gray-800 shrink-0 font-sans select-none">
      {/* Upper section */}
      <div>
        {/* Logo and Brand */}
        <div className="p-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-burgundy flex items-center justify-center text-white font-bold text-lg shadow-md shadow-burgundy/20">
              📊
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-wide">Admin Panel</h1>
              <p className="text-xs text-gray-500 font-medium">V 2.4.0</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 text-left relative ${
                  isActive 
                    ? 'bg-sidebar-active text-white font-bold' 
                    : 'hover:bg-sidebar-active/40 hover:text-gray-200'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-burgundy rounded-r" />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="p-3 border-t border-gray-800/50 mb-4">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'signout' && onLogout) {
                  onLogout();
                } else {
                  alert(`Acción: ${item.label}`);
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold hover:bg-sidebar-active/40 hover:text-gray-200 transition-all duration-200 text-left"
            >
              <Icon className="w-5 h-5 text-gray-500" />
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
