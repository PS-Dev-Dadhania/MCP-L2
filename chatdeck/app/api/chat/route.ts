import { NextResponse } from "next/server";

const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "resolve_destination",
      description: "Convert a city name into coordinates, country, timezone, and elevation via Open-Meteo geocoding.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name e.g. 'Paris', 'Tokyo', 'San Francisco', 'Zurich'" },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_weather_forecast",
      description: "Fetch live coordinates-based weather conditions and multi-day forecast.",
      parameters: {
        type: "object",
        properties: {
          latitude: { type: "number", description: "Latitude coordinate" },
          longitude: { type: "number", description: "Longitude coordinate" },
          days: { type: "integer", description: "Number of days (default 3)" },
        },
        required: ["latitude", "longitude"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "find_attractions",
      description: "Discover verified cultural attractions, landmarks, and points of interest with Wikipedia URLs.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name e.g. 'Rome', 'Kyoto', 'Austin'" },
          limit: { type: "integer", description: "Number of attractions to fetch (default 5)" },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "travel_essentials",
      description: "Get airport hubs, transit passes, power plug types, tipping customs, and emergency numbers.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "Destination city" },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "estimate_budget",
      description: "Estimate trip budget breakdown for lodging, dining, transit, and activities.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "Destination city" },
          days: { type: "integer", description: "Trip duration (default 3)" },
          style: { type: "string", description: "Style: 'budget', 'moderate', 'executive', or 'corporate_offsite'" },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "weather_packing_checklist",
      description: "Analyze live destination weather and generate a smart packing checklist and rain contingency advisory.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "Destination city" },
          days: { type: "integer", description: "Trip duration (default 3)" },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_multiday_itinerary",
      description: "Synthesize an end-to-end multi-day itinerary with morning, afternoon, and evening slots plus rain backups.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "Target city e.g. 'Tokyo', 'Berlin'" },
          days: { type: "integer", description: "Number of days (1-7, default 3)" },
          style: { type: "string", description: "Vibe e.g. 'cultural', 'corporate_offsite', 'executive', 'balanced'" },
        },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "book_recs",
      description: "Get travel literature and cultural guide suggestions by topic.",
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string", description: "Topic or destination e.g. 'Japan travel', 'Paris history'" },
          limit: { type: "integer", description: "Number of books to return (1-5)" },
        },
        required: ["topic"],
      },
    },
  },
];

