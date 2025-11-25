"use client";

import { motion } from "framer-motion";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div>
            <h1 className="text-2xl font-bold text-primary-600">DealHub</h1>
            <p className="text-gray-500 text-sm hidden sm:block">
              Find the best deals near you
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
