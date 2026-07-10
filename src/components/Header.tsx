'use client';

import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between font-sans select-none shrink-0">
      {/* Brand Title */}
      <div>
        <h2 className="text-2xl font-black text-burgundy tracking-tight">DataForge Manager</h2>
      </div>

      {/* Middle/Right Items */}
      <div className="flex items-center gap-6">
        {/* Search Input */}
        <div className="relative w-72">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar registros..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition-all duration-200"
          />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2">
          <button className="p-2 text-burgundy bg-burgundy-light hover:bg-burgundy/10 rounded-full transition-all duration-200 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-burgundy border-2 border-white rounded-full" />
          </button>
          <button className="p-2 text-gray-500 hover:text-burgundy hover:bg-gray-100 rounded-full transition-all duration-200">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200" />

        {/* User profile */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800 leading-tight">Alex Rivera</p>
            <p className="text-xs text-gray-500 font-semibold leading-tight">Coordinador</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-burgundy-light border border-burgundy/15 overflow-hidden flex items-center justify-center text-burgundy font-bold text-sm">
            AR
          </div>
        </div>
      </div>
    </header>
  );
}
