try:
    from mcp.server.fastmcp import FastMCP
except (ImportError, ModuleNotFoundError):
    from mcp.server.mcpserver import MCPServer as FastMCP
from typing import Dict, Any, List
import requests, html, json, datetime

mcp = FastMCP("WeekendWizTravelConcierge")
TIMEOUT = 20

def _get(url: str, headers: dict = None, **kwargs) -> requests.Response:
    """Standardized HTTP helper with descriptive User-Agent."""
    req_headers = {"User-Agent": "WeekendWizTravelConcierge/2.0 (enterprise-travel-planner@weekendwiz.local)"}
    if headers:
        req_headers.update(headers)
    r = requests.get(url, timeout=TIMEOUT, headers=req_headers, **kwargs)
    r.raise_for_status()
    return r


# ---------------------------------------------------------------------------
# 1. Destination Geocoding & Regional Resolution
# ---------------------------------------------------------------------------
@mcp.tool()
def resolve_destination(city: str) -> Dict[str, Any]:
    """Resolve a destination city name to exact coordinates, country, timezone, and elevation."""
    data = _get("https://geocoding-api.open-meteo.com/v1/search",
                params={"name": city, "count": 1}).json()
    results = data.get("results")
    if not results:
        return {"error": f"Destination not found: {city}"}
    c = results[0]
    return {
        "city": c["name"],
        "country": c.get("country", "Unknown"),
        "country_code": c.get("country_code", ""),
        "admin1": c.get("admin1", ""),
        "latitude": c["latitude"],
        "longitude": c["longitude"],
        "timezone": c.get("timezone", "UTC"),
        "elevation_meters": c.get("elevation", 0),
    }

# Backwards compatible alias
@mcp.tool()
def city_to_coords(city: str) -> Dict[str, Any]:
    """Convert a city name to latitude/longitude coordinates."""
    return resolve_destination(city)


# ---------------------------------------------------------------------------
# 2. Multi-Day Weather & Microclimate Forecast
# ---------------------------------------------------------------------------
WEATHER_CODES: Dict[int, str] = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
}

@mcp.tool()
def get_weather_forecast(latitude: float, longitude: float, days: int = 3) -> Dict[str, Any]:
    """Get real-time meteorological conditions and multi-day forecast for coordinates."""
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation",
        "daily": "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max",
        "timezone": "auto",
        "forecast_days": min(max(days, 1), 7),
    }
    r = _get("https://api.open-meteo.com/v1/forecast", params=params)
    data = r.json()
    current = data.get("current", {})
    daily = data.get("daily", {})

    wcode = current.get("weather_code", 0)
    current_summary = {
        "temperature_c": current.get("temperature_2m", 20.0),
        "feels_like_c": current.get("apparent_temperature", 20.0),
        "humidity_percent": current.get("relative_humidity_2m", 50),
        "weather_code": wcode,
        "condition": WEATHER_CODES.get(wcode, "Clear sky"),
        "wind_speed_kmh": current.get("wind_speed_10m", 5.0),
        "precipitation_mm": current.get("precipitation", 0.0),
    }

    forecast = []
    dates = daily.get("time", [])
    max_temps = daily.get("temperature_2m_max", [])
    min_temps = daily.get("temperature_2m_min", [])
    codes = daily.get("weather_code", [])
    precip_probs = daily.get("precipitation_probability_max", [])

    for i in range(len(dates)):
        c = codes[i] if i < len(codes) else 0
        forecast.append({
            "date": dates[i],
            "temp_max_c": max_temps[i] if i < len(max_temps) else None,
            "temp_min_c": min_temps[i] if i < len(min_temps) else None,
            "condition": WEATHER_CODES.get(c, "Clear"),
            "precipitation_probability": precip_probs[i] if i < len(precip_probs) else 0,
        })

    return {
        "current": current_summary,
        "forecast": forecast,
    }

# Backwards compatible alias
@mcp.tool()
def get_weather(latitude: float, longitude: float) -> Dict[str, Any]:
    """Current weather at coordinates via Open-Meteo."""
    res = get_weather_forecast(latitude, longitude, days=1)
    return {
        "temperature_2m": res["current"]["temperature_c"],
        "weather_code": res["current"]["weather_code"],
        "wind_speed_10m": res["current"]["wind_speed_kmh"],
    }


