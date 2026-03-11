# Modern Amenities Solutions - GHL Manual Build Guide

> **Assets created via API (completed):** 59 Custom Values, 31 Custom Fields, 43 Tags, 4 Pipelines (32 stages total)
>
> **This guide covers all remaining assets that must be built manually in the GHL UI.**

---

## TABLE OF CONTENTS

1. [Calendars (4)](#1-calendars)
2. [Workflows/Automations (28)](#2-workflows--automations)
3. [Forms & Surveys (7)](#3-forms--surveys)
4. [Funnels & Landing Pages (10)](#4-funnels--landing-pages)
5. [Email Templates (46)](#5-email-templates)
6. [SMS Templates (42)](#6-sms-templates)
7. [Trigger Links (6)](#7-trigger-links)
8. [Website Pages (7)](#8-website-pages)
9. [Chat Widget (1)](#9-chat-widget)
10. [Smart Lists (15)](#10-smart-lists)
11. [Reporting Dashboards (3)](#11-reporting-dashboards)
12. [Memberships/Courses (6)](#12-memberships--courses)
13. [Voicemail Scripts (2)](#13-voicemail-scripts)
14. [Social Post Templates (4)](#14-social-post-templates)
15. [Reputation Management Setup](#15-reputation-management)

---

## 1. CALENDARS

> Calendars require team members assigned. Add team members first, then create these.

### 1.1 [Modern Amenities] - Calendar - Discovery Call
- **Type:** Simple (1-on-1)
- **Duration:** 30 minutes
- **Buffer After:** 15 minutes
- **Max Advance Booking:** 14 days
- **Confirmation:** Auto-Confirm → triggers WF-04
- **Location:** `{{custom_values.meeting_link_or_address}}`
- **Custom Questions:** What's your biggest challenge? | How did you hear about us? | Phone number
- **Connected Workflows:** WF-04 Booking Confirmation + WF-05 Reminders

### 1.2 [Modern Amenities] - Calendar - Strategy / Consultation Call
- **Type:** Simple (1-on-1)
- **Duration:** 60 minutes
- **Buffer After:** 15 minutes
- **Confirmation:** Auto-Confirm
- **Custom Questions:** Business type | Current monthly revenue | Main goal | Timeline
- **Connected Workflows:** WF-04 + WF-05

### 1.3 [Modern Amenities] - Calendar - Group / Class / Webinar Booking
- **Type:** Class / Group Calendar
- **Max Attendees:** `{{custom_values.max_class_size}}`
- **Duration:** `{{custom_values.class_duration}}`
- **Recurring:** Enable
- **Connected Workflow:** WF-20 Webinar Registration Flow

### 1.4 [Modern Amenities] - Calendar - Round Robin Team Calendar
- **Type:** Round Robin
- **Assign To:** All team members
- **Duration:** 30 minutes
- **Connected Workflows:** WF-04 + WF-05

---

## 2. WORKFLOWS / AUTOMATIONS

### PHASE 1 MVP (14 Workflows)

#### WF-01: [Modern Amenities] - Workflow - Lead - Instant Speed-to-Lead Response
**Trigger:** Form Submitted (any lead capture form) OR Contact Created via ad integration

| Step | Action | Detail |
|------|--------|--------|
| 1 | Wait | 0 minutes (immediate) |
| 2 | Send SMS | `[Modern Amenities] - SMS - New Lead - Instant Reply` |
| 3 | Wait | 2 minutes |
| 4 | Send Email | `[Modern Amenities] - Email - New Lead - Welcome` |
| 5 | Add Tag | `[Modern Amenities] - Tag - Status - Lead Received` |
| 6 | Create Opportunity | Pipeline: Main Sales Pipeline → Stage: New Lead |
| 7 | Assign User | Round-robin team assignment |
| 8 | Internal Notification | Push + email: 'New lead received contact NOW' |
| 9 | If/Else | IF contact replied to SMS within 10 min → Qualified path / ELSE → Step 10 |
| 10 | Wait | 10 minutes |
| 11 | Send SMS | `[Modern Amenities] - SMS - New Lead - Attempt 2` |
| 12 | Move Opportunity | → Contacted - Attempt 2 |
| 13 | Wait | 1 hour |
| 14 | If/Else | IF reply → exit / ELSE → move to WF-02 |

#### WF-02: [Modern Amenities] - Workflow - Lead - Multi-Touch Follow-Up Sequence (Day 1-7)
**Trigger:** Tag Added: `[Modern Amenities] - Tag - Status - No Reply After Instant` OR connected from WF-01

| Step | Timing | Action | Detail |
|------|--------|--------|--------|
| 1 | Day 1 AM | Voicemail Drop | `[Modern Amenities] - Voicemail - Day 1 Introduction` |
| 2 | Day 1 PM | Send SMS | `[Modern Amenities] - SMS - Follow-Up - Day 1 PM Check-In` |
| 3 | Day 2 | Send Email | `[Modern Amenities] - Email - Nurture - Day 2 Social Proof` |
| 4 | Day 3 | Send SMS | `[Modern Amenities] - SMS - Follow-Up - Day 3 FAQ` |
| 5 | Day 3 | Move Opp Stage | → Contacted - Attempt 3 |
| 6 | Day 5 | Send Email | `[Modern Amenities] - Email - Nurture - Day 5 Limited Offer` |
| 7 | Day 7 | Send SMS | `[Modern Amenities] - SMS - Follow-Up - Day 7 Final Check-In` |
| 8 | Day 7 | Internal Notification | 'Lead has not replied in 7 days manual call required' |
| 9 | Day 7 | If/Else | IF no reply → Add Tag Cold Lead + Move Opp → Nurture/Long-Term |

#### WF-03: [Modern Amenities] - Workflow - Lead - Long-Term Nurture Drip (Day 8-90)
**Trigger:** Tag Added: `[Modern Amenities] - Tag - Status - Cold Lead`

| Step | Timing | Channel | Content |
|------|--------|---------|---------|
| 1 | Day 10 | Email | `[Modern Amenities] - Email - Nurture - Day 10 Case Study` |
| 2 | Day 14 | SMS | `[Modern Amenities] - SMS - Nurture - Day 14 Value Tip` |
| 3 | Day 21 | Email | `[Modern Amenities] - Email - Nurture - Day 21 Common Mistakes` |
| 4 | Day 30 | SMS | `[Modern Amenities] - SMS - Nurture - Day 30 Re-Engagement` |
| 5 | Day 30 | Internal Notification | Flag for manual call attempt |
| 6 | Day 45 | Email | `[Modern Amenities] - Email - Nurture - Day 45 Testimonial/Proof` |
| 7 | Day 60 | SMS | `[Modern Amenities] - SMS - Nurture - Day 60 Seasonal Offer` |
| 8 | Day 75 | Email | `[Modern Amenities] - Email - Nurture - Day 75 FAQ Answers` |
| 9 | Day 90 | SMS + Email | Day 90 Final Reach Out (both channels) |
| 10 | Day 90 | If/Else | IF no engagement → Tag Archive / ELSE → restart |

#### WF-04: [Modern Amenities] - Workflow - Appointment - Booking Confirmation
**Trigger:** Customer Booked Appointment (any calendar)

| Step | Timing | Action | Detail |
|------|--------|--------|--------|
| 1 | Immediate | Send Email | Booking Confirmation email |
| 2 | Immediate | Send SMS | Booking Confirmed SMS |
| 3 | Immediate | Move Opp Stage | → Appointment Scheduled (Sales) + → Booked (Appointment Pipeline) |
| 4 | Immediate | Add Tag | Appointment Booked |
| 5 | Immediate | Internal Notification | Notify assigned user with details |

#### WF-05: [Modern Amenities] - Workflow - Appointment - Reminders (24hr + 1hr)
**Trigger:** Customer Booked Appointment (parallel with WF-04)

| Step | Timing | Action | Detail |
|------|--------|--------|--------|
| 1 | 24 hrs before | Send Email | 24hr Reminder |
| 2 | 24 hrs before | Send SMS | 24hr Reminder |
| 3 | 24 hrs before | Move Stage | → Reminded (Appointment Pipeline) |
| 4 | 1 hr before | Send SMS | 1hr Final Reminder |
| 5 | At appt time | If/Else | Showed → WF-06 / No Show → WF-07 |

#### WF-06: [Modern Amenities] - Workflow - Appointment - Post-Show Follow-Up
**Trigger:** Appointment Status → Completed/Showed

| Step | Timing | Action | Detail |
|------|--------|--------|--------|
| 1 | Immediate | Move Stages | → Appointment Showed (both pipelines) |
| 2 | Immediate | Add Tag | Appointment Showed |
| 3 | 30 min | Send SMS | Same Day Follow-Up |
| 4 | 30 min | Send Email | Proposal / Next Steps |
| 5 | 30 min | Move Stage | → Proposal / Quote Sent |
| 6 | 1 day | Send Email | Proposal Follow-Up Day 1 |
| 7 | 3 days | Send SMS | Proposal Follow-Up Day 3 |
| 8 | 7 days | Send Email | Proposal Follow-Up Day 7 Final Push |
| 9 | 7 days | Internal Notification | Manual follow-up needed alert |

#### WF-07: [Modern Amenities] - Workflow - Appointment - No-Show Recovery
**Trigger:** Appointment Status → No Show

| Step | Timing | Action | Detail |
|------|--------|--------|--------|
| 1 | Immediate | Add Tag | No Show |
| 2 | Immediate | Move Stage | → No Show (Appointment Pipeline) |
| 3 | 15 min | Send SMS | Immediate Recovery |
| 4 | 1 hour | Send Email | Rebooking Request |
| 5 | 1 day | Send SMS | Day 1 Rebooking Nudge |
| 6 | 3 days | Send Email | Day 3 Final Offer |
| 7 | 3 days | Internal Notification | Unrecovered no-show alert |
| 8 | 5 days | If/Else | IF rebooked → exit / ELSE → WF-03 Long-Term Nurture |

#### WF-08: [Modern Amenities] - Workflow - Missed Call Text Back (MCTB)
**Trigger:** Inbound Call Status: Missed
**⚠️ CRITICAL:** Allow Re-Entry = OFF. Ring timeout = 20 seconds. Active 24/7.

| Step | Timing | Action | Detail |
|------|--------|--------|--------|
| 1 | Immediate | If/Else | Business hours → Step 2 / After hours → Step 5 |
| 2 | 30 sec | Send SMS | Business Hours Response |
| 3 | Immediate | Add Tag | Source - Missed Call |
| 4 | 2 min | Internal Notification | 'Missed call from {{contact.name}} {{contact.phone}}' |
| 5 | 30 sec | Send SMS | After Hours Response |
| 6 | Immediate | Add Tag | Source - After Hours Missed Call |
| 7 | 10 min (if no reply) | Send SMS | Booking Link Follow-Up |
| 8 | Both paths | Create Opportunity | Main Sales Pipeline → New Lead |

#### WF-09: [Modern Amenities] - Workflow - Deal Won - Client Onboarding
**Trigger:** Opportunity Stage → Won (Main Sales Pipeline)

| Step | Timing | Action | Detail |
|------|--------|--------|--------|
| 1 | Immediate | Add Tag | Active Client |
| 2 | Immediate | Remove Tag | Lead tags (cleanup) |
| 3 | Immediate | Create Opportunity | Onboarding Pipeline → New Client |
| 4 | Immediate | Send Email | Onboarding Welcome & Next Steps |
| 5 | Immediate | Send SMS | Welcome to the Team |
| 6 | 1 hour | Send Email | Portal Access & Login Instructions |
| 7 | 1 day | Send Email | Intake Form Request |
| 8 | 1 day | Move Stage | → Onboarding Email Sent |
| 9 | 3 days (if no form) | Send SMS | Intake Form Reminder |
| 10 | Form submitted | Move Stage | → Intake Form Completed |
| 11 | Form submitted | Send Email | Kickoff Call Scheduling |
| 12 | Kickoff booked | Move Stage | → Kickoff Call Scheduled |
| 13 | Kickoff completed | Send Email | Post-Kickoff Checklist |
| 14 | Kickoff completed | Move Stage | → Active Client |

#### WF-10: [Modern Amenities] - Workflow - Review Request Automation
**Trigger:** Appointment Status → Completed OR Opportunity → Won (30-min delay)
**⚠️ Use Trigger Links.** Clicking review link removes from sequence.

| Step | Timing | Action | Detail |
|------|--------|--------|--------|
| 1 | 30 min post-service | Send SMS | Review Request Initial Ask |
| 2 | 15 min after | If/Else | IF Trigger Link clicked → Tag + EXIT |
| 3 | 3 hours | Send Email | Review Request Email 1 (Thank You) |
| 4 | 3 days | If/Else | IF clicked → EXIT |
| 5 | 3 days | Send SMS | Review Request Day 3 Reminder |
| 6 | 6 days | Send Email | Review Request Email 2 (Final) |
| 7 | On negative feedback | Internal Notification | URGENT: Negative experience alert |

#### WF-11: [Modern Amenities] - Workflow - Stale Opportunity Alert
**Trigger:** Opportunity Idle/Stale per stage

| Step | Condition | Action | Detail |
|------|-----------|--------|--------|
| 1 | 5 days idle - New Lead | Internal Notification | Owner alert |
| 2 | 7 days idle - Qualified | Internal Notification | Owner alert |
| 3 | 3 days idle - Appt Scheduled | Send SMS | Stale Appointment Reminder |
| 4 | 10 days idle - Proposal Sent | Notification + Email | Proposal Check-In |
| 5 | 30 days idle - Nurture | Add Tag | Dormant Lead → triggers Reactivation |

#### WF-12: [Modern Amenities] - Workflow - Lead Source Tagging & Routing
**Trigger:** Contact Created (all new contacts)

| Step | Condition | Action |
|------|-----------|--------|
| 1 | Source contains 'Facebook' | Tag: Source - Facebook, Assign: Facebook Rep |
| 2 | Source contains 'Google' | Tag: Source - Google, Assign: Google Rep |
| 3 | Source contains 'Referral' | Tag: Source - Referral, Extra thank-you SMS |
| 4 | Source contains 'Organic' | Tag: Source - Organic Website |
| 5 | Source contains 'Cold Outreach' | Tag: Source - Cold Outreach |
| 6 | All paths | Update Custom Field: Lead Source Date = today |

#### WF-13: [Modern Amenities] - Workflow - Inbound Auto-Reply (Out of Hours)
**Trigger:** Customer Replied (any channel) filtered to outside business hours

| Step | Condition | Action | Detail |
|------|-----------|--------|--------|
| 1 | Outside business hours | Send SMS | After Hours auto-reply |
| 2 | Outside business hours | Add Tag | After Hours Inquiry |
| 3 | Outside business hours | Internal Notification | After-hours message alert |
| 4 | During business hours | Exit | No auto-reply during working hours |

#### WF-14: [Modern Amenities] - Workflow - Contact Do-Not-Contact Opt-Out Handler
**Trigger:** SMS/Email Unsubscribe OR DNC field = Yes
**⚠️ CRITICAL:** Must be active at all times. Legal requirement.

| Step | Action | Detail |
|------|--------|--------|
| 1 | Remove from all active workflows | Immediate |
| 2 | Add Tag | DNC / Opted Out |
| 3 | Update Custom Field | DNC Status = Yes |
| 4 | Move to Smart List | Do Not Contact |
| 5 | Internal Notification | Owner alert: contact opted out |

### PHASE 2 GROWTH (9 Workflows)

#### WF-15: [Modern Amenities] - Workflow - Database Reactivation Campaign
**Trigger:** Manual / Smart List: Cold Leads (60+ days)

| Step | Timing | Action | Detail |
|------|--------|--------|--------|
| 1 | Day 1 AM | Send SMS | Reactivation Day 1 Personal Re-Intro |
| 2 | Day 1 PM | Send Email | Reactivation Day 1 We Missed You |
| 3 | Day 2 | Voicemail Drop | Reactivation Genuine Check-In |
| 4 | Day 4 | Send SMS | Reactivation Day 4 Limited Time Offer |
| 5 | Day 6 | Send Email | Reactivation Day 6 Social Proof + Offer |
| 6 | Day 9 | Send SMS | Reactivation Day 9 Final Message |
| 7 | Day 9 | If/Else | IF reply/booking → Tag Reactivated + EXIT / ELSE → Tag Archived |

#### WF-16: [Modern Amenities] - Workflow - Referral Request Campaign
**Trigger:** Tag Added: Active Client (fires after 30-day delay)

| Step | Timing | Action | Detail |
|------|--------|--------|--------|
| 1 | 30 days post-Active | Send Email | Referral Program Introduction |
| 2 | 32 days | Send SMS | Referral Quick Ask |
| 3 | Referral submitted | Add Tag | Source - Referral on NEW contact |
| 4 | Referral submitted | Send SMS to referrer | Thank You to Referrer |
| 5 | Referral submitted | Create Opportunity | Referral & Upsell Pipeline → Referral Received |

#### WF-17: [Modern Amenities] - Workflow - Upsell / Cross-Sell Sequence
**Trigger:** Tag Added: Upsell Candidate OR Opp Won (30-day delay)

| Step | Timing | Action | Detail |
|------|--------|--------|--------|
| 1 | Day 1 | Send Email | Upsell Introduction to Premium Offer |
| 2 | Day 3 | Send SMS | Upsell Quick Upgrade Check-In |
| 3 | Day 5 | Send Email | Upsell Case Study of Upgraded Clients |
| 4 | Day 7 | Send SMS | Upsell Day 7 Decision Nudge |
| 5 | Day 10 | Internal Notification | Sales rep manual call alert |

#### WF-18: [Modern Amenities] - Workflow - Holiday & Seasonal Campaign
**Trigger:** Date/Time manually scheduled per holiday

| Step | Channel | Action |
|------|---------|--------|
| 1 | Email | Seasonal Holiday Greeting |
| 2 | SMS (optional) | Holiday Short Message (if SMS consent confirmed) |

#### WF-19: [Modern Amenities] - Workflow - Deal Lost - Competitor Debrief
**Trigger:** Opportunity Stage → Lost

| Step | Timing | Action | Detail |
|------|--------|--------|--------|
| 1 | Immediate | Add Tag | Lost Deal |
| 2 | 1 day | Send Email | Graceful Goodbye + Feedback Request |
| 3 | 1 day | Update Custom Field | Lost Reason |
| 4 | 30 days | Add Tag | Reactivation Eligible |
| 5 | 30 days | Trigger WF-15 | Reactivation Campaign |

#### WF-20: [Modern Amenities] - Workflow - Webinar / Event Registration Flow
**Trigger:** Form Submitted: Webinar Registration

| Step | Timing | Action | Detail |
|------|--------|--------|--------|
| 1 | Immediate | Send Email | Registration Confirmation + Zoom Link |
| 2 | Immediate | Send SMS | You're Registered! |
| 3 | 24 hrs before | Send Email | 24hr Reminder + Agenda |
| 4 | 1 hr before | Send SMS | 1hr Countdown Reminder |
| 5 | 1 hr after | Send Email | Post-Event Replay + CTA |
| 6 | 2 days after | Send SMS | Post-Event Offer / Book a Call |

#### WF-21: [Modern Amenities] - Workflow - Birthday / Anniversary Recognition
**Trigger:** Date field = Birthday or Anniversary

| Step | Timing | Action |
|------|--------|--------|
| 1 | On date | Send SMS | Happy Birthday / Anniversary |
| 2 | On date | Send Email | Personal Celebration Note |

#### WF-22: [Modern Amenities] - Workflow - Payment / Invoice Follow-Up
**Trigger:** Invoice Sent OR Tag: Invoice Sent

| Step | Timing | Action | Detail |
|------|--------|--------|--------|
| 1 | 1 day | Send Email | Friendly Payment Reminder |
| 2 | 3 days | Send SMS | Quick Payment Check-In |
| 3 | 7 days (if unpaid) | Send Email | Final Payment Request |
| 4 | 7 days (if unpaid) | Internal Notification | Overdue invoice alert |

#### WF-23: [Modern Amenities] - Workflow - Contact Engagement Score Updater
**Trigger:** Various engagement events

| Event | Action |
|-------|--------|
| Email Opened | Engagement Score += 1 |
| Link Clicked | Engagement Score += 3 |
| Form Submitted | Engagement Score += 10 |
| Reply Received | Engagement Score += 5 + Tag: Engaged |
| No activity 30 days | Engagement Score -= 5 + Tag: Cold Lead |

### PHASE 3 POWER USER (5 Workflows)

#### WF-24: [Modern Amenities] - Workflow - AI Conversation Bot Handoff
**Trigger:** Inbound SMS/Chat during business hours

| Step | Action | Detail |
|------|--------|--------|
| 1 | Activate AI Bot | Lead Qualifier bot |
| 2 | On qualification | Add Tag: AI Qualified, Move Opp → Qualified |
| 3 | On handoff trigger | Internal Notification to assigned user |
| 4 | If bot can't answer | Notify + assign for manual reply |

#### WF-25: [Modern Amenities] - Workflow - Membership / Course Access Delivery
**Trigger:** Payment Received OR Tag: Member

| Step | Timing | Action | Detail |
|------|--------|--------|--------|
| 1 | Immediate | Grant Access | Core Program membership |
| 2 | Immediate | Send Email | Welcome & Access Instructions |
| 3 | Immediate | Send SMS | Your Access Is Ready |
| 4 | Day 3 | Send Email | Getting Started Guide |
| 5 | Day 7 | Send Email | Week 1 Check-In |
| 6 | Day 14 | Send SMS | How Is It Going? |
| 7 | Day 30 | Send Email | Month 1 Milestone + Upsell |

#### WF-26: [Modern Amenities] - Workflow - SaaS Trial Onboarding
**Trigger:** Sub-Account Created OR Tag: SaaS Trial

| Step | Timing | Action |
|------|--------|--------|
| 1 | Immediate | Send Email: Welcome + Login + Quick Start |
| 2 | Immediate | Send SMS: You're In! |
| 3 | Day 2 | Send Email: Feature Highlight #1 |
| 4 | Day 5 | Send Email: Feature Highlight #2 |
| 5 | Day 10 | Send SMS: Midpoint Check-In |
| 6 | Day 14 | Send Email: Upgrade or Lose Access |
| 7 | Day 16 | Send SMS: Last Chance to Upgrade |

#### WF-27: [Modern Amenities] - Workflow - AI Review Response Automation
**Trigger:** New Review Received

| Condition | Action |
|-----------|--------|
| 5 stars | AI drafts thank-you → auto-publish or approval |
| 4 stars | AI drafts mild thank-you → human review before posting |
| 1-3 stars | NO auto-respond. URGENT internal notification |
| All reviews | Update: Last Review Date + Review Rating |

#### WF-28: [Modern Amenities] - Workflow - Affiliate Tracking & Payout
**Trigger:** Opportunity → Won (only if Affiliate ID populated)

| Step | Action | Detail |
|------|--------|--------|
| 1 | Check Affiliate ID | IF populated → continue / ELSE exit |
| 2 | Add Tag | Source - Affiliate + name |
| 3 | Send Email to affiliate | Commission Earned Notification |
| 4 | Internal Notification | Finance: payout due |
| 5 | Update Custom Field | Total Affiliate Revenue |

---

## 3. FORMS & SURVEYS

### 3.1 [Modern Amenities] - Form - Lead Capture - General
| Field | Type | Required | Maps To |
|-------|------|----------|---------|
| First Name | Text | Yes | contact.first_name |
| Last Name | Text | Yes | contact.last_name |
| Email | Email | Yes | contact.email |
| Phone | Phone | Yes | contact.phone |
| How Did You Hear About Us? | Dropdown | No | custom_fields.lead_source |
| Best Time to Reach You | Dropdown | No | custom_fields.best_contact_time |

**Post-Submit:** Trigger WF-01 + Add Tag: Source - Form Submit + Thank You redirect

### 3.2 [Modern Amenities] - Form - Lead Capture - With Qualification
| Field | Type | Required | Maps To |
|-------|------|----------|---------|
| First Name | Text | Yes | contact.first_name |
| Last Name | Text | Yes | contact.last_name |
| Email | Email | Yes | contact.email |
| Phone | Phone | Yes | contact.phone |
| Monthly Budget | Dropdown | Yes | custom_fields.budget_range |
| Biggest Challenge | Text Area | Yes | custom_fields.biggest_challenge |
| When Looking to Start | Dropdown | Yes | custom_fields.timeline |
| Business Type | Text | No | custom_fields.business_type |

### 3.3 [Modern Amenities] - Form - Client Intake / Onboarding
| Field | Type | Maps To |
|-------|------|---------|
| Business Name | Text | custom_fields.client_business_name |
| Business Website | URL | custom_fields.client_website |
| Business Phone | Phone | custom_fields.client_business_phone |
| Business Address | Text | custom_fields.client_address |
| Google Business Profile URL | URL | custom_fields.google_review_link |
| Facebook Page URL | URL | custom_fields.social_facebook |
| Primary Goal | Text Area | custom_fields.primary_goal |
| Ideal Customer | Text Area | custom_fields.ideal_customer_description |
| Key Offer/Service | Text Area | custom_fields.offer_description |
| Competitors | Text Area | custom_fields.competitor_names |

### 3.4 [Modern Amenities] - Form - Appointment Booking Form (Embedded)
| Field | Type | Required |
|-------|------|----------|
| First Name | Text | Yes |
| Last Name | Text | Yes |
| Email | Email | Yes |
| Phone | Phone | Yes |
| What to Discuss | Dropdown + Other | Yes |
| Calendar Widget | Embedded | Yes |

### 3.5 [Modern Amenities] - Survey - Post-Service Feedback
| Field | Type | Notes |
|-------|------|-------|
| Overall Satisfaction (1-10) | Slider/Dropdown | Score < 7 → internal alert |
| What did we do well? | Text Area | Open text |
| What could we improve? | Text Area | Open text |
| Would you refer us? | Yes/No | Yes → review request SMS |
| May we use feedback as testimonial? | Yes/No | Yes → Tag: Testimonial Approved |

### 3.6 [Modern Amenities] - Form - Referral Submission (Phase 2)
| Field | Type | Maps To |
|-------|------|---------|
| Your Name (referrer) | Text | custom_fields.referrer_name |
| Referred Person's Name | Text | contact.full_name (new) |
| Referred Person's Phone | Phone | contact.phone (new) |
| Referred Person's Email | Email | contact.email (new) |
| Why referring? | Text Area | custom_fields.referral_reason |

### 3.7 [Modern Amenities] - Form - Webinar Registration (Phase 2)
| Field | Type | Required |
|-------|------|----------|
| First Name | Text | Yes |
| Email | Email | Yes |
| Phone | Phone | No |
| Topic Interest | Dropdown | Yes |

---

## 4. FUNNELS & LANDING PAGES

### Phase 1 MVP

| Funnel | Pages | Notes |
|--------|-------|-------|
| **Opt-In - Main Lead Magnet** | 2-step: Opt-In → Thank You | WF-01 fires on submit. All text = custom values. |
| **Booking - Discovery Call Scheduler** | 2-step: Pre-frame → Calendar Booking | Embeds Calendar 3.1. |
| **VSL - Video Sales Letter Page** | 3-step: Pre-frame → VSL Watch → Application/Book | Video = `{{custom_values.vsl_video_url}}` |
| **Thank You - Post Form Submission** | 1-page | After any form. Adds pixel if present. |
| **Review - Request Landing Page** | 1-page | Happy → Google review link. Negative → feedback form. |

### Phase 2 Growth

| Funnel | Pages | Notes |
|--------|-------|-------|
| **Webinar - Registration + Replay** | 3-step: Registration → Confirmation → Replay | WF-20 fires. |
| **Referral - Program Landing Page** | 2-step: Overview → Referral Form | Embeds Form 4.6. |
| **Upsell - Upgrade Offer Page** | 2-step: Offer → Order/Upgrade | Payment link from custom values. |

### Phase 3 Power User

| Funnel | Pages | Notes |
|--------|-------|-------|
| **SaaS - Trial Sign-Up Page** | 3-step: Features → Sign-Up → Access Confirm | WF-26 fires. |
| **Membership - Access Portal Entry** | 2-step: Login/Access → Members Dashboard | Links to Membership site. |

---

## 5. EMAIL TEMPLATES

> **CRITICAL:** Zero hardcoded content. Every business name, URL, phone = merge tag/custom value.

### 5.1 Lead Capture & Instant Response (9 emails)

| Template Name | When Sent |
|---------------|-----------|
| `[Modern Amenities] - Email - New Lead - Welcome` | Just signed up |
| `[Modern Amenities] - Email - New Lead - What Happens Next` | Day 1 (no reply) |
| `[Modern Amenities] - Email - Nurture - Day 2 Social Proof` | Day 2 nurture |
| `[Modern Amenities] - Email - Nurture - Day 5 Limited Offer` | Day 5 nurture |
| `[Modern Amenities] - Email - Nurture - Day 10 Case Study` | Day 10 |
| `[Modern Amenities] - Email - Nurture - Day 21 Common Mistakes` | Day 21 |
| `[Modern Amenities] - Email - Nurture - Day 45 Testimonial Proof` | Day 45 |
| `[Modern Amenities] - Email - Nurture - Day 75 FAQ Answers` | Day 75 |
| `[Modern Amenities] - Email - Nurture - Day 90 Final Reach Out` | Day 90 |

### 5.2 Appointment Lifecycle (8 emails)

| Template Name | When Sent |
|---------------|-----------|
| `[Modern Amenities] - Email - Appointment - Booking Confirmation` | After booking |
| `[Modern Amenities] - Email - Appointment - 24hr Reminder` | 24 hrs before |
| `[Modern Amenities] - Email - Post-Show - Proposal / Next Steps` | 30 min after show |
| `[Modern Amenities] - Email - Proposal Follow-Up - Day 1` | Day 1 post-proposal |
| `[Modern Amenities] - Email - Proposal Follow-Up - Day 3` | Day 3 post-proposal |
| `[Modern Amenities] - Email - Proposal Follow-Up - Day 7 Final Push` | Day 7 post-proposal |
| `[Modern Amenities] - Email - No-Show - Rebooking Request` | 1 hr after no-show |
| `[Modern Amenities] - Email - No-Show - Day 3 Final Offer` | Day 3 after no-show |

### 5.3 Onboarding (5 emails)

| Template Name | When Sent |
|---------------|-----------|
| `[Modern Amenities] - Email - Onboarding - Welcome & Next Steps` | On Won deal |
| `[Modern Amenities] - Email - Onboarding - Portal Access & Login` | 1 hr after Welcome |
| `[Modern Amenities] - Email - Onboarding - Intake Form Request` | Day 1 |
| `[Modern Amenities] - Email - Onboarding - Kickoff Call Scheduling` | After form submitted |
| `[Modern Amenities] - Email - Onboarding - Post-Kickoff Checklist` | Day after kickoff |

### 5.4 Review Request (2 emails)

| Template Name | When Sent |
|---------------|-----------|
| `[Modern Amenities] - Email - Review Request - Email 1 (Thank You)` | 3 hrs post-service |
| `[Modern Amenities] - Email - Review Request - Email 2 (Final Reminder)` | 6 days post-service |

### 5.5 Reactivation, Referral & Upsell (14 emails - Phase 2)

| Template Name | When Sent |
|---------------|-----------|
| `[Modern Amenities] - Email - Reactivation - Day 1 We Missed You` | Day 1 reactivation |
| `[Modern Amenities] - Email - Reactivation - Day 6 Social Proof + Offer` | Day 6 reactivation |
| `[Modern Amenities] - Email - Lost Deal - Graceful Goodbye + Feedback` | Day 1 after Lost |
| `[Modern Amenities] - Email - Referral - Program Introduction` | Day 30 active client |
| `[Modern Amenities] - Email - Upsell - Introduction to Premium Offer` | Day 1 upsell seq |
| `[Modern Amenities] - Email - Upsell - Case Study of Upgraded Clients` | Day 5 upsell seq |
| `[Modern Amenities] - Email - Webinar - Registration Confirmation + Zoom Link` | On register |
| `[Modern Amenities] - Email - Webinar - 24hr Reminder + Agenda` | 24 hrs before |
| `[Modern Amenities] - Email - Webinar - Post-Event Replay + CTA` | 1 hr after event |
| `[Modern Amenities] - Email - Invoice - Friendly Payment Reminder` | Day 1 after invoice |
| `[Modern Amenities] - Email - Invoice - Final Payment Request` | Day 7 overdue |
| `[Modern Amenities] - Email - Relationship - Personal Celebration Note` | Birthday/anniversary |
| `[Modern Amenities] - Email - Seasonal - Holiday Greeting` | Holiday dates |
| `[Modern Amenities] - Email - Stale - Proposal Check-In` | 10 days stale |

### 5.6 SaaS, Membership & AI (8 emails - Phase 3)

| Template Name | When Sent |
|---------------|-----------|
| `[Modern Amenities] - Email - SaaS Trial - Welcome + Login + Quick Start` | Trial start |
| `[Modern Amenities] - Email - SaaS Trial - Feature Highlight #1` | Day 2 |
| `[Modern Amenities] - Email - SaaS Trial - Feature Highlight #2` | Day 5 |
| `[Modern Amenities] - Email - SaaS Trial - Upgrade or Lose Access` | Day 14 |
| `[Modern Amenities] - Email - Membership - Welcome & Access Instructions` | Membership grant |
| `[Modern Amenities] - Email - Membership - Getting Started Guide` | Day 3 |
| `[Modern Amenities] - Email - Membership - Month 1 Milestone + Upsell` | Day 30 |
| `[Modern Amenities] - Email - Affiliate - Commission Earned Notification` | On won deal |

---

## 6. SMS TEMPLATES

> All SMS < 160 chars/segment. Must include `{{contact.first_name}}` and `{{custom_values.business_name}}`.

### Phase 1 MVP (20 SMS)

| Template | Copy |
|----------|------|
| **New Lead - Instant Reply** | Hi {{contact.first_name}}! This is {{custom_values.owner_name}} from {{custom_values.business_name}}. Just got your request I'd love to help. Is now a good time to chat? |
| **New Lead - Attempt 2** | Hey {{contact.first_name}}, tried reaching out want to get you sorted asap. Click to book a quick call: {{custom_values.booking_link}} |
| **Follow-Up - Day 1 PM Check-In** | {{contact.first_name}}, still thinking about {{custom_values.tagline}}? Happy to answer any questions just reply here or book a call: {{custom_values.booking_link}} |
| **Follow-Up - Day 3 FAQ** | {{contact.first_name}} most people ask us: '{{custom_values.common_question_1}}' the answer is {{custom_values.common_answer_1}}. Want to know more? Book here: {{custom_values.booking_link}} |
| **Follow-Up - Day 7 Final Check-In** | Last check-in, {{contact.first_name}}. If this isn't the right time, no worries at all. Just let me know and I'll stop following up. Otherwise, book here: {{custom_values.booking_link}} |
| **Appointment - Booking Confirmed** | Confirmed! {{contact.first_name}}, your call with {{custom_values.business_name}} is set for {{appointment.start_time}}. Add it to your calendar: {{appointment.add_to_calendar_link}} |
| **Appointment - 24hr Reminder** | Reminder: Your call with {{custom_values.business_name}} is TOMORROW at {{appointment.start_time}}. Join here: {{custom_values.meeting_link_or_address}} See you then! |
| **Appointment - 1hr Final Reminder** | 1 hour until your call, {{contact.first_name}}! Join here: {{custom_values.meeting_link_or_address}} We're looking forward to it! |
| **Post-Show - Same Day Follow-Up** | Great talking with you, {{contact.first_name}}! Sent you an email with our proposal/next steps. Let me know if you have any questions |
| **Proposal Follow-Up - Day 3** | {{contact.first_name}}, just wanted to check any questions on the proposal? Happy to jump on a quick 10-min call to walk through it: {{custom_values.booking_link}} |
| **No-Show - Immediate Recovery** | Hey {{contact.first_name}}, missed you on our call today! Totally understand life gets busy. Want to rebook? Pick a time here: {{custom_values.booking_link}} |
| **No-Show - Day 1 Rebooking Nudge** | {{contact.first_name}}, still happy to help! Grab a new time whenever works for you: {{custom_values.booking_link}} |
| **Missed Call - Business Hours** | Hi! You just called {{custom_values.business_name}} and we missed you. We'll call back shortly or book a time: {{custom_values.booking_link}} \| Reply STOP to opt out |
| **Missed Call - After Hours** | Hey there! You called {{custom_values.business_name}} after hours. We'll reach out first thing tomorrow or grab a time: {{custom_values.booking_link}} \| Reply STOP to opt out |
| **Missed Call - Booking Link Follow-Up** | {{contact.first_name}}, we don't want you to miss out! Book directly here and skip the phone tag: {{custom_values.booking_link}} takes 60 seconds |
| **Review Request - Initial Ask** | Hi {{contact.first_name}}! Hope everything went well. If you're happy with {{custom_values.business_name}}, a quick Google review would mean the world to us: {{custom_values.google_review_link}} |
| **Review Request - Day 3 Reminder** | {{contact.first_name}}, if you haven't had a chance yet here's the quick link to leave us a review: {{custom_values.google_review_link}} Thank you so much! |
| **Onboarding - Welcome to the Team** | Welcome aboard, {{contact.first_name}}! We're so excited to work with you at {{custom_values.business_name}}. Check your email for next steps let's get started! |
| **Onboarding - Intake Form Reminder** | Hey {{contact.first_name}}, quick reminder to fill out your intake form so we can hit the ground running! Should take 5 mins: {{custom_values.intake_form_link}} |
| **Auto-Reply - After Hours** | Thanks for reaching out to {{custom_values.business_name}}! We're currently closed but will respond first thing at {{custom_values.business_hours_start}}. Talk soon! |

### Phase 2 Growth (17 SMS)

| Template | Copy |
|----------|------|
| **Nurture - Day 14 Value Tip** | Quick tip, {{contact.first_name}}: {{custom_values.value_tip_1}} Brought to you by {{custom_values.business_name}}. Questions? Just reply! |
| **Nurture - Day 30 Re-Engagement** | {{contact.first_name}}, it's been a while! We've had some exciting updates at {{custom_values.business_name}}. Ready to reconnect? {{custom_values.booking_link}} |
| **Nurture - Day 60 Seasonal Offer** | {{contact.first_name}}, special offer from {{custom_values.business_name}} this month: {{custom_values.current_offer}}. Claim it before {{custom_values.offer_expiry_date}}: {{custom_values.booking_link}} |
| **Nurture - Day 90 Final Reach Out** | {{contact.first_name}}, this is our final check-in. If you're ever ready to move forward, we're here: {{custom_values.booking_link}}. Wishing you all the best! |
| **Reactivation - Day 1 Personal Re-Intro** | Hey {{contact.first_name}}! This is {{custom_values.owner_name}} from {{custom_values.business_name}}. Wanted to personally check in are you still looking for help with {{custom_values.service_category}}? |
| **Reactivation - Day 4 Limited Time Offer** | {{contact.first_name}}, we're running a special for past inquiries this week only: {{custom_values.reactivation_offer}}. Grab it here: {{custom_values.booking_link}} (expires {{custom_values.offer_expiry_date}}) |
| **Reactivation - Day 9 Final Message** | Last one, {{contact.first_name}} didn't want to leave things open. If the timing is ever right, we're one message away. Take care! |
| **Referral - Quick Ask** | {{contact.first_name}}, do you know anyone who could benefit from {{custom_values.service_category}}? You'll receive {{custom_values.referral_reward_description}} for every referral who signs up |
| **Referral - Thank You to Referrer** | {{contact.first_name}}, your referral just came through! Thank you so much we'll take great care of them. Your reward: {{custom_values.referral_reward_description}} |
| **Upsell - Quick Upgrade Check-In** | Hey {{contact.first_name}}! Wanted to share something that could really level up your results mind if I send over some info? Just reply YES! |
| **Upsell - Day 7 Decision Nudge** | {{contact.first_name}}, the upgrade offer wraps up {{custom_values.offer_expiry_date}}. Happy to answer any questions before then! |
| **Webinar - You're Registered!** | You're in, {{contact.first_name}}! {{custom_values.webinar_title}} {{custom_values.webinar_date}} at {{custom_values.webinar_time}}. Link in your email. See you there! |
| **Webinar - 1hr Countdown Reminder** | 1 hour until {{custom_values.webinar_title}}! Join here: {{custom_values.webinar_link}} Can't wait to see you live, {{contact.first_name}}! |
| **Webinar - Post-Event Offer** | Thanks for attending, {{contact.first_name}}! Ready to take the next step? Book your free strategy call here: {{custom_values.booking_link}} |
| **Stale - Appointment Reminder Check-In** | Hey {{contact.first_name}}, noticed your appointment is coming up soon still on for {{appointment.start_time}}? Reply YES to confirm or click to reschedule: {{custom_values.reschedule_link}} |
| **Invoice - Quick Payment Check-In** | Hi {{contact.first_name}}, quick reminder that invoice #{{custom_fields.invoice_number}} from {{custom_values.business_name}} is due. Pay securely here: {{custom_fields.invoice_link}} |
| **Relationship - Happy Birthday** | Happy Birthday, {{contact.first_name}}! Wishing you an incredible day. From everyone at {{custom_values.business_name}} |

### Phase 3 Power User (5 SMS)

| Template | Copy |
|----------|------|
| **SaaS Trial - You're In!** | Welcome to {{custom_values.saas_product_name}}, {{contact.first_name}}! Your trial is active. Login here: {{custom_values.saas_login_url}} Your 14-day journey starts NOW! |
| **SaaS Trial - Midpoint Check-In** | {{contact.first_name}}, you're halfway through your {{custom_values.saas_product_name}} trial! Need help getting set up? Book a quick onboarding call: {{custom_values.booking_link}} |
| **SaaS Trial - Last Chance to Upgrade** | {{contact.first_name}}, your {{custom_values.saas_product_name}} trial ends TOMORROW. Upgrade now to keep access: {{custom_values.upgrade_payment_link}} |
| **Membership - Your Access Is Ready** | {{contact.first_name}}, your membership is live! Access {{custom_values.membership_program_name}} here: {{custom_values.membership_login_url}} Let's go! |
| **Membership - How Is It Going?** | Hey {{contact.first_name}}! 2 weeks into {{custom_values.membership_program_name}} how is it going? Any questions? Just reply here and I'll help personally |

---

## 7. TRIGGER LINKS

| Link Name | Action | Used In |
|-----------|--------|---------|
| **Review - Google** | Add Tag: Review - Clicked, Remove from review seq, Redirect to `{{custom_values.google_review_link}}` | WF-10 |
| **Review - Negative Feedback** | Add Tag: Review - Negative Feedback, Internal alert, Redirect to Survey 4.5 | WF-10 |
| **Webinar - Attended Confirmation** | Add Tag: Webinar - Attended, Move Opp → Showed | WF-20 |
| **Proposal - I'm Ready to Proceed** | Add Tag: Engaged, Notify user, Move Opp → Negotiation | WF-06 |
| **Referral - I Want to Refer Someone** | Redirect to Form 4.6, Add Tag: Referral - Intent | WF-16 |
| **Opt-Out - All Emails** | Add Tag: DNC, Trigger WF-14, Remove from all campaigns | ALL email footers |

---

## 8. WEBSITE PAGES (Phase 2)

All content driven by custom values. No hardcoded content.

| Page | Key Sections |
|------|-------------|
| **Home** | Hero + CTA, Services Overview, Social Proof, Testimonials, Meet the Team, CTA Banner, Footer |
| **About Us** | Story, Mission & Values, Team Bio, Why Choose Us, Client Logos |
| **Services** | Service 1/2/3 Cards (icon, description, CTA), Pricing Tiers |
| **Contact** | Contact Form (Form 4.1), Google Maps, Phone, Email, Hours |
| **Blog** | Post Grid, Category Filter, Author Bio, Email Opt-in CTA |
| **Privacy Policy** | Standard template using custom values |
| **Terms of Service** | Standard template using custom values |

---

## 9. CHAT WIDGET

| Setting | Value |
|---------|-------|
| Widget Name | `[Modern Amenities] - Chat Widget - Main Site` |
| Welcome Message | Hi there! Welcome to {{custom_values.business_name}}. How can we help you today? |
| Away Message | We're offline right now but will respond as soon as possible! You can also book directly: {{custom_values.booking_link}} |
| Display Name | {{custom_values.business_name}} Team |
| Widget Color | `{{custom_values.brand_primary_color}}` |
| Channels | SMS + Email (minimum). Add Live Chat if available. |
| AI Response | Enable Conversation AI (Phase 3) → WF-24 |
| Embed | All website pages + all funnel thank you pages |

---

## 10. SMART LISTS

> Smart Lists do NOT transfer in snapshots. Must be rebuilt manually.

| List Name | Filter Logic |
|-----------|-------------|
| **All Active Leads** | Tag contains Lead Received AND Tag ≠ DNC |
| **Appointment Booked This Week** | Tag = Appointment Booked AND Date = This Week |
| **No Shows - Last 14 Days** | Tag = No Show AND Added > 14 days ago |
| **Active Clients** | Tag = Active Client AND Tag ≠ DNC |
| **Cold Leads (60+ Days)** | Tag = Cold Lead AND Last Activity > 60 days |
| **Do Not Contact** | Tag = DNC / Opted Out OR DNC Field = Yes |
| **Proposal Sent (Awaiting)** | Opp Stage = Proposal Sent AND Entry > 3 days |
| **Review Not Yet Requested** | Tag = Active Client AND Tag ≠ Review Clicked AND Activity > 7 days |
| **Reactivation Eligible** | Tag = Reactivation Eligible AND Activity > 30 days AND Tag ≠ DNC |
| **Engaged Leads (High Score)** | Engagement Score > 15 AND Tag ≠ Active Client |
| **Referral Sources** | Tag = Source - Referral |
| **Members (Phase 3)** | Tag = Member AND Tag ≠ DNC |
| **SaaS Trial Users (Phase 3)** | Tag = SaaS Trial AND Tag ≠ SaaS Paying |

---

## 11. REPORTING DASHBOARDS

### 11.1 Leads & Pipeline Overview (Phase 1)
- New Leads This Month (Number Card)
- Pipeline Value - Total (Number Card)
- Appointment Booked Rate (Number Card)
- Appointment Showed Rate (Number Card)
- Close Rate (Number Card)
- Pipeline by Stage (Funnel Chart)
- Lead Sources Breakdown (Pie Chart)

### 11.2 Review & Reputation Tracker (Phase 2)
- Total Reviews Received
- Average Review Rating
- Review Requests Sent This Month
- Negative Feedback Alerts

### 11.3 Client & Revenue Overview (Phase 2)
- Active Clients
- New Clients This Month
- Revenue Won This Month
- Churn/Lost This Month
- Upsells Won

---

## 12. MEMBERSHIPS / COURSES (Phase 3)

| Asset | Type | Description |
|-------|------|-------------|
| **Core Program** | Membership Product | Main container. Module titles use custom values. |
| **Module 1 - Getting Started** | Course Section | First module. Placeholder lessons. |
| **Module 2 - Core Training** | Course Section | Second module. Placeholder structure. |
| **Module 3 - Advanced Strategies** | Course Section | Third module. Placeholder structure. |
| **Bonus Resources** | Course Section | PDFs, checklists, templates. |
| **Community (Optional)** | Community Product | Link from `{{custom_values.community_url}}`. |

---

## 13. VOICEMAIL SCRIPTS

Record as audio files and upload to GHL Voicemail section.

### [Modern Amenities] - Voicemail - Day 1 Introduction
> "Hey {{contact.first_name}}, this is {{custom_values.owner_name}} from {{custom_values.business_name}}. I just got your inquiry and wanted to personally reach out. We'd love to help you with {{custom_values.service_category}}. Give me a call back at {{custom_values.business_phone}} or feel free to book a time at {{custom_values.booking_link}}. Looking forward to connecting!"

### [Modern Amenities] - Voicemail - Reactivation Check-In
> "Hey {{contact.first_name}}, it's {{custom_values.owner_name}} from {{custom_values.business_name}}. It's been a little while since we connected and I just wanted to personally check in we've had some updates I think you'd find valuable. Give me a quick call at {{custom_values.business_phone}} or grab a time at {{custom_values.booking_link}}. Hope to chat soon!"

---

## 14. SOCIAL POST TEMPLATES (Phase 2)

| Template | Channel | Content Type |
|----------|---------|-------------|
| **Testimonial Post** | Facebook + Instagram | Before/after story. CTA = link in bio / book call. |
| **Value Tip Post** | Facebook + LinkedIn | Educational tip. 3-bullet structure. Evergreen. |
| **Offer Announcement** | Facebook + Instagram | Promo post. CTA = booking link. |
| **Behind the Scenes** | Instagram + Facebook | Culture/team post. Humanizes the brand. |

---

## 15. REPUTATION MANAGEMENT

| Task | Detail |
|------|--------|
| Connect Google Business Profile | Agency connects on behalf of client |
| Set Review Funnel URL | `{{custom_values.google_review_link}}` |
| Negative Review Email Alert | Notify `{{custom_values.business_email}}` |
| Review Monitoring | Enable for Google + Facebook |
| 5-Star Response Templates (Phase 3) | Pre-load 3 thank-you responses |
| 1-3 Star Escalation Scripts (Phase 3) | Pre-load 2 internal scripts. DO NOT auto-publish. |

---

## BUILD PRIORITY ORDER

1. **Forms & Surveys** (needed by workflows)
2. **Email Templates** (needed by workflows)
3. **SMS Templates** (needed by workflows)
4. **Trigger Links** (needed by review/opt-out workflows)
5. **Calendars** (needed by appointment workflows)
6. **Workflows Phase 1** (core automation)
7. **Funnels** (connect forms + calendars)
8. **Smart Lists** (for targeting)
9. **Chat Widget**
10. **Website Pages**
11. **Workflows Phase 2**
12. **Reporting Dashboards**
13. **Phase 3 assets** (Memberships, SaaS, AI)

---

*Generated by Modern Amenities Solutions GHL Snapshot Builder*
