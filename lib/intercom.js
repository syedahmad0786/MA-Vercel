'use strict';

const BASE_URL = 'https://api.intercom.io';
const INTERCOM_VERSION = '2.10';

function headers() {
  return {
    Authorization: `Bearer ${process.env.INTERCOM_API_KEY || ''}`,
    'Content-Type': 'application/json',
    'Intercom-Version': INTERCOM_VERSION,
  };
}

/**
 * Searches for an existing Intercom contact by email.
 * Mirrors the n8n "Search Intercom Contact" HTTP Request node.
 *
 * @param {string} email
 * @returns {Promise<object>}  Intercom search result { data: [...], total_count, ... }
 */
async function searchContact(email) {
  const res = await fetch(`${BASE_URL}/contacts/search`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      query: { field: 'email', operator: '=', value: email },
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[Intercom] searchContact HTTP ${res.status}: ${body}`);
  }
  return res.json();
}

/**
 * Creates a new Intercom contact.
 * Mirrors the n8n "Create Intercom Contact2" HTTP Request node.
 *
 * @param {object} contact - { role, email, name, external_id, phone? }
 */
async function createContact(contact) {
  const res = await fetch(`${BASE_URL}/contacts`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(contact),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[Intercom] createContact HTTP ${res.status}: ${body}`);
  }
  return res.json();
}

/**
 * Updates an existing Intercom contact by its internal ID.
 * Mirrors the n8n "Update Intercom Contact" HTTP Request node.
 *
 * @param {string} contactId  - Intercom's internal contact ID
 * @param {object} updates    - fields to update (role, name, phone, external_id)
 */
async function updateContact(contactId, updates) {
  const res = await fetch(`${BASE_URL}/contacts/${contactId}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(updates),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[Intercom] updateContact HTTP ${res.status}: ${body}`);
  }
  return res.json();
}

/**
 * Upserts an Intercom contact: updates if the email already exists, creates
 * otherwise.  Mirrors the "Search → Check Existing → Update/Create" branch of
 * the n8n workflow.
 *
 * @param {{ email, name, lead_id, phone }} contactData
 * @param {Function} formatPhoneE164 - phone formatter from parsers.js
 * @returns {{ contact: object, wasCreated: boolean }}
 */
async function upsertContact(contactData, formatPhoneE164) {
  const { email, lead_name: name, lead_id, phone } = contactData;

  const payload = {
    role: 'user',
    email,
    name,
    external_id: lead_id,
  };

  const formattedPhone = formatPhoneE164(phone);
  if (formattedPhone) payload.phone = formattedPhone;

  // Search for existing contact
  const searchResult = await searchContact(email);
  const existingContacts = searchResult.data || [];

  if (existingContacts.length > 0) {
    const existing = existingContacts[0];
    // Update the existing contact (keep email, update the rest)
    const updated = await updateContact(existing.id, {
      role: 'user',
      name: payload.name,
      ...(payload.phone ? { phone: payload.phone } : {}),
      external_id: payload.external_id,
    });
    return { contact: updated, wasCreated: false };
  }

  const created = await createContact(payload);
  return { contact: created, wasCreated: true };
}

module.exports = { searchContact, createContact, updateContact, upsertContact };
