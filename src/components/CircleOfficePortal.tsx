import React, { useState } from 'react';
import { Officer, QuarterlyReport } from '../types';
import { CIRCLE_OFFICES } from '../data/seedData';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  Download, 
  Eye, 
  Send, 
  FileSpreadsheet, 
  Languages, 
  MapPin, 
  Search,
  ExternalLink,
  ChevronRight,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { exportCircleConsolidatedToExcel } from '../utils/excelExport';
import { AuthUser } from '../utils/auth';

interface Props {
  selectedCircleCode: string;
  onSelectCircleCode: (code: string) => void;
  circleOffices: { code: string; name: string }[];
  officers: Officer[];
  reports: QuarterlyReport[];
  selectedQuarter: string;
  onUpdateReportStatus: (reportId: string, status: QuarterlyReport['status'], feedback?: string) => void;
  onViewPrintable: (report: QuarterlyReport) => void;
  currentUser?: AuthUser | null;
}

export const CircleOfficePortal: React.FC<Props> = ({
  selectedCircleCode,
  onSelectCircleCode,
  circleOffices,
  officers,
  reports,
  selectedQuarter,
  onUpdateReportStatus,
  onViewPrintable,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [forwardSuccess, setForwardSuccess] = useState(false);
  const [reviewModalReport, setReviewModalReport] = useState<QuarterlyReport | null>(null);
  const [coFeedback, setCoFeedback] = useState('');

  const currentCircle = circleOffices.find((c) => c.code === selectedCircleCode) || circleOffices[0];

  // Officers belonging to this Circle Office
  const circleOfficers = officers.filter(
    (o) => o.circleOfficeCode === currentCircle.code
  );

  // Reports for this Circle Office for selected quarter
  const circleReports = reports.filter(
    (r) => r.circleOfficeCode === currentCircle.code && r.quarter === selectedQuarter
  );

  // Filtered officers
  const filteredOfficers = circleOfficers.filter((o) => {
    const q = searchTerm.toLowerCase();
    return (
      o.name.toLowerCase().includes(q) ||
      o.staffNo.includes(q) ||
      o.primaryOfficeName.toLowerCase().includes(q)
    );
  });

  // Aggregated KPIs for this Circle Office
  const totalOfficersCount = circleOfficers.length;
  const submittedReportsCount = circleReports.filter(
    (r) => r.status !== 'ड्राफ्ट (Draft)'
  ).length;
  const approvedReportsCount = circleReports.filter(
    (r) => r.status.includes('स्वीकृत') || r.status.includes('प्रेषित')
  ).length;

  const totalPagesReceivedHO = circleReports.reduce(
    (acc, r) => acc + (Number(r.translation?.pagesReceivedFromHO) || 0),
    0
  );
  const totalPagesTranslated = circleReports.reduce(
    (acc, r) => acc + (Number(r.translation?.pagesTranslatedInHindi) || 0),
    0
  );
  const totalBranchVisits = circleReports.reduce(
    (acc, r) => acc + (r.branchVisits?.length || 0),
    0
  );

  // Bulk Forward to Head Office
  const handleForwardToHO = () => {
    circleReports.forEach((r) => {
      onUpdateReportStatus(r.id, 'प्रधान कार्यालय को प्रेषित (Forwarded to HO)');
    });
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
    setForwardSuccess(true);
    setTimeout(() => setForwardSuccess(false), 4000);
  };

  const handleApprove = (report: QuarterlyReport) => {
    onUpdateReportStatus(
      report.id,
      'अंचल द्वारा स्वीकृत (Approved by CO)',
      coFeedback || 'अंचल कार्यालय द्वारा सम्यक समीक्षा उपरांत स्वीकृत।'
    );
    setReviewModalReport(null);
    setCoFeedback('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Circle Office Selector Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{currentCircle.name}</h2>
                <span className="text-xs bg-indigo-100 text-indigo-800 font-mono px-2 py-0.5 rounded font-bold">
                  कोड: {currentCircle.code}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                अंचल क्षेत्राधीन क्षेत्रीय कार्यालयों व राजभाषा अधिकारियों का डेटा समेकन एवं समीक्षा
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(!currentUser || currentUser.role === 'ho' || currentUser.role === 'admin') ? (
              <>
                <label className="text-xs font-semibold text-slate-700">अंचल कार्यालय बदलें:</label>
                <select
                  value={selectedCircleCode}
                  onChange={(e) => onSelectCircleCode(e.target.value)}
                  className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-blue-950 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {circleOffices.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <span className="text-xs bg-indigo-50 text-indigo-900 border border-indigo-200 px-3 py-1.5 rounded-lg font-bold">
                🔒 अधिकृत अंचल: {currentCircle.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Officers and Submission */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>संबद्ध राजभाषा अधिकारी</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{totalOfficersCount}</span>
            <span className="text-xs text-slate-500">अधिकारी</span>
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            {submittedReportsCount} रिपोर्ट प्राप्त ({Math.round((submittedReportsCount / Math.max(1, totalOfficersCount)) * 100)}%)
          </div>
        </div>

        {/* Translation Work */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>अंचल अनुवाद कार्य</span>
            <Languages className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-900">{totalPagesTranslated}</span>
            <span className="text-xs text-slate-500">/ {totalPagesReceivedHO} पृष्ठ</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            लंबित: {Math.max(0, totalPagesReceivedHO - totalPagesTranslated)} पृष्ठ
          </div>
        </div>

        {/* Branch Visits */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>कुल शाखा निरीक्षण / भ्रमण</span>
            <MapPin className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-800">{totalBranchVisits}</span>
            <span className="text-xs text-slate-500">शाखाएं विज़िट</span>
          </div>
          <div className="text-[11px] text-slate-600 mt-1">
            मूल व समवर्ती क्षेत्रीय कार्यालय
          </div>
        </div>

        {/* Status of Consolidation */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>अंचल स्तर समेकन स्थिति</span>
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold text-slate-800">
              {approvedReportsCount === totalOfficersCount && totalOfficersCount > 0
                ? 'पूर्ण समेकित ✓'
                : `${approvedReportsCount}/${totalOfficersCount} स्वीकृत`}
            </span>
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium">
            {totalOfficersCount - submittedReportsCount} अधिकारियों से रिपोर्ट प्रतीक्षित
          </div>
        </div>
      </div>

      {/* Main Consolidation Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-slate-800">
              अंचल क्षेत्राधीन अधिकारी व रिपोर्ट समेकन तालिका ({selectedQuarter})
            </h3>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
              कुल {circleOfficers.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="अधिकारी नाम / RO खोजें..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs w-48 focus:w-60 transition-all outline-none"
              />
            </div>

            {/* Export Consolidated Excel */}
            <button
              onClick={() => exportCircleConsolidatedToExcel(currentCircle.name, circleReports, circleOfficers)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>अंचल समेकित एक्सेल (.xlsx)</span>
            </button>

            {/* Forward to HO Button */}
            <button
              onClick={handleForwardToHO}
              className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>प्रधान कार्यालय (HO) को अग्रसारित करें</span>
            </button>
          </div>
        </div>

        {/* Forward Success Notification */}
        {forwardSuccess && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              {currentCircle.name} की सभी समेकित रिपोर्टें सफलतापूर्वक प्रधान कार्यालय (राजभाषा अनुभाग) को अग्रसारित कर दी गई हैं!
            </span>
          </div>
        )}

        {/* Officers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[11px] font-bold border-b border-slate-300">
              <tr>
                <th className="p-3 w-10 text-center">क्र.</th>
                <th className="p-3 w-48">राजभाषा अधिकारी</th>
                <th className="p-3 w-56">मूल व समवर्ती कार्यालय</th>
                <th className="p-3 w-32">स्थिति (Status)</th>
                <th className="p-3 w-44">अनुवाद कार्य (HO प्राप्त / अनूदित)</th>
                <th className="p-3 w-28 text-center">शाखा विज़िट</th>
                <th className="p-3 w-32">अंतिम अद्यतन</th>
                <th className="p-3 w-36 text-center">कार्रवाई (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOfficers.map((off, idx) => {
                const rep = circleReports.find((r) => r.officerStaffNo === off.staffNo);
                const hasReport = !!rep;
                const status = rep?.status || 'प्रतीक्षित / लंबित';

                return (
                  <tr key={off.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 text-center font-bold text-slate-400">{idx + 1}.</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{off.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {off.staffNo} • {off.designation}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-blue-950">{off.primaryOfficeName}</div>
                      {off.concurrentOffices.length > 0 && (
                        <div className="text-[11px] text-amber-800 mt-0.5">
                          समवर्ती: {off.concurrentOffices.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          status.includes('स्वीकृत')
                            ? 'bg-emerald-100 text-emerald-800'
                            : status.includes('प्रेषित')
                            ? 'bg-indigo-100 text-indigo-800'
                            : status.includes('प्रस्तुत')
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="p-3">
                      {rep ? (
                        <div>
                          <div className="font-bold text-slate-800">
                            {rep.translation?.pagesTranslatedInHindi || 0} / {rep.translation?.pagesReceivedFromHO || 0} पृष्ठ
                          </div>
                          <div className="text-[10px] text-slate-500">
                            लंबित: {rep.translation?.pendingPages || 0} | प्रेषण:{' '}
                            {rep.translation?.sentDate || '-'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {rep ? (
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {rep.branchVisits?.length || 0} विज़िट
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600 text-[11px]">
                      {rep?.updatedAt ? new Date(rep.updatedAt).toLocaleDateString('hi-IN') : '-'}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {rep ? (
                          <>
                            <button
                              onClick={() => onViewPrintable(rep)}
                              className="p-1.5 text-blue-700 hover:bg-blue-50 rounded"
                              title="रिपोर्ट देखें / प्रिंट करें"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setReviewModalReport(rep)}
                              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[11px] font-bold"
                            >
                              समीक्षा / स्वीकृत
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-amber-700 italic">रिपोर्ट प्रतीक्षित</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Approve Modal */}
      {reviewModalReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">
                अंचल कार्यालय समीक्षा: {reviewModalReport.officerName}
              </h3>
              <button
                onClick={() => setReviewModalReport(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg space-y-1">
                <div>
                  <strong>कार्यालय:</strong> {reviewModalReport.primaryOfficeName}
                </div>
                <div>
                  <strong>समवर्ती प्रभार:</strong>{' '}
                  {reviewModalReport.concurrentOffices.join(', ') || 'कोई नहीं'}
                </div>
                <div>
                  <strong>अनुवाद स्थिति:</strong>{' '}
                  {reviewModalReport.translation?.pagesTranslatedInHindi} पृष्ठ अनूदित (लंबित:{' '}
                  {reviewModalReport.translation?.pendingPages})
                </div>
                <div>
                  <strong>शाखा निरीक्षण:</strong> {reviewModalReport.branchVisits?.length || 0} शाखाएं विज़िट
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  अंचल कार्यालय की समीक्षा टिप्पणी / फीडबैक (CO Remarks):
                </label>
                <textarea
                  rows={3}
                  value={coFeedback}
                  onChange={(e) => setCoFeedback(e.target.value)}
                  placeholder="उदा. रिपोर्ट की जांच कर ली गई है, सभी आंकड़े संतोषजनक हैं..."
                  className="w-full p-2.5 bg-slate-50 border rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t flex items-center justify-end gap-2">
              <button
                onClick={() => setReviewModalReport(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                रद्द करें
              </button>
              <button
                onClick={() => handleApprove(reviewModalReport)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>रिपोर्ट स्वीकृत करें (Approve Report)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
