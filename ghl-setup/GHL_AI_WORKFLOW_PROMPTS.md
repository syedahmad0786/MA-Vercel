# GHL AI Workflow Builder Prompts — All 28 Workflows

> **How to use:** Copy each prompt below and paste it into GHL's AI Workflow Builder (Automation → Create Workflow → "Use AI"). The AI will generate the workflow structure. Review each step, connect the correct email/SMS templates, and adjust timing as needed.
>
> **Important:** After the AI builds each workflow, manually verify:
> 1. Correct trigger type and filters
> 2. Correct email/SMS template names (listed in each prompt)
> 3. Correct pipeline and stage names
> 4. Correct tag names (all prefixed with `[Modern Amenities] - Tag -`)
> 5. Allow Re-Entry settings
> 6. Business hours configuration where noted

---

## PHASE 1 — MVP (Workflows 1-14)

---

### WF-01: Lead - Instant Speed-to-Lead Response

**Workflow Name:** `[Modern Amenities] - Workflow - Lead - Instant Speed-to-Lead Response`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create a speed-to-lead workflow that fires when a form is submitted on any lead capture form OR when a new contact is created via an ad integration (like Facebook Lead Ads).

Here is the exact sequence of steps:

1. Immediately (0 minute wait) — Send an SMS using the template called "[Modern Amenities] - SMS - New Lead - Instant Reply". The SMS text is: "Hi {{contact.first_name}}! This is {{custom_values.owner_name}} from {{custom_values.business_name}}. Just got your request I'd love to help. Is now a good time to chat?"

2. Wait 2 minutes.

3. Send an email using the template called "[Modern Amenities] - Email - New Lead - Welcome". This is a branded welcome email introducing the business, what to expect, and a booking link.

4. Add the tag "[Modern Amenities] - Tag - Status - Lead Received" to the contact.

5. Create a new opportunity in the pipeline called "Main Sales Pipeline" and place it in the stage called "New Lead". Set the opportunity name to "{{contact.first_name}} {{contact.last_name}} - New Lead".

6. Assign the contact to a user using round-robin team assignment.

7. Send an internal notification (push notification + email to the assigned user) with the message: "🔥 New lead received — contact NOW! Name: {{contact.first_name}} {{contact.last_name}}, Phone: {{contact.phone}}, Email: {{contact.email}}"

8. Add an If/Else condition: IF the contact has replied (inbound SMS reply) within the last 10 minutes → go to a "Qualified" branch where you add the tag "[Modern Amenities] - Tag - Status - Qualified" and move the opportunity to the "Qualified" stage, then END the workflow. ELSE → continue to the next step.

9. Wait 10 minutes.

10. Send another SMS using "[Modern Amenities] - SMS - New Lead - Attempt 2". The SMS text is: "Hey {{contact.first_name}}, tried reaching out want to get you sorted asap. Click to book a quick call: {{custom_values.booking_link}}"

11. Move the opportunity stage to "Contacted - Attempt 2" in the Main Sales Pipeline.

12. Wait 1 hour.

13. Add another If/Else condition: IF the contact has replied → add tag "[Modern Amenities] - Tag - Status - Qualified" and move opportunity to "Qualified" stage, then END. ELSE → add tag "[Modern Amenities] - Tag - Status - No Reply After Instant" (this tag will trigger the next workflow WF-02).

Settings:
- Allow Re-Entry: OFF (a contact should only go through this once per form submission)
- Stop on Reply: Yes — if the contact replies at any point, stop the sequence
- Workflow status: ACTIVE
```

---

### WF-02: Lead - Multi-Touch Follow-Up Sequence (Day 1-7)

**Workflow Name:** `[Modern Amenities] - Workflow - Lead - Multi-Touch Follow-Up Sequence (Day 1-7)`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create a multi-touch follow-up workflow that triggers when the tag "[Modern Amenities] - Tag - Status - No Reply After Instant" is added to a contact. This workflow runs over 7 days and uses multiple channels (voicemail, SMS, email) to reach leads who didn't respond to the initial speed-to-lead sequence.

Here is the exact sequence:

1. Day 1 Morning (9:00 AM contact's timezone) — Drop a voicemail using the script "[Modern Amenities] - Voicemail - Day 1 Introduction". The voicemail says: "Hey {{contact.first_name}}, this is {{custom_values.owner_name}} from {{custom_values.business_name}}. I just got your inquiry and wanted to personally reach out. We'd love to help you with {{custom_values.service_category}}. Give me a call back at {{custom_values.business_phone}} or feel free to book a time at {{custom_values.booking_link}}. Looking forward to connecting!"

2. Day 1 Afternoon (2:00 PM) — Send SMS "[Modern Amenities] - SMS - Follow-Up - Day 1 PM Check-In". Text: "{{contact.first_name}}, still thinking about {{custom_values.tagline}}? Happy to answer any questions just reply here or book a call: {{custom_values.booking_link}}"

3. Day 2 (10:00 AM) — Send Email "[Modern Amenities] - Email - Nurture - Day 2 Social Proof". This email includes client testimonials and social proof.

4. Day 3 (11:00 AM) — Send SMS "[Modern Amenities] - SMS - Follow-Up - Day 3 FAQ". Text: "{{contact.first_name}} most people ask us: '{{custom_values.common_question_1}}' the answer is {{custom_values.common_answer_1}}. Want to know more? Book here: {{custom_values.booking_link}}"

5. Day 3 — Move the opportunity stage to "Contacted - Attempt 3" in the Main Sales Pipeline.

6. Day 5 (10:00 AM) — Send Email "[Modern Amenities] - Email - Nurture - Day 5 Limited Offer". This email presents a limited-time offer or incentive.

7. Day 7 (10:00 AM) — Send SMS "[Modern Amenities] - SMS - Follow-Up - Day 7 Final Check-In". Text: "Last check-in, {{contact.first_name}}. If this isn't the right time, no worries at all. Just let me know and I'll stop following up. Otherwise, book here: {{custom_values.booking_link}}"

8. Day 7 — Send an internal notification to the assigned user: "Lead {{contact.first_name}} {{contact.last_name}} has not replied in 7 days. Manual call required. Phone: {{contact.phone}}"

9. Day 7 — If/Else condition: IF the contact has NOT replied at all during this 7-day sequence → Add tag "[Modern Amenities] - Tag - Status - Cold Lead" AND move opportunity to "Nurture / Long-Term" stage. ELSE (if they replied) → Add tag "[Modern Amenities] - Tag - Status - Qualified" and move opportunity to "Qualified" stage.

Settings:
- Allow Re-Entry: OFF
- Stop on Reply: Yes
- Enroll in workflow on: Tag Added
```

---

### WF-03: Lead - Long-Term Nurture Drip (Day 8-90)

**Workflow Name:** `[Modern Amenities] - Workflow - Lead - Long-Term Nurture Drip (Day 8-90)`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create a long-term nurture drip campaign that triggers when the tag "[Modern Amenities] - Tag - Status - Cold Lead" is added to a contact. This is a slow-drip sequence spread across 90 days to keep your brand top-of-mind with leads who went cold.

Here is the exact sequence:

1. Wait until Day 10 (2 days after entering) — Send Email "[Modern Amenities] - Email - Nurture - Day 10 Case Study". This email shares a detailed client case study showing results.

2. Day 14 — Send SMS "[Modern Amenities] - SMS - Nurture - Day 14 Value Tip". Text: "Quick tip, {{contact.first_name}}: {{custom_values.value_tip_1}} Brought to you by {{custom_values.business_name}}. Questions? Just reply!"

