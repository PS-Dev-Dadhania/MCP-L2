# WeekendWiz System Architecture & MCP Topology

## 1. High-Level Architecture Overview

WeekendWiz is an autonomous, multi-tool travel concierge engineered on Anthropic's **Model Context Protocol (MCP)** Level 2 specification. It bridges high-level generative AI reasoning (via Google Gemini and Groq LLMs) with deterministic enterprise tools (geocoding, meteorological forecasts, curated cultural points of interest, localized budget estimation, and RFC 5545 calendar generation).

```
                                +-----------------------------------+
                                |    Next.js Enterprise Deck        |
                                |       (React 19 / Radix UI)       |
                                +-----------------+-----------------+
                                                  |
                                HTTP / REST API   |  (Port 3000)
                                                  v
+-------------------------------+-----------------+-----------------+
|                                                                   |
|                      Next.js API Routes Bridge                     |
|                                                                   |
|   /api/chat  (LLM Prompt Stream)     /api/tools (MCP Execution)   |
+-------------------------------+-----------------+-----------------+
                                                  |
                                                  v
+-------------------------------------------------+-----------------+
|                                                                   |
|              Python FastMCP Core Engine (weekendwiz/)              |
|                                                                   |
|   Server: server.py  |  Concierge: agent.py  |  CLI: run.py       |
+-------------------------------+-----------------+-----------------+
                                |
             +------------------+------------------+
             |                                     |
             v                                     v
+---------------------------+         +-----------------------------+
|    8 Enterprise Tools     |         |     Upstream Providers      |
| - resolve_destination     |         | - Open-Meteo Geocoding      |
| - get_weather_forecast    | <-----> | - Open-Meteo Weather API    |
| - find_attractions        |         | - Wikipedia MediaWiki API   |
| - travel_essentials       |         | - OpenLibrary API           |
| - estimate_budget         |         +-----------------------------+
| - weather_packing_check   |
| - multiday_itinerary      |
| - export_calendar_ics     |
+---------------------------+
```

---

## 2. MCP Client-Server Topology

### Server (`weekendwiz/server.py`)
* Implements the FastMCP specification exposing callable tools through `@mcp.tool()`.
* Communicates over standard IO (`stdio`) using standard JSON-RPC 2.0 messages.
* Handles data sanitization, keyword filtering (preventing sensitive/historical tragedies from entering tourist itineraries), and localized budget generation in Indian Rupees (`INR` / `₹`).

### Host / Client Layer (`weekendwiz/agent.py` & `chatdeck/app/api/`)
* **Discovery (`tools/list`)**: Discovers tool declarations, input argument JSON schemas, and parameter requirements.
* **Execution (`tools/call`)**: Submits parameterized tool calls and receives structured JSON payloads.
* **Autonomous Chaining**: The agent loop executes a multi-step sequence:
  1. `resolve_destination` -> Extracts verified geographic coordinates and timezone.
  2. `get_weather_forecast` -> Obtains microclimate forecast for the trip dates.
  3. `find_attractions` -> Obtains safe, verified landmark coordinates and articles.
  4. `travel_essentials` -> Retrieves power plugs, airport codes, and emergency dispatch.
  5. `estimate_budget` -> Computes localized lodging, food, transit, and 10% contingency.
  6. `weather_packing_checklist` -> Produces condition-specific travel gear lists.
  7. `generate_multiday_itinerary` -> Groups slots chronologically into Morning, Afternoon, and Evening.
  8. `export_calendar_ics` -> Emits standard RFC 5545 iCalendar files.

---

## 3. Data Integrity & Safety Guardrails

| Risk Vector | Mitigation Strategy | Implementation |
| :--- | :--- | :--- |
| **Wiki Geosearch Hallucination** | Keyword sanitization blocklist (`bombing`, `sarin`, `tragedy`, `high school`). Curated fallback landmarks for major heritage cities. | `weekendwiz/server.py` |
| **Budget Unrealism** | Localized purchasing power tiers (`COST_TIERS_INR`), currency validation, and strict boundary clamping (1 to 14 days). | `weekendwiz/server.py` |
| **Calendar Syntax Corruption** | Strict RFC 5545 validation: `BEGIN:VCALENDAR`, `VERSION:2.0`, `PRODID`, `VEVENT`, `DTSTART`/`DTEND` in UTC. | `tests/test_mcp_suite.py` |
| **LLM Booking Fabrications** | Strict system prompt guardrails forbidding invented confirmation numbers, PNR codes, or airline tickets. | `chatdeck/app/api/chat/route.ts` & `agent.py` |
