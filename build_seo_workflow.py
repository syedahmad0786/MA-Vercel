#!/usr/bin/env python3
"""
Complete SEO Audit Automation Workflow Builder for n8n
Generates the full workflow JSON and pushes to n8n instance.
"""
import json
import uuid
import requests

N8N_BASE = "https://n8n.aimanagingservices.com"
N8N_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNDk2NzU4My00MzM1LTRiYjMtOTFiZi02MTNhMTNmNzk2ZWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzcxNDIwNDA1fQ.xpTdq-YmnV14s6S2EY7jFYJ2HRdNGY3k6CPZ44je2Dg"

# Credential IDs from existing workflow
CREDS = {
    "openai": {"openAiApi": {"id": "yqwDvtDBsNVSeylm", "name": "OpenAi account"}},
    "google_oauth": {"googleOAuth2Api": {"id": "03TmsNrvmztxYMfp", "name": "Google account"}},
    "google_sheets": {"googleSheetsOAuth2Api": {"id": "BqCsF5fexBb586JV", "name": "Google Sheets account"}},
    "google_analytics": {"googleAnalyticsOAuth2": {"id": "5QwNdmVAHZVRe1S2", "name": "Google Analytics account"}},
    "query_auth": {"httpQueryAuth": {"id": "3J1Ed13Uq4irq79b", "name": "Query Auth account"}},
    "apify": {"apifyApi": {"id": "J4e9uHqO0Vhcu00D", "name": "Apify account"}},
    "gmail": {"gmailOAuth2": {"id": "PKO4bRJXrUUozaOL", "name": "Gmail account"}},
}

def uid():
    return str(uuid.uuid4())

# ============================================================================
# NODE DEFINITIONS
# ============================================================================
nodes = []
connections = {}

def add_node(name, node_type, position, parameters=None, credentials=None, type_version=None):
    node = {
        "id": uid(),
        "name": name,
        "type": node_type,
        "position": position,
        "parameters": parameters or {},
    }
    if credentials:
        node["credentials"] = credentials
    if type_version:
        node["typeVersion"] = type_version
    else:
        # Default versions
        version_map = {
            "n8n-nodes-base.manualTrigger": 1,
            "n8n-nodes-base.scheduleTrigger": 1.2,
            "n8n-nodes-base.googleSheets": 4.5,
            "n8n-nodes-base.set": 3.4,
            "n8n-nodes-base.code": 2,
            "n8n-nodes-base.httpRequest": 4.2,
            "n8n-nodes-base.merge": 3,
            "n8n-nodes-base.filter": 2,
            "n8n-nodes-base.splitInBatches": 3,
            "n8n-nodes-base.wait": 1.1,
            "n8n-nodes-base.if": 2,
            "n8n-nodes-base.googleAnalytics": 2,
            "n8n-nodes-base.gmail": 2.1,
            "n8n-nodes-base.stickyNote": 1,
            "@n8n/n8n-nodes-langchain.agent": 1.7,
            "@n8n/n8n-nodes-langchain.lmChatOpenAi": 1.2,
            "n8n-nodes-base.httpRequestTool": 1.1,
            "n8n-nodes-base.googleSheetsTool": 4.5,
            "@apify/n8n-nodes-apify.apify": 1,
        }
        node["typeVersion"] = version_map.get(node_type, 1)
    nodes.append(node)
    return name

def connect(source, target, source_output=0, target_input=0, conn_type="main"):
    if source not in connections:
        connections[source] = {}
    if conn_type not in connections[source]:
        connections[source][conn_type] = []
    # Ensure enough output slots
    while len(connections[source][conn_type]) <= source_output:
        connections[source][conn_type].append([])
    connections[source][conn_type][source_output].append({
        "node": target,
        "type": conn_type,
        "index": target_input,
    })

# ============================================================================
# STICKY NOTES (Documentation)
# ============================================================================
add_node("📋 PHASE 1: CLIENT INPUT", "n8n-nodes-base.stickyNote", [-3400, -200], {
    "content": "## PHASE 1: CLIENT INPUT\n\nReads client data from Google Sheet 'SEO Audit Queue'.\n\n**Sheet Columns:**\n- Client Name\n- Website URL\n- Competitor 1, 2, 3\n- GA4 Property ID\n- GSC Property URL\n- Target Location\n- Goals\n- Email\n- Status (Pending/In Progress/Complete)\n\nSet status to **Pending** to trigger audit.",
    "width": 400, "height": 350, "color": 1
})

add_node("🔧 PHASE 2: TECHNICAL AUDIT", "n8n-nodes-base.stickyNote", [-1800, -200], {
    "content": "## PHASE 2: TECHNICAL AUDIT\n\n- Full site crawl (500 URLs via Apify)\n- PageSpeed Insights (Mobile + Desktop)\n- Google Search Console data\n- robots.txt analysis\n- HTTPS check\n- Sitemap validation\n- Core Web Vitals",
    "width": 350, "height": 280, "color": 2
})

add_node("🔑 PHASE 3: KEYWORD RESEARCH", "n8n-nodes-base.stickyNote", [-400, -200], {
    "content": "## PHASE 3: KEYWORD RESEARCH\n\n- GSC keyword extraction\n- Competitor keyword scraping\n- Keyword clustering via AI\n- Intent classification\n- AEO opportunity identification",
    "width": 350, "height": 250, "color": 3
})

add_node("📝 PHASE 4: ON-PAGE AUDIT", "n8n-nodes-base.stickyNote", [700, -200], {
    "content": "## PHASE 4: ON-PAGE AUDIT\n\n- Metadata audit (titles, descriptions site-wide)\n- Content quality analysis\n- Schema/structured data validation\n- H-tag structure\n- Thin content detection",
    "width": 350, "height": 250, "color": 4
})

add_node("🔗 PHASE 5: OFF-PAGE AUDIT", "n8n-nodes-base.stickyNote", [1600, -200], {
    "content": "## PHASE 5: OFF-PAGE AUDIT\n\n- Backlink profile analysis\n- Toxic backlink scoring\n- Anchor text profiling\n- Referring domain analysis\n- Competitor backlink gap",
    "width": 350, "height": 250, "color": 5
})

add_node("🏆 PHASE 6: COMPETITOR ANALYSIS", "n8n-nodes-base.stickyNote", [2500, -200], {
    "content": "## PHASE 6: COMPETITOR ANALYSIS\n\n- Competitor CWV comparison\n- Competitor keyword gap\n- Competitor backlink comparison\n- Technical stack comparison",
    "width": 350, "height": 250, "color": 6
})

add_node("📊 PHASE 8: FINAL REPORT", "n8n-nodes-base.stickyNote", [3400, -200], {
    "content": "## PHASE 8: FINAL DELIVERABLES\n\n- Master report compilation\n- Priority action list\n- Save to Google Sheets (multi-tab)\n- Email delivery\n- Status update",
    "width": 350, "height": 250, "color": 7
})

# ============================================================================
# PHASE 1: CLIENT INPUT
# ============================================================================

# 1. Manual Trigger
add_node("Manual Trigger", "n8n-nodes-base.manualTrigger", [-3200, 300])

# 2. Schedule Trigger (daily at 9am)
add_node("Schedule Trigger", "n8n-nodes-base.scheduleTrigger", [-3200, 500], {
    "rule": {"interval": [{"triggerAtHour": 9}]}
})

# 3. Read Audit Queue from Google Sheet
add_node("Read Audit Queue", "n8n-nodes-base.googleSheets", [-2900, 400], {
    "operation": "read",
    "documentId": {"__rl": True, "mode": "url", "value": ""},
    "sheetName": {"__rl": True, "mode": "name", "value": "Audit Queue"},
    "options": {}
}, CREDS["google_sheets"])

# 4. Filter Pending Rows
add_node("Filter Pending", "n8n-nodes-base.filter", [-2650, 400], {
    "conditions": {
        "options": {"version": 1, "caseSensitive": False, "leftValue": "", "typeValidation": "strict"},
        "combinator": "and",
        "conditions": [{
            "id": "status-check",
            "operator": {"type": "string", "operation": "equals"},
            "leftValue": "={{ $json.Status }}",
            "rightValue": "Pending"
        }]
    }
})