3. Day 21 — Send Email "[Modern Amenities] - Email - Nurture - Day 21 Common Mistakes". This email covers common mistakes people make in the industry and how to avoid them.

4. Day 30 — Send SMS "[Modern Amenities] - SMS - Nurture - Day 30 Re-Engagement". Text: "{{contact.first_name}}, it's been a while! We've had some exciting updates at {{custom_values.business_name}}. Ready to reconnect? {{custom_values.booking_link}}"

5. Day 30 — Send internal notification to assigned user: "Cold lead {{contact.first_name}} {{contact.last_name}} has reached Day 30 in nurture. Flag for manual call attempt. Phone: {{contact.phone}}"

6. Day 45 — Send Email "[Modern Amenities] - Email - Nurture - Day 45 Testimonial Proof". This email shares additional testimonials and proof of results.

7. Day 60 — Send SMS "[Modern Amenities] - SMS - Nurture - Day 60 Seasonal Offer". Text: "{{contact.first_name}}, special offer from {{custom_values.business_name}} this month: {{custom_values.current_offer}}. Claim it before {{custom_values.offer_expiry_date}}: {{custom_values.booking_link}}"

8. Day 75 — Send Email "[Modern Amenities] - Email - Nurture - Day 75 FAQ Answers". This email answers the most common questions prospects have.

9. Day 90 — Send BOTH SMS and Email. SMS: "[Modern Amenities] - SMS - Nurture - Day 90 Final Reach Out". Text: "{{contact.first_name}}, this is our final check-in. If you're ever ready to move forward, we're here: {{custom_values.booking_link}}. Wishing you all the best!" Email: "[Modern Amenities] - Email - Nurture - Day 90 Final Reach Out".

10. Day 90 — If/Else condition: IF the contact has shown NO engagement (no email opens, no clicks, no replies) during this entire 90-day period → Add tag "[Modern Amenities] - Tag - Status - Archived" and END. ELSE (if any engagement detected) → Remove tag "Cold Lead", add tag "[Modern Amenities] - Tag - Status - Re-Engaged", and move the opportunity back to "New Lead" stage to restart the sales process.

Settings:
- Allow Re-Entry: OFF
- Stop on Reply: Yes (any reply should alert the team and stop the drip)
- Enroll in workflow on: Tag Added
```

---

### WF-04: Appointment - Booking Confirmation

**Workflow Name:** `[Modern Amenities] - Workflow - Appointment - Booking Confirmation`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create a booking confirmation workflow that triggers when a customer books an appointment on ANY calendar in the sub-account.

Here is the exact sequence — all steps happen immediately (no waits):

1. Send Email "[Modern Amenities] - Email - Appointment - Booking Confirmation". This is a branded confirmation email with the appointment date, time, location/meeting link, and what to prepare.

2. Send SMS "[Modern Amenities] - SMS - Appointment - Booking Confirmed". Text: "Confirmed! {{contact.first_name}}, your call with {{custom_values.business_name}} is set for {{appointment.start_time}}. Add it to your calendar: {{appointment.add_to_calendar_link}}"

3. Move the opportunity in "Main Sales Pipeline" to the stage "Appointment Scheduled".

4. Also move the opportunity in "Appointment Pipeline" to the stage "Booked".

5. Add tag "[Modern Amenities] - Tag - Status - Appointment Booked" to the contact.

6. Send an internal notification (push + email) to the assigned user: "📅 New appointment booked! {{contact.first_name}} {{contact.last_name}} booked for {{appointment.start_time}}. Calendar: {{appointment.calendar_name}}. Prepare accordingly."

Settings:
- Allow Re-Entry: ON (a contact may book multiple appointments)
- Trigger: Customer Booked Appointment (any calendar)
```

---

### WF-05: Appointment - Reminders (24hr + 1hr)

**Workflow Name:** `[Modern Amenities] - Workflow - Appointment - Reminders (24hr + 1hr)`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create an appointment reminder workflow that triggers when a customer books an appointment (runs in parallel with the booking confirmation workflow).

Here is the exact sequence:

1. Wait until 24 hours before the appointment start time.

2. Send Email "[Modern Amenities] - Email - Appointment - 24hr Reminder". This is a friendly reminder email with the appointment details, location/link, and a reschedule option.

3. Send SMS "[Modern Amenities] - SMS - Appointment - 24hr Reminder". Text: "Reminder: Your call with {{custom_values.business_name}} is TOMORROW at {{appointment.start_time}}. Join here: {{custom_values.meeting_link_or_address}} See you then!"

4. Move the opportunity in "Appointment Pipeline" to the stage "Reminded".

5. Wait until 1 hour before the appointment start time.

6. Send SMS "[Modern Amenities] - SMS - Appointment - 1hr Final Reminder". Text: "1 hour until your call, {{contact.first_name}}! Join here: {{custom_values.meeting_link_or_address}} We're looking forward to it!"

7. Wait until the appointment time passes.

8. If/Else condition: IF the appointment status is marked as "Showed" or "Completed" → Add tag "[Modern Amenities] - Tag - Status - Appointment Showed" (this triggers WF-06). ELSE IF the appointment status is "No Show" → Add tag "[Modern Amenities] - Tag - Status - No Show" (this triggers WF-07).

Settings:
- Allow Re-Entry: ON (contact may have multiple appointments)
- Trigger: Customer Booked Appointment
- Important: Use "Wait until event" or time-based waits relative to the appointment date, NOT fixed waits
```

---

### WF-06: Appointment - Post-Show Follow-Up

**Workflow Name:** `[Modern Amenities] - Workflow - Appointment - Post-Show Follow-Up`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create a post-appointment follow-up workflow that triggers when an appointment status changes to "Completed" or "Showed".

Here is the exact sequence:

1. Immediately — Move the opportunity in "Main Sales Pipeline" to the stage "Appointment Showed".

2. Immediately — Move the opportunity in "Appointment Pipeline" to the stage "Showed".

3. Immediately — Add tag "[Modern Amenities] - Tag - Status - Appointment Showed".

4. Wait 30 minutes.

5. Send SMS "[Modern Amenities] - SMS - Post-Show - Same Day Follow-Up". Text: "Great talking with you, {{contact.first_name}}! Sent you an email with our proposal/next steps. Let me know if you have any questions"

6. Send Email "[Modern Amenities] - Email - Post-Show - Proposal / Next Steps". This email includes the proposal details, pricing/packages, and a clear call to action.

7. Move the opportunity in "Main Sales Pipeline" to the stage "Proposal / Quote Sent".

8. Wait 1 day.

9. Send Email "[Modern Amenities] - Email - Proposal Follow-Up - Day 1". A gentle follow-up asking if they had a chance to review the proposal.

10. Wait until Day 3 after the appointment.

11. Send SMS "[Modern Amenities] - SMS - Proposal Follow-Up - Day 3". Text: "{{contact.first_name}}, just wanted to check any questions on the proposal? Happy to jump on a quick 10-min call to walk through it: {{custom_values.booking_link}}"

12. Wait until Day 7 after the appointment.

13. Send Email "[Modern Amenities] - Email - Proposal Follow-Up - Day 7 Final Push". This is a final push email with urgency and a clear deadline or incentive to decide.

14. Send an internal notification to the assigned user: "⚠️ Proposal follow-up complete for {{contact.first_name}} {{contact.last_name}} with no response after 7 days. Manual follow-up needed. Phone: {{contact.phone}}"

Settings:
- Allow Re-Entry: OFF
- Stop on Reply: Yes
- Trigger: Appointment Status Changed → Completed/Showed
```

