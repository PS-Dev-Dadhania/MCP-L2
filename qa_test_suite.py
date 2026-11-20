#!/usr/bin/env python3
"""
Root QA Automation Test Runner.
Executes the comprehensive test suite in tests/test_mcp_suite.py.
"""
import sys
import os

# Ensure tests package is importable
TESTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "tests"))
if TESTS_DIR not in sys.path:
    sys.path.insert(0, TESTS_DIR)

from test_mcp_suite import run_standalone

if __name__ == "__main__":
    success = run_standalone()
    sys.exit(0 if success else 1)