# 5. Set Client Variables
add_node("Set Client Variables", "n8n-nodes-base.set", [-2400, 400], {
    "mode": "manual",
    "assignments": {"assignments": [
        {"id": uid(), "name": "clientName", "type": "string", "value": "={{ $json['Client Name'] }}"},
        {"id": uid(), "name": "websiteUrl", "type": "string", "value": "={{ $json['Website URL'] }}"},
        {"id": uid(), "name": "competitor1", "type": "string", "value": "={{ $json['Competitor 1'] || '' }}"},
        {"id": uid(), "name": "competitor2", "type": "string", "value": "={{ $json['Competitor 2'] || '' }}"},
        {"id": uid(), "name": "competitor3", "type": "string", "value": "={{ $json['Competitor 3'] || '' }}"},
        {"id": uid(), "name": "ga4PropertyId", "type": "string", "value": "={{ $json['GA4 Property ID'] || '' }}"},
        {"id": uid(), "name": "gscProperty", "type": "string", "value": "={{ $json['GSC Property'] || $json['Website URL'] }}"},
        {"id": uid(), "name": "targetLocation", "type": "string", "value": "={{ $json['Target Location'] || '' }}"},
        {"id": uid(), "name": "goals", "type": "string", "value": "={{ $json['Goals'] || '' }}"},
        {"id": uid(), "name": "clientEmail", "type": "string", "value": "={{ $json['Email'] || '' }}"},
        {"id": uid(), "name": "rowNumber", "type": "number", "value": "={{ $json.row_number }}"},
    ]},
    "options": {}
})

# 6. Update Status to In Progress
add_node("Update Status: In Progress", "n8n-nodes-base.googleSheets", [-2100, 600], {
    "operation": "update",
    "documentId": {"__rl": True, "mode": "url", "value": ""},
    "sheetName": {"__rl": True, "mode": "name", "value": "Audit Queue"},
    "columns": {"mappingMode": "defineBelow", "value": {"Status": "In Progress"}},
    "options": {},
    "filtersUI": {"values": [{"lookupColumn": "row_number", "lookupValue": "={{ $json.rowNumber }}"}]}
}, CREDS["google_sheets"])

# Connect Phase 1
connect("Manual Trigger", "Read Audit Queue")
connect("Schedule Trigger", "Read Audit Queue")
connect("Read Audit Queue", "Filter Pending")
connect("Filter Pending", "Set Client Variables")
connect("Set Client Variables", "Update Status: In Progress")

# ============================================================================
# PHASE 2: TECHNICAL AUDIT
# ============================================================================

# --- PageSpeed ---
add_node("PageSpeed Mobile", "n8n-nodes-base.httpRequest", [-1600, 100], {
    "url": "=https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={{ encodeURIComponent($json.websiteUrl) }}&category=performance&category=accessibility&category=best-practices&category=seo&strategy=mobile",
    "method": "GET",
    "options": {"timeout": 120000}
})

add_node("PageSpeed Desktop", "n8n-nodes-base.httpRequest", [-1600, 300], {
    "url": "=https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={{ encodeURIComponent($json.websiteUrl) }}&category=performance&category=accessibility&category=best-practices&category=seo&strategy=desktop",
    "method": "GET",
    "options": {"timeout": 120000}
})

add_node("Format PageSpeed Results", "n8n-nodes-base.code", [-1300, 200], {
    "jsCode": """// Format PageSpeed data from both Mobile and Desktop
const items = $input.all();
const results = [];

for (const item of items) {
  const json = item.json;
  const lighthouse = json.lighthouseResult || {};
  const categories = lighthouse.categories || {};
  const audits = lighthouse.audits || {};
  const strategy = json.lighthouseResult?.configSettings?.formFactor || 'unknown';

  const cwv = {
    strategy: strategy,
    performanceScore: Math.round((categories.performance?.score || 0) * 100),
    accessibilityScore: Math.round((categories.accessibility?.score || 0) * 100),
    bestPracticesScore: Math.round((categories['best-practices']?.score || 0) * 100),
    seoScore: Math.round((categories.seo?.score || 0) * 100),
    LCP: audits['largest-contentful-paint']?.displayValue || 'N/A',
    LCP_score: audits['largest-contentful-paint']?.score || 0,
    CLS: audits['cumulative-layout-shift']?.displayValue || 'N/A',
    CLS_score: audits['cumulative-layout-shift']?.score || 0,
    INP: audits['interaction-to-next-paint']?.displayValue || audits['max-potential-fid']?.displayValue || 'N/A',
    FCP: audits['first-contentful-paint']?.displayValue || 'N/A',
    TBT: audits['total-blocking-time']?.displayValue || 'N/A',
    speedIndex: audits['speed-index']?.displayValue || 'N/A',
    TTFB: audits['server-response-time']?.displayValue || 'N/A',
    renderBlockingResources: audits['render-blocking-resources']?.details?.items?.length || 0,
    unusedCSS: audits['unused-css-rules']?.details?.items?.length || 0,
    unusedJS: audits['unused-javascript']?.details?.items?.length || 0,
    largeImages: (audits['uses-optimized-images']?.details?.items?.length || 0) +
                 (audits['uses-responsive-images']?.details?.items?.length || 0),
    opportunities: Object.values(audits)
      .filter(a => a.details?.type === 'opportunity' && a.score !== null && a.score < 0.9)
      .map(a => ({ title: a.title, savings: a.displayValue, score: a.score }))
      .slice(0, 10)
  };
  results.push({ json: cwv });
}

return results;"""
})

# --- GSC Data Collection ---
add_node("GSC: Query Performance", "n8n-nodes-base.httpRequest", [-1600, 500], {
    "url": "=https://www.googleapis.com/webmasters/v3/sites/{{ encodeURIComponent($json.gscProperty) }}/searchAnalytics/query",
    "method": "POST",
    "sendBody": True,
    "bodyParameters": {"parameters": []},
    "specifyBody": "json",
    "jsonBody": '={\n  "startDate": "{{ new Date(Date.now() - 90*24*60*60*1000).toISOString().split("T")[0] }}",\n  "endDate": "{{ new Date(Date.now() - 2*24*60*60*1000).toISOString().split("T")[0] }}",\n  "dimensions": ["query"],\n  "rowLimit": 500,\n  "dimensionFilterGroups": []\n}',
    "options": {"timeout": 60000},
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "googleOAuth2Api"
}, CREDS["google_oauth"])

add_node("GSC: Page Performance", "n8n-nodes-base.httpRequest", [-1600, 700], {
    "url": "=https://www.googleapis.com/webmasters/v3/sites/{{ encodeURIComponent($json.gscProperty) }}/searchAnalytics/query",
    "method": "POST",
    "sendBody": True,
    "specifyBody": "json",
    "jsonBody": '={\n  "startDate": "{{ new Date(Date.now() - 90*24*60*60*1000).toISOString().split("T")[0] }}",\n  "endDate": "{{ new Date(Date.now() - 2*24*60*60*1000).toISOString().split("T")[0] }}",\n  "dimensions": ["page"],\n  "rowLimit": 500\n}',
    "options": {"timeout": 60000},
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "googleOAuth2Api"
}, CREDS["google_oauth"])

add_node("GSC: Sitemaps", "n8n-nodes-base.httpRequest", [-1600, 900], {
    "url": "=https://www.googleapis.com/webmasters/v3/sites/{{ encodeURIComponent($json.gscProperty) }}/sitemaps",
    "method": "GET",
    "options": {"timeout": 30000},
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "googleOAuth2Api"
}, CREDS["google_oauth"])

add_node("GSC: Country Performance", "n8n-nodes-base.httpRequest", [-1600, 1100], {
    "url": "=https://www.googleapis.com/webmasters/v3/sites/{{ encodeURIComponent($json.gscProperty) }}/searchAnalytics/query",
    "method": "POST",
    "sendBody": True,
    "specifyBody": "json",
    "jsonBody": '={\n  "startDate": "{{ new Date(Date.now() - 90*24*60*60*1000).toISOString().split("T")[0] }}",\n  "endDate": "{{ new Date(Date.now() - 2*24*60*60*1000).toISOString().split("T")[0] }}",\n  "dimensions": ["country"],\n  "rowLimit": 50\n}',
    "options": {"timeout": 60000},
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "googleOAuth2Api"
}, CREDS["google_oauth"])