---

### WF-07: Appointment - No-Show Recovery

**Workflow Name:** `[Modern Amenities] - Workflow - Appointment - No-Show Recovery`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create a no-show recovery workflow that triggers when an appointment status changes to "No Show". The goal is to sympathetically re-engage the contact and get them to rebook.

Here is the exact sequence:

1. Immediately — Add tag "[Modern Amenities] - Tag - Status - No Show".

2. Immediately — Move the opportunity in "Appointment Pipeline" to the stage "No Show".

3. Wait 15 minutes.

4. Send SMS "[Modern Amenities] - SMS - No-Show - Immediate Recovery". Text: "Hey {{contact.first_name}}, missed you on our call today! Totally understand life gets busy. Want to rebook? Pick a time here: {{custom_values.booking_link}}"

5. Wait 1 hour.

6. Send Email "[Modern Amenities] - Email - No-Show - Rebooking Request". A friendly, understanding email asking them to rebook with an easy one-click calendar link.

7. Wait until Day 1 (next day).

8. Send SMS "[Modern Amenities] - SMS - No-Show - Day 1 Rebooking Nudge". Text: "{{contact.first_name}}, still happy to help! Grab a new time whenever works for you: {{custom_values.booking_link}}"

9. Wait until Day 3.

10. Send Email "[Modern Amenities] - Email - No-Show - Day 3 Final Offer". This is a final attempt email with an incentive or special offer to rebook.

11. Send an internal notification: "🚨 Unrecovered no-show: {{contact.first_name}} {{contact.last_name}} has not rebooked after 3 days. Phone: {{contact.phone}}. Manual outreach recommended."

12. Wait until Day 5.

13. If/Else condition: IF the contact has booked a new appointment → END workflow. ELSE → Add tag "[Modern Amenities] - Tag - Status - Cold Lead" (this will trigger WF-03 Long-Term Nurture Drip).

Settings:
- Allow Re-Entry: OFF
- Stop on Reply: No (we want the full sequence to run unless they rebook)
- Trigger: Appointment Status Changed → No Show
```

---

### WF-08: Missed Call Text Back (MCTB)

**Workflow Name:** `[Modern Amenities] - Workflow - Missed Call Text Back (MCTB)`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create a missed call text back (MCTB) workflow that triggers when an inbound phone call is missed (call status = missed or no answer). This is one of the highest-ROI automations — it immediately texts the caller so they don't go to a competitor.

CRITICAL SETTINGS:
- Allow Re-Entry: OFF (do NOT text the same person multiple times for repeated missed calls)
- Active 24/7 (always on)
- Ring timeout: ensure this works with a 20-second ring timeout

Here is the exact sequence:

1. Immediately — If/Else condition to check if it's during business hours (Monday-Friday, {{custom_values.business_hours_start}} to {{custom_values.business_hours_end}}):

   IF DURING BUSINESS HOURS:
   2a. Wait 30 seconds.
   3a. Send SMS "[Modern Amenities] - SMS - Missed Call - Business Hours". Text: "Hi! You just called {{custom_values.business_name}} and we missed you. We'll call back shortly or book a time: {{custom_values.booking_link}} | Reply STOP to opt out"
   4a. Add tag "[Modern Amenities] - Tag - Source - Missed Call".
   5a. Wait 2 minutes.
   6a. Send internal notification: "📞 Missed call from {{contact.first_name}} {{contact.phone}} during business hours. Call back ASAP!"

   IF AFTER HOURS:
   2b. Wait 30 seconds.
   3b. Send SMS "[Modern Amenities] - SMS - Missed Call - After Hours". Text: "Hey there! You called {{custom_values.business_name}} after hours. We'll reach out first thing tomorrow or grab a time: {{custom_values.booking_link}} | Reply STOP to opt out"
   4b. Add tag "[Modern Amenities] - Tag - Source - After Hours Missed Call".

7. BOTH PATHS CONVERGE — Wait 10 minutes.

8. If/Else condition: IF the contact has NOT replied to the SMS → Send another SMS "[Modern Amenities] - SMS - Missed Call - Booking Link Follow-Up". Text: "{{contact.first_name}}, we don't want you to miss out! Book directly here and skip the phone tag: {{custom_values.booking_link}} takes 60 seconds"

9. Create a new opportunity in "Main Sales Pipeline" → stage "New Lead". Opportunity name: "{{contact.first_name}} {{contact.last_name}} - Missed Call".

Settings:
- Allow Re-Entry: OFF
- Trigger: Call Status = Missed / No Answer
```

---

### WF-09: Deal Won - Client Onboarding

**Workflow Name:** `[Modern Amenities] - Workflow - Deal Won - Client Onboarding`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create a client onboarding workflow that triggers when an opportunity in the "Main Sales Pipeline" moves to the "Won" stage. This is the full onboarding sequence from deal close to active client.

Here is the exact sequence:

1. Immediately — Add tag "[Modern Amenities] - Tag - Status - Active Client".

2. Immediately — Remove these lead-stage tags: "[Modern Amenities] - Tag - Status - Lead Received", "[Modern Amenities] - Tag - Status - Qualified", "[Modern Amenities] - Tag - Status - Cold Lead", "[Modern Amenities] - Tag - Status - No Reply After Instant".

3. Immediately — Create a new opportunity in the "Onboarding Pipeline" at stage "New Client". Opportunity name: "{{contact.first_name}} {{contact.last_name}} - Onboarding".

4. Immediately — Send Email "[Modern Amenities] - Email - Onboarding - Welcome & Next Steps". A warm congratulations email outlining what happens next in the onboarding process.

5. Immediately — Send SMS "[Modern Amenities] - SMS - Onboarding - Welcome to the Team". Text: "Welcome aboard, {{contact.first_name}}! We're so excited to work with you at {{custom_values.business_name}}. Check your email for next steps let's get started!"

6. Wait 1 hour.

7. Send Email "[Modern Amenities] - Email - Onboarding - Portal Access & Login". Login credentials, portal URL, and instructions for getting set up.

8. Wait until Day 1 (next day).

9. Send Email "[Modern Amenities] - Email - Onboarding - Intake Form Request". Asks the client to fill out the intake form so the team can hit the ground running.

10. Move opportunity in Onboarding Pipeline to stage "Onboarding Email Sent".

11. Wait 3 days.

12. If/Else condition: IF the intake form has NOT been submitted → Send SMS "[Modern Amenities] - SMS - Onboarding - Intake Form Reminder". Text: "Hey {{contact.first_name}}, quick reminder to fill out your intake form so we can hit the ground running! Should take 5 mins: {{custom_values.intake_form_link}}"

13. When intake form IS submitted (use a "Wait for Contact Event" or tag trigger) → Move opportunity to stage "Intake Form Completed".

14. Send Email "[Modern Amenities] - Email - Onboarding - Kickoff Call Scheduling". Invites the client to schedule their kickoff call with a calendar link.

15. When kickoff call is booked → Move opportunity to stage "Kickoff Call Scheduled".

16. When kickoff call is completed → Send Email "[Modern Amenities] - Email - Onboarding - Post-Kickoff Checklist". Summary of what was discussed, next action items, and timeline.

17. Move opportunity to stage "Active Client".

