const { apiCall } = require('./api-client');
const config = require('./config');

const PIPELINES = [
  // 1.1 Main Sales Pipeline
  {
    name: '[Modern Amenities] - Pipeline - Main Sales Pipeline',
    stages: [
      { name: 'New Lead', position: 0 },
      { name: 'Contacted - Attempt 1', position: 1 },
      { name: 'Contacted - Attempt 2', position: 2 },
      { name: 'Contacted - Attempt 3', position: 3 },
      { name: 'Qualified', position: 4 },
      { name: 'Appointment Scheduled', position: 5 },
      { name: 'Appointment Showed', position: 6 },
      { name: 'Proposal / Quote Sent', position: 7 },
      { name: 'Negotiation / Follow-Up', position: 8 },
      { name: 'Won', position: 9 },
      { name: 'Lost', position: 10 },
      { name: 'Nurture / Long-Term', position: 11 },
    ],
  },
  // 1.2 Appointment Pipeline
  {
    name: '[Modern Amenities] - Pipeline - Appointment Pipeline',
    stages: [
      { name: 'Booked', position: 0 },
      { name: 'Confirmed', position: 1 },
      { name: 'Reminded', position: 2 },
      { name: 'Showed', position: 3 },
      { name: 'No Show', position: 4 },
      { name: 'Cancelled', position: 5 },
      { name: 'Rescheduled', position: 6 },
    ],
  },
  // 1.3 Onboarding Pipeline
  {
    name: '[Modern Amenities] - Pipeline - Onboarding Pipeline',
    stages: [
      { name: 'New Client', position: 0 },
      { name: 'Onboarding Email Sent', position: 1 },
      { name: 'Intake Form Completed', position: 2 },
      { name: 'Kickoff Call Scheduled', position: 3 },
      { name: 'Kickoff Call Completed', position: 4 },
      { name: 'Active Client', position: 5 },
      { name: 'Offboarding', position: 6 },
    ],
  },
  // 1.4 Referral & Upsell Pipeline (Phase 2)
  {
    name: '[Modern Amenities] - Pipeline - Referral & Upsell Pipeline',
    stages: [
      { name: 'Referral Received', position: 0 },
      { name: 'Referral Contacted', position: 1 },
      { name: 'Upsell Identified', position: 2 },
      { name: 'Upsell Offer Sent', position: 3 },
      { name: 'Upsell Won', position: 4 },
      { name: 'Upsell Lost', position: 5 },
    ],
  },
];

async function createPipelines() {
  console.log('\n=== CREATING PIPELINES ===');
  console.log(`Total pipelines to create: ${PIPELINES.length}\n`);

  const results = { created: 0, failed: 0, errors: [], pipelineIds: {} };

  for (const pipeline of PIPELINES) {
    const res = await apiCall('POST', '/opportunities/pipelines', {
      locationId: config.LOCATION_ID,
      name: pipeline.name,
      stages: pipeline.stages,
    });

    if (res.error) {
      results.failed++;
      results.errors.push({ name: pipeline.name, error: res.message || res.error });
      console.log(`  ✗ Failed: ${pipeline.name} - ${res.message || res.error}`);
      if (res.message && res.message.includes('not authorized')) {
        console.log(`    → Your PIT token needs the 'opportunities.write' scope enabled`);
        console.log(`    → Go to GHL Settings > Private Integrations > Edit > Enable Opportunities scope`);
      }
    } else {
      results.created++;
      const pipelineId = res.pipeline?.id || res.id;
      results.pipelineIds[pipeline.name] = pipelineId;
      console.log(`  ✓ Created: ${pipeline.name} (${pipeline.stages.length} stages)`);
    }
  }

  console.log(`\nPipelines: ${results.created} created, ${results.failed} failed`);
  if (results.failed > 0) {
    console.log('\n⚠️  PIPELINE CREATION REQUIRES MANUAL STEPS:');
    console.log('   Option 1: Enable "Opportunities" scope in your Private Integration token');
    console.log('   Option 2: Create pipelines manually in GHL UI using the specs above');
  }
  return results;
}

module.exports = { createPipelines, PIPELINES };
