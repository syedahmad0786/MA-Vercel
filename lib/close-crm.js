'use strict';

const BASE_URL = 'https://api.close.com/api/v1';

/** Close CRM uses HTTP Basic Auth: API key as username, empty password. */
function authHeader() {
  const key = process.env.CLOSE_CRM_API_KEY || '';
  return 'Basic ' + Buffer.from(`${key}:`).toString('base64');
}

/**
 * Fetches all opportunities for a given lead ID from the Close CRM API.
 * Mirrors the n8n "Fetch Opportunity Data1" HTTP Request node.
 * Retries up to 3 times with 1 s delay between attempts.
 *
 * @param {string} leadId
 * @returns {Promise<object>}  - { data: [opportunity, ...], ... }
 */
async function fetchOpportunities(leadId) {
  const url = `${BASE_URL}/opportunity/?lead_id=${encodeURIComponent(leadId)}&_fields=_all`;

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status}: ${body}`);
      }

      return res.json();
    } catch (err) {
      lastError = err;
      if (attempt < 3) await sleep(1000);
    }
  }

  throw new Error(`[Close CRM] fetchOpportunities failed after 3 attempts: ${lastError.message}`);
}

/**
 * Updates a lead's custom fields in Close CRM.
 * Mirrors the n8n "Update Close CRM with Airtable ID" HTTP Request node.
 *
 * The custom field for the Airtable client record ID is:
 *   cf_oWqFXQI9a7ulgYdQqoIVl8ohKe4wXA152heRPri0vj7
 *
 * @param {string} leadId
 * @param {string} airtableClientId  - Airtable record ID to store on the lead
 */
async function updateLeadWithAirtableId(leadId, airtableClientId) {
  const url = `${BASE_URL}/lead/${leadId}/`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      'custom.cf_oWqFXQI9a7ulgYdQqoIVl8ohKe4wXA152heRPri0vj7': airtableClientId,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[Close CRM] updateLead HTTP ${res.status}: ${body}`);
  }

  return res.json();
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

module.exports = { fetchOpportunities, updateLeadWithAirtableId };