Settings:
- Allow Re-Entry: OFF
- Trigger: Opportunity Stage Changed → Won (in Main Sales Pipeline)
```

---

### WF-10: Review Request Automation

**Workflow Name:** `[Modern Amenities] - Workflow - Review Request Automation`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create a review request workflow that triggers when an appointment status changes to "Completed" OR when an opportunity moves to the "Won" stage (with a 30-minute initial delay). The goal is to get happy clients to leave a Google review.

IMPORTANT: This workflow uses Trigger Links. When a contact clicks the review link, they should be tagged and removed from the remaining sequence.

Here is the exact sequence:

1. Wait 30 minutes after the trigger event.

2. Send SMS with the review request. Text: "Hi {{contact.first_name}}! Hope everything went well. If you're happy with {{custom_values.business_name}}, a quick Google review would mean the world to us: {{custom_values.google_review_link}}" — Use the Trigger Link called "[Modern Amenities] - Trigger Link - Review - Google" for the review URL. When clicked, it adds tag "[Modern Amenities] - Tag - Status - Review Clicked".

3. Wait 15 minutes.

4. If/Else condition: IF the Trigger Link "[Modern Amenities] - Trigger Link - Review - Google" was clicked (check for tag "Review Clicked") → Add tag and EXIT the workflow. ELSE → continue.

5. Wait until 3 hours after the original trigger.

6. Send Email "[Modern Amenities] - Email - Review Request - Email 1 (Thank You)". A thank-you email that subtly asks for a review with the Google review Trigger Link.

7. Wait until Day 3 after the trigger.

8. If/Else condition: IF the Trigger Link was clicked → EXIT. ELSE → continue.

9. Send SMS "[Modern Amenities] - SMS - Review Request - Day 3 Reminder". Text: "{{contact.first_name}}, if you haven't had a chance yet here's the quick link to leave us a review: {{custom_values.google_review_link}} Thank you so much!"

10. Wait until Day 6 after the trigger.

11. Send Email "[Modern Amenities] - Email - Review Request - Email 2 (Final Reminder)". The final review request.

12. If negative feedback is detected (contact clicks the Trigger Link "[Modern Amenities] - Trigger Link - Review - Negative Feedback") → Send an URGENT internal notification: "🚨 URGENT: {{contact.first_name}} {{contact.last_name}} indicated a negative experience. Contact them immediately. Phone: {{contact.phone}}"

Settings:
- Allow Re-Entry: OFF
- Trigger: Appointment Status = Completed OR Opportunity Stage = Won
```

---

### WF-11: Stale Opportunity Alert

**Workflow Name:** `[Modern Amenities] - Workflow - Stale Opportunity Alert`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create a stale opportunity monitoring workflow. This workflow should detect when opportunities have been sitting idle in certain pipeline stages for too long, and send internal alerts to the assigned team member.

This workflow needs MULTIPLE triggers or conditions based on how long an opportunity has been in each stage. Here are the rules:

RULE 1: If an opportunity has been in the "New Lead" stage of "Main Sales Pipeline" for 5+ days with no activity:
→ Send internal notification to the opportunity owner: "⏰ Stale Alert: {{contact.first_name}} {{contact.last_name}} has been in 'New Lead' for 5+ days with no activity. Take action now! Phone: {{contact.phone}}"

RULE 2: If an opportunity has been in the "Qualified" stage for 7+ days with no activity:
→ Send internal notification: "⏰ Stale Alert: {{contact.first_name}} {{contact.last_name}} has been 'Qualified' for 7+ days. Follow up needed!"

RULE 3: If an opportunity has been in the "Appointment Scheduled" stage for 3+ days:
→ Send SMS to the CONTACT: "[Modern Amenities] - SMS - Stale - Appointment Reminder Check-In". Text: "Hey {{contact.first_name}}, noticed your appointment is coming up soon still on for {{appointment.start_time}}? Reply YES to confirm or click to reschedule: {{custom_values.reschedule_link}}"

RULE 4: If an opportunity has been in the "Proposal / Quote Sent" stage for 10+ days:
→ Send internal notification + Send Email "[Modern Amenities] - Email - Stale - Proposal Check-In" to the contact.

RULE 5: If an opportunity has been in the "Nurture / Long-Term" stage for 30+ days:
→ Add tag "[Modern Amenities] - Tag - Status - Dormant Lead" (this may trigger the reactivation workflow).

Settings:
- Allow Re-Entry: ON (opportunities can become stale multiple times)
- This may need to be set up as multiple separate workflows or use the "Stale Opportunity" trigger if available in GHL
- Check daily for stale opportunities
```

---

### WF-12: Lead Source Tagging & Routing

**Workflow Name:** `[Modern Amenities] - Workflow - Lead Source Tagging & Routing`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create a lead source tagging and routing workflow that triggers when ANY new contact is created in the system. This workflow automatically tags contacts based on their lead source and routes them to the right team member.

Here is the exact sequence — use If/Else branches based on the contact's source field:

1. Check the contact's source/attribution data:

   IF source contains "Facebook" or "facebook" or "fb":
   → Add tag "[Modern Amenities] - Tag - Source - Facebook"
   → Assign contact to the Facebook-specialist team member (or round robin if no specialist)

   ELSE IF source contains "Google" or "google" or "adwords" or "ppc":
   → Add tag "[Modern Amenities] - Tag - Source - Google"
   → Assign contact to the Google Ads specialist

   ELSE IF source contains "Referral" or "referral" or "referred":
   → Add tag "[Modern Amenities] - Tag - Source - Referral"
   → Send an extra thank-you SMS to the contact: "Thanks for being referred to us, {{contact.first_name}}! Referrals mean the world to us. We'll take great care of you."

   ELSE IF source contains "Organic" or "organic" or "website" or "seo":
   → Add tag "[Modern Amenities] - Tag - Source - Organic Website"

   ELSE IF source contains "Cold" or "cold" or "outbound" or "outreach":
   → Add tag "[Modern Amenities] - Tag - Source - Cold Outreach"

   ELSE (default / unknown source):
   → Add tag "[Modern Amenities] - Tag - Source - Other / Unknown"

2. ALL PATHS CONVERGE — Update the custom field "Lead Source Date" (field key: lead_source_date) to today's date using {{date.today}}.

Settings:
- Allow Re-Entry: OFF
- Trigger: Contact Created (all sources)
```

---

### WF-13: Inbound Auto-Reply (Out of Hours)

**Workflow Name:** `[Modern Amenities] - Workflow - Inbound Auto-Reply (Out of Hours)`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create an after-hours auto-reply workflow that triggers when a customer sends an inbound message (SMS, email, or chat) OUTSIDE of business hours. The purpose is to acknowledge their message and set expectations for a response.

Here is the exact sequence:

1. TRIGGER FILTER: Only fire this workflow when the message is received OUTSIDE of business hours. Business hours are Monday-Friday {{custom_values.business_hours_start}} to {{custom_values.business_hours_end}}. If the message arrives DURING business hours, the workflow should NOT fire (exit immediately).

2. If/Else condition checking if it IS outside business hours:

   IF OUTSIDE BUSINESS HOURS:
   3. Send SMS "[Modern Amenities] - SMS - Auto-Reply - After Hours". Text: "Thanks for reaching out to {{custom_values.business_name}}! We're currently closed but will respond first thing at {{custom_values.business_hours_start}}. Talk soon!"

   4. Add tag "[Modern Amenities] - Tag - Status - After Hours Inquiry".

   5. Send internal notification to the assigned user or team: "📩 After-hours message received from {{contact.first_name}} {{contact.last_name}} ({{contact.phone}}). Will need response at start of business."

   IF DURING BUSINESS HOURS:
   → Exit / do nothing (no auto-reply during working hours — the team should respond manually).

