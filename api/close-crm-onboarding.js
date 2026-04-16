'use strict';

/**
 * POST /api/close-crm-onboarding
 *
 * Vercel serverless function that replicates the n8n workflow:
 * "New Student Onboarding (with Mighty Networks)"
 *
 * Flow:
 *  1. Filter: must be an opportunity event
 *  2. Filter: status must contain "Closed / Won"
 *  3. Filter: "status" must appear in changed_fields
 *  4. Fetch full opportunity data from Close CRM API
 *  5. Parse & merge all data
 *  6. Gate: trigger_cw_onboarding must equal "Yes"
 *  7. Validate email
 *  8. Create Airtable Student Onboarding record
 *  9. Create Airtable Clients record
 * 10. In parallel:
 *       a. Invite to Mighty Networks plan (tier-based)
 *       b. Upsert Intercom contact → on success update Close CRM lead
 * 11. On any failure: Slack alert + Airtable error log
 */

const { parseLeadDataFromWebhook, parseAndMergeOpportunityData, validateEmail, formatPhoneE164, formatNow } = require('../lib/parsers');
const { fetchOpportunities, updateLeadWithAirtableId } = require('../lib/close-crm');
const { createStudentRecord, createClientRecord, updateStudentMNInvite, updateClientMNInvite, logError } = require('../lib/airtable');
const { upsertContact } = require('../lib/intercom');
const { inviteToPlan } = require('../lib/mighty-networks');
const {
  alertRequiredFieldsMissing,
  alertInvalidEmail,
  alertAirtableError,
  alertIntercomFailed,
  alertMightyNetworksFailed,
} = require('../lib/slack');

// ── Unique execution ID per request ──────────────────────────────────────────

