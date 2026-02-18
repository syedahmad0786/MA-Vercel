#!/usr/bin/env python3
"""
Deploy n8n Workflows to n8n.aimanagingservices.com
===================================================
Run this script from any machine with internet access:

    python3 deploy_to_n8n.py

It will:
  1. Create both workflows via the n8n REST API
  2. Activate them
  3. Print links to configure credentials
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error

N8N_BASE_URL = "https://n8n.aimanagingservices.com"
N8N_API_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJzdWIiOiIyNDk2NzU4My00MzM1LTRiYjMtOTFiZi02MTNhMTNmNzk2ZWIi"
    "LCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzcxNDIwNDA1fQ."
    "xpTdq-YmnV14s6S2EY7jFYJ2HRdNGY3k6CPZ44je2Dg"
)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def api_request(method, path, body=None, retries=4):
    """Make an n8n API request with retries and exponential backoff."""
    url = f"{N8N_BASE_URL}{path}"
    headers = {
        "X-N8N-API-KEY": N8N_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    data = json.dumps(body).encode("utf-8") if body else None

    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, data=data, headers=headers, method=method)
            with urllib.request.urlopen(req, timeout=30) as resp:
                response_body = resp.read().decode("utf-8")
                return json.loads(response_body) if response_body else {}
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8", errors="replace")
            if attempt == retries - 1:
                print(f"  ERROR: HTTP {e.code} - {error_body}")
                raise
            wait = 2 ** (attempt + 1)
            print(f"  Retry {attempt + 1}/{retries} after HTTP {e.code} (waiting {wait}s)...")
            time.sleep(wait)
        except urllib.error.URLError as e:
            if attempt == retries - 1:
                print(f"  ERROR: Network error - {e.reason}")
                raise
            wait = 2 ** (attempt + 1)
            print(f"  Retry {attempt + 1}/{retries} after network error (waiting {wait}s)...")
            time.sleep(wait)


def load_workflow(filename):
    """Load a workflow JSON file."""
    filepath = os.path.join(SCRIPT_DIR, filename)
    with open(filepath, "r") as f:
        return json.load(f)


def create_workflow(workflow_data):
    """Create a workflow via the n8n API."""
    result = api_request("POST", "/api/v1/workflows", body=workflow_data)
    return result


def activate_workflow(workflow_id):
    """Activate a workflow by ID."""
    result = api_request("PATCH", f"/api/v1/workflows/{workflow_id}", body={"active": True})
    return result


def main():
    print("=" * 55)
    print("  n8n Workflow Deployment")
    print(f"  Target: {N8N_BASE_URL}")
    print("=" * 55)
    print()

    # Test connectivity
    print("Testing API connectivity...")
    try:
        api_request("GET", "/api/v1/workflows?limit=1")
        print("  Connected successfully!\n")
    except Exception as e:
        print(f"\n  FATAL: Cannot connect to {N8N_BASE_URL}")
        print(f"  Error: {e}")
        print("\n  Please verify:")
        print("    1. The n8n instance is running")
        print("    2. The API key is valid")
        print("    3. You have network access to the domain")
        sys.exit(1)

    workflows = [
        ("01-hourly-crm-sync.json", "Hourly CRM Sync - Close Deals to Airtable Audit"),
        ("02-daily-slack-report.json", "Daily Slack Report - Missed CRM Leads"),
    ]

    created_ids = []

    for filename, display_name in workflows:
        print(f"Deploying: {display_name}")
        print(f"  File: {filename}")

        try:
            workflow_data = load_workflow(filename)
        except FileNotFoundError:
            print(f"  ERROR: File not found: {filename}")
            print(f"  Expected at: {os.path.join(SCRIPT_DIR, filename)}")
            continue

        # Create the workflow
        try:
            result = create_workflow(workflow_data)
            wf_id = result.get("id")
            print(f"  CREATED - Workflow ID: {wf_id}")
            created_ids.append((wf_id, display_name))
        except Exception:
            print(f"  FAILED to create workflow. Skipping activation.")
            continue

        # Activate the workflow
        try:
            activate_workflow(wf_id)
            print(f"  ACTIVATED successfully!")
        except Exception:
            print(f"  WARNING: Created but could not activate.")
            print(f"  You'll need to configure credentials first, then activate manually.")

        print()

    # Summary
    print("=" * 55)
    print("  Deployment Summary")
    print("=" * 55)
    print()

    if created_ids:
        for wf_id, name in created_ids:
            print(f"  Workflow: {name}")
            print(f"    ID:  {wf_id}")
            print(f"    URL: {N8N_BASE_URL}/workflow/{wf_id}")
            print()

    print("  NEXT STEPS (required):")
    print("  " + "-" * 40)
    print(f"  1. Open {N8N_BASE_URL}")
    print("  2. In each workflow, configure credentials:")
    print("     - Close CRM API key")
    print("     - Airtable Personal Access Token")
    print("     - Slack Bot Token")
    print("  3. Set Airtable Base ID + Table names in each Airtable node:")
    print('     - Clients table → your clients table')
    print('     - Audit table  → "CRM Audit - Missed Leads"')
    print("  4. Set the Slack channel name in Workflow 2")
    print("  5. Re-activate both workflows after configuring credentials")
    print()
    print("  See SETUP-GUIDE.md for detailed instructions.")
    print("=" * 55)


if __name__ == "__main__":
    main()
