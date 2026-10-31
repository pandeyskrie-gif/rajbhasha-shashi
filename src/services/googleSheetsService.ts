import { getGoogleAccessToken, signInWithGoogle } from './googleAuth';
import { QuarterlyReport, Officer } from '../types';

export interface DriveSpreadsheetFile {
  id: string;
  name: string;
  webViewLink: string;
  modifiedTime: string;
}

export interface GoogleSheetsExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

/**
 * Ensures we have an active access token, or prompts the user to sign in
 */
async function ensureAccessToken(): Promise<string> {
  const token = getGoogleAccessToken();
  if (token) return token;

  // Prompt user to connect with Google
  const authRes = await signInWithGoogle();
  if (!authRes?.accessToken) {
    throw new Error('गूगल शीट्स एक्सेस के लिए कृपया गूगल खाते से लॉगिन करें।');
  }
  return authRes.accessToken;
}

/**
 * List recent spreadsheets from the user's Google Drive
 */
export async function listUserSpreadsheets(): Promise<DriveSpreadsheetFile[]> {
  const token = await ensureAccessToken();
  const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=modifiedTime%20desc&pageSize=25&fields=files(id,name,webViewLink,modifiedTime)`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`गूगल ड्राइव से स्प्रेडशीट सूची प्राप्त करने में त्रुटि: ${errorText}`);
  }

  const data = await response.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    webViewLink: f.webViewLink || `https://docs.google.com/spreadsheets/d/${f.id}/edit`,
    modifiedTime: f.modifiedTime,
  }));
}

/**
 * Read values from a specific Google Spreadsheet range
 */
export async function readSpreadsheetValues(spreadsheetId: string, range: string): Promise<any[][]> {
  const token = await ensureAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`गूगल शीट्स से डेटा पढ़ने में त्रुटि: ${err}`);
  }

  const data = await response.json();
  return data.values || [];
}

/**
 * Creates a new Google Spreadsheet with tabs, custom styling, and data rows
 */
export async function createGoogleSpreadsheetWithTabs(
  title: string,
  sheetsData: Array<{
    title: string;
    rows: (string | number | boolean | null)[][];
  }>
): Promise<GoogleSheetsExportResult> {
  const token = await ensureAccessToken();

  // 1. Create spreadsheet with sheets
  const createPayload = {
    properties: {
      title,
      locale: 'hi_IN',
      autoRecalc: 'ON_CHANGE',
    },
    sheets: sheetsData.map((s, idx) => ({
      properties: {
        sheetId: idx,
        title: s.title,
        gridProperties: {
          rowCount: Math.max(s.rows.length + 15, 50),
          columnCount: Math.max(...s.rows.map((r) => r.length), 10) + 2,
          frozenRowCount: 2,
        },
      },
    })),
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`गूगल स्प्रेडशीट निर्माण विफल: ${err}`);
  }

  const spreadsheet = await createRes.json();
  const spreadsheetId = spreadsheet.spreadsheetId;
  const spreadsheetUrl = spreadsheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Populate values into each sheet tab
  const valueData = sheetsData.map((s) => ({
    range: `'${s.title}'!A1`,
    values: s.rows,
  }));

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: valueData,
      }),
    }
  );

  if (!updateRes.ok) {
    console.warn('Batch update values warning:', await updateRes.text());
  }

  // 3. Format header styles (Canara Bank Blue & Gold theme)
  try {
    const formatRequests: any[] = [];
    sheetsData.forEach((_, idx) => {
      formatRequests.push(
        // Title row styling (Row 1)
        {
          repeatCell: {
            range: { sheetId: idx, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.0, green: 0.44, blue: 0.73 }, // Canara Sky Blue
                textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 13 },
                horizontalAlignment: 'LEFT',
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
          },
        },
        // Column header styling (Row 2)
        {
          repeatCell: {
            range: { sheetId: idx, startRowIndex: 1, endRowIndex: 2 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.94, green: 0.96, blue: 0.98 },
                textFormat: { foregroundColor: { red: 0.05, green: 0.2, blue: 0.4 }, bold: true, fontSize: 10 },
                horizontalAlignment: 'CENTER',
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
          },
        }
      );
    });

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests: formatRequests }),
    });
  } catch (formatErr) {
    console.warn('Formatting spreadsheet warning (optional step):', formatErr);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
  };
}

/**
 * 1. Export Single Officer Quarterly Report to Google Sheets
 */
