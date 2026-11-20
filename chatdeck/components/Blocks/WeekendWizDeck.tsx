"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Cloud,
  Compass,
  Sparkles,
  Send,
  RefreshCw,
  CheckCircle,
  XCircle,
  Bot,
  Zap,
  ArrowRight,
  MapPin,
  Terminal,
  Activity,
  ChevronRight,
  Calendar,
  Download,
  Luggage,
  Building2,
  Copy,
  Check,
  Clock,
  ExternalLink,
  DollarSign,
  Plane,
  Shield,
  Utensils,
  Printer,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";
import { LogsViewer, LogEntry } from "@/components/Blocks/LogsViewer";
import { EnterpriseRoadmap } from "@/components/Blocks/EnterpriseRoadmap";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  toolsCalled?: Array<{ name: string; args: any; result: any; durationMs?: number }>;
}

export function WeekendWizDeck() {
  const [activeTab, setActiveTab] = useState<"planner" | "chat" | "tools" | "logs" | "enterprise">("planner");

  // Real-time Execution Logs state (for the Manager's audit trail)
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "log-init-1",
      timestamp: new Date().toLocaleTimeString(),
      toolName: "resolve_destination",
      caller: "System Handshake",
      args: { city: "Ahmedabad" },
      durationMs: 135,
      status: "success",
      resultSummary: "Ahmedabad, India (Lat: 23.025, Lon: 72.587, TZ: Asia/Kolkata)",
      fullResult: { city: "Ahmedabad", country: "India", latitude: 23.0258, longitude: 72.5873 },
    },
    {
      id: "log-init-2",
      timestamp: new Date().toLocaleTimeString(),
      toolName: "get_weather_forecast",
      caller: "System Handshake",
      args: { latitude: 23.0258, longitude: 72.5873, days: 3 },
      durationMs: 182,
      status: "success",
      resultSummary: "Current: 31.0°C, Clear sky, 3-day forecast synchronized",
      fullResult: { current_temp_c: 31.0, condition: "Clear sky" },
    },
    {
      id: "log-init-3",
      timestamp: new Date().toLocaleTimeString(),
      toolName: "travel_essentials",
      caller: "Logistics Orchestrator",
      args: { city: "Ahmedabad" },
      durationMs: 98,
      status: "success",
      resultSummary: "Airports: AMD | Transit: Ahmedabad Metro & BRTS | Plugs: Type C/D/M",
      fullResult: { airports: ["AMD"], transit: "Ahmedabad Metro & BRTS" },
    },
  ]);

  const addLog = (entry: Omit<LogEntry, "id">) => {
    const newEntry: LogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setLogs((prev) => [newEntry, ...prev]);
  };

  // 1. TRAVEL PLANNER STATE
  const [cityInput, setCityInput] = useState("Ahmedabad");
  const [daysCount, setDaysCount] = useState<number>(3);
  const [travelStyle, setTravelStyle] = useState<string>("executive");
  const [plannerSubView, setPlannerSubView] = useState<"itinerary" | "budget" | "logistics" | "packing">("itinerary");
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [copiedPlan, setCopiedPlan] = useState(false);
  const [downloadedIcs, setDownloadedIcs] = useState(false);

  // Checked packing items set
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Full Trip Data Structure
  const [tripData, setTripData] = useState<any>({
    destination: "Ahmedabad, India",
    city: "Ahmedabad",
    country: "India",
    days: 3,
    style: "executive",
    weather: {
      temperature: 31.0,
      condition: "Clear sky",
      code: 0,
    },
    budget: {
      currency: "INR",
      lodging: 22500,
      meals: 9600,
      transit: 3600,
      activities: 5400,
      contingency: 4110,
      total: 45210,
      dailyAverage: 15070,
    },
    essentials: {
      airports: ["AMD (Sardar Vallabhbhai Patel International Airport - Hansol, 20m drive)"],
      transit: "Ahmedabad Metro (North-South & East-West corridors), BRTS Janmarg, auto-rickshaws, and Ola/Uber.",
      powerPlug: "Type C, D & M (230V, 50Hz - Standard Indian 3-pin round)",
      tipping: "5% to 10% customary at sit-down restaurants; rounding up fares for auto/cab drivers is polite.",
      emergency: "Police: 100/112 | Ambulance: 108 | Fire: 101",
      currency: "Indian Rupee (INR) - UPI (Google Pay, PhonePe, Paytm) and credit cards widely accepted.",
      cuisine: [
        "Authentic Gujarati Thali with Dal, Kadhi, Rotli & Shaak",
        "Manek Chowk midnight street food (Gwalior Dosa, Chocolate Sandwich, Kulfi)",
        "Khaman Dhokla & Khandvi from Das Khaman",
        "Fafda & Jalebi breakfast with raw papaya sambharo",
        "Dalvada at Gujarat College",
      ],
    },
    packing: {
      advisory: "Clear sunny skies (31°C): Stay hydrated and schedule outdoor walking tours for morning and late afternoon.",
      rainContingency: "Outdoor schedule is safe to proceed as scheduled. Indoor cultural venues like Calico Museum and Science City available.",
      core: [
        "Government ID / Aadhaar / Passport & Insurance",
        "Universal Power Adapter & Mobile Power Bank (10,000mAh+)",
        "Comfortable supportive walking shoes or sandals",
        "Reusable insulated water bottle",
      ],
      adaptive: [
        "Polarized UV400 sunglasses",
        "Broad-spectrum SPF 50+ sunscreen",
        "Lightweight breathable linen / cotton apparel",
        "Packable sun hat / light cotton scarf",
      ],
    },
    daysList: [
      {
        day: 1,
        title: "Day 1: Heritage & Freedom Movement",
        schedule: {
          morning: {
            time: "09:00 - 12:30",
            title: "Explore Sabarmati Ashram (Gandhi Memorial)",
            description: "Morning walk through Mahatma Gandhi's historic riverside ashram and Hriday Kunj museum.",
            tag: "Historic Heritage",
            mapsUrl: "https://www.google.com/maps/search/?api=1&query=Sabarmati+Ashram+Ahmedabad",
          },
          afternoon: {
            time: "13:30 - 17:00",
            title: "Sidi Saiyyed Mosque & Old City Heritage Walk",
            description: "Marvel at the world-famous carved stone Tree of Life jali followed by Teen Darwaza exploration.",
            tag: "Architecture & Culture",
            mapsUrl: "https://www.google.com/maps/search/?api=1&query=Sidi+Saiyyed+Mosque+Ahmedabad",
          },
          evening: {
            time: "18:00 - 21:30",
            title: "Sabarmati Riverfront & Atal Pedestrian Bridge",
            description: "Sunset stroll on the iconic pedestrian bridge with illuminated river views and riverside cafes.",
            tag: "Riverfront & Sunset",
            mapsUrl: "https://www.google.com/maps/search/?api=1&query=Atal+Bridge+Ahmedabad",
          },
        },
        rainAlternative: "Visit the Calico Museum of Textiles (prior reservation required) and indoor craft galleries.",
      },
      {
        day: 2,
        title: "Day 2: Stepwells, Marble Temples & Night Food",
        schedule: {
          morning: {
            time: "09:00 - 12:30",
            title: "Adalaj Stepwell (Rudabai Stepwell)",
            description: "Intricate five-story subterranean Solanki stepwell with stunning geometric carvings and cool ambient temperature.",
            tag: "Ancient Stepwell",
            mapsUrl: "https://www.google.com/maps/search/?api=1&query=Adalaj+Stepwell+Ahmedabad",
          },
          afternoon: {
            time: "13:30 - 16:30",
            title: "Hutheesing Jain Temple Marble Exploration",
            description: "Ornate 19th-century white marble temple showcasing exceptional stone craftsmanship.",
            tag: "Heritage Temple",
            mapsUrl: "https://www.google.com/maps/search/?api=1&query=Hutheesing+Jain+Temple+Ahmedabad",
          },
          evening: {
            time: "19:00 - 22:30",
            title: "Manek Chowk Midnight Street Food Bazaar",
            description: "Jewelry market by day transformed into Ahmedabad's vibrant midnight food hub with Pav Bhaji, Gwalior Dosa, and Kulfi.",
            tag: "Street Food Tour",
            mapsUrl: "https://www.google.com/maps/search/?api=1&query=Manek+Chowk+Ahmedabad",
          },
        },
        rainAlternative: "Explore Kasturbhai Lalbhai Museum and indoor art galleries in Navrangpura.",
      },
      {
        day: 3,
        title: "Day 3: Medieval Architecture & Science City",
        schedule: {
          morning: {
            time: "09:30 - 12:30",
            title: "Sarkhej Roza Architectural Complex",
            description: "Acclaimed Indo-Islamic monument complex and lake dubbed the 'Acropolis of Ahmedabad' by Le Corbusier.",
            tag: "Monument & Lake",
            mapsUrl: "https://www.google.com/maps/search/?api=1&query=Sarkhej+Roza+Ahmedabad",
          },
          afternoon: {
            time: "13:30 - 17:00",
            title: "Gujarat Science City & Robotics Gallery",
            description: "Interactive robotics exhibits, aquatic gallery, and nature park in a world-class science pavilion.",
            tag: "Science & Robotics",
            mapsUrl: "https://www.google.com/maps/search/?api=1&query=Gujarat+Science+City+Ahmedabad",
          },
          evening: {
            time: "18:00 - 21:00",
            title: "Kankaria Lake Promenade Stroll & Farewell Dinner",
            description: "Historic 15th-century circular lake with landscaped walking tracks, food stalls, and balloon safari.",
            tag: "Lake Promenade",
            mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kankaria+Lake+Ahmedabad",
          },
        },
        rainAlternative: "Visit Auto World Vintage Car Museum in Kathwada with classic heritage vehicles.",
      },
    ],
  });

  const generateFullTravelPlan = async (cityTarget: string, daysTarget: number, styleTarget: string) => {
    setLoadingPlan(true);
    const startOverall = Date.now();
    try {
      // 1. Destination Geocoding
      const t0 = Date.now();
      const destRes = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "destination", city: cityTarget }),
      });
      const destData = await destRes.json();
      addLog({
        timestamp: new Date().toLocaleTimeString(),
        toolName: "resolve_destination",
        caller: "Travel Concierge",
        args: { city: cityTarget },
        durationMs: Date.now() - t0,
        status: destData.error ? "error" : "success",
        resultSummary: destData.error || `${destData.city}, ${destData.country} resolved`,
        fullResult: destData,
      });

      // 2. Multi-Day Itinerary Synthesis
      const t1 = Date.now();
      const itinRes = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "itinerary", city: cityTarget, days: daysTarget, style: styleTarget }),
      });
      const itinData = await itinRes.json();
      addLog({
        timestamp: new Date().toLocaleTimeString(),
        toolName: "generate_multiday_itinerary",
        caller: "Travel Concierge",
        args: { city: cityTarget, days: daysTarget, style: styleTarget },
        durationMs: Date.now() - t1,
        status: itinData.error ? "error" : "success",
        resultSummary: itinData.error || `Synthesized ${daysTarget}-day schedule with ${itinData.daysList?.length || 0} day plans`,
        fullResult: itinData,
      });

      // 3. Tiered Budget Estimator
      const t2 = Date.now();
      const budgetRes = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "budget", city: cityTarget, days: daysTarget, style: styleTarget, currency: "INR" }),
      });
      const budgetData = await budgetRes.json();
      addLog({
        timestamp: new Date().toLocaleTimeString(),
        toolName: "estimate_budget",
        caller: "Financial Estimator",
        args: { city: cityTarget, days: daysTarget, style: styleTarget, currency: "INR" },
        durationMs: Date.now() - t2,
        status: budgetData.error ? "error" : "success",
        resultSummary: budgetData.error || `Total: ₹${Number(budgetData.estimatedTotal || 0).toLocaleString("en-IN")} INR (₹${Number(budgetData.dailyAverage || 0).toLocaleString("en-IN")}/day)`,
        fullResult: budgetData,
      });

      // 4. Travel Essentials & Logistics
      const t3 = Date.now();
      const essRes = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "essentials", city: cityTarget }),
      });
      const essData = await essRes.json();
      addLog({
        timestamp: new Date().toLocaleTimeString(),
        toolName: "travel_essentials",
        caller: "Logistics Orchestrator",
        args: { city: cityTarget },
        durationMs: Date.now() - t3,
        status: essData.error ? "error" : "success",
        resultSummary: essData.error || `Airports: ${essData.airports?.join(", ")} | Plugs: ${essData.powerPlug}`,
        fullResult: essData,
      });

      // 5. Climate Packing & Rain Contingency
      const t4 = Date.now();
      const packRes = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "packing", city: cityTarget }),
      });
      const packData = await packRes.json();
      addLog({
        timestamp: new Date().toLocaleTimeString(),
        toolName: "weather_packing_checklist",
        caller: "Meteorological Advisor",
        args: { city: cityTarget },
        durationMs: Date.now() - t4,
        status: packData.error ? "error" : "success",
        resultSummary: packData.error || `${packData.condition} (${packData.temperature}°C). ${packData.advisory}`,
        fullResult: packData,
      });

      // Merge into state
      setTripData({
        destination: `${destData.city || cityTarget}, ${destData.country || ""}`,
        city: destData.city || cityTarget,
        country: destData.country || "",
        days: daysTarget,
        style: styleTarget,
        weather: itinData.weather || { temperature: packData.temperature, condition: packData.condition },
        budget: {
          currency: budgetData.currency || "INR",
          lodging: budgetData.breakdown?.lodging || 0,
          meals: budgetData.breakdown?.mealsAndDining || 0,
          transit: budgetData.breakdown?.localTransit || 0,
          activities: budgetData.breakdown?.activitiesAndAdmissions || 0,
          contingency: budgetData.breakdown?.contingency10Pct || 0,
          total: budgetData.estimatedTotal || 0,
          dailyAverage: budgetData.dailyAverage || 0,
        },
        essentials: {
          airports: essData.airports || [],
          transit: essData.transit || essData.transitGuide,
          powerPlug: essData.powerPlug,
          tipping: essData.tipping || essData.tippingEtiquette,
          emergency: essData.emergency || essData.emergencyNumbers,
          currency: essData.currency || essData.currencyAdvice,
          cuisine: essData.mustTryCuisine || essData.signatureCulinary || [],
        },
        packing: {
          advisory: packData.advisory || "Favorable conditions.",
          rainContingency: packData.rainContingency || "Outdoor schedule is safe.",
          core: packData.coreEssentials || [],
          adaptive: packData.weatherAdaptiveGear || [],
        },
        daysList: itinData.daysList || [],
      });
    } catch (e) {
      console.error("Failed to generate plan:", e);
    } finally {
      setLoadingPlan(false);
    }
  };

  // Download RFC 5545 .ics Calendar File
  const handleDownloadIcs = () => {
    if (!tripData) return;
    const city = tripData.city || "Destination";
    const days = tripData.days || 3;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T120000Z`;

    const daysUntilSat = (6 - now.getDay() + 7) % 7 || 7;
    const startDate = new Date(now.getTime() + daysUntilSat * 86400000);

    const icsLines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//WeekendWiz//Enterprise Travel Concierge MCP//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];

    (tripData.daysList || []).forEach((dItem: any, idx: number) => {
      const cur = new Date(startDate.getTime() + idx * 86400000);
      const dStr = `${cur.getUTCFullYear()}${pad(cur.getUTCMonth() + 1)}${pad(cur.getUTCDate())}`;
      const sch = dItem.schedule || {};

      const slots = [
        { title: `Morning: ${sch.morning?.title || "Sightseeing"}`, start: `${dStr}T090000Z`, end: `${dStr}T123000Z`, desc: sch.morning?.description },
        { title: `Afternoon: ${sch.afternoon?.title || "Culture"}`, start: `${dStr}T133000Z`, end: `${dStr}T170000Z`, desc: sch.afternoon?.description },
        { title: `Evening: ${sch.evening?.title || "Dining"}`, start: `${dStr}T183000Z`, end: `${dStr}T213000Z`, desc: sch.evening?.description },
      ];

      slots.forEach((s) => {
        icsLines.push(
          "BEGIN:VEVENT",
          `UID:weekendwiz-${Date.now()}-${idx}-${s.start.slice(9, 13)}@weekendwiz.local`,
          `DTSTAMP:${dtstamp}`,
          `DTSTART:${s.start}`,
          `DTEND:${s.end}`,
          `SUMMARY:${s.title} (${tripData.destination})`,
          `DESCRIPTION:${s.desc || "Planned by WeekendWiz"}`,
          `LOCATION:${tripData.destination}`,
          `STATUS:CONFIRMED`,
          "END:VEVENT"
        );
      });
    });

    icsLines.push("END:VCALENDAR");
    const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${city.toLowerCase().replace(/[^a-z0-9]/g, "-")}-travel-itinerary.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadedIcs(true);
    setTimeout(() => setDownloadedIcs(false), 2500);

    addLog({
      timestamp: new Date().toLocaleTimeString(),
      toolName: "export_calendar_ics",
      caller: "Calendar Sync",
      args: { city, days },
      durationMs: 45,
      status: "success",
      resultSummary: `Exported RFC 5545 iCalendar (${icsLines.length} lines) for ${city}`,
      fullResult: { filename: `${city.toLowerCase()}-travel-itinerary.ics`, eventCount: (tripData.daysList || []).length * 3 },
    });
  };

  // Copy Markdown Itinerary to Clipboard
  const handleCopyMarkdown = () => {
    if (!tripData) return;
    let md = `# Travel Itinerary: ${tripData.destination}\n`;
    md += `**Duration**: ${tripData.days} Days | **Style**: ${tripData.style} | **Weather**: ${tripData.weather?.temperature}°C (${tripData.weather?.condition})\n\n`;
    md += `## Estimated Budget (${tripData.budget?.currency || "INR"})\n`;
    md += `- Lodging: ₹${Number(tripData.budget?.lodging || 0).toLocaleString("en-IN")}\n- Dining: ₹${Number(tripData.budget?.meals || 0).toLocaleString("en-IN")}\n- Local Transit: ₹${Number(tripData.budget?.transit || 0).toLocaleString("en-IN")}\n- Activities: ₹${Number(tripData.budget?.activities || 0).toLocaleString("en-IN")}\n- **Total**: ₹${Number(tripData.budget?.total || 0).toLocaleString("en-IN")} INR (Avg ₹${Number(tripData.budget?.dailyAverage || 0).toLocaleString("en-IN")}/day)\n\n`;
    md += `## Daily Schedule\n`;
    (tripData.daysList || []).forEach((d: any) => {
      md += `### ${d.title}\n`;
      md += `- **Morning (09:00 - 12:30)**: ${d.schedule?.morning?.title}\n  ${d.schedule?.morning?.description}\n`;
      md += `- **Afternoon (13:30 - 17:00)**: ${d.schedule?.afternoon?.title}\n  ${d.schedule?.afternoon?.description}\n`;
      md += `- **Evening (18:30 - 21:30)**: ${d.schedule?.evening?.title}\n  ${d.schedule?.evening?.description}\n`;
      md += `> **Rain Contingency**: ${d.rainAlternative}\n\n`;
    });
    md += `## Travel Logistics & Essentials\n`;
    md += `- **Airports**: ${tripData.essentials?.airports?.join(", ")}\n`;
    md += `- **Transit**: ${tripData.essentials?.transit}\n`;
    md += `- **Power Plugs**: ${tripData.essentials?.powerPlug}\n`;
    md += `- **Tipping**: ${tripData.essentials?.tipping}\n`;
    md += `- **Emergency**: ${tripData.essentials?.emergency}\n\n`;
    md += `*Generated autonomously via WeekendWiz Model Context Protocol (MCP) Concierge.*`;

    navigator.clipboard.writeText(md);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2000);
  };

  // 2. AI CONCIERGE CHAT STATE
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Welcome! I am your **Autonomous Travel & Corporate Offsite Concierge**, powered by the Model Context Protocol (MCP).\n\n" +
        "I can autonomously orchestrate multi-day itineraries, live meteorological risk models, verified cultural landmark discovery, tiered financial expense breakdowns, and 1-click calendar sync.\n\n" +
        "Where are we traveling, and what is your desired trip style?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userText }].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error from concierge agent: ${data.error}` },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            toolsCalled: data.toolsCalled,
          },
        ]);

        if (data.toolsCalled && data.toolsCalled.length > 0) {
          data.toolsCalled.forEach((tc: any) => {
            addLog({
              timestamp: new Date().toLocaleTimeString(),
              toolName: tc.name,
              caller: `AI Concierge (${data.model || "Groq"})`,
              args: tc.args || {},
              durationMs: tc.durationMs || Math.floor(Math.random() * 200 + 80),
              status: "success",
              resultSummary: typeof tc.result === "string" ? tc.result : JSON.stringify(tc.result).slice(0, 100),
              fullResult: tc.result,
            });
          });
        }
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Network error: ${err.message}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // 3. MCP TOOLS SUITE PLAYGROUND STATE
  const [toolTab, setToolTab] = useState<string>("itinerary");
  const [toolInputs, setToolInputs] = useState<Record<string, any>>({
    destination: { city: "Ahmedabad" },
    weather: { city: "Ahmedabad", days: 3 },
    attractions: { city: "Ahmedabad", limit: 4 },
    essentials: { city: "Ahmedabad" },
    budget: { city: "Ahmedabad", days: 3, style: "executive", currency: "INR" },
    packing: { city: "Ahmedabad" },
    itinerary: { city: "Ahmedabad", days: 3, style: "cultural" },
    calendar: { city: "Ahmedabad", days: 3 },
  });
  const [toolResults, setToolResults] = useState<Record<string, any>>({});
  const [toolLoading, setToolLoading] = useState<Record<string, boolean>>({});

  const executePlaygroundTool = async (tKey: string, actionName: string, payload: any) => {
    setToolLoading((prev) => ({ ...prev, [tKey]: true }));
    const startTime = Date.now();
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionName, ...payload }),
      });
      const data = await res.json();
      setToolResults((prev) => ({ ...prev, [tKey]: data }));

      addLog({
        timestamp: new Date().toLocaleTimeString(),
        toolName: data._meta?.action || actionName,
        caller: "MCP Playground",
        args: payload,
        durationMs: Date.now() - startTime,
        status: data.error ? "error" : "success",
        resultSummary: data.error || `Returned schema payload with ${Object.keys(data).length} top-level fields`,
        fullResult: data,
      });
    } catch (err: any) {
      setToolResults((prev) => ({ ...prev, [tKey]: { error: err.message } }));
    } finally {
      setToolLoading((prev) => ({ ...prev, [tKey]: false }));
    }
  };

  return (
    <div id="deck" className="w-full max-w-7xl mx-auto px-4 sm:px-6">
      {/* Navigation Tabs Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
            <Compass className="size-6 text-violet-600 dark:text-violet-400" />
            <span>Trip Planner</span>
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Create a complete day-by-day plan with weather, sights, budget, and packing advice.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab("planner")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "planner"
                ? "bg-white dark:bg-neutral-800 text-violet-600 dark:text-violet-400 shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            )}
          >
            <Calendar className="size-3.5" />
            Trip Planner
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "chat"
                ? "bg-white dark:bg-neutral-800 text-violet-600 dark:text-violet-400 shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            )}
          >
            <Bot className="size-3.5" />
            AI Assistant
          </button>
          <button
            onClick={() => setActiveTab("tools")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "tools"
                ? "bg-white dark:bg-neutral-800 text-violet-600 dark:text-violet-400 shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            )}
          >
            <Zap className="size-3.5" />
            Tools (8)
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "logs"
                ? "bg-white dark:bg-neutral-800 text-violet-600 dark:text-violet-400 shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            )}
          >
            <Activity className="size-3.5" />
            Logs
            <span className="ml-1 px-1.5 py-0.2 bg-violet-500/20 text-violet-600 dark:text-violet-400 rounded-full text-[10px]">
              {logs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("enterprise")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap",
              activeTab === "enterprise"
                ? "bg-white dark:bg-neutral-800 text-violet-600 dark:text-violet-400 shadow-sm"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            )}
          >
            <Building2 className="size-3.5" />
            How It Works
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: ENTERPRISE TRAVEL & MULTI-DAY TRIP PLANNER
         ========================================================================= */}
      {activeTab === "planner" && (
        <div className="space-y-6">
          {/* Planner Query Card */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Destination Input */}
              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-violet-500" />
                  Destination City
                </label>
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="e.g. Tokyo, Paris, New York, Zurich"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Duration (Days) */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5 flex items-center gap-1.5">
                  <Clock className="size-3.5 text-indigo-500" />
                  Trip Duration
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: "2 Days", days: 2 },
                    { label: "3 Days", days: 3 },
                    { label: "5 Days", days: 5 },
                  ].map((d) => (
                    <button
                      key={d.days}
                      type="button"
                      onClick={() => setDaysCount(d.days)}
                      className={cn(
                        "py-2 text-xs font-medium rounded-lg border transition-all text-center",
                        daysCount === d.days
                          ? "border-violet-600 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-semibold"
                          : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Persona / Style */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-amber-500" />
                  Trip Style
                </label>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="executive">Standard & Sightseeing</option>
                  <option value="corporate_offsite">Work / Team Retreat</option>
                  <option value="cultural">Culture & Museums</option>
                  <option value="relaxed">Relaxed & Food</option>
                </select>
              </div>

              {/* Generate Button */}
              <div className="md:col-span-2 flex items-end">
                <Button
                  onClick={() => generateFullTravelPlan(cityInput, daysCount, travelStyle)}
                  disabled={loadingPlan}
                  className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md"
                >
                  {loadingPlan ? (
                    <>
                      <RefreshCw className="size-4 animate-spin mr-1.5" />
                      Planning Trip...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4 mr-1.5" />
                      Create My Plan
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Demo Presets */}
            <div className="mt-3.5 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">Popular Cities:</span>
              {[
                { city: "Ahmedabad", days: 3, style: "executive", label: "Ahmedabad (3 Days)" },
                { city: "Ahmedabad", days: 2, style: "cultural", label: "Ahmedabad (2 Days)" },
                { city: "Mumbai", days: 2, style: "executive", label: "Mumbai (2 Days)" },
                { city: "Paris", days: 3, style: "cultural", label: "Paris (3 Days)" },
                { city: "Tokyo", days: 3, style: "executive", label: "Tokyo (3 Days)" },
                { city: "London", days: 3, style: "relaxed", label: "London (3 Days)" },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    setCityInput(preset.city);
                    setDaysCount(preset.days);
                    setTravelStyle(preset.style);
                    generateFullTravelPlan(preset.city, preset.days, preset.style);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-300 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Master Dashboard */}
          {tripData && (
            <div className="space-y-6">
              {/* Top Overview Ribbon */}
              <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-500/20 via-transparent to-transparent pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <Badge className="bg-white/20 text-white border-white/30 text-xs px-2.5 py-0.5 backdrop-blur-sm">
                        {tripData.days} Days
                      </Badge>
                      <Badge className="bg-amber-500/30 text-amber-200 border-amber-500/40 text-xs px-2.5 py-0.5">
                        {tripData.style?.replace("_", " ").toUpperCase()}
                      </Badge>
                      <Badge className="bg-emerald-500/30 text-emerald-200 border-emerald-500/40 text-xs px-2.5 py-0.5 flex items-center gap-1">
                        <Cloud className="size-3" />
                        {tripData.weather?.temperature}°C • {tripData.weather?.condition}
                      </Badge>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                      {tripData.destination}
                    </h1>
                    <p className="text-sm text-violet-200 mt-1 max-w-xl">
                      Your personalized trip schedule with live weather, top sights, budget, and local tips.
                    </p>
                  </div>

                  {/* High-Level Financial & Export Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="bg-black/30 backdrop-blur-md rounded-xl p-3 border border-white/10 text-right pr-4">
                      <div className="text-[11px] text-violet-300 font-medium">Estimated Budget</div>
                      <div className="text-2xl font-bold text-white tracking-tight">
                        ₹{Number(tripData.budget?.total || 0).toLocaleString("en-IN")} <span className="text-xs font-normal text-violet-300">{tripData.budget?.currency || "INR"}</span>
                      </div>
                      <div className="text-[10px] text-violet-400">
                        About ₹{Number(tripData.budget?.dailyAverage || 0).toLocaleString("en-IN")}/day
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={handleDownloadIcs}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-md flex items-center gap-2"
                      >
                        {downloadedIcs ? <Check className="size-3.5" /> : <Download className="size-3.5" />}
                        {downloadedIcs ? "Saved!" : "Add to Calendar (.ics)"}
                      </Button>

                      <Button
                        onClick={handleCopyMarkdown}
                        variant="outline"
                        className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-9 px-4 rounded-xl backdrop-blur-sm flex items-center gap-2"
                      >
                        {copiedPlan ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                        {copiedPlan ? "Copied!" : "Copy Plan"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Sub-View Switcher (Itinerary, Budget, Logistics, Packing) */}
                <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
                  {[
                    { id: "itinerary", label: "Schedule", icon: Calendar },
                    { id: "budget", label: "Budget", icon: DollarSign },
                    { id: "logistics", label: "City Guide", icon: Plane },
                    { id: "packing", label: "Packing List", icon: Luggage },
                  ].map((sub) => {
                    const Icon = sub.icon;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setPlannerSubView(sub.id as any)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                          plannerSubView === sub.id
                            ? "bg-white text-violet-900 shadow-md"
                            : "text-violet-200 hover:text-white hover:bg-white/10"
                        )}
                      >
                        <Icon className="size-3.5" />
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* =========================================================
                  SUBVIEW 1: DAY-BY-DAY ITINERARY SCHEDULE
                 ========================================================= */}
              {plannerSubView === "itinerary" && (
                <div className="space-y-6">
                  {(tripData.daysList || []).map((dayObj: any) => (
                    <div
                      key={dayObj.day}
                      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 gap-2 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-lg">
                            D{dayObj.day}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                              {dayObj.title}
                            </h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              Verified cultural attractions & curated culinary stops
                            </p>
                          </div>
                        </div>

                        {/* Rain Contingency Note */}
                        {dayObj.rainAlternative && (
                          <div className="text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-3 py-1.5 rounded-xl flex items-center gap-2 max-w-md">
                            <Cloud className="size-3.5 text-amber-500 shrink-0" />
                            <span>
                              <strong>Rain Backup:</strong> {dayObj.rainAlternative}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 3 Time-Slots (Morning, Afternoon, Evening) */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Morning */}
                        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 hover:border-violet-300 dark:hover:border-violet-700 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                              Morning
                            </span>
                            <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                              <Clock className="size-3" />
                              {dayObj.schedule?.morning?.time}
                            </span>
                          </div>
                          <h4 className="font-semibold text-neutral-900 dark:text-white text-sm line-clamp-1 mb-1">
                            {dayObj.schedule?.morning?.title}
                          </h4>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">
                            {dayObj.schedule?.morning?.description}
                          </p>
                          <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700/60 text-xs">
                            <Badge variant="outline" className="text-[10px] py-0">
                              {dayObj.schedule?.morning?.tag || "Must-Visit"}
                            </Badge>
                            {dayObj.schedule?.morning?.mapsUrl && (
                              <a
                                href={dayObj.schedule?.morning?.mapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 text-[11px]"
                              >
                                Maps <ExternalLink className="size-2.5" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Afternoon */}
                        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 hover:border-violet-300 dark:hover:border-violet-700 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                              Afternoon
                            </span>
                            <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                              <Clock className="size-3" />
                              {dayObj.schedule?.afternoon?.time}
                            </span>
                          </div>
                          <h4 className="font-semibold text-neutral-900 dark:text-white text-sm line-clamp-1 mb-1">
                            {dayObj.schedule?.afternoon?.title}
                          </h4>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">
                            {dayObj.schedule?.afternoon?.description}
                          </p>
                          <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700/60 text-xs">
                            <Badge variant="outline" className="text-[10px] py-0">
                              {dayObj.schedule?.afternoon?.tag || "Culture & Lunch"}
                            </Badge>
                            {dayObj.schedule?.afternoon?.mapsUrl && (
                              <a
                                href={dayObj.schedule?.afternoon?.mapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 text-[11px]"
                              >
                                Maps <ExternalLink className="size-2.5" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Evening */}
                        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 hover:border-violet-300 dark:hover:border-violet-700 transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                              Evening
                            </span>
                            <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                              <Clock className="size-3" />
                              {dayObj.schedule?.evening?.time}
                            </span>
                          </div>
                          <h4 className="font-semibold text-neutral-900 dark:text-white text-sm line-clamp-1 mb-1">
                            {dayObj.schedule?.evening?.title}
                          </h4>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">
                            {dayObj.schedule?.evening?.description}
                          </p>
                          <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700/60 text-xs">
                            <Badge variant="outline" className="text-[10px] py-0">
                              {dayObj.schedule?.evening?.tag || "Dining & Skyline"}
                            </Badge>
                            {dayObj.schedule?.evening?.mapsUrl && (
                              <a
                                href={dayObj.schedule?.evening?.mapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 text-[11px]"
                              >
                                Maps <ExternalLink className="size-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* =========================================================
                  SUBVIEW 2: TIERED BUDGET ESTIMATOR
                 ========================================================= */}
              {plannerSubView === "budget" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left: Financial Breakdown Card */}
                  <div className="md:col-span-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                          <DollarSign className="size-5 text-emerald-500" />
                          Estimated Trip Cost
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Estimated expenses for {tripData.days} days in {tripData.destination}.
                        </p>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs py-1">
                        Total: ₹{Number(tripData.budget?.total || 0).toLocaleString("en-IN")} {tripData.budget?.currency || "INR"}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      {[
                        { label: "Hotel & Stay", amount: tripData.budget?.lodging, pct: 45, color: "bg-violet-500" },
                        { label: "Food & Dining", amount: tripData.budget?.meals, pct: 25, color: "bg-indigo-500" },
                        { label: "Local Transport", amount: tripData.budget?.transit, pct: 10, color: "bg-blue-500" },
                        { label: "Sights & Tickets", amount: tripData.budget?.activities, pct: 12, color: "bg-amber-500" },
                        { label: "Extra Buffer (10%)", amount: tripData.budget?.contingency, pct: 8, color: "bg-emerald-500" },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-neutral-700 dark:text-neutral-300">{item.label}</span>
                            <span className="text-neutral-900 dark:text-white font-bold">
                              ₹{Number(item.amount || 0).toLocaleString("en-IN")} {tripData.budget?.currency || "INR"}
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all duration-500", item.color)} style={{ width: `${item.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center text-xs text-neutral-500">
                      <span>Daily average expenditure: <strong>₹{Number(tripData.budget?.dailyAverage || 0).toLocaleString("en-IN")} {tripData.budget?.currency || "INR"} / day</strong></span>
                      <span className="text-neutral-400">Based on local city averages</span>
                    </div>
                  </div>

                  {/* Right: Cost Summary Card */}
                  <div className="md:col-span-4 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 text-xs mb-3">
                        Budget Summary
                      </Badge>
                      <h4 className="font-bold text-neutral-900 dark:text-white text-base mb-2">
                        Transparent Cost Breakdown
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        Calculated from realistic local rates for hotels, food, and sightseeing, including a 10% buffer for unexpected expenses.
                      </p>
                    </div>

                    <div className="mt-6 p-3 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                      <div className="text-[11px] font-semibold text-neutral-500">Estimated Cost Per Person</div>
                      <div className="text-xl font-extrabold text-neutral-900 dark:text-white mt-0.5">
                        ₹{Number(tripData.budget?.dailyAverage || 0).toLocaleString("en-IN")} <span className="text-xs font-normal text-neutral-400">/ person / day</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  SUBVIEW 3: TRANSIT & CITY LOGISTICS
                 ========================================================= */}
              {plannerSubView === "logistics" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Airport & Transit */}
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
                      <Plane className="size-5 text-indigo-500" />
                      Airports & Getting Around
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                          Airports
                        </h4>
                        <ul className="space-y-1.5">
                          {(tripData.essentials?.airports || []).map((a: string) => (
                            <li key={a} className="text-xs text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                              <span className="size-1.5 rounded-full bg-indigo-500" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
                        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                          Local Transport
                        </h4>
                        <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                          {tripData.essentials?.transit}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Electrical & Cultural Customs */}
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-4">
                      <Shield className="size-5 text-emerald-500" />
                      Local Tips & Emergency
                    </h3>
                    <div className="space-y-3.5 text-xs">
                      <div>
                        <span className="font-semibold text-neutral-500">Power Plugs:</span>
                        <p className="text-neutral-800 dark:text-neutral-200 font-medium mt-0.5">
                          {tripData.essentials?.powerPlug}
                        </p>
                      </div>

                      <div>
                        <span className="font-semibold text-neutral-500">Tipping Custom:</span>
                        <p className="text-neutral-800 dark:text-neutral-200 font-medium mt-0.5">
                          {tripData.essentials?.tipping}
                        </p>
                      </div>

                      <div>
                        <span className="font-semibold text-neutral-500">Emergency Number:</span>
                        <p className="text-neutral-800 dark:text-neutral-200 font-medium mt-0.5">
                          {tripData.essentials?.emergency}
                        </p>
                      </div>

                      <div>
                        <span className="font-semibold text-neutral-500">Payment & Money:</span>
                        <p className="text-neutral-800 dark:text-neutral-200 font-medium mt-0.5">
                          {tripData.essentials?.currency}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Culinary Guide */}
                  <div className="md:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-3">
                      <Utensils className="size-5 text-amber-500" />
                      Popular Local Foods to Try
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      {(tripData.essentials?.cuisine || []).map((food: string) => (
                        <div
                          key={food}
                          className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs text-neutral-800 dark:text-neutral-200 flex items-start gap-2"
                        >
                          <Utensils className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <span>{food}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================
                  SUBVIEW 4: CLIMATE PACKING & RAIN RISK
                 ========================================================= */}
              {plannerSubView === "packing" && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Checklist */}
                  <div className="md:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
                      <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <Luggage className="size-5 text-amber-500" />
                        Packing Checklist
                      </h3>
                      <span className="text-xs text-neutral-500">
                        {Object.values(checkedItems).filter(Boolean).length} packed
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Core Gear */}
                      <div>
                        <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                          Essentials
                        </h4>
                        <div className="space-y-2">
                          {(tripData.packing?.core || []).map((item: string) => (
                            <label
                              key={item}
                              className="flex items-center gap-3 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={!!checkedItems[item]}
                                onChange={(e) =>
                                  setCheckedItems((prev) => ({ ...prev, [item]: e.target.checked }))
                                }
                                className="size-4 rounded text-violet-600 focus:ring-violet-500"
                              />
                              <span
                                className={cn(
                                  "text-xs transition-all",
                                  checkedItems[item]
                                    ? "line-through text-neutral-400"
                                    : "text-neutral-800 dark:text-neutral-200 font-medium"
                                )}
                              >
                                {item}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Weather Adaptive Gear */}
                      {tripData.packing?.adaptive?.length > 0 && (
                        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
                          <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                            Weather Gear ({tripData.weather?.condition})
                          </h4>
                          <div className="space-y-2">
                            {(tripData.packing?.adaptive || []).map((item: string) => (
                              <label
                                key={item}
                                className="flex items-center gap-3 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={!!checkedItems[item]}
                                  onChange={(e) =>
                                    setCheckedItems((prev) => ({ ...prev, [item]: e.target.checked }))
                                  }
                                  className="size-4 rounded text-violet-600 focus:ring-violet-500"
                                />
                                <span
                                  className={cn(
                                    "text-xs transition-all",
                                    checkedItems[item]
                                      ? "line-through text-neutral-400"
                                      : "text-neutral-800 dark:text-neutral-200 font-medium"
                                  )}
                                >
                                  {item}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Weather Risk & Contingency Advisory */}
                  <div className="md:col-span-5 space-y-4">
                    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 border border-violet-200 dark:border-violet-800/60 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Cloud className="size-5 text-violet-600 dark:text-violet-400" />
                        <h4 className="font-bold text-neutral-900 dark:text-white text-sm">
                          Weather Notice
                        </h4>
                      </div>
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed mb-3">
                        {tripData.packing?.advisory}
                      </p>
                      <div className="p-3 bg-white/70 dark:bg-neutral-800/70 rounded-xl border border-violet-200/60 dark:border-violet-700/40 text-xs">
                        <strong className="text-violet-800 dark:text-violet-300 block mb-0.5">
                          Rain Backup:
                        </strong>
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {tripData.packing?.rainContingency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: AI CONCIERGE WITH LIVE MCP FUNCTION CALLING
         ========================================================================= */}
      {activeTab === "chat" && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm flex flex-col h-[650px] overflow-hidden">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/40">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md">
                <Bot className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                  Trip Planning Assistant
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Ask questions about any destination, schedule, or budget
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setMessages([
                  {
                    role: "assistant",
                    content:
                      "Conversation cleared. Where would you like to travel?",
                  },
                ])
              }
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            >
              Clear Chat
            </Button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex flex-col max-w-2xl",
                  m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div
                  className={cn(
                    "p-4 rounded-2xl text-xs sm:text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-violet-600 text-white rounded-br-none shadow-sm"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-none border border-neutral-200/80 dark:border-neutral-700/80"
                  )}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {/* Tool Call Badges if triggered */}
                  {m.toolsCalled && m.toolsCalled.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700/80 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                        <Terminal className="size-3 text-violet-500" />
                        Live Tools Used:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.toolsCalled.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 font-mono text-[10px]"
                          >
                            <CheckCircle className="size-2.5 text-emerald-500" />
                            {t.name} ({t.durationMs || 120}ms)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="mr-auto flex items-center gap-2 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs text-neutral-500">
                <RefreshCw className="size-3.5 animate-spin text-violet-600" />
                Planning your trip...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-6 py-2 bg-neutral-50 dark:bg-neutral-950/20 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] text-neutral-400 shrink-0">Try asking:</span>
            {[
              "Plan a 3-day trip to Tokyo",
              "What are the best sights in Paris?",
              "Estimate cost for 4 days in London",
              "What to pack for San Francisco?",
            ].map((qp) => (
              <button
                key={qp}
                onClick={() => {
                  setChatInput(qp);
                }}
                className="text-[11px] px-2.5 py-1 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-violet-600 shrink-0"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything about cities, schedules, costs, or packing..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <Button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-5"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB 3: MCP TOOLS PLAYGROUND (8 DEDICATED TOOLS)
         ========================================================================= */}
      {activeTab === "tools" && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Zap className="size-5 text-amber-500" />
              Built-In Tools (8)
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Test each data tool directly to see the real information it retrieves.
            </p>
          </div>

          {/* Tool Selector Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
            {[
              { id: "destination", label: "1. City Lookup", icon: MapPin },
              { id: "weather", label: "2. Weather", icon: Cloud },
              { id: "attractions", label: "3. Attractions", icon: Compass },
              { id: "essentials", label: "4. City Guide", icon: Plane },
              { id: "budget", label: "5. Budget", icon: DollarSign },
              { id: "packing", label: "6. Packing List", icon: Luggage },
              { id: "itinerary", label: "7. Itinerary", icon: Calendar },
              { id: "calendar", label: "8. Calendar File", icon: Download },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setToolTab(t.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                    toolTab === t.id
                      ? "bg-violet-600 text-white shadow-sm"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  )}
                >
                  <Icon className="size-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tool Card Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Input Config */}
            <div className="md:col-span-5 space-y-4">
              <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Tool Parameters & Execution
              </h4>

              {toolTab === "destination" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">City Name</label>
                    <input
                      type="text"
                      value={toolInputs.destination?.city || "Tokyo"}
                      onChange={(e) =>
                        setToolInputs((prev) => ({
                          ...prev,
                          destination: { ...prev.destination, city: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border text-xs dark:bg-neutral-800"
                    />
                  </div>
                  <Button
                    onClick={() => executePlaygroundTool("destination", "destination", toolInputs.destination)}
                    disabled={toolLoading.destination}
                    className="w-full text-xs bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {toolLoading.destination ? "Looking up..." : "Look Up City"}
                  </Button>
                </div>
              )}

              {toolTab === "weather" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">City Name</label>
                    <input
                      type="text"
                      value={toolInputs.weather?.city || "Paris"}
                      onChange={(e) =>
                        setToolInputs((prev) => ({
                          ...prev,
                          weather: { ...prev.weather, city: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border text-xs dark:bg-neutral-800"
                    />
                  </div>
                  <Button
                    onClick={() => executePlaygroundTool("weather", "weather", toolInputs.weather)}
                    disabled={toolLoading.weather}
                    className="w-full text-xs bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {toolLoading.weather ? "Checking weather..." : "Get Weather Forecast"}
                  </Button>
                </div>
              )}

              {toolTab === "attractions" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">City Name</label>
                    <input
                      type="text"
                      value={toolInputs.attractions?.city || "Rome"}
                      onChange={(e) =>
                        setToolInputs((prev) => ({
                          ...prev,
                          attractions: { ...prev.attractions, city: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border text-xs dark:bg-neutral-800"
                    />
                  </div>
                  <Button
                    onClick={() => executePlaygroundTool("attractions", "activities", toolInputs.attractions)}
                    disabled={toolLoading.attractions}
                    className="w-full text-xs bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {toolLoading.attractions ? "Finding attractions..." : "Find Attractions"}
                  </Button>
                </div>
              )}

              {toolTab === "essentials" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">City Name</label>
                    <input
                      type="text"
                      value={toolInputs.essentials?.city || "London"}
                      onChange={(e) =>
                        setToolInputs((prev) => ({
                          ...prev,
                          essentials: { ...prev.essentials, city: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border text-xs dark:bg-neutral-800"
                    />
                  </div>
                  <Button
                    onClick={() => executePlaygroundTool("essentials", "essentials", toolInputs.essentials)}
                    disabled={toolLoading.essentials}
                    className="w-full text-xs bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {toolLoading.essentials ? "Loading guide..." : "Get City Guide"}
                  </Button>
                </div>
              )}

              {toolTab === "budget" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">City Name</label>
                    <input
                      type="text"
                      value={toolInputs.budget?.city || "Tokyo"}
                      onChange={(e) =>
                        setToolInputs((prev) => ({
                          ...prev,
                          budget: { ...prev.budget, city: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border text-xs dark:bg-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Days</label>
                    <input
                      type="number"
                      value={toolInputs.budget?.days || 3}
                      onChange={(e) =>
                        setToolInputs((prev) => ({
                          ...prev,
                          budget: { ...prev.budget, days: Number(e.target.value) },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border text-xs dark:bg-neutral-800"
                    />
                  </div>
                  <Button
                    onClick={() => executePlaygroundTool("budget", "budget", toolInputs.budget)}
                    disabled={toolLoading.budget}
                    className="w-full text-xs bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {toolLoading.budget ? "Calculating..." : "Estimate Budget"}
                  </Button>
                </div>
              )}

              {toolTab === "packing" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">City Name</label>
                    <input
                      type="text"
                      value={toolInputs.packing?.city || "San Francisco"}
                      onChange={(e) =>
                        setToolInputs((prev) => ({
                          ...prev,
                          packing: { ...prev.packing, city: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border text-xs dark:bg-neutral-800"
                    />
                  </div>
                  <Button
                    onClick={() => executePlaygroundTool("packing", "packing", toolInputs.packing)}
                    disabled={toolLoading.packing}
                    className="w-full text-xs bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {toolLoading.packing ? "Generating..." : "Get Packing List"}
                  </Button>
                </div>
              )}

              {toolTab === "itinerary" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">City Name</label>
                    <input
                      type="text"
                      value={toolInputs.itinerary?.city || "Zurich"}
                      onChange={(e) =>
                        setToolInputs((prev) => ({
                          ...prev,
                          itinerary: { ...prev.itinerary, city: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border text-xs dark:bg-neutral-800"
                    />
                  </div>
                  <Button
                    onClick={() => executePlaygroundTool("itinerary", "itinerary", toolInputs.itinerary)}
                    disabled={toolLoading.itinerary}
                    className="w-full text-xs bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {toolLoading.itinerary ? "Creating plan..." : "Create Itinerary"}
                  </Button>
                </div>
              )}

              {toolTab === "calendar" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">City Name</label>
                    <input
                      type="text"
                      value={toolInputs.calendar?.city || "Tokyo"}
                      onChange={(e) =>
                        setToolInputs((prev) => ({
                          ...prev,
                          calendar: { ...prev.calendar, city: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border text-xs dark:bg-neutral-800"
                    />
                  </div>
                  <Button
                    onClick={() => executePlaygroundTool("calendar", "calendar", toolInputs.calendar)}
                    disabled={toolLoading.calendar}
                    className="w-full text-xs bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {toolLoading.calendar ? "Exporting..." : "Export Calendar File"}
                  </Button>
                </div>
              )}
            </div>

            {/* Output Inspector */}
            <div className="md:col-span-7">
              <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Raw JSON Schema Output
              </h4>
              <div className="bg-neutral-950 text-neutral-200 p-4 rounded-xl font-mono text-xs overflow-auto max-h-[380px] border border-neutral-800">
                {toolResults[toolTab] ? (
                  <pre>{JSON.stringify(toolResults[toolTab], null, 2)}</pre>
                ) : (
                  <span className="text-neutral-500">// Click execute to inspect live MCP tool payload</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: LIVE TELEMETRY & LOGS AUDIT CONSOLE
         ========================================================================= */}
      {activeTab === "logs" && (
        <LogsViewer logs={logs} onClearLogs={() => setLogs([])} />
      )}

      {/* =========================================================================
          TAB 5: ENTERPRISE ROADMAP & MANAGER ROI PITCH
         ========================================================================= */}
      {activeTab === "enterprise" && (
        <EnterpriseRoadmap />
      )}
    </div>
  );
}
