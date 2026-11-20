"""
WeekendWiz Travel Concierge Agent - Tool Calling Engine for Groq and Google Gemini
Autonomous Enterprise & Leisure Travel Planning via MCP Tools
"""

import os
import sys
import json
from typing import Dict, Any, List, Tuple
import dotenv

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

try:
    import server as s
except ImportError:
    import s

dotenv.load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Registry of callable tool functions
TOOL_REGISTRY = {
    # Enterprise Travel Tools
    "resolve_destination": s.resolve_destination,
    "get_weather_forecast": s.get_weather_forecast,
    "find_attractions": s.find_attractions,
    "travel_essentials": s.travel_essentials,
    "estimate_budget": s.estimate_budget,
    "weather_packing_checklist": s.weather_packing_checklist,
    "generate_multiday_itinerary": s.generate_multiday_itinerary,
    "export_calendar_ics": s.export_calendar_ics,
    # Backwards compatibility aliases
    "city_to_coords": s.city_to_coords,
    "get_weather": s.get_weather,
    "find_activities": s.find_activities,
    "weather_packing_advisor": s.weather_packing_advisor,
    "generate_itinerary": s.generate_itinerary,
    "book_recs": s.book_recs,
    "random_joke": s.random_joke,
    "random_dog": s.random_dog,
    "trivia": s.trivia,
}

# OpenAI/Groq compatible tool definitions
TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "resolve_destination",
            "description": "Resolve a destination city name to coordinates, country, timezone, and elevation.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "Destination city name (e.g. 'Tokyo', 'Paris', 'San Francisco', 'Zurich')"
                    }
                },
                "required": ["city"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_weather_forecast",
            "description": "Get real-time meteorological conditions and multi-day forecast for coordinates.",
            "parameters": {
                "type": "object",
                "properties": {
                    "latitude": {"type": "number", "description": "Latitude coordinate"},
                    "longitude": {"type": "number", "description": "Longitude coordinate"},
                    "days": {"type": "integer", "description": "Number of forecast days (1-7, default 3)"}
                },
                "required": ["latitude", "longitude"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "find_attractions",
            "description": "Discover verified cultural attractions, landmarks, and points of interest with Wikipedia links.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "Destination city name"},
                    "category": {"type": "string", "description": "Category (e.g. 'cultural', 'outdoor', 'nightlife')"},
                    "limit": {"type": "integer", "description": "Max attractions to return (default 6)"}
                },
                "required": ["city"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "travel_essentials",
            "description": "Get airport hubs, transit passes, power plug types, tipping customs, and emergency numbers.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "Destination city name"}
                },
                "required": ["city"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "estimate_budget",
            "description": "Estimate trip budget categorized by lodging, dining, transit, activities, and contingency.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "Destination city name"},
                    "days": {"type": "integer", "description": "Number of days (default 3)"},
                    "travel_style": {"type": "string", "description": "Style: 'budget', 'moderate', 'executive', or 'corporate_offsite'"},
                    "currency": {"type": "string", "description": "Currency code (default 'USD')"}
                },
                "required": ["city"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "weather_packing_checklist",
            "description": "Generate climate-aware packing checklist, weather risk notes, and rain contingency advice.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "Destination city name"},
                    "days": {"type": "integer", "description": "Trip duration in days (default 3)"}
                },
                "required": ["city"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "generate_multiday_itinerary",
            "description": "Synthesize a full multi-day schedule with morning, afternoon, and evening slots plus rain backups.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "Destination city name"},
                    "days": {"type": "integer", "description": "Number of days (1-7, default 3)"},
                    "travel_style": {"type": "string", "description": "Travel style ('cultural', 'corporate_offsite', 'balanced')"}
                },
                "required": ["city"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "export_calendar_ics",
            "description": "Generate an RFC 5545 iCalendar payload for the trip itinerary ready for Google Calendar & Outlook.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "Destination city name"},
                    "days": {"type": "integer", "description": "Number of days (default 2)"}
                },
                "required": ["city"],
            },
        },
    },
]


def execute_tool(name: str, args: Dict[str, Any]) -> Any:
    """Executes a registered tool by name with arguments."""
    func = TOOL_REGISTRY.get(name)
    if not func:
        return {"error": f"Tool '{name}' not found"}
    try:
        return func(**args)
    except Exception as e:
        return {"error": f"Tool execution failed: {str(e)}"}


