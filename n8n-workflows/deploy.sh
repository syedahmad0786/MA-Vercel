#!/bin/bash
# ============================================================
# Deploy n8n Workflows to n8n.aimanagingservices.com
# ============================================================
# Usage: ./deploy.sh
#
# This script deploys both workflows:
#   1. Hourly CRM Sync (Close CRM -> Airtable Audit)
#   2. Daily Slack Report (Missed Leads -> Slack)
# ============================================================

N8N_BASE_URL="https://n8n.aimanagingservices.com"
N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNDk2NzU4My00MzM1LTRiYjMtOTFiZi02MTNhMTNmNzk2ZWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzcxNDIwNDA1fQ.xpTdq-YmnV14s6S2EY7jFYJ2HRdNGY3k6CPZ44je2Dg"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "============================================="
echo "  n8n Workflow Deployment"
echo "  Target: $N8N_BASE_URL"
echo "============================================="
echo ""

# Function to deploy a workflow
deploy_workflow() {
    local file="$1"
    local name="$2"

    echo "Deploying: $name"
    echo "  File: $file"

    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        -H "Content-Type: application/json" \
        -d @"$file" \
        "$N8N_BASE_URL/api/v1/workflows")

    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | head -n -1)

    if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
        WORKFLOW_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
        echo "  SUCCESS - Workflow ID: $WORKFLOW_ID"

        # Activate the workflow
        echo "  Activating workflow..."
        ACTIVATE_RESPONSE=$(curl -s -w "\n%{http_code}" \
            -X PATCH \
            -H "X-N8N-API-KEY: $N8N_API_KEY" \
            -H "Content-Type: application/json" \
            -d '{"active": true}' \
            "$N8N_BASE_URL/api/v1/workflows/$WORKFLOW_ID")

        ACTIVATE_CODE=$(echo "$ACTIVATE_RESPONSE" | tail -1)
        if [ "$ACTIVATE_CODE" -eq 200 ]; then
            echo "  ACTIVATED successfully!"
        else
            echo "  WARNING: Could not activate. Please activate manually in n8n UI."
            echo "  (Credentials may need to be configured first)"
        fi
    else
        echo "  FAILED (HTTP $HTTP_CODE)"
        echo "  Response: $BODY"
    fi
    echo ""
}

# Deploy Workflow 1: Hourly CRM Sync
deploy_workflow "$SCRIPT_DIR/01-hourly-crm-sync.json" "Hourly CRM Sync - Close Deals to Airtable Audit"

# Deploy Workflow 2: Daily Slack Report
deploy_workflow "$SCRIPT_DIR/02-daily-slack-report.json" "Daily Slack Report - Missed CRM Leads"

echo "============================================="
echo "  Deployment Complete!"
echo ""
echo "  IMPORTANT NEXT STEPS:"
echo "  1. Go to $N8N_BASE_URL"
echo "  2. Open each workflow and configure credentials:"
echo "     - Close CRM API key"
echo "     - Airtable Personal Access Token"
echo "     - Slack API token"
echo "  3. Configure the Airtable base/table IDs"
echo "     (see SETUP-GUIDE.md for details)"
echo "  4. Activate both workflows"
echo "============================================="
