'use strict';

const BASE_URL = 'https://api.airtable.com/v0';

// Table IDs within the base (from the n8n workflow configuration)
const TABLES = {
  STUDENT_ONBOARDING: 'tblMLFYTeoqrtmgXQ',
  CLIENTS: 'tblwDucKYAsPDVBA2',
  ONBOARDING_ERRORS: 'tblaQ6fpHGhRs56sH',
};

function baseId() {
  return process.env.AIRTABLE_BASE_ID || 'appgqED05AlPLi0ar';
}

function authHeader() {
  return `Bearer ${process.env.AIRTABLE_API_TOKEN || ''}`;
}

/**
 * Creates a single record in the given table.
 * @param {string} tableId
 * @param {object} fields
 * @returns {Promise<object>} Airtable record { id, fields, createdTime }
 */
async function createRecord(tableId, fields) {
  const url = `${BASE_URL}/${baseId()}/${tableId}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields, typecast: true }),
    signal: AbortSignal.timeout(30_000),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`[Airtable] createRecord error: ${JSON.stringify(data.error)}`);
  }
  return data;
}

/**
 * Updates a single record by its Airtable record ID.
 * @param {string} tableId
 * @param {string} recordId  - e.g. "rec..."
 * @param {object} fields
 */
async function updateRecord(tableId, recordId, fields) {
  const url = `${BASE_URL}/${baseId()}/${tableId}/${recordId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields, typecast: true }),
    signal: AbortSignal.timeout(30_000),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`[Airtable] updateRecord error: ${JSON.stringify(data.error)}`);
  }
  return data;
}

/**
 * Upserts records using Airtable's performUpsert bulk PATCH endpoint.
 * Matches on `mergeFields` (array of field names); creates if no match found.
 *
 * @param {string}   tableId
 * @param {string[]} mergeFields  - field names to match on (e.g. ["Personal Email"])
 * @param {object[]} records      - array of { fields: {...} }
 */
