# WeekendWiz - Autonomous Enterprise Travel Concierge (MCP Level 2)

An autonomous, multi-tool travel concierge powered by Anthropic's **Model Context Protocol (MCP)**, Google Gemini, and Groq LLMs. WeekendWiz features a high-performance Python **FastMCP** server and a modern **Next.js / Tailwind CSS / Radix UI** enterprise web deck for interactive planning, real-time weather, budget breakdown in Indian Rupees (INR), curated cultural itineraries, and RFC 5545 iCalendar (`.ics`) exports.

---

## Architecture Overview

```
                                      +--------------------------+
                                      |  Next.js Web Interface   |
                                      |   (ChatDeck / UI / API)  |
                                      +------------+-------------+
                                                   |
                             REST / JSON-RPC       |
                                                   v
+------------------------+            +------------+-------------+            +-------------------------+
|     LLM Providers      | <--------> |  FastMCP Concierge Server| <--------> |    External Services    |
| (Google Gemini / Groq) |            |     (weekendwiz/s.py)    |            | (Open-Meteo, Wikipedia) |
+------------------------+            +--------------------------+            +-------------------------+
                                                   |
                                                   v
                                      +--------------------------+
                                      | 8 Enterprise MCP Tools   |
                                      | - Destination Geocoding  |
                                      | - Microclimate Forecast  |
                                      | - Curated Attractions    |
                                      | - City Transit Logistics |
                                      | - Tiered INR Budget      |
                                      | - Climate Packing Check  |
                                      | - Autonomous Itinerary   |
                                      | - RFC 5545 Calendar Sync |
                                      +--------------------------+
```

---

## Key Features

1. **8 Enterprise MCP Tools** (`weekendwiz/s.py`):
   - `resolve_destination`: Geocoding, coordinates, timezone, elevation via Open-Meteo.
   - `get_weather_forecast`: Live conditions, multi-day microclimate metrics, precipitation probabilities.
   - `find_attractions`: Verified landmark discovery via Wikipedia API with safety sanitization and curated fallbacks.
   - `travel_essentials`: Airport codes, metro/transit networks, power plug compatibility (Type C/D/M), and local emergency contacts.
   - `estimate_budget`: Tiered cost breakdowns (Backpacker, Moderate, Executive, Luxury) with localized Indian Rupee (`INR` / `₹`) calculations.
   - `weather_packing_checklist`: Dynamic gear recommendations based on temperature, precipitation, and conditions.
   - `generate_multiday_itinerary`: Multi-day morning, afternoon, and evening scheduling with distance grouping and weather-adaptive alternatives.
   - `export_calendar_ics`: RFC 5545 compliant `.ics` calendar sync for Google Calendar, Apple Calendar, and Microsoft Outlook.

2. **Next.js Enterprise Deck** (`chatdeck/`):
   - Interactive dashboard with real-time telemetry, log streams, and currency toggle.
   - Pre-configured defaults for Ahmedabad, India with INR pricing.
   - Live Tool Playground for testing individual MCP tool calls with latency benchmarks.
   - One-click `.ics` calendar export and markdown itinerary download.

3. **Autonomous Agent Loop** (`weekendwiz/agent.py`):
   - Multi-step function calling loop orchestrated through Gemini and Groq.
   - Anti-hallucination guardrails and strict validation against fabricated booking references.

4. **Automated Quality Assurance** (`qa_test_suite.py`):
   - 30-case automated test suite verifying edge cases, diacritics, negative inputs, budget clamping, and calendar RFC 5545 grammar.

---

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── ci.yml                    # Automated GitHub Actions CI workflow (Tests + Build)
├── docs/                             # Engineering & Protocol Documentation
│   ├── ARCHITECTURE.md               # System Topology, Flow Diagrams & Safety Controls
│   └── MCP_SPECIFICATION.md          # FastMCP Tool Signatures & Parameter Schemas
├── tests/                            # Automated Testing Suite
│   ├── __init__.py
│   └── test_mcp_suite.py             # 30-case QA verification suite (pytest compatible)
├── chatdeck/                         # Next.js Enterprise Web Deck & MCP Bridge
│   ├── app/                          # App Router (/ and API routes /api/chat, /api/tools)
│   ├── components/                   # React 19 / Tailwind CSS / Radix UI modules
│   │   └── Blocks/                   # Deck, Architecture, and Logs UI modules
│   ├── lib/                          # Utility functions
│   ├── package.json                  # Package configuration ("weekendwiz-chatdeck" v2.0.0)
│   ├── Dockerfile                    # Container definition for frontend
│   └── .env.example                  # Frontend environment template
├── weekendwiz/                       # Core Python FastMCP Server & AI Agent
│   ├── server.py                     # Canonical FastMCP server definition & 8 MCP Tools
│   ├── agent.py                      # Multi-step autonomous LLM tool calling engine
│   ├── run.py                        # Diagnostic CLI & stdio MCP transport runner
│   ├── s.py                          # Backward-compatibility import shim
│   ├── pyproject.toml                # Standard PEP 517/621 Python package configuration
│   ├── requirements.txt              # Production Python dependencies
│   ├── Dockerfile                    # Container definition for backend
│   └── .env.example                  # Backend environment template
├── docker-compose.yml                # Multi-container orchestration (Backend + Frontend)
├── qa_test_suite.py                  # Standalone QA test execution runner
├── .gitignore                        # Git exclusion rules
└── README.md                         # Project documentation & setup instructions
```

---

## Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 2. Python Backend Setup
```bash
cd weekendwiz

# Create and activate virtual environment (optional)
python -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your GROQ_API_KEY and GEMINI_API_KEY

# Run diagnostic tool suite
python run.py --test

# Run as stdio FastMCP server
python -c "import s; s.mcp.run()"
```

### 3. Next.js Web Deck Setup
```bash
cd ../chatdeck

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Run production build and start server
npm run build
npm start

# Access the dashboard at http://localhost:3000
```

### 4. Running the QA Suite
```bash
python qa_test_suite.py
```

---

## License
MIT License.