Settings:
- Allow Re-Entry: ON (but add a cooldown of 24 hours so the same contact doesn't get multiple auto-replies in one night)
- Trigger: Customer Replied (any channel)
- Filter: Only outside business hours
```

---

### WF-14: Contact Do-Not-Contact Opt-Out Handler

**Workflow Name:** `[Modern Amenities] - Workflow - Contact Do-Not-Contact Opt-Out Handler`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create a Do-Not-Contact (DNC) opt-out handler workflow. This is a LEGALLY REQUIRED workflow that must be active at ALL times with no exceptions. It triggers when a contact unsubscribes from SMS or email, or when the DNC custom field is set to "Yes".

TRIGGERS (any of these):
- Contact replies "STOP" to SMS (SMS unsubscribe)
- Contact clicks email unsubscribe link
- Custom field "DNC Status" (key: dnc_status) is updated to "Yes"
- Tag "[Modern Amenities] - Tag - Status - DNC / Opted Out" is added manually

Here is the exact sequence — ALL steps happen immediately:

1. Remove the contact from ALL active workflows and campaigns. Use the "Remove from Workflow" action for every active workflow, or use the bulk "Remove from all workflows" option if available.

2. Add tag "[Modern Amenities] - Tag - Status - DNC / Opted Out".

3. Update custom field "DNC Status" (key: dnc_status) to "Yes".

4. Update custom field "DNC Date" (key: dnc_date) to today's date.

5. Remove any communication-related tags like "Lead Received", "Cold Lead", "Active Client" etc. — this ensures no other workflow re-enrolls them.

6. Send internal notification to the contact owner and admin: "⛔ Contact opted out: {{contact.first_name}} {{contact.last_name}} ({{contact.email}} / {{contact.phone}}) has opted out of communications. All workflows removed. DO NOT contact."

CRITICAL SETTINGS:
- Allow Re-Entry: ON (in case the opt-out triggers fire multiple times, each should be processed)
- This workflow must NEVER be deactivated
- Do NOT send any outbound SMS or email in this workflow (the contact has opted out!)
```

---

## PHASE 2 — GROWTH (Workflows 15-23)

---

### WF-15: Database Reactivation Campaign

**Workflow Name:** `[Modern Amenities] - Workflow - Database Reactivation Campaign`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create a database reactivation campaign workflow designed to re-engage cold leads who haven't interacted in 60+ days. This can be triggered manually by enrolling contacts from a Smart List, or triggered when a contact has been tagged with "[Modern Amenities] - Tag - Status - Reactivation Eligible".

Here is the exact sequence over 9 days:

1. Day 1 Morning (9:00 AM) — Send SMS "[Modern Amenities] - SMS - Reactivation - Day 1 Personal Re-Intro". Text: "Hey {{contact.first_name}}! This is {{custom_values.owner_name}} from {{custom_values.business_name}}. Wanted to personally check in are you still looking for help with {{custom_values.service_category}}?"

2. Day 1 Afternoon (2:00 PM) — Send Email "[Modern Amenities] - Email - Reactivation - Day 1 We Missed You". A warm, personal "we missed you" email re-introducing the business and what's new.

3. Day 2 — Drop a voicemail using the script "[Modern Amenities] - Voicemail - Reactivation Check-In". Script: "Hey {{contact.first_name}}, it's {{custom_values.owner_name}} from {{custom_values.business_name}}. It's been a little while since we connected and I just wanted to personally check in we've had some updates I think you'd find valuable. Give me a quick call at {{custom_values.business_phone}} or grab a time at {{custom_values.booking_link}}. Hope to chat soon!"

4. Day 4 — Send SMS "[Modern Amenities] - SMS - Reactivation - Day 4 Limited Time Offer". Text: "{{contact.first_name}}, we're running a special for past inquiries this week only: {{custom_values.reactivation_offer}}. Grab it here: {{custom_values.booking_link}} (expires {{custom_values.offer_expiry_date}})"

5. Day 6 — Send Email "[Modern Amenities] - Email - Reactivation - Day 6 Social Proof + Offer". An email with fresh client success stories plus the limited-time offer.

6. Day 9 — Send SMS "[Modern Amenities] - SMS - Reactivation - Day 9 Final Message". Text: "Last one, {{contact.first_name}} didn't want to leave things open. If the timing is ever right, we're one message away. Take care!"

7. Day 9 — If/Else condition: IF the contact has replied OR booked an appointment during this 9-day sequence → Add tag "[Modern Amenities] - Tag - Status - Reactivated", remove tag "Cold Lead", and move opportunity back to "New Lead" stage. Then EXIT. ELSE → Add tag "[Modern Amenities] - Tag - Status - Archived". END.

Settings:
- Allow Re-Entry: OFF
- Stop on Reply: Yes
- Trigger: Tag Added "[Modern Amenities] - Tag - Status - Reactivation Eligible" OR manual enrollment
```

---

### WF-16: Referral Request Campaign

**Workflow Name:** `[Modern Amenities] - Workflow - Referral Request Campaign`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create a referral request workflow that triggers when the tag "[Modern Amenities] - Tag - Status - Active Client" is added to a contact. However, the sequence should NOT start immediately — wait 30 days after the tag is added before sending the first message. This gives the client time to experience your service before you ask for referrals.

Here is the exact sequence:

1. Wait 30 days after the "Active Client" tag is added.

2. Send Email "[Modern Amenities] - Email - Referral - Program Introduction". This email introduces your referral program, explains the reward ({{custom_values.referral_reward_description}}), and includes a link to the referral submission form.

3. Wait 2 more days (Day 32 total).

4. Send SMS "[Modern Amenities] - SMS - Referral - Quick Ask". Text: "{{contact.first_name}}, do you know anyone who could benefit from {{custom_values.service_category}}? You'll receive {{custom_values.referral_reward_description}} for every referral who signs up"

5. When a referral is submitted (detected via the referral form submission or tag) — this part may need to be a separate workflow or use a webhook:
   a. On the NEW referred contact: Add tag "[Modern Amenities] - Tag - Source - Referral".
   b. Send SMS to the ORIGINAL referrer: "[Modern Amenities] - SMS - Referral - Thank You to Referrer". Text: "{{contact.first_name}}, your referral just came through! Thank you so much we'll take great care of them. Your reward: {{custom_values.referral_reward_description}}"
   c. Create an opportunity in "Referral & Upsell Pipeline" at stage "Referral Received" for the NEW contact.

Settings:
- Allow Re-Entry: OFF
- Trigger: Tag Added "[Modern Amenities] - Tag - Status - Active Client"
```

---

### WF-17: Upsell / Cross-Sell Sequence

**Workflow Name:** `[Modern Amenities] - Workflow - Upsell / Cross-Sell Sequence`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create an upsell/cross-sell workflow that triggers when the tag "[Modern Amenities] - Tag - Status - Upsell Candidate" is added to a contact, OR 30 days after an opportunity is moved to "Won" stage.

Here is the exact sequence over 10 days:

1. Day 1 — Send Email "[Modern Amenities] - Email - Upsell - Introduction to Premium Offer". This email introduces a premium/upgraded version of the service, highlighting the additional value and benefits.

2. Day 3 — Send SMS "[Modern Amenities] - SMS - Upsell - Quick Upgrade Check-In". Text: "Hey {{contact.first_name}}! Wanted to share something that could really level up your results mind if I send over some info? Just reply YES!"

3. Day 5 — Send Email "[Modern Amenities] - Email - Upsell - Case Study of Upgraded Clients". This email features a case study of clients who upgraded and the results they achieved.

4. Day 7 — Send SMS "[Modern Amenities] - SMS - Upsell - Day 7 Decision Nudge". Text: "{{contact.first_name}}, the upgrade offer wraps up {{custom_values.offer_expiry_date}}. Happy to answer any questions before then!"

5. Day 10 — Send internal notification to the assigned sales rep: "📞 Manual call needed: {{contact.first_name}} {{contact.last_name}} has been through the upsell sequence without converting. A personal call may close this. Phone: {{contact.phone}}"

Settings:
- Allow Re-Entry: OFF
- Stop on Reply: Yes
- Trigger: Tag Added "[Modern Amenities] - Tag - Status - Upsell Candidate"
```

---

### WF-18: Holiday & Seasonal Campaign

**Workflow Name:** `[Modern Amenities] - Workflow - Holiday & Seasonal Campaign`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create a simple holiday/seasonal greeting workflow. This is a manually-triggered workflow that you schedule to run on specific holiday dates throughout the year (New Year's, Valentine's Day, 4th of July, Thanksgiving, Christmas, etc.).

Here is the exact sequence:

1. Send Email "[Modern Amenities] - Email - Seasonal - Holiday Greeting". A branded holiday greeting email with warm wishes from the team. The email should use custom values for personalization and include the business logo.

2. If/Else condition: Check if the contact has SMS consent (has not opted out of SMS):
   IF SMS consent is confirmed:
   → Send SMS: "Happy [Holiday]! Wishing you and yours a wonderful day. From all of us at {{custom_values.business_name}} 🎉"

   ELSE:
   → Skip SMS (only email was sent).

Settings:
- Allow Re-Entry: ON (contacts should receive greetings for each holiday)
- Trigger: Manual / Scheduled date (you will manually schedule this for each holiday)
- This workflow is NOT always active — activate it before each holiday and deactivate after
```

---

### WF-19: Deal Lost - Competitor Debrief

**Workflow Name:** `[Modern Amenities] - Workflow - Deal Lost - Competitor Debrief`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create a deal-lost follow-up workflow that triggers when an opportunity in the "Main Sales Pipeline" moves to the "Lost" stage. The goal is to gracefully part ways, gather feedback on why the deal was lost, and set up a future reactivation attempt.

Here is the exact sequence:

1. Immediately — Add tag "[Modern Amenities] - Tag - Status - Lost Deal".

2. Wait 1 day (give them space, don't message immediately after losing).

3. Send Email "[Modern Amenities] - Email - Lost Deal - Graceful Goodbye + Feedback". A classy, non-pushy email thanking them for their time, wishing them well, and including a SHORT feedback survey (2-3 questions: Why did you decide not to proceed? Did you go with another provider? What could we have done better?).

4. Update custom field "Lost Reason" (key: lost_reason) — if GHL supports auto-filling from the opportunity's lost reason, use that. Otherwise, leave for manual entry or feedback form response.

5. Wait 30 days.

6. Add tag "[Modern Amenities] - Tag - Status - Reactivation Eligible". This tag will trigger WF-15 (Database Reactivation Campaign) to re-engage the contact after enough time has passed.

Settings:
- Allow Re-Entry: OFF
- Trigger: Opportunity Stage Changed → Lost (Main Sales Pipeline)
```

---

### WF-20: Webinar / Event Registration Flow

**Workflow Name:** `[Modern Amenities] - Workflow - Webinar / Event Registration Flow`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create a webinar/event registration and follow-up workflow that triggers when the form "[Modern Amenities] - Form - Webinar Registration" is submitted.

Here is the exact sequence:

1. Immediately — Send Email "[Modern Amenities] - Email - Webinar - Registration Confirmation + Zoom Link". Confirms registration, includes the webinar title ({{custom_values.webinar_title}}), date ({{custom_values.webinar_date}}), time ({{custom_values.webinar_time}}), and the join link ({{custom_values.webinar_link}}).

2. Immediately — Send SMS "[Modern Amenities] - SMS - Webinar - You're Registered!". Text: "You're in, {{contact.first_name}}! {{custom_values.webinar_title}} {{custom_values.webinar_date}} at {{custom_values.webinar_time}}. Link in your email. See you there!"

3. Add tag "[Modern Amenities] - Tag - Status - Webinar Registered".

4. Wait until 24 hours before the webinar date/time.

5. Send Email "[Modern Amenities] - Email - Webinar - 24hr Reminder + Agenda". Reminder email with the agenda, what they'll learn, and the join link.

6. Wait until 1 hour before the webinar.

7. Send SMS "[Modern Amenities] - SMS - Webinar - 1hr Countdown Reminder". Text: "1 hour until {{custom_values.webinar_title}}! Join here: {{custom_values.webinar_link}} Can't wait to see you live, {{contact.first_name}}!"

8. Wait until 1 hour after the webinar ends.

9. Send Email "[Modern Amenities] - Email - Webinar - Post-Event Replay + CTA". Email with the replay link, key takeaways, and a call to action (book a strategy call).

10. Wait 2 days after the webinar.

11. Send SMS "[Modern Amenities] - SMS - Webinar - Post-Event Offer". Text: "Thanks for attending, {{contact.first_name}}! Ready to take the next step? Book your free strategy call here: {{custom_values.booking_link}}"

Settings:
- Allow Re-Entry: OFF (per event — may need separate workflows per webinar or use custom values for dates)
- Trigger: Form Submitted → Webinar Registration form
```

---

### WF-21: Birthday / Anniversary Recognition

**Workflow Name:** `[Modern Amenities] - Workflow - Birthday / Anniversary Recognition`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create a birthday and anniversary recognition workflow that triggers based on a contact's date custom field (Birthday or Anniversary date). When the date matches today, the workflow should fire and send personalized messages.

Here is the exact sequence:

1. On the contact's birthday/anniversary date — Send SMS "[Modern Amenities] - SMS - Relationship - Happy Birthday". Text: "Happy Birthday, {{contact.first_name}}! Wishing you an incredible day. From everyone at {{custom_values.business_name}}"

2. On the same day — Send Email "[Modern Amenities] - Email - Relationship - Personal Celebration Note". A personalized birthday/anniversary email with warm wishes and optionally a special birthday discount or offer.

Settings:
- Allow Re-Entry: ON (this should fire every year on their birthday)
- Trigger: Date Field = Contact's Birthday / Anniversary (use the "Date" trigger or "Contact Birthday" trigger if available in GHL)
- This is a simple 2-step workflow — keep it clean
```

---

### WF-22: Payment / Invoice Follow-Up

**Workflow Name:** `[Modern Amenities] - Workflow - Payment / Invoice Follow-Up`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create a payment/invoice follow-up workflow that triggers when an invoice is sent to a contact OR when the tag "[Modern Amenities] - Tag - Status - Invoice Sent" is added.

Here is the exact sequence:

1. Wait 1 day after the invoice is sent.

2. Send Email "[Modern Amenities] - Email - Invoice - Friendly Payment Reminder". A polite, friendly reminder that an invoice is pending. Include the invoice number and a payment link.

3. Wait until Day 3 after the invoice was sent.

4. Send SMS "[Modern Amenities] - SMS - Invoice - Quick Payment Check-In". Text: "Hi {{contact.first_name}}, quick reminder that invoice #{{custom_fields.invoice_number}} from {{custom_values.business_name}} is due. Pay securely here: {{custom_fields.invoice_link}}"

5. Wait until Day 7 after the invoice was sent.

6. If/Else condition: Check if the invoice has been paid (tag "Invoice Paid" exists or payment received):

   IF UNPAID:
   → Send Email "[Modern Amenities] - Email - Invoice - Final Payment Request". A firmer but still professional email noting this is the final reminder.
   → Send internal notification: "💰 OVERDUE: Invoice for {{contact.first_name}} {{contact.last_name}} is 7 days overdue. Amount: {{custom_fields.invoice_amount}}. Manual follow-up required."

   IF PAID:
   → Exit workflow (no further action needed).

Settings:
- Allow Re-Entry: ON (a contact may have multiple invoices)
- Stop on Payment: Yes — if payment is detected, stop the sequence
- Trigger: Invoice Sent OR Tag Added "Invoice Sent"
```

---

### WF-23: Contact Engagement Score Updater

**Workflow Name:** `[Modern Amenities] - Workflow - Contact Engagement Score Updater`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create an engagement scoring workflow that tracks contact engagement across multiple events and updates a numeric custom field called "Engagement Score" (key: engagement_score). This helps identify hot leads vs cold leads based on their behavior.

This workflow needs MULTIPLE triggers. You may need to create SEPARATE workflows for each trigger type, all updating the same custom field:

TRIGGER 1 — Email Opened:
→ Update custom field "Engagement Score": add +1 to the current value
→ (Engagement Score = Engagement Score + 1)

TRIGGER 2 — Link/Email Link Clicked:
→ Update custom field "Engagement Score": add +3 to the current value

TRIGGER 3 — Form Submitted:
→ Update custom field "Engagement Score": add +10 to the current value

TRIGGER 4 — Reply Received (inbound SMS or email):
→ Update custom field "Engagement Score": add +5 to the current value
→ Add tag "[Modern Amenities] - Tag - Status - Engaged"

TRIGGER 5 — No Activity for 30 days (stale/inactive):
→ Update custom field "Engagement Score": subtract -5 from the current value
→ If Engagement Score drops below 0, set it to 0
→ Add tag "[Modern Amenities] - Tag - Status - Cold Lead"

NOTE: GHL's workflow math operations may be limited. If you cannot do math operations on custom fields directly in the workflow builder, use a webhook to an external tool or use the "Update Custom Field" action with a calculated value. Alternatively, use GHL's built-in lead scoring if available.

Settings:
- Allow Re-Entry: ON for all triggers (engagement events happen repeatedly)
- These may need to be 5 separate small workflows, one per trigger type
```

---

## PHASE 3 — POWER USER (Workflows 24-28)

---

### WF-24: AI Conversation Bot Handoff

**Workflow Name:** `[Modern Amenities] - Workflow - AI Conversation Bot Handoff`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create an AI conversation bot handoff workflow that triggers when an inbound SMS or chat message is received during business hours. This workflow activates the GHL Conversation AI bot to handle initial lead qualification, and hands off to a human when needed.

Here is the exact sequence:

1. TRIGGER: Inbound SMS or Chat received during business hours.

2. Activate the Conversation AI bot (use GHL's built-in "Conversation AI" or "Bot" action). Set the bot to operate as a "Lead Qualifier" — it should:
   - Greet the contact warmly using the business name
   - Ask qualifying questions (what service they need, timeline, budget range)
   - Attempt to book an appointment via the calendar link
   - Answer basic FAQs about the business

3. When the AI bot qualifies the lead (detects buying intent or the contact agrees to book):
   → Add tag "[Modern Amenities] - Tag - Status - AI Qualified"
   → Move the opportunity to the "Qualified" stage in Main Sales Pipeline
   → Continue monitoring the conversation

4. When a handoff trigger occurs (the AI detects it cannot answer, the contact asks for a human, or a complex question arises):
   → Send internal notification to the assigned user: "🤖→👤 AI Bot Handoff: {{contact.first_name}} {{contact.last_name}} needs a human. The AI could not resolve their query. Jump in now! Conversation: [link to conversation]"
   → Disable the AI bot for this conversation (switch to manual mode)

5. If the AI bot cannot answer after 2 attempts:
   → Send internal notification for manual takeover
   → Assign the conversation to the next available team member

Settings:
- Allow Re-Entry: ON
- Trigger: Inbound Message (SMS/Chat) during business hours
- Requires GHL Conversation AI to be configured and trained with your business FAQs
```

---

### WF-25: Membership / Course Access Delivery

**Workflow Name:** `[Modern Amenities] - Workflow - Membership / Course Access Delivery`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create a membership/course access delivery and onboarding workflow that triggers when a payment is received for a membership product OR when the tag "[Modern Amenities] - Tag - Status - Member" is added to a contact.

Here is the exact sequence:

1. Immediately — Grant access to the membership/course called "Core Program" (use GHL's membership access action to add the contact to the membership product).

2. Immediately — Send Email "[Modern Amenities] - Email - Membership - Welcome & Access Instructions". This email includes login credentials, the membership portal URL ({{custom_values.membership_login_url}}), and getting-started instructions.

3. Immediately — Send SMS "[Modern Amenities] - SMS - Membership - Your Access Is Ready". Text: "{{contact.first_name}}, your membership is live! Access {{custom_values.membership_program_name}} here: {{custom_values.membership_login_url}} Let's go!"

4. Wait 3 days.

5. Send Email "[Modern Amenities] - Email - Membership - Getting Started Guide". Tips on where to start, what to do first, and how to get the most value from the membership.

6. Wait until Day 7.

7. Send Email "[Modern Amenities] - Email - Membership - Week 1 Check-In". Text: Check in to see how they're doing, ask if they have questions, encourage engagement with the community.

8. Wait until Day 14.

9. Send SMS "[Modern Amenities] - SMS - Membership - How Is It Going?". Text: "Hey {{contact.first_name}}! 2 weeks into {{custom_values.membership_program_name}} how is it going? Any questions? Just reply here and I'll help personally"

10. Wait until Day 30.

11. Send Email "[Modern Amenities] - Email - Membership - Month 1 Milestone + Upsell". Congratulate them on the first month, highlight what they've accomplished, and introduce an upsell to a premium tier or additional product.

Settings:
- Allow Re-Entry: OFF
- Trigger: Payment Received (membership product) OR Tag Added "Member"
```

---

### WF-26: SaaS Trial Onboarding

**Workflow Name:** `[Modern Amenities] - Workflow - SaaS Trial Onboarding`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create a SaaS trial onboarding workflow that triggers when a new sub-account is created OR when the tag "[Modern Amenities] - Tag - Status - SaaS Trial" is added to a contact. This is a 16-day trial nurture sequence designed to convert trial users to paying customers.

Here is the exact sequence:

1. Immediately — Send Email "[Modern Amenities] - Email - SaaS Trial - Welcome + Login + Quick Start". Welcome email with login URL ({{custom_values.saas_login_url}}), quick-start guide, and what to do in the first 24 hours.

2. Immediately — Send SMS "[Modern Amenities] - SMS - SaaS Trial - You're In!". Text: "Welcome to {{custom_values.saas_product_name}}, {{contact.first_name}}! Your trial is active. Login here: {{custom_values.saas_login_url}} Your 14-day journey starts NOW!"

3. Day 2 — Send Email "[Modern Amenities] - Email - SaaS Trial - Feature Highlight #1". Highlights the #1 most valuable feature with a walkthrough or video tutorial.

4. Day 5 — Send Email "[Modern Amenities] - Email - SaaS Trial - Feature Highlight #2". Highlights the second key feature with real-world examples.

5. Day 10 — Send SMS "[Modern Amenities] - SMS - SaaS Trial - Midpoint Check-In". Text: "{{contact.first_name}}, you're halfway through your {{custom_values.saas_product_name}} trial! Need help getting set up? Book a quick onboarding call: {{custom_values.booking_link}}"

6. Day 14 — Send Email "[Modern Amenities] - Email - SaaS Trial - Upgrade or Lose Access". Urgency email: trial is ending, here's what you'll lose, upgrade now to keep access. Include the upgrade link: {{custom_values.upgrade_payment_link}}.

7. Day 16 — Send SMS "[Modern Amenities] - SMS - SaaS Trial - Last Chance to Upgrade". Text: "{{contact.first_name}}, your {{custom_values.saas_product_name}} trial ends TOMORROW. Upgrade now to keep access: {{custom_values.upgrade_payment_link}}"

Settings:
- Allow Re-Entry: OFF
- Trigger: Tag Added "SaaS Trial" OR Sub-Account Created
```

---

### WF-27: AI Review Response Automation

**Workflow Name:** `[Modern Amenities] - Workflow - AI Review Response Automation`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create an AI-powered review response workflow that triggers when a new Google review is received (use GHL's reputation management trigger "New Review Received").

Here is the logic with If/Else branching based on the review star rating:

1. TRIGGER: New Review Received.

2. If/Else condition based on the star rating:

   IF 5-STAR REVIEW:
   → Use GHL's AI/GPT action to draft a personalized thank-you response. Prompt for the AI: "Write a warm, professional 2-3 sentence thank-you response to a 5-star Google review from {{contact.first_name}} for {{custom_values.business_name}}. Mention how much we appreciate their kind words and that we look forward to continuing to serve them. Keep it authentic and not overly corporate."
   → Auto-publish the response (or send for approval if you prefer a human review step).
   → Update custom field "Last Review Date" to today.
   → Update custom field "Last Review Rating" to 5.

   IF 4-STAR REVIEW:
   → Use AI to draft a mild thank-you response. Prompt: "Write a warm 2-3 sentence response to a 4-star Google review from {{contact.first_name}} for {{custom_values.business_name}}. Thank them for the review and acknowledge that we always aim to improve. Keep it genuine."
   → DO NOT auto-publish. Send to a human team member for review before posting.
   → Send internal notification: "⭐⭐⭐⭐ 4-star review from {{contact.first_name}}. AI has drafted a response — please review and approve before publishing."
   → Update Last Review Date and Rating fields.

   IF 1, 2, or 3-STAR REVIEW:
   → DO NOT auto-respond. NO AI response should be published.
   → Send URGENT internal notification: "🚨 URGENT: {{contact.first_name}} {{contact.last_name}} left a {{review.rating}}-star review! Do NOT auto-respond. Read the review and personally address their concerns. Review content: {{review.body}}"
   → Update Last Review Date and Rating fields.
   → Add tag "[Modern Amenities] - Tag - Status - Negative Review Alert".

Settings:
- Allow Re-Entry: ON (contact may leave multiple reviews over time)
- Trigger: New Review Received (Reputation Management)
- CRITICAL: Never auto-publish responses to reviews under 5 stars without human approval
```

---

### WF-28: Affiliate Tracking & Payout

**Workflow Name:** `[Modern Amenities] - Workflow - Affiliate Tracking & Payout`

**Paste this prompt into GHL AI Workflow Builder:**

```
Create an affiliate tracking and payout notification workflow that triggers when an opportunity moves to the "Won" stage in the Main Sales Pipeline, BUT only if the contact has an Affiliate ID populated in their custom field.

Here is the exact sequence:

1. TRIGGER: Opportunity Stage Changed → Won (Main Sales Pipeline).

2. If/Else condition: Check if the custom field "Affiliate ID" (key: affiliate_id) is populated / not empty.

   IF AFFILIATE ID IS EMPTY:
   → Exit workflow. This deal has no affiliate — do nothing.

   IF AFFILIATE ID IS POPULATED:
   → Continue to the next steps.

3. Add tag "[Modern Amenities] - Tag - Source - Affiliate" to the contact.

4. Add a tag with the affiliate's name if available: "[Modern Amenities] - Tag - Affiliate - {{custom_fields.affiliate_name}}" (or use a note if dynamic tags aren't supported).

5. Send Email to the AFFILIATE (not the client). You'll need to use the affiliate's email from a custom field. Email template: "[Modern Amenities] - Email - Affiliate - Commission Earned Notification". This email should say: "Great news! Your referral {{contact.first_name}} {{contact.last_name}} just became a client. Your commission for this deal is being processed. Details: Deal Value: {{opportunity.monetary_value}}, Commission Rate: {{custom_values.affiliate_commission_rate}}, Expected Payout: calculated amount."

6. Send internal notification to the finance/admin team: "💰 Affiliate Payout Due! Affiliate: {{custom_fields.affiliate_name}} (ID: {{custom_fields.affiliate_id}}). Deal: {{contact.first_name}} {{contact.last_name}}. Value: {{opportunity.monetary_value}}. Process commission per affiliate agreement."

7. Update custom field "Total Affiliate Revenue" (key: total_affiliate_revenue) — add the current deal value to the running total.

Settings:
- Allow Re-Entry: ON (an affiliate may refer multiple clients)
- Trigger: Opportunity Stage Changed → Won
- Filter: Custom field "Affiliate ID" is not empty
```

---

## QUICK REFERENCE: Build Order

I recommend building in this order (dependencies first):

| Priority | Workflow | Why First |
|----------|----------|-----------|
| 1 | **WF-14** (DNC Opt-Out) | Legal requirement — must be active before ANY outbound messages |
| 2 | **WF-04** (Booking Confirmation) | Needed by calendars |
| 3 | **WF-05** (Appointment Reminders) | Needed by calendars |
| 4 | **WF-01** (Speed-to-Lead) | Core lead capture flow |
| 5 | **WF-08** (Missed Call Text Back) | High ROI, simple to build |
| 6 | **WF-12** (Lead Source Tagging) | Tags all new contacts |
| 7 | **WF-13** (After Hours Auto-Reply) | Quick win |
| 8 | **WF-02** (7-Day Follow-Up) | Connects from WF-01 |
| 9 | **WF-06** (Post-Show Follow-Up) | Appointment lifecycle |
| 10 | **WF-07** (No-Show Recovery) | Appointment lifecycle |
| 11 | **WF-03** (90-Day Nurture) | Long-term drip |
| 12 | **WF-09** (Client Onboarding) | Deal won flow |
| 13 | **WF-10** (Review Request) | Post-service flow |
| 14 | **WF-11** (Stale Opportunity) | Pipeline maintenance |
| 15-23 | **Phase 2 workflows** | Growth features |
| 24-28 | **Phase 3 workflows** | Power user features |

---

## NOTES

### Before You Start Building
1. **Email templates** must exist before building workflows that reference them (46 email templates already created via API)
2. **SMS templates** need to be created manually in GHL before connecting them in workflows
3. **Tags** are already created via API (43 tags)
4. **Pipelines & Stages** are already created via API (4 pipelines, 32 stages)
5. **Custom Fields & Values** are already created via API (31 fields, 59 values)
6. **Trigger Links** (6) should be created before WF-10 and WF-16

### After Building Each Workflow
- Test with a test contact before activating
- Verify all email/SMS template connections
- Verify pipeline and stage names match exactly
- Check Allow Re-Entry settings
- Set business hours correctly where applicable
- PUBLISH the workflow (draft workflows don't fire)
