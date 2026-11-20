"use client";

import { cn } from "@/lib/utils";
import {
  MapPin,
  CloudSun,
  Navigation,
  Luggage,
  CalendarCheck,
  DollarSign,
  Plane,
  Shield,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

export function FeaturesSection() {
  const features = [
    {
      title: "Day-by-Day Schedule",
      description:
        "Morning, afternoon, and evening plans tailored to your style, complete with timing suggestions and rain alternatives.",
      icon: <CalendarCheck className="size-6 text-violet-500" />,
      badge: "Schedule",
    },
    {
      title: "Trip Cost Estimator",
      description:
        "Realistic budget estimates for hotels, food, local transport, and sights, plus a 10% safety buffer.",
      icon: <DollarSign className="size-6 text-emerald-500" />,
      badge: "Budget",
    },
    {
      title: "City Guide & Transport",
      description:
        "Airport transit tips, local metro cards, electrical plug types, tipping customs, and emergency numbers.",
      icon: <Plane className="size-6 text-indigo-500" />,
      badge: "Logistics",
    },
    {
      title: "Smart Packing Checklist",
      description:
        "Interactive packing checklist based on current temperatures and precipitation forecasts.",
      icon: <Luggage className="size-6 text-amber-500" />,
      badge: "Packing",
    },
    {
      title: "Top Sights & Landmarks",
      description:
        "Verified attractions and cultural monuments with distance information, Google Maps links, and Wikipedia summaries.",
      icon: <Navigation className="size-6 text-purple-500" />,
      badge: "Attractions",
    },
    {
      title: "Save to Calendar (.ics)",
      description:
        "Download your schedule as an .ics file that imports instantly into Google Calendar, Apple Calendar, and Outlook.",
      icon: <Zap className="size-6 text-blue-500" />,
      badge: "Calendar",
    },
  ];

  return (
    <div id="features" className="max-w-7xl mx-auto py-20 px-4">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 mb-3 border border-violet-500/20">
          Features
        </div>
        <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-neutral-900 dark:text-white tracking-tight">
          Everything you need to plan a great trip
        </h2>
        <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Eight built-in tools that automatically fetch real-world data and put together your perfect itinerary.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </div>
  );
}

const FeatureCard = ({
  title,
  description,
  icon,
  badge,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="size-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            {icon}
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
            {badge}
          </span>
        </div>
        <h3 className="font-bold text-base text-neutral-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};
