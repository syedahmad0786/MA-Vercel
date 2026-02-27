// ============================================================
//  SEO AUDIT DASHBOARD — Google Apps Script
//  Adds custom menu, new-client form, audit trigger, and
//  report formatting to the Google Sheet.
// ============================================================

var CONFIG = {
  WEBHOOK_URL: '', // Will be set by setup
  SHEET_ID: SpreadsheetApp.getActiveSpreadsheet().getId(),
  QUEUE_TAB: 'Audit Queue',
  REPORTS_TAB: 'Audit Reports',
  DASHBOARD_TAB: 'Dashboard',
  REPORT_VIEW_TAB: 'Report View'
};

// ============================================================
//  1. CUSTOM MENU
// ============================================================
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('SEO Audit')
    .addItem('Add New Client', 'showNewClientForm')
    .addItem('Run Audit Now', 'triggerAudit')
    .addSeparator()
    .addItem('Refresh Dashboard', 'refreshDashboard')
    .addItem('View Latest Report', 'viewLatestReport')
    .addSeparator()
    .addItem('Setup Webhook URL', 'setupWebhook')
    .addToUi();
}

// ============================================================
//  2. SETUP — Store webhook URL
// ============================================================
function setupWebhook() {
  var ui = SpreadsheetApp.getUi();
  var props = PropertiesService.getScriptProperties();
  var current = props.getProperty('WEBHOOK_URL') || '(not set)';

  var result = ui.prompt(
    'Setup Webhook URL',
    'Enter your n8n webhook URL for triggering audits.\n\nCurrent: ' + current,
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() === ui.Button.OK) {
    var url = result.getResponseText().trim();
    if (url) {
      props.setProperty('WEBHOOK_URL', url);
      ui.alert('Webhook URL saved successfully!');
    }
  }
}

function getWebhookUrl() {
  return PropertiesService.getScriptProperties().getProperty('WEBHOOK_URL') || '';
}

// ============================================================
//  3. NEW CLIENT FORM (Sidebar)
// ============================================================
function showNewClientForm() {
  var html = HtmlService.createHtmlOutput(getFormHtml())
    .setTitle('Add New Client')
    .setWidth(400);
  SpreadsheetApp.getUi().showSidebar(html);
}

