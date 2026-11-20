# Model Context Protocol (MCP) Tool Specifications

## Server Identification
* **Server Name**: `WeekendWizTravelConcierge`
* **Protocol Version**: FastMCP 1.0 / Level 2 MCP
* **Transport Mechanisms**: `stdio` (Command Line / Subprocess) & `HTTP/JSON-RPC` (Web Deck Bridge)

---

## Tool Reference Registry

### 1. `resolve_destination`
Converts any global city name into verified geographical coordinates, country name, elevation, and timezone.
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "city": { "type": "string", "description": "City name e.g. 'Ahmedabad', 'Zurich', 'Tokyo'" }
    },
    "required": ["city"]
  }
  ```
* **Output Payload**:
  ```json
  {
    "city": "Ahmedabad",
    "country": "India",
    "latitude": 23.0258,
    "longitude": 72.5873,
    "timezone": "Asia/Kolkata",
    "elevation_meters": 53
  }
  ```

---

### 2. `get_weather_forecast`
Queries Open-Meteo for real-time temperature, apparent temperature, WMO weather codes, and multi-day forecasts.
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "latitude": { "type": "number" },
      "longitude": { "type": "number" },
      "days": { "type": "integer", "default": 3 }
    },
    "required": ["latitude", "longitude"]
  }
  ```

---

### 3. `find_attractions`
Retrieves verified cultural attractions using Wikipedia coordinates search with strict safety blocklists.
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "city": { "type": "string" },
      "category": { "type": "string", "default": "cultural" },
      "limit": { "type": "integer", "default": 5 }
    },
    "required": ["city"]
  }
  ```

---

### 4. `travel_essentials`
Returns operational transit knowledge, primary airport hubs, power socket types, tipping etiquette, and emergency contacts.
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "city": { "type": "string" }
    },
    "required": ["city"]
  }
  ```

---

### 5. `estimate_budget`
Computes tiered trip budgets (Backpacker, Moderate, Executive, Luxury) with Purchasing Power Parity (PPP) in Indian Rupees (`INR`) or USD (`$`).
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "city": { "type": "string" },
      "days": { "type": "integer", "default": 3 },
      "travel_style": { "type": "string", "enum": ["budget", "moderate", "executive", "luxury"], "default": "moderate" },
      "currency": { "type": "string", "enum": ["INR", "USD"], "default": "INR" }
    },
    "required": ["city"]
  }
  ```

---

### 6. `weather_packing_checklist`
Translates current microclimate conditions into a categorized packing advisory and rain contingency plan.
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "city": { "type": "string" }
    },
    "required": ["city"]
  }
  ```

---

### 7. `generate_multiday_itinerary`
Builds a cohesive multi-day travel schedule allocating morning, afternoon, and evening slots with distance checks and dining options.
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "city": { "type": "string" },
      "days": { "type": "integer", "default": 3 },
      "style": { "type": "string", "default": "cultural" }
    },
    "required": ["city"]
  }
  ```

---

### 8. `export_calendar_ics`
Generates RFC 5545 `.ics` calendar content for seamless import into Google Calendar, Apple Calendar, and Microsoft Outlook.
* **Input Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "city": { "type": "string" },
      "days": { "type": "integer", "default": 3 }
    },
    "required": ["city"]
  }
  ```