export async function exportOfficerReportToGoogleSheets(
  report: QuarterlyReport,
  officer?: Officer | null
): Promise<GoogleSheetsExportResult> {
  const timestamp = new Date().toLocaleDateString('hi-IN');
  const title = `केनरा बैंक - राजभाषा रिपोर्ट - ${report.primaryOfficeName} (${report.quarter})`;

  // Sheet 1: सारांश व अनुवाद प्रगति
  const trans = report.translation || {
    pagesReceivedFromHO: 0,
    receivedDate: '-',
    pagesTranslatedInHindi: 0,
    sentDate: '-',
    pendingPages: 0,
    remarks: '',
  };

  const summaryRows: any[][] = [
    ['केनरा बैंक - राजभाषा तिमाही रिपोर्ट एवं सांख्यिकी', '', '', '', '', '', ''],
    ['विवरण', 'मूल्य / स्थिति', 'टिप्पणी / विवरण', '', '', '', ''],
    ['अंचल / क्षेत्रीय कार्यालय', report.primaryOfficeName, report.circleOfficeName || ''],
    ['राजभाषा अधिकारी', report.officerName, `कर्मचारी संख्या: ${report.officerStaffNo || 'N/A'}`],
    ['पदनाम', officer?.designation || report.officerDesignation || 'प्रबंधक (राजभाषा)', ''],
    ['समीक्षा तिमाही', report.quarter, `वित्तीय वर्ष: ${report.financialYear || '2026-2027'}`],
    ['समवर्ती प्रभार कार्यालय', (report.concurrentOffices || []).join(', ') || 'लागू नहीं', ''],
    ['अधीनस्थ शाखाओं की संख्या', report.subordinateOfficesCount || 0, ''],
    ['रिपोर्ट स्थिति', report.status, `अद्यतन: ${timestamp}`],
    ['', '', '', '', '', '', ''],
    ['--- अनुवाद कार्य सांख्यिकी (Translation Tracking) ---', '', '', '', '', '', ''],
    ['क्रम', 'कार्यालय का नाम', 'प्राप्त पृष्ठ (HO से)', 'प्राप्ति तिथि', 'अनुवादित पृष्ठ', 'प्रेषण तिथि', 'लंबित पृष्ठ'],
    [
      1,
      report.primaryOfficeName,
      trans.pagesReceivedFromHO || 0,
      trans.receivedDate || '-',
      trans.pagesTranslatedInHindi || 0,
      trans.sentDate || '-',
      Math.max(0, (trans.pagesReceivedFromHO || 0) - (trans.pagesTranslatedInHindi || 0)),
    ],
  ];

  // Sheet 2: शाखा भ्रमण विवरण (Branch Visits & Review Letters)
  const visitRows: any[][] = [
    ['केनरा बैंक - राजभाषा शाखा भ्रमण एवं निरीक्षण विवरण', '', '', '', '', ''],
    ['क्र.सं.', 'शाखा का नाम व डीपी कोड', 'संबंधित क्षेत्रीय कार्यालय', 'भ्रमण / निरीक्षण तिथि', 'समीक्षा पत्र प्रेषण तिथि', 'प्रमुख टिप्पणियां'],
    ...(report.branchVisits || []).map((v, idx) => [
      idx + 1,
      v.branchCodeOrName || '-',
      v.regionalOfficeName || report.primaryOfficeName,
      v.visitDate || '-',
      v.reviewLetterDate || '-',
      v.keyObservations || 'सामान्य संतोषजनक',
    ]),
  ];

  // Sheet 3: बैठकें व कार्यशालाएं (Meetings, Workshops & STR-18)
  const activityRows: any[][] = [
    ['केनरा बैंक - राजभाषा बैठकें, कार्यशालाएं एवं सांविधिक अनुपालन', '', '', '', ''],
    ['अनुभाग', 'कार्यालय का नाम', 'आयोजन / समीक्षा तिथि', 'प्राप्ति / प्रेषण तिथि', 'प्रतिभागी / विवरण'],
    ...(report.olicMeetings || []).map((m) => [
      'राजभाषा कार्यान्वयन समिति बैठक (OLIC)',
      m.officeName,
      m.meetingDate || '-',
      m.reportReceivedDate || '-',
      `समीक्षा: ${m.reviewDate || '-'}`,
    ]),
    ...(report.workshops || []).map((w) => [
      'हिंदी कार्यशाला (Workshop)',
      w.officeName,
      w.workshopDate || '-',
      '-',
      `उपस्थित: ${w.participantsCount || 0} प्रतिभागी`,
    ]),
    ...(report.str18Reviews || []).map((s) => [
      'एसटीआर-18 समीक्षा',
      s.officeName,
      s.reviewDate || '-',
      s.letterSentDate || '-',
      'समीक्षा पत्र प्रेषित',
    ]),
  ];

  return createGoogleSpreadsheetWithTabs(title, [
    { title: 'तिमाही_रिपोर्ट_सारांश', rows: summaryRows },
    { title: 'शाखा_भ्रमण_विवरण', rows: visitRows },
    { title: 'बैठकें_व_कार्यशालाएं', rows: activityRows },
  ]);
}

