const { apiCall } = require('./api-client');
const config = require('./config');

// Note: Calendar creation requires at least one team member (user) assigned.
// If no users exist, calendars must be created manually after adding team members.

const CALENDARS = [
  {
    name: '[Modern Amenities] - Calendar - Discovery Call',
    description: 'A free 30-minute consultation to discuss your needs and explore how we can help.',
    slotDuration: 30,
    slotBuffer: 15,
    calendarType: 'personal',
    appoinmentPerDay: 8,
    appoinmentPerSlot: 1,
  },
  {
    name: '[Modern Amenities] - Calendar - Strategy / Consultation Call',
    description: 'A 60-minute in-depth strategy session to explore your business goals and create an action plan.',
    slotDuration: 60,
    slotBuffer: 15,
    calendarType: 'personal',
    appoinmentPerDay: 4,
    appoinmentPerSlot: 1,
  },
  {
    name: '[Modern Amenities] - Calendar - Group / Class / Webinar Booking',
    description: 'Group event calendar for webinars, classes, and group sessions.',
    slotDuration: 60,
    slotBuffer: 0,
    calendarType: 'class_booking',
    appoinmentPerDay: 3,
    appoinmentPerSlot: 20,
  },
  {
    name: '[Modern Amenities] - Calendar - Round Robin Team Calendar',
    description: 'Distributed booking across all team members with automatic assignment.',
    slotDuration: 30,
    slotBuffer: 15,
    calendarType: 'round_robin',
    appoinmentPerDay: 8,
    appoinmentPerSlot: 1,
  },
];

async function createCalendars() {
  console.log('\n=== CREATING CALENDARS ===');
  console.log(`Total calendars to create: ${CALENDARS.length}\n`);

  // First check if there are users available
  const usersRes = await apiCall('GET', `/users/?locationId=${config.LOCATION_ID}`);
  const users = usersRes.users || [];

  if (users.length === 0) {
    console.log('  ⚠️  No team members found in this location.');
    console.log('  → Calendars require at least one team member to be assigned.');
    console.log('  → Add team members in GHL first, then re-run this script.');
    console.log('  → OR create calendars manually in GHL UI.\n');
    console.log('\n  Calendar specifications for manual creation:');
    for (const cal of CALENDARS) {
      console.log(`\n  📅 ${cal.name}`);
      console.log(`     Type: ${cal.calendarType}`);
      console.log(`     Duration: ${cal.slotDuration} min | Buffer: ${cal.slotBuffer} min`);
      console.log(`     Description: ${cal.description}`);
    }
    return { created: 0, failed: CALENDARS.length, errors: ['No team members available'] };
  }

  const defaultUserId = users[0].id;
  console.log(`  Using default user: ${users[0].name || users[0].email || defaultUserId}\n`);

  const results = { created: 0, failed: 0, errors: [] };

  for (const cal of CALENDARS) {
    const body = {
      locationId: config.LOCATION_ID,
      name: cal.name,
      description: cal.description,
      slotDuration: cal.slotDuration,
      slotBuffer: cal.slotBuffer,
      calendarType: cal.calendarType,
      teamMembers: [{ userId: defaultUserId, priority: 0.5, meetingLocation: 'custom' }],
    };

    const res = await apiCall('POST', '/calendars/', body);

    if (res.error) {
      results.failed++;
      results.errors.push({ name: cal.name, error: res.message || res.error });
      console.log(`  ✗ Failed: ${cal.name} - ${res.message || res.error}`);
    } else {
      results.created++;
      console.log(`  ✓ Created: ${cal.name} (${cal.slotDuration}min, ${cal.calendarType})`);
    }
  }

  console.log(`\nCalendars: ${results.created} created, ${results.failed} failed`);
  return results;
}

module.exports = { createCalendars, CALENDARS };
