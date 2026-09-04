/**
 * Code.gs
 * Receives recruitment form submissions, appends them to a Google Sheet,
 * and sends Comrade-branded HTML email notifications.
 *
 * The Contact page's "Join Waitlist" CTA does NOT use this script (or
 * any backend) -- it's a Gmail web-compose link opened in a new tab
 * (see app/email_links.py's gmail_compose_url() and
 * app/context_processors.py's WAITLIST_EMAIL_HREF). This file is
 * recruitment-only.
 */

const CONFIG = {
  RECRUITER_EMAIL: 'comradessafety@gmail.com',
  SHEET_NAME: 'Applications V2',
  SHEET_URL: 'https://docs.google.com/spreadsheets/d/170WO1XPcEEXkSPNKL3KclHRNCul_yrUyrmjwzd6PO-A/edit?usp=sharing',
  LOGO_FILE_ID: '1k4nlQjQHyHGO2o2G9B9Bhlv7NYk-NX7Z'
};

const SHEET_NAME = CONFIG.SHEET_NAME;

const HEADER_ROW = [
  "Timestamp",
  "Full Name",
  "Email",
  "Phone",
  "College",
  "Degree",
  "Analog Electronics",
  "Digital Electronics",
  "Microcontrollers",
  "PCB Experience",
  "Prototyping Experience",
  "Challenging Project",
  "LinkedIn Profile",
  "GitHub / Portfolio",
  "Weekly Availability",
  "Commitment Duration",
  "Working Mode",
  "Motivation for Comrade",
  "Unpaid Internship Acknowledged",
  "Confidentiality Acknowledged",
  "Privacy Acknowledged",
  "Status",
  "Reviewer Notes",
];

const STATUS_OPTIONS = [
  "New",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Selected",
  "Not Selected",
  "Waitlist",
];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const row = body && body.row;

    if (!Array.isArray(row) || row.length !== HEADER_ROW.length - 3) {
      return jsonResponse({ success: false, error: "Malformed submission." });
    }

    const sheet = getOrCreateSheet();
    const timestamp = new Date();
    
    // 1. Write to Sheet FIRST
    try {
      sheet.appendRow([timestamp, ...row, "New", ""]);
    } catch (sheetError) {
      console.error("Failed to append row to sheet:", sheetError);
      return jsonResponse({ success: false, error: "Could not process submission." });
    }

    // 2. Prepare Email Data
    const data = rowToObject(row);
    // Logo is handled via external URL in the HTML directly

    // 3. Send Recruiter Notification
    try {
      sendRecruiterEmail(data);
    } catch (emailError) {
      console.error("Failed to send recruiter email:", emailError);
    }

    // 4. Send Applicant Confirmation
    try {
      sendApplicantEmail(data);
    } catch (emailError) {
      console.error("Failed to send applicant email:", emailError);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Total failure in doPost:", error);
    return jsonResponse({ success: false, error: "Could not process submission." });
  }
}

// ============================================================================
// DATA & SECURITY HELPERS
// ============================================================================

