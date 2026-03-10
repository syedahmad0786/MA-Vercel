const { apiCall } = require('./api-client');
const config = require('./config');

const CONTACT_FIELDS = [
  // FOLDER: Contact - Lead Data
  {
    name: 'Lead Source',
    dataType: 'SINGLE_OPTIONS',
    model: 'contact',
    options: ['Facebook', 'Google', 'Instagram', 'Referral', 'Organic Website', 'Cold Outreach', 'Webinar', 'Other'],
  },
  { name: 'Lead Source Date', dataType: 'DATE', model: 'contact' },
  {
    name: 'Best Contact Time',
    dataType: 'SINGLE_OPTIONS',
    model: 'contact',
    options: ['Morning (8-12)', 'Afternoon (12-5)', 'Evening (5-8)'],
  },
  { name: 'Biggest Challenge', dataType: 'LARGE_TEXT', model: 'contact' },
  {
    name: 'Budget Range',
    dataType: 'SINGLE_OPTIONS',
    model: 'contact',
    options: ['Under $500', '$500-$1K', '$1K-$5K', '$5K-$10K', '$10K+'],
  },
  {
    name: 'Timeline',
    dataType: 'SINGLE_OPTIONS',
    model: 'contact',
    options: ['Immediately', 'Within 1 month', '1-3 months', '3-6 months', 'Just researching'],
  },
  { name: 'Business Type', dataType: 'TEXT', model: 'contact' },
  {
    name: 'DNC Status',
    dataType: 'SINGLE_OPTIONS',
    model: 'contact',
    options: ['No', 'Yes'],
  },
  { name: 'Engagement Score', dataType: 'NUMERICAL', model: 'contact' },
  { name: 'Affiliate ID', dataType: 'TEXT', model: 'contact' },

  // FOLDER: Contact - Client Data (populated after Won)
  { name: 'Client Business Name', dataType: 'TEXT', model: 'contact' },
  { name: 'Client Website', dataType: 'TEXT', model: 'contact' },
  { name: 'Client Business Phone', dataType: 'PHONE', model: 'contact' },
  { name: 'Client Address', dataType: 'LARGE_TEXT', model: 'contact' },
  { name: 'Primary Goal', dataType: 'LARGE_TEXT', model: 'contact' },
  { name: 'Ideal Customer Description', dataType: 'LARGE_TEXT', model: 'contact' },
  { name: 'Offer Description', dataType: 'LARGE_TEXT', model: 'contact' },
  { name: 'Competitor Names', dataType: 'LARGE_TEXT', model: 'contact' },
  { name: 'Birthday', dataType: 'DATE', model: 'contact' },
  { name: 'Anniversary Date', dataType: 'DATE', model: 'contact' },

  // FOLDER: Contact - Review & Feedback
  { name: 'Last Review Date', dataType: 'DATE', model: 'contact' },
  { name: 'Review Rating', dataType: 'NUMERICAL', model: 'contact' },
  { name: 'NPS Score', dataType: 'NUMERICAL', model: 'contact' },
];

const OPPORTUNITY_FIELDS = [
  // FOLDER: Opportunity - Deal Data
  {
    name: 'Service Type Requested',
    dataType: 'SINGLE_OPTIONS',
    model: 'opportunity',
    options: ['Consult', 'Implementation', 'Retainer', 'One-Time Project', 'Other'],
  },
  {
    name: 'Lost Reason',
    dataType: 'SINGLE_OPTIONS',
    model: 'opportunity',
    options: ['Price', 'Competitor', 'Timing', 'No decision', 'Ghosted', 'Budget cut', 'Other'],
  },
  { name: 'Proposal Link', dataType: 'TEXT', model: 'opportunity' },
  { name: 'Commission Amount', dataType: 'MONETORY', model: 'opportunity' },
  { name: 'Invoice Number', dataType: 'TEXT', model: 'opportunity' },
  { name: 'Invoice Link', dataType: 'TEXT', model: 'opportunity' },
  { name: 'Referrer Name', dataType: 'TEXT', model: 'opportunity' },
  { name: 'Referral Reason', dataType: 'LARGE_TEXT', model: 'opportunity' },
];

async function createCustomFields() {
  console.log('\n=== CREATING CUSTOM FIELDS ===');
  const allFields = [...CONTACT_FIELDS, ...OPPORTUNITY_FIELDS];
  console.log(`Total custom fields to create: ${allFields.length}\n`);

  const results = { created: 0, failed: 0, errors: [] };

  for (const field of allFields) {
    const body = {
      name: field.name,
      dataType: field.dataType,
      model: field.model,
    };
    if (field.options) {
      body.options = field.options;
    }

    const res = await apiCall('POST', `/locations/${config.LOCATION_ID}/customFields`, body);

    if (res.error) {
      results.failed++;
      results.errors.push({ name: field.name, error: res.message || res.error });
      console.log(`  ✗ Failed: ${field.name} (${field.model}) - ${res.message || res.error}`);
    } else {
      results.created++;
      console.log(`  ✓ Created: ${field.name} (${field.model}) → ${res.customField?.fieldKey || 'OK'}`);
    }
  }

  console.log(`\nCustom Fields: ${results.created} created, ${results.failed} failed`);
  return results;
}

module.exports = { createCustomFields };
