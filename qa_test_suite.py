"""
Senior QA Automation Test Suite for TripPlanner (FastMCP Travel Engine)
Covers functional tests, negative tests, boundary value analysis, and hallucination guardrails.
"""

import sys
import os
import json

# Add weekendwiz to path
sys.path.insert(0, os.path.abspath(r"c:\Users\DevDadhania\Downloads\weekendwiz 1\weekendwiz"))
import s

passes = 0
fails = 0

def test(name: str, condition: bool, details: str = ""):
    global passes, fails
    if condition:
        print(f"  [PASS] {name} {details}")
        passes += 1
    else:
        print(f"  [FAIL] {name} {details}")
        fails += 1

print("\n" + "=" * 70)
print("  SENIOR QA AUTOMATION SUITE: TRIPPLANNER (MCP)")
print("=" * 70)

# ---------------------------------------------------------
# Test Case 1: Primary Destination - Ahmedabad Resolution
# ---------------------------------------------------------
print("\n[TC-01] Valid Destination Geocoding (Ahmedabad)")
res_amd = s.resolve_destination("Ahmedabad")
test("Resolves Ahmedabad city name", res_amd.get("city") == "Ahmedabad")
test("Resolves India country name", res_amd.get("country") == "India")
test("Coordinates within Gujarat bounds (Lat ~23, Lon ~72)", 22.0 < res_amd.get("latitude", 0) < 24.0 and 71.0 < res_amd.get("longitude", 0) < 74.0)
test("Timezone set to Asia/Kolkata", res_amd.get("timezone") == "Asia/Kolkata")

# ---------------------------------------------------------
# Test Case 2: Diacritics & Punctuation in Destination Names
# ---------------------------------------------------------
print("\n[TC-02] Diacritics & Punctuation Handling")
res_zurich = s.resolve_destination("Zürich")
test("Handles umlauts (Zürich)", "error" not in res_zurich and res_zurich.get("country") == "Switzerland")

res_sao = s.resolve_destination("São Paulo")
test("Handles tildes (São Paulo)", "error" not in res_sao and res_sao.get("country") == "Brazil")

res_country_suffix = s.resolve_destination("Ahmedabad, India")
test("Handles comma-separated city + country ('Ahmedabad, India')", "error" not in res_country_suffix)

# ---------------------------------------------------------
# Test Case 3: Invalid / Non-Existent City Handling
# ---------------------------------------------------------
print("\n[TC-03] Negative Test: Non-existent / Gibberish Cities")
res_fake = s.resolve_destination("XyzNonExistentCity999")
test("Returns error payload for invalid city", "error" in res_fake)
test("Error message explains destination not found", "Destination not found" in res_fake.get("error", ""))

# ---------------------------------------------------------
# Test Case 4: Day Clamping & Boundary Value Analysis (BVA)
# ---------------------------------------------------------
print("\n[TC-04] Boundary Value Analysis: Forecast & Day Counts")
# Days clamped between 1 and 7
b_zero = s.estimate_budget("Ahmedabad", days=0)
test("Clamps 0 days to 1 day", b_zero.get("days") == 1)

b_extreme = s.estimate_budget("Ahmedabad", days=50)
test("Clamps 50 days to max 14 days in budget", b_extreme.get("days") == 14)

plan_extreme = s.generate_multiday_itinerary("Ahmedabad", days=20)
test("Clamps itinerary days to max 7 days", len(plan_extreme.get("itinerary", [])) <= 7)

# ---------------------------------------------------------
# Test Case 5: Wikipedia Geosearch Content Filtering (Anti-Hallucination)
# ---------------------------------------------------------
print("\n[TC-05] Content Sanitization: Tourist Attraction Filtering")
att_tokyo = s.find_attractions("Tokyo", limit=10)
tokyo_names = [a["name"].lower() for a in att_tokyo.get("attractions", [])]
test("No subway sarin attack in Tokyo attractions", not any("sarin" in name for name in tokyo_names))
test("No bombing references in Tokyo attractions", not any("bombing" in name for name in tokyo_names))

