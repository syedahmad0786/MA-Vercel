#!/usr/bin/env python3
"""
Deploy n8n Workflows to n8n.aimanagingservices.com
===================================================
Run this script from any machine with internet access:

    python3 deploy_to_n8n.py

It will:
  1. Deploy the Global Error Handler first (workflow 03)
  2. Deploy all other workflows with error handler linked
  3. Deploy the Health Monitor (workflow 04)
  4. Activate all workflows
  5. Attach error handler to ALL existing active workflows
  6. Print links to configure credentials
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

# Placeholder for the error handler workflow ID (set during deployment)
ERROR_HANDLER_WF_ID = None


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


def update_workflow_settings(workflow_id, settings_update):
    """Update a workflow's settings (e.g., to attach error handler)."""
    result = api_request("PATCH", f"/api/v1/workflows/{workflow_id}", body=settings_update)
    return result


def get_all_workflows():
    """Fetch all workflows from the n8n instance."""
    result = api_request("GET", "/api/v1/workflows?limit=100")
    return result.get("data", result.get("results", []))


def attach_error_handler_to_all(error_handler_id, skip_ids=None):
    """Attach the error handler workflow to ALL existing workflows."""
    skip_ids = skip_ids or set()
    skip_ids.add(error_handler_id)  # Don't attach to itself

    print("\n" + "=" * 55)
    print("  Attaching Error Handler to All Workflows")
    print("=" * 55)

    workflows = get_all_workflows()
    updated = 0
    skipped = 0

    for wf in workflows:
        wf_id = wf.get("id", "")
        wf_name = wf.get("name", "Unknown")

        if wf_id in skip_ids:
            continue

        # Check if already has this error handler
        current_settings = wf.get("settings", {})
        if current_settings.get("errorWorkflow") == str(error_handler_id):
            print(f"  SKIP (already linked): {wf_name}")
            skipped += 1
            continue

        try:
            update_workflow_settings(wf_id, {
                "settings": {
                    **current_settings,
                    "errorWorkflow": str(error_handler_id)
                }
            })
            print(f"  LINKED: {wf_name} (ID: {wf_id})")
            updated += 1
        except Exception as e:
            print(f"  FAILED: {wf_name} - {e}")

    print(f"\n  Summary: {updated} updated, {skipped} already linked")
    return updated