# --- Robots.txt Check ---
add_node("Fetch robots.txt", "n8n-nodes-base.httpRequest", [-1600, 1300], {
    "url": "={{ $json.websiteUrl.replace(/\\/$/, '') + '/robots.txt' }}",
    "method": "GET",
    "options": {"timeout": 15000, "redirect": {"redirect": {"followRedirects": True}}},
})

add_node("Parse robots.txt", "n8n-nodes-base.code", [-1300, 1300], {
    "jsCode": """// Parse robots.txt content
const body = $input.first().json.data || $input.first().json.body || '';
const lines = body.split('\\n');
const rules = { userAgents: [], disallowed: [], allowed: [], sitemaps: [], issues: [] };
let currentUA = '';

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;

  const [directive, ...valueParts] = trimmed.split(':');
  const value = valueParts.join(':').trim();
  const dir = directive.toLowerCase().trim();

  if (dir === 'user-agent') { currentUA = value; rules.userAgents.push(value); }
  else if (dir === 'disallow') { rules.disallowed.push({ ua: currentUA, path: value }); }
  else if (dir === 'allow') { rules.allowed.push({ ua: currentUA, path: value }); }
  else if (dir === 'sitemap') { rules.sitemaps.push(value); }
}

// Check for issues
if (!rules.userAgents.includes('*')) rules.issues.push('No wildcard user-agent rule');
if (rules.disallowed.some(r => r.path === '/')) rules.issues.push('WARNING: Entire site disallowed for some user-agent');
if (rules.sitemaps.length === 0) rules.issues.push('No sitemap declared in robots.txt');
const blockingImportant = rules.disallowed.filter(r =>
  r.path.includes('/wp-content/') || r.path.includes('/assets/') || r.path.includes('.css') || r.path.includes('.js')
);
if (blockingImportant.length > 0) rules.issues.push('Blocking potentially important resources: ' + blockingImportant.map(r=>r.path).join(', '));

return [{ json: {
  robotsTxt: body.substring(0, 2000),
  totalDisallowRules: rules.disallowed.length,
  totalAllowRules: rules.allowed.length,
  sitemapsInRobots: rules.sitemaps,
  issues: rules.issues,
  hasWildcardUA: rules.userAgents.includes('*'),
  disallowedPaths: rules.disallowed.slice(0, 50)
}}];"""
})

# --- HTTPS Check ---
add_node("HTTPS Redirect Check", "n8n-nodes-base.httpRequest", [-1600, 1500], {
    "url": "={{ $json.websiteUrl.replace('https://', 'http://') }}",
    "method": "GET",
    "options": {
        "timeout": 15000,
        "redirect": {"redirect": {"followRedirects": False}},
        "response": {"response": {"fullResponse": True}}
    }
})

add_node("Analyze HTTPS", "n8n-nodes-base.code", [-1300, 1500], {
    "jsCode": """// Check HTTPS implementation
const response = $input.first().json;
const statusCode = response.statusCode || response.headers?.status || 0;
const location = response.headers?.location || '';
const hasHttpsRedirect = statusCode >= 300 && statusCode < 400 && location.startsWith('https://');
const isAlreadyHttps = $('Set Client Variables').first().json.websiteUrl.startsWith('https://');

return [{ json: {
  httpsEnabled: isAlreadyHttps,
  httpRedirectsToHttps: hasHttpsRedirect,
  redirectStatusCode: statusCode,
  redirectLocation: location,
  issues: !isAlreadyHttps && !hasHttpsRedirect ? ['Site does not redirect HTTP to HTTPS'] :
          statusCode === 302 ? ['Using 302 temporary redirect instead of 301 permanent'] : []
}}];"""
})

# --- Full Site Crawl via Apify ---
add_node("Full Site Crawl (Apify)", "@apify/n8n-nodes-apify.apify", [-1600, 1700], {
    "actorId": {"__rl": True, "value": "aYG0l9s7dbB7j3gbS", "mode": "list",
                "cachedResultName": "Website Content Crawler (apify/website-content-crawler)"},
    "input": '={\n  "startUrls": [{ "url": "{{ $json.websiteUrl }}" }],\n  "maxCrawlPages": 500,\n  "maxCrawlDepth": 5,\n  "crawlerType": "cheerio",\n  "includeUrlGlobs": [],\n  "excludeUrlGlobs": ["**/wp-admin/**", "**/feed/**", "**/xmlrpc**"],\n  "saveHtml": true,\n  "saveMarkdown": true,\n  "proxyConfiguration": { "useApifyProxy": true }\n}',
}, CREDS["apify"])

# --- Process Crawl Data ---
add_node("Process Crawl Data", "n8n-nodes-base.code", [-1300, 1700], {
    "jsCode": """// Process full site crawl data - extract SEO elements from all pages
const pages = $input.all();
const results = {
  totalPages: pages.length,
  pages: [],
  siteWideIssues: { missingTitles: 0, duplicateTitles: [], missingMetas: 0, duplicateMetas: [],
    missingH1: 0, multipleH1: 0, thinContent: 0, missingSchema: 0, brokenInternalLinks: 0 },
  titles: {}, metas: {}
};

for (const page of pages) {
  const p = page.json;
  const url = p.url || '';
  const html = p.html || p.text || '';
  const title = (html.match(/<title[^>]*>([^<]*)<\\/title>/i) || [])[1] || '';
  const metaDesc = (html.match(/<meta\\s+name=["']description["']\\s+content=["']([^"']*)["']/i) || [])[1] || '';
  const h1s = (html.match(/<h1[^>]*>[^<]*<\\/h1>/gi) || []);
  const h2s = (html.match(/<h2[^>]*>[^<]*<\\/h2>/gi) || []);
  const wordCount = (p.text || html.replace(/<[^>]*>/g, '')).split(/\\s+/).filter(w => w.length > 0).length;
  const hasSchema = html.includes('application/ld+json') || html.includes('itemscope');
  const canonical = (html.match(/<link\\s+rel=["']canonical["']\\s+href=["']([^"']*)["']/i) || [])[1] || '';
  const internalLinks = (html.match(/href=["'][^"']*["']/gi) || []).length;
  const images = (html.match(/<img[^>]*>/gi) || []);
  const imagesWithoutAlt = images.filter(img => !img.includes('alt=')).length;

  // Track duplicates
  if (!title) results.siteWideIssues.missingTitles++;
  else { results.titles[title] = (results.titles[title] || []); results.titles[title].push(url); }
  if (!metaDesc) results.siteWideIssues.missingMetas++;
  else { results.metas[metaDesc] = (results.metas[metaDesc] || []); results.metas[metaDesc].push(url); }
  if (h1s.length === 0) results.siteWideIssues.missingH1++;
  if (h1s.length > 1) results.siteWideIssues.multipleH1++;
  if (wordCount < 300) results.siteWideIssues.thinContent++;
  if (!hasSchema) results.siteWideIssues.missingSchema++;

  results.pages.push({
    url, title: title.substring(0, 100),
    titleLength: title.length,
    metaDescription: metaDesc.substring(0, 200),
    metaDescLength: metaDesc.length,
    h1Count: h1s.length, h2Count: h2s.length, wordCount,
    hasSchema, canonical, internalLinkCount: internalLinks,
    imageCount: images.length, imagesWithoutAlt,
    isThinContent: wordCount < 300,
    titleIssue: !title ? 'MISSING' : title.length > 60 ? 'TOO_LONG' : title.length < 30 ? 'TOO_SHORT' : 'OK',
    metaIssue: !metaDesc ? 'MISSING' : metaDesc.length > 160 ? 'TOO_LONG' : metaDesc.length < 70 ? 'TOO_SHORT' : 'OK'
  });
}

// Find duplicates
results.siteWideIssues.duplicateTitles = Object.entries(results.titles)
  .filter(([t, urls]) => urls.length > 1).map(([t, urls]) => ({ title: t, count: urls.length, urls }));
results.siteWideIssues.duplicateMetas = Object.entries(results.metas)
  .filter(([m, urls]) => urls.length > 1).map(([m, urls]) => ({ meta: m, count: urls.length, urls }));

delete results.titles;
delete results.metas;

return [{ json: results }];"""
})