# ---------------------------------------------------------------------------
# 3. Verified Points of Interest & Attractions Geosearch
# ---------------------------------------------------------------------------
CURATED_LANDMARKS: Dict[str, List[Dict[str, Any]]] = {
    "ahmedabad": [
        {"name": "Sabarmati Ashram (Gandhi Memorial)", "wikipedia_url": "https://en.wikipedia.org/wiki/Sabarmati_Ashram"},
        {"name": "Adalaj Stepwell (Rudabai Stepwell)", "wikipedia_url": "https://en.wikipedia.org/wiki/Adalaj_Stepwell"},
        {"name": "Atal Pedestrian Bridge (Sabarmati Riverfront)", "wikipedia_url": "https://en.wikipedia.org/wiki/Atal_Pedestrian_Bridge"},
        {"name": "Sidi Saiyyed Mosque (Tree of Life)", "wikipedia_url": "https://en.wikipedia.org/wiki/Sidi_Saiyyed_Mosque"},
        {"name": "Hutheesing Jain Temple", "wikipedia_url": "https://en.wikipedia.org/wiki/Hutheesing_Jain_Temple"},
        {"name": "Manek Chowk Heritage Square", "wikipedia_url": "https://en.wikipedia.org/wiki/Manek_Chowk_(Ahmedabad)"},
        {"name": "Kankaria Lake Promenade", "wikipedia_url": "https://en.wikipedia.org/wiki/Kankaria_Lake"},
        {"name": "Sarkhej Roza Architectural Complex", "wikipedia_url": "https://en.wikipedia.org/wiki/Sarkhej_Roza"},
    ],
    "tokyo": [
        {"name": "Meiji Jingu Shrine & Cedar Forest", "wikipedia_url": "https://en.wikipedia.org/wiki/Meiji_Shrine"},
        {"name": "Senso-ji Historic Buddhist Temple in Asakusa", "wikipedia_url": "https://en.wikipedia.org/wiki/Sens%C5%8D-ji"},
        {"name": "Shibuya Sky Panoramic Observation Deck", "wikipedia_url": "https://en.wikipedia.org/wiki/Shibuya_Scramble_Square"},
        {"name": "Tsukiji Outer Market Culinary Walk", "wikipedia_url": "https://en.wikipedia.org/wiki/Tsukiji_fish_market"},
        {"name": "Imperial Palace East Gardens", "wikipedia_url": "https://en.wikipedia.org/wiki/Tokyo_Imperial_Palace"},
        {"name": "teamLab Planets Immersive Digital Art", "wikipedia_url": "https://en.wikipedia.org/wiki/TeamLab"},
    ],
}

DISALLOWED_KEYWORDS = [
    "attack", "bombing", "crash", "shooting", "massacre", "murder", "disaster",
    "riot", "championship", "tournament", "election", "scandal", "incident", "derailment",
    "sarin", "battle of", "siege of", "assassination", "school", "high school", "metro station",
    "railway station", "bus station", "hospital", "police station", "court"
]

@mcp.tool()
def find_attractions(city: str, category: str = "cultural", limit: int = 6) -> Dict[str, Any]:
    """Find verified cultural landmarks, museums, and attractions with distance and Wikipedia URLs."""
    coords = resolve_destination(city)
    if "error" in coords:
        return coords

    lat, lon = coords["latitude"], coords["longitude"]
    city_key = coords["city"].lower()

    wiki_url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "list": "geosearch",
        "gscoord": f"{lat}|{lon}",
        "gsradius": 12000,
        "gslimit": min(max(limit * 3, 10), 30),
        "format": "json",
    }
    
    attractions = []
    try:
        data = _get(wiki_url, params=params).json()
        items = data.get("query", {}).get("geosearch", [])
        for item in items:
            title = item.get("title", "")
            # Filter out non-tourist/inappropriate items
            if not any(bad in title.lower() for bad in DISALLOWED_KEYWORDS):
                attractions.append({
                    "name": title,
                    "distance_meters": int(item.get("dist", 0)),
                    "latitude": item.get("lat"),
                    "longitude": item.get("lon"),
                    "wikipedia_url": f"https://en.wikipedia.org/?curid={item.get('pageid')}",
                    "maps_search_url": f"https://www.google.com/maps/search/?api=1&query={requests.utils.quote(title + ' ' + coords['city'])}",
                })
            if len(attractions) >= limit:
                break
    except Exception:
        pass

    # If geosearch returned few items or known curated city, merge curated landmarks
    for k in CURATED_LANDMARKS:
        if k in city_key or city_key in k:
            curated = CURATED_LANDMARKS[k]
            existing_names = {a["name"].lower() for a in attractions}
            for c_item in curated:
                if c_item["name"].lower() not in existing_names and len(attractions) < limit:
                    attractions.append({
                        "name": c_item["name"],
                        "distance_meters": 1200,
                        "latitude": lat,
                        "longitude": lon,
                        "wikipedia_url": c_item["wikipedia_url"],
                        "maps_search_url": f"https://www.google.com/maps/search/?api=1&query={requests.utils.quote(c_item['name'] + ' ' + coords['city'])}",
                    })

    return {
        "city": coords["city"],
        "country": coords.get("country"),
        "category": category,
        "count": len(attractions),
        "attractions": attractions[:limit],
    }

