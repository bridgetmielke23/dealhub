"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface DealCarouselProps {
  totalDeals: number;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export default function DealCarousel({
  totalDeals,
  currentIndex,
  onIndexChange,
}: DealCarouselProps) {
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onIndexChange((currentIndex - 1 + totalDeals) % totalDeals);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onIndexChange((currentIndex + 1) % totalDeals);
  };

  return (
    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
      <button
        onClick={handlePrev}
        className="p-1 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Previous deal"
      >
        <ChevronLeft size={16} className="text-white" />
      </button>

      <div className="flex gap-1">
        {Array.from({ length: totalDeals }).map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange(index);
            }}
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex
                ? "w-4 bg-white"
                : "w-1.5 bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to deal ${index + 1}`}
          />
        ))}
      </div>

      <button
        onClick={handleNext}
        className="p-1 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Next deal"
      >
        <ChevronRight size={16} className="text-white" />
      </button>
    </div>
  );
}