function rowToObject(rowArray) {
  const data = {};
  for (let i = 0; i < rowArray.length; i++) {
    // HEADER_ROW index 0 is Timestamp, so mapping starts at 1
    data[HEADER_ROW[i + 1]] = rowArray[i];
  }
  return data;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function safeLink(url, text) {
  const str = String(url || '').trim();
  if (!str) return escapeHtml(text || '');
  if (/^https?:\/\//i.test(str)) {
    return `<a href="${escapeHtml(str)}" style="color: #970747; text-decoration: none; font-weight: 500;">${escapeHtml(text || str)}</a>`;
  }
  return escapeHtml(str);
}

// ============================================================================
// EMAIL DISPATCH & HTML TEMPLATES
// ============================================================================

function sendRecruiterEmail(data) {
  const applicantName = data["Full Name"] || "Applicant";
  const subject = `New Electronics & Hardware Internship Application · ${applicantName}`;
  const htmlBody = buildRecruiterHtml(data);
  const plainText = `New Comrade Electronics & Hardware Internship application.\n\nName: ${applicantName}\nEmail: ${data["Email"] || ""}\nCollege: ${data["College"] || ""}\n\nThe complete application has been added to the Google Sheet.`;
  
  const options = { name: "Comrade Recruitment", htmlBody: htmlBody };
  
  if (CONFIG.RECRUITER_EMAIL !== 'REPLACE_WITH_RECRUITER_EMAIL@example.com') {
    MailApp.sendEmail(CONFIG.RECRUITER_EMAIL, subject, plainText, options);
  }
}

function sendApplicantEmail(data) {
  const applicantEmail = data["Email"];
  if (!applicantEmail) return;
  
  const subject = "Application Received · Comrade Electronics & Hardware Internship";
  const htmlBody = buildApplicantHtml(data);
  const plainText = `Hi ${data["Full Name"] || ""},\n\nWe've received your application for the Comrade Electronics & Hardware Internship.\n\nWe're reviewing applications and will be in touch if your profile matches the current requirements.\n\nThank you,\nComrade`;
  
  const options = { name: "Comrade", htmlBody: htmlBody };
  
  MailApp.sendEmail(applicantEmail, subject, plainText, options);
}

function buildRecruiterHtml(data) {
  const name = escapeHtml(data["Full Name"]);
  const email = escapeHtml(data["Email"]);
  const college = escapeHtml(data["College"]);
  const background = escapeHtml(data["Degree"]);
  const availability = escapeHtml(data["Weekly Availability"]);

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <meta name="x-apple-disable-message-reformatting">
  <title>Internal Notification</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    
    :root { color-scheme: only light; }
    body, table, td, p, a, h1, h2, h3, span, img { color-scheme: only light; }
    .darkreader-ignore, img { filter: none !important; image-rendering: auto !important; forced-color-adjust: none !important; -webkit-filter: none !important; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    table { border-collapse: collapse; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #ffffff; }

    @media screen and (max-width: 600px) {
      .outer-td { padding: 0 !important; }
      .container { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; border-left: none !important; border-right: none !important; }
      .mob-pad { padding: 32px 24px 32px 24px !important; }
      
      .logo-img-td, .logo-text-td { display: block !important; text-align: center !important; width: 100% !important; box-sizing: border-box !important; }
      .logo-text-td { padding-top: 12px !important; text-align: center !important; }
      .logo-img { margin: 0 auto !important; }
      
      .h1-title { font-size: 24px !important; }
      .body-text { font-size: 15px !important; }
      .card { padding: 20px 16px !important; }
      
      .table-data { font-size: 14px !important; }
      .table-data td { padding-bottom: 10px !important; display: block !important; width: 100% !important; }
      .table-data td:first-child { padding-bottom: 4px !important; font-size: 12px !important; color: #970747 !important; text-transform: uppercase; letter-spacing: 0.5px; }
      
      .footer-pad { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; font-family: 'Plus Jakarta Sans', Helvetica, Arial, sans-serif; color: #221a18; line-height: 1.6;">
    <tr>
      <td align="center" class="outer-td" style="padding: 40px 20px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" class="container" align="center" style="width: 100%; max-width: 680px; margin: 0 auto; background-color: #f9eee2; border: 1px solid #e9dccb; border-radius: 12px; border-collapse: separate !important; overflow: hidden; box-shadow: 0 4px 24px rgba(94, 47, 32, 0.04);">
          <tr>
            <td class="mob-pad" style="padding: 32px 48px;">
              <!-- Professional Header -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border-bottom: 1px solid #e9dccb; padding-bottom: 16px;">
                <tr>
                  <td class="logo-img-td" valign="middle" align="left">
                    <img class="logo-img" src="https://lh3.googleusercontent.com/d/1GaKkypfyphEVWG0B7DMoP9wOVrnMzSf3" alt="Comrade Logo" style="display: block; border: 0; outline: none; width: 100%; max-width: 110px; height: auto;">
                  </td>
                  <td class="logo-text-td" valign="middle" align="right" style="font-size: 10px; font-weight: 700; color: #970747; letter-spacing: 1.5px; text-transform: uppercase; line-height: 1.6; text-align: right;">
                    COMRADE CAREERS<br>
                    <span style="color: #6f6460; font-weight: 600;">NEW APPLICATION<br>Electronics & Hardware Intern</span>
                  </td>
                </tr>
              </table>
              
              <div style="text-align: center; margin-bottom: 32px;">
                <span style="display: inline-block; background-color: #fdf6ee; border: 1px solid #e9dccb; color: #970747; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; padding: 6px 16px; border-radius: 20px; text-transform: uppercase;">Internal Notification</span>
              </div>
              <h1 class="h1-title" style="font-size: 28px; font-weight: 600; color: #221a18; margin: 0 0 8px 0; letter-spacing: -0.5px;">New Hardware Intern Application</h1>
              <p class="body-text" style="margin: 0 0 40px 0; font-size: 16px; color: #6f6460;">A new application has been submitted by <strong style="color: #221a18;">${name}</strong>.</p>
              
              <!-- Candidate Summary Card -->
              <div class="card" style="background-color: #ffffff; border: 1px solid #e9dccb; border-radius: 8px; padding: 24px; margin-bottom: 40px;">
                <h2 style="font-size: 11px; font-weight: 700; letter-spacing: 1.2px; color: #6f6460; margin: 0 0 20px 0; text-transform: uppercase;">Candidate Profile</h2>
                <table class="table-data" width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 15px; color: #221a18;">
                  <tr><td width="30%" style="color: #6f6460; padding-bottom: 12px; font-weight: 500;">Name</td><td style="padding-bottom: 12px; font-weight: 600;">${name}</td></tr>
                  <tr><td style="color: #6f6460; padding-bottom: 12px; font-weight: 500;">Email</td><td style="padding-bottom: 12px;"><a href="mailto:${email}" style="color: #970747; text-decoration: none;">${email}</a></td></tr>
                  <tr><td style="color: #6f6460; padding-bottom: 12px; font-weight: 500;">College</td><td style="padding-bottom: 12px;">${college}</td></tr>
                  <tr><td style="color: #6f6460; padding-bottom: 12px; font-weight: 500;">Degree</td><td style="padding-bottom: 12px;">${background}</td></tr>
                  <tr><td style="color: #6f6460; font-weight: 500;">Availability</td><td>${availability} (${escapeHtml(data["Commitment Duration"])})</td></tr>
                </table>
              </div>
    
              <!-- Technical Snapshot -->
              <h2 style="font-size: 11px; font-weight: 700; letter-spacing: 1.2px; color: #6f6460; margin: 0 0 20px 0; border-bottom: 1px solid #e9dccb; padding-bottom: 12px; text-transform: uppercase;">Technical Overview</h2>
              <table class="table-data" width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 15px; color: #221a18; margin-bottom: 40px;">
                <tr><td width="35%" style="color: #6f6460; padding-bottom: 12px; font-weight: 500;">Analog Comfort</td><td style="padding-bottom: 12px;">${escapeHtml(data["Analog Electronics"])}</td></tr>
                <tr><td style="color: #6f6460; padding-bottom: 12px; font-weight: 500;">Digital Comfort</td><td style="padding-bottom: 12px;">${escapeHtml(data["Digital Electronics"])}</td></tr>
                <tr><td style="color: #6f6460; padding-bottom: 12px; font-weight: 500;">Microcontrollers</td><td style="padding-bottom: 12px; font-weight: 600;">${escapeHtml(data["Microcontrollers"])}</td></tr>
                <tr><td style="color: #6f6460; padding-bottom: 12px; font-weight: 500;">PCB Experience</td><td style="padding-bottom: 12px;">${escapeHtml(data["PCB Experience"])}</td></tr>
                <tr><td style="color: #6f6460; padding-bottom: 12px; font-weight: 500;">Prototyping</td><td style="padding-bottom: 12px;">${escapeHtml(data["Prototyping Experience"])}</td></tr>
              </table>
    
              <!-- Project Experience -->
              <h2 style="font-size: 11px; font-weight: 700; letter-spacing: 1.2px; color: #6f6460; margin: 0 0 20px 0; border-bottom: 1px solid #e9dccb; padding-bottom: 12px; text-transform: uppercase;">Projects & Links</h2>
              <div class="body-text" style="font-size: 15px; margin-bottom: 40px; color: #221a18; word-break: break-word; overflow-wrap: anywhere;">
                <p style="color: #970747; margin: 0 0 8px 0; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Most Challenging Project</p>
                <p style="margin: 0 0 24px 0; line-height: 1.7;">${escapeHtml(data["Challenging Project"])}</p>
                
                <div class="card" style="background-color: #ffffff; padding: 16px; border-radius: 6px; border: 1px solid #e9dccb;">
                  <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #6f6460; text-transform: uppercase; letter-spacing: 1px;">Links</p>
                  <p style="margin: 0; line-height: 1.8;">
                    <strong style="color: #221a18;">LinkedIn:</strong> ${safeLink(data["LinkedIn Profile"])}<br>
                    <strong style="color: #221a18;">GitHub/Portfolio:</strong> ${safeLink(data["GitHub / Portfolio"])}
                  </p>
                </div>
              </div>
    
              <!-- Motivation -->
              <h2 style="font-size: 11px; font-weight: 700; letter-spacing: 1.2px; color: #6f6460; margin: 0 0 20px 0; border-bottom: 1px solid #e9dccb; padding-bottom: 12px; text-transform: uppercase;">Motivation</h2>
              <div class="body-text" style="font-size: 15px; margin-bottom: 48px; color: #221a18; word-break: break-word; overflow-wrap: anywhere; line-height: 1.7;">
                <p style="margin: 0;">${escapeHtml(data["Motivation for Comrade"])}</p>
              </div>
    
              <div style="text-align: center; margin-top: 10px; margin-bottom: 10px;">
                <a href="${escapeHtml(CONFIG.SHEET_URL)}" style="display: inline-block; background-color: #970747; color: #ffffff; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; letter-spacing: 0.5px;">View Full Sheet</a>
              </div>
            </td>
          </tr>
          <tr>
            <td class="footer-pad" style="background-color: #ffffff; padding: 24px 48px; border-top: 1px solid #e9dccb; font-size: 12px; color: #6f6460; text-align: center;">
              <p style="margin: 0; font-weight: 500;">Comrade &middot; Product Development Team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildApplicantHtml(data) {
  const name = escapeHtml(data["Full Name"]);
  
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <meta name="x-apple-disable-message-reformatting">
  <title>Application Received</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    
    :root { color-scheme: only light; }
    body, table, td, p, a, h1, h2, h3, span, img { color-scheme: only light; }
    .darkreader-ignore, img { filter: none !important; image-rendering: auto !important; forced-color-adjust: none !important; -webkit-filter: none !important; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    table { border-collapse: collapse; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #ffffff; }

    @media screen and (max-width: 600px) {
      .outer-td { padding: 0 !important; }
      .container { width: 100% !important; max-width: 100% !important; border-radius: 0 !important; border-left: none !important; border-right: none !important; }
      .mob-pad { padding: 32px 24px 32px 24px !important; }
      
      .logo-img-td, .logo-text-td { display: block !important; text-align: center !important; width: 100% !important; box-sizing: border-box !important; }
      .logo-text-td { padding-top: 12px !important; text-align: center !important; }
      .logo-img { margin: 0 auto !important; }
      
      .h1-title { font-size: 22px !important; }
      .body-text { font-size: 15px !important; }
      .card { padding: 20px 16px !important; }
      .footer-pad { padding: 24px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; font-family: 'Plus Jakarta Sans', Helvetica, Arial, sans-serif; color: #221a18; line-height: 1.6;">
    <tr>
      <td align="center" class="outer-td" style="padding: 60px 20px;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" class="container" align="center" style="width:100%; max-width: 600px; margin: 0 auto; background-color: #f9eee2; border: 1px solid #e9dccb; border-radius: 12px; border-collapse: separate !important; overflow: hidden; box-shadow: 0 4px 24px rgba(94, 47, 32, 0.04);">
          <tr>
            <td class="mob-pad" style="padding: 32px 48px 32px 48px;">
              
              <!-- Professional Header -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border-bottom: 1px solid #e9dccb; padding-bottom: 16px;">
                <tr>
                  <td class="logo-img-td" valign="middle" align="left">
                    <img class="logo-img" src="https://lh3.googleusercontent.com/d/1GaKkypfyphEVWG0B7DMoP9wOVrnMzSf3" alt="Comrade Logo" style="display: block; border: 0; outline: none; width: 100%; max-width: 110px; height: auto;">
                  </td>
                  <td class="logo-text-td" valign="middle" align="right" style="font-size: 10px; font-weight: 700; color: #970747; letter-spacing: 1.5px; text-transform: uppercase; line-height: 1.6; text-align: right;">
                    COMRADE CAREERS<br>
                    <span style="color: #6f6460; font-weight: 600;">Electronics & Hardware Intern</span>
                  </td>
                </tr>
              </table>
              
              <div style="text-align: center; margin-bottom: 32px;">
                <span style="display: inline-block; background-color: #fdf6ee; border: 1px solid #e9dccb; color: #970747; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; padding: 6px 16px; border-radius: 20px; text-transform: uppercase;">Application Received</span>
              </div>
              
              <h1 class="h1-title" style="font-size: 24px; font-weight: 600; color: #221a18; margin: 0 0 24px 0; letter-spacing: -0.5px;">Hi ${name},</h1>
              
              <p class="body-text" style="margin: 0 0 20px 0; font-size: 16px; color: #4a423e;">Thank you for your interest in joining Comrade's Electronics & Hardware Internship. We have successfully received your application.</p>
              
              <p class="body-text" style="margin: 0 0 40px 0; font-size: 16px; color: #4a423e;">We are currently reviewing a select number of applications for this highly specialized role. If your technical background and experience align with our immediate prototype development needs, our product team will be in touch shortly.</p>
              
              <!-- Role Summary Card -->
              <div class="card" style="background-color: #ffffff; border: 1px solid #e9dccb; border-radius: 8px; padding: 24px; margin-bottom: 40px;">
                <h2 style="font-size: 11px; font-weight: 700; letter-spacing: 1.2px; color: #6f6460; margin: 0 0 16px 0; text-transform: uppercase;">Role Summary</h2>
                <p style="margin: 0 0 8px 0; font-weight: 600; font-size: 18px; color: #221a18;">Electronics & Hardware Intern</p>
                <p class="body-text" style="margin: 0; color: #6f6460; font-size: 14px; font-weight: 500;">Hardware &middot; Embedded Systems &middot; Prototyping &middot; Testing</p>
              </div>
    
              <!-- Next Steps -->
              <h2 style="font-size: 11px; font-weight: 700; letter-spacing: 1.2px; color: #6f6460; margin: 0 0 16px 0; text-transform: uppercase;">What Happens Next</h2>
              <ol class="body-text" style="margin: 0 0 40px 0; padding-left: 20px; font-size: 15px; color: #4a423e;">
                <li style="margin-bottom: 12px;">Your application will be evaluated directly by our core engineering team.</li>
                <li style="margin-bottom: 12px;">Selected candidates will be invited for a technical interview focused on past projects.</li>
                <li>We may request further documentation or portfolio materials if needed.</li>
              </ol>
              
              <p class="body-text" style="margin: 0; font-size: 16px; font-weight: 600; color: #221a18;">&mdash; The Comrade Team</p>
            </td>
          </tr>
          <tr>
            <td class="footer-pad" style="background-color: #ffffff; padding: 32px 48px; border-top: 1px solid #e9dccb; font-size: 12px; color: #6f6460; text-align: center; line-height: 1.6;">
              <p style="margin: 0 0 12px 0;"><em>Your application information is strictly confidential and used only for evaluation purposes.</em></p>
              <p style="margin: 0 0 12px 0;"><strong style="color: #221a18;">Comrade</strong> &middot; Personal safety, reimagined for the way you actually live.</p>
              <p style="margin: 0;">&copy; 2026 Comrade</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================================================
// SPREADSHEET HELPERS
// ============================================================================

function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADER_ROW);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
