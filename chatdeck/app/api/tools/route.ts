import { NextResponse } from "next/server";

const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

const CITY_LOGISTICS: Record<string, any> = {
  ahmedabad: {
    airports: ["AMD (Sardar Vallabhbhai Patel International Airport - Hansol, 20m drive)"],
    transit: "Ahmedabad Metro (North-South & East-West corridors), BRTS Janmarg bus network, Ola/Uber, and auto-rickshaws.",
    powerPlug: "Type C, D & M (230V, 50Hz - Standard Indian 3-pin round)",
    tipping: "5% to 10% customary at sit-down restaurants; rounding up fares for auto/cab drivers is polite.",
    emergency: "Police: 100/112 | Ambulance: 108 | Fire: 101",
    currency: "Indian Rupee (INR)",
    mustTryCuisine: [
      "Authentic Gujarati Thali with Dal, Kadhi, Rotli & seasonal shaak",
      "Manek Chowk midnight street food (Gwalior Dosa, Chocolate Sandwich, Kulfi)",
      "Khaman Dhokla & Khandvi from Das Khaman",
      "Fafda & Jalebi breakfast with raw papaya sambharo",
      "Dalvada at Gujarat College",
    ],
  },
  tokyo: {
    airports: ["HND (Haneda - Central, 30m train)", "NRT (Narita - Express train 60m)"],
    transit: "Suica / Pasmo IC Card or Tokyo Subway 72H Pass. World-class commuter trains.",
    powerPlug: "Type A & B (100V, 50/60Hz - US-compatible 2-prong)",
    tipping: "No tipping customary; polite hospitality (Omotenashi) included.",
    emergency: "Police: 110 | Medical/Fire: 119",
    currency: "Japanese Yen (JPY)",
    mustTryCuisine: ["Tsukiji fresh sashimi", "Shinjuku artisanal ramen", "Charcoal yakitori in Omoide Yokocho", "Matcha pastries in Asakusa"],
  },
  paris: {
    airports: ["CDG (Charles de Gaulle - RER B 45m)", "ORY (Orly - Metro Line 14 25m)"],
    transit: "Navigo Easy card or contactless metro app. Extensive RER & Metro system.",
    powerPlug: "Type C & E (230V, 50Hz - Standard European 2-pin)",
    tipping: "Service compris (included by law). Rounding up 5-10% at fine dining is appreciated.",
    emergency: "Emergency: 112 | Police: 17 | SAMU Ambulance: 15",
    currency: "Euro (EUR)",
    mustTryCuisine: ["Artisanal croissants in Le Marais", "Duck Confit & potato sarladaise", "Affineur cheese board & regional wines", "Saint-Germain macarons"],
  },
  london: {
    airports: ["LHR (Heathrow - Elizabeth Line 30m)", "LGW (Gatwick - Express 30m)", "LCY (London City)"],
    transit: "Contactless tap with card / phone on London Underground (Tube) and buses.",
    powerPlug: "Type G (230V, 50Hz - British 3-pin rectangular)",
    tipping: "12.5% discretionary service charge usually included on dining bills.",
    emergency: "Emergency Services: 999 or 112 | Non-Emergency: 101",
    currency: "British Pound (GBP)",
    mustTryCuisine: ["Sunday Roast with Yorkshire pudding", "Borough Market gourmet street food", "Traditional Afternoon Tea in Mayfair", "Salt beef bagel on Brick Lane"],
  },
  "new york": {
    airports: ["JFK (John F. Kennedy - AirTrain 50m)", "EWR (Newark - NJ Transit 40m)", "LGA (LaGuardia - M60/Taxi)"],
    transit: "OMNY contactless tap at all subway turnstiles and MTA buses. 24/7 service.",
    powerPlug: "Type A & B (120V, 60Hz - Standard US plugs)",
    tipping: "18% - 22% standard in seated restaurants; $1-2 per drink at bars.",
    emergency: "Emergency: 911 | Non-Emergency: 311",
    currency: "US Dollar (USD)",
    mustTryCuisine: ["Classic NYC bagel with lox & scallion cream cheese", "Foldable coal-fired thin-crust pizza", "Pastrami on rye from Katz's Delicatessen", "Chelsea Market artisanal bites"],
  },
  "san francisco": {
    airports: ["SFO (San Francisco International - BART 30m)", "OAK (Oakland Airport)"],
    transit: "Clipper Card / Mobile Clipper on Muni Metro, historic cable cars, and BART.",
    powerPlug: "Type A & B (120V, 60Hz)",
    tipping: "18% - 22% at seated restaurants.",
    emergency: "Emergency: 911",
    currency: "US Dollar (USD)",
    mustTryCuisine: ["Mission-style burrito in the Mission District", "Sourdough clam chowder bowl at the Ferry Building", "Dungeness crab at the marina", "Specialty pour-over coffee in Hayes Valley"],
  },
};

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const { action } = body;

    // 1. Destination Geocoding & Boundary Resolution
    if (action === "destination" || action === "resolve_destination") {
      const city = body.city?.trim() || "Tokyo";
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) {
        return NextResponse.json({ error: `Destination "${city}" not found` }, { status: 404 });
      }

      const loc = geoData.results[0];
      return NextResponse.json({
        city: loc.name,
        country: loc.country || "Unknown",
        countryCode: loc.country_code || "",
        admin1: loc.admin1 || "",
        latitude: loc.latitude,
        longitude: loc.longitude,
        timezone: loc.timezone || "UTC",
        elevationMeters: loc.elevation || 0,
        _meta: {
          action: "resolve_destination",
          toolsInvoked: ["resolve_destination"],
          durationMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          status: "success",
        },
      });
    }

    // 2. Weather & Forecast
    if (action === "weather" || action === "get_weather_forecast") {
      const city = body.city?.trim() || "New York";
      const days = Number(body.days) || 3;
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) {
        return NextResponse.json({ error: `City "${city}" not found` }, { status: 404 });
      }

      const location = geoData.results[0];
      const { latitude, longitude, name, country } = location;

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&forecast_days=${Math.min(days, 7)}&timezone=auto`
      );
      const weatherData = await weatherRes.json();
      const current = weatherData.current || {};
      const daily = weatherData.daily || {};
      const code = current.weather_code ?? 0;

      const forecastList = (daily.time || []).map((t: string, i: number) => ({
        date: t,
        tempMax: daily.temperature_2m_max?.[i] ?? 20,
        tempMin: daily.temperature_2m_min?.[i] ?? 12,
        condition: WEATHER_CODES[daily.weather_code?.[i]] || "Clear sky",
        precipProb: daily.precipitation_probability_max?.[i] ?? 0,
      }));

      return NextResponse.json({
        city: name,
        country: country || "",
        latitude,
        longitude,
        temperature: current.temperature_2m,
        feelsLike: current.apparent_temperature ?? current.temperature_2m,
        humidity: current.relative_humidity_2m ?? 50,
        windSpeed: current.wind_speed_10m,
        weatherCode: code,
        condition: WEATHER_CODES[code] || "Variable",
        forecast: forecastList,
        _meta: {
          action: "get_weather_forecast",
          toolsInvoked: ["city_to_coords", "get_weather_forecast"],
          durationMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          status: "success",
        },
      });
    }

    // 3. Discover Attractions & POIs
    if (action === "activities" || action === "find_attractions") {
      const city = body.city?.trim() || "Ahmedabad";
      const limit = Number(body.limit) || 6;

      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) {
        return NextResponse.json({ error: `City "${city}" not found` }, { status: 404 });
      }

      const { latitude, longitude, name, country } = geoData.results[0];
      const cityName = name.toLowerCase();

      const DISALLOWED = [
        "attack", "bombing", "crash", "shooting", "massacre", "murder", "disaster",
        "riot", "championship", "tournament", "election", "scandal", "incident", "derailment",
        "sarin", "battle of", "siege of", "assassination", "school", "high school", "metro station",
        "railway station", "bus station", "hospital", "police station", "court"
      ];

      const CURATED_POIS: Record<string, Array<{ name: string; url: string }>> = {
        ahmedabad: [
          { name: "Sabarmati Ashram (Gandhi Memorial)", url: "https://en.wikipedia.org/wiki/Sabarmati_Ashram" },
          { name: "Adalaj Stepwell (Rudabai Stepwell)", url: "https://en.wikipedia.org/wiki/Adalaj_Stepwell" },
          { name: "Atal Pedestrian Bridge (Sabarmati Riverfront)", url: "https://en.wikipedia.org/wiki/Atal_Pedestrian_Bridge" },
          { name: "Sidi Saiyyed Mosque (Tree of Life)", url: "https://en.wikipedia.org/wiki/Sidi_Saiyyed_Mosque" },
          { name: "Hutheesing Jain Temple", url: "https://en.wikipedia.org/wiki/Hutheesing_Jain_Temple" },
          { name: "Manek Chowk Heritage Square", url: "https://en.wikipedia.org/wiki/Manek_Chowk_(Ahmedabad)" },
          { name: "Kankaria Lake Promenade", url: "https://en.wikipedia.org/wiki/Kankaria_Lake" },
          { name: "Sarkhej Roza Architectural Complex", url: "https://en.wikipedia.org/wiki/Sarkhej_Roza" },
        ],
        tokyo: [
          { name: "Meiji Jingu Shrine & Forest", url: "https://en.wikipedia.org/wiki/Meiji_Shrine" },
          { name: "Senso-ji Buddhist Temple in Asakusa", url: "https://en.wikipedia.org/wiki/Sens%C5%8D-ji" },
          { name: "Shibuya Sky Panoramic Deck", url: "https://en.wikipedia.org/wiki/Shibuya_Scramble_Square" },
          { name: "Tsukiji Outer Market Culinary Walk", url: "https://en.wikipedia.org/wiki/Tsukiji_fish_market" },
          { name: "Imperial Palace East Gardens", url: "https://en.wikipedia.org/wiki/Tokyo_Imperial_Palace" },
          { name: "teamLab Planets Digital Art", url: "https://en.wikipedia.org/wiki/TeamLab" },
        ],
      };

      const wikiRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${latitude}|${longitude}&gsradius=12000&gslimit=${Math.max(limit * 3, 12)}&format=json`,
        { headers: { "User-Agent": "TripPlanner/2.0 (enterprise@tripplanner.local)" } }
      );
      const wikiData = await wikiRes.json();
      const items = wikiData.query?.geosearch || [];

      const filteredItems = items.filter((it: any) => {
        const titleLower = (it.title || "").toLowerCase();
        return !DISALLOWED.some((bad) => titleLower.includes(bad));
      });

      const activities = filteredItems.slice(0, limit).map((item: any) => ({
        name: item.title,
        distanceMeters: item.dist,
        latitude: item.lat,
        longitude: item.lon,
        wikipediaUrl: `https://en.wikipedia.org/?curid=${item.pageid}`,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.title + " " + name)}`,
      }));

      // Merge curated landmarks if needed
      for (const [k, curatedList] of Object.entries(CURATED_POIS)) {
        if (cityName.includes(k) || k.includes(cityName)) {
          const existing = new Set(activities.map((a: any) => a.name.toLowerCase()));
          for (const cur of curatedList) {
            if (!existing.has(cur.name.toLowerCase()) && activities.length < limit) {
              activities.push({
                name: cur.name,
                distanceMeters: 1200,
                latitude,
                longitude,
                wikipediaUrl: cur.url,
                mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cur.name + " " + name)}`,
              });
            }
          }
        }
      }

      return NextResponse.json({
        city: name,
        country,
        activities: activities.slice(0, limit),
        _meta: {
          action: "find_attractions",
          toolsInvoked: ["city_to_coords", "find_attractions"],
          durationMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          status: "success",
        },
      });
    }

    // 4. Travel Essentials: Transit, Airports, Plugs & Etiquette
    if (action === "essentials" || action === "travel_essentials") {
      const city = body.city?.trim() || "Tokyo";
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );
      const geoData = await geoRes.json();
      const loc = geoData.results?.[0] || { name: city, country: "Global" };
      const cityKey = loc.name.toLowerCase();

      let known = null;
      for (const k of Object.keys(CITY_LOGISTICS)) {
        if (cityKey.includes(k) || k.includes(cityKey)) {
          known = CITY_LOGISTICS[k];
          break;
        }
      }

      const logistics = known || {
        airports: [`Main International Airport serving ${loc.name}`],
        transit: "Central rail hub and municipal transit network with tourist transit passes.",
        powerPlug: "Standard regional 2-pin / 3-pin plug; universal adapter recommended.",
        tipping: "10% service tip customary at seated dining.",
        emergency: "Universal Emergency: 112 (or local emergency line)",
        currency: `Local currency of ${loc.country}`,
        mustTryCuisine: [`Historic market stalls in ${loc.name}`, "Regional artisanal specialties", "Curated dinner in the old town"],
      };

      return NextResponse.json({
        destination: `${loc.name}, ${loc.country}`,
        ...logistics,
        _meta: {
          action: "travel_essentials",
          toolsInvoked: ["city_to_coords", "travel_essentials"],
          durationMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          status: "success",
        },
      });
    }

    // 5. Tiered Trip Budget Estimator
    if (action === "budget" || action === "estimate_budget") {
      const city = body.city?.trim() || "Ahmedabad";
      const days = Math.min(Math.max(Number(body.days) || 3, 1), 14);
      const style = (body.style || "moderate").toLowerCase().replace(" ", "_");
      const currency = (body.currency || "INR").toUpperCase();

      const ratesINR: Record<string, { lodging: number; meals: number; transit: number; activities: number }> = {
        budget: { lodging: 1500, meals: 700, transit: 250, activities: 400 },
        moderate: { lodging: 4200, meals: 1800, transit: 600, activities: 1000 },
        executive: { lodging: 7500, meals: 3200, transit: 1200, activities: 1800 },
        corporate_offsite: { lodging: 6500, meals: 2800, transit: 1000, activities: 2200 },
      };

      const ratesUSD: Record<string, { lodging: number; meals: number; transit: number; activities: number }> = {
        budget: { lodging: 65, meals: 35, transit: 12, activities: 20 },
        moderate: { lodging: 175, meals: 80, transit: 25, activities: 45 },
        executive: { lodging: 380, meals: 160, transit: 60, activities: 95 },
        corporate_offsite: { lodging: 320, meals: 140, transit: 50, activities: 110 },
      };

      const isINR = currency === "INR";
      const rates = isINR ? ratesINR : ratesUSD;
      const selectedRate = rates[style] || rates.moderate;

      const expensiveCities = ["tokyo", "paris", "london", "new york", "san francisco", "zurich", "geneva", "singapore"];
      const indianCities = ["ahmedabad", "mumbai", "delhi", "bengaluru", "bangalore", "hyderabad", "chennai", "kolkata", "jaipur", "pune"];
      const cityLower = city.toLowerCase();

      let multiplier = 1.0;
      if (isINR) {
        multiplier = expensiveCities.some((c) => cityLower.includes(c)) ? 2.2 : 1.0;
      } else {
        if (expensiveCities.some((c) => cityLower.includes(c))) {
          multiplier = 1.35;
        } else if (indianCities.some((c) => cityLower.includes(c))) {
          multiplier = 0.35;
        }
      }

      const lodging = Math.round(selectedRate.lodging * multiplier * days);
      const meals = Math.round(selectedRate.meals * multiplier * days);
      const transit = Math.round(selectedRate.transit * multiplier * days);
      const activities = Math.round(selectedRate.activities * multiplier * days);
      const subtotal = lodging + meals + transit + activities;
      const contingency = Math.round(subtotal * 0.1);
      const total = subtotal + contingency;

      return NextResponse.json({
        city,
        days,
        style,
        currency,
        breakdown: {
          lodging,
          mealsAndDining: meals,
          localTransit: transit,
          activitiesAndAdmissions: activities,
          contingency10Pct: contingency,
        },
        estimatedTotal: total,
        dailyAverage: Math.round(total / days),
        _meta: {
          action: "estimate_budget",
          toolsInvoked: ["city_to_coords", "estimate_budget"],
          durationMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          status: "success",
        },
      });
    }

    // 6. Smart Weather Packing & Climate Risk
    if (action === "packing" || action === "weather_packing_checklist") {
      const city = body.city?.trim() || "Tokyo";
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) {
        return NextResponse.json({ error: `City "${city}" not found` }, { status: 404 });
      }

      const { latitude, longitude, name, country } = geoData.results[0];
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
      );
      const weatherData = await weatherRes.json();
      const current = weatherData.current || {};
      const temp = current.temperature_2m ?? 20;
      const code = current.weather_code ?? 0;
      const wind = current.wind_speed_10m ?? 5;

      const isRain = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code);
      const isSnow = [71, 73, 75].includes(code);
      const isCold = temp < 12;
      const isHot = temp > 25;

      const essentials = [
        "Government ID / Passport & Corporate Insurance Card",
        "Universal Power Adapter & Mobile Power Bank (10,000mAh+)",
        "Comfortable supportive walking shoes",
        "Reusable insulated water bottle",
        "Personal medications & compact first-aid kit",
      ];

      const weatherSpecific: string[] = [];
      if (isRain) {
        weatherSpecific.push(
          "Windproof Teflon-coated travel umbrella",
          "Waterproof GORE-TEX jacket / trench coat",
          "Water-resistant walking footwear",
          "Dry-bag pouch for phone & passport"
        );
      } else if (isSnow) {
        weatherSpecific.push(
          "Thermal merino wool base layers",
          "Heavy insulated down parka with hood",
          "Waterproof snow boots with grip traction",
          "Thermal gloves, fleece scarf & beanie"
        );
      } else if (isCold) {
        weatherSpecific.push("Medium warm knit sweater / fleece jacket", "Cashmere or merino scarf", "Mid-weight windbreaker");
      } else if (isHot) {
        weatherSpecific.push("Polarized sunglasses & broad-spectrum SPF 50+ sunscreen", "Breathable linen / lightweight cotton apparel", "Packable sun hat");
      }

      const advisory = isRain
        ? "Precipitation alert: Indoor cultural venues, covered arcade markets, and museums prioritized."
        : wind > 25
        ? "Breezy conditions: Waterfront viewpoints will feel 3-5°C cooler than inland."
        : "Favorable conditions for outdoor sightseeing and open-air exploration.";

      const rainContingency = isRain
        ? "Swap open-air plaza visits for covered arcade markets, art galleries, or historic food halls."
        : "Outdoor itinerary is safe to proceed as scheduled.";

      return NextResponse.json({
        city: name,
        country,
        temperature: temp,
        weatherCode: code,
        condition: WEATHER_CODES[code] || "Variable",
        windSpeed: wind,
        coreEssentials: essentials,
        weatherAdaptiveGear: weatherSpecific,
        packingChecklist: [...essentials, ...weatherSpecific],
        advisory,
        rainContingency,
        _meta: {
          action: "weather_packing_checklist",
          toolsInvoked: ["city_to_coords", "get_weather", "weather_packing_checklist"],
          durationMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          status: "success",
        },
      });
    }

    // 7. Multi-Day Autonomous Itinerary Planner
    if (action === "itinerary" || action === "generate_multiday_itinerary") {
      const city = body.city?.trim() || "Tokyo";
      const days = Math.min(Math.max(Number(body.days) || 3, 1), 7);
      const style = body.style || "cultural";

      // Geocoding
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) {
        return NextResponse.json({ error: `City "${city}" not found` }, { status: 404 });
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // Live Weather
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
      );
      const weatherData = await weatherRes.json();
      const current = weatherData.current || {};
      const temp = current.temperature_2m ?? 18;
      const code = current.weather_code ?? 0;

      // Wikipedia Activities
      const wikiRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${latitude}|${longitude}&gsradius=10000&gslimit=${Math.max(days * 2, 6)}&format=json`,
        { headers: { "User-Agent": "WeekendWizConcierge/2.0 (enterprise@weekendwiz.local)" } }
      );
      const wikiData = await wikiRes.json();
      const poiItems = (wikiData.query?.geosearch || []).map((x: any) => x.title);

      const standardFallbacks = [
        `${name} Historic Old Town & Central Square`,
        `${name} National Museum of Art & Heritage`,
        `${name} Central Botanical Promenade`,
        `${name} Panoramic Skydeck & Observation Point`,
        `${name} Artisanal Culinary Market`,
        `${name} Waterfront & Riverside Promenade`,
        `${name} Design Quarter & Innovation Hub`,
      ];

      const pool = poiItems.length > 0 ? poiItems : standardFallbacks;
      while (pool.length < days * 2) {
        pool.push(...standardFallbacks);
      }

      let poiIdx = 0;
      const daysList = [];

      for (let d = 1; d <= days; d++) {
        const morningPoi = pool[poiIdx % pool.length];
        poiIdx++;
        const afternoonPoi = pool[poiIdx % pool.length];
        poiIdx++;

        daysList.push({
          day: d,
          title: `Day ${d}: Discovering ${name}'s Essence`,
          schedule: {
            morning: {
              time: "09:00 - 12:30",
              title: `Explore ${morningPoi}`,
              description: `Kick off Day ${d} with morning exploration. Beat peak lines with early admission.`,
              tag: "Must-Visit Landmark",
              mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(morningPoi + " " + name)}`,
            },
            afternoon: {
              time: "13:30 - 17:00",
              title: `Cultural Immersion at ${afternoonPoi}`,
              description: "Enjoy regional culinary lunch nearby followed by in-depth neighborhood photography.",
              tag: "Culture & Cuisine",
              mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(afternoonPoi + " " + name)}`,
            },
            evening: {
              time: "18:30 - 21:30",
              title: `${name} Historic District & Sunset Dinner`,
              description: "Curated dinner in the historic quarters featuring regional tasting menus and golden-hour city views.",
              tag: "Dining & Evening",
              mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " historic center restaurant")}`,
            },
          },
          rainAlternative: `Head to the central covered arcade or ${name} Art Pavilion in case of heavy showers.`,
        });
      }

      return NextResponse.json({
        destination: `${name}, ${country || ""}`,
        city: name,
        country,
        days,
        style,
        weather: {
          temperature: temp,
          condition: WEATHER_CODES[code] || "Clear",
          code,
        },
        daysList,
        // Backwards compatible fields
        saturday: daysList[0]?.schedule,
        sunday: daysList[1]?.schedule || daysList[0]?.schedule,
        _meta: {
          action: "generate_multiday_itinerary",
          toolsInvoked: ["city_to_coords", "get_weather", "find_attractions", "generate_multiday_itinerary"],
          durationMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          status: "success",
        },
      });
    }

    // 8. Calendar Export (.ics iCalendar file content)
    if (action === "calendar" || action === "export_calendar_ics") {
      const city = body.city || "Weekend Getaway";
      const days = Number(body.days) || 3;
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");

      const daysUntilSat = (6 - now.getDay() + 7) % 7 || 7;
      const startDate = new Date(now.getTime() + daysUntilSat * 86400000);

      const icsEvents: string[] = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//WeekendWiz//Enterprise Travel Concierge MCP//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
      ];

      for (let i = 0; i < days; i++) {
        const cur = new Date(startDate.getTime() + i * 86400000);
        const y = cur.getUTCFullYear();
        const m = pad(cur.getUTCMonth() + 1);
        const d = pad(cur.getUTCDate());
        const dStr = `${y}${m}${d}`;

        const slots = [
          { title: `Morning Landmark Discovery (${city})`, start: `${dStr}T090000Z`, end: `${dStr}T123000Z` },
          { title: `Afternoon Cultural Tour (${city})`, start: `${dStr}T133000Z`, end: `${dStr}T170000Z` },
          { title: `Evening Dining & Sunset Stroll (${city})`, start: `${dStr}T183000Z`, end: `${dStr}T213000Z` },
        ];

        for (const slot of slots) {
          icsEvents.push(
            "BEGIN:VEVENT",
            `UID:weekendwiz-${Date.now()}-${i}-${slot.start.slice(9, 13)}@weekendwiz.local`,
            `DTSTAMP:${y}${m}${d}T120000Z`,
            `DTSTART:${slot.start}`,
            `DTEND:${slot.end}`,
            `SUMMARY:${slot.title}`,
            `DESCRIPTION:Planned via WeekendWiz Enterprise Travel Concierge MCP.`,
            `LOCATION:${city}`,
            `STATUS:CONFIRMED`,
            "END:VEVENT"
          );
        }
      }

      icsEvents.push("END:VCALENDAR");

      return NextResponse.json({
        ics: icsEvents.join("\r\n"),
        filename: `weekendwiz-${city.toLowerCase().replace(/[^a-z0-9]/g, "-")}-itinerary.ics`,
        _meta: {
          action: "export_calendar_ics",
          toolsInvoked: ["export_calendar_ics"],
          durationMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          status: "success",
        },
      });
    }

    // Literature Recs (for in-flight reading & cultural guides)
    if (action === "books") {
      const topic = body.topic?.trim() || "travel";
      const limit = Number(body.limit) || 4;
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(topic)}&limit=${limit}`
      );
      const data = await res.json();
      const results = (data.docs || []).map((d: any) => ({
        title: d.title,
        author: (d.author_name || ["Unknown Author"])[0],
        year: d.first_publish_year || "Unknown",
        coverId: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : null,
      }));

      return NextResponse.json({
        topic,
        results,
        _meta: {
          action: "book_recs",
          toolsInvoked: ["book_recs"],
          durationMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          status: "success",
        },
      });
    }

    return NextResponse.json({ error: `Unknown action: "${action}"` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message || "Failed to execute tool",
        _meta: {
          durationMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          status: "error",
        },
      },
      { status: 500 }
    );
  }
}