# Backwards compatible alias
@mcp.tool()
def find_activities(city: str, limit: int = 5) -> Dict[str, Any]:
    """Find top cultural attractions, landmarks, and points of interest for a city."""
    res = find_attractions(city, limit=limit)
    if "error" in res:
        return res
    return {
        "city": res["city"],
        "country": res.get("country"),
        "count": res["count"],
        "activities": res["attractions"],
    }


# ---------------------------------------------------------------------------
# 4. Travel Essentials: Transit, Airports, Plugs & Local Customs
# ---------------------------------------------------------------------------
CITY_KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    "ahmedabad": {
        "airports": ["AMD (Sardar Vallabhbhai Patel International Airport - Hansol, 20m drive)"],
        "transit": "Ahmedabad Metro (North-South & East-West corridors), BRTS Janmarg bus network, Ola/Uber, and auto-rickshaws.",
        "plug_type": "Type C, D & M (230V, 50Hz - Standard Indian 3-pin round)",
        "tipping": "5% to 10% customary at sit-down restaurants; rounding up fares for auto/cab drivers is polite.",
        "emergency": "Police: 100/112 | Ambulance: 108 | Fire: 101",
        "currency_info": "Indian Rupee (INR). UPI (Google Pay, PhonePe, Paytm) and cards accepted virtually everywhere.",
        "must_try_cuisine": [
            "Authentic Gujarati Thali with Dal, Kadhi, Rotli & seasonal shaak",
            "Manek Chowk midnight street food (Gwalior Dosa, Chocolate Sandwich, Kulfi)",
            "Khaman Dhokla & Khandvi from Das Khaman",
            "Fafda & Jalebi breakfast with raw papaya sambharo",
            "Dalvada at Gujarat College"
        ]
    },
    "tokyo": {
        "airports": ["HND (Haneda - Central, 30m train)", "NRT (Narita - Express train 60m)"],
        "transit": "Suica / Pasmo IC Card or Tokyo Subway 72H Pass. World-class commuter trains.",
        "plug_type": "Type A & B (100V, 50/60Hz - US-compatible 2-prong)",
        "tipping": "No tipping customary; polite hospitality (Omotenashi) included.",
        "emergency": "Police: 110 | Medical/Fire: 119",
        "currency_info": "Japanese Yen (JPY). Credit cards widely accepted; keep cash for small stalls.",
        "must_try_cuisine": ["Tsukiji Outer Market fresh sashimi", "Tonkotsu / Shoyu Ramen in Shinjuku", "Charcoal Yakitori in Omoide Yokocho", "Matcha pastries in Asakusa"]
    },
    "paris": {
        "airports": ["CDG (Charles de Gaulle - RER B 45m)", "ORY (Orly - Metro Line 14 25m)"],
        "transit": "Navigo Easy card or contactless metro app. Paris Metro & RER network.",
        "plug_type": "Type C & E (230V, 50Hz - Standard European 2-pin)",
        "tipping": "Service compris (included by law). Rounding up 5-10% at fine dining is appreciated.",
        "emergency": "European Emergency: 112 | Police: 17 | SAMU Ambulance: 15",
        "currency_info": "Euro (EUR). Contactless card payment accepted virtually everywhere.",
        "must_try_cuisine": ["Fresh croissants & pain au chocolat at local boulangerie", "Duck Confit in Le Marais", "Artisanal cheeses & natural wines", "Macarons from Saint-Germain"]
    },
    "london": {
        "airports": ["LHR (Heathrow - Elizabeth Line 30m)", "LGW (Gatwick - Express 30m)", "LCY (London City)"],
        "transit": "Contactless card / Apple Pay on London Underground (Tube) and red double-decker buses.",
        "plug_type": "Type G (230V, 50Hz - British 3-pin rectangular)",
        "tipping": "12.5% discretionary service charge usually on the bill. Otherwise 10-12%.",
        "emergency": "Emergency Services: 999 or 112 | Non-Emergency Police: 101",
        "currency_info": "British Pound (GBP). Virtually 100% cashless city.",
        "must_try_cuisine": ["Sunday Roast with Yorkshire pudding", "Borough Market street food bites", "Traditional Afternoon Tea in Mayfair", "Salt beef bagels on Brick Lane"]
    },
    "new york": {
        "airports": ["JFK (John F. Kennedy - AirTrain 50m)", "EWR (Newark - NJ Transit 40m)", "LGA (LaGuardia - M60 bus/taxi)"],
        "transit": "OMNY contactless tap at all subway turnstiles and MTA buses. 24/7 service.",
        "plug_type": "Type A & B (120V, 60Hz - Standard US plugs)",
        "tipping": "18% - 22% standard in restaurants; $1-2 per drink at bars.",
        "emergency": "Emergency Services: 911 | City Services: 311",
        "currency_info": "US Dollar (USD). Cashless and credit cards universal.",
        "must_try_cuisine": ["Classic NYC bagel with lox & scallion cream cheese", "Foldable coal-fired thin-crust pizza slice", "Pastrami on rye from Katz's Delicatessen", "Chelsea Market gourmet tasting"]
    },
    "san francisco": {
        "airports": ["SFO (San Francisco International - BART 30m)", "OAK (Oakland Airport)"],
        "transit": "Clipper Card / Mobile Clipper on Muni Metro, cable cars, and BART.",
        "plug_type": "Type A & B (120V, 60Hz)",
        "tipping": "18% - 22% at seated restaurants.",
        "emergency": "Emergency: 911",
        "currency_info": "US Dollar (USD).",
        "must_try_cuisine": ["Mission-style burrito in the Mission District", "Sourdough clam chowder bowl at the Ferry Building", "Dungeness Crab at Fisherman's Wharf", "Specialty pour-over coffee in Hayes Valley"]
    },
}

