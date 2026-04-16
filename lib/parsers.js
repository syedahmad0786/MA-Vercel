'use strict';

/**
 * Custom field ID → human-readable name map for Close CRM.
 * Mirrors the mapping in the n8n "Parse Lead Data from Webhook" node.
 */
const CUSTOM_FIELD_MAP = {
  cf_1DUR1dOvsjDpeBrOF155IQFD9avFUzimI9lBH38ipIy: 'email',
  cf_fvkned1AX3Wz2z86IKVB6kvsrPcOQZQcLZTpUO1uazy: 'first_name',
  cf_iAcHsjQQKY669jgA9CkzxMNvVYOypQUar7ocs5r5aN6: 'phone',
  cf_q7u05V4mozRXmLIJiDyPDjw87yPNidfYgGp16IgrK0c: 'state',
  cf_OcYP2vXsG2tvbMDubwQNcidiqVegXa7CsyWkOR3f7KN: 'employment_type',
  cf_lRvshUBjrnRdWuMRRItNtGTytnmu8E1ErizrTShhtY7: 'role',
  cf_sQv4xMu3irxizkzgTIe6jwxF65Xq2JW51dLmJAqwbYV: 'annual_income',
  cf_ck1TW5yoI6Nicnqfcgby8G9qcuNSSY6Wr2sa838nsFn: 'amount',
  cf_XvdC8hcwyfkoOFn6ElNdGEWbd567Th65m4spLuugYm3: 'program_tier',
  cf_k5T6a2TO6kceMqsB4L1R4a1pHCVw33BqHEPazH9CAqs: 'onboarded',
  cf_emPheamumc8kyPCA64PMc2w8tX4zYZIZeWG6a2qvbue: 'city',
  cf_JIKnS9tBN71nBdFhZX4GA6WfilchIMBjJ4Q2Wiog9PH: 'bonus_offer',
};

/**
 * Extracts custom fields from a Close CRM webhook event data object.
 * Close CRM sends custom fields as "custom.<fieldId>" keys.
 */
function extractCustomFields(eventData) {
  const extracted = {};
  for (const key of Object.keys(eventData)) {
    if (key.startsWith('custom.')) {
      const fieldId = key.slice('custom.'.length);
      const name = CUSTOM_FIELD_MAP[fieldId] || fieldId;
      extracted[name] = eventData[key];
    }
  }
  return extracted;
}

/**
 * Parses the raw Close CRM webhook payload.
 * Mirrors the n8n "Parse Lead Data from Webhook1" code node.
 *
 * @param {object} body - req.body from the incoming webhook POST
 */
function parseLeadDataFromWebhook(body) {
  const eventData = body.event?.data || {};
  const customFields = extractCustomFields(eventData);

  return {
    lead_id: body.event?.lead_id || eventData.id || '',
    lead_name: eventData.display_name || eventData.name || 'Unknown',
    email: customFields.email || '',
    first_name: customFields.first_name || '',
    phone: customFields.phone || '',
    state: customFields.state || '',
    employment_type: customFields.employment_type || '',
    role: customFields.role || '',
    annual_income: customFields.annual_income || '',
    amount: customFields.amount || '',
    program_tier: customFields.program_tier || '',
    onboarded: customFields.onboarded || '',
    city: customFields.city || '',
    status_label: eventData.status_label || '',
    _raw_custom_fields: customFields,
    _event_action: body.event?.action || '',
    _changed_fields: body.event?.changed_fields || [],
  };
}

/**
 * Merges webhook lead data with the full opportunity record fetched from the
 * Close CRM API.  Mirrors the n8n "Parse & Merge Opportunity Data1" code node.
 *
 * @param {object} leadData    - output of parseLeadDataFromWebhook()
 * @param {object} fetchResult - JSON response from GET /opportunity/?lead_id=...
 * @param {string} executionId - unique ID for this webhook invocation
 */
