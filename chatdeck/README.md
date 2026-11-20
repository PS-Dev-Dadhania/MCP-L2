# WeekendWiz - Enterprise Travel Concierge Web UI

A modern, high-performance web interface for the **WeekendWiz** autonomous travel agent and Model Context Protocol (MCP) tool suite.

---

## Features

- **Multi-Day Trip Planner**: Autonomously synthesizes weather-aware itineraries (2 to 7 days) with morning, afternoon, and evening slots, Google Maps links, and rain alternatives.
- **Categorized Budget Modeling**: Real-time financial breakdowns across lodging, dining, transit, admissions, and contingency reserves.
- **Logistics & City Essentials**: International airport hubs, municipal transit passes, electrical plug standards, tipping norms, and emergency numbers.
- **Climate Packing & Rain Protocol**: Interactive checklists adapting dynamically to destination temperature and precipitation risk.
- **RFC 5545 iCalendar Sync**: 1-click `.ics` calendar generation for Google Calendar, Outlook, and Apple Calendar.
- **Live Telemetry & Logs Audit Console**: Real-time execution ledger tracking tool invocations, duration in milliseconds, status, and raw JSON export.
- **Interactive AI Concierge**: Multi-turn chat powered by Groq LLMs with real-time MCP function calling badges.

---

## Quick Start

### 1. Build and Run Production Server
```powershell
cd "c:\Users\DevDadhania\Downloads\weekendwiz 1\chatdeck"
npm run build
npm start
```

Navigate to http://localhost:3000 in your browser.

---

## API Endpoints

- `POST /api/chat`: Multi-turn AI Agent reasoning loop with Groq & MCP tool calling.
- `POST /api/tools`: Gateway for deterministic MCP microservices:
  - `{ "action": "destination", "city": "Tokyo" }`
  - `{ "action": "itinerary", "city": "Tokyo", "days": 3, "style": "executive" }`
  - `{ "action": "budget", "city": "Paris", "days": 3, "style": "executive" }`
  - `{ "action": "essentials", "city": "London" }`
  - `{ "action": "packing", "city": "San Francisco" }`
  - `{ "action": "calendar", "city": "Tokyo", "days": 3 }`
