const { apiCall } = require('./api-client');
const config = require('./config');

const CUSTOM_VALUES = [
  // FOLDER: Business Identity
  { name: 'Business Name', value: 'Your Business Name' },
  { name: 'Owner Name', value: 'Your Name' },
  { name: 'Business Phone', value: '+1-000-000-0000' },
  { name: 'Business Email', value: 'info@yourbusiness.com' },
  { name: 'Business Address', value: '123 Main St, City, State, ZIP' },
  { name: 'Business Logo URL', value: 'https://yourbusiness.com/logo.png' },
  { name: 'Tagline', value: 'Your value proposition here' },
  { name: 'Service Category', value: 'Your primary service' },

  // FOLDER: Links & URLs
  { name: 'Website URL', value: 'https://yourbusiness.com' },
  { name: 'Booking Link', value: 'https://yourbusiness.com/book' },
  { name: 'Kickoff Calendar Link', value: 'https://yourbusiness.com/kickoff' },
  { name: 'Reschedule Link', value: 'https://yourbusiness.com/reschedule' },
  { name: 'Intake Form Link', value: 'https://yourbusiness.com/intake' },
  { name: 'Meeting Link or Address', value: 'https://zoom.us/your-link' },
  { name: 'Google Review Link', value: 'https://g.page/yourbusiness/review' },
  { name: 'Client Portal URL', value: 'https://yourbusiness.com/portal' },
  { name: 'Membership Login URL', value: 'https://yourbusiness.com/members' },
  { name: 'SaaS Login URL', value: 'https://app.yoursaas.com/login' },
  { name: 'Upgrade Payment Link', value: 'https://yourbusiness.com/upgrade' },
  { name: 'Webinar Link', value: 'https://zoom.us/webinar-link' },
  { name: 'Webinar Replay URL', value: 'https://yourbusiness.com/replay' },

  // FOLDER: Social Media
  { name: 'Social Facebook', value: 'https://facebook.com/yourbusiness' },
  { name: 'Social Instagram', value: 'https://instagram.com/yourbusiness' },
  { name: 'Social LinkedIn', value: 'https://linkedin.com/company/yourbusiness' },
  { name: 'Social YouTube', value: 'https://youtube.com/@yourbusiness' },

  // FOLDER: Offers & Campaigns
  { name: 'Current Offer', value: 'Your current promotion details' },
  { name: 'Offer Expiry Date', value: 'Month DD, YYYY' },
  { name: 'Reactivation Offer', value: 'Special offer for returning clients' },
  { name: 'Referral Reward Description', value: 'What referrers receive for successful referrals' },
  { name: 'Discovery Call Description', value: 'A free 30-minute consultation to discuss your needs' },

  // FOLDER: Business Operations
  { name: 'Business Hours', value: 'Mon-Fri 9am-5pm EST' },
  { name: 'Business Hours Start', value: '9:00 AM EST' },
  { name: 'Discovery Call Duration', value: '30 minutes' },
  { name: 'Google Maps Embed Code', value: '<iframe src="https://maps.google.com/embed?pb=YOUR_CODE"></iframe>' },
  { name: 'Compliance Disclaimer', value: 'Results may vary. This is not a guarantee of specific results.' },
  { name: 'Brand Primary Color', value: '#1A56DB' },

  // FOLDER: Content & FAQs
  { name: 'Common Question 1', value: 'What is your most frequently asked question?' },
  { name: 'Common Answer 1', value: 'Your answer to the most common question' },
  { name: 'Value Tip 1', value: 'One actionable tip for your audience' },
  { name: 'Onboarding Video URL', value: 'https://yourbusiness.com/onboarding-video' },

  // FOLDER: SaaS & Product (Phase 3)
  { name: 'SaaS Product Name', value: 'Your SaaS Product' },
  { name: 'Membership Program Name', value: 'Your Membership Program' },
  { name: 'Webinar Title', value: 'Your Webinar Title' },
  { name: 'Webinar Date', value: 'Month DD, YYYY' },
  { name: 'Webinar Time', value: '2:00 PM EST' },
  { name: 'Community URL', value: 'https://yourbusiness.com/community' },

  // Additional custom values referenced in templates
  { name: 'Max Class Size', value: '20' },
  { name: 'Class Duration', value: '60 minutes' },
  { name: 'Business Hours Calendar', value: 'Mon-Fri 9am-5pm' },
  { name: 'VSL Video URL', value: 'https://yourbusiness.com/vsl' },
  { name: 'Pixel Code', value: '' },
  { name: 'Founding Story Snippet', value: 'Tell your founding story here' },
  { name: 'Team Photo URL', value: 'https://yourbusiness.com/team.jpg' },
  { name: 'Service 1 Name', value: 'Service One' },
  { name: 'Service 1 Description', value: 'Description of your first service' },
  { name: 'Service 2 Name', value: 'Service Two' },
  { name: 'Service 3 Name', value: 'Service Three' },
  { name: 'Blog CTA Link', value: 'https://yourbusiness.com/blog-cta' },
  { name: 'Author Name', value: 'Your Name' },
];

async function createCustomValues() {
  console.log('\n=== CREATING CUSTOM VALUES ===');
  console.log(`Total custom values to create: ${CUSTOM_VALUES.length}\n`);

  const results = { created: 0, failed: 0, errors: [] };

  for (const cv of CUSTOM_VALUES) {
    const res = await apiCall('POST', `/locations/${config.LOCATION_ID}/customValues`, {
      name: cv.name,
      value: cv.value,
    });

    if (res.error) {
      results.failed++;
      results.errors.push({ name: cv.name, error: res.message || res.error });
      console.log(`  ✗ Failed: ${cv.name} - ${res.message || res.error}`);
    } else {
      results.created++;
      console.log(`  ✓ Created: ${cv.name} → ${res.customValue?.fieldKey || 'OK'}`);
    }
  }

  console.log(`\nCustom Values: ${results.created} created, ${results.failed} failed`);
  return results;
}

module.exports = { createCustomValues };
