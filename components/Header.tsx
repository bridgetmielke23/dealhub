"use client";

import { motion } from "framer-motion";
import { MapPin, Search, X } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  resultCount?: number;
}

export default function Header({ searchQuery = '', onSearchChange, resultCount = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/95 w-full">
      <div className="w-full px-3 sm:px-4 lg:px-8">
        {/* Mobile Layout - Stacked - Always visible */}
        <div className="flex flex-col md:hidden gap-3 py-3 min-h-[120px]">
          {/* Top Row: Logo and Actions */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <h1 className="text-xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                DealHub
              </h1>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="px-3 py-1.5 text-xs font-medium text-gray-700 active:bg-gray-100 rounded-full transition-colors touch-manipulation"
              >
                Admin
              </Link>
              <button className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-semibold rounded-full touch-manipulation">
                Sign in
              </button>
            </div>
          </div>
          {/* Search Bar - Full width on mobile, more prominent */}
          <div className="w-full relative z-10">
            <div className="flex items-center gap-2 px-4 py-3.5 bg-white rounded-full border-2 border-gray-300 shadow-md focus-within:border-rose-500 focus-within:shadow-lg transition-all">
              <Search size={20} className="text-rose-500 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder="Search deals, restaurants, 'free'..."
                className="flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-500 text-base font-medium"
                autoComplete="off"
                autoFocus={false}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange?.('')}
                  className="p-1.5 active:bg-gray-200 rounded-full transition-colors flex-shrink-0 touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="Clear search"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              )}
            </div>
            {searchQuery && resultCount > 0 && (
              <div className="mt-2 px-2">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold text-rose-600">{resultCount}</span> {resultCount === 1 ? 'deal' : 'deals'} found
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Layout - Horizontal */}
        <div className="hidden md:flex items-center justify-between h-16 lg:h-20 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent relative">
                DealHub
              </h1>
            </motion.div>
          </Link>

          {/* Search Bar - Functional */}
          <div className="flex-1 max-w-2xl">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="w-full"
            >
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-full border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
                <Search size={18} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  placeholder="Search deals, restaurants, 'free', or locations..."
                  className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400 text-sm"
                />
                {searchQuery && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onSearchChange?.('')}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                  >
                    <X size={16} className="text-gray-400" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/admin"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              Admin
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-semibold rounded-full hover:shadow-lg transition-shadow"
            >
              Sign in
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}
