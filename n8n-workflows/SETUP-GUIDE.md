# n8n Workflow Setup Guide - CRM Audit Automation

## Overview

Two workflows that work together:

| Workflow | Schedule | Purpose |
|----------|----------|---------|
| **Hourly CRM Sync** | Every hour | Fetches Close CRM won deals, compares with Airtable Clients table, writes missing leads to "CRM Audit - Missed Leads" table |
| **Daily Slack Report** | 9 AM Mon-Fri | Reads the "CRM Audit - Missed Leads" table and sends a formatted summary to Slack |

## Architecture

```
WORKFLOW 1 - Hourly CRM Sync:

  [Every Hour Trigger]
        |
        ├──> [Close CRM - Get Won Deals]──┐
        |                                  |
        └──> [Airtable - Get Clients] ─────┤
                                           v
                              [Compare - Find Missed Leads] (Code Node)
                                           |
                                    [Has Missed Leads?]
                                      /           \
                                   YES             NO
                                    |               |
                        [Search Audit Table]    [No Action]
                                    |
                            [Record Exists?]
                              /         \
                           YES           NO
                            |             |
                     [Update Record]  [Create Record]
                     (update time)    (new entry)


WORKFLOW 2 - Daily Slack Report:

  [Every Workday 9AM]
        |
        v
  [Airtable - Get Missed Leads]
        |
  [Has Records?]
     /        \
   YES         NO
    |           |
  [Format     [No Action]
   Message]
    |
  [Slack - Send Report]
```

## Deployment Options

### Option A: Import via n8n UI (Recommended)

1. Go to https://n8n.aimanagingservices.com
2. Click **"Add workflow"** (or the + button)
3. Click the **three dots menu (⋮)** → **"Import from file"**
4. Select `01-hourly-crm-sync.json`
5. Repeat steps 2-4 for `02-daily-slack-report.json`

### Option B: Deploy via API Script

```bash
cd n8n-workflows
./deploy.sh
```

## Post-Deployment Configuration

### Step 1: Configure Credentials

In each workflow, you need to set up credentials for the services used:

#### Close CRM API
1. In n8n, go to **Settings → Credentials → Add Credential**
2. Search for **"Close CRM"**
3. Enter your Close CRM API key
4. Save

#### Airtable Personal Access Token
1. Go to https://airtable.com/create/tokens
2. Create a token with scopes: `data.records:read`, `data.records:write`
3. Grant access to your base
4. In n8n, add **"Airtable Personal Access Token"** credential
5. Paste the token

#### Slack API
1. Create a Slack App at https://api.slack.com/apps
2. Add Bot Token Scopes: `chat:write`, `chat:write.public`
3. Install to workspace
4. In n8n, add **"Slack API"** credential
5. Use the Bot User OAuth Token

### Step 2: Configure Airtable Base & Table IDs

In **BOTH** workflows, you need to set the Airtable Base ID and Table names:

#### Workflow 1 (Hourly CRM Sync):
Open each Airtable node and configure:

| Node | Base | Table |
|------|------|-------|
| **Airtable - Get All Clients** | Your base | `Clients` (or your actual clients table name) |
| **Airtable - Search Audit Table** | Your base | `CRM Audit - Missed Leads` |
| **Airtable - Update Existing Record** | Your base | `CRM Audit - Missed Leads` |
| **Airtable - Create New Audit Record** | Your base | `CRM Audit - Missed Leads` |

#### Workflow 2 (Daily Slack Report):
| Node | Base | Table |
|------|------|-------|
| **Airtable - Get Missed Leads** | Your base | `CRM Audit - Missed Leads` |

### Step 3: Configure Slack Channel

In Workflow 2, open the **"Slack - Send Missed Leads Report"** node and set your channel name (e.g., `#crm-alerts` or `#general`).

### Step 4: Create the Airtable "CRM Audit - Missed Leads" Table

Create a table in your Airtable base with these fields:

| Field Name | Field Type | Description |
|------------|-----------|-------------|
| Lead Name | Single line text | Contact name from Close CRM |
| Email | Email | Contact email |
| Deal Value | Number (or Currency) | Value of the closed/won deal |
| Close CRM Deal ID | Single line text | The deal ID in Close CRM |
| Organization | Single line text | Company/org name |
| Closed Won Date | Date | When the deal was marked won |
| Source | Single line text | Always "Close CRM" |
| Status | Single line text | "Missing from Airtable" |
| Last Checked | Date (with time) | Timestamp of last verification |

### Step 5: Verify Field Mappings

The comparison logic in the Code node matches leads by:
1. **Email** (primary match) - comparing Close CRM contact email against Airtable Clients `Email` field
2. **Name** (fallback match) - comparing Close CRM contact name against Airtable Clients `Name` field

If your Airtable Clients table uses different column names, update the Code node in Workflow 1:
- Look for `client.json.Email` and `client.json.Name`
- Change to match your actual column names

### Step 6: Activate Workflows

1. Open each workflow in n8n
2. Toggle the **Active** switch in the top-right corner
3. Both workflows should now run on their schedules

## Deduplication Logic

The hourly workflow prevents duplicate records by:
1. For each missed lead, it searches the "CRM Audit - Missed Leads" table by email
2. If a record already exists → **updates only the `Last Checked` timestamp**
3. If no record exists → **creates a new record**

This ensures the audit table stays clean with one entry per missed lead.

## Troubleshooting

- **Close CRM returns no data**: Verify your API key has access to opportunities. Check that deals exist with status "won".
- **Airtable errors**: Ensure the base ID and table names are correct. Verify the PAT has read/write permissions.
- **Slack message not sending**: Check the bot is invited to the target channel. Verify the token has `chat:write` scope.
- **Duplicate records appearing**: Ensure the `Email` field in "CRM Audit - Missed Leads" matches exactly what Close CRM returns.
