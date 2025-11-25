"use client";

import { DealCategory } from "@/types/deal";
import { motion } from "framer-motion";

interface CategoryFilterProps {
  selectedCategory: DealCategory;
  onCategoryChange: (category: DealCategory) => void;
}

const categories: { value: DealCategory; label: string; icon: string }[] = [
  { value: "all", label: "All", icon: "🏪" },
  { value: "restaurant", label: "Restaurants", icon: "🍽️" },
  { value: "grocery", label: "Grocery", icon: "🛒" },
  { value: "gas", label: "Gas", icon: "⛽" },
  { value: "coffee", label: "Coffee", icon: "☕" },
];

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <motion.button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
            selectedCategory === category.value
              ? "bg-primary-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <span className="text-lg">{category.icon}</span>
          <span className="font-medium">{category.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

