#!/usr/bin/env node

/**
 * Modern Amenities Solutions - GHL Snapshot Builder
 *
 * This script creates all API-supported assets in GoHighLevel:
 * - Custom Values (50+)
 * - Custom Fields (31)
 * - Tags (40+)
 * - Pipelines (4) - requires opportunities.write scope
 * - Calendars (4) - requires team members
 *
 * Assets that CANNOT be created via API and require manual build:
 * - Workflows/Automations (28)
 * - Forms & Surveys (7)
 * - Funnels & Landing Pages (10)
 * - Email Templates (46)
 * - SMS Templates (42)
 * - Trigger Links (6)
 * - Website Pages (7)
 * - Chat Widget (1)
 * - Smart Lists (15)
 * - Reporting Dashboards (3)
 * - Memberships/Courses (6)
 * - Voicemail Scripts (2)
 * - Social Post Templates (4)
 *
 * See MANUAL_BUILD_GUIDE.md for detailed instructions on manual assets.
 */

const { createCustomValues } = require('./create-custom-values');
const { createCustomFields } = require('./create-custom-fields');
const { createTags } = require('./create-tags');
const { createPipelines } = require('./create-pipelines');
const { createCalendars } = require('./create-calendars');
const config = require('./config');

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   Modern Amenities Solutions - GHL Snapshot Builder     ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Location ID: ${config.LOCATION_ID.padEnd(40)} ║`);
  console.log(`║  API Base:    ${config.BASE_URL.padEnd(40)} ║`);
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const summary = {};

  try {
    // Phase 1: Custom Values (foundation for everything else)
    summary.customValues = await createCustomValues();

    // Phase 2: Custom Fields
    summary.customFields = await createCustomFields();

    // Phase 3: Tags
    summary.tags = await createTags();

    // Phase 4: Pipelines
    summary.pipelines = await createPipelines();

    // Phase 5: Calendars
    summary.calendars = await createCalendars();

  } catch (err) {
    console.error('\n❌ Fatal error:', err.message);
    console.error(err.stack);
  }

  // Final Summary
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║              FINAL BUILD SUMMARY                        ║');
  console.log('╠══════════════════════════════════════════════════════════╣');

  let totalCreated = 0;
  let totalFailed = 0;

  for (const [category, result] of Object.entries(summary)) {
    if (result) {
      totalCreated += result.created || 0;
      totalFailed += result.failed || 0;
      const status = result.failed === 0 ? '✓' : '⚠';
      console.log(`║  ${status} ${category.padEnd(20)} Created: ${String(result.created).padEnd(4)} Failed: ${String(result.failed).padEnd(4)} ║`);
    }
  }

  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  TOTAL API ASSETS:  ${String(totalCreated).padEnd(4)} created  |  ${String(totalFailed).padEnd(4)} failed       ║`);
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log('║                                                          ║');
  console.log('║  REMAINING MANUAL BUILD ITEMS:                           ║');
  console.log('║  • 28 Workflows/Automations                              ║');
  console.log('║  • 7  Forms & Surveys                                    ║');
  console.log('║  • 10 Funnels & Landing Pages                            ║');
  console.log('║  • 46 Email Templates                                    ║');
  console.log('║  • 42 SMS Templates                                      ║');
  console.log('║  • 6  Trigger Links                                      ║');
  console.log('║  • 7  Website Pages                                      ║');
  console.log('║  • 1  Chat Widget                                        ║');
  console.log('║  • 15 Smart Lists                                        ║');
  console.log('║  • 3  Reporting Dashboards                                ║');
  console.log('║  • 6  Memberships/Courses                                 ║');
  console.log('║  • 2  Voicemail Scripts                                   ║');
  console.log('║  • 4  Social Post Templates                               ║');
  console.log('║                                                          ║');
  console.log('║  See MANUAL_BUILD_GUIDE.md for complete instructions.    ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
}

main().catch(console.error);