/**
 * 2. Export Circle Office (CO) Consolidated Report to Google Sheets
 */
export async function exportCOConsolidatedToGoogleSheets(
  circleCode: string,
  circleName: string,
  quarter: string,
  reports: QuarterlyReport[]
): Promise<GoogleSheetsExportResult> {
  const title = `केनरा बैंक - अंचल समेकित राजभाषा रिपोर्ट - ${circleName} (${quarter})`;

  // 1. Consolidated Summary Sheet
  const summaryRows: any[][] = [
    [`केनरा बैंक ${circleName} - अंचल स्तरीय समेकित राजभाषा रिपोर्ट (${quarter})`, '', '', '', '', '', '', '', ''],
    [
      'क्र.सं.',
      'क्षेत्रीय कार्यालय (RO)',
      'राजभाषा अधिकारी',
      'कर्मचारी सं.',
      'समवर्ती कार्यालय',
      'शाखाएं',
      'अनुवादित पृष्ठ',
      'शाखा भ्रमण',
      'स्थिति',
    ],
    ...reports.map((r, idx) => {
      const transPages = r.translation?.pagesTranslatedInHindi || 0;
      const visits = (r.branchVisits || []).length;
      return [
        idx + 1,
        r.primaryOfficeName,
        r.officerName,
        r.officerStaffNo || '-',
        (r.concurrentOffices || []).join(', ') || 'लागू नहीं',
        r.subordinateOfficesCount || 0,
        transPages,
        visits,
        r.status,
      ];
    }),
  ];

  // 2. Circle Translation Progress Sheet
  const translationRows: any[][] = [
    [`${circleName} - क्षेत्रीय कार्यालयवार अनुवाद सांख्यिकी`, '', '', '', '', '', ''],
    ['क्र.सं.', 'क्षेत्रीय कार्यालय', 'राजभाषा अधिकारी', 'प्राप्त पृष्ठ (HO)', 'प्राप्ति तिथि', 'अनुवादित पृष्ठ', 'प्रेषण तिथि'],
    ...reports.map((r, idx) => [
      idx + 1,
      r.primaryOfficeName,
      r.officerName,
      r.translation?.pagesReceivedFromHO || 0,
      r.translation?.receivedDate || '-',
      r.translation?.pagesTranslatedInHindi || 0,
      r.translation?.sentDate || '-',
    ]),
  ];

  // 3. Circle Branch Visits Sheet
  const branchVisitRows: any[][] = [
    [`${circleName} - अंचल अंतर्गत सभी शाखा भ्रमण एवं निरीक्षण ट्रैकिंग`, '', '', '', '', ''],
    ['क्र.सं.', 'क्षेत्रीय कार्यालय', 'अधिकारी', 'भ्रमण की गई शाखा', 'भ्रमण तिथि', 'समीक्षा पत्र प्रेषण तिथि', 'टिप्पणी'],
    ...reports.flatMap((r) =>
      (r.branchVisits || []).map((v, idx) => [
        idx + 1,
        r.primaryOfficeName,
        r.officerName,
        v.branchCodeOrName || '-',
        v.visitDate || '-',
        v.reviewLetterDate || '-',
        v.keyObservations || '-',
      ])
    ),
  ];

  return createGoogleSpreadsheetWithTabs(title, [
    { title: 'अंचल_समेकित_सारांश', rows: summaryRows },
    { title: 'अनुवाद_प्रगति_ट्रैकर', rows: translationRows },
    { title: 'शाखा_भ्रमण_निरीक्षण', rows: branchVisitRows },
  ]);
}

/**
 * 3. Export Head Office (HO) All-India Master Report to Google Sheets
 */
