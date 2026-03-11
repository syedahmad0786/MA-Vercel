const { apiCall } = require('./api-client');
const config = require('./config');

/**
 * Email Templates for Modern Amenities Solutions
 * Creates 46 email templates via POST /emails/builder
 * All content uses merge tags - zero hardcoded business info.
 */

function generateEmailHTML(preheader, bodyContent) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
body{margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f4f4f4;color:#333}
.wrapper{max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden}
.header{background:{{custom_values.brand_primary_color}};padding:24px;text-align:center}
.header img{max-width:180px;height:auto}
.header h1{color:#ffffff;font-size:20px;margin:12px 0 0}
.body{padding:32px 24px}
.body p{font-size:15px;line-height:1.6;margin:0 0 16px;color:#333}
.body h2{font-size:18px;color:#222;margin:0 0 12px}
.body ul{padding-left:20px;margin:0 0 16px}
.body li{font-size:15px;line-height:1.6;margin-bottom:6px}
.cta{display:inline-block;background:{{custom_values.brand_primary_color}};color:#ffffff!important;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:bold;font-size:15px;margin:8px 0 16px}
.footer{background:#f9f9f9;padding:20px 24px;text-align:center;font-size:12px;color:#999;border-top:1px solid #eee}
.footer a{color:#999}
.preheader{display:none!important;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden}
</style></head>
<body>
<div class="preheader">${preheader}</div>
<div class="wrapper">
<div class="header">
<img src="{{custom_values.business_logo_url}}" alt="{{custom_values.business_name}}">
</div>
<div class="body">
${bodyContent}
</div>
<div class="footer">
<p>{{custom_values.business_name}} | {{custom_values.business_address}}</p>
<p>{{custom_values.business_phone}} | {{custom_values.business_email}}</p>
<p><a href="{{custom_values.social_facebook}}">Facebook</a> · <a href="{{custom_values.social_instagram}}">Instagram</a> · <a href="{{custom_values.social_linkedin}}">LinkedIn</a></p>
<p style="margin-top:12px"><a href="#">Unsubscribe</a> | <a href="{{custom_values.website_url}}/privacy">Privacy Policy</a></p>
<p>{{custom_values.compliance_disclaimer}}</p>
</div>
</div>
</body></html>`;
}

const EMAIL_TEMPLATES = [
  // ===== 5.1 LEAD CAPTURE & INSTANT RESPONSE (9) =====
  {
    name: '[Modern Amenities] - Email - New Lead - Welcome',
    subject: 'Welcome, {{contact.first_name}}! Here\'s what happens next',
    preheader: 'Thanks for reaching out to {{custom_values.business_name}}',
    body: `<h2>Welcome, {{contact.first_name}}!</h2>
<p>Thank you for reaching out to {{custom_values.business_name}}. We're thrilled you're interested in {{custom_values.service_category}}.</p>
<p>I'm {{custom_values.owner_name}}, and I personally review every inquiry. Here's what you can expect:</p>
<ul>
<li><strong>Within the next few minutes:</strong> A member of our team will reach out</li>
<li><strong>Quick discovery call:</strong> {{custom_values.discovery_call_description}}</li>
<li><strong>Custom plan:</strong> Tailored recommendations for your specific needs</li>
</ul>
<p>Want to skip ahead? Book your free discovery call now:</p>
<p><a class="cta" href="{{custom_values.booking_link}}">Book Your Free Call →</a></p>
<p>In the meantime, feel free to reply to this email with any questions. We're here to help!</p>
<p>Looking forward to connecting,<br><strong>{{custom_values.owner_name}}</strong><br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - New Lead - What Happens Next',
    subject: '{{contact.first_name}}, here\'s your next step',
    preheader: 'Don\'t miss out — your personalized plan is one call away',
    body: `<h2>Hey {{contact.first_name}},</h2>
<p>Just following up on your inquiry — I know life gets busy, so I wanted to make sure you saw this.</p>
<p>At {{custom_values.business_name}}, we specialize in {{custom_values.service_category}}, and I'd love to show you exactly how we can help.</p>
<p><strong>Here's what a quick call looks like:</strong></p>
<ul>
<li>{{custom_values.discovery_call_duration}} — quick, focused, zero pressure</li>
<li>We'll learn about your situation and goals</li>
<li>You'll get honest recommendations (even if we're not the right fit)</li>
</ul>
<p><a class="cta" href="{{custom_values.booking_link}}">Pick a Time That Works →</a></p>
<p>Or simply reply to this email — I read every response personally.</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Nurture - Day 2 Social Proof',
    subject: 'See what {{custom_values.business_name}} clients are saying',
    preheader: 'Real results from real people like you',
    body: `<h2>{{contact.first_name}}, don't just take our word for it</h2>
<p>We know choosing the right partner for {{custom_values.service_category}} is a big decision. That's why we let our results speak for themselves.</p>
<p>Here's what clients say about working with {{custom_values.business_name}}:</p>
<blockquote style="border-left:4px solid {{custom_values.brand_primary_color}};padding:12px 16px;margin:16px 0;background:#f9f9f9;font-style:italic">
"Working with {{custom_values.business_name}} was a game-changer. Professional, responsive, and truly cared about our results."
</blockquote>
<p>We'd love to create a similar success story for you.</p>
<p><a class="cta" href="{{custom_values.booking_link}}">Start Your Success Story →</a></p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Nurture - Day 5 Limited Offer',
    subject: '{{contact.first_name}}, a special offer just for you',
    preheader: 'Limited time: {{custom_values.current_offer}}',
    body: `<h2>{{contact.first_name}}, I wanted to share something special</h2>
<p>Since you expressed interest in {{custom_values.service_category}}, I'm extending an exclusive offer:</p>
<div style="background:#f0f7ff;border:2px solid {{custom_values.brand_primary_color}};border-radius:8px;padding:20px;margin:16px 0;text-align:center">
<h2 style="margin:0 0 8px;color:{{custom_values.brand_primary_color}}">{{custom_values.current_offer}}</h2>
<p style="margin:0;color:#666">Available until {{custom_values.offer_expiry_date}}</p>
</div>
<p>This offer is only available to people who've recently reached out, and it expires soon.</p>
<p><a class="cta" href="{{custom_values.booking_link}}">Claim Your Offer →</a></p>
<p>Have questions? Just hit reply.</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Nurture - Day 10 Case Study',
    subject: 'How we helped a client just like you',
    preheader: 'A real-world {{custom_values.service_category}} success story',
    body: `<h2>{{contact.first_name}}, here's a real example</h2>
<p>I wanted to share a quick story about a client who was in a similar situation to yours.</p>
<p><strong>The Challenge:</strong> They needed help with {{custom_values.service_category}} but weren't sure where to start or who to trust.</p>
<p><strong>What We Did:</strong> We created a tailored plan, executed on the details, and kept them informed every step of the way.</p>
<p><strong>The Result:</strong> They saw measurable improvements and told us it was one of the best decisions they made.</p>
<p>We'd love to do the same for you.</p>
<p><a class="cta" href="{{custom_values.booking_link}}">Let's Talk About Your Goals →</a></p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Nurture - Day 21 Common Mistakes',
    subject: '{{contact.first_name}}, avoid these common mistakes',
    preheader: '3 mistakes most people make with {{custom_values.service_category}}',
    body: `<h2>{{contact.first_name}}, don't make these mistakes</h2>
<p>After years in {{custom_values.service_category}}, we've seen people make the same costly mistakes over and over:</p>
<p><strong>Mistake #1: Waiting too long to start</strong><br>The longer you delay, the more opportunity is lost. Early action compounds over time.</p>
<p><strong>Mistake #2: Going with the cheapest option</strong><br>You get what you pay for. Quality work saves you money (and headaches) in the long run.</p>
<p><strong>Mistake #3: Not having a clear plan</strong><br>Random actions get random results. A strategic approach makes all the difference.</p>
<p>We help our clients avoid all three. Want to make sure you're on the right track?</p>
<p><a class="cta" href="{{custom_values.booking_link}}">Get Expert Guidance →</a></p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Nurture - Day 45 Testimonial Proof',
    subject: 'Another success story from {{custom_values.business_name}}',
    preheader: 'See what\'s possible when you work with us',
    body: `<h2>{{contact.first_name}}, success leaves clues</h2>
<p>I wanted to share another win from one of our {{custom_values.service_category}} clients:</p>
<blockquote style="border-left:4px solid {{custom_values.brand_primary_color}};padding:12px 16px;margin:16px 0;background:#f9f9f9;font-style:italic">
"I wish I had reached out to {{custom_values.business_name}} sooner. The team was incredible, the process was smooth, and the results exceeded my expectations."
</blockquote>
<p>Stories like these are exactly why we do what we do. And we'd love to create one with you.</p>
<p>The door is always open whenever you're ready:</p>
<p><a class="cta" href="{{custom_values.booking_link}}">Let's Connect →</a></p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Nurture - Day 75 FAQ Answers',
    subject: 'Answers to your top questions about {{custom_values.service_category}}',
    preheader: 'The #1 question we get (and the honest answer)',
    body: `<h2>{{contact.first_name}}, got questions? We have answers.</h2>
<p>Here are the most common questions people ask about working with {{custom_values.business_name}}:</p>
<p><strong>Q: {{custom_values.common_question_1}}</strong><br>A: {{custom_values.common_answer_1}}</p>
<p><strong>Q: How long does it take to see results?</strong><br>A: Every situation is different, but most clients see meaningful progress within the first few weeks of working together.</p>
<p><strong>Q: What if I'm not sure this is right for me?</strong><br>A: That's exactly what our free discovery call is for — {{custom_values.discovery_call_description}}. Zero pressure, just honest advice.</p>
<p><a class="cta" href="{{custom_values.booking_link}}">Get Your Questions Answered →</a></p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Nurture - Day 90 Final Reach Out',
    subject: '{{contact.first_name}}, one last thing before I go',
    preheader: 'This is my final follow-up — the door is always open',
    body: `<h2>{{contact.first_name}}, this is my last email in this series</h2>
<p>I've reached out a few times, and I understand the timing might not be right — and that's completely okay.</p>
<p>I just want you to know that whenever you're ready to explore {{custom_values.service_category}}, we're here. No pressure, no expiration.</p>
<p>You can:</p>
<ul>
<li><strong>Book a call anytime:</strong> <a href="{{custom_values.booking_link}}">{{custom_values.booking_link}}</a></li>
<li><strong>Reply to this email</strong> — I still read every one</li>
<li><strong>Call us directly:</strong> {{custom_values.business_phone}}</li>
</ul>
<p>Wishing you all the best, {{contact.first_name}}. Truly.</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },

  // ===== 5.2 APPOINTMENT LIFECYCLE (8) =====
  {
    name: '[Modern Amenities] - Email - Appointment - Booking Confirmation',
    subject: 'You\'re booked! See you {{appointment.start_time}}',
    preheader: 'Your appointment with {{custom_values.business_name}} is confirmed',
    body: `<h2>You're all set, {{contact.first_name}}!</h2>
<p>Your appointment with {{custom_values.business_name}} is confirmed:</p>
<div style="background:#f0f7ff;border-radius:8px;padding:20px;margin:16px 0">
<p style="margin:0 0 8px"><strong>📅 Date & Time:</strong> {{appointment.start_time}}</p>
<p style="margin:0 0 8px"><strong>⏱ Duration:</strong> {{custom_values.discovery_call_duration}}</p>
<p style="margin:0 0 8px"><strong>📍 Location:</strong> {{custom_values.meeting_link_or_address}}</p>
<p style="margin:0"><strong>👤 With:</strong> {{custom_values.owner_name}}</p>
</div>
<p><a class="cta" href="{{custom_values.meeting_link_or_address}}">Join Meeting →</a></p>
<p><strong>To prepare:</strong></p>
<ul>
<li>Think about your main goals and challenges</li>
<li>Have any relevant questions ready</li>
<li>Be in a quiet place with good internet (if virtual)</li>
</ul>
<p>Need to reschedule? No worries: <a href="{{custom_values.reschedule_link}}">Click here to pick a new time</a></p>
<p>See you soon!<br>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Appointment - 24hr Reminder',
    subject: 'Reminder: Your call is TOMORROW',
    preheader: 'Quick reminder — your appointment with {{custom_values.business_name}} is tomorrow',
    body: `<h2>See you tomorrow, {{contact.first_name}}!</h2>
<p>Just a friendly reminder that your appointment is coming up:</p>
<div style="background:#f0f7ff;border-radius:8px;padding:20px;margin:16px 0">
<p style="margin:0 0 8px"><strong>📅 When:</strong> {{appointment.start_time}}</p>
<p style="margin:0"><strong>📍 Where:</strong> {{custom_values.meeting_link_or_address}}</p>
</div>
<p><a class="cta" href="{{custom_values.meeting_link_or_address}}">Join Meeting →</a></p>
<p>Can't make it? <a href="{{custom_values.reschedule_link}}">Reschedule here</a> — no worries at all.</p>
<p>Looking forward to it!<br>{{custom_values.owner_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Post-Show - Proposal / Next Steps',
    subject: 'Great talking with you! Here are your next steps',
    preheader: 'Your personalized proposal from {{custom_values.business_name}}',
    body: `<h2>Thanks for your time, {{contact.first_name}}!</h2>
<p>It was a pleasure speaking with you today. As promised, here's a summary of what we discussed and the next steps.</p>
<p><strong>What we covered:</strong></p>
<ul>
<li>Your current situation and goals</li>
<li>How {{custom_values.business_name}} can help with {{custom_values.service_category}}</li>
<li>Our recommended approach and timeline</li>
</ul>
<p><strong>Your next steps:</strong></p>
<ol>
<li>Review the proposal/recommendations (attached or linked below)</li>
<li>Reply with any questions</li>
<li>Let us know when you're ready to move forward</li>
</ol>
<p>We're excited about the opportunity to work together. If you're ready to get started, just let me know!</p>
<p><a class="cta" href="{{custom_values.booking_link}}">Ready? Let's Go →</a></p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Proposal Follow-Up - Day 1',
    subject: 'Quick check-in on our conversation',
    preheader: 'Any questions about the proposal?',
    body: `<h2>Hey {{contact.first_name}},</h2>
<p>Just wanted to check in after our conversation yesterday. Did you get a chance to review everything?</p>
<p>I know there's a lot to consider, so please don't hesitate to reach out with any questions. I'm happy to:</p>
<ul>
<li>Walk through any part of the proposal in more detail</li>
<li>Adjust the scope or timeline</li>
<li>Hop on a quick 10-minute call to discuss</li>
</ul>
<p><a class="cta" href="{{custom_values.booking_link}}">Book a Quick Follow-Up →</a></p>
<p>No rush — just want to make sure you have everything you need.</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Proposal Follow-Up - Day 3',
    subject: '{{contact.first_name}}, any questions on the proposal?',
    preheader: 'We want to make sure you have everything you need',
    body: `<h2>Hi {{contact.first_name}},</h2>
<p>Circling back on the proposal I sent over. I want to make sure you have all the information you need to make the best decision.</p>
<p>If anything is unclear or you'd like to explore different options, I'm all ears. Sometimes a quick conversation can clarify things faster than email.</p>
<p><a class="cta" href="{{custom_values.booking_link}}">Let's Chat for 10 Minutes →</a></p>
<p>Either way, I'm here whenever you're ready.</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Proposal Follow-Up - Day 7 Final Push',
    subject: 'Last check-in: Your {{custom_values.service_category}} proposal',
    preheader: 'Your proposal is still waiting — any thoughts?',
    body: `<h2>{{contact.first_name}}, one last follow-up</h2>
<p>I wanted to touch base one more time about the proposal from our call last week.</p>
<p>I completely understand if the timing isn't right — no pressure at all. But if you're still interested, I'd hate for you to miss out.</p>
<p>A few things to keep in mind:</p>
<ul>
<li>Our current availability is filling up</li>
<li>The sooner we start, the sooner you'll see results</li>
<li>We can always start small and scale up</li>
</ul>
<p><a class="cta" href="{{custom_values.booking_link}}">Let's Finalize the Details →</a></p>
<p>Whatever you decide, I appreciate your time and consideration.</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - No-Show - Rebooking Request',
    subject: 'We missed you today — let\'s reschedule!',
    preheader: 'No worries at all — life happens. Let\'s find a new time.',
    body: `<h2>Hey {{contact.first_name}},</h2>
<p>We noticed you weren't able to make our call today — no worries at all! Life gets busy, and we totally understand.</p>
<p>We'd still love to connect with you. Pick a new time that works better:</p>
<p><a class="cta" href="{{custom_values.booking_link}}">Rebook Your Call →</a></p>
<p>Your spot is reserved and we're looking forward to speaking with you.</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - No-Show - Day 3 Final Offer',
    subject: '{{contact.first_name}}, we saved your spot',
    preheader: 'Still interested? We\'d love to reschedule.',
    body: `<h2>{{contact.first_name}}, just checking in</h2>
<p>I reached out a few days ago after we missed our call. I wanted to try one more time — I genuinely believe we could help you with {{custom_values.service_category}}.</p>
<p>If you're still interested, I've saved a spot for you this week:</p>
<p><a class="cta" href="{{custom_values.booking_link}}">Grab Your Spot →</a></p>
<p>If the timing isn't right, just let me know and I'll follow up another time. No hard feelings!</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },

  // ===== 5.3 ONBOARDING (5) =====
  {
    name: '[Modern Amenities] - Email - Onboarding - Welcome & Next Steps',
    subject: 'Welcome to the {{custom_values.business_name}} family! 🎉',
    preheader: 'You\'re officially a client — here\'s what happens next',
    body: `<h2>Welcome aboard, {{contact.first_name}}!</h2>
<p>We are so excited to officially welcome you as a {{custom_values.business_name}} client. This is going to be great!</p>
<p><strong>Here's what happens next:</strong></p>
<ol>
<li><strong>Portal Access</strong> — You'll receive login details shortly</li>
<li><strong>Intake Form</strong> — We'll send a quick form to learn more about your needs</li>
<li><strong>Kickoff Call</strong> — We'll schedule a dedicated session to align on everything</li>
<li><strong>Get Started</strong> — We'll hit the ground running!</li>
</ol>
<p>In the meantime, save these important links:</p>
<ul>
<li><strong>Client Portal:</strong> <a href="{{custom_values.client_portal_url}}">{{custom_values.client_portal_url}}</a></li>
<li><strong>Our Phone:</strong> {{custom_values.business_phone}}</li>
<li><strong>Our Email:</strong> {{custom_values.business_email}}</li>
</ul>
<p>If you need anything at all, don't hesitate to reach out. We're here for you!</p>
<p>Welcome again,<br>{{custom_values.owner_name}} & the {{custom_values.business_name}} Team</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Onboarding - Portal Access & Login',
    subject: 'Your {{custom_values.business_name}} portal access is ready',
    preheader: 'Login to your client portal and get started',
    body: `<h2>Your portal is ready, {{contact.first_name}}!</h2>
<p>Great news — your client portal is all set up and ready for you to explore.</p>
<div style="background:#f0f7ff;border-radius:8px;padding:20px;margin:16px 0">
<p style="margin:0 0 8px"><strong>🔗 Portal URL:</strong> <a href="{{custom_values.client_portal_url}}">{{custom_values.client_portal_url}}</a></p>
<p style="margin:0"><strong>📧 Login Email:</strong> {{contact.email}}</p>
</div>
<p><a class="cta" href="{{custom_values.client_portal_url}}">Access Your Portal →</a></p>
<p>Inside your portal, you'll find:</p>
<ul>
<li>Project updates and status</li>
<li>Important documents and files</li>
<li>Communication history</li>
</ul>
<p>Having trouble logging in? Just reply to this email and we'll help you out.</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Onboarding - Intake Form Request',
    subject: 'Quick form to get us started (5 min)',
    preheader: 'Please fill this out so we can hit the ground running',
    body: `<h2>One quick step, {{contact.first_name}}</h2>
<p>To make sure we deliver the best possible experience, we need a few details from you.</p>
<p>Please take 5 minutes to fill out our intake form:</p>
<p><a class="cta" href="{{custom_values.intake_form_link}}">Complete Intake Form →</a></p>
<p>This helps us understand:</p>
<ul>
<li>Your specific goals and expectations</li>
<li>Any preferences or requirements</li>
<li>Timeline and priorities</li>
</ul>
<p>The sooner we receive this, the sooner we can schedule your kickoff call and get started!</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Onboarding - Kickoff Call Scheduling',
    subject: 'Let\'s schedule your kickoff call!',
    preheader: 'Time to align on everything and get rolling',
    body: `<h2>Thanks for the intake form, {{contact.first_name}}!</h2>
<p>We've reviewed your information and we're ready to kick things off. Let's schedule your dedicated kickoff call.</p>
<p><strong>What we'll cover:</strong></p>
<ul>
<li>Review your goals and priorities</li>
<li>Walk through our process and timeline</li>
<li>Answer any remaining questions</li>
<li>Set expectations and milestones</li>
</ul>
<p><a class="cta" href="{{custom_values.kickoff_calendar_link}}">Schedule Your Kickoff Call →</a></p>
<p>This is where the real fun begins!</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Onboarding - Post-Kickoff Checklist',
    subject: 'Kickoff recap + your action items',
    preheader: 'Here\'s everything we discussed on our kickoff call',
    body: `<h2>Great kickoff, {{contact.first_name}}!</h2>
<p>Thanks for a productive kickoff call. Here's a recap of what we discussed and the next steps.</p>
<p><strong>Your action items:</strong></p>
<ul>
<li>☐ Review and approve the project plan</li>
<li>☐ Provide any remaining materials or access</li>
<li>☐ Save our contact info for quick communication</li>
</ul>
<p><strong>Our action items:</strong></p>
<ul>
<li>☐ Begin Phase 1 execution</li>
<li>☐ Send you the first progress update within 1 week</li>
<li>☐ Set up any additional tools or integrations</li>
</ul>
<p>Your portal will always have the latest updates: <a href="{{custom_values.client_portal_url}}">Access Portal</a></p>
<p>Questions? Reach out anytime. We're on it!</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },

  // ===== 5.4 REVIEW REQUEST (2) =====
  {
    name: '[Modern Amenities] - Email - Review Request - Email 1 (Thank You)',
    subject: '{{contact.first_name}}, how was your experience?',
    preheader: 'We\'d love your honest feedback',
    body: `<h2>Thank you, {{contact.first_name}}!</h2>
<p>We truly enjoyed working with you and hope you had a great experience with {{custom_values.business_name}}.</p>
<p>If you have a moment, we'd be incredibly grateful if you could share your experience with others. Your review helps people just like you find the right {{custom_values.service_category}} partner.</p>
<p>It takes less than 60 seconds:</p>
<p><a class="cta" href="{{custom_values.google_review_link}}">Leave a Quick Review →</a></p>
<p>Your feedback — whether it's a few words or a detailed review — means the world to our team.</p>
<p>Thank you for trusting us with your business!</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Review Request - Email 2 (Final Reminder)',
    subject: 'Quick favor? (30 seconds)',
    preheader: 'A quick review would mean a lot to our team',
    body: `<h2>Hi {{contact.first_name}},</h2>
<p>I know you're busy, so I'll keep this short. If you haven't had a chance yet, would you mind leaving us a quick review?</p>
<p>Even just a star rating and one sentence helps tremendously.</p>
<p><a class="cta" href="{{custom_values.google_review_link}}">Leave a Review (30 sec) →</a></p>
<p>This is the last time I'll ask — thank you for even considering it!</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },

  // ===== 5.5 REACTIVATION, REFERRAL & UPSELL (14 - Phase 2) =====
  {
    name: '[Modern Amenities] - Email - Reactivation - Day 1 We Missed You',
    subject: 'It\'s been a while, {{contact.first_name}}!',
    preheader: 'We noticed you haven\'t been around — everything okay?',
    body: `<h2>Hey {{contact.first_name}}, we miss you!</h2>
<p>It's been a while since we last connected, and I wanted to personally check in.</p>
<p>A lot has changed at {{custom_values.business_name}} — we've been adding new capabilities and refining our {{custom_values.service_category}} offerings.</p>
<p>I'd love to catch up and see if there's anything we can help you with.</p>
<p><a class="cta" href="{{custom_values.booking_link}}">Let's Reconnect →</a></p>
<p>No pitch, no pressure — just a friendly check-in.</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Reactivation - Day 6 Social Proof + Offer',
    subject: '{{contact.first_name}}, special offer for returning friends',
    preheader: 'A welcome-back offer just for you: {{custom_values.reactivation_offer}}',
    body: `<h2>{{contact.first_name}}, we have something for you</h2>
<p>Since we last worked together, our clients have been seeing incredible results with {{custom_values.service_category}}.</p>
<p>As a welcome-back gesture, we're extending a special offer just for you:</p>
<div style="background:#f0f7ff;border:2px solid {{custom_values.brand_primary_color}};border-radius:8px;padding:20px;margin:16px 0;text-align:center">
<h2 style="margin:0 0 8px;color:{{custom_values.brand_primary_color}}">{{custom_values.reactivation_offer}}</h2>
</div>
<p><a class="cta" href="{{custom_values.booking_link}}">Claim Your Welcome-Back Offer →</a></p>
<p>This is exclusively for previous clients and contacts. Let's pick up where we left off!</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Lost Deal - Graceful Goodbye + Feedback',
    subject: 'No hard feelings, {{contact.first_name}}',
    preheader: 'We respect your decision — one quick question though',
    body: `<h2>Thanks for considering us, {{contact.first_name}}</h2>
<p>I understand this wasn't the right fit or time, and I completely respect that.</p>
<p>I have one small ask — would you mind sharing what influenced your decision? It helps us improve.</p>
<ul>
<li>Was it timing?</li>
<li>Was it pricing?</li>
<li>Did you go with another provider?</li>
<li>Something else?</li>
</ul>
<p>A quick one-line reply is all I need. Either way, I wish you the very best.</p>
<p>And if things change down the road, the door is always open.</p>
<p>All the best,<br>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Referral - Program Introduction',
    subject: 'Know someone who needs {{custom_values.service_category}}?',
    preheader: 'Earn {{custom_values.referral_reward_description}} for every referral',
    body: `<h2>{{contact.first_name}}, share the love!</h2>
<p>You've experienced what {{custom_values.business_name}} can do, and we'd love to help more people like you.</p>
<p>Know a friend, colleague, or family member who could benefit from {{custom_values.service_category}}?</p>
<div style="background:#f0f7ff;border-radius:8px;padding:20px;margin:16px 0;text-align:center">
<h2 style="margin:0 0 8px;color:{{custom_values.brand_primary_color}}">Your Referral Reward</h2>
<p style="margin:0;font-size:16px">{{custom_values.referral_reward_description}}</p>
</div>
<p>It's simple:</p>
<ol>
<li>Share their name and contact info with us</li>
<li>We'll reach out and take great care of them</li>
<li>When they become a client, you get rewarded!</li>
</ol>
<p><a class="cta" href="{{custom_values.website_url}}">Refer Someone Now →</a></p>
<p>Thank you for being a champion of {{custom_values.business_name}}!</p>
<p>{{custom_values.owner_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Upsell - Introduction to Premium Offer',
    subject: '{{contact.first_name}}, ready to level up?',
    preheader: 'Take your results to the next level with our premium offering',
    body: `<h2>{{contact.first_name}}, you've been doing great</h2>
<p>I wanted to share something with you that I think could take your results to the next level.</p>
<p>Based on what we've accomplished together, I believe you're a great fit for our premium offering.</p>
<p><strong>Here's what's included:</strong></p>
<ul>
<li>Enhanced support and priority access</li>
<li>Advanced strategies tailored to your growth</li>
<li>Exclusive resources and tools</li>
</ul>
<p>No pressure — I just want you to know what's available if and when you're ready.</p>
<p><a class="cta" href="{{custom_values.upgrade_payment_link}}">Learn More About the Upgrade →</a></p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Upsell - Case Study of Upgraded Clients',
    subject: 'What happened when clients upgraded',
    preheader: 'See the results clients got after upgrading',
    body: `<h2>{{contact.first_name}}, quick success story</h2>
<p>Remember the upgrade I mentioned? Here's what happened when a few clients took the leap:</p>
<blockquote style="border-left:4px solid {{custom_values.brand_primary_color}};padding:12px 16px;margin:16px 0;background:#f9f9f9;font-style:italic">
"Upgrading was the best decision. The premium support and additional features made a huge difference in our results."
</blockquote>
<p>If you'd like similar results, I'd love to walk you through the options:</p>
<p><a class="cta" href="{{custom_values.booking_link}}">Let's Discuss the Upgrade →</a></p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Webinar - Registration Confirmation + Zoom Link',
    subject: 'You\'re registered! {{custom_values.webinar_title}}',
    preheader: 'Save the date: {{custom_values.webinar_date}} at {{custom_values.webinar_time}}',
    body: `<h2>You're in, {{contact.first_name}}!</h2>
<p>You've successfully registered for our upcoming event:</p>
<div style="background:#f0f7ff;border-radius:8px;padding:20px;margin:16px 0">
<h3 style="margin:0 0 8px">{{custom_values.webinar_title}}</h3>
<p style="margin:0 0 8px"><strong>📅 Date:</strong> {{custom_values.webinar_date}}</p>
<p style="margin:0 0 8px"><strong>⏰ Time:</strong> {{custom_values.webinar_time}}</p>
<p style="margin:0"><strong>🔗 Join Link:</strong> <a href="{{custom_values.webinar_link}}">{{custom_values.webinar_link}}</a></p>
</div>
<p><a class="cta" href="{{custom_values.webinar_link}}">Add to Calendar →</a></p>
<p><strong>What you'll learn:</strong></p>
<ul>
<li>Proven strategies for {{custom_values.service_category}}</li>
<li>Real examples and case studies</li>
<li>Live Q&A with {{custom_values.owner_name}}</li>
</ul>
<p>See you there!</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Webinar - 24hr Reminder + Agenda',
    subject: 'TOMORROW: {{custom_values.webinar_title}} starts at {{custom_values.webinar_time}}',
    preheader: 'Don\'t forget — your event is tomorrow!',
    body: `<h2>Tomorrow's the day, {{contact.first_name}}!</h2>
<p>Quick reminder that <strong>{{custom_values.webinar_title}}</strong> is happening tomorrow.</p>
<div style="background:#f0f7ff;border-radius:8px;padding:20px;margin:16px 0">
<p style="margin:0 0 8px"><strong>⏰ Time:</strong> {{custom_values.webinar_time}}</p>
<p style="margin:0"><strong>🔗 Join:</strong> <a href="{{custom_values.webinar_link}}">{{custom_values.webinar_link}}</a></p>
</div>
<p><strong>Quick agenda:</strong></p>
<ol>
<li>Welcome & introductions</li>
<li>Core content & strategies</li>
<li>Live examples & case studies</li>
<li>Q&A session</li>
<li>Special offer for attendees</li>
</ol>
<p><a class="cta" href="{{custom_values.webinar_link}}">Save Your Join Link →</a></p>
<p>See you tomorrow!<br>{{custom_values.owner_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Webinar - Post-Event Replay + CTA',
    subject: 'Replay ready: {{custom_values.webinar_title}}',
    preheader: 'Watch the replay and take the next step',
    body: `<h2>Thanks for attending, {{contact.first_name}}!</h2>
<p>What a great session! Whether you caught the whole thing or just part of it, here's your replay link:</p>
<p><a class="cta" href="{{custom_values.webinar_replay_url}}">Watch the Replay →</a></p>
<p><strong>Key takeaways:</strong></p>
<ul>
<li>The #1 strategy for {{custom_values.service_category}} success</li>
<li>Common pitfalls to avoid</li>
<li>How to get started today</li>
</ul>
<p><strong>Ready to take the next step?</strong> During the event, we shared a special offer for attendees. If you're ready to move forward:</p>
<p><a class="cta" href="{{custom_values.booking_link}}">Book Your Strategy Call →</a></p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Invoice - Friendly Payment Reminder',
    subject: 'Friendly reminder: Invoice from {{custom_values.business_name}}',
    preheader: 'Just a quick reminder about your outstanding invoice',
    body: `<h2>Hi {{contact.first_name}},</h2>
<p>Hope you're doing well! This is a friendly reminder that you have an outstanding invoice from {{custom_values.business_name}}.</p>
<p>If you've already taken care of it, please disregard this email. Otherwise, you can make your payment securely here:</p>
<p><a class="cta" href="{{custom_values.upgrade_payment_link}}">Pay Invoice →</a></p>
<p>If you have any questions about the invoice or need to discuss payment options, just reply to this email.</p>
<p>Thank you!</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Invoice - Final Payment Request',
    subject: 'Action needed: Overdue invoice from {{custom_values.business_name}}',
    preheader: 'Your invoice is now overdue — please take action',
    body: `<h2>{{contact.first_name}}, important notice</h2>
<p>This is a follow-up regarding your overdue invoice from {{custom_values.business_name}}.</p>
<p>We understand things can slip through the cracks. Please take a moment to resolve this at your earliest convenience:</p>
<p><a class="cta" href="{{custom_values.upgrade_payment_link}}">Pay Now →</a></p>
<p>If there's an issue with the invoice or you need to arrange a payment plan, please reply to this email or call us at {{custom_values.business_phone}}.</p>
<p>We value our relationship and want to work this out together.</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Relationship - Personal Celebration Note',
    subject: 'Happy Birthday, {{contact.first_name}}! 🎂',
    preheader: 'Wishing you an amazing day from {{custom_values.business_name}}',
    body: `<h2>Happy Birthday, {{contact.first_name}}! 🎉</h2>
<p>Everyone at {{custom_values.business_name}} wants to wish you an incredible day!</p>
<p>Thank you for being part of our community. We're grateful to know you and hope this year brings you everything you're working toward.</p>
<p>Here's to a fantastic year ahead!</p>
<p>Warm regards,<br>{{custom_values.owner_name}} & the {{custom_values.business_name}} Team</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Seasonal - Holiday Greeting',
    subject: 'Happy Holidays from {{custom_values.business_name}}!',
    preheader: 'Wishing you joy and success this holiday season',
    body: `<h2>Happy Holidays, {{contact.first_name}}!</h2>
<p>As the year comes to a close, we wanted to take a moment to thank you for being part of the {{custom_values.business_name}} community.</p>
<p>Whether we worked together this year or you're considering it for the future — we appreciate you.</p>
<p>Wishing you and your loved ones a wonderful holiday season and an incredible new year ahead!</p>
<p>With gratitude,<br>{{custom_values.owner_name}} & the entire {{custom_values.business_name}} Team</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Stale - Proposal Check-In',
    subject: '{{contact.first_name}}, still thinking it over?',
    preheader: 'Your proposal from {{custom_values.business_name}} — any questions?',
    body: `<h2>Hey {{contact.first_name}},</h2>
<p>I noticed it's been a little while since we sent over our proposal, and I wanted to check in.</p>
<p>Sometimes things just need a little more time — and that's perfectly fine. But if there's anything holding you back, I'd love to address it.</p>
<p>Common concerns I can help with:</p>
<ul>
<li><strong>Budget:</strong> We may have flexible options</li>
<li><strong>Timing:</strong> We can adjust the start date</li>
<li><strong>Scope:</strong> We can start smaller and grow</li>
</ul>
<p><a class="cta" href="{{custom_values.booking_link}}">Let's Chat About It →</a></p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },

  // ===== 5.6 SAAS, MEMBERSHIP & AI (8 - Phase 3) =====
  {
    name: '[Modern Amenities] - Email - SaaS Trial - Welcome + Login + Quick Start',
    subject: 'Your {{custom_values.saas_product_name}} trial is live!',
    preheader: 'Login and get started in under 5 minutes',
    body: `<h2>Welcome to {{custom_values.saas_product_name}}, {{contact.first_name}}!</h2>
<p>Your trial is now active. Here's everything you need to get started:</p>
<div style="background:#f0f7ff;border-radius:8px;padding:20px;margin:16px 0">
<p style="margin:0 0 8px"><strong>🔗 Login URL:</strong> <a href="{{custom_values.saas_login_url}}">{{custom_values.saas_login_url}}</a></p>
<p style="margin:0 0 8px"><strong>📧 Your Email:</strong> {{contact.email}}</p>
<p style="margin:0"><strong>⏳ Trial Period:</strong> 14 days</p>
</div>
<p><a class="cta" href="{{custom_values.saas_login_url}}">Login Now →</a></p>
<p><strong>Quick start guide:</strong></p>
<ol>
<li>Log in with your email</li>
<li>Complete the setup wizard (2 minutes)</li>
<li>Explore the dashboard and key features</li>
<li>Check your email for feature highlights over the next few days</li>
</ol>
<p>Need help? Reply to this email or book an onboarding call: <a href="{{custom_values.booking_link}}">Book here</a></p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - SaaS Trial - Feature Highlight #1',
    subject: 'Day 2: Discover this powerful feature',
    preheader: 'The feature most users wish they found sooner',
    body: `<h2>{{contact.first_name}}, have you tried this yet?</h2>
<p>You're on Day 2 of your {{custom_values.saas_product_name}} trial, and I wanted to highlight the feature that our most successful users love:</p>
<p><strong>Feature Highlight: Smart Dashboard</strong></p>
<p>This is where you'll see your most important metrics at a glance. Most users find this is the feature that makes the biggest impact on their daily workflow.</p>
<p><strong>Try it now:</strong></p>
<ol>
<li>Log in to <a href="{{custom_values.saas_login_url}}">{{custom_values.saas_product_name}}</a></li>
<li>Navigate to the Dashboard tab</li>
<li>Customize your view with the metrics that matter most to you</li>
</ol>
<p><a class="cta" href="{{custom_values.saas_login_url}}">Explore Now →</a></p>
<p>Stay tuned for more feature highlights!</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - SaaS Trial - Feature Highlight #2',
    subject: 'Day 5: The automation feature that saves hours',
    preheader: 'Automate the repetitive stuff so you can focus on growth',
    body: `<h2>{{contact.first_name}}, let's talk automation</h2>
<p>You're almost a week into your {{custom_values.saas_product_name}} trial — great progress!</p>
<p><strong>Feature Highlight: Automation Engine</strong></p>
<p>This is the feature that turns hours of manual work into minutes of automated magic. Set it up once and let it run.</p>
<p><strong>What you can automate:</strong></p>
<ul>
<li>Repetitive tasks and workflows</li>
<li>Notifications and alerts</li>
<li>Data syncing and reporting</li>
</ul>
<p><a class="cta" href="{{custom_values.saas_login_url}}">Set Up Automations →</a></p>
<p>Need a hand setting things up? <a href="{{custom_values.booking_link}}">Book a quick call</a> and we'll walk you through it.</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - SaaS Trial - Upgrade or Lose Access',
    subject: '⚠️ Your {{custom_values.saas_product_name}} trial ends tomorrow',
    preheader: 'Don\'t lose your setup and data — upgrade now',
    body: `<h2>{{contact.first_name}}, your trial ends tomorrow</h2>
<p>Your 14-day {{custom_values.saas_product_name}} trial is almost over. After tomorrow, you'll lose access to:</p>
<ul>
<li>Your custom dashboard and settings</li>
<li>All automations you've built</li>
<li>Your data and reports</li>
</ul>
<p><strong>Don't let your work go to waste.</strong> Upgrade now to keep everything and unlock even more features:</p>
<p><a class="cta" href="{{custom_values.upgrade_payment_link}}">Upgrade Now →</a></p>
<p>Questions about pricing or plans? Reply to this email or call {{custom_values.business_phone}} — we're happy to help you find the right fit.</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Membership - Welcome & Access Instructions',
    subject: 'Welcome to {{custom_values.membership_program_name}}!',
    preheader: 'Your membership is active — here\'s how to access everything',
    body: `<h2>You're in, {{contact.first_name}}!</h2>
<p>Welcome to <strong>{{custom_values.membership_program_name}}</strong>! Your access is now active.</p>
<div style="background:#f0f7ff;border-radius:8px;padding:20px;margin:16px 0">
<p style="margin:0 0 8px"><strong>🔗 Member Portal:</strong> <a href="{{custom_values.membership_login_url}}">{{custom_values.membership_login_url}}</a></p>
<p style="margin:0"><strong>📧 Login Email:</strong> {{contact.email}}</p>
</div>
<p><a class="cta" href="{{custom_values.membership_login_url}}">Access Your Membership →</a></p>
<p><strong>Here's what's waiting for you inside:</strong></p>
<ul>
<li><strong>Module 1:</strong> Getting Started — your foundation</li>
<li><strong>Module 2:</strong> Core Training — the essential strategies</li>
<li><strong>Module 3:</strong> Advanced Strategies — take it further</li>
<li><strong>Bonus Resources:</strong> Templates, checklists, and more</li>
</ul>
<p>We recommend starting with Module 1 and working through at your own pace.</p>
<p>Welcome to the community!<br>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Membership - Getting Started Guide',
    subject: 'Getting the most out of {{custom_values.membership_program_name}}',
    preheader: 'Pro tips to maximize your membership experience',
    body: `<h2>Hey {{contact.first_name}}, how's it going?</h2>
<p>You've had a few days to explore {{custom_values.membership_program_name}} — hope you're enjoying it so far!</p>
<p>Here are some tips to get the most out of your membership:</p>
<p><strong>1. Start with the basics</strong><br>Module 1 sets the foundation. Don't skip it, even if you have some experience.</p>
<p><strong>2. Take action on each lesson</strong><br>Each module has action items. Completing them is where the real transformation happens.</p>
<p><strong>3. Use the bonus resources</strong><br>We've included templates, checklists, and guides to make implementation easier.</p>
<p><strong>4. Join the community</strong><br>Connect with other members: <a href="{{custom_values.community_url}}">{{custom_values.community_url}}</a></p>
<p><a class="cta" href="{{custom_values.membership_login_url}}">Continue Learning →</a></p>
<p>Questions? Just reply — we're here to help!</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Membership - Month 1 Milestone + Upsell',
    subject: 'Congrats on 1 month, {{contact.first_name}}!',
    preheader: 'You\'ve hit a milestone — here\'s what\'s next',
    body: `<h2>1 month down, {{contact.first_name}}!</h2>
<p>Congratulations on completing your first month in {{custom_values.membership_program_name}}! That's a real achievement.</p>
<p><strong>By now you should have:</strong></p>
<ul>
<li>✅ Completed Module 1 — Getting Started</li>
<li>✅ Started Module 2 — Core Training</li>
<li>✅ Begun implementing what you've learned</li>
</ul>
<p><strong>Ready for the next level?</strong></p>
<p>Some of our most successful members accelerate their progress with our premium offering, which includes:</p>
<ul>
<li>1-on-1 coaching calls</li>
<li>Advanced strategy sessions</li>
<li>Priority support</li>
</ul>
<p><a class="cta" href="{{custom_values.upgrade_payment_link}}">Explore Premium →</a></p>
<p>Keep up the great work!</p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
  {
    name: '[Modern Amenities] - Email - Affiliate - Commission Earned Notification',
    subject: 'Cha-ching! You earned a commission 💰',
    preheader: 'A referral you sent just became a client!',
    body: `<h2>Great news, {{contact.first_name}}!</h2>
<p>Someone you referred to {{custom_values.business_name}} just became a client — and that means you've earned a commission!</p>
<div style="background:#f0f7ff;border:2px solid {{custom_values.brand_primary_color}};border-radius:8px;padding:20px;margin:16px 0;text-align:center">
<h2 style="margin:0 0 8px;color:{{custom_values.brand_primary_color}}">Commission Earned!</h2>
<p style="margin:0;font-size:16px">{{custom_values.referral_reward_description}}</p>
</div>
<p>Thank you for spreading the word about {{custom_values.business_name}}. Your support means everything to us.</p>
<p>Want to refer more people? The more clients you send our way, the more you earn!</p>
<p><a class="cta" href="{{custom_values.website_url}}">Refer More People →</a></p>
<p>{{custom_values.owner_name}}<br>{{custom_values.business_name}}</p>`,
  },
];

async function createEmailTemplates() {
  console.log('\n=== CREATING EMAIL TEMPLATES ===');
  console.log(`Total email templates to create: ${EMAIL_TEMPLATES.length}\n`);

  const results = { created: 0, failed: 0, errors: [] };

  for (const template of EMAIL_TEMPLATES) {
    const htmlContent = generateEmailHTML(template.preheader, template.body);

    const body = {
      locationId: config.LOCATION_ID,
      name: template.name,
      type: 'html',
      updatedBy: 'API Script',
      html: htmlContent,
      subject: template.subject,
      preheaderText: template.preheader,
    };

    const res = await apiCall('POST', '/emails/builder', body);

    if (res.error || res.statusCode >= 400) {
      results.failed++;
      const errMsg = res.message || res.msg || JSON.stringify(res);
      results.errors.push({ name: template.name, error: errMsg });
      console.log(`  ✗ Failed: ${template.name} - ${errMsg}`);
    } else {
      results.created++;
      const id = res.id || res.templateId || 'OK';
      console.log(`  ✓ Created: ${template.name} → ${id}`);
    }
  }

  console.log(`\nEmail Templates: ${results.created} created, ${results.failed} failed`);
  return results;
}

module.exports = { createEmailTemplates, EMAIL_TEMPLATES };
