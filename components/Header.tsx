"use client";

import { motion } from "framer-motion";
import { MapPin, Search } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent relative">
                DealHub
              </h1>
            </motion.div>
          </Link>

          {/* Search Bar - Airbnb style */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="w-full"
            >
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-full border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-2 flex-1">
                  <Search size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-600">Search deals...</span>
                </div>
                <div className="h-6 w-px bg-gray-300"></div>
                <MapPin size={18} className="text-gray-400" />
              </div>
            </motion.div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
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
