"use client";

import React, { useState } from "react";
import {
  Clock,
  Terminal,
  CheckCircle2,
  XCircle,
  Download,
  Copy,
  Trash2,
  Filter,
  ChevronDown,
  ChevronRight,
  Activity,
  Zap,
  Code,
  Check,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LogEntry {
  id: string;
  timestamp: string; // ISO or local time string
  toolName: string;
  caller: string;
  args: Record<string, any>;
  durationMs: number;
  status: "success" | "error";
  resultSummary?: string;
  fullResult?: any;
}

interface LogsViewerProps {
  logs: LogEntry[];
  onClearLogs: () => void;
  onRunSampleTrace?: () => void;
}

export function LogsViewer({ logs, onClearLogs, onRunSampleTrace }: LogsViewerProps) {
  const [selectedToolFilter, setSelectedToolFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesTool =
      selectedToolFilter === "all" ||
      log.toolName.toLowerCase() === selectedToolFilter.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      log.toolName.toLowerCase().includes(query) ||
      log.caller.toLowerCase().includes(query) ||
      JSON.stringify(log.args).toLowerCase().includes(query) ||
      (log.resultSummary && log.resultSummary.toLowerCase().includes(query));
    return matchesTool && matchesSearch;
  });

  // Calculate metrics for Manager
  const totalCalls = logs.length;
  const successCalls = logs.filter((l) => l.status === "success").length;
  const avgLatency =
    totalCalls > 0
      ? Math.round(logs.reduce((acc, l) => acc + (l.durationMs || 0), 0) / totalCalls)
      : 0;

  // Most called tool
  const toolCounts: Record<string, number> = {};
  logs.forEach((l) => {
    toolCounts[l.toolName] = (toolCounts[l.toolName] || 0) + 1;
  });
  let mostCalledTool = "None";
  let maxCount = 0;
  for (const [tool, count] of Object.entries(toolCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostCalledTool = tool;
    }
  }

  const handleCopyAll = () => {
    const text = logs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.status.toUpperCase()}] ${l.toolName}(${JSON.stringify(l.args)}) - Caller: ${l.caller} - Latency: ${l.durationMs}ms`
      )
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `weekendwiz-mcp-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopySingle = (log: LogEntry) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getToolBadgeColor = (toolName: string) => {
    switch (toolName) {
      case "resolve_destination":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "get_weather_forecast":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "find_local_attractions":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "travel_essentials":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
      case "estimate_trip_budget":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "smart_packing_list":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "generate_weekend_itinerary":
        return "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20";
      case "export_calendar_ics":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
      default:
        return "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards for the Manager */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 shadow-xs">
          <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 flex items-center space-x-1.5">
            <Activity className="size-3.5 text-violet-500" />
            <span>Total Calls</span>
          </div>
          <div className="text-xl font-bold text-neutral-900 dark:text-white mt-1">{totalCalls}</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Tracked tool events</div>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 shadow-xs">
          <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 flex items-center space-x-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>Success Rate</span>
          </div>
          <div className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
            {totalCalls > 0 ? `${Math.round((successCalls / totalCalls) * 100)}%` : "100%"}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">{successCalls} passed</div>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 shadow-xs">
          <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 flex items-center space-x-1.5">
            <Clock className="size-3.5 text-blue-500" />
            <span>Avg Latency</span>
          </div>
          <div className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
            {avgLatency} <span className="text-xs font-normal text-neutral-400">ms</span>
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Execution roundtrip</div>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 shadow-xs">
          <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 flex items-center space-x-1.5">
            <Zap className="size-3.5 text-amber-500" />
            <span>Most Active Tool</span>
          </div>
          <div className="text-sm font-bold text-neutral-900 dark:text-white mt-1 truncate font-mono">
            {mostCalledTool}
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">{maxCount} invocations</div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-800/40">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs by city, tool, args..."
              className="pl-8 pr-3 py-1 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white w-48 sm:w-60 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto text-[11px]">
            {[
              { id: "all", label: "All Tools" },
              { id: "resolve_destination", label: "destination" },
              { id: "get_weather_forecast", label: "weather" },
              { id: "find_local_attractions", label: "attractions" },
              { id: "travel_essentials", label: "essentials" },
              { id: "estimate_trip_budget", label: "budget" },
              { id: "smart_packing_list", label: "packing" },
              { id: "generate_weekend_itinerary", label: "itinerary" },
              { id: "export_calendar_ics", label: "calendar" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedToolFilter(f.id)}
                className={cn(
                  "px-2.5 py-1 rounded-md font-mono transition-all",
                  selectedToolFilter === f.id
                    ? "bg-violet-600 text-white font-medium shadow-xs"
                    : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-700"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons for Manager */}
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyAll}
            className="text-xs h-7 px-2.5 border-neutral-300 dark:border-neutral-700"
          >
            {copiedAll ? <Check className="size-3 mr-1 text-emerald-500" /> : <Copy className="size-3 mr-1" />}
            <span>{copiedAll ? "Copied" : "Copy Log"}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportJSON}
            className="text-xs h-7 px-2.5 border-neutral-300 dark:border-neutral-700"
          >
            <Download className="size-3 mr-1" />
            <span>Export JSON</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onClearLogs}
            className="text-xs h-7 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
          >
            <Trash2 className="size-3 mr-1" />
            <span>Clear</span>
          </Button>
        </div>
      </div>

      {/* Logs Table / Timeline List */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 dark:text-neutral-400 space-y-2">
            <Terminal className="size-8 mx-auto text-neutral-400 opacity-60" />
            <div className="text-sm font-medium">No execution logs found</div>
            <div className="text-xs">
              Interact with the AI Agent Chat or use any tool in the playground to see live logs appear here in real time.
            </div>
            {onRunSampleTrace && (
              <Button
                size="sm"
                onClick={onRunSampleTrace}
                className="mt-3 text-xs bg-violet-600 hover:bg-violet-700 text-white"
              >
                <Zap className="size-3 mr-1.5" />
                Trigger Sample Tool Trace
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-200/70 dark:divide-neutral-800/70">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              return (
                <div key={log.id} className="p-3.5 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* Left: Time + Tool Badge + Caller */}
                    <div className="flex items-center space-x-2.5">
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5"
                      >
                        {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                      </button>

                      {/* Status Icon */}
                      {log.status === "success" ? (
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="size-4 text-rose-500 shrink-0" />
                      )}

                      {/* Timestamp */}
                      <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                        {log.timestamp}
                      </span>

                      {/* Tool Name Badge */}
                      <Badge variant="outline" className={cn("font-mono text-xs px-2 py-0.5", getToolBadgeColor(log.toolName))}>
                        {log.toolName}()
                      </Badge>

                      {/* Caller */}
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:inline">
                        via <strong className="text-neutral-700 dark:text-neutral-300 font-normal">{log.caller}</strong>
                      </span>
                    </div>

                    {/* Right: Latency + Args snippet + Copy single */}
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[11px] text-neutral-400 px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
                        {log.durationMs}ms
                      </span>

                      <button
                        onClick={() => handleCopySingle(log)}
                        title="Copy entry JSON"
                        className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                      >
                        {copiedId === log.id ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Arguments & Result Summary Row */}
                  <div className="ml-7 mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-neutral-400">Args:</span>
                    <span className="font-mono text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-[11px]">
                      {Object.keys(log.args).length > 0 ? JSON.stringify(log.args) : "none"}
                    </span>

                    {log.resultSummary && (
                      <>
                        <span className="text-neutral-300 dark:text-neutral-600">•</span>
                        <span className="text-neutral-400">Result:</span>
                        <span className="text-neutral-600 dark:text-neutral-400 truncate max-w-md">
                          {log.resultSummary}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Expandable JSON Detail Viewer */}
                  {isExpanded && (
                    <div className="ml-7 mt-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-neutral-200 text-xs font-mono overflow-x-auto space-y-2">
                      <div className="text-neutral-400 text-[11px] font-semibold flex items-center justify-between border-b border-neutral-800 pb-1">
                        <span>DETAILED PAYLOAD INSPECTOR</span>
                        <span className="text-emerald-400">{log.status.toUpperCase()} (HTTP 200)</span>
                      </div>
                      <pre className="text-[11px] leading-relaxed">
                        {JSON.stringify(
                          {
                            id: log.id,
                            timestamp: log.timestamp,
                            tool: log.toolName,
                            caller: log.caller,
                            durationMs: log.durationMs,
                            status: log.status,
                            parameters: log.args,
                            observationResult: log.fullResult,
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
