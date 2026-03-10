const { apiCall } = require('./api-client');
const config = require('./config');

const TAGS = [
  // Source Tags
  '[Modern Amenities] - Tag - Source - Facebook',
  '[Modern Amenities] - Tag - Source - Instagram',
  '[Modern Amenities] - Tag - Source - Google',
  '[Modern Amenities] - Tag - Source - Organic Website',
  '[Modern Amenities] - Tag - Source - Referral',
  '[Modern Amenities] - Tag - Source - Cold Outreach',
  '[Modern Amenities] - Tag - Source - Missed Call',
  '[Modern Amenities] - Tag - Source - After Hours Missed Call',
  '[Modern Amenities] - Tag - Source - Form Submit',
  '[Modern Amenities] - Tag - Source - Affiliate',
  '[Modern Amenities] - Tag - Source - Event / Webinar',

  // Status Tags
  '[Modern Amenities] - Tag - Status - Lead Received',
  '[Modern Amenities] - Tag - Status - No Reply',
  '[Modern Amenities] - Tag - Status - Cold Lead',
  '[Modern Amenities] - Tag - Status - Engaged',
  '[Modern Amenities] - Tag - Status - Qualified',
  '[Modern Amenities] - Tag - Status - Appointment Booked',
  '[Modern Amenities] - Tag - Status - Appointment Showed',
  '[Modern Amenities] - Tag - Status - No Show',
  '[Modern Amenities] - Tag - Status - Appointment Cancelled',
  '[Modern Amenities] - Tag - Status - Active Client',
  '[Modern Amenities] - Tag - Status - Lost Deal',
  '[Modern Amenities] - Tag - Status - Reactivation Eligible',
  '[Modern Amenities] - Tag - Status - Dormant Lead',
  '[Modern Amenities] - Tag - Status - After Hours Inquiry',
  '[Modern Amenities] - Tag - Status - DNC / Opted Out',
  '[Modern Amenities] - Tag - Status - Upsell Candidate',
  '[Modern Amenities] - Tag - Status - Invoice Sent',
  '[Modern Amenities] - Tag - Status - AI Qualified',
  '[Modern Amenities] - Tag - Status - No Reply After Instant',
  '[Modern Amenities] - Tag - Status - Archive',

  // Review Tags
  '[Modern Amenities] - Tag - Review - Clicked',
  '[Modern Amenities] - Tag - Review - Submitted',
  '[Modern Amenities] - Tag - Review - Negative Feedback',
  '[Modern Amenities] - Tag - Review - Testimonial Approved',

  // Membership & SaaS Tags (Phase 3)
  '[Modern Amenities] - Tag - Status - Member',
  '[Modern Amenities] - Tag - Status - SaaS Trial',
  '[Modern Amenities] - Tag - Status - SaaS Paying',
  '[Modern Amenities] - Tag - Status - SaaS Churned',

  // Additional tags referenced in workflows
  '[Modern Amenities] - Tag - Status - Reactivated',
  '[Modern Amenities] - Tag - Status - Archived',
  '[Modern Amenities] - Tag - Referral - Intent',
  '[Modern Amenities] - Tag - Webinar - Attended',
];

async function createTags() {
  console.log('\n=== CREATING TAGS ===');
  console.log(`Total tags to create: ${TAGS.length}\n`);

  const results = { created: 0, failed: 0, errors: [] };

  for (const tagName of TAGS) {
    const res = await apiCall('POST', `/locations/${config.LOCATION_ID}/tags`, {
      name: tagName,
    });

    if (res.error) {
      results.failed++;
      results.errors.push({ name: tagName, error: res.message || res.error });
      console.log(`  ✗ Failed: ${tagName} - ${res.message || res.error}`);
    } else {
      results.created++;
      console.log(`  ✓ Created: ${tagName}`);
    }
  }

  console.log(`\nTags: ${results.created} created, ${results.failed} failed`);
  return results;
}

module.exports = { createTags };