# --- Apify SEO Audit Tool ---
add_node("Apify SEO Audit", "@apify/n8n-nodes-apify.apify", [-1600, 1900], {
    "actorId": {"__rl": True, "value": "UFSUQD7pWNwN3jExC", "mode": "list",
                "cachedResultName": "Complete SEO Audit Tool - Comprehensive Website SEO Analysis (smart-digital/complete-seo-audit-tool)"},
    "input": '={\n  "url": "{{ $json.websiteUrl }}",\n  "maxPages": 200\n}',
}, CREDS["apify"])

# --- Merge Technical Data ---
add_node("Merge Technical Data", "n8n-nodes-base.merge", [-900, 900], {
    "mode": "append"
})

add_node("Process Technical Merge", "n8n-nodes-base.code", [-650, 900], {
    "jsCode": """// Combine all technical audit data into a single structured object
const items = $input.all().map(i => i.json);
const clientVars = $('Set Client Variables').first().json;
const today = new Date().toISOString().split('T')[0];

return [{ json: {
  auditId: 'TECH_AUDIT_' + today,
  clientName: clientVars.clientName,
  websiteUrl: clientVars.websiteUrl,
  auditDate: today,
  technicalData: items,
  dataSourceCount: items.length
}}];"""
})

# Connect Phase 2 data collection
connect("Set Client Variables", "PageSpeed Mobile")
connect("Set Client Variables", "PageSpeed Desktop")
connect("Set Client Variables", "GSC: Query Performance")
connect("Set Client Variables", "GSC: Page Performance")
connect("Set Client Variables", "GSC: Sitemaps")
connect("Set Client Variables", "GSC: Country Performance")
connect("Set Client Variables", "Fetch robots.txt")
connect("Set Client Variables", "HTTPS Redirect Check")
connect("Set Client Variables", "Full Site Crawl (Apify)")
connect("Set Client Variables", "Apify SEO Audit")

connect("PageSpeed Mobile", "Format PageSpeed Results")
connect("PageSpeed Desktop", "Format PageSpeed Results")
connect("Fetch robots.txt", "Parse robots.txt")
connect("HTTPS Redirect Check", "Analyze HTTPS")
connect("Full Site Crawl (Apify)", "Process Crawl Data")

# All technical data merges
connect("Format PageSpeed Results", "Merge Technical Data")
connect("GSC: Query Performance", "Merge Technical Data")
connect("GSC: Page Performance", "Merge Technical Data")
connect("GSC: Sitemaps", "Merge Technical Data")
connect("GSC: Country Performance", "Merge Technical Data")
connect("Parse robots.txt", "Merge Technical Data")
connect("Analyze HTTPS", "Merge Technical Data")
connect("Process Crawl Data", "Merge Technical Data")
connect("Apify SEO Audit", "Merge Technical Data")
connect("Merge Technical Data", "Process Technical Merge")

# --- Technical Audit AI Agent ---
add_node("OpenAI: Technical Audit", "@n8n/n8n-nodes-langchain.lmChatOpenAi", [-450, 600], {
    "model": {"__rl": True, "mode": "list", "value": "gpt-4.1-nano", "cachedResultName": "gpt-4.1-nano"},
    "options": {"temperature": 0.3, "timeout": 300000}
}, CREDS["openai"])

add_node("Technical Audit Agent", "@n8n/n8n-nodes-langchain.agent", [-400, 400], {
    "text": """=You are a Senior Technical SEO Auditor. Analyze the following technical audit data and produce a structured report.

CLIENT: {{ $json.clientName }}
WEBSITE: {{ $json.websiteUrl }}
AUDIT DATE: {{ $json.auditDate }}

TECHNICAL DATA:
{{ JSON.stringify($json.technicalData, null, 2) }}

## YOUR REPORT MUST INCLUDE:

### 1. SITE HEALTH SCORE (0-100)
Calculate based on: crawlability, HTTPS, Core Web Vitals, robots.txt, sitemap, internal linking, duplicate content, schema

### 2. CORE WEB VITALS SUMMARY
- LCP, CLS, INP scores for mobile and desktop
- Performance, Accessibility, Best Practices, SEO scores
- Key render-blocking resources and optimization opportunities

### 3. CRAWLABILITY & INDEXING
- Total pages found vs indexed
- robots.txt issues
- Sitemap status
- Orphan pages

### 4. TECHNICAL ISSUES (grouped by severity)
**Critical**: Issues that block indexing or severely hurt rankings
**High**: Issues with significant SEO impact
**Medium**: Issues with moderate impact
**Low**: Minor improvements

### 5. PRIORITY ACTION ITEMS
Numbered list of fixes ordered by impact, with estimated effort (Quick Fix / Medium / Complex)

Keep analysis factual. Cite specific URLs, metrics, and data points. Do not speculate.""",
    "options": {"systemMessage": "You are a technical SEO specialist. Output structured, data-driven analysis only. Never invent data."}
})

connect("Process Technical Merge", "Technical Audit Agent")
connect("OpenAI: Technical Audit", "Technical Audit Agent", 0, 0, "ai_languageModel")

# ============================================================================
# PHASE 3: KEYWORD RESEARCH
# ============================================================================

add_node("Extract GSC Keywords", "n8n-nodes-base.code", [-200, 500], {
    "jsCode": """// Extract and categorize keywords from GSC query data
const techData = $('Process Technical Merge').first().json.technicalData || [];
const clientVars = $('Set Client Variables').first().json;

// Find the GSC query data (it's one of the merged items)
let queryRows = [];
for (const d of techData) {
  if (d.rows && d.rows[0] && d.rows[0].keys) {
    // Check if this is query-dimension data (single key per row that looks like a search query)
    const firstKey = d.rows[0].keys[0] || '';
    if (!firstKey.startsWith('http') && !firstKey.match(/^[a-z]{2,3}$/)) {
      queryRows = d.rows;
      break;
    }
  }
}

// Categorize keywords
const keywords = queryRows.map(row => {
  const query = row.keys[0];
  const clicks = row.clicks || 0;
  const impressions = row.impressions || 0;
  const ctr = row.ctr || 0;
  const position = row.position || 0;

  // Intent classification
  let intent = 'informational';
  if (query.match(/buy|price|cost|cheap|best|review|compare|deal|discount|coupon|shop|order/i)) intent = 'commercial';
  else if (query.match(/how|what|why|when|where|who|guide|tutorial|tips|learn/i)) intent = 'informational';
  else if (query.match(/login|sign in|account|contact|support|phone|address/i)) intent = 'navigational';
  else if (query.match(/near me|in \\w+|local|delivery|service area/i)) intent = 'local';

  // Opportunity classification
  let opportunity = 'maintain';
  if (position <= 3 && ctr < 0.05) opportunity = 'ctr_optimization';
  else if (position > 3 && position <= 10) opportunity = 'push_to_top3';
  else if (position > 10 && position <= 20) opportunity = 'quick_win';
  else if (position > 20 && impressions > 100) opportunity = 'content_needed';

  // AEO flag (question queries)
  const isAEO = /^(how|what|why|when|where|who|can|does|is|are|will|should)\\b/i.test(query);

  return { query, clicks, impressions, ctr: Math.round(ctr * 10000) / 100,
    position: Math.round(position * 10) / 10, intent, opportunity, isAEO };
});

// Sort by impressions
keywords.sort((a, b) => b.impressions - a.impressions);

// Summary stats
const summary = {
  totalKeywords: keywords.length,
  byIntent: { informational: 0, commercial: 0, navigational: 0, local: 0 },
  byOpportunity: { ctr_optimization: 0, push_to_top3: 0, quick_win: 0, content_needed: 0, maintain: 0 },
  aeoKeywords: keywords.filter(k => k.isAEO).length,
  top10Keywords: keywords.filter(k => k.position <= 10).length,
  top3Keywords: keywords.filter(k => k.position <= 3).length,
};
keywords.forEach(k => {
  summary.byIntent[k.intent] = (summary.byIntent[k.intent] || 0) + 1;
  summary.byOpportunity[k.opportunity] = (summary.byOpportunity[k.opportunity] || 0) + 1;
});

return [{ json: {
  summary,
  keywords: keywords.slice(0, 200),
  aeoKeywords: keywords.filter(k => k.isAEO).slice(0, 50),
  quickWins: keywords.filter(k => k.opportunity === 'quick_win').slice(0, 30),
  ctrOpportunities: keywords.filter(k => k.opportunity === 'ctr_optimization').slice(0, 30),
  competitors: [clientVars.competitor1, clientVars.competitor2, clientVars.competitor3].filter(Boolean)
}}];"""
})

