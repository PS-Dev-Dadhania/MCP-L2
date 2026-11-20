"use client";

import { Badge } from "@/components/ui/badge";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Button } from "@/components/ui/button";
import { motion, type Variants } from "motion/react";
import { WeekendWizDeck } from "@/components/Blocks/WeekendWizDeck";
import { Sparkles, ArrowRight, Calendar, Building2, Compass } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const Hero = () => {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative">
      {/* Badge */}
      <motion.div className="flex items-center justify-center" variants={fadeUpVariants}>
        <Badge
          className="h-auto text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300 backdrop-blur-sm"
          variant={"outline"}
        >
          <Sparkles className="size-3.5 mr-1.5 inline text-violet-500" />
          AI-Powered Trip Planner
        </Badge>
      </motion.div>

      {/* Hero Headline & Subhead */}
      <div className="text-center mt-6">
        <motion.h1
          className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-6xl max-w-4xl mx-auto leading-[1.15]"
          variants={fadeUpVariants}
        >
          Plan your next trip in <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-500">seconds</span>.
        </motion.h1>
        <motion.p
          className="mt-5 text-base sm:text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto"
          variants={fadeUpVariants}
        >
          Pick a destination and get an instant daily schedule with live weather, top places to visit, packing tips, and budget estimates.
        </motion.p>
      </div>

      {/* Hero Actions */}
      <motion.div className="my-8 flex flex-wrap items-center justify-center gap-3" variants={fadeUpVariants}>
        <a href="#deck">
          <ShimmerButton className="text-sm font-semibold h-11 px-6">
            <Calendar className="size-4 mr-2" />
            Plan a Trip
          </ShimmerButton>
        </a>
        <a href="#architecture">
          <Button
            variant="outline"
            className="rounded-full h-11 px-5 text-sm font-medium border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            How It Works <ArrowRight className="size-4 ml-1.5" />
          </Button>
        </a>
      </motion.div>

      {/* The Live Interactive WeekendWiz Deck */}
      <motion.div className="mt-8 mb-16" variants={fadeUpVariants}>
        <WeekendWizDeck />
      </motion.div>
    </motion.div>
  );
};

export default Hero;