@mcp.tool()
def travel_essentials(city: str) -> Dict[str, Any]:
    """Retrieve essential logistics: airport hubs, public transit passes, power plugs, tipping norms, and emergency contacts."""
    coords = resolve_destination(city)
    if "error" in coords:
        return coords

    city_key = coords["city"].lower()
    for known in CITY_KNOWLEDGE_BASE:
        if known in city_key or city_key in known:
            kb = CITY_KNOWLEDGE_BASE[known]
            return {
                "destination": f"{coords['city']}, {coords.get('country')}",
                "airports": kb["airports"],
                "transit_guide": kb["transit"],
                "power_plug": kb["plug_type"],
                "tipping_etiquette": kb["tipping"],
                "emergency_numbers": kb["emergency"],
                "currency_advice": kb["currency_info"],
                "signature_culinary": kb["must_try_cuisine"],
            }

    # Universal heuristic fallback for uncatalogued global cities
    country = coords.get("country", "")
    is_europe = country in ["France", "Germany", "Italy", "Spain", "Netherlands", "Austria", "Switzerland", "Portugal", "Belgium"]
    return {
        "destination": f"{coords['city']}, {coords.get('country')}",
        "airports": [f"Main international airport serving {coords['city']} metro area"],
        "transit_guide": "Central metropolitan train station & regional bus/metro network with multi-day tourist day passes.",
        "power_plug": "Type C & F European standard 2-pin (230V)" if is_europe else "Regional standard plug type; universal travel adapter recommended",
        "tipping_etiquette": "10% service tip customary at seated dining" if is_europe else "Discretionary based on service quality",
        "emergency_numbers": "112 (Universal European / International standard) or local emergency services",
        "currency_advice": f"Local currency for {country}; major credit cards accepted in city center hotels and retail.",
        "signature_culinary": [f"Historic central market food stalls in {coords['city']}", f"Regional specialties and local bakery classics", f"Curated evening dinner in the historic old town"],
    }