function makeExecutionId() {
  return `exec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Main handler ──────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const executionId = makeExecutionId();
  const body = req.body;

  // ── STEP 1: Filter – must be an opportunity event ───────────────────────────
  // Mirrors: "Filter: Trigger CW = Yes" (checks object_type)
  if (body?.event?.object_type !== 'opportunity') {
    console.log(`[${executionId}] Skipped – object_type is "${body?.event?.object_type}", not "opportunity"`);
    return res.status(200).json({ skipped: true, reason: 'not_opportunity' });
  }

  // ── STEP 2: Filter – status must contain "Closed / Won" ────────────────────
  // Mirrors: "Filter: Check Won Status1"
  const statusLabel = body.event?.data?.status_label || '';
  if (!statusLabel.includes('Closed / Won')) {
    console.log(`[${executionId}] Skipped – status "${statusLabel}" is not Closed/Won`);
    return res.status(200).json({ skipped: true, reason: 'not_closed_won' });
  }

  // ── STEP 3: Filter – "status" must be in changed_fields ────────────────────
  // Mirrors: "Check Status Changed"
  const changedFields = body.event?.changed_fields || [];
  const statusChanged = changedFields.join(',').includes('status');
  if (!statusChanged) {
    console.log(`[${executionId}] Skipped – status field not changed`);
    return res.status(200).json({ skipped: true, reason: 'status_not_changed' });
  }

  // ── STEP 4: Parse webhook payload ──────────────────────────────────────────
  // Mirrors: "Parse Lead Data from Webhook1"
  const leadData = parseLeadDataFromWebhook(body);
  const leadId = leadData.lead_id;

  if (!leadId) {
    console.error(`[${executionId}] No lead_id found in webhook payload`);
    return res.status(400).json({ error: 'missing_lead_id' });
  }

  // ── STEP 5: Fetch full opportunity data from Close CRM ─────────────────────
  // Mirrors: "Fetch Opportunity Data1" (retries 3×, 1 s apart)
  let fetchResult;
  try {
    fetchResult = await fetchOpportunities(leadId);
  } catch (err) {
    console.error(`[${executionId}] Close CRM fetch failed:`, err.message);
    return res.status(502).json({ error: 'close_crm_fetch_failed', detail: err.message });
  }

  // ── STEP 6: Parse & merge opportunity data ─────────────────────────────────
  // Mirrors: "Parse & Merge Opportunity Data1"
  const d = parseAndMergeOpportunityData(leadData, fetchResult, executionId);

  console.log(`[${executionId}] Processing lead: ${d.lead_name} (${d.lead_id})`);

  // ── STEP 7: Gate – trigger_cw_onboarding must equal "Yes" ─────────────────
  // Mirrors: "Filter: Check Trigger CW"
  if (d.trigger_cw_onboarding !== 'Yes') {
    console.log(`[${executionId}] Trigger CW = "${d.trigger_cw_onboarding}" – logging error and stopping`);

    await Promise.all([
      logError({
        lead_id: d.lead_id,
        lead_name: d.lead_name,
        email: d.email,
        error_type: 'Close CRM Fields Empty',
        error_message: `trigger_cw_onboarding = "${d.trigger_cw_onboarding}" (expected "Yes")`,
        error_node: 'Filter: Check Trigger CW',
        execution_id: executionId,
      }),
      alertRequiredFieldsMissing({
        lead_name: d.lead_name,
        email: d.email,
        lead_id: d.lead_id,
        sales_rep: d.sales_rep,
      }),
    ]);

    return res.status(200).json({ skipped: true, reason: 'trigger_cw_not_yes' });
  }

  // ── STEP 8: Validate email ─────────────────────────────────────────────────
  // Mirrors: "Validate Email2" → "Switch"
  const emailCheck = validateEmail(d.email);
  d.email = emailCheck.email; // normalised (trimmed, lowercased)

  if (!emailCheck.valid) {
    console.log(`[${executionId}] Invalid email "${d.email}" – alerting and stopping`);

    await Promise.all([
      alertInvalidEmail({ lead_name: d.lead_name, email: d.email, lead_id: d.lead_id }),
      logError({
        lead_id: d.lead_id,
        lead_name: d.lead_name,
        email: d.email,
        error_type: 'Email Validation',
        error_message: emailCheck.error,
        error_node: 'Validate Email2',
        execution_id: executionId,
      }),
    ]);

    return res.status(200).json({ skipped: true, reason: 'invalid_email' });
  }

  // ── STEP 9: Create Airtable Student Onboarding record ─────────────────────
  // Mirrors: "Create Airtable Student Record2"
  let studentRecord = null;
  let studentError = null;
  try {
    studentRecord = await createStudentRecord(d, formatNow());
    console.log(`[${executionId}] Airtable student record created: ${studentRecord.id}`);
  } catch (err) {
    studentError = err.message;
    console.error(`[${executionId}] Student record creation failed:`, err.message);
  }

  // ── STEP 10: Create Airtable Clients record ────────────────────────────────
  // Mirrors: "Create Airtable Client Record2"
  let clientRecord = null;
  let clientError = null;
  try {
    clientRecord = await createClientRecord(d);
    console.log(`[${executionId}] Airtable client record created: ${clientRecord.id}`);
  } catch (err) {
    clientError = err.message;
    console.error(`[${executionId}] Client record creation failed:`, err.message);
  }

  // ── STEP 11: Check Airtable success ───────────────────────────────────────
  // Mirrors: "If" node checking $('Create Airtable Student Record2').item.json.id
  if (!studentRecord?.id) {
    console.error(`[${executionId}] Airtable student record missing – alerting`);

    await Promise.all([
      alertAirtableError({
        lead_name: d.lead_name,
        email: d.email,
        lead_id: d.lead_id,
        studentError,
        clientError,
      }),
      logError({
        lead_id: d.lead_id,
        lead_name: d.lead_name,
        email: d.email,
        error_type: 'Airtable Student Record',
        error_message: studentError || 'Student record was not created',
        error_node: 'Create Airtable Student Record2',
        execution_id: executionId,
      }),
    ]);

    return res.status(200).json({ error: 'airtable_student_record_failed' });
  }

  // ── STEP 12: Run MN invite + Intercom in parallel ─────────────────────────
  // Mirrors: the parallel branch after the "If" true output
  const [mnResult, intercomResult] = await Promise.allSettled([
    handleMightyNetworks(d, studentRecord.id, executionId),
    handleIntercom(d, clientRecord, executionId),
  ]);

  if (mnResult.status === 'rejected') {
    console.error(`[${executionId}] MN branch threw unexpectedly:`, mnResult.reason);
  }
  if (intercomResult.status === 'rejected') {
    console.error(`[${executionId}] Intercom branch threw unexpectedly:`, intercomResult.reason);
  }

  console.log(`[${executionId}] Onboarding workflow completed for ${d.lead_name}`);
  return res.status(200).json({ success: true, lead_id: d.lead_id, execution_id: executionId });
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-workflows
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Handles the Mighty Networks invite branch.
 * Mirrors: "Invite to MN Plan" → "Check MN Plan Success" →
 *          Update Student + Update Client + Update Student MN Plan
 *       or "Alert: MN Plan Failed" → "Log MN Plan Error"
 */
async function handleMightyNetworks(d, studentRecordId, executionId) {
  const tier = d._opportunity_data?.lead_custom?.['*Program Tier Purchased (N)'] || '';

  let mnResponse;
  try {
    mnResponse = await inviteToPlan(d.email, tier);
  } catch (err) {
    console.error(`[${executionId}] MN invite fetch error:`, err.message);
    await Promise.all([
      alertMightyNetworksFailed({ lead_name: d.lead_name, email: d.email, tier, error: err.message }),
      logError({
        lead_id: d.lead_id,
        lead_name: d.lead_name,
        email: d.email,
        error_type: 'Unknown',
        error_message: `MN Plan Invite Error: ${err.message}`,
        error_node: 'Invite to MN Plan',
        execution_id: executionId,
      }),
    ]);
    return;
  }

  // Mirrors: "Check MN Plan Success" – statusCode must equal 200
  if (mnResponse.statusCode !== 200) {
    const errMsg = JSON.stringify(mnResponse.body);
    console.error(`[${executionId}] MN invite returned status ${mnResponse.statusCode}:`, errMsg);

    await Promise.all([
      alertMightyNetworksFailed({ lead_name: d.lead_name, email: d.email, tier, error: errMsg }),
      logError({
        lead_id: d.lead_id,
        lead_name: d.lead_name,
        email: d.email,
        error_type: 'Unknown',
        error_message: `MN Plan Invite Error: HTTP ${mnResponse.statusCode} – ${errMsg}`,
        error_node: 'Invite to MN Plan',
        execution_id: executionId,
      }),
    ]);
    return;
  }

  // Success – update both Airtable records in parallel
  // Mirrors: "Update Airtable: MN Invite Status" + "Update Client: MN Invite Status"
  //          + "Update Student: MN Plan" (all run in parallel in n8n)
  const mnInviteId = mnResponse.body?.id || '';
  console.log(`[${executionId}] MN invite success – invite ID: ${mnInviteId}`);

  await Promise.allSettled([
    updateStudentMNInvite(studentRecordId, mnInviteId, tier).catch((err) =>
      console.error(`[${executionId}] updateStudentMNInvite failed:`, err.message)
    ),
    updateClientMNInvite(d.email, mnInviteId).catch((err) =>
      console.error(`[${executionId}] updateClientMNInvite failed:`, err.message)
    ),
  ]);
}

/**
 * Handles the Intercom contact upsert branch.
 * Mirrors: "Format for Intercom2" → "Search Intercom Contact" →
 *          "Check Existing Contact" → Update or Create →
 *          "Check Intercom Success" → "Update Close CRM with Airtable ID"
 *       or "Alert: Intercom Failed" → "Log Error to Airtable1"
 */
async function handleIntercom(d, clientRecord, executionId) {
  let intercomContact;
  try {
    const result = await upsertContact(d, formatPhoneE164);
    intercomContact = result.contact;
    console.log(`[${executionId}] Intercom contact ${result.wasCreated ? 'created' : 'updated'}: ${intercomContact?.id}`);
  } catch (err) {
    console.error(`[${executionId}] Intercom upsert failed:`, err.message);

    await Promise.all([
      alertIntercomFailed({ lead_name: d.lead_name, email: d.email, lead_id: d.lead_id, error: err.message }),
      logError({
        lead_id: d.lead_id,
        lead_name: d.lead_name,
        email: d.email,
        error_type: 'Intercom Contact',
        error_message: err.message,
        error_node: 'Create / Update Intercom Contact',
        execution_id: executionId,
      }),
    ]);
    return;
  }

  // Mirrors: "Check Intercom Success" – contact must have an id
  if (!intercomContact?.id) {
    const errMsg = `Intercom returned contact without id: ${JSON.stringify(intercomContact)}`;
    console.error(`[${executionId}]`, errMsg);

    await Promise.all([
      alertIntercomFailed({ lead_name: d.lead_name, email: d.email, lead_id: d.lead_id, error: errMsg }),
      logError({
        lead_id: d.lead_id,
        lead_name: d.lead_name,
        email: d.email,
        error_type: 'Intercom Contact',
        error_message: errMsg,
        error_node: 'Check Intercom Success',
        execution_id: executionId,
      }),
    ]);
    return;
  }

  // Mirrors: "Update Close CRM with Airtable ID"
  // The Airtable Client record ID is written back to the Close CRM lead
  const airtableClientId = clientRecord?.fields?.['Client ID*'] || clientRecord?.id || '';
  if (airtableClientId) {
    try {
      await updateLeadWithAirtableId(d.lead_id, airtableClientId);
      console.log(`[${executionId}] Close CRM lead updated with Airtable ID: ${airtableClientId}`);
    } catch (err) {
      // Non-fatal – log but don't alert
      console.error(`[${executionId}] Close CRM update failed:`, err.message);
    }
  }
}