function getFormHtml() {
  return `
  <style>
    * { box-sizing: border-box; font-family: 'Google Sans', Arial, sans-serif; }
    body { padding: 16px; background: #f8f9fa; margin: 0; }
    h2 { color: #1a73e8; margin: 0 0 16px 0; font-size: 18px; }
    .form-group { margin-bottom: 14px; }
    label { display: block; font-size: 12px; font-weight: 500; color: #5f6368;
            margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    input, textarea, select {
      width: 100%; padding: 10px 12px; border: 1px solid #dadce0;
      border-radius: 8px; font-size: 14px; outline: none;
      transition: border-color 0.2s;
    }
    input:focus, textarea:focus { border-color: #1a73e8; box-shadow: 0 0 0 2px rgba(26,115,232,0.1); }
    textarea { resize: vertical; min-height: 60px; }
    .btn {
      width: 100%; padding: 12px; border: none; border-radius: 8px;
      font-size: 14px; font-weight: 600; cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary { background: #1a73e8; color: white; }
    .btn-primary:hover { background: #1557b0; }
    .btn-secondary { background: white; color: #1a73e8; border: 1px solid #1a73e8; margin-top: 8px; }
    .btn-secondary:hover { background: #e8f0fe; }
    .divider { border-top: 1px solid #e0e0e0; margin: 16px 0; }
    .success { background: #e6f4ea; color: #137333; padding: 12px; border-radius: 8px;
               margin-top: 12px; display: none; text-align: center; font-weight: 500; }
    .section-title { font-size: 11px; color: #80868b; text-transform: uppercase;
                     letter-spacing: 1px; margin: 16px 0 8px 0; }
  </style>

  <h2>New SEO Audit Client</h2>

  <div class="form-group">
    <label>Client Name *</label>
    <input type="text" id="clientName" placeholder="e.g. Acme Corp">
  </div>

  <div class="form-group">
    <label>Website URL *</label>
    <input type="url" id="websiteUrl" placeholder="https://www.example.com">
  </div>

  <div class="section-title">Competitors</div>

  <div class="form-group">
    <label>Competitor 1</label>
    <input type="url" id="comp1" placeholder="https://competitor1.com">
  </div>
  <div class="form-group">
    <label>Competitor 2</label>
    <input type="url" id="comp2" placeholder="https://competitor2.com">
  </div>

  <div class="divider"></div>

  <div class="form-group">
    <label>GSC Property</label>
    <input type="text" id="gscProperty" placeholder="https://www.example.com/">
  </div>

  <div class="form-group">
    <label>Target Location</label>
    <input type="text" id="location" placeholder="United States" value="United States">
  </div>

  <div class="form-group">
    <label>Goals</label>
    <textarea id="goals" placeholder="Increase organic traffic, improve rankings..."></textarea>
  </div>

  <div class="form-group">
    <label>Email (for report delivery)</label>
    <input type="email" id="email" placeholder="client@example.com">
  </div>

  <div class="divider"></div>

  <button class="btn btn-primary" onclick="submitForm()">Add Client & Queue Audit</button>
  <button class="btn btn-secondary" onclick="submitAndRun()">Add & Run Audit Now</button>

  <div class="success" id="successMsg">Client added successfully!</div>

  <script>
    function submitForm() { addClient(false); }
    function submitAndRun() { addClient(true); }

    function addClient(runNow) {
      var data = {
        clientName: document.getElementById('clientName').value,
        websiteUrl: document.getElementById('websiteUrl').value,
        comp1: document.getElementById('comp1').value,
        comp2: document.getElementById('comp2').value,
        gscProperty: document.getElementById('gscProperty').value,
        location: document.getElementById('location').value,
        goals: document.getElementById('goals').value,
        email: document.getElementById('email').value,
        runNow: runNow
      };

      if (!data.clientName || !data.websiteUrl) {
        alert('Client Name and Website URL are required.');
        return;
      }

      google.script.run
        .withSuccessHandler(function() {
          var msg = document.getElementById('successMsg');
          msg.style.display = 'block';
          msg.textContent = runNow ? 'Client added & audit triggered!' : 'Client added to queue!';
          // Reset form
          document.getElementById('clientName').value = '';
          document.getElementById('websiteUrl').value = '';
          document.getElementById('comp1').value = '';
          document.getElementById('comp2').value = '';
          document.getElementById('gscProperty').value = '';
          document.getElementById('goals').value = '';
          document.getElementById('email').value = '';
          setTimeout(function() { msg.style.display = 'none'; }, 3000);
        })
        .withFailureHandler(function(err) {
          alert('Error: ' + err.message);
        })
        .addNewClient(data);
    }
  </script>
  `;
}

function addNewClient(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var queue = ss.getSheetByName(CONFIG.QUEUE_TAB);

  // Find next empty row
  var lastRow = queue.getLastRow();
  var newRow = lastRow + 1;

  // Add the new client row
  queue.getRange(newRow, 1, 1, 12).setValues([[
    data.clientName,
    data.websiteUrl,
    data.comp1 || '',
    data.comp2 || '',
    '',                    // Competitor 3
    '',                    // GA4 Property ID
    data.gscProperty || data.websiteUrl + '/',
    data.location || 'United States',
    data.goals || '',
    data.email || '',
    'Pending',
    ''                     // CompletedDate
  ]]);

  // Apply formatting to new row
  formatQueueRow(queue, newRow);

  // Trigger audit if requested
  if (data.runNow) {
    triggerAuditInternal();
  }

  // Refresh dashboard
  refreshDashboard();
}

// ============================================================
//  4. TRIGGER AUDIT
// ============================================================
function triggerAudit() {
  var ui = SpreadsheetApp.getUi();
  var webhookUrl = getWebhookUrl();

  if (!webhookUrl) {
    ui.alert('No webhook URL configured.\n\nGo to SEO Audit > Setup Webhook URL first.');
    return;
  }

  // Check if there are pending audits
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var queue = ss.getSheetByName(CONFIG.QUEUE_TAB);
  var data = queue.getDataRange().getValues();
  var pendingCount = 0;
  for (var i = 1; i < data.length; i++) {
    if (data[i][10] === 'Pending') pendingCount++;
  }

  if (pendingCount === 0) {
    ui.alert('No pending audits found.\n\nAdd a new client first, or set a client status to "Pending".');
    return;
  }

  var result = ui.alert(
    'Run SEO Audit',
    'Found ' + pendingCount + ' pending audit(s).\n\nThis will trigger the full SEO analysis pipeline. It takes about 5 minutes per audit.\n\nProceed?',
    ui.ButtonSet.YES_NO
  );

  if (result === ui.Button.YES) {
    triggerAuditInternal();
    ui.alert('Audit triggered successfully!\n\nThe workflow is now running. Check back in 5 minutes for results.\n\nUse "Refresh Dashboard" to see updates.');
  }
}

