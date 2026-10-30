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
  ChevronDown,
  ChevronUp,
  Printer,
  FileText,
  BookOpen,
  Award,
  Sparkles,
  Layers,
  Calendar,
  FileCheck2
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
  onEditOfficerReport?: (officer: Officer) => void;
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
  onEditOfficerReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [forwardSuccess, setForwardSuccess] = useState(false);
  const [reviewModalReport, setReviewModalReport] = useState<QuarterlyReport | null>(null);
  const [coFeedback, setCoFeedback] = useState('');
  const [tableViewMode, setTableViewMode] = useState<'all' | 'publications' | 'essential'>('all');
  const [expandedOfficerStaffNo, setExpandedOfficerStaffNo] = useState<string | null>(null);

  const currentCircle = circleOffices.find((c) => c.code === selectedCircleCode) || circleOffices[0];

  // Officers belonging to this Circle Office
  const circleOfficers = officers.filter(
    (o) => o.circleOfficeCode === currentCircle.code
  );

  // Reports for this Circle Office for selected quarter
  const circleReports = reports.filter(
    (r) => r.circleOfficeCode === currentCircle.code && r.quarter === selectedQuarter
  );

  // Circle Office In-charge / CO Officer Profile
  const coOfficer =
    circleOfficers.find(
      (o) => o.primaryOfficeType === 'CO' || o.staffNo === currentUser?.staffNo
    ) || circleOfficers[0];
  const coReport = coOfficer
    ? circleReports.find((r) => r.officerStaffNo === coOfficer.staffNo)
    : null;

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

      {/* Circle Office In-charge Personal Report Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-xl p-4 shadow-sm border border-blue-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-black shrink-0 shadow">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-amber-300">
                1. मेरी अंचल कार्यालय रिपोर्ट (CO & समवर्ती ROs)
              </span>
              <span className="text-[10px] bg-indigo-500/40 text-blue-100 border border-indigo-400/40 px-2 py-0.5 rounded font-mono">
                {coOfficer ? `${coOfficer.name} (${coOfficer.staffNo})` : currentCircle.name}
              </span>
              {coOfficer?.concurrentOffices && coOfficer.concurrentOffices.length > 0 && (
                <span className="text-[10px] bg-amber-400/20 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded">
                  समवर्ती RO: {coOfficer.concurrentOffices.join(', ')}
                </span>
              )}
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              अंचल कार्यालय व आवंटित समवर्ती RO की तिमाही रिपोर्ट (अनुवाद, बैठकें, शाखा भ्रमण, पत्रिका आदि) यहाँ भरें।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end shrink-0 flex-wrap">
          <span
            className={`text-xs px-2.5 py-1 rounded-md font-bold border ${
              coReport?.status?.includes('स्वीकृत')
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : coReport?.status
                ? 'bg-blue-500/20 text-blue-200 border-blue-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            स्थिति: {coReport?.status || 'ड्राफ्ट (प्रतीक्षित)'}
          </span>

          {onEditOfficerReport && coOfficer && (
            <button
              type="button"
              onClick={() => onEditOfficerReport(coOfficer)}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>अपनी रिपोर्ट भरें / संपादित करें</span>
            </button>
          )}
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

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Filters */}
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setTableViewMode('all')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  tableViewMode === 'all'
                    ? 'bg-blue-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="सभी 15 तालिकाओं व स्तम्भों का विस्तृत दृश्य"
              >
                समस्त आधिकारिक स्तम्भ (तालिका 1-15)
              </button>
              <button
                type="button"
                onClick={() => setTableViewMode('publications')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  tableViewMode === 'publications'
                    ? 'bg-blue-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="पत्रिकाएं, नराकास, नवोन्मेषी कार्य व पुरस्कार स्तम्भ"
              >
                पत्रिकाएं, नराकास व पुरस्कार स्तम्भ
              </button>
              <button
                type="button"
                onClick={() => setTableViewMode('essential')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                  tableViewMode === 'essential'
                    ? 'bg-blue-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                संक्षिप्त सारांश
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="अधिकारी / RO खोजें..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs w-40 focus:w-52 transition-all outline-none"
              />
            </div>

            {/* Export Consolidated Excel */}
            <button
              onClick={() => exportCircleConsolidatedToExcel(currentCircle.name, circleReports, circleOfficers)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              title="सभी 15 तालिकाओं सहित पूर्ण एक्सेल एक्सपोर्ट"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>समेकित एक्सेल (.xlsx)</span>
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

        {/* Officers Table with all requested official columns */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[900px]">
            <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider text-[11px] font-bold border-b border-slate-300">
              <tr>
                <th className="p-3 w-10 text-center">क्र.</th>
                <th className="p-3 min-w-[190px]">राजभाषा अधिकारी</th>
                <th className="p-3 min-w-[180px]">मूल व समवर्ती कार्यालय</th>
                <th className="p-3 min-w-[120px]">स्थिति (Status)</th>

                {tableViewMode !== 'publications' && (
                  <>
                    <th className="p-3 min-w-[160px]">अनुवाद कार्य (HO प्राप्त / अनूदित)</th>
                    <th className="p-3 min-w-[100px] text-center">शाखा विज़िट</th>
                  </>
                )}

                {(tableViewMode === 'all' || tableViewMode === 'publications') && (
                  <>
                    <th className="p-3 min-w-[220px] bg-indigo-50/60 text-indigo-950 border-x border-slate-200">
                      हिंदी में जारी पत्रिका/ई पत्रिका/बुलेटिन(छमाही)
                    </th>
                    <th className="p-3 min-w-[210px] bg-indigo-50/60 text-indigo-950 border-r border-slate-200">
                      केनराज्योति व श्रेयस पत्रिकाओं के लिए प्रविष्टियां(तिमाही)
                    </th>
                    <th className="p-3 min-w-[220px] bg-amber-50/60 text-amber-950 border-r border-slate-200">
                      नगर राजभाषा कार्यान्वयन समिति(जहां बैंक सदस्य है)
                    </th>
                    <th className="p-3 min-w-[230px] bg-amber-50/60 text-amber-950 border-r border-slate-200">
                      नगर राजभाषा कार्यान्वयन समिति(जहां बैंक संयोजक है)
                    </th>
                    <th className="p-3 min-w-[220px] bg-teal-50/60 text-teal-950 border-r border-slate-200">
                      अंचल व क्षेत्रीय कार्यालयों द्वारा तिमाही के दौरान किए गए नवोन्मेषी कार्य :
                    </th>
                    <th className="p-3 min-w-[220px] bg-amber-50/60 text-amber-950 border-r border-slate-200">
                      अंचल व क्षेत्रीय कार्यालयों को प्राप्त विशेष पुरस्कार :
                    </th>
                  </>
                )}

                <th className="p-3 min-w-[100px]">अंतिम अद्यतन</th>
                <th className="p-3 min-w-[150px] text-center sticky right-0 bg-slate-100 shadow-xs">कार्रवाई (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredOfficers.map((off, idx) => {
                const rep = circleReports.find((r) => r.officerStaffNo === off.staffNo);
                const hasReport = !!rep;
                const status = rep?.status || 'प्रतीक्षित / लंबित';
                const isExpanded = expandedOfficerStaffNo === off.staffNo;

                return (
                  <React.Fragment key={off.id}>
                    <tr className={`hover:bg-slate-50 transition ${isExpanded ? 'bg-blue-50/30' : ''}`}>
                      <td className="p-3 text-center font-bold text-slate-400">{idx + 1}.</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                          <span>{off.name}</span>
                          {off.primaryOfficeType === 'CO' && (
                            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded border border-indigo-200">
                              अंचल कार्यालय (CO)
                            </span>
                          )}
                          {off.staffNo === currentUser?.staffNo && (
                            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-300">
                              आपकी प्रोफ़ाइल
                            </span>
                          )}
                        </div>
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

                      {/* Translation & Branch Visits */}
                      {tableViewMode !== 'publications' && (
                        <>
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
                        </>
                      )}

                      {/* 1. हिंदी में जारी पत्रिका/ई पत्रिका/बुलेटिन(छमाही) */}
                      {(tableViewMode === 'all' || tableViewMode === 'publications') && (
                        <td className="p-3 bg-indigo-50/20 border-x border-slate-200">
                          {rep?.magazines && rep.magazines.length > 0 ? (
                            <div className="space-y-1.5">
                              {rep.magazines.map((m, mIdx) => (
                                <div key={mIdx} className="bg-white p-1.5 rounded border border-indigo-100 shadow-2xs">
                                  <div className="font-bold text-indigo-950 flex items-center gap-1">
                                    <BookOpen className="w-3 h-3 text-indigo-600 shrink-0" />
                                    <span>{m.magazineName || 'शीर्षक दर्ज नहीं'}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-600 mt-0.5">
                                    कुल पृष्ठ: <strong>{m.totalPages || 0}</strong> | विमोचन:{' '}
                                    <strong>{m.releaseDate || '-'}</strong>
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    प्र.का. प्रेषण: <strong>{m.hoSentDate || '-'}</strong>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">शून्य / कोई नहीं</span>
                          )}
                        </td>
                      )}

                      {/* 2. केनराज्योति व श्रेयस पत्रिकाओं के लिए प्रविष्टियां(तिमाही) */}
                      {(tableViewMode === 'all' || tableViewMode === 'publications') && (
                        <td className="p-3 bg-indigo-50/20 border-r border-slate-200">
                          {rep?.houseJournals && rep.houseJournals.length > 0 ? (
                            <div className="space-y-1.5">
                              {rep.houseJournals.map((hj, hIdx) => (
                                <div key={hIdx} className="bg-white p-1.5 rounded border border-indigo-100 shadow-2xs text-[11px]">
                                  <div className="text-slate-700">
                                    <span className="text-slate-500">प्रविष्टियां प्रेषण:</span>{' '}
                                    <strong className="text-indigo-900">{hj.staffEntriesSentDate || '-'}</strong>
                                  </div>
                                  <div className="text-slate-700 mt-0.5">
                                    <span className="text-slate-500">गतिविधि प्रेषण:</span>{' '}
                                    <strong className="text-indigo-900">{hj.activityReportSentDate || '-'}</strong>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">शून्य / कोई नहीं</span>
                          )}
                        </td>
                      )}

                      {/* 3. नगर राजभाषा कार्यान्वयन समिति(जहां बैंक सदस्य है) */}
                      {(tableViewMode === 'all' || tableViewMode === 'publications') && (
                        <td className="p-3 bg-amber-50/20 border-r border-slate-200">
                          {rep?.tolicMembers && rep.tolicMembers.length > 0 ? (
                            <div className="space-y-1.5">
                              {rep.tolicMembers.map((tm, tIdx) => (
                                <div key={tIdx} className="bg-white p-1.5 rounded border border-amber-200 shadow-2xs">
                                  <div className="font-bold text-amber-950 flex items-center gap-1">
                                    <Layers className="w-3 h-3 text-amber-700 shrink-0" />
                                    <span>{tm.tolicName || 'नराकास'}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-600 mt-0.5">
                                    छमाही रिपोर्ट: <strong>{tm.halfYearlyReportDate || '-'}</strong> | बैठक:{' '}
                                    <strong>{tm.meetingDate || '-'}</strong>
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    उपस्थित प्रमुख: <strong>{tm.headAttendedName || '-'}</strong>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">सदस्य नहीं</span>
                          )}
                        </td>
                      )}

                      {/* 4. नगर राजभाषा कार्यान्वयन समिति(जहां बैंक संयोजक है) */}
                      {(tableViewMode === 'all' || tableViewMode === 'publications') && (
                        <td className="p-3 bg-amber-50/20 border-r border-slate-200">
                          {rep?.tolicConveners && rep.tolicConveners.length > 0 ? (
                            <div className="space-y-1.5">
                              {rep.tolicConveners.map((tc, cIdx) => (
                                <div key={cIdx} className="bg-white p-1.5 rounded border border-amber-300 shadow-2xs">
                                  <div className="font-bold text-purple-950 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                                    <span>{tc.tolicName} (संयोजक)</span>
                                  </div>
                                  <div className="text-[10px] text-slate-600 mt-0.5">
                                    कैलेंडर माह: <strong>{tc.targetCalendarMonth || '-'}</strong> | बैठक:{' '}
                                    <strong>{tc.meetingDate || '-'}</strong>
                                  </div>
                                  <div className="text-[10px] text-slate-600">
                                    उपस्थित: <strong>{tc.headAttendedName || '-'}</strong>
                                  </div>
                                  <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                                    उपस्थित/कुल सदस्य: {tc.attendedMemberOffices || 0} / {tc.totalMemberOffices || 0}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">संयोजक नहीं</span>
                          )}
                        </td>
                      )}

                      {/* 5. अंचल व क्षेत्रीय कार्यालयों द्वारा तिमाही के दौरान किए गए नवोन्मेषी कार्य : */}
                      {(tableViewMode === 'all' || tableViewMode === 'publications') && (
                        <td className="p-3 bg-teal-50/20 border-r border-slate-200">
                          {rep?.innovativeWorks && rep.innovativeWorks.length > 0 ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-900 border border-teal-300 px-2 py-0.5 rounded text-[10px] font-bold">
                                <Sparkles className="w-3 h-3 text-teal-700" />
                                <span>{rep.innovativeWorks.length} कार्य प्रविष्टि</span>
                              </span>
                              <ol className="list-decimal list-inside text-[11px] text-slate-800 space-y-0.5">
                                {rep.innovativeWorks.map((work, wIdx) => (
                                  <li key={wIdx} className="truncate max-w-[210px]" title={work}>
                                    {work}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">कोई नहीं</span>
                          )}
                        </td>
                      )}

                      {/* 6. अंचल व क्षेत्रीय कार्यालयों को प्राप्त विशेष पुरस्कार : */}
                      {(tableViewMode === 'all' || tableViewMode === 'publications') && (
                        <td className="p-3 bg-amber-50/20 border-r border-slate-200">
                          {rep?.specialAwards && rep.specialAwards.length > 0 ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-950 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold">
                                <Award className="w-3 h-3 text-amber-700" />
                                <span>{rep.specialAwards.length} पुरस्कार / सम्मान</span>
                              </span>
                              <ol className="list-decimal list-inside text-[11px] text-slate-800 space-y-0.5">
                                {rep.specialAwards.map((award, aIdx) => (
                                  <li key={aIdx} className="truncate max-w-[210px]" title={award}>
                                    {award}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">कोई नहीं</span>
                          )}
                        </td>
                      )}

                      <td className="p-3 text-slate-600 text-[11px]">
                        {rep?.updatedAt ? new Date(rep.updatedAt).toLocaleDateString('hi-IN') : '-'}
                      </td>

                      {/* Action buttons */}
                      <td className="p-3 text-center sticky right-0 bg-white/95 backdrop-blur-2xs shadow-xs">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* Toggle Expand Row */}
                          {rep && (
                            <button
                              type="button"
                              onClick={() => setExpandedOfficerStaffNo(isExpanded ? null : off.staffNo)}
                              className={`p-1 rounded text-xs transition cursor-pointer ${
                                isExpanded
                                  ? 'bg-blue-900 text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                              title={isExpanded ? 'विस्तृत दृश्य छुपाएं' : 'सभी 15 तालिकाओं का त्वरित विवरण खोलें'}
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* Edit / Fill Form Button */}
                          {onEditOfficerReport && (
                            <button
                              type="button"
                              onClick={() => onEditOfficerReport(off)}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-blue-950 border border-amber-300 rounded text-[11px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                              title={off.primaryOfficeType === 'CO' ? 'अपनी अंचल कार्यालय रिपोर्ट भरें / संपादित करें' : 'इस RO की रिपोर्ट खोलें व संपादित करें'}
                            >
                              <FileText className="w-3 h-3 text-amber-700" />
                              <span>{off.primaryOfficeType === 'CO' ? 'CO फॉर्म भरें' : 'संपादित करें'}</span>
                            </button>
                          )}

                          {rep ? (
                            <>
                              <button
                                onClick={() => onViewPrintable(rep)}
                                className="p-1 text-blue-700 hover:bg-blue-50 rounded cursor-pointer"
                                title="रिपोर्ट देखें / प्रिंट करें"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setReviewModalReport(rep)}
                                className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-[11px] font-bold cursor-pointer"
                              >
                                समीक्षा
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-amber-700 italic">लंबित</span>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable row showing all 15 parts cleanly */}
                    {isExpanded && rep && (
                      <tr className="bg-slate-50/90 border-y border-slate-300">
                        <td colSpan={14} className="p-4">
                          <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-sm space-y-4 text-xs">
                            <div className="flex items-center justify-between border-b pb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-700"></span>
                                <h4 className="font-bold text-sm text-blue-950">
                                  {off.name} ({off.primaryOfficeName}) - आधिकारिक तिमाही रिपोर्ट का संपूर्ण विवरण
                                </h4>
                              </div>
                              <span className="text-[11px] text-slate-500 font-mono">
                                अद्यतन: {new Date(rep.updatedAt).toLocaleString('hi-IN')}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {/* Card 1: पत्रिका */}
                              <div className="p-3 bg-indigo-50/40 border border-indigo-200 rounded-lg space-y-1.5">
                                <div className="font-bold text-indigo-900 flex items-center gap-1.5 text-xs">
                                  <BookOpen className="w-3.5 h-3.5 text-indigo-700" />
                                  <span>तालिका 10: हिंदी पत्रिका/ई-पत्रिका/बुलेटिन(छमाही)</span>
                                </div>
                                {rep.magazines.length > 0 ? (
                                  rep.magazines.map((m, idx) => (
                                    <div key={idx} className="bg-white p-2 rounded border border-indigo-100 space-y-0.5">
                                      <div className="font-bold text-slate-900">{m.magazineName}</div>
                                      <div className="text-slate-600">कुल पृष्ठ: {m.totalPages}</div>
                                      <div className="text-slate-600">विमोचन तिथि: {m.releaseDate || '-'}</div>
                                      <div className="text-slate-600">प्र.का. प्रेषण तिथि: {m.hoSentDate || '-'}</div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-slate-400 italic">इस तिमाही कोई पत्रिका विमोचित नहीं हुई।</p>
                                )}
                              </div>

                              {/* Card 2: केनराज्योति व श्रेयस */}
                              <div className="p-3 bg-indigo-50/40 border border-indigo-200 rounded-lg space-y-1.5">
                                <div className="font-bold text-indigo-900 flex items-center gap-1.5 text-xs">
                                  <FileCheck2 className="w-3.5 h-3.5 text-indigo-700" />
                                  <span>तालिका 11: केनराज्योति व श्रेयस प्रविष्टियां(तिमाही)</span>
                                </div>
                                {rep.houseJournals.length > 0 ? (
                                  rep.houseJournals.map((hj, idx) => (
                                    <div key={idx} className="bg-white p-2 rounded border border-indigo-100 space-y-0.5">
                                      <div className="text-slate-700">कार्यालय: {hj.officeName}</div>
                                      <div className="text-slate-700">कर्मचारियों की प्रविष्टियां प्रेषित: <strong>{hj.staffEntriesSentDate || '-'}</strong></div>
                                      <div className="text-slate-700">गतिविधियों की रिपोर्ट प्रेषित: <strong>{hj.activityReportSentDate || '-'}</strong></div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-slate-400 italic">कोई प्रविष्टि दर्ज नहीं।</p>
                                )}
                              </div>

                              {/* Card 3: नराकास सदस्य */}
                              <div className="p-3 bg-amber-50/40 border border-amber-200 rounded-lg space-y-1.5">
                                <div className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                                  <Layers className="w-3.5 h-3.5 text-amber-700" />
                                  <span>तालिका 12: नराकास (जहां बैंक सदस्य है)</span>
                                </div>
                                {rep.tolicMembers.length > 0 ? (
                                  rep.tolicMembers.map((tm, idx) => (
                                    <div key={idx} className="bg-white p-2 rounded border border-amber-100 space-y-0.5">
                                      <div className="font-bold text-amber-900">{tm.tolicName}</div>
                                      <div className="text-slate-600">छमाही रिपोर्ट तिथि: {tm.halfYearlyReportDate || '-'}</div>
                                      <div className="text-slate-600">बैठक तिथि: {tm.meetingDate || '-'}</div>
                                      <div className="text-slate-600">उपस्थित प्रमुख: {tm.headAttendedName || '-'}</div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-slate-400 italic">क्षेत्राधीन किसी नराकास का सदस्य नहीं।</p>
                                )}
                              </div>

                              {/* Card 4: नराकास संयोजक */}
                              <div className="p-3 bg-purple-50/40 border border-purple-200 rounded-lg space-y-1.5">
                                <div className="font-bold text-purple-950 flex items-center gap-1.5 text-xs">
                                  <Building2 className="w-3.5 h-3.5 text-purple-700" />
                                  <span>तालिका 13: नराकास (जहां बैंक संयोजक है)</span>
                                </div>
                                {rep.tolicConveners.length > 0 ? (
                                  rep.tolicConveners.map((tc, idx) => (
                                    <div key={idx} className="bg-white p-2 rounded border border-purple-100 space-y-0.5">
                                      <div className="font-bold text-purple-900">{tc.tolicName}</div>
                                      <div className="text-slate-600">कैलेंडर माह: {tc.targetCalendarMonth || '-'}</div>
                                      <div className="text-slate-600">बैठक तिथि: {tc.meetingDate || '-'}</div>
                                      <div className="text-slate-600">उपस्थित प्रमुख: {tc.headAttendedName || '-'}</div>
                                      <div className="text-emerald-800 font-bold">उपस्थित / कुल सदस्य कार्यालय: {tc.attendedMemberOffices || 0} / {tc.totalMemberOffices || 0}</div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-slate-400 italic">बैंक संयोजक नहीं है।</p>
                                )}
                              </div>

                              {/* Card 5: नवोन्मेषी कार्य */}
                              <div className="p-3 bg-teal-50/40 border border-teal-200 rounded-lg space-y-1.5">
                                <div className="font-bold text-teal-950 flex items-center gap-1.5 text-xs">
                                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                                  <span>भाग 14: अंचल व क्षेत्रीय कार्यालयों द्वारा किए गए नवोन्मेषी कार्य</span>
                                </div>
                                {rep.innovativeWorks.length > 0 ? (
                                  <ul className="list-disc list-inside space-y-1 text-slate-800 bg-white p-2 rounded border border-teal-100">
                                    {rep.innovativeWorks.map((w, idx) => (
                                      <li key={idx} className="leading-relaxed">{w}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-slate-400 italic">कोई नवोन्मेषी कार्य दर्ज नहीं किया गया।</p>
                                )}
                              </div>

                              {/* Card 6: विशेष पुरस्कार */}
                              <div className="p-3 bg-amber-50/40 border border-amber-200 rounded-lg space-y-1.5">
                                <div className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                                  <Award className="w-3.5 h-3.5 text-amber-700" />
                                  <span>भाग 15: अंचल व क्षेत्रीय कार्यालयों को प्राप्त विशेष पुरस्कार</span>
                                </div>
                                {rep.specialAwards.length > 0 ? (
                                  <ul className="list-disc list-inside space-y-1 text-slate-800 bg-white p-2 rounded border border-amber-100">
                                    {rep.specialAwards.map((a, idx) => (
                                      <li key={idx} className="leading-relaxed">{a}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-slate-400 italic">कोई विशेष पुरस्कार दर्ज नहीं।</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
