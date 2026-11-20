"""
Senior QA Automation Test Suite for WeekendWiz FastMCP Travel Engine.
Covers functional tests, negative tests, boundary value analysis, and anti-hallucination guardrails.
"""

import sys
import os
import pytest

# Dynamically add weekendwiz package path (relative to this test file)
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "weekendwiz"))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

try:
    import server as s
except ImportError:
    import s


def test_tc01_ahmedabad_geocoding():
    res = s.resolve_destination("Ahmedabad")
    assert res.get("city") == "Ahmedabad"
    assert res.get("country") == "India"
    assert 22.0 < res.get("latitude", 0) < 24.0
    assert 71.0 < res.get("longitude", 0) < 74.0
    assert res.get("timezone") == "Asia/Kolkata"


def test_tc02_diacritics_and_punctuation():
    res_zurich = s.resolve_destination("Zürich")
    assert "error" not in res_zurich and res_zurich.get("country") == "Switzerland"

    res_sao = s.resolve_destination("São Paulo")
    assert "error" not in res_sao and res_sao.get("country") == "Brazil"

    res_country = s.resolve_destination("Ahmedabad, India")
    assert "error" not in res_country


def test_tc03_invalid_destination():
    res_fake = s.resolve_destination("XyzNonExistentCity999")
    assert "error" in res_fake
    assert "Destination not found" in res_fake.get("error", "")


def test_tc04_day_clamping_and_bva():
    b_zero = s.estimate_budget("Ahmedabad", days=0)
    assert b_zero.get("days") == 1

    b_extreme = s.estimate_budget("Ahmedabad", days=50)
    assert b_extreme.get("days") == 14

    plan_extreme = s.generate_multiday_itinerary("Ahmedabad", days=20)
    assert len(plan_extreme.get("itinerary", [])) <= 7


def test_tc05_wikipedia_attraction_sanitization():
    att_tokyo = s.find_attractions("Tokyo", limit=10)
    tokyo_names = [a["name"].lower() for a in att_tokyo.get("attractions", [])]
    assert not any("sarin" in name for name in tokyo_names)
    assert not any("bombing" in name for name in tokyo_names)

    att_amd = s.find_attractions("Ahmedabad", limit=6)
    amd_names = [a["name"] for a in att_amd.get("attractions", [])]
    assert len(amd_names) >= 3
    assert any("ashram" in name.lower() or "sabarmati" in name.lower() for name in amd_names)


def test_tc06_inr_budget_calculations():
    b_amd = s.estimate_budget("Ahmedabad", days=3, travel_style="moderate", currency="INR")
    amd_daily = b_amd.get("daily_average", 0)
    assert 5000.0 <= amd_daily <= 12000.0
    assert b_amd.get("currency") == "INR"

    b_tokyo = s.estimate_budget("Tokyo", days=3, travel_style="moderate", currency="INR")
    tokyo_daily = b_tokyo.get("daily_average", 0)
    assert tokyo_daily > 15000.0

    subtotal = sum([
        b_amd["breakdown"]["lodging"],
        b_amd["breakdown"]["meals_and_dining"],
        b_amd["breakdown"]["local_transit"],
        b_amd["breakdown"]["activities_and_admissions"],
    ])
    assert abs(b_amd["breakdown"]["recommended_contingency_10pct"] - round(subtotal * 0.1, 2)) < 0.05


def test_tc07_travel_essentials_ahmedabad():
    ess_amd = s.travel_essentials("Ahmedabad")
    assert any("AMD" in a for a in ess_amd.get("airports", []))
    assert "Metro" in ess_amd.get("transit_guide", "") and "BRTS" in ess_amd.get("transit_guide", "")
    assert "Type C, D & M" in ess_amd.get("power_plug", "")
    assert "100" in ess_amd.get("emergency_numbers", "") and "108" in ess_amd.get("emergency_numbers", "")


def test_tc08_rfc5545_calendar_integrity():
    ics_res = s.export_calendar_ics("Ahmedabad", days=3)
    content = ics_res.get("ics_content", "")
    assert content.startswith("BEGIN:VCALENDAR")
    assert content.strip().endswith("END:VCALENDAR")
    assert "VERSION:2.0" in content
    assert "PRODID:" in content
    assert content.count("BEGIN:VEVENT") == 9
    assert "DTSTART:202" in content and "Z" in content


def run_standalone():
    """Runs all tests and outputs test pass/fail report."""
    passes = 0
    fails = 0

    def check(name, fn):
        nonlocal passes, fails
        try:
            fn()
            print(f"  [PASS] {name}")
            passes += 1
        except Exception as e:
            print(f"  [FAIL] {name}: {e}")
            fails += 1

    print("\n" + "=" * 70)
    print("  SENIOR QA AUTOMATION SUITE: WEEKENDWIZ FASTMCP")
    print("=" * 70)

    check("[TC-01] Valid Destination Geocoding (Ahmedabad)", test_tc01_ahmedabad_geocoding)
    check("[TC-02] Diacritics & Punctuation Handling (Zürich, São Paulo)", test_tc02_diacritics_and_punctuation)
    check("[TC-03] Negative Test: Non-existent / Gibberish Cities", test_tc03_invalid_destination)
    check("[TC-04] Boundary Value Analysis: Day Clamping (0, 20, 50 days)", test_tc04_day_clamping_and_bva)
    check("[TC-05] Content Sanitization: Safe Attraction Filtering", test_tc05_wikipedia_attraction_sanitization)
    check("[TC-06] Budget Realism & PPP in INR (₹)", test_tc06_inr_budget_calculations)
    check("[TC-07] Ahmedabad Logistics, Transit, Plugs & Emergency", test_tc07_travel_essentials_ahmedabad)
    check("[TC-08] RFC 5545 iCalendar (.ics) Syntax Integrity", test_tc08_rfc5545_calendar_integrity)

    print("\n" + "=" * 70)
    print(f"  QA SUMMARY: {passes} PASSED | {fails} FAILED | TOTAL: {passes + fails}")
    print("=" * 70)
    return fails == 0


if __name__ == "__main__":
    success = run_standalone()
    if not success:
        sys.exit(1)