function triggerAuditInternal() {
  var webhookUrl = getWebhookUrl();
  if (!webhookUrl) return;

  try {
    var response = UrlFetchApp.fetch(webhookUrl, {
      method: 'get',
      muteHttpExceptions: true,
      headers: { 'Content-Type': 'application/json' }
    });
    Logger.log('Audit triggered: ' + response.getContentText());
  } catch (e) {
    Logger.log('Trigger error: ' + e.message);
  }
}

// ============================================================
//  5. DASHBOARD TAB
// ============================================================
function refreshDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashboard = ss.getSheetByName(CONFIG.DASHBOARD_TAB);

  if (!dashboard) {
    dashboard = ss.insertSheet(CONFIG.DASHBOARD_TAB, 0);
  }

  // Clear existing content
  dashboard.clear();
  dashboard.clearFormats();

  var queue = ss.getSheetByName(CONFIG.QUEUE_TAB);
  var reports = ss.getSheetByName(CONFIG.REPORTS_TAB);
  var queueData = queue.getDataRange().getValues();
  var reportsData = reports ? reports.getDataRange().getValues() : [];

  // Calculate metrics
  var totalClients = queueData.length - 1;
  var pending = 0, inProgress = 0, completed = 0;
  var latestDate = '';
  for (var i = 1; i < queueData.length; i++) {
    var status = queueData[i][10];
    if (status === 'Pending') pending++;
    else if (status === 'In Progress') inProgress++;
    else if (status === 'Complete') {
      completed++;
      if (queueData[i][11]) latestDate = queueData[i][11];
    }
  }

  // Set column widths
  dashboard.setColumnWidth(1, 40);   // Spacer
  dashboard.setColumnWidth(2, 200);
  dashboard.setColumnWidth(3, 200);
  dashboard.setColumnWidth(4, 200);
  dashboard.setColumnWidth(5, 200);
  dashboard.setColumnWidth(6, 200);
  dashboard.setColumnWidth(7, 200);

  // ---- HEADER ----
  var r = 1;
  dashboard.getRange(r, 2, 1, 6).merge()
    .setValue('SEO AUDIT DASHBOARD')
    .setFontSize(22).setFontWeight('bold').setFontColor('#1a73e8')
    .setHorizontalAlignment('left').setVerticalAlignment('middle');
  dashboard.setRowHeight(r, 50);
  r++;

  dashboard.getRange(r, 2, 1, 6).merge()
    .setValue('Real-time overview of all SEO audits')
    .setFontSize(11).setFontColor('#80868b')
    .setHorizontalAlignment('left');
  r += 2;

  // ---- METRIC CARDS ----
  var cards = [
    { label: 'TOTAL CLIENTS', value: totalClients, color: '#1a73e8', bg: '#e8f0fe' },
    { label: 'PENDING', value: pending, color: '#ea8600', bg: '#fef7e0' },
    { label: 'IN PROGRESS', value: inProgress, color: '#9334e6', bg: '#f3e8fd' },
    { label: 'COMPLETED', value: completed, color: '#137333', bg: '#e6f4ea' },
    { label: 'LAST AUDIT', value: latestDate || 'N/A', color: '#5f6368', bg: '#f1f3f4' }
  ];

  for (var c = 0; c < cards.length; c++) {
    var col = c + 2;
    // Card value
    dashboard.getRange(r, col)
      .setValue(cards[c].value)
      .setFontSize(28).setFontWeight('bold').setFontColor(cards[c].color)
      .setBackground(cards[c].bg)
      .setHorizontalAlignment('center').setVerticalAlignment('middle')
      .setBorder(true, true, true, true, false, false, '#dadce0', SpreadsheetApp.BorderStyle.SOLID);
    dashboard.setRowHeight(r, 60);

    // Card label
    dashboard.getRange(r + 1, col)
      .setValue(cards[c].label)
      .setFontSize(9).setFontWeight('bold').setFontColor('#80868b')
      .setBackground(cards[c].bg)
      .setHorizontalAlignment('center').setVerticalAlignment('top')
      .setBorder(false, true, true, true, false, false, '#dadce0', SpreadsheetApp.BorderStyle.SOLID);
  }
  dashboard.setRowHeight(r + 1, 30);
  r += 3;

  // ---- AUDIT QUEUE TABLE ----
  dashboard.getRange(r, 2, 1, 6).merge()
    .setValue('AUDIT QUEUE')
    .setFontSize(14).setFontWeight('bold').setFontColor('#202124');
  r++;

  // Table headers
  var tableHeaders = ['Client Name', 'Website', 'Competitors', 'Location', 'Status', 'Completed'];
  for (var h = 0; h < tableHeaders.length; h++) {
    dashboard.getRange(r, h + 2)
      .setValue(tableHeaders[h])
      .setFontSize(10).setFontWeight('bold').setFontColor('white')
      .setBackground('#1a73e8')
      .setHorizontalAlignment('center');
  }
  r++;

  // Table rows
  for (var i = 1; i < queueData.length; i++) {
    var rowColor = i % 2 === 0 ? '#f8f9fa' : 'white';
    var statusVal = queueData[i][10] || '';
    var statusColor = statusVal === 'Complete' ? '#137333' :
                      statusVal === 'In Progress' ? '#9334e6' :
                      statusVal === 'Pending' ? '#ea8600' : '#5f6368';
    var statusBg = statusVal === 'Complete' ? '#e6f4ea' :
                   statusVal === 'In Progress' ? '#f3e8fd' :
                   statusVal === 'Pending' ? '#fef7e0' : '#f1f3f4';

    var competitors = [queueData[i][2], queueData[i][3]].filter(function(x) { return x; }).join(', ');
    var rowData = [
      queueData[i][0],  // Client Name
      queueData[i][1],  // Website
      competitors,       // Competitors
      queueData[i][7],  // Location
      statusVal,         // Status
      queueData[i][11] || ''  // Completed Date
    ];

    for (var j = 0; j < rowData.length; j++) {
      var cell = dashboard.getRange(r, j + 2);
      cell.setValue(rowData[j]).setFontSize(11).setBackground(rowColor);

      if (j === 4) { // Status column
        cell.setFontWeight('bold').setFontColor(statusColor).setBackground(statusBg)
          .setHorizontalAlignment('center');
      }
      if (j === 1) { // URL column
        cell.setFontColor('#1a73e8');
      }
    }
    r++;
  }
  r += 2;

  // ---- RECENT REPORTS ----
  if (reportsData.length > 1) {
    dashboard.getRange(r, 2, 1, 6).merge()
      .setValue('COMPLETED REPORTS')
      .setFontSize(14).setFontWeight('bold').setFontColor('#202124');
    r++;

    var reportHeaders = ['Audit ID', 'Client', 'Website', 'Date', 'Report Preview', 'Status'];
    for (var h = 0; h < reportHeaders.length; h++) {
      dashboard.getRange(r, h + 2)
        .setValue(reportHeaders[h])
        .setFontSize(10).setFontWeight('bold').setFontColor('white')
        .setBackground('#137333');
    }
    r++;

    // Show unique reports (deduplicate by AuditID + Client)
    var seen = {};
    for (var i = 1; i < reportsData.length; i++) {
      var key = reportsData[i][0] + '_' + reportsData[i][1];
      if (seen[key]) continue;
      seen[key] = true;

      var report = reportsData[i][7] || '';
      // Extract health score from report
      var scoreMatch = report.match(/(\d+)\/100/);
      var score = scoreMatch ? scoreMatch[1] + '/100' : 'N/A';
      var preview = report.substring(0, 80).replace(/[#*\n]/g, ' ').trim() + '...';

      var rowData = [
        reportsData[i][0],  // AuditID
        reportsData[i][1],  // Client
        reportsData[i][2],  // Website
        reportsData[i][3],  // Date
        'Health: ' + score + ' | ' + preview,
        reportsData[i][8]   // Status
      ];

      var rowBg = (r % 2 === 0) ? '#f8f9fa' : 'white';
      for (var j = 0; j < rowData.length; j++) {
        dashboard.getRange(r, j + 2)
          .setValue(rowData[j]).setFontSize(11).setBackground(rowBg);
      }
      r++;
    }
  }

  // Protect dashboard (informational only)
  dashboard.getRange(1, 1).activate();
  SpreadsheetApp.flush();
}

// ============================================================
//  6. VIEW REPORT
// ============================================================
function viewLatestReport() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var reports = ss.getSheetByName(CONFIG.REPORTS_TAB);

  if (!reports || reports.getLastRow() < 2) {
    SpreadsheetApp.getUi().alert('No reports found yet.\n\nRun an audit first.');
    return;
  }

  var reportsData = reports.getDataRange().getValues();

  // Find the latest unique report
  var latestReport = null;
  var seen = {};
  for (var i = reportsData.length - 1; i >= 1; i--) {
    var fullReport = reportsData[i][7];
    if (fullReport && fullReport.length > 100 && !fullReport.includes('"error"')) {
      var key = reportsData[i][1]; // Client name
      if (!seen[key]) {
        latestReport = {
          auditId: reportsData[i][0],
          client: reportsData[i][1],
          website: reportsData[i][2],
          date: reportsData[i][3],
          competitors: reportsData[i][4],
          location: reportsData[i][5],
          goals: reportsData[i][6],
          report: reportsData[i][7],
          status: reportsData[i][8]
        };
        break;
      }
    }
  }

  if (!latestReport) {
    SpreadsheetApp.getUi().alert('No valid reports found. Reports may still contain errors from test runs.');
    return;
  }

  renderReport(latestReport);
}