# Competitor Keyword Scraping via Apify
add_node("Scrape Competitor Keywords", "@apify/n8n-nodes-apify.apify", [-200, 700], {
    "actorId": {"__rl": True, "value": "TMVSmdgr57tzAHwYv", "mode": "list",
                "cachedResultName": "Ahrefs Scraper (radeance/ahrefs-scraper)"},
    "input": '={{ JSON.stringify({ urls: [$json.competitor1 ? "https://ahrefs.com/organic-keywords/" + $json.competitor1.replace("https://","").replace("http://","").split("/")[0] : ""], maxPages: 3 }) }}',
}, CREDS["apify"])

# Keyword Clustering AI Agent
add_node("OpenAI: Keyword Research", "@n8n/n8n-nodes-langchain.lmChatOpenAi", [100, 800], {
    "model": {"__rl": True, "mode": "list", "value": "gpt-4.1-nano", "cachedResultName": "gpt-4.1-nano"},
    "options": {"temperature": 0.4, "timeout": 300000}
}, CREDS["openai"])

add_node("Keyword Research Agent", "@n8n/n8n-nodes-langchain.agent", [150, 500], {
    "text": """=You are an expert SEO keyword strategist. Analyze the following keyword data and produce a comprehensive keyword research report.

WEBSITE: {{ $('Set Client Variables').first().json.websiteUrl }}
TARGET LOCATION: {{ $('Set Client Variables').first().json.targetLocation }}
GOALS: {{ $('Set Client Variables').first().json.goals }}
COMPETITORS: {{ $('Set Client Variables').first().json.competitor1 }}, {{ $('Set Client Variables').first().json.competitor2 }}, {{ $('Set Client Variables').first().json.competitor3 }}

GSC KEYWORD DATA:
{{ JSON.stringify($json, null, 2) }}

## YOUR REPORT MUST INCLUDE:

### 1. KEYWORD UNIVERSE SUMMARY
- Total keywords tracked, by intent category, top performers

### 2. KEYWORD CLUSTERS (group by topic)
Group all keywords into 10-20 thematic clusters. For each cluster:
- Cluster name
- Primary keyword + search intent
- Supporting keywords
- Current average position
- Content recommendation (new page, optimize existing, blog post)

### 3. AEO OPPORTUNITIES (Answer Engine Optimization)
- Question-based keywords suitable for featured snippets/AI answers
- Recommended answer format (paragraph, list, table)
- PAA (People Also Ask) opportunities

### 4. QUICK WINS (Position 11-20 keywords with high impressions)
Prioritized list of keywords that need small pushes to reach page 1

### 5. CTR OPTIMIZATION (Top 3 but low CTR)
Keywords ranking well but underperforming on clicks - title/description improvements needed

### 6. CONTENT GAP ANALYSIS
- Missing topic areas based on competitor comparison
- New content recommendations with target keywords

### 7. LOCAL/GEO OPPORTUNITIES
Location-based keyword opportunities if applicable

Output as structured analysis with specific, actionable recommendations.""",
    "options": {"systemMessage": "You are a keyword research specialist. Base all analysis on the provided data. Clearly separate data-driven insights from recommendations."}
})

connect("Process Technical Merge", "Extract GSC Keywords")
connect("Set Client Variables", "Scrape Competitor Keywords")
connect("Extract GSC Keywords", "Keyword Research Agent")
connect("OpenAI: Keyword Research", "Keyword Research Agent", 0, 0, "ai_languageModel")

# ============================================================================
# PHASE 4: ON-PAGE AUDIT
# ============================================================================

add_node("Prepare On-Page Data", "n8n-nodes-base.code", [700, 400], {
    "jsCode": """// Prepare crawl data for on-page analysis
const techData = $('Process Technical Merge').first().json.technicalData || [];

// Find crawl results
let crawlData = null;
for (const d of techData) {
  if (d.totalPages || d.pages) { crawlData = d; break; }
}

if (!crawlData) {
  return [{ json: { error: 'No crawl data available', pages: [], siteWideIssues: {} } }];
}

// Extract schema data from pages
const schemaAudit = {
  pagesWithSchema: 0,
  pagesWithoutSchema: 0,
  schemaTypes: {},
  missingSchemaUrls: []
};

(crawlData.pages || []).forEach(page => {
  if (page.hasSchema) {
    schemaAudit.pagesWithSchema++;
  } else {
    schemaAudit.pagesWithoutSchema++;
    schemaAudit.missingSchemaUrls.push(page.url);
  }
});

return [{ json: {
  totalPages: crawlData.totalPages || 0,
  siteWideIssues: crawlData.siteWideIssues || {},
  schemaAudit,
  metadataIssues: {
    missingTitles: (crawlData.pages || []).filter(p => p.titleIssue === 'MISSING'),
    longTitles: (crawlData.pages || []).filter(p => p.titleIssue === 'TOO_LONG'),
    shortTitles: (crawlData.pages || []).filter(p => p.titleIssue === 'TOO_SHORT'),
    missingMetas: (crawlData.pages || []).filter(p => p.metaIssue === 'MISSING'),
    longMetas: (crawlData.pages || []).filter(p => p.metaIssue === 'TOO_LONG'),
    shortMetas: (crawlData.pages || []).filter(p => p.metaIssue === 'TOO_SHORT'),
    duplicateTitles: crawlData.siteWideIssues?.duplicateTitles || [],
    duplicateMetas: crawlData.siteWideIssues?.duplicateMetas || []
  },
  contentIssues: {
    thinPages: (crawlData.pages || []).filter(p => p.isThinContent),
    missingH1: (crawlData.pages || []).filter(p => p.h1Count === 0),
    multipleH1: (crawlData.pages || []).filter(p => p.h1Count > 1),
    imagesWithoutAlt: (crawlData.pages || []).filter(p => p.imagesWithoutAlt > 0)
  },
  allPages: (crawlData.pages || []).slice(0, 100)
}}];"""
})

add_node("OpenAI: On-Page Audit", "@n8n/n8n-nodes-langchain.lmChatOpenAi", [950, 700], {
    "model": {"__rl": True, "mode": "list", "value": "gpt-4.1-nano", "cachedResultName": "gpt-4.1-nano"},
    "options": {"temperature": 0.3, "timeout": 300000}
}, CREDS["openai"])

add_node("On-Page Audit Agent", "@n8n/n8n-nodes-langchain.agent", [1000, 400], {
    "text": """=You are an On-Page SEO Specialist. Analyze the following site-wide on-page data and produce a detailed audit report.

WEBSITE: {{ $('Set Client Variables').first().json.websiteUrl }}

ON-PAGE DATA:
{{ JSON.stringify($json, null, 2) }}

## YOUR REPORT MUST INCLUDE:

### 1. METADATA AUDIT
- Missing titles count + URLs
- Duplicate titles (exact matches across pages)
- Too long/short titles
- Missing meta descriptions + URLs
- Duplicate meta descriptions
- Low CTR title recommendations

### 2. CONTENT AUDIT
- Thin content pages (< 300 words) with URLs
- Missing H1 tags
- Multiple H1 tags
- H2/H3 structure issues
- Images without alt text

### 3. SCHEMA/STRUCTURED DATA AUDIT
- Pages WITH schema vs WITHOUT
- Recommended schema types per page type (homepage→Organization, blog→Article, product→Product, etc.)
- Missing schema opportunities

### 4. E-E-A-T ASSESSMENT
- Author information presence
- About page quality
- Trust signals (testimonials, certifications, etc.)

### 5. PRIORITY FIXES (ordered by impact)
For each fix: URL, Issue, Recommended Fix, Priority (Critical/High/Medium/Low)

Base all analysis on provided data. Be specific with URLs and metrics.""",
    "options": {"systemMessage": "You are an on-page SEO specialist. Analyze data thoroughly. Always reference specific URLs and counts."}
})

connect("Process Technical Merge", "Prepare On-Page Data")
connect("Prepare On-Page Data", "On-Page Audit Agent")
connect("OpenAI: On-Page Audit", "On-Page Audit Agent", 0, 0, "ai_languageModel")

