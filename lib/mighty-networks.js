'use strict';

const BASE_URL = 'https://api.mn.co';

/**
 * Returns the Mighty Networks plan ID to invite the student into, based on
 * their program tier.  Mirrors the URL expression in the n8n "Invite to MN Plan"
 * node:
 *
 *   Gold or Platinum tier → plan 1960485
 *   Everything else       → plan 1960487
 */
function resolvePlanId(tier) {
  const GOLD_PLATINUM = ['gold', 'platinum'];
  const tierLower = (tier || '').toLowerCase();
  const isGoldPlatinum = GOLD_PLATINUM.some((t) => tierLower.startsWith(t));

  return isGoldPlatinum
    ? process.env.MIGHTY_NETWORKS_GOLD_PLATINUM_PLAN_ID || '1960485'
    : process.env.MIGHTY_NETWORKS_STANDARD_PLAN_ID || '1960487';
}

/**
 * Sends a Mighty Networks plan invite for the given email address.
 * Mirrors the n8n "Invite to MN Plan" HTTP Request node.
 *
 * The n8n node uses "genericCredentialType: httpHeaderAuth", which means a
 * custom Authorization header.  Set MIGHTY_NETWORKS_AUTH in .env to the full
 * header value, e.g. "Token abc123" or "Bearer abc123".
 *
 * @param {string} email  - email to invite
 * @param {string} tier   - program tier (determines which plan to invite into)
 * @returns {Promise<{ statusCode: number, body: object }>}
 */
async function inviteToPlan(email, tier) {
  const networkId = process.env.MIGHTY_NETWORKS_NETWORK_ID || '21685656';
  const planId = resolvePlanId(tier);
  const authValue = process.env.MIGHTY_NETWORKS_AUTH || '';

  const url = `${BASE_URL}/admin/v1/networks/${networkId}/plans/${planId}/invites?email=${encodeURIComponent(email)}`;

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: authValue,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(20_000),
    });
  } catch (err) {
    throw new Error(`[MightyNetworks] fetch error: ${err.message}`);
  }

  let body = {};
  try {
    body = await res.json();
  } catch {
    body = {};
  }

  return { statusCode: res.status, body };
}

module.exports = { inviteToPlan, resolvePlanId };