def ask_gemini(prompt: str, history: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Executes a query with Google Gemini using automatic tool calling."""
    from google import genai

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set.")

    client = genai.Client(api_key=api_key)
    tools = [
        s.resolve_destination,
        s.get_weather_forecast,
        s.find_attractions,
        s.travel_essentials,
        s.estimate_budget,
        s.weather_packing_checklist,
        s.generate_multiday_itinerary,
        s.export_calendar_ics,
    ]

    system_instruction = (
        "You are WeekendWiz, an executive AI Travel Concierge and Corporate Offsite Planner powered by MCP. "
        "Use your specialized MCP tools for destination resolution, multi-day weather forecasting, verified attractions, "
        "budget estimation, transit/airports logistics, climate-aware packing, and multi-day itinerary synthesis. "
        "Provide thorough, polished, executive-ready markdown answers."
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "tools": tools,
            "system_instruction": system_instruction,
        }
    )

    tools_called = []
    if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
        for part in response.candidates[0].content.parts:
            if part.function_call:
                tools_called.append({
                    "name": part.function_call.name,
                    "args": dict(part.function_call.args or {}),
                })

    return {
        "provider": "Google Gemini",
        "model": "gemini-2.5-flash",
        "response": response.text or "Completed without text response.",
        "tools_called": tools_called,
    }


def ask_groq(prompt: str, history: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Executes a query with Groq using function/tool calling loop."""
    from groq import Groq

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set.")

    client = Groq(api_key=api_key)
    models_to_try = ["openai/gpt-oss-120b", "llama-3.1-8b-instant", "llama-3.3-70b-versatile"]

    system_message = {
        "role": "system",
        "content": (
            "You are TripPlanner, a reliable AI Travel Concierge and Trip Planner powered by Model Context Protocol (MCP). "
            "Use your MCP tools to fetch live verified data: resolve_destination, get_weather_forecast, find_attractions, "
            "travel_essentials, estimate_budget, weather_packing_checklist, generate_multiday_itinerary, export_calendar_ics. "
            "Anti-Hallucination Guardrail: Never invent or simulate live booking numbers, tickets, or flight purchases. "
            "Always invoke the appropriate tools before providing comprehensive, structured travel recommendations."
        )
    }

    messages = [system_message]
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": prompt})

    tools_called = []
    max_turns = 6

    for model_name in models_to_try:
        try:
            for _ in range(max_turns):
                resp = client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    tools=TOOL_DEFINITIONS,
                    tool_choice="auto",
                )

                msg = resp.choices[0].message
                messages.append(msg)

                if not msg.tool_calls:
                    return {
                        "provider": "Groq",
                        "model": model_name,
                        "response": msg.content or "",
                        "tools_called": tools_called,
                    }

                for tc in msg.tool_calls:
                    fn_name = tc.function.name
                    try:
                        fn_args = json.loads(tc.function.arguments) if tc.function.arguments else {}
                    except Exception:
                        fn_args = {}

                    tool_result = execute_tool(fn_name, fn_args)
                    tools_called.append({
                        "name": fn_name,
                        "args": fn_args,
                        "result": tool_result,
                    })

                    messages.append({
                        "role": "tool",
                        "tool_call_id": tc.id,
                        "content": json.dumps(tool_result),
                    })

            return {
                "provider": "Groq",
                "model": model_name,
                "response": messages[-1].get("content", "Completed multi-turn tool calling."),
                "tools_called": tools_called,
            }
        except Exception as e:
            if "model_not_found" in str(e) or "does not exist" in str(e):
                continue
            raise e

    raise RuntimeError("All Groq models failed to respond.")


def ask_agent(prompt: str, provider: str = "groq") -> Dict[str, Any]:
    """Unified entry point for chatting with the travel agent."""
    provider = provider.lower().strip()
    if provider in ("gemini", "google"):
        return ask_gemini(prompt)
    elif provider in ("groq",):
        return ask_groq(prompt)
    else:
        raise ValueError(f"Unknown provider: '{provider}'. Choose 'gemini' or 'groq'.")


if __name__ == "__main__":
    test_prov = sys.argv[1] if len(sys.argv) > 1 else "groq"
    test_query = "Plan a 3-day executive business retreat to Tokyo with budget and packing tips."
    print(f"\n--- Testing WeekendWiz Travel Concierge Agent with [{test_prov}] ---")
    print(f"Query: {test_query}\n")
    res = ask_agent(test_query, provider=test_prov)
    print(f"Provider: {res['provider']} ({res['model']})")
    print(f"Tools Called: {len(res['tools_called'])}")
    for tc in res["tools_called"]:
        print(f"  • Invoked: {tc['name']} with args {tc['args']}")
    print(f"\nResponse:\n{res['response']}")