# ============================================================================
# PHASE 5: OFF-PAGE AUDIT
# ============================================================================

add_node("Ahrefs Backlink Scrape", "@apify/n8n-nodes-apify.apify", [1600, 400], {
    "actorId": {"__rl": True, "value": "TMVSmdgr57tzAHwYv", "mode": "list",
                "cachedResultName": "Ahrefs Scraper (radeance/ahrefs-scraper)"},
    "input": '={{ JSON.stringify({ urls: ["https://ahrefs.com/backlink-checker/" + $json.websiteUrl.replace("https://","").replace("http://","").split("/")[0]], maxPages: 5 }) }}',
}, CREDS["apify"])

add_node("Process Backlink Data", "n8n-nodes-base.code", [1900, 400], {
    "jsCode": """// Process Ahrefs backlink data
const items = $input.all();
const clientVars = $('Set Client Variables').first().json;
const backlinks = [];
let totalBacklinks = 0;
let referringDomains = 0;
let domainRating = 'N/A';
const anchorTexts = {};
const referringDomainsList = {};
let toxicIndicators = 0;

for (const item of items) {
  const d = item.json;

  // Try to extract summary stats
  if (d.domainRating) domainRating = d.domainRating;
  if (d.backlinks) totalBacklinks = d.backlinks;
  if (d.referringDomains) referringDomains = d.referringDomains;

  // Process individual backlinks if available
  if (d.results || d.items) {
    const links = d.results || d.items || [];
    for (const link of links) {
      const anchor = link.anchor || link.anchorText || '';
      const source = link.sourceUrl || link.refpage || '';
      const domain = link.sourceDomain || link.refdomain || '';
      const dofollow = link.dofollow !== false;
      const dr = link.domainRating || link.dr || 0;

      // Anchor text profiling
      const anchorType = !anchor || anchor.length < 2 ? 'naked/empty' :
        anchor.toLowerCase().includes(clientVars.websiteUrl.replace(/https?:\\/\\//, '').replace(/\\//g, '')) ? 'branded' :
        anchor.match(/click here|read more|visit|here|this/i) ? 'generic' : 'keyword-rich';
      anchorTexts[anchorType] = (anchorTexts[anchorType] || 0) + 1;

      // Referring domains
      if (domain) referringDomainsList[domain] = (referringDomainsList[domain] || 0) + 1;

      // Toxic indicators (very basic heuristic)
      if (dr < 10 || domain.match(/spam|link|seo|directory|free/i)) toxicIndicators++;

      backlinks.push({ source: source.substring(0, 200), domain, anchor: anchor.substring(0, 100), anchorType, dofollow, dr });
    }
  }
}

const uniqueDomains = Object.keys(referringDomainsList).length;

return [{ json: {
  summary: {
    totalBacklinks: totalBacklinks || backlinks.length,
    referringDomains: referringDomains || uniqueDomains,
    domainRating,
    dofollowRatio: backlinks.filter(b => b.dofollow).length / Math.max(backlinks.length, 1),
    toxicIndicators,
    estimatedToxicPercent: Math.round((toxicIndicators / Math.max(backlinks.length, 1)) * 100)
  },
  anchorTextProfile: anchorTexts,
  topReferringDomains: Object.entries(referringDomainsList)
    .sort((a, b) => b[1] - a[1]).slice(0, 30)
    .map(([domain, count]) => ({ domain, backlinks: count })),
  backlinks: backlinks.slice(0, 100),
  competitors: [clientVars.competitor1, clientVars.competitor2, clientVars.competitor3].filter(Boolean)
}}];"""
})

add_node("OpenAI: Backlink Audit", "@n8n/n8n-nodes-langchain.lmChatOpenAi", [2200, 700], {
    "model": {"__rl": True, "mode": "list", "value": "gpt-4.1-nano", "cachedResultName": "gpt-4.1-nano"},
    "options": {"temperature": 0.3, "timeout": 300000}
}, CREDS["openai"])

add_node("Backlink Audit Agent", "@n8n/n8n-nodes-langchain.agent", [2250, 400], {
    "text": """=You are a Link Building & Off-Page SEO Specialist. Analyze the backlink profile data and produce a comprehensive off-page audit.

WEBSITE: {{ $('Set Client Variables').first().json.websiteUrl }}

BACKLINK DATA:
{{ JSON.stringify($json, null, 2) }}

## YOUR REPORT MUST INCLUDE:

### 1. BACKLINK PROFILE SUMMARY
- Total backlinks, referring domains, domain rating
- Dofollow vs nofollow ratio
- Growth trend assessment

### 2. ANCHOR TEXT ANALYSIS
- Distribution: branded vs keyword-rich vs generic vs naked URLs
- Over-optimization risk assessment
- Recommended anchor text ratio

### 3. TOXIC BACKLINK ASSESSMENT
- Estimated toxic percentage
- Suspicious patterns (spam domains, low DR, irrelevant niches)
- Disavow recommendations

### 4. REFERRING DOMAIN QUALITY
- Top referring domains by authority
- Domain diversity score
- Industry relevance

### 5. COMPETITOR BACKLINK GAP
Based on available competitor data:
- Link building opportunities from competitor backlinks
- Common referring domains
- Unique competitor advantages

### 6. LINK BUILDING RECOMMENDATIONS
- Priority link building targets
- Recommended outreach strategies
- Estimated effort and timeline

Be specific with domain names and metrics. Flag genuine risks.""",
    "options": {"systemMessage": "You are a backlink analysis specialist. Base analysis on provided data only. Be conservative with toxic assessments."}
})

connect("Set Client Variables", "Ahrefs Backlink Scrape")
connect("Ahrefs Backlink Scrape", "Process Backlink Data")
connect("Process Backlink Data", "Backlink Audit Agent")
connect("OpenAI: Backlink Audit", "Backlink Audit Agent", 0, 0, "ai_languageModel")

# ============================================================================
# PHASE 6: COMPETITOR ANALYSIS
# ============================================================================

add_node("Prepare Competitor URLs", "n8n-nodes-base.code", [2500, 400], {
    "jsCode": """// Prepare competitor URLs for parallel analysis
const vars = $('Set Client Variables').first().json;
const competitors = [vars.competitor1, vars.competitor2, vars.competitor3].filter(Boolean);

if (competitors.length === 0) {
  return [{ json: { noCompetitors: true, message: 'No competitors provided - skipping competitor analysis' } }];
}

return competitors.map(url => ({
  json: {
    competitorUrl: url,
    competitorDomain: url.replace(/https?:\\/\\//, '').replace(/\\/.*/, ''),
    clientUrl: vars.websiteUrl,
    clientName: vars.clientName
  }
}));"""
})

add_node("Competitor PageSpeed", "n8n-nodes-base.httpRequest", [2800, 300], {
    "url": "=https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url={{ encodeURIComponent($json.competitorUrl) }}&category=performance&category=seo&strategy=mobile",
    "method": "GET",
    "options": {"timeout": 120000}
})

add_node("Format Competitor PageSpeed", "n8n-nodes-base.code", [3050, 300], {
    "jsCode": """// Format competitor PageSpeed results
const json = $input.first().json;
const lighthouse = json.lighthouseResult || {};
const categories = lighthouse.categories || {};
const audits = lighthouse.audits || {};
const competitorInfo = $('Prepare Competitor URLs').first().json;

return [{ json: {
  competitor: competitorInfo.competitorUrl,
  performanceScore: Math.round((categories.performance?.score || 0) * 100),
  seoScore: Math.round((categories.seo?.score || 0) * 100),
  LCP: audits['largest-contentful-paint']?.displayValue || 'N/A',
  CLS: audits['cumulative-layout-shift']?.displayValue || 'N/A',
  FCP: audits['first-contentful-paint']?.displayValue || 'N/A',
  TBT: audits['total-blocking-time']?.displayValue || 'N/A',
  TTFB: audits['server-response-time']?.displayValue || 'N/A'
}}];"""
})

# Competitor Backlinks
add_node("Competitor Backlinks Scrape", "@apify/n8n-nodes-apify.apify", [2800, 500], {
    "actorId": {"__rl": True, "value": "TMVSmdgr57tzAHwYv", "mode": "list",
                "cachedResultName": "Ahrefs Scraper (radeance/ahrefs-scraper)"},
    "input": '={\n  "urls": ["https://ahrefs.com/backlink-checker/{{ $json.competitorDomain }}"],\n  "maxPages": 3\n}',
}, CREDS["apify"])