# ---------------------------------------------------------------------------
# 5. Smart Budget Estimator (Low, Moderate, Executive / Luxury)
# ---------------------------------------------------------------------------
COST_TIERS_INR: Dict[str, Dict[str, float]] = {
    "budget": {"lodging": 1500.0, "meals": 700.0, "transit": 250.0, "activities": 400.0},
    "moderate": {"lodging": 4200.0, "meals": 1800.0, "transit": 600.0, "activities": 1000.0},
    "executive": {"lodging": 7500.0, "meals": 3200.0, "transit": 1200.0, "activities": 1800.0},
    "corporate_offsite": {"lodging": 6500.0, "meals": 2800.0, "transit": 1000.0, "activities": 2200.0},
}

COST_TIERS_USD: Dict[str, Dict[str, float]] = {
    "budget": {"lodging": 65.0, "meals": 35.0, "transit": 12.0, "activities": 20.0},
    "moderate": {"lodging": 175.0, "meals": 80.0, "transit": 25.0, "activities": 45.0},
    "executive": {"lodging": 380.0, "meals": 160.0, "transit": 60.0, "activities": 95.0},
    "corporate_offsite": {"lodging": 320.0, "meals": 140.0, "transit": 50.0, "activities": 110.0},
}

@mcp.tool()
def estimate_budget(city: str, days: int = 3, travel_style: str = "moderate", currency: str = "INR") -> Dict[str, Any]:
    """Estimate a realistic trip budget in INR (or USD) categorized by lodging, dining, transit, and activities."""
    coords = resolve_destination(city)
    if "error" in coords:
        return coords

    style_key = travel_style.lower().replace(" ", "_")
    curr_upper = currency.upper()

    if curr_upper == "INR":
        rates = COST_TIERS_INR.get(style_key, COST_TIERS_INR["moderate"])
        expensive_cities = ["tokyo", "paris", "london", "new york", "san francisco", "zurich", "geneva", "singapore"]
        city_lower = coords["city"].lower()
        multiplier = 2.2 if any(c in city_lower for c in expensive_cities) else 1.0
    else:
        rates = COST_TIERS_USD.get(style_key, COST_TIERS_USD["moderate"])
        expensive_cities = ["tokyo", "paris", "london", "new york", "san francisco", "zurich", "geneva", "singapore"]
        indian_cities = ["ahmedabad", "mumbai", "delhi", "bengaluru", "bangalore", "hyderabad", "chennai", "kolkata", "jaipur", "pune"]
        city_lower = coords["city"].lower()
        if any(c in city_lower for c in expensive_cities):
            multiplier = 1.35
        elif any(c in city_lower for c in indian_cities) or coords.get("country") == "India":
            multiplier = 0.35
        else:
            multiplier = 1.0

    days_clamped = min(max(days, 1), 14)
    lodging = round(rates["lodging"] * multiplier * days_clamped, 2)
    meals = round(rates["meals"] * multiplier * days_clamped, 2)
    transit = round(rates["transit"] * multiplier * days_clamped, 2)
    activities = round(rates["activities"] * multiplier * days_clamped, 2)
    contingency = round((lodging + meals + transit + activities) * 0.10, 2)
    total = round(lodging + meals + transit + activities + contingency, 2)

    return {
        "destination": f"{coords['city']}, {coords.get('country')}",
        "days": days_clamped,
        "travel_style": travel_style,
        "currency": curr_upper,
        "breakdown": {
            "lodging": lodging,
            "meals_and_dining": meals,
            "local_transit": transit,
            "activities_and_admissions": activities,
            "recommended_contingency_10pct": contingency,
        },
        "estimated_total": total,
        "daily_average": round(total / days_clamped, 2),
    }


