"use client";

import { motion } from "framer-motion";

interface DealBadgeProps {
  type: "great-deal" | "ends-soon" | "trending" | "new";
}

const badgeConfig = {
  "great-deal": {
    label: "Great Deal",
    bgColor: "bg-green-500",
    icon: "🔥",
  },
  "ends-soon": {
    label: "Ends Soon",
    bgColor: "bg-orange-500",
    icon: "⏰",
  },
  "trending": {
    label: "Trending",
    bgColor: "bg-purple-500",
    icon: "📈",
  },
  "new": {
    label: "New",
    bgColor: "bg-blue-500",
    icon: "✨",
  },
};

export default function DealBadge({ type }: DealBadgeProps) {
  const config = badgeConfig[type];

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`${config.bgColor} text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 shadow-md`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </motion.div>
  );
}