add_node("Merge Competitor Data", "n8n-nodes-base.merge", [3300, 400], {
    "mode": "append"
})

add_node("OpenAI: Competitor Analysis", "@n8n/n8n-nodes-langchain.lmChatOpenAi", [3500, 700], {
    "model": {"__rl": True, "mode": "list", "value": "gpt-4.1-nano", "cachedResultName": "gpt-4.1-nano"},
    "options": {"temperature": 0.3, "timeout": 300000}
}, CREDS["openai"])

add_node("Competitor Analysis Agent", "@n8n/n8n-nodes-langchain.agent", [3550, 400], {
    "text": """=You are a Competitive Intelligence SEO Analyst. Compare the client's website against competitors.

CLIENT: {{ $('Set Client Variables').first().json.clientName }}
CLIENT WEBSITE: {{ $('Set Client Variables').first().json.websiteUrl }}
COMPETITORS: {{ $('Set Client Variables').first().json.competitor1 }}, {{ $('Set Client Variables').first().json.competitor2 }}, {{ $('Set Client Variables').first().json.competitor3 }}

COMPETITOR DATA:
{{ JSON.stringify($input.all().map(i => i.json), null, 2) }}

CLIENT TECHNICAL DATA (from earlier audit):
PageSpeed & CWV data available from the technical audit phase.

## YOUR REPORT MUST INCLUDE:

### 1. COMPETITIVE OVERVIEW TABLE
| Metric | Client | Competitor 1 | Competitor 2 | Competitor 3 |
Compare: Performance Score, SEO Score, LCP, CLS, Domain Rating, Backlinks, Referring Domains

### 2. COMPETITOR TECHNICAL COMPARISON
- Site speed comparison
- Core Web Vitals comparison
- Who has the technical advantage and why

### 3. KEYWORD GAP ANALYSIS
Based on available data:
- Keywords competitors rank for that client doesn't
- Overlapping keywords where client is behind
- Unique client advantages

### 4. BACKLINK GAP
- Competitor backlink sources client is missing
- Link velocity comparison
- Anchor strategy comparison

### 5. STRATEGIC RECOMMENDATIONS
- Quick wins to close competitive gaps
- Long-term strategies to surpass competitors
- Priority actions ranked by impact

Be factual. Use actual numbers. Clearly state when data is limited.""",
    "options": {"systemMessage": "You are a competitive SEO analyst. Compare objectively using available data. Acknowledge data limitations."}
})

connect("Set Client Variables", "Prepare Competitor URLs")
connect("Prepare Competitor URLs", "Competitor PageSpeed")
connect("Prepare Competitor URLs", "Competitor Backlinks Scrape")
connect("Competitor PageSpeed", "Format Competitor PageSpeed")
connect("Format Competitor PageSpeed", "Merge Competitor Data")
connect("Competitor Backlinks Scrape", "Merge Competitor Data")
connect("Merge Competitor Data", "Competitor Analysis Agent")
connect("OpenAI: Competitor Analysis", "Competitor Analysis Agent", 0, 0, "ai_languageModel")

# ============================================================================
# PHASE 7: GA4 ANALYTICS (Conditional)
# ============================================================================

add_node("Check GA4 Available", "n8n-nodes-base.if", [-200, 1000], {
    "conditions": {
        "options": {"version": 2, "caseSensitive": True, "leftValue": "", "typeValidation": "strict"},
        "combinator": "and",
        "conditions": [{
            "id": "ga4-check",
            "operator": {"type": "string", "operation": "isNotEmpty"},
            "leftValue": "={{ $('Set Client Variables').first().json.ga4PropertyId }}",
        }]
    }
})

add_node("Fetch GA4: Traffic Overview", "n8n-nodes-base.googleAnalytics", [-50, 950], {
    "propertyId": {"__rl": True, "mode": "id", "value": "={{ $('Set Client Variables').first().json.ga4PropertyId }}"},
    "metricsGA4": {"metricValues": [
        {"listName": "totalUsers"},
        {"listName": "sessions"},
        {"listName": "screenPageViews"},
        {"listName": "averageSessionDuration"},
        {"listName": "bounceRate"},
    ]},
    "dimensionsGA4": {"dimensionValues": [{"listName": "date"}]},
    "dateRange": "last90Days",
    "options": {}
}, CREDS["google_analytics"])

add_node("Fetch GA4: Top Pages", "n8n-nodes-base.googleAnalytics", [-50, 1150], {
    "propertyId": {"__rl": True, "mode": "id", "value": "={{ $('Set Client Variables').first().json.ga4PropertyId }}"},
    "metricsGA4": {"metricValues": [
        {"listName": "screenPageViews"},
        {"listName": "totalUsers"},
        {"listName": "averageSessionDuration"},
        {"listName": "bounceRate"},
    ]},
    "dimensionsGA4": {"dimensionValues": [{"listName": "pagePath"}]},
    "dateRange": "last90Days",
    "options": {"limit": 50}
}, CREDS["google_analytics"])

add_node("Fetch GA4: Traffic Sources", "n8n-nodes-base.googleAnalytics", [-50, 1350], {
    "propertyId": {"__rl": True, "mode": "id", "value": "={{ $('Set Client Variables').first().json.ga4PropertyId }}"},
    "metricsGA4": {"metricValues": [
        {"listName": "sessions"},
        {"listName": "totalUsers"},
        {"listName": "screenPageViews"},
    ]},
    "dimensionsGA4": {"dimensionValues": [{"listName": "sessionSource"}, {"listName": "sessionMedium"}]},
    "dateRange": "last90Days",
    "options": {"limit": 30}
}, CREDS["google_analytics"])

add_node("Merge GA4 Data", "n8n-nodes-base.merge", [250, 1150], {
    "mode": "append"
})

add_node("Process GA4 Data", "n8n-nodes-base.code", [500, 1150], {
    "jsCode": """// Process GA4 data for analysis
const items = $input.all().map(i => i.json);
return [{ json: { ga4Data: items, hasGA4: true } }];"""
})

connect("Set Client Variables", "Check GA4 Available")
connect("Check GA4 Available", "Fetch GA4: Traffic Overview", 0)
connect("Check GA4 Available", "Fetch GA4: Top Pages", 0)
connect("Check GA4 Available", "Fetch GA4: Traffic Sources", 0)
connect("Fetch GA4: Traffic Overview", "Merge GA4 Data")
connect("Fetch GA4: Top Pages", "Merge GA4 Data")
connect("Fetch GA4: Traffic Sources", "Merge GA4 Data")
connect("Merge GA4 Data", "Process GA4 Data")

# ============================================================================
# PHASE 8: FINAL REPORT
# ============================================================================

add_node("Merge All Reports", "n8n-nodes-base.merge", [3800, 600], {
    "mode": "append",
    "options": {}
})

add_node("Compile Final Data", "n8n-nodes-base.code", [4050, 600], {
    "jsCode": """// Compile all reports into final structured output
const allData = $input.all().map(i => i.json);
const clientVars = $('Set Client Variables').first().json;
const today = new Date().toISOString().split('T')[0];

return [{ json: {
  auditId: 'SEO_AUDIT_' + today + '_' + clientVars.clientName.replace(/\\s+/g, '_'),
  clientName: clientVars.clientName,
  websiteUrl: clientVars.websiteUrl,
  auditDate: today,
  competitors: [clientVars.competitor1, clientVars.competitor2, clientVars.competitor3].filter(Boolean),
  targetLocation: clientVars.targetLocation,
  goals: clientVars.goals,
  reports: allData,
  reportCount: allData.length
}}];"""
})

add_node("OpenAI: Master Report", "@n8n/n8n-nodes-langchain.lmChatOpenAi", [4300, 900], {
    "model": {"__rl": True, "mode": "list", "value": "gpt-4.1-nano", "cachedResultName": "gpt-4.1-nano"},
    "options": {"temperature": 0.3, "timeout": 600000}
}, CREDS["openai"])