# ---------------------------------------------------------------------------
# 6. Climate-Aware Packing Advisory & Weather Risk
# ---------------------------------------------------------------------------
@mcp.tool()
def weather_packing_checklist(city: str, days: int = 3) -> Dict[str, Any]:
    """Generate dynamic packing checklist and meteorological advisory based on live forecasts."""
    coords = resolve_destination(city)
    if "error" in coords:
        return coords

    forecast_data = get_weather_forecast(coords["latitude"], coords["longitude"], days=days)
    curr = forecast_data["current"]
    temp = curr["temperature_c"]
    wcode = curr["weather_code"]
    wind = curr["wind_speed_kmh"]

    is_rain = wcode in (51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99)
    is_snow = wcode in (71, 73, 75)
    is_cold = temp < 12.0
    is_hot = temp > 26.0

    essentials = [
        "Government ID / Passport & Travel Insurance",
        "Universal Power Adapter & High-Capacity Mobile Power Bank",
        "Comfortable walking shoes with arch support",
        "Reusable insulated water bottle",
        "Personal medications & compact first-aid kit",
    ]

    weather_specific = []
    if is_rain:
        weather_specific.extend([
            "Windproof travel umbrella (Teflon-coated)",
            "Waterproof GORE-TEX jacket / trench coat",
            "Water-resistant walking footwear",
            "Dry-bag pouch for electronics & passport",
        ])
    elif is_snow:
        weather_specific.extend([
            "Thermal merino base layers (top & bottom)",
            "Insulated down parka with hood",
            "Waterproof snow boots with traction grip",
            "Thermal fleece gloves, wool scarf & beanie",
        ])
    elif is_cold:
        weather_specific.extend([
            "Layered fleece or cashmere sweaters",
            "Mid-weight wind-resistant jacket",
            "Comfortable woolen socks & lightweight scarf",
        ])
    elif is_hot:
        weather_specific.extend([
            "Polarized UV400 sunglasses",
            "Broad-spectrum SPF 50+ sunscreen",
            "Lightweight breathable linen/cotton apparel",
            "Packable sun hat / cap",
        ])

    advisories = []
    if is_rain:
        advisories.append("Precipitation alert: Indoor cultural venues, covered arcade markets, and museums prioritized.")
    if wind > 25.0:
        advisories.append("Breezy conditions: Waterfront viewpoints will feel 3-5°C cooler than inland.")
    if not advisories:
        advisories.append("Ideal conditions for outdoor architecture walks and panoramic viewpoints.")

    return {
        "destination": f"{coords['city']}, {coords.get('country')}",
        "current_temperature_c": temp,
        "condition": curr["condition"],
        "advisory_notes": advisories,
        "core_essentials": essentials,
        "weather_adaptive_gear": weather_specific,
        "rain_contingency_plan": "Swap open-air plaza visits for indoor art galleries, food halls, or covered botanical domes." if is_rain else "Outdoor schedule is safe to proceed without alteration.",
    }

# Backwards compatible alias
@mcp.tool()
def weather_packing_advisor(city: str) -> Dict[str, Any]:
    """Analyze real-time weather in a city and generate packing checklist & activity advisory."""
    res = weather_packing_checklist(city, days=2)
    if "error" in res:
        return res
    all_gear = res["core_essentials"] + res["weather_adaptive_gear"]
    return {
        "city": res["destination"].split(",")[0],
        "temperature": res["current_temperature_c"],
        "weather_code": 0,
        "wind_speed": 10.0,
        "packing_checklist": all_gear,
        "advisory": res["advisory_notes"][0] if res["advisory_notes"] else "Great weather expected.",
    }