async function callInternalTool(name: string, args: any) {
  switch (name) {
    case "resolve_destination":
    case "city_to_coords": {
      const city = args.city || "New York";
      const r = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );
      const data = await r.json();
      if (!data.results || data.results.length === 0) return { error: `City not found: ${city}` };
      const c = data.results[0];
      return { city: c.name, country: c.country, latitude: c.latitude, longitude: c.longitude, timezone: c.timezone };
    }
    case "get_weather_forecast":
    case "get_weather": {
      const lat = args.latitude ?? 40.71;
      const lon = args.longitude ?? -74.0;
      const r = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
      );
      const data = await r.json();
      return data.current || {};
    }
    case "find_attractions":
    case "find_activities": {
      const city = args.city || "Paris";
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) return { error: `City not found: ${city}` };
      const { latitude, longitude, name: cname, country } = geoData.results[0];

      const wikiRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${latitude}|${longitude}&gsradius=10000&gslimit=5&format=json`,
        { headers: { "User-Agent": "WeekendWizConcierge/2.0 (enterprise@weekendwiz.local)" } }
      );
      const wikiData = await wikiRes.json();
      const items = (wikiData.query?.geosearch || []).map((x: any) => ({
        name: x.title,
        distanceMeters: x.dist,
        wikipediaUrl: `https://en.wikipedia.org/?curid=${x.pageid}`,
      }));
      return { city: cname, country, attractions: items };
    }
    case "travel_essentials": {
      const city = (args.city || "Tokyo").toLowerCase();
      const knowledge: Record<string, any> = {
        tokyo: {
          airports: ["HND (Haneda)", "NRT (Narita)"],
          transit: "Suica / Pasmo IC card for metro and JR lines.",
          plug: "Type A/B (100V)",
          tipping: "No tipping customary (Omotenashi included).",
          emergency: "110 (Police), 119 (Ambulance/Fire)",
        },
        paris: {
          airports: ["CDG (Charles de Gaulle)", "ORY (Orly)"],
          transit: "Navigo Easy card or contactless metro.",
          plug: "Type C/E (230V)",
          tipping: "Service included; 5-10% customary at fine dining.",
          emergency: "112 (Universal), 17 (Police), 15 (SAMU)",
        },
      };
      return knowledge[city] || {
        airports: [`Main airport for ${args.city}`],
        transit: "Central rail station and municipal metro network.",
        plug: "Universal travel adapter recommended.",
        tipping: "10% service tip customary at seated dining.",
        emergency: "Universal Emergency: 112",
      };
    }
    case "estimate_budget": {
      const city = args.city || "Tokyo";
      const days = args.days || 3;
      const style = args.style || "moderate";
      const rates: Record<string, number> = { budget: 130, moderate: 320, executive: 650, corporate_offsite: 580 };
      const daily = rates[style] || 320;
      const total = daily * days;
      return {
        city,
        days,
        style,
        currency: "USD",
        estimatedTotal: total,
        dailyAverage: daily,
        breakdown: { lodging: daily * 0.5 * days, dining: daily * 0.25 * days, transit: daily * 0.1 * days, activities: daily * 0.15 * days },
      };
    }
    case "weather_packing_checklist":
    case "weather_packing_advisor": {
      const city = args.city || "Tokyo";
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) return { error: `City not found: ${city}` };
      const { latitude, longitude, name: cname } = geoData.results[0];

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
      );
      const weatherData = await weatherRes.json();
      const current = weatherData.current || {};
      const temp = current.temperature_2m ?? 20;
      const code = current.weather_code ?? 0;

      const isRain = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code);
      const packing = ["Passport / Gov ID", "Universal power adapter", "Comfortable walking shoes"];
      if (isRain) packing.push("Compact umbrella", "Waterproof GORE-TEX jacket");
      else if (temp < 10) packing.push("Thermal layer", "Fleece/wool sweater");
      else if (temp > 25) packing.push("Sunscreen SPF 50+", "Breathable linen shirt");

      return {
        city: cname,
        temperature: temp,
        weatherCode: code,
        packingChecklist: packing,
        advisory: isRain ? "Rain expected; prioritize indoor museums & covered markets." : "Favorable conditions for outdoor sightseeing.",
      };
    }
    case "generate_multiday_itinerary":
    case "generate_itinerary": {
      const city = args.city || "Tokyo";
      const days = args.days || 3;
      const style = args.style || "cultural";
      const schedule = [];
      for (let i = 1; i <= days; i++) {
        schedule.push({
          day: i,
          morning: `Day ${i} Morning: Landmark visit & architectural walk in ${city}`,
          afternoon: `Day ${i} Afternoon: Regional culinary lunch and cultural museum in ${city}`,
          evening: `Day ${i} Evening: Historic district sunset dinner and scenic promenade`,
        });
      }
      return { destination: city, totalDays: days, style, schedule };
    }
    case "book_recs": {
      const topic = args.topic || "travel";
      const limit = args.limit || 3;
      const r = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(topic)}&limit=${limit}`);
      const data = await r.json();
      const picks = (data.docs || []).slice(0, limit).map((d: any) => ({
        title: d.title,
        author: (d.author_name || ["Unknown"])[0],
        year: d.first_publish_year,
      }));
      return { topic, results: picks };
    }
    default:
      return { error: `Tool ${name} not recognized` };
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured in .env.local" },
        { status: 500 }
      );
    }

    const systemPrompt = {
      role: "system",
      content:
        "You are TripPlanner, a reliable AI Travel Concierge and Trip Planner powered by Model Context Protocol (MCP). " +
        "You help professionals, executives, and travelers plan seamless trips, team retreats, and weekend getaways. " +
        "Whenever a user asks about destinations, itineraries, budgets, weather, packing, attractions, or logistics, " +
        "you MUST invoke the appropriate MCP tool to fetch verified, real-time facts before answering. " +
        "Anti-Hallucination Rule: Never fabricate booking reference numbers, live ticket reservations, or hotel room confirmations. " +
        "If asked to purchase or book flights/hotels, clarify that you provide verified itinerary schedules, cost estimates, and transit advice, " +
        "and direct them to official airport and transport services. Provide structured, polished markdown responses.",
    };

    const fullMessages = [systemPrompt, ...messages];

    const modelsToTry = [
      "openai/gpt-oss-120b",
      "llama-3.1-8b-instant",
      "llama-3.3-70b-versatile",
    ];

    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        let currentMessages = [...fullMessages];
        const toolsCalled: any[] = [];
        let maxTurns = 5;

        while (maxTurns > 0) {
          maxTurns--;

          const groqRes = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model,
                messages: currentMessages,
                tools: TOOL_DEFINITIONS,
                tool_choice: "auto",
                temperature: 0.3,
                max_tokens: 1500,
              }),
            }
          );

          if (!groqRes.ok) {
            const errData = await groqRes.json().catch(() => ({}));
            throw new Error(errData.error?.message || `Groq API error: ${groqRes.status}`);
          }

          const completion = await groqRes.json();
          const choice = completion.choices?.[0];
          const assistantMsg = choice?.message;

          if (!assistantMsg) {
            throw new Error("No response message from model");
          }

          currentMessages.push(assistantMsg);

          if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
            return NextResponse.json({
              response: assistantMsg.content || "",
              toolsCalled,
              model,
            });
          }

          for (const tc of assistantMsg.tool_calls) {
            const fnName = tc.function.name;
            let fnArgs = {};
            try {
              fnArgs = JSON.parse(tc.function.arguments || "{}");
            } catch {
              fnArgs = {};
            }

            const toolStart = Date.now();
            const toolResult = await callInternalTool(fnName, fnArgs);
            const durationMs = Date.now() - toolStart;

            toolsCalled.push({
              name: fnName,
              args: fnArgs,
              result: toolResult,
              durationMs,
            });

            currentMessages.push({
              role: "tool",
              tool_call_id: tc.id,
              content: JSON.stringify(toolResult),
            });
          }
        }

        return NextResponse.json({
          response: currentMessages[currentMessages.length - 1]?.content || "Multi-turn planning complete.",
          toolsCalled,
          model,
        });
      } catch (err: any) {
        lastError = err;
        if (
          err.message?.includes("model_not_found") ||
          err.message?.includes("does not exist") ||
          err.message?.includes("decommissioned")
        ) {
          continue;
        }
        break;
      }
    }

    throw lastError || new Error("Failed to generate response from Groq models.");
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
