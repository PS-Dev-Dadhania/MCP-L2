"use client";

import { motion } from "motion/react";
import { Server, Terminal, Bot, ArrowRight, Zap, Code, ShieldCheck, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ArchitectureSection() {
  const steps = [
    {
      num: "01",
      icon: <Terminal className="size-5 text-indigo-500" />,
      title: "Choose a Destination",
      desc: "Pick any city in the world, select your trip length (2, 3, or 5 days), and set your preferred style.",
    },
    {
      num: "02",
      icon: <Cpu className="size-5 text-violet-500" />,
      title: "Fetch Real-World Data",
      desc: "The app checks live weather, top landmarks from Wikipedia, airport connections, and local transport options.",
    },
    {
      num: "03",
      icon: <Zap className="size-5 text-emerald-500" />,
      title: "Build the Itinerary",
      desc: "The AI assembles morning, afternoon, and evening slots with distance checks, dining recommendations, and rain alternatives.",
    },
    {
      num: "04",
      icon: <Bot className="size-5 text-amber-500" />,
      title: "Export & Go",
      desc: "Save the schedule straight into Google Calendar, Outlook, or Apple Calendar, or copy the markdown notes.",
    },
  ];

  return (
    <div id="architecture" className="max-w-7xl mx-auto py-20 px-4">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Badge variant="outline" className="mb-3 px-3 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20">
          How It Works
        </Badge>
        <h2 className="text-3xl md:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-4">
          Simple, Automated Trip Planning
        </h2>
        <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          From a city name to a complete vacation or weekend schedule in four easy steps.
        </p>
      </motion.div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md shadow-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="size-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  {s.icon}
                </div>
                <span className="font-mono text-2xl font-black text-neutral-300 dark:text-neutral-700">{s.num}</span>
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-2">{s.title}</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{s.desc}</p>
            </div>

            <div className="mt-6 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center text-[11px] font-mono text-neutral-500">
              <Code className="size-3 mr-1 text-violet-500" />
              <span>Standard FastMCP protocol</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

