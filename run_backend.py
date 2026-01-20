#!/usr/bin/env python3
"""
Book Maker Backend Runner

Start the API server for local development.

Usage:
    python run_backend.py

Environment variables required (set in .env):
    ADMIN_API_URL - URL of the Supabase admin-api Edge Function
    ADMIN_API_SECRET - Secret for admin-api authentication
    CLAUDE_API_KEY - Anthropic API key
"""

import os
import sys
from pathlib import Path

# Add src to path so imports work
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Verify required environment variables
required_vars = ["ADMIN_API_URL", "ADMIN_API_SECRET", "CLAUDE_API_KEY"]
missing = [var for var in required_vars if not os.environ.get(var)]

if missing:
    print("ERROR: Missing required environment variables:")
    for var in missing:
        print(f"  - {var}")
    print("\nCreate a .env file with these variables or set them in your environment.")
    print("See .env.example for template.")
    sys.exit(1)

# Now import and run the server
from backend.api.server import run_server

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run Book Maker API server")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind to")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind to")

    args = parser.parse_args()

    print(f"""
╔══════════════════════════════════════════════════════════════════╗
║                    Book Maker API Server                         ║
╠══════════════════════════════════════════════════════════════════╣
║  Starting server at http://{args.host}:{args.port}                          ║
║                                                                  ║
║  Endpoints:                                                      ║
║    GET  /health                    - Health check                ║
║    GET  /api/phases                - List all phases/agents      ║
║    GET  /api/projects/{id}/status  - Get project status          ║
║    POST /api/projects/{id}/start   - Start pipeline              ║
║    POST /api/projects/{id}/pause   - Pause pipeline              ║
║    POST /api/projects/{id}/resume  - Resume pipeline             ║
║    POST /api/projects/{id}/stop    - Stop pipeline               ║
║    POST /api/projects/{id}/phases/{n} - Run single phase         ║
║    POST /api/projects/{id}/agents/{name} - Run single agent      ║
║                                                                  ║
║  Press Ctrl+C to stop                                            ║
╚══════════════════════════════════════════════════════════════════╝
    """)

    run_server(host=args.host, port=args.port)