# Google Sheet tool for master agent
add_node("Sheet Tool: Write Report", "n8n-nodes-base.googleSheetsTool", [4300, 1050], {
    "operation": "appendOrUpdate",
    "documentId": {"__rl": True, "mode": "url", "value": ""},
    "sheetName": {"__rl": True, "mode": "name", "value": "={{ $fromAI('sheetName', 'The sheet tab name to write to', 'string') }}"},
    "columns": {"mappingMode": "autoMapInputData"},
    "options": {}
}, CREDS["google_sheets"])

add_node("Master Report Agent", "@n8n/n8n-nodes-langchain.agent", [4350, 600], {
    "text": """=You are the MASTER SEO ANALYST. Synthesize ALL specialist reports into a comprehensive client-ready executive audit.

CLIENT: {{ $json.clientName }}
WEBSITE: {{ $json.websiteUrl }}
AUDIT DATE: {{ $json.auditDate }}
COMPETITORS: {{ $json.competitors.join(', ') }}
TARGET LOCATION: {{ $json.targetLocation }}
GOALS: {{ $json.goals }}

ALL SPECIALIST REPORTS:
{{ JSON.stringify($json.reports, null, 2) }}

## PRODUCE THE FINAL AUDIT WITH THESE EXACT SECTIONS:

### EXECUTIVE SUMMARY
- Overall site health score (0-100)
- 3-5 critical findings
- 3-5 biggest opportunities
- Estimated SEO impact potential

### SECTION 1: TECHNICAL REPORT
Summarize technical audit findings:
- Site health score and key metrics
- Core Web Vitals (Mobile + Desktop)
- Crawlability & indexing status
- HTTPS & security
- Sitemap & robots.txt
- Top technical issues by severity

### SECTION 2: KEYWORD & CONTENT REPORT
- Keyword universe summary
- Top keyword clusters
- Content gaps and opportunities
- AEO opportunities
- On-page issues (metadata, thin content, schema)

### SECTION 3: BACKLINK ANALYSIS REPORT
- Backlink profile summary
- Domain rating & authority
- Anchor text profile
- Toxic backlink assessment
- Link building opportunities

### SECTION 4: COMPETITOR ANALYSIS REPORT
- Competitive positioning summary
- Technical comparison
- Keyword gap
- Backlink gap
- Competitive advantages & disadvantages

### SECTION 5: PRIORITY ACTION LIST
Create a numbered priority list (top 20) with:
| # | Action | Category | Priority | Effort | Expected Impact |
Ordered by impact (highest first).

### SECTION 6: 90-DAY ROADMAP
- Month 1: Quick wins and critical fixes
- Month 2: Content and keyword optimization
- Month 3: Link building and competitive moves

Use the Google Sheets tool to save key data to the report spreadsheet.
Write the executive summary to sheet 'Executive Summary'.
Write priority actions to sheet 'Priority Actions'.
Write the technical metrics to sheet 'Technical Metrics'.""",
    "options": {"systemMessage": "You are the master SEO analyst. Produce a comprehensive, professional audit report. Be data-driven and specific. Format clearly with headers and tables."}
})

# Connect reports to merge
connect("Technical Audit Agent", "Merge All Reports")
connect("Keyword Research Agent", "Merge All Reports")
connect("On-Page Audit Agent", "Merge All Reports")
connect("Backlink Audit Agent", "Merge All Reports")
connect("Competitor Analysis Agent", "Merge All Reports")
connect("Process GA4 Data", "Merge All Reports")

connect("Merge All Reports", "Compile Final Data")
connect("Compile Final Data", "Master Report Agent")
connect("OpenAI: Master Report", "Master Report Agent", 0, 0, "ai_languageModel")
connect("Sheet Tool: Write Report", "Master Report Agent", 0, 0, "ai_tool")

# --- Save to Google Sheets (multiple tabs) ---
add_node("Format Sheet Output", "n8n-nodes-base.code", [4700, 600], {
    "jsCode": """// Format the master report for Google Sheets output
const report = $input.first().json;
const clientVars = $('Set Client Variables').first().json;
const today = new Date().toISOString().split('T')[0];

// Extract the text output from the agent
const reportText = report.output || report.text || JSON.stringify(report);

return [{ json: {
  AuditID: 'SEO_AUDIT_' + today,
  ClientName: clientVars.clientName,
  WebsiteURL: clientVars.websiteUrl,
  AuditDate: today,
  Competitors: [clientVars.competitor1, clientVars.competitor2, clientVars.competitor3].filter(Boolean).join(', '),
  TargetLocation: clientVars.targetLocation,
  Goals: clientVars.goals,
  FullReport: reportText.substring(0, 50000),
  Status: 'Complete'
}}];"""
})

add_node("Save Master Report", "n8n-nodes-base.googleSheets", [5000, 500], {
    "operation": "append",
    "documentId": {"__rl": True, "mode": "url", "value": ""},
    "sheetName": {"__rl": True, "mode": "name", "value": "Audit Reports"},
    "columns": {"mappingMode": "autoMapInputData"},
    "options": {}
}, CREDS["google_sheets"])

# --- Update Status to Complete ---
add_node("Update Status: Complete", "n8n-nodes-base.googleSheets", [5000, 700], {
    "operation": "update",
    "documentId": {"__rl": True, "mode": "url", "value": ""},
    "sheetName": {"__rl": True, "mode": "name", "value": "Audit Queue"},
    "columns": {"mappingMode": "defineBelow", "value": {"Status": "Complete", "CompletedDate": "={{ new Date().toISOString().split('T')[0] }}"}},
    "options": {},
    "filtersUI": {"values": [{"lookupColumn": "Client Name", "lookupValue": "={{ $('Set Client Variables').first().json.clientName }}"}]}
}, CREDS["google_sheets"])

# --- Send Email ---
add_node("Send Audit Email", "n8n-nodes-base.gmail", [5000, 900], {
    "sendTo": "={{ $('Set Client Variables').first().json.clientEmail }}",
    "subject": "=SEO Audit Report - {{ $('Set Client Variables').first().json.clientName }} - {{ new Date().toISOString().split('T')[0] }}",
    "message": """=Hi,

Your comprehensive SEO audit for {{ $('Set Client Variables').first().json.websiteUrl }} is complete.

Please find the detailed report in the shared Google Sheet.

Key sections included:
✅ Technical Audit & Core Web Vitals
✅ Keyword Research & Content Analysis
✅ On-Page SEO Audit
✅ Backlink Profile Analysis
✅ Competitor Analysis
✅ Priority Action List & 90-Day Roadmap

Report Summary:
{{ $json.FullReport ? $json.FullReport.substring(0, 3000) : 'Please check the Google Sheet for full details.' }}

Best regards,
SEO Audit System""",
    "options": {}
}, CREDS["gmail"])

connect("Master Report Agent", "Format Sheet Output")
connect("Format Sheet Output", "Save Master Report")
connect("Format Sheet Output", "Update Status: Complete")
connect("Format Sheet Output", "Send Audit Email")

# ============================================================================
# BUILD WORKFLOW JSON
# ============================================================================

workflow = {
    "name": "🔍 Complete SEO Audit System v4.0 (Google Sheet Input)",
    "nodes": nodes,
    "connections": connections,
    "settings": {
        "executionOrder": "v1",
        "saveManualExecutions": True,
        "callerPolicy": "workflowsFromSameOwner",
        "errorWorkflow": "",
        "timezone": "America/New_York",
        "saveDataSuccessExecution": "all",
        "saveDataErrorExecution": "all",
    },
    "staticData": None,
}

# Save to file
with open("/home/user/MA-Vercel/seo_workflow_v4.json", "w") as f:
    json.dump(workflow, f, indent=2)

print(f"Workflow generated with {len(nodes)} nodes")
print(f"Connections: {len(connections)} source nodes")

# Push to n8n
headers = {
    "X-N8N-API-KEY": N8N_API_KEY,
    "Content-Type": "application/json"
}

# Create as new workflow
response = requests.post(
    f"{N8N_BASE}/api/v1/workflows",
    headers=headers,
    json=workflow,
    timeout=30
)

print(f"\nAPI Response: {response.status_code}")
if response.status_code in [200, 201]:
    result = response.json()
    print(f"Workflow created! ID: {result.get('id')}")
    print(f"Name: {result.get('name')}")
else:
    print(f"Error: {response.text[:500]}")
