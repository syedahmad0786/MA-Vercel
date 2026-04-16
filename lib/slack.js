'use strict';

const SLACK_API_URL = 'https://slack.com/api/chat.postMessage';

/**
 * Posts a formatted alert message to the configured Slack channel.
 * Uses the same channel as the n8n workflow: student-onboarding-n8n (C0A11F18N5T).
 *
 * @param {string} text - Slack mrkdwn-formatted message text
 */
async function sendSlackMessage(text) {
  const token = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_CHANNEL_ID || 'C0A11F18N5T';

  if (!token) {
    console.error('[Slack] SLACK_BOT_TOKEN not set – skipping alert');
    return null;
  }

  try {
    const res = await fetch(SLACK_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ channel, text, mrkdwn: true }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error('[Slack] API error:', data.error);
    }
    return data;
  } catch (err) {
    console.error('[Slack] Failed to send message:', err.message);
    return null;
  }
}

// ── Pre-built alert helpers (mirror the n8n Slack nodes) ─────────────────────

/** Alert: "Required Fields not Filled – Onboarding Blocked" */
async function alertRequiredFieldsMissing({ lead_name, email, lead_id, sales_rep }) {
  const text =
    `⚠️ *Required Fields not Filled - Onboarding Blocked*\n\n` +
    `*Client:* ${lead_name}\n` +
    `*Email:* ${email}\n` +
    `*Lead ID:* ${lead_id}\n` +
    `*Sales Rep:* ${sales_rep || 'Unknown'}\n\n` +
    `👉 Fix fields in Close CRM and retrigger workflow`;
  return sendSlackMessage(text);
}

/** Alert: "Invalid Email – Onboarding Blocked" */
async function alertInvalidEmail({ lead_name, email, lead_id }) {
  const text =
    `⚠️ *Invalid Email - Onboarding Blocked*\n\n` +
    `*Client:* ${lead_name}\n` +
    `*Email:* ${email}\n` +
    `*Lead ID:* ${lead_id}\n\n` +
    `👉 Fix email in Close CRM and retrigger workflow`;
  return sendSlackMessage(text);
}

/** Alert: "Airtable Entry Failed" */
async function alertAirtableError({ lead_name, email, lead_id, studentError, clientError }) {
  const text =
    `⚠️ *Airtable Entry Failed*\n\n` +
    `*Client:* ${lead_name}\n` +
    `*Email:* ${email}\n` +
    `*Lead ID:* ${lead_id}\n\n` +
    `*Student Table Error:* ${studentError || 'Success'}\n` +
    `*Client Table Error:* ${clientError || 'Success'}\n\n` +
    `👉 Manual entry required in Airtable`;
  return sendSlackMessage(text);
}

/** Alert: "Intercom Contact Creation Failed" */
async function alertIntercomFailed({ lead_name, email, lead_id, error }) {
  const text =
    `⚠️ *Intercom Contact Creation Failed*\n\n` +
    `*Client:* ${lead_name}\n` +
    `*Email:* ${email}\n` +
    `*Lead ID:* ${lead_id}\n\n` +
    `*Error:* ${error || 'Unknown'}\n\n` +
    `👉 Manual contact creation required in Intercom`;
  return sendSlackMessage(text);
}

/** Alert: "Mighty Networks Plan Invite Failed" */
async function alertMightyNetworksFailed({ lead_name, email, tier, error }) {
  const text =
    `⚠️ *Mighty Networks Plan Invite Failed*\n\n` +
    `*Client:* ${lead_name}\n` +
    `*Email:* ${email}\n` +
    `*Tier:* ${tier || 'Unknown'}\n\n` +
    `*Error:* ${error || 'Unknown error'}\n\n` +
    `👉 Manual plan invite required in Mighty Networks`;
  return sendSlackMessage(text);
}

module.exports = {
  sendSlackMessage,
  alertRequiredFieldsMissing,
  alertInvalidEmail,
  alertAirtableError,
  alertIntercomFailed,
  alertMightyNetworksFailed,
};
