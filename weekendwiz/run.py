#!/usr/bin/env python3
"""
WeekendWiz - Autonomous Enterprise & Leisure Travel Planning Concierge
Demonstration & Test Suite for FastMCP Server
"""

import sys
import json
try:
    import server as s
except ImportError:
    import s


def print_header(title: str):
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)


def run_all_tests():
    print_header("WeekendWiz Enterprise Travel Planning MCP Suite — Diagnostics")

    test_city = "Ahmedabad"

    # 1. Destination Geocoding & Regional Resolution
    print(f"\n[1/8] Resolving Destination: '{test_city}'")
    dest = s.resolve_destination(test_city)
    if "error" in dest:
        print(f"  --> Error: {dest['error']}")
        return
    print(f"  --> {dest['city']}, {dest['country']} (TZ: {dest['timezone']}, Lat: {dest['latitude']}, Lon: {dest['longitude']})")

    # 2. Multi-Day Weather & Microclimate Forecast
    print(f"\n[2/8] Multi-Day Meteorological Forecast for {dest['city']}:")
    weather = s.get_weather_forecast(dest["latitude"], dest["longitude"], days=3)
    curr = weather["current"]
    print(f"  --> Current: {curr['temperature_c']}°C (Feels like {curr['feels_like_c']}°C) | {curr['condition']} | Wind {curr['wind_speed_kmh']} km/h")
    for d in weather.get("forecast", [])[:3]:
        print(f"      • {d['date']}: High {d['temp_max_c']}°C / Low {d['temp_min_c']}°C - {d['condition']} (Precip: {d['precipitation_probability']}%)")

    # 3. Verified Points of Interest & Attractions
    print(f"\n[3/8] Cultural POIs & Landmarks for '{test_city}':")
    attractions = s.find_attractions(test_city, category="cultural", limit=3)
    for idx, a in enumerate(attractions.get("attractions", []), 1):
        print(f"  {idx}. {a.get('name')} ({a.get('distance_meters')}m from center)")
        print(f"     Wikipedia: {a.get('wikipedia_url')}")

    # 4. Travel Essentials: Transit, Airports, Plugs & Etiquette
    print(f"\n[4/8] Travel Essentials & Logistics for '{test_city}':")
    essentials = s.travel_essentials(test_city)
    print(f"  --> Airport Hubs: {', '.join(essentials.get('airports', []))}")
    print(f"  --> Transit: {essentials.get('transit_guide')}")
    print(f"  --> Power Plug: {essentials.get('power_plug')}")
    print(f"  --> Tipping Etiquette: {essentials.get('tipping_etiquette')}")
    print(f"  --> Emergency Contacts: {essentials.get('emergency_numbers')}")

    # 5. Smart Budget Estimator
    print(f"\n[5/8] Tiered Budget Breakdown for '{test_city}' (3 Days, Moderate):")
    budget = s.estimate_budget(test_city, days=3, travel_style="moderate", currency="INR")
    b = budget["breakdown"]
    print(f"  --> Lodging: INR {b['lodging']} | Meals: INR {b['meals_and_dining']} | Transit: INR {b['local_transit']} | Activities: INR {b['activities_and_admissions']}")
    print(f"  --> Total Estimated: INR {budget['estimated_total']} (Avg: INR {budget['daily_average']}/day)")

    # 6. Climate-Aware Packing Advisory & Rain Risk
    print(f"\n[6/8] Climate-Aware Packing Advisory for '{test_city}':")
    packing = s.weather_packing_checklist(test_city, days=3)
    print(f"  --> Condition: {packing.get('condition')} ({packing.get('current_temperature_c')}°C)")
    print(f"  --> Advisory: {', '.join(packing.get('advisory_notes', []))}")
    print(f"  --> Adaptive Gear: {', '.join(packing.get('weather_adaptive_gear', []))}")
    print(f"  --> Rain Contingency: {packing.get('rain_contingency_plan')}")

    # 7. Autonomous Multi-Day Itinerary Synthesis
    print(f"\n[7/8] Autonomous 3-Day Itinerary for '{test_city}':")
    plan = s.generate_multiday_itinerary(test_city, days=3, travel_style="cultural")
    for day in plan.get("itinerary", []):
        sch = day["schedule"]
        print(f"  Day {day['day']}: {sch['morning']['title']} -> {sch['afternoon']['title']} -> {sch['evening']['title']}")

    # 8. Calendar Export (RFC 5545 .ics generation)
    print(f"\n[8/8] RFC 5545 iCalendar (.ics) Export for '{test_city}':")
    cal = s.export_calendar_ics(test_city, days=3)
    ics_lines = cal["ics_content"].splitlines()
    print(f"  --> Generated {cal['filename']} ({len(ics_lines)} lines, {len(cal['ics_content'])} bytes)")
    print(f"  --> Header: {ics_lines[0]} | {ics_lines[1]} | {ics_lines[2]}")

    print_header("All 8 Enterprise Travel MCP Tools Passed Successfully!")


