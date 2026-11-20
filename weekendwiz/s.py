"""
WeekendWiz FastMCP Concierge - Backward Compatibility Shim.

The canonical FastMCP server implementation has been refactored to `server.py`.
This module re-exports all tools, registries, and the FastMCP server instance
to preserve full backward compatibility with legacy scripts and client configs.
"""

import sys
import os

try:
    from .server import *
except (ImportError, ValueError):
    from server import *

if __name__ == "__main__":
    import server
    server.mcp.run()
