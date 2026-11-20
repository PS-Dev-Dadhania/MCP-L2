"use client";

import React, { useState } from "react";
import {
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Code2,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  Layers,
  MapPin,
  Plane,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EnterpriseRoadmap() {
  const [activeHostTab, setActiveHostTab] = useState<"antigravity" | "claude" | "cursor">("antigravity");
  const [copiedConfig, setCopiedConfig] = useState(false);

  const configs = {
    antigravity: `{
  "mcpServers": {
    "weekendwiz": {
      "command": "python",
      "args": ["c:\\\\Users\\\\DevDadhania\\\\Downloads\\\\weekendwiz 1\\\\weekendwiz\\\\s.py"]
    }
  }
}`,
    claude: `{
  "mcpServers": {
    "weekendwiz-concierge": {
      "command": "python",
      "args": ["C:\\\\Users\\\\DevDadhania\\\\Downloads\\\\weekendwiz 1\\\\weekendwiz\\\\s.py"]
    }
  }
}`,
    cursor: `{
  "mcpServers": {
    "weekendwiz": {
      "type": "stdio",
      "command": "python",
      "args": ["./weekendwiz/s.py"]
    }
  }
}`,
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(configs[activeHostTab]);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const useCases = [
    {
      icon: <Building2 className="size-5 text-indigo-500" />,
      title: "Team Offsites & Retreats",
      desc: "Plan 2 to 3 day team agendas with group activities, scenic dinner spots, and weather backup plans.",
      badge: "Team Travel",
    },
    {
      icon: <Plane className="size-5 text-blue-500" />,
      title: "Work Trip Extensions",
      desc: "Turn business trips into relaxed weekend stays with curated sights, dining, and packing advice.",
      badge: "Work & Leisure",
    },
    {
      icon: <Users className="size-5 text-emerald-500" />,
      title: "Hotel & Vacation Rentals",
      desc: "Offer guests instant digital concierge recommendations with real-time transit and local food tips.",
      badge: "Hospitality",
    },
    {
      icon: <Layers className="size-5 text-purple-500" />,
      title: "Conference & Event Guides",
      desc: "Help conference attendees explore the host city with easy daily schedules and calendar downloads.",
      badge: "Events",
    },
  ];

  const roadmapQuarters = [
    {
      quarter: "Phase 1 - Built & Ready",
      status: "completed",
      title: "Core Trip Planning Tools",
      items: [
        "8 connected travel tools running over the MCP standard",
        "Fast AI trip planning with live Groq and Gemini models",
        "Modern web interface with instant day-by-day itineraries",
        "Live activity and execution logs you can view and export",
      ],
    },
    {
      quarter: "Phase 2 - Current Version",
      status: "current",
      title: "Smart Travel Recommendations",
      items: [
        "Automatic discovery of top attractions via Wikipedia",
        "Weather-aware packing checklist tailored to your forecast",
        "Weekend schedule creator for Saturday and Sunday",
        "One-click calendar export (.ics) for Google, Apple, and Outlook",
      ],
    },
    {
      quarter: "Phase 3 - Coming Next",
      status: "planned",
      title: "Bookings & Transport Links",
      items: [
        "Direct flight and train search connections",
        "Restaurant and dining reservation lookups",
        "Local rideshare and public transit cost estimates",
        "Secure team-wide access with custom login",
      ],
    },
    {
      quarter: "Phase 4 - Future Upgrades",
      status: "planned",
      title: "Team & Group Planning",
      items: [
        "Chatbot integrations for Slack and Microsoft Teams",
        "Team budget limits and company travel guidelines",
        "Group voting on daily activities and shared schedules",
        "Saved traveler preferences and favorite spots",
      ],
    },
  ];

  return (
    <div id="enterprise" className="space-y-10 py-2">
      {/* Executive Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-purple-500/10">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-violet-600/10 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-2">
            <Sparkles className="size-3.5 text-violet-500" />
            <span>Architecture & Integrations</span>
          </div>
          <h3 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            How TripPlanner Works Across Platforms
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl mt-1 leading-relaxed">
            Built using the <strong>Model Context Protocol (MCP)</strong>: a single tool backend that connects live weather, maps, and travel data to this web app, desktop AI apps (Claude, Cursor), and chatbots.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 px-3 py-1.5 font-mono">
            READY TO USE
          </Badge>
        </div>
      </div>

      {/* Real-World High-Value Use Cases */}
      <div>
        <h4 className="text-base font-bold text-neutral-900 dark:text-white mb-4 flex items-center space-x-2">
          <Building2 className="size-4.5 text-violet-500" />
          <span>Popular Travel Use Cases</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {useCases.map((uc, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    {uc.icon}
                  </div>
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                    {uc.badge}
                  </span>
                </div>
                <h5 className="text-sm font-bold text-neutral-900 dark:text-white mb-1.5">{uc.title}</h5>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{uc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live MCP Host Integrator & Configurator */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-white space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono text-violet-400 flex items-center space-x-1.5">
              <Server className="size-3.5" />
              <span>DESKTOP AI SETUP</span>
            </div>
            <h4 className="text-base font-bold text-white mt-0.5">
              Use TripPlanner Inside Claude or Cursor
            </h4>
          </div>

          {/* Host tabs */}
          <div className="flex items-center space-x-1 p-1 bg-neutral-800 rounded-xl text-xs font-medium">
            {(["antigravity", "claude", "cursor"] as const).map((host) => (
              <button
                key={host}
                onClick={() => setActiveHostTab(host)}
                className={cn(
                  "px-3 py-1 rounded-lg capitalize transition-colors",
                  activeHostTab === host
                    ? "bg-violet-600 text-white"
                    : "text-neutral-400 hover:text-white"
                )}
              >
                {host === "antigravity" ? "Antigravity IDE" : host === "claude" ? "Claude Desktop" : "Cursor IDE"}
              </button>
            ))}
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="relative">
          <pre className="p-4 rounded-xl bg-black/60 border border-neutral-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
            {configs[activeHostTab]}
          </pre>
          <Button
            size="sm"
            onClick={handleCopyConfig}
            className="absolute top-3 right-3 text-xs h-7 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700"
          >
            {copiedConfig ? <CheckCircle2 className="size-3 mr-1 text-emerald-400" /> : <Copy className="size-3 mr-1" />}
            <span>{copiedConfig ? "Copied" : "Copy Config"}</span>
          </Button>
        </div>
        <p className="text-[11px] text-neutral-400">
          Paste this snippet into your host settings file to connect TripPlanner's 8 tools directly to Claude, Cursor, or Antigravity agents.
        </p>
      </div>

      {/* Strategic 4-Quarter Engineering Roadmap */}
      <div>
        <h4 className="text-base font-bold text-neutral-900 dark:text-white mb-4 flex items-center space-x-2">
          <CalendarCheck className="size-4.5 text-emerald-500" />
          <span>Product Roadmap</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roadmapQuarters.map((q, idx) => (
            <div
              key={idx}
              className={cn(
                "p-5 rounded-2xl border transition-all flex flex-col justify-between",
                q.status === "completed"
                  ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10"
                  : q.status === "current"
                  ? "border-violet-500/40 bg-violet-500/5 dark:bg-violet-950/20 shadow-sm ring-1 ring-violet-500/20"
                  : "border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      "text-[11px] font-bold tracking-wider font-mono uppercase px-2.5 py-0.5 rounded-full",
                      q.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : q.status === "current"
                        ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-neutral-200 dark:border-neutral-700"
                    )}
                  >
                    {q.quarter}
                  </span>
                  {q.status === "completed" && <CheckCircle2 className="size-4 text-emerald-500" />}
                  {q.status === "current" && (
                    <span className="flex size-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full size-2 bg-violet-600"></span>
                    </span>
                  )}
                </div>

                <h5 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">{q.title}</h5>

                <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                  {q.items.map((it, itemIdx) => (
                    <li key={itemIdx} className="flex items-start space-x-2">
                      <ChevronRight className="size-3.5 text-violet-500 shrink-0 mt-0.5" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