def run_interactive():
    while True:
        print("\n" + "=" * 65)
        print("   WEEKENDWIZ ENTERPRISE TRAVEL CONCIERGE — MCP CLI")
        print("=" * 65)
        print("1. Generate Multi-Day Itinerary (City, Days, Style)")
        print("2. Estimate Trip Budget (Lodging, Dining, Transit, Passes)")
        print("3. Check Travel Essentials (Airports, Transit Cards, Plugs)")
        print("4. Climate-Aware Packing Checklist & Rain Contingency")
        print("5. Discover Verified Cultural Attractions & Landmarks")
        print("6. Multi-Day Weather & Microclimate Forecast")
        print("7. Export Itinerary as RFC 5545 .ics Calendar File")
        print("8. Run Full Test Suite across all 8 Tools")
        print("9. Launch FastMCP stdio Server for Claude Desktop / Cursor")
        print("10. Exit")
        print("-" * 65)

        choice = input("Select an option (1-10): ").strip()

        if choice == "1":
            city = input("Enter destination city [Tokyo]: ").strip() or "Tokyo"
            days_str = input("Number of days (1-7) [3]: ").strip() or "3"
            days = int(days_str) if days_str.isdigit() else 3
            style = input("Travel style (cultural / corporate_offsite / balanced) [cultural]: ").strip() or "cultural"
            res = s.generate_multiday_itinerary(city, days=days, travel_style=style)
            print(f"\n--- {res['destination']} ({res['total_days']} Days) ---")
            for d in res.get("itinerary", []):
                sch = d["schedule"]
                print(f"\nDay {d['day']}:")
                print(f"  Morning:   {sch['morning']['time']} - {sch['morning']['title']}")
                print(f"  Afternoon: {sch['afternoon']['time']} - {sch['afternoon']['title']}")
                print(f"  Evening:   {sch['evening']['time']} - {sch['evening']['title']}")
                print(f"  Backup:    {d['rain_alternative']}")

        elif choice == "2":
            city = input("Enter destination city [Paris]: ").strip() or "Paris"
            days_str = input("Number of days [3]: ").strip() or "3"
            days = int(days_str) if days_str.isdigit() else 3
            style = input("Style (budget / moderate / executive / corporate_offsite) [moderate]: ").strip() or "moderate"
            b = s.estimate_budget(city, days=days, travel_style=style)
            print(f"\n--- Estimated Budget for {b['destination']} ({b['days']} Days - {b['travel_style']}) ---")
            for cat, amt in b["breakdown"].items():
                print(f"  • {cat.replace('_', ' ').capitalize()}: ${amt} USD")
            print(f"  Total Estimated: ${b['estimated_total']} USD (${b['daily_average']}/day)")

        elif choice == "3":
            city = input("Enter destination city [London]: ").strip() or "London"
            ess = s.travel_essentials(city)
            print(f"\n--- Logistics for {ess['destination']} ---")
            print(f"Airports: {', '.join(ess.get('airports', []))}")
            print(f"Transit: {ess.get('transit_guide')}")
            print(f"Power Plug: {ess.get('power_plug')}")
            print(f"Tipping: {ess.get('tipping_etiquette')}")
            print(f"Emergency: {ess.get('emergency_numbers')}")

        elif choice == "4":
            city = input("Enter destination city [San Francisco]: ").strip() or "San Francisco"
            pack = s.weather_packing_checklist(city)
            print(f"\n--- Packing Advisory for {pack['destination']} ({pack['current_temperature_c']}°C, {pack['condition']}) ---")
            print("Core Essentials:")
            for item in pack["core_essentials"]:
                print(f"  [ ] {item}")
            print("Weather-Adaptive Gear:")
            for item in pack["weather_adaptive_gear"]:
                print(f"  [ ] {item}")
            print(f"Contingency: {pack['rain_contingency_plan']}")

        elif choice == "5":
            city = input("Enter destination city [Rome]: ").strip() or "Rome"
            pois = s.find_attractions(city, limit=5)
            print(f"\n--- Cultural Landmarks in {pois['city']} ---")
            for idx, a in enumerate(pois.get("attractions", []), 1):
                print(f"{idx}. {a['name']} ({a['distance_meters']}m away)")

        elif choice == "6":
            city = input("Enter destination city [Zurich]: ").strip() or "Zurich"
            dest = s.resolve_destination(city)
            wf = s.get_weather_forecast(dest["latitude"], dest["longitude"], days=3)
            print(f"\n--- Weather for {dest['city']}, {dest['country']} ---")
            curr = wf["current"]
            print(f"Current: {curr['temperature_c']}°C | {curr['condition']} | Wind {curr['wind_speed_kmh']} km/h")
            for d in wf["forecast"]:
                print(f"{d['date']}: {d['temp_max_c']}°C / {d['temp_min_c']}°C | {d['condition']}")

        elif choice == "7":
            city = input("Enter destination city [Tokyo]: ").strip() or "Tokyo"
            cal = s.export_calendar_ics(city, days=2)
            print(f"\n--- Generated {cal['filename']} ---")
            print(cal["ics_content"][:300] + "\n...")

        elif choice == "8":
            run_all_tests()

        elif choice == "9":
            print("\nStarting FastMCP stdio server (Press Ctrl+C to terminate)...")
            s.mcp.run()

        elif choice == "10":
            print("\nExiting WeekendWiz Concierge. Bon voyage!")
            break


if __name__ == "__main__":
    if "--test" in sys.argv:
        run_all_tests()
    else:
        run_interactive()
