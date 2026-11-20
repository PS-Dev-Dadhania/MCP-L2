"use client";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import React from "react";

const menuItems = [
  { name: "Trip Planner", href: "#deck" },
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#architecture" },
  { name: "FAQ", href: "#faq" },
];

export const Navbar = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav data-state={menuState && "active"} className="fixed z-50 w-full px-4 top-0">
      <div
        className={cn(
          "mx-auto mt-3 max-w-6xl px-6 transition-all duration-300 rounded-full",
          isScrolled
            ? "bg-white/80 dark:bg-neutral-950/80 max-w-4xl border border-neutral-200/80 dark:border-neutral-800 backdrop-blur-xl shadow-lg"
            : "bg-transparent"
        )}
      >
        <div className="relative flex items-center justify-between py-3">
          <Link href="/" aria-label="home" className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20">
              <Sparkles className="size-5" />
            </div>
            <span className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
              TripPlanner
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-8">
            <ul className="flex gap-7 text-sm font-medium">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className="text-neutral-600 dark:text-neutral-300 hover:text-violet-600 dark:hover:text-violet-400 duration-150 transition-colors"
                  >
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center space-x-3">
            <AnimatedThemeToggler className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors" />

            <a href="#deck" className="hidden sm:inline-block">
              <Button
                size="sm"
                className="rounded-full h-9 px-4 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
              >
                <span>Plan a Trip</span>
              </Button>
            </a>

            <button
              onClick={() => setMenuState(!menuState)}
              aria-label={menuState ? "Close Menu" : "Open Menu"}
              className="relative p-2 rounded-lg text-neutral-700 dark:text-neutral-300 lg:hidden"
            >
              {menuState ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuState && (
          <div className="lg:hidden py-4 border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl mb-2">
            <ul className="space-y-3 text-sm font-medium">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuState(false)}
                    className="block py-1.5 text-neutral-700 dark:text-neutral-300 hover:text-violet-600"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <a href="#deck" onClick={() => setMenuState(false)} className="w-full block">
                <Button className="w-full rounded-xl bg-violet-600 text-white text-xs py-2">
                  Plan a Trip
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