def main():
    global ERROR_HANDLER_WF_ID

    print("=" * 55)
    print("  n8n Workflow Deployment (with Error Handling)")
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

    # ---- PHASE 1: Deploy Error Handler FIRST ----
    print("-" * 55)
    print("  PHASE 1: Deploy Global Error Handler")
    print("-" * 55)

    error_handler_file = "03-global-error-handler.json"
    try:
        wf_data = load_workflow(error_handler_file)
        result = create_workflow(wf_data)
        ERROR_HANDLER_WF_ID = result.get("id")
        print(f"  CREATED Error Handler - ID: {ERROR_HANDLER_WF_ID}")

        try:
            activate_workflow(ERROR_HANDLER_WF_ID)
            print(f"  ACTIVATED successfully!")
        except Exception:
            print(f"  WARNING: Created but needs credentials before activation.")
    except FileNotFoundError:
        print(f"  ERROR: {error_handler_file} not found!")
        sys.exit(1)
    except Exception as e:
        print(f"  FAILED to create error handler: {e}")
        sys.exit(1)

    print()

    # ---- PHASE 2: Deploy CRM & Report Workflows (with error handler linked) ----
    print("-" * 55)
    print("  PHASE 2: Deploy Application Workflows")
    print("-" * 55)

    workflows = [
        ("01-hourly-crm-sync.json", "Hourly CRM Sync - Close Deals to Airtable Audit"),
        ("02-daily-slack-report.json", "Daily Slack Report - Missed CRM Leads"),
    ]

    created_ids = [(ERROR_HANDLER_WF_ID, "Global Error Handler")]

    for filename, display_name in workflows:
        print(f"\nDeploying: {display_name}")
        print(f"  File: {filename}")

        try:
            workflow_data = load_workflow(filename)
        except FileNotFoundError:
            print(f"  ERROR: File not found: {filename}")
            continue

        # Replace placeholder with actual error handler ID
        if "settings" in workflow_data and workflow_data["settings"].get("errorWorkflow"):
            workflow_data["settings"]["errorWorkflow"] = str(ERROR_HANDLER_WF_ID)
            print(f"  Linked to Error Handler (ID: {ERROR_HANDLER_WF_ID})")

        # Create the workflow
        try:
            result = create_workflow(workflow_data)
            wf_id = result.get("id")
            print(f"  CREATED - Workflow ID: {wf_id}")
            created_ids.append((wf_id, display_name))
        except Exception:
            print(f"  FAILED to create workflow. Skipping.")
            continue

        # Activate
        try:
            activate_workflow(wf_id)
            print(f"  ACTIVATED successfully!")
        except Exception:
            print(f"  WARNING: Created but needs credentials before activation.")

    # ---- PHASE 3: Deploy Health Monitor ----
    print()
    print("-" * 55)
    print("  PHASE 3: Deploy Health Monitor")
    print("-" * 55)

    health_monitor_file = "04-error-health-monitor.json"
    try:
        wf_data = load_workflow(health_monitor_file)
        # Link health monitor to error handler too
        if "settings" in wf_data:
            wf_data["settings"]["errorWorkflow"] = str(ERROR_HANDLER_WF_ID)

        result = create_workflow(wf_data)
        monitor_id = result.get("id")
        print(f"  CREATED Health Monitor - ID: {monitor_id}")
        created_ids.append((monitor_id, "Error Health Monitor"))

        try:
            activate_workflow(monitor_id)
            print(f"  ACTIVATED successfully!")
        except Exception:
            print(f"  WARNING: Created but needs credentials before activation.")
    except Exception as e:
        print(f"  Failed to deploy health monitor: {e}")

    # ---- PHASE 4: Attach error handler to ALL existing workflows ----
    skip_set = {wf_id for wf_id, _ in created_ids}
    attach_error_handler_to_all(ERROR_HANDLER_WF_ID, skip_ids=skip_set)

    # ---- SUMMARY ----
    print()
    print("=" * 55)
    print("  Deployment Summary")
    print("=" * 55)
    print()

    for wf_id, name in created_ids:
        print(f"  Workflow: {name}")
        print(f"    ID:  {wf_id}")
        print(f"    URL: {N8N_BASE_URL}/workflow/{wf_id}")
        print()

    print("  NEXT STEPS (required):")
    print("  " + "-" * 40)
    print(f"  1. Open {N8N_BASE_URL}")
    print()
    print("  2. Configure credentials in Error Handler (workflow 03):")
    print("     - Google Sheets OAuth2 (for error logging)")
    print("     - Slack Bot Token (for error notifications)")
    print('     - HTTP Header Auth for n8n API: Header Name = "X-N8N-API-KEY"')
    print(f"       Header Value = your n8n API key")
    print()
    print("  3. Set up the Google Sheet:")
    print('     - Create a Google Sheet named "n8n Error Log"')
    print('     - Sheet 1: "Error Log" with columns:')
    print("       Timestamp | Workflow Name | Workflow ID | Execution ID |")
    print("       Failed Node | Error Category | Severity | Error Message |")
    print("       Suggested Solution | Auto Retryable | Resolution Status | Resolved At")
    print('     - Sheet 2: "Health Reports" with columns:')
    print("       Timestamp | Total Failures | Critical Workflows | Report Summary")
    print("     - Paste the Sheet URL into Google Sheets nodes")
    print()
    print("  4. Set the Slack error channel:")
    print('     - Recommended: Create #n8n-errors channel')
    print("     - Set channel name in both error handler and health monitor")
    print()
    print("  5. Configure remaining workflow credentials:")
    print("     - Close CRM API key")
    print("     - Airtable Personal Access Token")
    print("     - Slack Bot Token (for daily reports)")
    print()
    print("  6. Re-activate all workflows after configuring credentials")
    print()
    print("  See ERROR-HANDLING-GUIDE.md for detailed setup and best practices.")
    print("=" * 55)


if __name__ == "__main__":
    main()
