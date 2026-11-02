import React, { useState, useEffect } from 'react';
import { QuarterlyReport } from '../types';
import { Printer, Download, ArrowLeft, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { CanaraLogo } from './CanaraLogo';
import { generateReportPdf, downloadOfflineHtmlReport } from '../utils/reportPdfExport';

interface Props {
  report: QuarterlyReport;
  onBack: () => void;
}

export const PrintableReport: React.FC<Props> = ({ report, onBack }) => {
  const [toastMsg, setToastMsg] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Handle ESC key to return back smoothly at all times
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  // Direct Genuine PDF Generation & Download (.pdf file)
  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setToastMsg('आधिकारिक पीडीएफ रिपोर्ट तैयार की जा रही है, कृपया 1-2 सेकंड प्रतीक्षा करें...');
    try {
      await generateReportPdf(report, (status) => setToastMsg(status));
    } catch (err) {
      console.error('PDF Generation failed:', err);
      setToastMsg('पीडीएफ निर्माण में तकनीकी बाधा आई। बैकअप के लिए नीचे "📄 ऑफ़लाइन एचटीएमएल रिपोर्ट" का उपयोग करें।');
    } finally {
      setIsGeneratingPdf(false);
      setTimeout(() => setToastMsg(''), 7000);
    }
  };

  // Safe Print Handler: tries window.print() if allowed, else triggers direct PDF generation
  const handlePrint = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Try native window.print() if outside sandboxed iframe
    let printed = false;
    try {
      if (window.self === window.top) {
        window.print();
        printed = true;
      }
    } catch {
      printed = false;
    }

    // If print dialog is blocked by iframe or browser sandbox, directly generate & download the PDF file
    if (!printed) {
      setToastMsg('ब्राउज़र आईफ्रेम सुरक्षा के कारण सीधे प्रिंट विंडो खुलने में बाधा है — रिपोर्ट की वास्तविक PDF फाइल स्वतः तैयार कर डाउनलोड की जा रही है...');
      await handleDownloadPdf();
    }
  };

  // Standalone offline HTML file download with 100% embedded formatting and zero layout breakage
  const handleDownloadOfflineHtml = () => {
    try {
      downloadOfflineHtmlReport(report);
      const cleanStaff = (report.officerStaffNo || 'CO').replace(/[^a-zA-Z0-9]/g, '');
      const cleanQtr = (report.quarter || 'QTR').replace(/[^a-zA-Z0-9]/g, '_');
      setToastMsg(`✓ पूर्ण ऑफ़लाइन रिपोर्ट फाइल सफलता पूर्वक डाउनलोड हो गई: Canara_Bank_Rajbhasha_Report_${cleanStaff}_${cleanQtr}.html`);
      setTimeout(() => setToastMsg(''), 6000);
    } catch (err) {
      console.error('HTML download error:', err);
      setToastMsg('रिपोर्ट फाइल डाउनलोड करने में त्रुटि हुई।');
    }
  };

  const allOffices = [report.primaryOfficeName, ...report.concurrentOffices].filter(Boolean);

  return (
    <div className="bg-slate-100 min-h-screen py-6 px-4 print:p-0 print:bg-white text-slate-800 relative">
      {/* Persistent Floating Back Button (Always Clickable) */}
      <div className="fixed top-3 left-3 z-50 print:hidden">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBack();
          }}
          className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xl transition cursor-pointer border border-slate-700"
          title="पोर्टल पर वापस लौटें (Escape)"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← वापस जाएं (Back)</span>
        </button>
      </div>

      {/* Top action bar (hidden during print) */}
      <div className="max-w-4xl mx-auto mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200 print:hidden space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBack();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer border border-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>वापस जाएं (Back)</span>
          </button>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-medium">
              स्थिति: {report.status}
            </span>

            {report.signedPdf ? (
              <span className="text-xs bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full font-bold inline-flex items-center gap-1">
                <span>✓ हस्ताक्षरित प्रति संलग्न ({report.signedPdf.status})</span>
              </span>
            ) : (
              <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full font-medium">
                हस्ताक्षरित प्रति: लंबित
              </span>
            )}

            {/* Direct Official PDF Download Button (.pdf file) */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs rounded-lg shadow-sm transition cursor-pointer"
              title="पूरी 16 तालिकाओं वाली आधिकारिक पीडीएफ फाइल (.pdf) सीधे अपने कंप्यूटर पर डाउनलोड करें"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>पीडीएफ बन रही है...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>📥 आधिकारिक पीडीएफ डाउनलोड (.pdf)</span>
                </>
              )}
            </button>

            {/* Print / Save to PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-700 hover:bg-sky-800 disabled:bg-sky-400 text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer"
              title="प्रिंट करें अथवा पीडीएफ के रूप में सुरक्षित करें"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ प्रिंट / पीडीएफ सेव करें (Print to PDF)</span>
            </button>

            {/* Standalone HTML Report Backup */}
            <button
              type="button"
              onClick={handleDownloadOfflineHtml}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-300 transition cursor-pointer"
              title="ब्राउज़र में सीधे खोलने योग्य 100% सटीक ऑफ़लाइन एचटीएमएल रिपोर्ट फाइल"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>📄 ऑफ़लाइन रिपोर्ट (.html)</span>
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center gap-2 font-semibold animate-in fade-in">
            {isGeneratingPdf ? (
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toastMsg}</span>
          </div>
        )}

        <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-950 flex items-center justify-between">
          <span>
            💡 <strong>सुविधा:</strong> <strong>"📥 आधिकारिक पीडीएफ डाउनलोड (.pdf)"</strong> पर क्लिक करने पर वास्तविक <strong>PDF फाइल</strong> सीधे आपके सिस्टम पर डाउनलोड होगी। यदि आप <strong>"🖨️ प्रिंट / पीडीएफ सेव करें"</strong> दबाते हैं और ब्राउज़र आईफ्रेम में प्रिंट डायलॉग बाधित होता है, तब भी यह स्वतः आपकी आधिकारिक PDF फाइल तैयार कर डाउनलोड कर देगा।
          </span>
        </div>
      </div>

      {/* Main Official Document Sheet */}
      <div
        id="printable-report-sheet"
        className="max-w-4xl mx-auto bg-white p-8 md:p-12 shadow-xl print:shadow-none print:p-4 rounded-lg border border-slate-200 print:border-none print:w-full print:max-w-full"
      >
        {/* Canara Bank Official Header Banner */}
        <div className="border border-sky-800 bg-sky-700 text-white p-4 rounded mb-4 print:border-black flex items-center justify-between px-6">
          <CanaraLogo size="lg" theme="dark" />
          <div className="border-l border-sky-400 pl-4 text-right hidden sm:block">
            <span className="text-xs bg-amber-400 text-blue-950 px-2.5 py-0.5 rounded font-bold text-[11px] block shadow-xs">
              राजभाषा अनुभाग
            </span>
            <span className="text-[10px] text-blue-100 mt-1 block">
              प्रधान कार्यालय, 112 जे.सी. रोड, बेंगलूरु
            </span>
          </div>
        </div>

        {/* Report Main Title */}
        <div className="text-center my-4">
          <h2 className="text-2xl font-extrabold text-blue-950 tracking-wide border-b-2 border-blue-950 inline-block pb-1">
            राजभाषा तिमाही रिपोर्ट
          </h2>
        </div>

        {/* Office & Quarter Metadata Row */}
        <div className="flex justify-between items-center text-sm font-semibold mb-4 border-b border-slate-300 pb-2">
          <div>
            <span className="text-slate-600">अंचल / क्षेत्रीय कार्यालय : </span>
            <span className="text-blue-900 font-bold">{report.primaryOfficeName}</span>
            {report.circleOfficeName && (
              <span className="text-slate-500 text-xs ml-2">({report.circleOfficeName})</span>
            )}
          </div>
          <div>
            <span className="text-slate-600">तिमाही : </span>
            <span className="text-blue-900 font-bold">{report.quarter} ({report.financialYear})</span>
          </div>
        </div>

        {/* Table 1: Officer & Concurrent Charge Details */}
        <div className="mb-6">
          <table className="w-full border-collapse border border-slate-700 text-xs">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800">
                <th className="border border-slate-600 p-2 w-12 text-center">क्र. सं.</th>
                <th className="border border-slate-600 p-2 text-left">राजभाषा अधिकारी का नाम व कर्मचारी संख्या</th>
                <th className="border border-slate-600 p-2 text-left">अंचल/क्षेत्रीय कार्यालय एवं समवर्ती प्रभार कार्यालय</th>
                <th className="border border-slate-600 p-2 text-center w-36">अधीनस्थ कार्यालयों की संख्या</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-600 p-2 text-center font-medium">1.</td>
                <td className="border border-slate-600 p-2">
                  <div className="font-bold text-slate-900">{report.officerName}</div>
                  <div className="text-slate-600">कर्मचारी संख्या: {report.officerStaffNo} | {report.officerDesignation}</div>
                </td>
                <td className="border border-slate-600 p-2">
                  <div className="font-semibold text-blue-950">मूल कार्यालय: {report.primaryOfficeName}</div>
                  {report.concurrentOffices.length > 0 ? (
                    <div className="mt-1 text-slate-700">
                      <span className="font-medium text-amber-900">समवर्ती प्रभार: </span>
                      {report.concurrentOffices.join(', ')}
                    </div>
                  ) : (
                    <div className="text-slate-500 italic">कोई अतिरिक्त समवर्ती प्रभार नहीं</div>
                  )}
                </td>
                <td className="border border-slate-600 p-2 text-center font-bold text-slate-800">
                  {report.subordinateOfficesCount}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Translation Work Section (Specially requested by user) */}
        <div className="mb-6 bg-blue-50/40 p-3 border border-blue-300 rounded">
          <div className="font-bold text-sm text-blue-950 mb-2 pb-1 border-b border-blue-200 flex items-center justify-between">
            <span>अनुवाद कार्य विवरण (प्रधान कार्यालय एवं संबंधित कार्यालय)</span>
            <span className="text-[11px] font-normal text-blue-800 bg-blue-100 px-2 py-0.5 rounded">विशेष स्तम्भ</span>
          </div>
          <table className="w-full border-collapse border border-slate-700 text-xs bg-white">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800 text-center">
                <th className="border border-slate-600 p-2">प्रधान कार्यालय से प्राप्त पृष्ठ</th>
                <th className="border border-slate-600 p-2">प्राप्ति की तिथि</th>
                <th className="border border-slate-600 p-2">हिंदी में अनूदित पृष्ठ</th>
                <th className="border border-slate-600 p-2">प्रेषण की तारीख</th>
                <th className="border border-slate-600 p-2">शेष / लंबित पृष्ठ</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-center font-medium">
                <td className="border border-slate-600 p-2 font-bold text-blue-900">{report.translation?.pagesReceivedFromHO || 0}</td>
                <td className="border border-slate-600 p-2">{report.translation?.receivedDate || '-'}</td>
                <td className="border border-slate-600 p-2 font-bold text-emerald-700">{report.translation?.pagesTranslatedInHindi || 0}</td>
                <td className="border border-slate-600 p-2">{report.translation?.sentDate || '-'}</td>
                <td className="border border-slate-600 p-2 font-bold text-amber-700">{report.translation?.pendingPages || 0}</td>
              </tr>
            </tbody>
          </table>
          {report.translation?.remarks && (
            <p className="text-[11px] text-slate-600 mt-1 italic">
              <strong>टिप्पणी:</strong> {report.translation.remarks}
            </p>
          )}
        </div>

        {/* Branch Visit Tracking (Specially requested by user: RO व Concurrent RO की शाखा भ्रमण, तारीख, समीक्षा पत्र) */}
        <div className="mb-6 bg-slate-50 p-3 border border-slate-400 rounded">
          <div className="font-bold text-sm text-blue-950 mb-2 pb-1 border-b border-slate-300 flex items-center justify-between">
            <span>शाखा निरीक्षण / राजभाषा भ्रमण विवरण (मूल क्षेत्रीय कार्यालय एवं समवर्ती प्रभार कार्यालय)</span>
            <span className="text-[11px] font-medium text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
              कुल विज़िट: {report.branchVisits?.length || 0}
            </span>
          </div>
          <table className="w-full border-collapse border border-slate-700 text-xs bg-white">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800 text-center">
                <th className="border border-slate-600 p-2 w-10">क्र. सं.</th>
                <th className="border border-slate-600 p-2 text-left">क्षेत्रीय कार्यालय (मूल/समवर्ती)</th>
                <th className="border border-slate-600 p-2 text-left">विज़िट की गई शाखा का नाम / डीपी कोड</th>
                <th className="border border-slate-600 p-2">विज़िट की तिथि</th>
                <th className="border border-slate-600 p-2">समीक्षा पत्र प्रेषण तिथि</th>
                <th className="border border-slate-600 p-2 text-left">मुख्य निष्कर्ष / अनुपालन</th>
              </tr>
            </thead>
            <tbody>
              {report.branchVisits && report.branchVisits.length > 0 ? (
                report.branchVisits.map((bv, idx) => (
                  <tr key={bv.id || idx}>
                    <td className="border border-slate-600 p-2 text-center">{idx + 1}.</td>
                    <td className="border border-slate-600 p-2 font-medium text-blue-950">{bv.regionalOfficeName}</td>
                    <td className="border border-slate-600 p-2 font-semibold">{bv.branchCodeOrName}</td>
                    <td className="border border-slate-600 p-2 text-center">{bv.visitDate || '-'}</td>
                    <td className="border border-slate-600 p-2 text-center">{bv.reviewLetterDate || '-'}</td>
                    <td className="border border-slate-600 p-2 text-slate-700">{bv.keyObservations || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="border border-slate-600 p-2 text-center text-slate-500 italic">
                    इस तिमाही में शाखा विज़िट का विवरण दर्ज नहीं है।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table 2: OLIC Meeting */}
        <div className="mb-6">
          <div className="font-bold text-sm text-center text-slate-900 mb-1">
            राजभाषा कार्यान्वयन समिति की बैठक (तिमाही)
          </div>
          <table className="w-full border-collapse border border-slate-700 text-xs">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800 text-center">
                <th className="border border-slate-600 p-2 w-12">क्रम सं.</th>
                <th className="border border-slate-600 p-2 text-left">कार्यालय का नाम</th>
                <th className="border border-slate-600 p-2">बैठक आयोजन की तिथि</th>
                <th className="border border-slate-600 p-2">रिपोर्ट प्राप्ति की तिथि</th>
                <th className="border border-slate-600 p-2">समीक्षा की तिथि</th>
              </tr>
            </thead>
            <tbody>
              {report.olicMeetings.length > 0 ? (
                report.olicMeetings.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="border border-slate-600 p-2 text-center">{idx + 1}.</td>
                    <td className="border border-slate-600 p-2 font-medium">{row.officeName}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.meetingDate || '-'}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.reportReceivedDate || '-'}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.reviewDate || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="border border-slate-600 p-2 text-center text-slate-500 italic">विवरण उपलब्ध नहीं</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table 3: Hindi Workshop */}
        <div className="mb-6">
          <div className="font-bold text-sm text-center text-slate-900 mb-1">
            हिंदी कार्यशाला (तिमाही)
          </div>
          <table className="w-full border-collapse border border-slate-700 text-xs">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800 text-center">
                <th className="border border-slate-600 p-2 w-12">क्रम सं.</th>
                <th className="border border-slate-600 p-2 text-left">कार्यालय का नाम</th>
                <th className="border border-slate-600 p-2">कार्यशाला की तारीख</th>
                <th className="border border-slate-600 p-2">उपस्थित प्रतिभागियों की संख्या</th>
                <th className="border border-slate-600 p-2 text-left">विषय / टिप्पणी</th>
              </tr>
            </thead>
            <tbody>
              {report.workshops.length > 0 ? (
                report.workshops.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="border border-slate-600 p-2 text-center">{idx + 1}.</td>
                    <td className="border border-slate-600 p-2 font-medium">{row.officeName}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.workshopDate || '-'}</td>
                    <td className="border border-slate-600 p-2 text-center font-bold">{row.participantsCount || 0}</td>
                    <td className="border border-slate-600 p-2">{row.topic || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="border border-slate-600 p-2 text-center text-slate-500 italic">विवरण उपलब्ध नहीं</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table 4: Regional Report Submission */}
        <div className="mb-6">
          <div className="font-bold text-sm text-center text-slate-900 mb-1">
            क्षेत्रीय कार्यान्वयन कार्यालय को प्रेषित रिपोर्ट (तिमाही)
          </div>
          <table className="w-full border-collapse border border-slate-700 text-xs">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800 text-center">
                <th className="border border-slate-600 p-2 w-12">क्रम सं.</th>
                <th className="border border-slate-600 p-2 text-left">कार्यालय का नाम</th>
                <th className="border border-slate-600 p-2">ऑनलाइन प्रस्तुति दिनांक</th>
                <th className="border border-slate-600 p-2">रिपोर्ट नियंत्रण कार्यालय को प्रेषण की तारीख</th>
              </tr>
            </thead>
            <tbody>
              {report.regionalReports.length > 0 ? (
                report.regionalReports.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="border border-slate-600 p-2 text-center">{idx + 1}.</td>
                    <td className="border border-slate-600 p-2 font-medium">{row.officeName}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.onlineSubmissionDate || '-'}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.controllingOfficeSentDate || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="border border-slate-600 p-2 text-center text-slate-500 italic">विवरण उपलब्ध नहीं</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table 5: STR-18 Review */}
        <div className="mb-6">
          <div className="font-bold text-sm text-center text-slate-900 mb-1">
            क्षेत्राधीन सभी शाखाओं/ क्षेत्रीय कार्यालयों की एस टी आर -18 की समीक्षा (तिमाही)
          </div>
          <table className="w-full border-collapse border border-slate-700 text-xs">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800 text-center">
                <th className="border border-slate-600 p-2 w-12">क्रम सं.</th>
                <th className="border border-slate-600 p-2 text-left">कार्यालय का नाम</th>
                <th className="border border-slate-600 p-2">समीक्षा दिनांक</th>
                <th className="border border-slate-600 p-2">संबंधित शाखा को समीक्षा पत्र का प्रेषण</th>
              </tr>
            </thead>
            <tbody>
              {report.str18Reviews.length > 0 ? (
                report.str18Reviews.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="border border-slate-600 p-2 text-center">{idx + 1}.</td>
                    <td className="border border-slate-600 p-2 font-medium">{row.officeName}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.reviewDate || '-'}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.letterSentDate || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="border border-slate-600 p-2 text-center text-slate-500 italic">विवरण उपलब्ध नहीं</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table 6: STR-18 Submission */}
        <div className="mb-6">
          <div className="font-bold text-sm text-center text-slate-900 mb-1">
            नियंत्रण कार्यालय को हस्ताक्षरित एस टी आर -18 की प्रस्तुति (तिमाही)
          </div>
          <table className="w-full border-collapse border border-slate-700 text-xs">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800 text-center">
                <th className="border border-slate-600 p-2 w-12">क्रम सं.</th>
                <th className="border border-slate-600 p-2 text-left">कार्यालय का नाम</th>
                <th className="border border-slate-600 p-2">प्रस्तुति दिनांक</th>
              </tr>
            </thead>
            <tbody>
              {report.str18Submissions.length > 0 ? (
                report.str18Submissions.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="border border-slate-600 p-2 text-center">{idx + 1}.</td>
                    <td className="border border-slate-600 p-2 font-medium">{row.officeName}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.submissionDate || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="border border-slate-600 p-2 text-center text-slate-500 italic">विवरण उपलब्ध नहीं</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table 7, 8, 9: Events (Paricharcha, Seminar, Representative Meeting) */}
        <div className="mb-6">
          <div className="font-bold text-sm text-center text-slate-900 mb-1">
            हिंदी परिचर्चा (तिमाही)
          </div>
          <table className="w-full border-collapse border border-slate-700 text-xs mb-4">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800 text-center">
                <th className="border border-slate-600 p-2 w-12">क्रम सं.</th>
                <th className="border border-slate-600 p-2 text-left">कार्यालय का नाम</th>
                <th className="border border-slate-600 p-2">आयोजन की तारीख</th>
                <th className="border border-slate-600 p-2">रिपोर्ट प्रेषण की तारीख</th>
                <th className="border border-slate-600 p-2">केननेट में रिपोर्ट अपलोड करने की तारीख</th>
              </tr>
            </thead>
            <tbody>
              {report.paricharchas.length > 0 ? (
                report.paricharchas.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="border border-slate-600 p-2 text-center">{idx + 1}.</td>
                    <td className="border border-slate-600 p-2 font-medium">{row.officeName}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.eventDate || '-'}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.reportSentDate || '-'}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.cannetUploadDate || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="border border-slate-600 p-2 text-center text-slate-500 italic">विवरण उपलब्ध नहीं</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="font-bold text-sm text-center text-slate-900 mb-1">
            हिंदी संगोष्ठी (वार्षिक)
          </div>
          <table className="w-full border-collapse border border-slate-700 text-xs mb-4">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800 text-center">
                <th className="border border-slate-600 p-2 w-12">क्रम सं.</th>
                <th className="border border-slate-600 p-2 text-left">कार्यालय का नाम</th>
                <th className="border border-slate-600 p-2">आयोजन की तारीख</th>
                <th className="border border-slate-600 p-2">रिपोर्ट प्रेषण की तारीख</th>
                <th className="border border-slate-600 p-2">केननेट में रिपोर्ट अपलोड करने की तारीख</th>
              </tr>
            </thead>
            <tbody>
              {report.seminars.length > 0 ? (
                report.seminars.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="border border-slate-600 p-2 text-center">{idx + 1}.</td>
                    <td className="border border-slate-600 p-2 font-medium">{row.officeName}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.eventDate || '-'}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.reportSentDate || '-'}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.cannetUploadDate || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="border border-slate-600 p-2 text-center text-slate-500 italic">लागू नहीं / वार्षिक आयोजन लंबित</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="font-bold text-sm text-center text-slate-900 mb-1">
            राजभाषा प्रतिनिधि बैठक (वार्षिक)
          </div>
          <table className="w-full border-collapse border border-slate-700 text-xs">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800 text-center">
                <th className="border border-slate-600 p-2 w-12">क्रम सं.</th>
                <th className="border border-slate-600 p-2 text-left">कार्यालय का नाम</th>
                <th className="border border-slate-600 p-2">आयोजन की तारीख</th>
                <th className="border border-slate-600 p-2">रिपोर्ट प्रेषण की तारीख</th>
                <th className="border border-slate-600 p-2">केननेट में रिपोर्ट अपलोड करने की तारीख</th>
              </tr>
            </thead>
            <tbody>
              {report.representativeMeetings.length > 0 ? (
                report.representativeMeetings.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="border border-slate-600 p-2 text-center">{idx + 1}.</td>
                    <td className="border border-slate-600 p-2 font-medium">{row.officeName}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.eventDate || '-'}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.reportSentDate || '-'}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.cannetUploadDate || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="border border-slate-600 p-2 text-center text-slate-500 italic">विवरण उपलब्ध नहीं</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table 10: Magazines */}
        <div className="mb-6">
          <div className="font-bold text-sm text-center text-slate-900 mb-1">
            हिंदी में जारी पत्रिका/ई पत्रिका/बुलेटिन (छमाही)
          </div>
          <table className="w-full border-collapse border border-slate-700 text-xs">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800 text-center">
                <th className="border border-slate-600 p-2 w-12">क्रम सं.</th>
                <th className="border border-slate-600 p-2 text-left">कार्यालय का नाम</th>
                <th className="border border-slate-600 p-2 text-left">पत्रिका/ई पत्रिका/बुलेटिन का नाम</th>
                <th className="border border-slate-600 p-2">कुल पृष्ठों की संख्या</th>
                <th className="border border-slate-600 p-2">विमोचन की तारीख</th>
                <th className="border border-slate-600 p-2">प्र.का. को प्रेषित करने की तारीख</th>
              </tr>
            </thead>
            <tbody>
              {report.magazines.length > 0 ? (
                report.magazines.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="border border-slate-600 p-2 text-center">{idx + 1}.</td>
                    <td className="border border-slate-600 p-2 font-medium">{row.officeName}</td>
                    <td className="border border-slate-600 p-2 font-bold">{row.magazineName}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.totalPages}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.releaseDate || '-'}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.hoSentDate || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="border border-slate-600 p-2 text-center text-slate-500 italic">विवरण उपलब्ध नहीं</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table 11: House Journals */}
        <div className="mb-6">
          <div className="font-bold text-sm text-center text-slate-900 mb-1">
            केनराज्योति व श्रेयस पत्रिकाओं के लिए प्रविष्टियां (तिमाही)
          </div>
          <table className="w-full border-collapse border border-slate-700 text-xs">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800 text-center">
                <th className="border border-slate-600 p-2 w-12">क्रम सं.</th>
                <th className="border border-slate-600 p-2 text-left">कार्यालय का नाम</th>
                <th className="border border-slate-600 p-2">कर्मचारियों से प्राप्त प्रविष्टियां प्रेषित करने की तारीख</th>
                <th className="border border-slate-600 p-2">अंचल व क्षे.का. की गतिविधियों की रिपोर्ट प्रेषित करने की तारीख</th>
              </tr>
            </thead>
            <tbody>
              {report.houseJournals.length > 0 ? (
                report.houseJournals.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="border border-slate-600 p-2 text-center">{idx + 1}.</td>
                    <td className="border border-slate-600 p-2 font-medium">{row.officeName}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.staffEntriesSentDate || '-'}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.activityReportSentDate || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="border border-slate-600 p-2 text-center text-slate-500 italic">विवरण उपलब्ध नहीं</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table 12: TOLIC Member */}
        <div className="mb-6">
          <div className="font-bold text-sm text-center text-slate-900 mb-1">
            नगर राजभाषा कार्यान्वयन समिति (जहां बैंक सदस्य है)
          </div>
          <table className="w-full border-collapse border border-slate-700 text-xs">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800 text-center">
                <th className="border border-slate-600 p-2 w-12">क्रम सं.</th>
                <th className="border border-slate-600 p-2 text-left">कार्यालय का नाम</th>
                <th className="border border-slate-600 p-2 text-left">अधिकार क्षेत्र की नराकास का नाम</th>
                <th className="border border-slate-600 p-2">छमाही रिपोर्ट प्रस्तुत करने की तारीख</th>
                <th className="border border-slate-600 p-2">नराकास बैठक आयोजन की तिथि</th>
                <th className="border border-slate-600 p-2 text-left">बैठक में उपस्थित कार्यालय प्रमुख का नाम व पदनाम</th>
              </tr>
            </thead>
            <tbody>
              {report.tolicMembers.length > 0 ? (
                report.tolicMembers.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="border border-slate-600 p-2 text-center">{idx + 1}.</td>
                    <td className="border border-slate-600 p-2 font-medium">{row.officeName}</td>
                    <td className="border border-slate-600 p-2">{row.tolicName}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.halfYearlyReportDate || '-'}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.meetingDate || '-'}</td>
                    <td className="border border-slate-600 p-2">{row.headAttendedName || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="border border-slate-600 p-2 text-center text-slate-500 italic">विवरण उपलब्ध नहीं</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table 13: TOLIC Convener */}
        <div className="mb-6">
          <div className="font-bold text-sm text-center text-slate-900 mb-1">
            नगर राजभाषा कार्यान्वयन समिति (जहां बैंक संयोजक है)
          </div>
          <table className="w-full border-collapse border border-slate-700 text-xs">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800 text-center">
                <th className="border border-slate-600 p-2 w-12">क्रम सं.</th>
                <th className="border border-slate-600 p-2 text-left">कार्यालय का नाम</th>
                <th className="border border-slate-600 p-2 text-left">नराकास का नाम</th>
                <th className="border border-slate-600 p-2">राजभाषा विभाग द्वारा बैठक आयोजन का निर्धारित कैलेंडर माह</th>
                <th className="border border-slate-600 p-2">बैठक आयोजन की तिथि</th>
                <th className="border border-slate-600 p-2 text-left">बैठक में उपस्थित कार्यालय प्रमुख का नाम व पदनाम</th>
                <th className="border border-slate-600 p-2">सदस्य कार्यालयों की कुल संख्या</th>
                <th className="border border-slate-600 p-2">उपस्थित कार्यालयों की कुल संख्या</th>
              </tr>
            </thead>
            <tbody>
              {report.tolicConveners.length > 0 ? (
                report.tolicConveners.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="border border-slate-600 p-2 text-center">{idx + 1}.</td>
                    <td className="border border-slate-600 p-2 font-medium">{row.officeName}</td>
                    <td className="border border-slate-600 p-2">{row.tolicName}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.targetCalendarMonth || '-'}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.meetingDate || '-'}</td>
                    <td className="border border-slate-600 p-2">{row.headAttendedName || '-'}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.totalMemberOffices || 0}</td>
                    <td className="border border-slate-600 p-2 text-center">{row.attendedMemberOffices || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="border border-slate-600 p-2 text-center text-slate-500 italic">बैंक संयोजक नहीं है / इस तिमाही में बैठक नहीं हुई</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Section 14: Innovative Works */}
        <div className="mb-6 border border-slate-600 p-3">
          <div className="font-bold text-xs text-slate-900 mb-2">
            अंचल व क्षेत्रीय कार्यालयों द्वारा तिमाही के दौरान किए गए नवोन्मेषी कार्य :
          </div>
          {report.innovativeWorks.length > 0 ? (
            <ol className="list-decimal pl-5 text-xs space-y-1 text-slate-800">
              {report.innovativeWorks.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-slate-500 italic">कोई विशेष विवरण दर्ज नहीं किया गया है।</p>
          )}
        </div>

        {/* Section 15: Special Awards */}
        <div className="mb-6 border border-slate-600 p-3">
          <div className="font-bold text-xs text-slate-900 mb-2">
            अंचल व क्षेत्रीय कार्यालयों को प्राप्त विशेष पुरस्कार :
          </div>
          {report.specialAwards.length > 0 ? (
            <ol className="list-decimal pl-5 text-xs space-y-1 text-slate-800">
              {report.specialAwards.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-slate-500 italic">कोई पुरस्कार प्राप्त नहीं।</p>
          )}
        </div>

        {/* Section 16: Custom Added Columns / Fields (Requested by user) */}
        {report.customFields && report.customFields.length > 0 && (
          <div className="mb-6 border border-slate-600 p-3 bg-amber-50/30">
            <div className="font-bold text-xs text-slate-900 mb-2 flex items-center justify-between">
              <span>अतिरिक्त विवरण एवं अन्य स्तंभ (Custom Fields / Details):</span>
            </div>
            <table className="w-full border-collapse border border-slate-700 text-xs bg-white">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-800 text-center">
                  <th className="border border-slate-600 p-2 w-12">क्र. सं.</th>
                  <th className="border border-slate-600 p-2 text-left">कॉलम / विषय शीर्षक</th>
                  <th className="border border-slate-600 p-2 text-left">प्रविष्टि / विवरण</th>
                  <th className="border border-slate-600 p-2 text-left">विशेष टिप्पणी</th>
                </tr>
              </thead>
              <tbody>
                {report.customFields.map((cf, idx) => (
                  <tr key={cf.id || idx}>
                    <td className="border border-slate-600 p-2 text-center">{idx + 1}.</td>
                    <td className="border border-slate-600 p-2 font-semibold text-slate-800">{cf.title}</td>
                    <td className="border border-slate-600 p-2">{cf.value}</td>
                    <td className="border border-slate-600 p-2 text-slate-600">{cf.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Signatures Row */}
        <div className="mt-14 pt-8 border-t border-slate-300 flex justify-between items-end text-xs">
          <div className="text-center w-64">
            <div className="border-b border-dotted border-slate-600 pb-2 mb-2 font-semibold text-slate-800 min-h-6">
              {report.officerSignatureName || `${report.officerName} (${report.officerDesignation})`}
            </div>
            <div className="font-bold text-slate-900">राजभाषा अधिकारी (प्रभारी) के हस्ताक्षर</div>
            <div className="text-[10px] text-slate-500 mt-0.5">दिनांक: {new Date(report.updatedAt).toLocaleDateString('hi-IN')}</div>
          </div>

          <div className="text-center w-64">
            <div className="border-b border-dotted border-slate-600 pb-2 mb-2 font-semibold text-slate-800 min-h-6">
              {report.officeHeadSignatureName || 'क्षेत्रीय प्रमुख / उप महाप्रबंधक'}
            </div>
            <div className="font-bold text-slate-900">कार्यालय प्रमुख के हस्ताक्षर</div>
            <div className="text-[10px] text-slate-500 mt-0.5">मुहर सहित</div>
          </div>
        </div>

        {/* Footer marking */}
        <div className="mt-8 text-center text-[10px] text-slate-400 print:text-slate-600">
          Internal — केनरा बैंक राजभाषा प्रबंधन सूचना प्रणाली
        </div>
      </div>
    </div>
  );
};