async function upsertRecords(tableId, mergeFields, records) {
  const url = `${BASE_URL}/${baseId()}/${tableId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      performUpsert: { fieldsToMergeOn: mergeFields },
      records,
      typecast: true,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`[Airtable] upsertRecords error: ${JSON.stringify(data.error)}`);
  }
  return data;
}

// ── Domain-level helpers ──────────────────────────────────────────────────────

/**
 * Creates the Student Onboarding record.
 * Mirrors the n8n "Create Airtable Student Record2" node.
 *
 * @param {object} d - merged opportunity data from parsers.js
 * @param {string} lastUpdated - formatted date string
 */
async function createStudentRecord(d, lastUpdated) {
  const opp = d._opportunity_data || {};
  const lc = opp.lead_custom || {};

  const fields = {
    'Full Name': d.lead_name,
    'Program Tier Purchased': lc['*Program Tier Purchased (N)'] || '',
    'associatedVids': 0,
    'Best Email': d.email,
    'Sales Rep': d.sales_rep,
    'Amount $': d.amount_formatted,
    'Phone': d.phone,
    'city': lc['*City (N)'] || d.city || '',
    'Customer State': lc['*Customer State (Please use Abbreviation) (N)'] || d.state || '',
    'Last Updated': lastUpdated,
    'Client ID': d.lead_id,
    'Onboarding Notes': opp.lead_last_call_note || '',
    'Zip for Scrape': lc['*Zipcodes for Lead Scrape (N)'] || '',
    'Street Address': lc['*Street Address (N)'] || '',
    'MN Invite Granted': 'Pending',
    'MN Invite ID': '',
  };

  return createRecord(TABLES.STUDENT_ONBOARDING, fields);
}

/**
 * Creates the Clients record.
 * Mirrors the n8n "Create Airtable Client Record2" node.
 *
 * @param {object} d - merged opportunity data from parsers.js
 */
async function createClientRecord(d) {
  const opp = d._opportunity_data || {};
  const lc = opp.lead_custom || {};

  const fields = {
    'Full Name': d.lead_name,
    'Personal Email': d.email,
    'Phone Number': d.phone,
    'Status': 'Onboarding',
    'Program Stages': '1. Onboarding',
    'City': lc['*City (N)'] || d.city || '',
    'State/Province': lc['*Customer State (Please use Abbreviation) (N)'] || d.state || '',
    'Total Value (Pipedrive)': d.amount || 0,
    'Sales Rep': d.sales_rep,
    'Zip for Scrape': lc['*Zipcodes for Lead Scrape (N)'] || '',
    'Zip Code': lc['*Zipcodes for Lead Scrape (N)'] || '',
    'Street, Building': lc['*Street Address (N)'] || '',
    'Membership Level (Text)': lc['*Program Tier Purchased (N)'] || '',
    'Machine Add-On': lc['*Bonus Sign Up Offer (VendMarket Credits, Extra Month or 50 bonus leads) (N)'] || '',
    'Onboarding Notes': lc['*Bonus Sign Up Offer (VendMarket Credits, Extra Month or 50 bonus leads) (N)'] || '',
    'Hubspot Close Date': d.date_won || '',
    'MN Invite Granted': 'Pending',
    'MN Invite ID': '',
    // Numeric defaults
    'How many machines have you placed?': 0,
    'Net Monthly Revenue for each machine': 0,
    'Total Net Revenue': 0,
    'Leads Scraped': 0,
    'Week16': 0,
    'Week17': 0,
    'Weekly Push': 0,
    'Total Verified Leads': 0,
    'Limited Leads #': 0,
    'Total Number of Machines': 0,
    'Community Engagement': 0,
    'Proximity to Lead': 0,
    'Vendhub Participation': 0,
    'Latitude': 0,
    'Longitude': 0,
    'match_confidence': 0,
    'Ambassador Score': 0,
    'Location 1 Number of Machines': 0,
    'Location 2 Number of Machines': 0,
    'Location 3 Number of Machines': 0,
    'Location 4 Number of Machines': 0,
    'Location 5 Number of Machines': 0,
    'Total Number of Locations': 0,
    'Total Monthly Revenue': 0,
    'Location 1 Monthly Revenue': 0,
    'Location 2 Monthly Revenue': 0,
    'Location 3 Monthly Revenue': 0,
    'Location 4 Monthly Revenue': 0,
    'Location 5 Monthly Revenue': 0,
    'Negative Impact': 0,
    'Hubspot Deal ID': 0,
    // Boolean defaults
    'invited_to_vendhub': false,
    'in_vendhub': false,
    'Outreach': false,
    'Sent Email File': false,
    'Client Updated': false,
    'In Saleshandy': false,
    'No Apartment Leads': false,
    '+200 Leads': false,
    'Invited to VendHUB': false,
    'Kickoff Complete': false,
    'Jade-Done': false,
    'leads needed': false,
    'Onboarding': false,
    'Test Checkbox 1': false,
    'Migration Completed': false,
    'Flagged for Migration': false,
    'Sent Email Folder': false,
    'Webinar Bonus (50 Leads)': false,
    'Re-Scrape Needed': false,
    'match_status': false,
    'needs_review': false,
    'Ambassador?': false,
    'Recycled?': false,
    'Send Leads to Personal Email': false,
    'No Leads after 3 months': false,
    'Joined Kickoff Call?': false,
    'Kick-Off Scheduled': false,
    'Send Weekly Check-in': false,
  };

  return createRecord(TABLES.CLIENTS, fields);
}

/**
 * Updates the Student Onboarding record with the Mighty Networks invite status.
 * Mirrors the n8n "Update Airtable: MN Invite Status" node.
 */
async function updateStudentMNInvite(studentRecordId, mnInviteId, tier) {
  // Determine tier-specific label (mirrors "Update Student: MN Plan" node)
  const GOLD_PLATINUM = ['gold', 'platinum'];
  const tierLower = (tier || '').toLowerCase();
  const isGoldPlatinum = GOLD_PLATINUM.some((t) => tierLower.startsWith(t));
  const inviteGrantedLabel = isGoldPlatinum ? 'OK - Gold & Platinum Plan' : 'OK - Bronze & Silver Plan';

  return updateRecord(TABLES.STUDENT_ONBOARDING, studentRecordId, {
    'MN Invite Granted': inviteGrantedLabel,
    'MN Invite ID': String(mnInviteId || ''),
  });
}

/**
 * Updates the Clients record with the Mighty Networks invite status.
 * Mirrors the n8n "Update Client: MN Invite Status" node.
 * Matches by "Personal Email" (upsert).
 */
async function updateClientMNInvite(email, mnInviteId) {
  return upsertRecords(
    TABLES.CLIENTS,
    ['Personal Email'],
    [{ fields: { 'Personal Email': email, 'MN Invite Granted': 'OK', 'MN Invite ID': String(mnInviteId || '') } }]
  );
}

/**
 * Logs an error record to the Onboarding Errors table.
 * Mirrors the various "Log Error to Airtable" nodes in the n8n workflow.
 * Swallows its own errors so it never breaks the main flow.
 */
async function logError({ lead_id, lead_name, email, error_type, error_message, error_node, execution_id }) {
  try {
    return await createRecord(TABLES.ONBOARDING_ERRORS, {
      'Lead ID': lead_id || '',
      'Lead Name': lead_name || '',
      'Email': email || '',
      'Error Type': error_type || 'Unknown',
      'Error Message': String(error_message || 'No error message').slice(0, 2000),
      'Error Node': error_node || 'Unknown',
      'Timestamp': new Date().toISOString(),
      'Execution ID': execution_id || '',
      'Status': 'New',
    });
  } catch (err) {
    console.error('[Airtable] logError failed:', err.message);
    return null;
  }
}

module.exports = {
  TABLES,
  createRecord,
  updateRecord,
  upsertRecords,
  createStudentRecord,
  createClientRecord,
  updateStudentMNInvite,
  updateClientMNInvite,
  logError,
};