function renderReport(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var view = ss.getSheetByName(CONFIG.REPORT_VIEW_TAB);

  if (!view) {
    view = ss.insertSheet(CONFIG.REPORT_VIEW_TAB);
  }

  view.clear();
  view.clearFormats();

  // Set widths
  view.setColumnWidth(1, 40);
  view.setColumnWidth(2, 250);
  view.setColumnWidth(3, 700);

  var r = 1;

  // ---- HEADER ----
  view.getRange(r, 2, 1, 2).merge()
    .setValue('SEO AUDIT REPORT')
    .setFontSize(20).setFontWeight('bold').setFontColor('#1a73e8')
    .setBackground('#e8f0fe');
  view.setRowHeight(r, 45);
  r++;

  // ---- CLIENT INFO ----
  var infoItems = [
    ['Client', data.client],
    ['Website', data.website],
    ['Audit Date', data.date],
    ['Competitors', data.competitors],
    ['Location', data.location],
    ['Goals', data.goals]
  ];

  for (var i = 0; i < infoItems.length; i++) {
    view.getRange(r, 2).setValue(infoItems[i][0])
      .setFontSize(10).setFontWeight('bold').setFontColor('#5f6368')
      .setBackground('#f8f9fa');
    view.getRange(r, 3).setValue(infoItems[i][1])
      .setFontSize(11).setFontColor('#202124')
      .setBackground('#f8f9fa');
    r++;
  }
  r++;

  // ---- PARSE REPORT INTO SECTIONS ----
  var reportText = data.report || '';
  var sections = parseReport(reportText);

  for (var s = 0; s < sections.length; s++) {
    var section = sections[s];

    // Section header
    view.getRange(r, 2, 1, 2).merge()
      .setValue(section.title)
      .setFontSize(14).setFontWeight('bold').setFontColor('white')
      .setBackground(getSectionColor(s))
      .setHorizontalAlignment('left');
    view.setRowHeight(r, 35);
    r++;

    // Section content — split by lines
    var lines = section.content.split('\n');
    for (var l = 0; l < lines.length; l++) {
      var line = lines[l].trim();
      if (!line) continue;

      var isBullet = line.startsWith('- ') || line.startsWith('* ');
      var isNumbered = /^\d+\./.test(line);
      var isTableRow = line.startsWith('|');
      var isBold = line.startsWith('**') || line.startsWith('- **');

      if (isTableRow) {
        // Parse table row
        var cells = line.split('|').filter(function(c) { return c.trim(); });
        if (cells.length >= 2) {
          view.getRange(r, 2).setValue(cells[0].trim())
            .setFontSize(10).setFontWeight('bold').setBackground('#f1f3f4');
          view.getRange(r, 3).setValue(cells.slice(1).join(' | ').trim())
            .setFontSize(10).setBackground('#f1f3f4');
        }
      } else if (isBold) {
        var cleanLine = line.replace(/\*\*/g, '').replace(/^[-*]\s*/, '');
        var parts = cleanLine.split(':');
        if (parts.length >= 2) {
          view.getRange(r, 2).setValue(parts[0].trim())
            .setFontSize(10).setFontWeight('bold').setFontColor('#202124');
          view.getRange(r, 3).setValue(parts.slice(1).join(':').trim())
            .setFontSize(10).setFontColor('#5f6368');
        } else {
          view.getRange(r, 2, 1, 2).merge().setValue(cleanLine)
            .setFontSize(10).setFontWeight('bold');
        }
      } else if (isBullet || isNumbered) {
        var cleanLine = line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '');
        var prefix = isNumbered ? line.match(/^\d+/)[0] + '.' : '';
        view.getRange(r, 2).setValue(prefix).setFontSize(10)
          .setFontColor('#1a73e8').setHorizontalAlignment('right');
        view.getRange(r, 3).setValue(cleanLine).setFontSize(10);
      } else if (line.startsWith('#')) {
        // Sub-heading
        var heading = line.replace(/^#+\s*/, '');
        view.getRange(r, 2, 1, 2).merge().setValue(heading)
          .setFontSize(12).setFontWeight('bold').setFontColor('#202124');
      } else {
        view.getRange(r, 2, 1, 2).merge().setValue(line)
          .setFontSize(10).setFontColor('#3c4043').setWrap(true);
      }
      r++;
    }
    r++; // Spacer between sections
  }

  // Activate the Report View tab
  view.activate();
  view.getRange(1, 1).activate();
}

