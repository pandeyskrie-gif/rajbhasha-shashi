import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { QuarterlyReport } from '../types';

/**
 * Builds a clean, self-contained HTML representation of the complete Rajbhasha Report.
 * All styling uses explicit hex colors and standard CSS so that:
 * 1. html2canvas never encounters modern CSS color functions (oklch, color-mix).
 * 2. Standalone .html downloads render with 100% perfect fidelity in any browser without external CSS dependencies.
 */
export function buildReportHtmlString(report: QuarterlyReport, includePrintBanner = false): string {
  const formattedDate = new Date(report.updatedAt).toLocaleDateString('hi-IN');
  const cleanStaff = (report.officerStaffNo || 'CO').replace(/[^a-zA-Z0-9]/g, '');
  const cleanQtr = (report.quarter || 'QTR').replace(/[^a-zA-Z0-9]/g, '_');

  const printBannerHtml = includePrintBanner
    ? `
    <div style="background: #006699; color: #ffffff; padding: 14px 20px; border-radius: 8px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); font-family: 'Noto Sans Devanagari', sans-serif;" class="no-print">
      <div>
        <strong style="font-size: 15px;">केनरा बैंक राजभाषा तिमाही रिपोर्ट</strong>
        <span style="font-size: 13px; opacity: 0.9; margin-left: 12px;">${report.officerName} (${report.primaryOfficeName})</span>
      </div>
      <div>
        <button onclick="window.print()" style="background: #fdb813; color: #000000; border: none; padding: 9px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 13px; font-family: inherit; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
          🖨️ यहाँ क्लिक करके PDF में सेव करें (Ctrl + P)
        </button>
      </div>
    </div>`
    : '';

  return `
  ${printBannerHtml}
  <div style="width: 100%; max-width: 800px; margin: 0 auto; background: #ffffff; color: #0f172a; font-family: 'Noto Sans Devanagari', Arial, sans-serif; font-size: 12px; line-height: 1.5; box-sizing: border-box; padding: 16px;">
    
    <!-- Canara Bank Official Header Banner -->
    <div style="background-color: #006699; border: 2px solid #004d73; color: #ffffff; padding: 16px 20px; border-radius: 6px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 14px;">
        <div style="background: #fdb813; color: #004d73; font-weight: 900; font-size: 20px; padding: 6px 12px; border-radius: 6px; border: 2px solid #ffffff; letter-spacing: 0.5px;">
          CANARA
        </div>
        <div>
          <div style="font-size: 18px; font-weight: 800; letter-spacing: 0.5px; line-height: 1.2;">केनरा बैंक &bull; CANARA BANK</div>
          <div style="font-size: 11px; color: #e0f2fe; margin-top: 2px;">(भारत सरकार का उपक्रम / A Government of India Undertaking)</div>
        </div>
      </div>
      <div style="text-align: right; border-left: 1px solid #38bdf8; padding-left: 16px;">
        <div style="background-color: #fdb813; color: #004d73; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 4px; display: inline-block;">
          राजभाषा अनुभाग
        </div>
        <div style="font-size: 10px; color: #bae6fd; margin-top: 4px;">
          प्रधान कार्यालय, 112 जे.सी. रोड, बेंगलूरु
        </div>
      </div>
    </div>

    <!-- Report Main Title -->
    <div style="text-align: center; margin: 16px 0;">
      <h2 style="font-size: 20px; font-weight: 800; color: #004d73; margin: 0; padding-bottom: 4px; border-bottom: 2px solid #004d73; display: inline-block;">
        राजभाषा तिमाही रिपोर्ट
      </h2>
    </div>

    <!-- Office & Quarter Metadata Row -->
    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: bold; margin-bottom: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">
      <div>
        <span style="color: #64748b;">अंचल / क्षेत्रीय कार्यालय : </span>
        <span style="color: #004d73; font-size: 13px;">${report.primaryOfficeName}</span>
        ${report.circleOfficeName ? `<span style="color: #64748b; font-size: 11px; margin-left: 6px;">(${report.circleOfficeName})</span>` : ''}
      </div>
      <div>
        <span style="color: #64748b;">तिमाही : </span>
        <span style="color: #004d73; font-size: 13px;">${report.quarter} (${report.financialYear})</span>
      </div>
    </div>

    <!-- Table 1: Officer & Concurrent Charge Details -->
    <div style="margin-bottom: 20px;">
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #475569; font-size: 11px;">
        <thead>
          <tr style="background-color: #f1f5f9; color: #0f172a; font-weight: bold;">
            <th style="border: 1px solid #475569; padding: 6px 8px; width: 45px; text-align: center;">क्र. सं.</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: left;">राजभाषा अधिकारी का नाम व कर्मचारी संख्या</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: left;">अंचल/क्षेत्रीय कार्यालय एवं समवर्ती प्रभार कार्यालय</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: center; width: 140px;">अधीनस्थ कार्यालयों की संख्या</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center; font-weight: bold;">1.</td>
            <td style="border: 1px solid #475569; padding: 6px 8px;">
              <div style="font-weight: bold; color: #0f172a; font-size: 12px;">${report.officerName}</div>
              <div style="color: #475569; margin-top: 2px;">कर्मचारी संख्या: ${report.officerStaffNo} | ${report.officerDesignation}</div>
            </td>
            <td style="border: 1px solid #475569; padding: 6px 8px;">
              <div style="font-weight: bold; color: #004d73;">मूल कार्यालय: ${report.primaryOfficeName}</div>
              ${report.concurrentOffices && report.concurrentOffices.length > 0 ? `<div style="color: #92400e; margin-top: 3px; font-weight: 600;">समवर्ती प्रभार: ${report.concurrentOffices.join(', ')}</div>` : `<div style="color: #64748b; font-style: italic; margin-top: 2px;">कोई अतिरिक्त समवर्ती प्रभार नहीं</div>`}
            </td>
            <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center; font-weight: bold; font-size: 13px; color: #004d73;">
              ${report.subordinateOfficesCount}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Translation Work Section -->
    <div style="margin-bottom: 20px; background-color: #f0f9ff; padding: 10px; border: 1px solid #7dd3fc; border-radius: 4px;">
      <div style="font-weight: bold; font-size: 12px; color: #0369a1; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #bae6fd; display: flex; justify-content: space-between;">
        <span>अनुवाद कार्य विवरण (प्रधान कार्यालय एवं संबंधित कार्यालय)</span>
        <span style="font-size: 10px; background: #e0f2fe; padding: 2px 8px; border-radius: 4px;">विशेष स्तम्भ</span>
      </div>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #475569; font-size: 11px; background-color: #ffffff;">
        <thead>
          <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
            <th style="border: 1px solid #475569; padding: 6px 8px;">प्रधान कार्यालय से प्राप्त पृष्ठ</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">प्राप्ति की तिथि</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">हिंदी में अनूदित पृष्ठ</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">प्रेषण की तारीख</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">शेष / लंबित पृष्ठ</th>
          </tr>
        </thead>
        <tbody>
          <tr style="text-align: center;">
            <td style="border: 1px solid #475569; padding: 6px 8px; font-weight: bold; color: #0369a1;">${report.translation?.pagesReceivedFromHO || 0}</td>
            <td style="border: 1px solid #475569; padding: 6px 8px;">${report.translation?.receivedDate || '-'}</td>
            <td style="border: 1px solid #475569; padding: 6px 8px; font-weight: bold; color: #15803d;">${report.translation?.pagesTranslatedInHindi || 0}</td>
            <td style="border: 1px solid #475569; padding: 6px 8px;">${report.translation?.sentDate || '-'}</td>
            <td style="border: 1px solid #475569; padding: 6px 8px; font-weight: bold; color: #b45309;">${report.translation?.pendingPages || 0}</td>
          </tr>
        </tbody>
      </table>
      ${report.translation?.remarks ? `<p style="font-size: 11px; color: #475569; margin: 4px 0 0 0; font-style: italic;"><strong>टिप्पणी:</strong> ${report.translation.remarks}</p>` : ''}
    </div>

    <!-- Branch Visit Tracking -->
    <div style="margin-bottom: 20px; background-color: #f8fafc; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px;">
      <div style="font-weight: bold; font-size: 12px; color: #004d73; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #cbd5e1; display: flex; justify-content: space-between;">
        <span>शाखा निरीक्षण / राजभाषा भ्रमण विवरण (मूल क्षेत्रीय कार्यालय एवं समवर्ती प्रभार कार्यालय)</span>
        <span style="font-size: 10px; background: #e2e8f0; padding: 2px 8px; border-radius: 4px;">कुल विज़िट: ${report.branchVisits?.length || 0}</span>
      </div>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #475569; font-size: 11px; background-color: #ffffff;">
        <thead>
          <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
            <th style="border: 1px solid #475569; padding: 6px 8px; width: 40px;">क्र. सं.</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: left;">क्षेत्रीय कार्यालय</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: left;">विज़िट की गई शाखा</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">विज़िट की तिथि</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">समीक्षा पत्र प्रेषण तिथि</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: left;">मुख्य निष्कर्ष</th>
          </tr>
        </thead>
        <tbody>
          ${
            report.branchVisits && report.branchVisits.length > 0
              ? report.branchVisits
                  .map(
                    (bv, idx) => `
              <tr>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${idx + 1}.</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; font-weight: bold; color: #004d73;">${bv.regionalOfficeName}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px;">${bv.branchCodeOrName}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${bv.visitDate || '-'}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${bv.reviewLetterDate || '-'}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px;">${bv.keyObservations || '-'}</td>
              </tr>`
                  )
                  .join('')
              : `<tr><td colspan="6" style="border: 1px solid #475569; padding: 6px 8px; text-align: center; color: #64748b; font-style: italic;">इस तिमाही में शाखा विज़िट का विवरण दर्ज नहीं है।</td></tr>`
          }
        </tbody>
      </table>
    </div>

    <!-- Table 2: OLIC Meetings -->
    <div style="margin-bottom: 20px;">
      <div style="font-weight: bold; font-size: 12px; text-align: center; color: #0f172a; margin-bottom: 4px;">
        राजभाषा कार्यान्वयन समिति की बैठक (तिमाही)
      </div>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #475569; font-size: 11px;">
        <thead>
          <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
            <th style="border: 1px solid #475569; padding: 6px 8px; width: 45px;">क्रम सं.</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: left;">कार्यालय का नाम</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">बैठक आयोजन की तिथि</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">रिपोर्ट प्राप्ति की तिथि</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">समीक्षा की तिथि</th>
          </tr>
        </thead>
        <tbody>
          ${
            report.olicMeetings && report.olicMeetings.length > 0
              ? report.olicMeetings
                  .map(
                    (row, idx) => `
              <tr>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${idx + 1}.</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; font-weight: 600;">${row.officeName}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.meetingDate || '-'}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.reportReceivedDate || '-'}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.reviewDate || '-'}</td>
              </tr>`
                  )
                  .join('')
              : `<tr><td colspan="5" style="border: 1px solid #475569; padding: 6px 8px; text-align: center; color: #64748b; font-style: italic;">विवरण उपलब्ध नहीं</td></tr>`
          }
        </tbody>
      </table>
    </div>

    <!-- Table 3: Hindi Workshop -->
    <div style="margin-bottom: 20px;">
      <div style="font-weight: bold; font-size: 12px; text-align: center; color: #0f172a; margin-bottom: 4px;">
        हिंदी कार्यशाला (तिमाही)
      </div>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #475569; font-size: 11px;">
        <thead>
          <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
            <th style="border: 1px solid #475569; padding: 6px 8px; width: 45px;">क्रम सं.</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: left;">कार्यालय का नाम</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">कार्यशाला की तारीख</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">उपस्थित प्रतिभागियों की संख्या</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: left;">विषय / टिप्पणी</th>
          </tr>
        </thead>
        <tbody>
          ${
            report.workshops && report.workshops.length > 0
              ? report.workshops
                  .map(
                    (row, idx) => `
              <tr>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${idx + 1}.</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; font-weight: 600;">${row.officeName}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.workshopDate || '-'}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center; font-weight: bold;">${row.participantsCount || 0}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px;">${row.topic || '-'}</td>
              </tr>`
                  )
                  .join('')
              : `<tr><td colspan="5" style="border: 1px solid #475569; padding: 6px 8px; text-align: center; color: #64748b; font-style: italic;">विवरण उपलब्ध नहीं</td></tr>`
          }
        </tbody>
      </table>
    </div>

    <!-- Table 4: Regional Report Submission -->
    <div style="margin-bottom: 20px;">
      <div style="font-weight: bold; font-size: 12px; text-align: center; color: #0f172a; margin-bottom: 4px;">
        क्षेत्रीय कार्यान्वयन कार्यालय को प्रेषित रिपोर्ट (तिमाही)
      </div>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #475569; font-size: 11px;">
        <thead>
          <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
            <th style="border: 1px solid #475569; padding: 6px 8px; width: 45px;">क्रम सं.</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: left;">कार्यालय का नाम</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">ऑनलाइन प्रस्तुति दिनांक</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">रिपोर्ट नियंत्रण कार्यालय को प्रेषण की तारीख</th>
          </tr>
        </thead>
        <tbody>
          ${
            report.regionalReports && report.regionalReports.length > 0
              ? report.regionalReports
                  .map(
                    (row, idx) => `
              <tr>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${idx + 1}.</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; font-weight: 600;">${row.officeName}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.onlineSubmissionDate || '-'}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.controllingOfficeSentDate || '-'}</td>
              </tr>`
                  )
                  .join('')
              : `<tr><td colspan="4" style="border: 1px solid #475569; padding: 6px 8px; text-align: center; color: #64748b; font-style: italic;">विवरण उपलब्ध नहीं</td></tr>`
          }
        </tbody>
      </table>
    </div>

    <!-- Table 5 & 6: STR-18 Reviews & Submissions -->
    <div style="margin-bottom: 20px;">
      <div style="font-weight: bold; font-size: 12px; text-align: center; color: #0f172a; margin-bottom: 4px;">
        क्षेत्राधीन शाखाओं/ क्षेत्रीय कार्यालयों की एस टी आर -18 की समीक्षा एवं प्रस्तुति (तिमाही)
      </div>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #475569; font-size: 11px;">
        <thead>
          <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
            <th style="border: 1px solid #475569; padding: 6px 8px; width: 45px;">क्रम सं.</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: left;">कार्यालय का नाम</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">समीक्षा दिनांक</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">समीक्षा पत्र प्रेषण</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">हस्ताक्षरित प्रति प्रस्तुति</th>
          </tr>
        </thead>
        <tbody>
          ${
            report.str18Reviews && report.str18Reviews.length > 0
              ? report.str18Reviews
                  .map((row, idx) => {
                    const sub = report.str18Submissions.find((s) => s.officeName === row.officeName);
                    return `
              <tr>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${idx + 1}.</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; font-weight: 600;">${row.officeName}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.reviewDate || '-'}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.letterSentDate || '-'}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${sub?.submissionDate || '-'}</td>
              </tr>`;
                  })
                  .join('')
              : `<tr><td colspan="5" style="border: 1px solid #475569; padding: 6px 8px; text-align: center; color: #64748b; font-style: italic;">विवरण उपलब्ध नहीं</td></tr>`
          }
        </tbody>
      </table>
    </div>

    <!-- Table 7, 8, 9: Events (Paricharcha, Seminar, Representative Meetings) -->
    <div style="margin-bottom: 20px;">
      <div style="font-weight: bold; font-size: 12px; text-align: center; color: #0f172a; margin-bottom: 4px;">
        हिंदी परिचर्चा, संगोष्ठी एवं प्रतिनिधि बैठक विवरण
      </div>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #475569; font-size: 11px;">
        <thead>
          <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
            <th style="border: 1px solid #475569; padding: 6px 8px; width: 45px;">क्रम सं.</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: left;">कार्यक्रम प्रकार</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: left;">कार्यालय का नाम</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">आयोजन की तारीख</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">रिपोर्ट प्रेषण तारीख</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">केननेट अपलोड तारीख</th>
          </tr>
        </thead>
        <tbody>
          ${
            report.paricharchas && report.paricharchas.length > 0
              ? report.paricharchas
                  .map(
                    (row, idx) => `
              <tr>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${idx + 1}.</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; font-weight: bold; color: #004d73;">हिंदी परिचर्चा</td>
                <td style="border: 1px solid #475569; padding: 6px 8px;">${row.officeName}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.eventDate || '-'}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.reportSentDate || '-'}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.cannetUploadDate || '-'}</td>
              </tr>`
                  )
                  .join('')
              : ''
          }
          ${
            report.seminars && report.seminars.length > 0
              ? report.seminars
                  .map(
                    (row, idx) => `
              <tr>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${(report.paricharchas?.length || 0) + idx + 1}.</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; font-weight: bold; color: #0284c7;">हिंदी संगोष्ठी (वार्षिक)</td>
                <td style="border: 1px solid #475569; padding: 6px 8px;">${row.officeName}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.eventDate || '-'}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.reportSentDate || '-'}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.cannetUploadDate || '-'}</td>
              </tr>`
                  )
                  .join('')
              : ''
          }
          ${
            report.representativeMeetings && report.representativeMeetings.length > 0
              ? report.representativeMeetings
                  .map(
                    (row, idx) => `
              <tr>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${(report.paricharchas?.length || 0) + (report.seminars?.length || 0) + idx + 1}.</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; font-weight: bold; color: #059669;">प्रतिनिधि बैठक (वार्षिक)</td>
                <td style="border: 1px solid #475569; padding: 6px 8px;">${row.officeName}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.eventDate || '-'}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.reportSentDate || '-'}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.cannetUploadDate || '-'}</td>
              </tr>`
                  )
                  .join('')
              : ''
          }
          ${
            (!report.paricharchas || report.paricharchas.length === 0) &&
            (!report.seminars || report.seminars.length === 0) &&
            (!report.representativeMeetings || report.representativeMeetings.length === 0)
              ? `<tr><td colspan="6" style="border: 1px solid #475569; padding: 6px 8px; text-align: center; color: #64748b; font-style: italic;">विवरण उपलब्ध नहीं</td></tr>`
              : ''
          }
        </tbody>
      </table>
    </div>

    <!-- Table 10 & 11: Magazines & Journals -->
    <div style="margin-bottom: 20px;">
      <div style="font-weight: bold; font-size: 12px; text-align: center; color: #0f172a; margin-bottom: 4px;">
        पत्रिका/ई-पत्रिका एवं केनराज्योति व श्रेयस प्रविष्टियां
      </div>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #475569; font-size: 11px;">
        <thead>
          <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
            <th style="border: 1px solid #475569; padding: 6px 8px; width: 45px;">क्रम सं.</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: left;">कार्यालय का नाम</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: left;">पत्रिका/ई-पत्रिका का नाम</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">कुल पृष्ठ</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">विमोचन तिथि</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">प्र.का. प्रेषण तिथि</th>
          </tr>
        </thead>
        <tbody>
          ${
            report.magazines && report.magazines.length > 0
              ? report.magazines
                  .map(
                    (row, idx) => `
              <tr>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${idx + 1}.</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; font-weight: 600;">${row.officeName}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; font-weight: bold; color: #004d73;">${row.magazineName}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.totalPages}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.releaseDate || '-'}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.hoSentDate || '-'}</td>
              </tr>`
                  )
                  .join('')
              : `<tr><td colspan="6" style="border: 1px solid #475569; padding: 6px 8px; text-align: center; color: #64748b; font-style: italic;">इस अवधि में कोई पत्रिका विमोचित नहीं हुई</td></tr>`
          }
        </tbody>
      </table>
    </div>

    <!-- Table 12 & 13: TOLIC Meetings (Member & Convener) -->
    <div style="margin-bottom: 20px;">
      <div style="font-weight: bold; font-size: 12px; text-align: center; color: #0f172a; margin-bottom: 4px;">
        नगर राजभाषा कार्यान्वयन समिति (नराकास - TOLIC) बैठक विवरण
      </div>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #475569; font-size: 11px;">
        <thead>
          <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
            <th style="border: 1px solid #475569; padding: 6px 8px; width: 45px;">क्रम सं.</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: left;">भूमिका</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: left;">कार्यालय का नाम</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: left;">नराकास का नाम</th>
            <th style="border: 1px solid #475569; padding: 6px 8px;">बैठक तिथि</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: left;">उपस्थित कार्यालय प्रमुख</th>
          </tr>
        </thead>
        <tbody>
          ${
            report.tolicMembers && report.tolicMembers.length > 0
              ? report.tolicMembers
                  .map(
                    (row, idx) => `
              <tr>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${idx + 1}.</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; font-weight: bold; color: #004d73;">सदस्य</td>
                <td style="border: 1px solid #475569; padding: 6px 8px;">${row.officeName}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px;">${row.tolicName}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.meetingDate || '-'}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px;">${row.headAttendedName || '-'}</td>
              </tr>`
                  )
                  .join('')
              : ''
          }
          ${
            report.tolicConveners && report.tolicConveners.length > 0
              ? report.tolicConveners
                  .map(
                    (row, idx) => `
              <tr>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${(report.tolicMembers?.length || 0) + idx + 1}.</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; font-weight: bold; color: #059669;">संयोजक</td>
                <td style="border: 1px solid #475569; padding: 6px 8px;">${row.officeName}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px;">${row.tolicName}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${row.meetingDate || '-'}</td>
                <td style="border: 1px solid #475569; padding: 6px 8px;">${row.headAttendedName || '-'} (उपस्थित: ${row.attendedMemberOffices}/${row.totalMemberOffices})</td>
              </tr>`
                  )
                  .join('')
              : ''
          }
          ${
            (!report.tolicMembers || report.tolicMembers.length === 0) &&
            (!report.tolicConveners || report.tolicConveners.length === 0)
              ? `<tr><td colspan="6" style="border: 1px solid #475569; padding: 6px 8px; text-align: center; color: #64748b; font-style: italic;">नराकास बैठक विवरण उपलब्ध नहीं</td></tr>`
              : ''
          }
        </tbody>
      </table>
    </div>

    <!-- Section 14: Innovative Works -->
    <div style="margin-bottom: 16px; border: 1px solid #475569; padding: 10px; border-radius: 4px;">
      <div style="font-weight: bold; font-size: 11px; color: #0f172a; margin-bottom: 6px;">
        अंचल व क्षेत्रीय कार्यालयों द्वारा तिमाही के दौरान किए गए नवोन्मेषी कार्य :
      </div>
      ${
        report.innovativeWorks && report.innovativeWorks.length > 0
          ? `<ol style="margin: 0; padding-left: 20px; font-size: 11px; color: #334155;">${report.innovativeWorks.map((item) => `<li style="margin-bottom: 2px;">${item}</li>`).join('')}</ol>`
          : `<p style="margin: 0; font-size: 11px; color: #64748b; font-style: italic;">कोई विशेष विवरण दर्ज नहीं किया गया है।</p>`
      }
    </div>

    <!-- Section 15: Special Awards -->
    <div style="margin-bottom: 16px; border: 1px solid #475569; padding: 10px; border-radius: 4px;">
      <div style="font-weight: bold; font-size: 11px; color: #0f172a; margin-bottom: 6px;">
        अंचल व क्षेत्रीय कार्यालयों को प्राप्त विशेष पुरस्कार :
      </div>
      ${
        report.specialAwards && report.specialAwards.length > 0
          ? `<ol style="margin: 0; padding-left: 20px; font-size: 11px; color: #334155;">${report.specialAwards.map((item) => `<li style="margin-bottom: 2px;">${item}</li>`).join('')}</ol>`
          : `<p style="margin: 0; font-size: 11px; color: #64748b; font-style: italic;">कोई पुरस्कार प्राप्त नहीं।</p>`
      }
    </div>

    <!-- Section 16: Custom Added Columns / Fields -->
    ${
      report.customFields && report.customFields.length > 0
        ? `
    <div style="margin-bottom: 16px; border: 1px solid #475569; padding: 10px; border-radius: 4px; background-color: #fefce8;">
      <div style="font-weight: bold; font-size: 11px; color: #0f172a; margin-bottom: 6px;">
        अतिरिक्त विवरण एवं अन्य स्तंभ (Custom Fields / Details):
      </div>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #475569; font-size: 11px; background-color: #ffffff;">
        <thead>
          <tr style="background-color: #f1f5f9; font-weight: bold; text-align: center;">
            <th style="border: 1px solid #475569; padding: 6px 8px; width: 40px;">क्र. सं.</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: left;">कॉलम / विषय शीर्षक</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: left;">प्रविष्टि / विवरण</th>
            <th style="border: 1px solid #475569; padding: 6px 8px; text-align: left;">विशेष टिप्पणी</th>
          </tr>
        </thead>
        <tbody>
          ${report.customFields
            .map(
              (cf, idx) => `
            <tr>
              <td style="border: 1px solid #475569; padding: 6px 8px; text-align: center;">${idx + 1}.</td>
              <td style="border: 1px solid #475569; padding: 6px 8px; font-weight: bold; color: #0f172a;">${cf.title}</td>
              <td style="border: 1px solid #475569; padding: 6px 8px;">${cf.value}</td>
              <td style="border: 1px solid #475569; padding: 6px 8px; color: #475569;">${cf.remarks || '-'}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>`
        : ''
    }

    <!-- Official Signatures Row -->
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px;">
      <div style="text-align: center; width: 260px;">
        <div style="border-bottom: 1px dashed #475569; padding-bottom: 6px; margin-bottom: 6px; font-weight: bold; color: #0f172a; min-height: 20px;">
          ${report.officerSignatureName || `${report.officerName} (${report.officerDesignation})`}
        </div>
        <div style="font-weight: bold; color: #0f172a;">राजभाषा अधिकारी (प्रभारी) के हस्ताक्षर</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">दिनांक: ${formattedDate}</div>
      </div>

      <div style="text-align: center; width: 260px;">
        <div style="border-bottom: 1px dashed #475569; padding-bottom: 6px; margin-bottom: 6px; font-weight: bold; color: #0f172a; min-height: 20px;">
          ${report.officeHeadSignatureName || 'क्षेत्रीय प्रमुख / उप महाप्रबंधक'}
        </div>
        <div style="font-weight: bold; color: #0f172a;">कार्यालय प्रमुख के हस्ताक्षर</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">मुहर सहित</div>
      </div>
    </div>

    <!-- Official Footer Credit -->
    <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px dotted #e2e8f0; padding-top: 8px;">
      Designed & Developed by Shashi Kant Pandey, Senior Manager (OL), CIBM, Manipal &bull; Internal — केनरा बैंक राजभाषा प्रबंधन सूचना प्रणाली
    </div>
  </div>`;
}

/**
 * Downloads a 100% self-contained .html report file that can be opened in any browser
 * offline or online. With embedded fonts, exact table layouts, print media rules,
 * and an immediate print button, opening it has ZERO layout breakage.
 */
export function downloadOfflineHtmlReport(report: QuarterlyReport): void {
  const cleanStaff = (report.officerStaffNo || 'CO').replace(/[^a-zA-Z0-9]/g, '');
  const cleanQtr = (report.quarter || 'QTR').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Canara_Bank_Rajbhasha_Report_${cleanStaff}_${cleanQtr}.html`;

  const bodyContent = buildReportHtmlString(report, true);

  const fullHtml = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Canara Bank Rajbhasha Report - ${report.officerName} (${report.quarter})</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: #f1f5f9;
      color: #0f172a;
      font-family: 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      padding: 24px;
      -webkit-font-smoothing: antialiased;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      page-break-inside: avoid;
    }
    @media print {
      body {
        background-color: #ffffff !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
      @page {
        size: A4 portrait;
        margin: 12mm 10mm 12mm 10mm;
      }
    }
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates an actual, multi-page .pdf document (A4 format) directly in the browser
 * using html2canvas on an off-screen, purely-styled container, then slicing into A4 pages in jsPDF.
 * This completely avoids Tailwind CSS oklch/color-mix parser crashes and iframe print blocking.
 */
export async function generateReportPdf(
  report: QuarterlyReport,
  onProgress?: (msg: string) => void
): Promise<void> {
  onProgress?.('पीडीएफ तैयार की जा रही है, कृपया 1-2 सेकंड प्रतीक्षा करें...');

  const cleanStaff = (report.officerStaffNo || 'CO').replace(/[^a-zA-Z0-9]/g, '');
  const cleanQtr = (report.quarter || 'QTR').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Canara_Bank_Rajbhasha_Report_${cleanStaff}_${cleanQtr}.pdf`;

  // 1. Create a dedicated off-screen container with pure standard CSS (no Tailwind v4 classes)
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-99999px';
  container.style.left = '0';
  container.style.width = '794px'; // 210mm at 96 DPI (Standard A4 width)
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = "'Noto Sans Devanagari', -apple-system, sans-serif";
  container.style.zIndex = '-1';
  container.innerHTML = buildReportHtmlString(report, false);

  document.body.appendChild(container);

  try {
    // 2. Render to canvas using html2canvas
    const canvas = await html2canvas(container, {
      scale: 2, // 2x resolution for ultra-sharp text and borders
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
    });

    onProgress?.('पीडीएफ पृष्ठ संयोजित किए जा रहे हैं...');

    // 3. Multi-page A4 PDF creation using jsPDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210; // mm
    const pdfHeight = 297; // mm
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const imgData = canvas.toDataURL('image/jpeg', 0.96);

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add subsequent pages if report exceeds 1 page
    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // 4. Download genuine .pdf file
    pdf.save(filename);
    onProgress?.(`✓ आधिकारिक पीडीएफ रिपोर्ट सफलता पूर्वक डाउनलोड हो गई: ${filename}`);
  } finally {
    // Clean up temporary container
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
