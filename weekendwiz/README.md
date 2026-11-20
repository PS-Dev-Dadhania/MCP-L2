# WeekendWiz - Enterprise Travel Planning MCP Server

A Model Context Protocol (MCP) server providing deterministic microservices for autonomous travel planning, corporate offsite coordination, and executive leisure itineraries.

## Capabilities

- **Destination Geocoding** (`resolve_destination`): Resolves city names to coordinates, administrative regions, country codes, timezones, and elevation.
- **Microclimate Forecast** (`get_weather_forecast`): Real-time temperatures, wind speeds, and multi-day meteorological forecasts.
- **Cultural Attractions Geosearch** (`find_attractions`): Verifies landmarks and points of interest using Wikipedia Geosearch and Google Maps integration.
- **Travel Logistics & Essentials** (`travel_essentials`): International airport hubs, municipal transit passes, power plug types, tipping customs, and emergency numbers.
- **Categorized Budget Estimator** (`estimate_budget`): Tiered cost breakdowns covering accommodation, dining, transit, activities, and contingency buffers.
- **Climate Packing & Rain Protocol** (`weather_packing_checklist`): Dynamic weather-adaptive gear recommendations and automated indoor rain contingencies.
- **Multi-Day Itinerary Synthesis** (`generate_multiday_itinerary`): 2 to 7 day structured schedules with morning, afternoon, and evening slots.
- **iCalendar Sync** (`export_calendar_ics`): RFC 5545 `.ics` calendar generation for Google Calendar, Outlook, and Apple Calendar.

---

## Web Application (ChatDeck Platform)

To launch the Next.js web application with the interactive trip planner, AI concierge, live telemetry audit console, and enterprise roadmap:

```powershell
cd "../chatdeck"
npm start
```
Then navigate to http://localhost:3000 in your browser.

---

## Quick Start (CLI & Diagnostics)

### 1. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 2. Run Diagnostics & Test Suite
```powershell
# Run automated verification across all 8 MCP tools
python run.py --test

# Or launch the interactive terminal console
python run.py
```

### 3. Run Autonomous MCP Agent
```powershell
# Interactive ReAct tool-calling agent using Groq and MCP ClientSession
python agent_fun.py

# Multi-turn evaluation using agent.py
python agent.py groq
```

---

## Connecting to Standard MCP Hosts

### Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "weekendwiz-concierge": {
      "command": "python",
      "args": ["c:\\Users\\DevDadhania\\Downloads\\weekendwiz 1\\weekendwiz\\s.py"]
    }
  }
}
```

### Cursor / Antigravity (`mcp_config.json`)
```json
{
  "mcpServers": {
    "weekendwiz": {
      "type": "stdio",
      "command": "python",
      "args": ["./weekendwiz/s.py"]
    }
  }
}
```
