# n8n Error Handling System — Complete Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR n8n WORKFLOWS                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ 01-Hourly    │  │ 02-Daily     │  │ Any Future Workflow  │  │
│  │ CRM Sync     │  │ Slack Report │  │ (auto-linked)        │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │ errorWorkflow    │ errorWorkflow        │ errorWorkflow│
│         └──────────────────┴─────────────────────┘              │
│                            │                                    │
│                            ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  03-Global Error Handler                                 │   │
│  │  ┌─────────┐  ┌───────────┐  ┌────────┐  ┌───────────┐  │   │
│  │  │ Error   │→ │ Classify  │→ │ Google │→ │ Auto-     │  │   │
│  │  │ Trigger │  │ & Solve   │  │ Sheets │  │ Retry?    │  │   │
│  │  └─────────┘  └─────┬─────┘  │ Log    │  └─────┬─────┘  │   │
│  │                     │        └────────┘    Yes │ No      │   │
│  │                     ▼                      ▼   ▼         │   │
│  │               ┌───────────┐          ┌──────┐ ┌──────┐   │   │
│  │               │ Slack     │          │Wait  │ │Manual│   │   │
│  │               │ Notify    │          │+Retry│ │Fix   │   │   │
│  │               └───────────┘          └──────┘ └──────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  04-Health Monitor (every 15 min)                        │   │
│  │  Scans failed executions → Detects patterns →            │   │
│  │  Alerts on critical failures → Logs health reports       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## What Gets Deployed

| # | Workflow | Purpose | Schedule |
|---|----------|---------|----------|
| 03 | Global Error Handler | Catches ALL errors, classifies, logs, notifies, auto-retries | On error |
| 04 | Health Monitor | Scans failed executions, detects patterns, alerts on critical | Every 15 min |
| — | Updated 01 & 02 | Linked to error handler via `errorWorkflow` setting | Unchanged |

## Error Classification Engine

The classifier identifies **9 error categories** and suggests specific solutions:

| Category | Auto-Retry? | Severity | Example |
|----------|-------------|----------|---------|
| Authentication Error | No | Critical | 401, invalid API key, expired token |
| Rate Limit Error | **Yes** (60s delay) | Medium | 429, too many requests |
| Network / Timeout | **Yes** (60s delay) | Medium | ECONNREFUSED, timeout, 502/503/504 |
| Data Validation Error | No | High | Missing field, null reference, parse error |
| Resource Not Found | No | High | 404, deleted record, wrong table ID |
| Quota / Billing Error | No | Critical | Plan limit exceeded, payment required |
| Code Node Error | No | High | SyntaxError, TypeError in Code node |
| Permission Error | No | Critical | Insufficient scopes, access denied |
| External Service Error | **Yes** (60s delay) | Medium | 500, internal server error |

## Setup Instructions

### Step 1: Create the Google Sheet

1. Go to Google Sheets and create a new spreadsheet
2. Name it: **n8n Error Log**
3. Rename the first sheet tab to: **Error Log**
4. Add these column headers in row 1:

```
A: Timestamp
B: Workflow Name
C: Workflow ID
D: Execution ID
E: Failed Node
F: Error Category
G: Severity
H: Error Message
I: Suggested Solution
J: Auto Retryable
K: Resolution Status
L: Resolved At
```

5. Create a second sheet tab: **Health Reports**
6. Add these column headers:

```
A: Timestamp
B: Total Failures
C: Critical Workflows
D: Report Summary
```

7. **Optional but recommended:** Add conditional formatting:
   - Column G (Severity): Red for "Critical", Orange for "High", Yellow for "Medium"
   - Column K (Resolution Status): Green for "Resolved", Red for "Requires Manual Fix"

### Step 2: Configure Google Sheets Credential in n8n

1. In n8n, go to **Credentials** → **Add Credential**
2. Search for **Google Sheets OAuth2**
3. Follow the OAuth2 flow to connect your Google account
4. Ensure the account has access to the spreadsheet you created

### Step 3: Configure n8n API Credential (for auto-retry & health monitor)

1. In n8n, go to **Credentials** → **Add Credential**
2. Search for **Header Auth**
3. Configure:
   - **Name:** `n8n API Key Header`
   - **Header Name:** `X-N8N-API-KEY`
   - **Header Value:** Your n8n API key

### Step 4: Configure Slack Error Channel

1. In Slack, create a channel: `#n8n-errors`
2. Invite the Slack bot to the channel
3. In n8n, open workflow 03 (Error Handler):
   - Click on **"Slack - Error Notification"** node
   - Set channel to `#n8n-errors`
4. In workflow 04 (Health Monitor):
   - Click on **"Slack - Health Alert"** node
   - Set channel to `#n8n-errors`

### Step 5: Set Google Sheet URL in Nodes

In workflow 03 (Error Handler):
1. Click **"Google Sheets - Log Error"** → paste your Sheet URL
2. Click **"Google Sheets - Log Retry"** → paste your Sheet URL

In workflow 04 (Health Monitor):
1. Click **"Google Sheets - Log Health Report"** → paste your Sheet URL