function parseAndMergeOpportunityData(leadData, fetchResult, executionId) {
  const opportunities = fetchResult.data || [];
  const oppData = opportunities.length > 0 ? opportunities[0] : {};

  // ── Email ──────────────────────────────────────────────────────────────────
  let email = '';
  if (oppData.lead_primary_email?.email) {
    email = oppData.lead_primary_email.email;
  } else if (typeof oppData.lead_contacts_summary === 'string' && oppData.lead_contacts_summary.includes('@')) {
    const match = oppData.lead_contacts_summary.match(/[\w.+-]+@[\w.-]+\.\w+/);
    if (match) email = match[0];
  }

  // ── Phone ──────────────────────────────────────────────────────────────────
  let phone = '';
  const primaryPhone = Array.isArray(oppData.lead_primary_phone) ? oppData.lead_primary_phone[0] : null;
  if (primaryPhone) {
    phone = primaryPhone.phone || primaryPhone.phone_formatted || '';
  }

  // ── Name ───────────────────────────────────────────────────────────────────
  const leadName = oppData.lead_name || oppData.lead_display_name || leadData.lead_name || 'Unknown';
  const firstName = leadName !== 'Unknown' ? leadName.split(' ')[0] : '';

  // ── Address ────────────────────────────────────────────────────────────────
  const addressParts = (oppData.lead_primary_address_summary || '').split(',');
  const city = addressParts[0]?.trim() || '';
  const state = addressParts[1]?.trim() || '';

  // ── Trigger CW Onboarding custom field ────────────────────────────────────
  // Close CRM API returns lead custom fields in lead_custom (object keyed by
  // display name) or as flattened "lead_custom.<fieldId>" keys.
  let triggerCwOnboarding = '';
  if (oppData.lead_custom?.['Trigger CW Onboarding']) {
    triggerCwOnboarding = oppData.lead_custom['Trigger CW Onboarding'];
  } else if (oppData['lead_custom.cf_k5T6a2TO6kceMqsB4L1R4a1pHCVw33BqHEPazH9CAqs']) {
    triggerCwOnboarding = oppData['lead_custom.cf_k5T6a2TO6kceMqsB4L1R4a1pHCVw33BqHEPazH9CAqs'];
  }

  return {
    lead_id: oppData.lead_id || leadData.lead_id || '',
    lead_name: leadName,
    email,
    phone,
    first_name: firstName,
    city,
    state,
    trigger_cw_onboarding: triggerCwOnboarding,
    employment_type: leadData.employment_type || '',
    role: leadData.role || '',
    annual_income: leadData.annual_income || '',
    opportunity_id: oppData.id || '',
    opportunity_status: oppData.status_label || '',
    opportunity_status_type: oppData.status_type || '',
    amount: oppData.value ? oppData.value / 100 : 0,
    amount_formatted: oppData.value_formatted || '',
    date_won: oppData.date_won || '',
    sales_rep: oppData.user_name || '',
    sales_rep_id: oppData.user_id || '',
    confidence: oppData.confidence || 0,
    note: oppData.note || '',
    created_by: oppData.created_by_name || '',
    updated_by: oppData.updated_by_name || '',
    processed_at: new Date().toISOString(),
    workflow_run_id: executionId || '',
    has_opportunity: opportunities.length > 0,
    _lead_data: leadData,
    _opportunity_data: oppData,
  };
}

/**
 * Normalises and validates an email address.
 * Mirrors the n8n "Validate Email2" code node.
 *
 * @returns {{ email: string, valid: boolean, error: string|null }}
 */
function validateEmail(rawEmail) {
  const email = (rawEmail || '').trim().toLowerCase();
  const EMAIL_RE = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const valid = EMAIL_RE.test(email);
  return {
    email,
    valid,
    error: valid ? null : `Invalid or missing email: "${rawEmail || '(empty)'}"`,
  };
}

/**
 * Formats a phone number to E.164 format as required by Intercom.
 * Mirrors the phone-formatting logic in the n8n "Format for Intercom2" node.
 *
 * Returns null if the number can't be reliably formatted.
 */
function formatPhoneE164(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return '+1' + digits;
  if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
  if (digits.length > 11) return '+' + digits;
  return null;
}

/**
 * Returns the current date/time formatted as "DD-MM-YYYY HH:mm"
 * (used for the Airtable "Last Updated" field).
 */
function formatNow() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

module.exports = {
  parseLeadDataFromWebhook,
  parseAndMergeOpportunityData,
  validateEmail,
  formatPhoneE164,
  formatNow,
};