function parseReport(text) {
  var sections = [];
  var currentSection = null;

  var lines = text.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    // Detect section headers (## or --- followed by header)
    if (line.match(/^#{1,3}\s+(.+)/)) {
      var title = line.replace(/^#+\s*/, '').trim();
      // Skip the top-level title (report name)
      if (currentSection || title.toUpperCase().includes('EXECUTIVE') ||
          title.toUpperCase().includes('SECTION') ||
          title.toUpperCase().includes('PRIORITY') ||
          title.toUpperCase().includes('ROADMAP') ||
          title.toUpperCase().includes('TECHNICAL') ||
          title.toUpperCase().includes('KEYWORD') ||
          title.toUpperCase().includes('BACKLINK') ||
          title.toUpperCase().includes('COMPETITOR')) {
        if (currentSection) sections.push(currentSection);
        currentSection = { title: title, content: '' };
      }
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }
  if (currentSection) sections.push(currentSection);

  // If no sections found, create one big section
  if (sections.length === 0) {
    sections.push({ title: 'Full Report', content: text });
  }

  return sections;
}

function getSectionColor(index) {
  var colors = ['#1a73e8', '#137333', '#ea8600', '#9334e6', '#c5221f', '#1a73e8'];
  return colors[index % colors.length];
}

// ============================================================
//  7. FORMAT AUDIT QUEUE
// ============================================================
function formatQueueRow(sheet, row) {
  // Apply conditional formatting for status
  var statusCell = sheet.getRange(row, 11); // Column K = Status
  var status = statusCell.getValue();

  if (status === 'Pending') {
    statusCell.setBackground('#fef7e0').setFontColor('#ea8600').setFontWeight('bold');
  } else if (status === 'In Progress') {
    statusCell.setBackground('#f3e8fd').setFontColor('#9334e6').setFontWeight('bold');
  } else if (status === 'Complete') {
    statusCell.setBackground('#e6f4ea').setFontColor('#137333').setFontWeight('bold');
  }
}

function formatAllQueueRows() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var queue = ss.getSheetByName(CONFIG.QUEUE_TAB);
  var lastRow = queue.getLastRow();

  // Format header row
  var headerRange = queue.getRange(1, 1, 1, 12);
  headerRange.setFontSize(11).setFontWeight('bold').setFontColor('white')
    .setBackground('#1a73e8').setHorizontalAlignment('center');
  queue.setFrozenRows(1);

  // Format each data row
  for (var r = 2; r <= lastRow; r++) {
    formatQueueRow(queue, r);
  }

  // Auto-resize columns
  for (var c = 1; c <= 12; c++) {
    queue.autoResizeColumn(c);
  }

  // Add data validation for Status column
  var statusRange = queue.getRange(2, 11, lastRow - 1, 1);
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pending', 'In Progress', 'Complete'], true)
    .setAllowInvalid(false)
    .build();
  statusRange.setDataValidation(rule);
}

// ============================================================
//  8. INITIAL SETUP — Run once to set up everything
// ============================================================
function initialSetup() {
  formatAllQueueRows();
  refreshDashboard();
  SpreadsheetApp.getUi().alert(
    'Setup Complete!\n\n' +
    '1. Go to SEO Audit > Setup Webhook URL to configure your n8n trigger\n' +
    '2. Use SEO Audit > Add New Client to add clients\n' +
    '3. Use SEO Audit > Run Audit Now to trigger audits\n' +
    '4. Use SEO Audit > View Latest Report to see formatted results'
  );
}
