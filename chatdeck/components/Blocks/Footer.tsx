import Link from "next/link";
import { Sparkles, Terminal, Github, Cpu } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 mt-24 bg-neutral-50/50 dark:bg-neutral-950/50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20">
                <Sparkles className="size-4.5" />
              </div>
              <span className="text-lg font-bold text-neutral-900 dark:text-white">TripPlanner</span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm leading-relaxed">
              Simple AI-powered trip planning. Create full daily itineraries with weather, sights, packing tips, and budget estimates.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Links</h4>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <li>
                <Link href="#deck" className="hover:text-violet-600 transition-colors">
                  Trip Planner
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-violet-600 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#architecture" className="hover:text-violet-600 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-violet-600 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Powered by */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Integrations</h4>
            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400 font-mono text-xs">
              <li>• Model Context Protocol (FastMCP)</li>
              <li>• Groq (Llama 3.3 70B Versatile)</li>
              <li>• Google Gemini (Gemini 2.5 Flash)</li>
              <li>• Open-Meteo & Open Library</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} WeekendWiz. Powered by Model Context Protocol.</p>
          <p className="flex items-center space-x-1">
            <span>Built with Next.js, Tailwind & ChatDeck design system.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