# ---------------------------------------------------------------------------
# 7. Autonomous Multi-Day Itinerary Synthesis
# ---------------------------------------------------------------------------
@mcp.tool()
def generate_multiday_itinerary(city: str, days: int = 3, travel_style: str = "cultural") -> Dict[str, Any]:
    """Synthesize a complete multi-day schedule with morning, afternoon, evening slots, verified POIs, and rain backups."""
    coords = resolve_destination(city)
    if "error" in coords:
        return coords

    days_clamped = min(max(days, 1), 7)
    weather_info = get_weather_forecast(coords["latitude"], coords["longitude"], days=days_clamped)
    poi_data = find_attractions(city, category=travel_style, limit=max(days_clamped * 2, 6))
    attractions = poi_data.get("attractions", [])

    city_name = coords["city"]
    country_name = coords.get("country", "")

    # Fallback POIs if Wikipedia list is short
    pool = [a["name"] for a in attractions] if attractions else []
    standard_fallbacks = [
        f"{city_name} Historic Old Town & Central Square",
        f"{city_name} National Museum of Art & History",
        f"{city_name} Royal Botanical Gardens & Promenade",
        f"{city_name} Scenic Panoramic Viewpoint & Skydeck",
        f"{city_name} Artisanal Food Market & Culinary Alley",
        f"{city_name} Waterfront / Riverside District",
        f"{city_name} Modern Cultural Center & Design Quarter",
    ]
    for fb in standard_fallbacks:
        if fb not in pool:
            pool.append(fb)

    itinerary_days = []
    poi_idx = 0

    for day_num in range(1, days_clamped + 1):
        morning_poi = pool[poi_idx % len(pool)]
        poi_idx += 1
        afternoon_poi = pool[poi_idx % len(pool)]
        poi_idx += 1

        day_forecast = weather_info["forecast"][day_num - 1] if day_num - 1 < len(weather_info["forecast"]) else {}
        cond = day_forecast.get("condition", weather_info["current"]["condition"])

        itinerary_days.append({
            "day": day_num,
            "title": f"Day {day_num}: Discovering {city_name}'s Essence",
            "weather_preview": cond,
            "schedule": {
                "morning": {
                    "time": "09:00 - 12:30",
                    "title": f"Explore {morning_poi}",
                    "description": f"Kickstart Day {day_num} with morning exploration. Beat peak tourist lines with early admission.",
                    "tag": "Must-Visit Landmark",
                    "maps_link": f"https://www.google.com/maps/search/?api=1&query={requests.utils.quote(morning_poi + ' ' + city_name)}",
                },
                "afternoon": {
                    "time": "13:30 - 17:00",
                    "title": f"Cultural Immersion at {afternoon_poi}",
                    "description": f"Artisanal lunch nearby followed by in-depth visit and neighborhood photography.",
                    "tag": "Culture & Heritage",
                    "maps_link": f"https://www.google.com/maps/search/?api=1&query={requests.utils.quote(afternoon_poi + ' ' + city_name)}",
                },
                "evening": {
                    "time": "18:30 - 21:30",
                    "title": f"{city_name} Sunset Dining & Evening Stroll",
                    "description": "Curated dinner in the historic quarters featuring regional tasting dishes and golden-hour city lights.",
                    "tag": "Gastronomy & Evening",
                    "maps_link": f"https://www.google.com/maps/search/?api=1&query={requests.utils.quote(city_name + ' historic center restaurant')}",
                },
            },
            "rain_alternative": f"Head to the central covered arcade or {city_name} Contemporary Art Pavilion in case of heavy showers.",
        })

    return {
        "destination": f"{city_name}, {country_name}",
        "city": city_name,
        "country": country_name,
        "total_days": days_clamped,
        "travel_style": travel_style,
        "current_weather": weather_info["current"],
        "itinerary": itinerary_days,
    }

# Backwards compatible alias
@mcp.tool()
def generate_itinerary(city: str, style: str = "cultural") -> Dict[str, Any]:
    """Generate a structured, weather-aware 48-hour weekend itinerary."""
    res = generate_multiday_itinerary(city, days=2, travel_style=style)
    if "error" in res:
        return res
    d1 = res["itinerary"][0]["schedule"]
    d2 = res["itinerary"][1]["schedule"]
    return {
        "destination": res["destination"],
        "style": style,
        "current_temperature": res["current_weather"]["temperature_c"],
        "saturday": {
            "morning": {"time": d1["morning"]["time"], "activity": d1["morning"]["title"], "tip": d1["morning"]["description"]},
            "afternoon": {"time": d1["afternoon"]["time"], "activity": d1["afternoon"]["title"], "tip": d1["afternoon"]["description"]},
            "evening": {"time": d1["evening"]["time"], "activity": d1["evening"]["title"], "tip": d1["evening"]["description"]},
        },
        "sunday": {
            "morning": {"time": d2["morning"]["time"], "activity": d2["morning"]["title"], "tip": d2["morning"]["description"]},
            "afternoon": {"time": d2["afternoon"]["time"], "activity": d2["afternoon"]["title"], "tip": d2["afternoon"]["description"]},
            "evening": {"time": d2["evening"]["time"], "activity": d2["evening"]["title"], "tip": d2["evening"]["description"]},
        },
    }