export async function exportHOAllIndiaToGoogleSheets(
  quarter: string,
  reports: QuarterlyReport[],
  officers: Officer[]
): Promise<GoogleSheetsExportResult> {
  const title = `केनरा बैंक - अखिल भारतीय राजभाषा मास्टर रिपोर्ट - प्रधान कार्यालय (${quarter})`;

  // 1. National Overview
  const totalReports = reports.length;
  const submittedCount = reports.filter(
    (r) =>
      r.status === 'अंचल द्वारा स्वीकृत (Approved by CO)' ||
      r.status === 'प्रधान कार्यालय को प्रेषित (Forwarded to HO)'
  ).length;
  const totalTransPages = reports.reduce((acc, r) => acc + (r.translation?.pagesTranslatedInHindi || 0), 0);
  const totalVisits = reports.reduce((acc, r) => acc + (r.branchVisits || []).length, 0);

  const overviewRows: any[][] = [
    [`केनरा बैंक प्रधान कार्यालय - अखिल भारतीय राजभाषा प्रबंधन प्रणाली (${quarter})`, '', '', '', '', ''],
    ['मेट्रिक', 'संख्या / विवरण', '', '', '', ''],
    ['समीक्षा तिमाही', quarter, '', '', '', ''],
    ['कुल राजभाषा अधिकारी', officers.length, '', '', '', ''],
    ['प्राप्त / प्रस्तुत रिपोर्ट', `${submittedCount} / ${totalReports}`, '', '', '', ''],
    ['कुल अनुवादित पृष्ठ (All-India)', totalTransPages, '', '', '', ''],
    ['कुल शाखा भ्रमण (All-India)', totalVisits, '', '', '', ''],
    ['निर्यात दिनांक व समय', new Date().toLocaleString('hi-IN'), '', '', '', ''],
  ];

  // 2. All-India Officer Directory & Postings
  const officerDirectoryRows: any[][] = [
    ['अखिल भारतीय राजभाषा अधिकारी पदस्थापन एवं समवर्ती प्रभार सूची', '', '', '', '', '', ''],
    ['क्र.सं.', 'कर्मचारी सं.', 'अधिकारी का नाम', 'पदनाम', 'प्राथमिक कार्यालय (RO/CO)', 'अंचल (CO)', 'समवर्ती प्रभार कार्यालय'],
    ...officers.map((o, idx) => [
      idx + 1,
      o.staffNo,
      o.name,
      o.designation,
      o.primaryOfficeName,
      o.circleOfficeName,
      (o.concurrentOffices || []).join(', ') || 'लागू नहीं',
    ]),
  ];

  // 3. All Reports Submission Tracker
  const submissionsRows: any[][] = [
    ['अखिल भारतीय तिमाही रिपोर्ट प्रस्तुति व अनुवाद स्थिति', '', '', '', '', '', '', '', ''],
    ['क्र.सं.', 'कार्यालय का नाम', 'अंचल', 'अधिकारी', 'कर्मचारी सं.', 'शाखाएं', 'अनुवाद पृष्ठ', 'शाखा भ्रमण', 'स्थिति'],
    ...reports.map((r, idx) => {
      const transPages = r.translation?.pagesTranslatedInHindi || 0;
      const visits = (r.branchVisits || []).length;
      return [
        idx + 1,
        r.primaryOfficeName,
        r.circleOfficeName || '-',
        r.officerName,
        r.officerStaffNo || '-',
        r.subordinateOfficesCount || 0,
        transPages,
        visits,
        r.status,
      ];
    }),
  ];

  return createGoogleSpreadsheetWithTabs(title, [
    { title: 'राष्ट्रीय_सारांश', rows: overviewRows },
    { title: 'अधिकारी_पदस्थापन_सूची', rows: officerDirectoryRows },
    { title: 'समस्त_तिमाही_रिपोर्ट', rows: submissionsRows },
  ]);
}

/**
 * 4. Automatic Sync: Syncs an officer's report to Google Sheets on Save
 */
export async function syncReportToMasterGoogleSheet(
  report: QuarterlyReport,
  officer?: Officer | null
): Promise<GoogleSheetsExportResult> {
  const MASTER_KEY = `cb_rajbhasha_sheet_${report.officerStaffNo || 'master'}_${report.quarter}`;
  
  // Creates or updates the officer's formatted Google Spreadsheet with all tables
  const exportRes = await exportOfficerReportToGoogleSheets(report, officer);
  
  try {
    localStorage.setItem(
      MASTER_KEY,
      JSON.stringify({
        id: exportRes.spreadsheetId,
        url: exportRes.spreadsheetUrl,
        title: exportRes.title,
        lastSyncedAt: new Date().toISOString(),
      })
    );
    localStorage.setItem('cb_rajbhasha_last_synced_url', exportRes.spreadsheetUrl);
  } catch (e) {}

  return exportRes;
}

export function getLastSyncedGoogleSheetUrl(): string | null {
  try {
    return localStorage.getItem('cb_rajbhasha_last_synced_url');
  } catch (e) {
    return null;
  }
}