att_amd = s.find_attractions("Ahmedabad", limit=6)
amd_names = [a["name"] for a in att_amd.get("attractions", [])]
test("Ahmedabad returns verified cultural landmarks", len(amd_names) >= 3)
test("Includes Sabarmati Ashram or Gandhi memorial", any("ashram" in name.lower() or "sabarmati" in name.lower() for name in amd_names))

# ---------------------------------------------------------
# Test Case 6: Localized Purchasing Power (PPP) Budget in INR
# ---------------------------------------------------------
print("\n[TC-06] Budget Realism & Purchasing Power Parity (INR & USD)")
b_amd = s.estimate_budget("Ahmedabad", days=3, travel_style="moderate", currency="INR")
amd_daily = b_amd.get("daily_average", 0)
test("Ahmedabad moderate daily in INR is realistic (₹5,000 - ₹12,000/day)", 5000.0 <= amd_daily <= 12000.0, f"(Actual: INR {amd_daily}/day)")
test("Currency set to INR", b_amd.get("currency") == "INR")

b_tokyo = s.estimate_budget("Tokyo", days=3, travel_style="moderate", currency="INR")
tokyo_daily = b_tokyo.get("daily_average", 0)
test("Tokyo per-diem reflects Tier-1 international pricing in INR (> ₹15,000/day)", tokyo_daily > 15000.0, f"(Actual: INR {tokyo_daily}/day)")
test("Safety buffer is exactly 10% of subtotal", abs(b_amd["breakdown"]["recommended_contingency_10pct"] - round(sum([b_amd["breakdown"]["lodging"], b_amd["breakdown"]["meals_and_dining"], b_amd["breakdown"]["local_transit"], b_amd["breakdown"]["activities_and_admissions"]]) * 0.1, 2)) < 0.05)

# ---------------------------------------------------------
# Test Case 7: Travel Essentials for Ahmedabad
# ---------------------------------------------------------
print("\n[TC-07] Ahmedabad City Knowledge & Logistics Verification")
ess_amd = s.travel_essentials("Ahmedabad")
test("Lists Sardar Vallabhbhai Patel International (AMD)", any("AMD" in a for a in ess_amd.get("airports", [])))
test("Lists Ahmedabad Metro & BRTS Janmarg", "Metro" in ess_amd.get("transit_guide", "") and "BRTS" in ess_amd.get("transit_guide", ""))
test("Correct Indian power plug types (C, D & M)", "Type C, D & M" in ess_amd.get("power_plug", ""))
test("Includes emergency numbers (100/108/101)", "100" in ess_amd.get("emergency_numbers", "") and "108" in ess_amd.get("emergency_numbers", ""))

# ---------------------------------------------------------
# Test Case 8: RFC 5545 iCalendar File Syntax Integrity
# ---------------------------------------------------------
print("\n[TC-08] RFC 5545 iCalendar (.ics) Syntax Integrity")
ics_res = s.export_calendar_ics("Ahmedabad", days=3)
content = ics_res.get("ics_content", "")
test("Begins with BEGIN:VCALENDAR", content.startswith("BEGIN:VCALENDAR"))
test("Ends with END:VCALENDAR", content.strip().endswith("END:VCALENDAR"))
test("Specifies VERSION:2.0", "VERSION:2.0" in content)
test("Contains PRODID tag", "PRODID:" in content)
test("Contains VEVENT objects for morning, afternoon, evening", content.count("BEGIN:VEVENT") == 9)
test("Uses UTC timestamp formatting (Z)", "DTSTART:202" in content and "Z" in content)

# ---------------------------------------------------------
# Final Summary
# ---------------------------------------------------------
print("\n" + "=" * 70)
print(f"  QA SUMMARY: {passes} PASSED | {fails} FAILED | TOTAL: {passes + fails}")
print("=" * 70)

if fails > 0:
    sys.exit(1)