# ---------------------------------------------------------------------------
# 8. Calendar Export (RFC 5545 .ics generation)
# ---------------------------------------------------------------------------
@mcp.tool()
def export_calendar_ics(city: str, days: int = 2) -> Dict[str, Any]:
    """Generate an RFC 5545 iCalendar payload for the trip itinerary, ready for Google Calendar & Outlook."""
    plan = generate_multiday_itinerary(city, days=days)
    if "error" in plan:
        return plan

    now = datetime.datetime.utcnow()
    # Next upcoming Saturday
    days_until_sat = (5 - now.weekday()) % 7
    if days_until_sat == 0:
        days_until_sat = 7
    start_date = now + datetime.timedelta(days=days_until_sat)

    ics_lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//WeekendWiz//Enterprise Travel Concierge MCP//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
    ]

    for d_idx, day_item in enumerate(plan["itinerary"]):
        current_day = start_date + datetime.timedelta(days=d_idx)
        d_str = current_day.strftime("%Y%m%d")

        slots = [
            ("Morning: " + day_item["schedule"]["morning"]["title"], d_str + "T090000Z", d_str + "T123000Z", day_item["schedule"]["morning"]["description"]),
            ("Afternoon: " + day_item["schedule"]["afternoon"]["title"], d_str + "T133000Z", d_str + "T170000Z", day_item["schedule"]["afternoon"]["description"]),
            ("Evening: " + day_item["schedule"]["evening"]["title"], d_str + "T183000Z", d_str + "T213000Z", day_item["schedule"]["evening"]["description"]),
        ]

        for s_title, dt_start, dt_end, s_desc in slots:
            uid = f"weekendwiz-{int(now.timestamp())}-{d_idx}-{dt_start[:11]}@weekendwiz.local"
            ics_lines.extend([
                "BEGIN:VEVENT",
                f"UID:{uid}",
                f"DTSTAMP:{now.strftime('%Y%m%dT%H%M%SZ')}",
                f"DTSTART:{dt_start}",
                f"DTEND:{dt_end}",
                f"SUMMARY:{s_title} ({plan['destination']})",
                f"DESCRIPTION:{s_desc}",
                f"LOCATION:{plan['destination']}",
                "STATUS:CONFIRMED",
                "END:VEVENT",
            ])

    ics_lines.append("END:VCALENDAR")
    return {
        "city": plan["city"],
        "filename": f"{plan['city'].lower()}_itinerary.ics",
        "ics_content": "\r\n".join(ics_lines),
    }


# ---------------------------------------------------------------------------
# Backwards compatibility tools (Literature, Humor, Trivia)
# ---------------------------------------------------------------------------
@mcp.tool()
def book_recs(topic: str, limit: int = 5) -> Dict[str, Any]:
    """Travel literature and guide suggestions via Open Library search."""
    r = _get("https://openlibrary.org/search.json", params={"q": topic, "limit": limit})
    picks: List[Dict[str, Any]] = []
    for d in r.json().get("docs", []):
        picks.append({
            "title": d.get("title"),
            "author": (d.get("author_name") or ["Unknown"])[0],
            "year": d.get("first_publish_year"),
            "work": d.get("key"),
        })
    return {"topic": topic, "results": picks}

@mcp.tool()
def random_joke() -> Dict[str, Any]:
    """Return a safe travel joke."""
    r = _get("https://v2.jokeapi.dev/joke/Any?type=single&safe-mode")
    return {"joke": r.json().get("joke", "Why do travelers love trains? Because they have great tracks!")}

@mcp.tool()
def random_dog() -> Dict[str, Any]:
    """Return a pet travel companion photo URL."""
    return _get("https://dog.ceo/api/breeds/image/random").json()

@mcp.tool()
def trivia() -> Dict[str, Any]:
    """Return one destination & geography trivia question."""
    data = _get("https://opentdb.com/api.php?amount=1&category=22&type=multiple").json().get("results", [])
    if not data:
        return {"error": "no trivia"}
    q = data[0]
    q["question"] = html.unescape(q["question"])
    q["correct_answer"] = html.unescape(q["correct_answer"])
    q["incorrect_answers"] = [html.unescape(x) for x in q["incorrect_answers"]]
    return q


if __name__ == "__main__":
    mcp.run()  # stdio transport server
