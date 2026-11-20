import { FaqSection } from "@/components/Blocks/FaqSection";
import { FeaturesSection } from "@/components/Blocks/FeatureSection";
import Hero from "@/components/Blocks/Hero";
import { ArchitectureSection } from "@/components/Blocks/ArchitectureSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50/50 dark:bg-black text-neutral-900 dark:text-neutral-100 transition-colors selection:bg-violet-500/20 selection:text-violet-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-32 sm:pt-36">
        <Hero />
        <FeaturesSection />
        <ArchitectureSection />
        <FaqSection />
      </div>
    </main>
  );
}
