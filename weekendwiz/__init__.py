"""
WeekendWiz FastMCP Enterprise Travel Concierge Package.
"""

from .server import (
    mcp,
    resolve_destination,
    get_weather_forecast,
    find_attractions,
    travel_essentials,
    estimate_budget,
    weather_packing_checklist,
    generate_multiday_itinerary,
    export_calendar_ics,
)

__version__ = "2.0.0"
__all__ = [
    "mcp",
    "resolve_destination",
    "get_weather_forecast",
    "find_attractions",
    "travel_essentials",
    "estimate_budget",
    "weather_packing_checklist",
    "generate_multiday_itinerary",
    "export_calendar_ics",
]