### Step 6: Deploy

```bash
python3 deploy_to_n8n.py
```

The script will:
1. Deploy the error handler first
2. Deploy all workflows with the error handler auto-linked
3. Attach the error handler to ANY existing workflows on your n8n instance
4. Activate everything

### Step 7: Activate

After configuring all credentials, re-activate all workflows from the n8n UI.

---

## How Auto-Retry Works

```
Error occurs in any workflow
        │
        ▼
Error Handler catches it
        │
        ▼
Classifies error type
        │
        ├── Rate Limit (429) ──→ Wait 60s → Retry via n8n API
        ├── Network Error ──────→ Wait 60s → Retry via n8n API
        ├── Server Error (5xx) ─→ Wait 60s → Retry via n8n API
        │
        └── All other errors ──→ Log + Notify (manual fix needed)
```

The retry uses the **n8n Execution Retry API** (`POST /api/v1/executions/{id}/retry`), which re-runs the entire workflow from the start with the same input data.

---

## Best Practices for n8n Error Handling

### 1. Always Use the Global Error Handler (Already Done)
Every workflow should have `errorWorkflow` pointing to the error handler. The deploy script does this automatically for all current and future workflows.

### 2. Add Try/Catch to Code Nodes
For Code nodes with complex logic, wrap in try/catch:

```javascript
try {
  // Your logic here
  const data = $input.all();
  // process data...
  return results;
} catch (error) {
  // Return a meaningful error instead of crashing
  return [{
    json: {
      _error: true,
      _errorMessage: error.message,
      _errorNode: 'YourNodeName'
    }
  }];
}
```

### 3. Use the "Continue On Fail" Setting
For non-critical nodes (like logging or notifications), enable **"Continue On Fail"** in node settings:
- Right-click a node → Settings → Toggle "Continue On Fail"
- This prevents secondary errors from masking the primary issue

### 4. Add IF Nodes After API Calls
Always check API responses before processing:

```
API Call → IF (status == 200) → Process Data
                              → Handle Error
```

### 5. Use Retry on Individual Nodes
For API nodes that are flaky, n8n has built-in retry:
- Open node settings → **Retry On Fail** → Enable
- Set **Max Retries** to 2-3
- Set **Wait Between Retries** to 2000-5000ms

This is **in addition to** the global error handler and is your first line of defense.

### 6. Separate Error Channels by Severity
For larger setups:
- `#n8n-errors-critical` — Auth failures, quota issues (immediate action)
- `#n8n-errors` — All other errors (review during business hours)

### 7. Set Up Google Sheets Dashboard
Use the Error Log sheet to create a dashboard:
- **Pivot table** by Error Category → see which errors happen most
- **Chart** of errors over time → spot trends
- **Filter** by Resolution Status = "Requires Manual Fix" → see open issues

### 8. Monitor Execution History
The Health Monitor (workflow 04) checks every 15 minutes. For even faster detection:
- Reduce the interval to 5 minutes
- Or use n8n's built-in webhook to trigger on execution failure

### 9. Use Sub-Workflows for Isolation
Break complex workflows into smaller sub-workflows:
- Each sub-workflow can have its own error handling
- Failures in one sub-workflow won't crash the parent
- Use the "Execute Workflow" node to call sub-workflows

### 10. Never Ignore Failed Executions
The Health Monitor ensures you always know about failures. Review the Google Sheet weekly and:
- Mark resolved items as "Resolved" with a date
- Look for recurring patterns (same error 3+ times = systemic issue)
- Update workflow logic to handle edge cases discovered through errors

---

## Credential Checklist

| Credential | Used By | How to Get |
|-----------|---------|------------|
| Google Sheets OAuth2 | Error Handler, Health Monitor | Google Cloud Console → OAuth2 |
| Slack API (Bot Token) | Error Handler, Health Monitor, Daily Report | Slack API → Bot Token with `chat:write` |
| n8n API Key (Header Auth) | Error Handler (auto-retry), Health Monitor | n8n Settings → API Keys |
| Close CRM API | Hourly CRM Sync | Close CRM → Settings → API Keys |
| Airtable Token | Hourly CRM Sync | Airtable → Account → API |

---

## Troubleshooting

**Q: Error handler itself is failing?**
- Check Google Sheets credentials are valid
- Verify the Sheet URL is set in both Google Sheets nodes
- Check Slack bot has access to the error channel
- The error handler has no `errorWorkflow` on itself (to prevent infinite loops)

**Q: Auto-retry keeps failing?**
- Check the n8n API Key Header Auth credential is configured
- Verify the API key has execution retry permissions
- If the original error is persistent (e.g., bad data), auto-retry won't help — it will log a retry attempt and you'll need to fix manually

**Q: Health monitor reports too many false positives?**
- Adjust the `oneHourAgo` window in the Code node (e.g., change to 30 min)
- Increase the critical threshold from 3 to 5 failures
- Filter out known non-critical workflow IDs

**Q: Google Sheets hitting rate limits?**
- Google Sheets API allows ~100 requests/min
- If you have extremely high error volume, consider batching or using Airtable instead
