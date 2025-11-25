"use client";

import { SortOption } from "@/types/deal";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface SortFilterProps {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "closest", label: "Closest to Me" },
  { value: "highest-discount", label: "Highest Discount" },
  { value: "trending", label: "Trending" },
];

export default function SortFilter({ sortOption, onSortChange }: SortFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">
          Sort: {sortOptions.find((opt) => opt.value === sortOption)?.label}
        </span>
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  sortOption === option.value
                    ? "bg-primary-50 text-primary-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

