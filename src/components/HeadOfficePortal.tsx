import React, { useState } from 'react';
import { Officer, QuarterlyReport, Office, TransferRecord, SignedPdfRecord } from '../types';
import { CIRCLE_OFFICES } from '../data/seedData';
import { 
  ShieldCheck, 
  Building, 
  Users, 
  Languages, 
  MapPin, 
  BookOpen, 
  CheckCircle, 
  Download, 
  Search, 
  Filter, 
  Eye, 
  FileSpreadsheet,
  TrendingUp,
  Award,
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  FileCheck2,
  Clock,
  History,
  Sparkles,
  Layers,
  Lock,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { exportHeadOfficeMasterToExcel } from '../utils/excelExport';
import { SignedPdfViewerModal } from './SignedPdfViewerModal';

interface Props {
  circleOffices: { code: string; name: string }[];
  allOffices: Office[];
  officers: Officer[];
  reports: QuarterlyReport[];
  selectedQuarter: string;
  onViewPrintable: (report: QuarterlyReport) => void;
  onSelectCircleFromHO: (circleCode: string) => void;
  transferHistory: TransferRecord[];
  onExecuteTransfer: (record: TransferRecord) => void;
  onSaveReport?: (report: QuarterlyReport) => void;
}

export const HeadOfficePortal: React.FC<Props> = ({
  circleOffices,
  allOffices,
  officers,
  reports,
  selectedQuarter,
  onViewPrintable,
  onSelectCircleFromHO,
  transferHistory,
  onExecuteTransfer,
  onSaveReport,
}) => {
  const [activeHoTab, setActiveHoTab] = useState<'dashboard' | 'transfer' | 'translation' | 'visits' | 'publications_tolic' | 'signed_pdfs'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'pending'>('all');

  // Signed PDF repository states
  const [selectedSignedReport, setSelectedSignedReport] = useState<QuarterlyReport | null>(null);
  const [signedCircleFilter, setSignedCircleFilter] = useState<string>('all');
  const [signedStatusFilter, setSignedStatusFilter] = useState<'all' | 'uploaded' | 'verified' | 'pending'>('all');
  const [signedSearch, setSignedSearch] = useState<string>('');
  const [hoActionFeedback, setHoActionFeedback] = useState<string>('');

  // Transfer form state
  const [selectedStaffNo, setSelectedStaffNo] = useState<string>(officers[0]?.staffNo || '');
  const [transferTargetOffice, setTransferTargetOffice] = useState<string>(allOffices[1]?.name || '');
  const [transferTargetCircle, setTransferTargetCircle] = useState<string>(circleOffices[1]?.code || '7625');
  const [transferConcurrent, setTransferConcurrent] = useState<string[]>([]);
  const [transferOrderNo, setTransferOrderNo] = useState<string>(`HO/OL/TR/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`);
  const [transferEffectiveDate, setTransferEffectiveDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [transferRemarks, setTransferRemarks] = useState<string>('प्रशासनिक आवश्यकतानुसार नियमित स्थानांतरण।');
  const [transferSuccessMsg, setTransferSuccessMsg] = useState<string>('');

  const currentSelectedOfficer = officers.find((o) => o.staffNo === selectedStaffNo) || officers[0];

  // Filter reports by current quarter
  const quarterReports = reports.filter((r) => r.quarter === selectedQuarter);

  // All India Aggregations
  const totalOfficers = officers.length;
  const totalReportsSubmitted = quarterReports.filter(
    (r) => r.status !== 'ड्राफ्ट (Draft)'
  ).length;

  const totalPagesReceived = quarterReports.reduce(
    (sum, r) => sum + (Number(r.translation?.pagesReceivedFromHO) || 0),
    0
  );
  const totalPagesTranslated = quarterReports.reduce(
    (sum, r) => sum + (Number(r.translation?.pagesTranslatedInHindi) || 0),
    0
  );
  const translationPercentage =
    totalPagesReceived > 0
      ? Math.min(100, Math.round((totalPagesTranslated / totalPagesReceived) * 100))
      : 100;

  const totalBranchVisits = quarterReports.reduce(
    (sum, r) => sum + (r.branchVisits?.length || 0),
    0
  );

  const totalWorkshops = quarterReports.reduce((sum, r) => sum + r.workshops.length, 0);
  const totalParticipants = quarterReports.reduce(
    (sum, r) =>
      sum + r.workshops.reduce((wsSum, w) => wsSum + (Number(w.participantsCount) || 0), 0),
    0
  );
  const totalMagazines = quarterReports.reduce((sum, r) => sum + r.magazines.length, 0);

  // User-requested Authentic Signed PDF aggregations (Head Office Exclusive)
  const totalSignedPdfReports = quarterReports.filter((r) => !!r.signedPdf).length;
  const totalVerifiedSignedPdfReports = quarterReports.filter(
    (r) => r.signedPdf?.status === 'प्र.का. द्वारा सत्यापित'
  ).length;

  const handleVerifySignedPdf = (
    status: 'प्र.का. द्वारा सत्यापित' | 'संशोधन अपेक्षित',
    remarks: string
  ) => {
    if (!selectedSignedReport || !selectedSignedReport.signedPdf) return;
    const updatedRecord: SignedPdfRecord = {
      ...selectedSignedReport.signedPdf,
      status,
      verifiedByHOAt: new Date().toISOString(),
      verifiedByHOOfficer: 'श्री शशि कांत पांडेय (वरिष्ठ प्रबंधक - राजभाषा)',
      hoRemarks: remarks,
    };
    const updatedReport: QuarterlyReport = {
      ...selectedSignedReport,
      signedPdf: updatedRecord,
      updatedAt: new Date().toISOString(),
    };
    if (onSaveReport) {
      onSaveReport(updatedReport);
    }
    setSelectedSignedReport(updatedReport);
    setHoActionFeedback(`रिपोर्ट (${selectedSignedReport.primaryOfficeName}) को "${status}" के रूप में अद्यतन किया गया।`);
    setTimeout(() => setHoActionFeedback(''), 5000);
    confetti({ particleCount: 70, spread: 60 });
  };

  // Build Circle-wise statistics table
  const circleStats = circleOffices.map((c) => {
    const cOfficers = officers.filter((o) => o.circleOfficeCode === c.code);
    const cReports = quarterReports.filter((r) => r.circleOfficeCode === c.code);
    const signedCount = cReports.filter((r) => !!r.signedPdf).length;

    const receivedTrans = cReports.reduce(
      (s, r) => s + (Number(r.translation?.pagesReceivedFromHO) || 0),
      0
    );
    const doneTrans = cReports.reduce(
      (s, r) => s + (Number(r.translation?.pagesTranslatedInHindi) || 0),
      0
    );
    const visits = cReports.reduce((s, r) => s + (r.branchVisits?.length || 0), 0);
    const submittedCount = cReports.filter((r) => r.status !== 'ड्राफ्ट (Draft)').length;

    return {
      ...c,
      officersCount: cOfficers.length,
      submittedReports: submittedCount,
      signedCount,
      receivedTrans,
      doneTrans,
      visits,
      isFullySubmitted: cOfficers.length > 0 && submittedCount === cOfficers.length,
    };
  });

  const filteredCircles = circleStats.filter((cs) => {
    const matchSearch =
      cs.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cs.code.includes(searchTerm);
    if (!matchSearch) return false;
    if (statusFilter === 'submitted') return cs.submittedReports > 0;
    if (statusFilter === 'pending') return cs.submittedReports < cs.officersCount;
    return true;
  });

  // Transfer Submit Handler
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedOfficer) return;

    const matchedCircle = circleOffices.find((c) => c.code === transferTargetCircle);

    const record: TransferRecord = {
      id: `tr-${Date.now()}`,
      staffNo: currentSelectedOfficer.staffNo,
      officerName: currentSelectedOfficer.name,
      fromOffice: currentSelectedOfficer.primaryOfficeName,
      fromCircleCode: currentSelectedOfficer.circleOfficeCode,
      fromCircleName: currentSelectedOfficer.circleOfficeName,
      toOffice: transferTargetOffice,
      toCircleCode: transferTargetCircle,
      toCircleName: matchedCircle ? matchedCircle.name : `${transferTargetCircle} C.O.`,
      toConcurrentOffices: transferConcurrent,
      orderNo: transferOrderNo,
      transferDate: new Date().toISOString().slice(0, 10),
      effectiveDate: transferEffectiveDate,
      remarks: transferRemarks,
    };

    onExecuteTransfer(record);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    setTransferSuccessMsg(
      `स्थानांतरण आदेश सं. ${transferOrderNo} सफलतापूर्वक निष्पादित! अधिकारी ${currentSelectedOfficer.name} अब ${transferTargetOffice} (${matchedCircle?.name}) में पदस्थापित हैं। अगली बार लॉगिन करने पर उन्हें नवीन कार्यालय का फॉर्म प्राप्त होगा।`
    );
    setTimeout(() => setTransferSuccessMsg(''), 7000);
  };

  const toggleConcurrent = (roName: string) => {
    if (transferConcurrent.includes(roName)) {
      setTransferConcurrent(transferConcurrent.filter((o) => o !== roName));
    } else {
      setTransferConcurrent([...transferConcurrent, roName]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-50 via-white to-blue-50 text-slate-800 rounded-2xl p-6 shadow-xs border border-sky-200 border-b-4 border-b-amber-400">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-sky-600 text-white rounded-xl flex items-center justify-center font-black text-2xl shadow-xs">
              ▲
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded border border-amber-300">
                  प्रधान कार्यालय (Head Office - HO)
                </span>
                <span className="text-xs text-slate-600">समीक्षा तिमाही: <strong>{selectedQuarter}</strong></span>
              </div>
              <h2 className="text-2xl font-black tracking-tight mt-1 text-slate-900">
                राजभाषा अनुभाग - अखिल भारतीय समेकित डैशबोर्ड
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                केनरा बैंक के सभी 28 अंचल कार्यालयों, क्षेत्रीय कार्यालयों व राजभाषा अधिकारियों का केंद्रीय अनुपालन, अनुवाद ट्रैकिंग व स्थानांतरण प्रबंधन
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportHeadOfficeMasterToExcel(quarterReports, officers)}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>अखिल भारतीय मास्टर एक्सेल (.xlsx) डाउनलोड</span>
            </button>
          </div>
        </div>

        {/* HO Internal Tabs */}
        <div className="flex items-center gap-2 border-t border-sky-200 mt-5 pt-3 overflow-x-auto text-xs font-bold scrollbar-none">
          <button
            onClick={() => setActiveHoTab('dashboard')}
            className={`px-4 py-2 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeHoTab === 'dashboard'
                ? 'bg-sky-700 text-white shadow-xs font-bold'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>१. अखिल भारतीय अंचल समीक्षा (Overview)</span>
          </button>

          <button
            onClick={() => setActiveHoTab('transfer')}
            className={`px-4 py-2 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeHoTab === 'transfer'
                ? 'bg-sky-700 text-white shadow-xs font-bold'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>२. अधिकारी स्थानांतरण प्रबंधन (Transfer Desk)</span>
            <span className="bg-red-500 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              नई सुविधा
            </span>
          </button>

          <button
            onClick={() => setActiveHoTab('translation')}
            className={`px-4 py-2 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeHoTab === 'translation'
                ? 'bg-sky-700 text-white shadow-xs font-bold'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>३. राष्ट्रीय अनुवाद मॉनिटरिंग ({totalPagesTranslated}/{totalPagesReceived} पृष्ठ)</span>
          </button>

          <button
            onClick={() => setActiveHoTab('visits')}
            className={`px-4 py-2 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeHoTab === 'visits'
                ? 'bg-sky-700 text-white shadow-xs font-bold'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>४. शाखा निरीक्षण समेकन ({totalBranchVisits} विज़िट)</span>
          </button>

          <button
            onClick={() => setActiveHoTab('publications_tolic')}
            className={`px-4 py-2 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeHoTab === 'publications_tolic'
                ? 'bg-sky-700 text-white shadow-xs font-bold'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>५. पत्रिकाएं, नराकास, नवोन्मेषी कार्य व पुरस्कार (तालिका 10-15)</span>
          </button>

          <button
            onClick={() => setActiveHoTab('signed_pdfs')}
            className={`px-4 py-2 rounded-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeHoTab === 'signed_pdfs'
                ? 'bg-sky-700 text-white shadow-xs font-bold'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>६. हस्ताक्षरित अनुमोदित रिपोर्टें (Signed PDFs - HO Exclusive)</span>
            <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.2 rounded-full text-[10px] font-mono font-bold">
              {totalSignedPdfReports} संलग्न
            </span>
          </button>
        </div>
      </div>

      {/* Tab 1: Dashboard Overview */}
      {activeHoTab === 'dashboard' && (
        <div className="space-y-6">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
                <span>कुल OL अधिकारी</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalOfficers}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">28 अंचलों में पदस्थापित</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
                <span>प्राप्त रिपोर्टें</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-1">{totalReportsSubmitted}</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">
                {Math.round((totalReportsSubmitted / Math.max(1, totalOfficers)) * 100)}% संकलन पूर्ण
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
                <span>अनूदित पृष्ठ</span>
                <Languages className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-indigo-900 mt-1">{totalPagesTranslated}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {totalPagesReceived} में से ({translationPercentage}%)
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
                <span>शाखा निरीक्षण</span>
                <MapPin className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-800 mt-1">{totalBranchVisits}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">शाखाएं विज़िट व समीक्षा</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
                <span>हिंदी कार्यशालाएं</span>
                <TrendingUp className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-black text-teal-800 mt-1">{totalWorkshops}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{totalParticipants} प्रतिभागी लाभान्वित</div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
                <span>पत्रिकाएं विमोचित</span>
                <BookOpen className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-800 mt-1">{totalMagazines}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">ई-पत्रिकाएं व बुलेटिन</div>
            </div>
          </div>

          {/* Circle Offices Performance Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  अखिल भारतीय अंचल कार्यालय राजभाषा अनुपालन एवं प्रगति तालिका
                </h3>
                <p className="text-[11px] text-slate-500">
                  किसी भी अंचल कार्यालय पर क्लिक करके सीधे उस अंचल के समेकन पृष्ठ पर जा सकते हैं
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="अंचल नाम / कोड खोजें..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs w-48 outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2 py-1 rounded cursor-pointer ${statusFilter === 'all' ? 'bg-white shadow-xs text-blue-900 font-bold' : 'text-slate-600'}`}
                  >
                    सभी ({circleStats.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('submitted')}
                    className={`px-2 py-1 rounded cursor-pointer ${statusFilter === 'submitted' ? 'bg-white shadow-xs text-emerald-900 font-bold' : 'text-slate-600'}`}
                  >
                    प्राप्त
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-2 py-1 rounded cursor-pointer ${statusFilter === 'pending' ? 'bg-white shadow-xs text-amber-900 font-bold' : 'text-slate-600'}`}
                  >
                    लंबित
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[11px] font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-3 w-10 text-center">क्र.</th>
                    <th className="p-3 w-64">अंचल कार्यालय (Circle Office)</th>
                    <th className="p-3 w-20 text-center">अंचल कोड</th>
                    <th className="p-3 w-24 text-center">संबद्ध अधिकारी</th>
                    <th className="p-3 w-32 text-center">रिपोर्ट प्रस्तुति</th>
                    <th className="p-3 w-40">अनुवाद प्रगति (प्राप्त / पूर्ण)</th>
                    <th className="p-3 w-28 text-center">शाखा विज़िट</th>
                    <th className="p-3 w-36 text-center">कार्रवाई</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCircles.map((c, idx) => (
                    <tr key={c.code} className="hover:bg-blue-50/40 transition">
                      <td className="p-3 text-center font-bold text-slate-400">{idx + 1}.</td>
                      <td className="p-3 font-bold text-slate-900">{c.name}</td>
                      <td className="p-3 text-center font-mono font-bold text-slate-600">{c.code}</td>
                      <td className="p-3 text-center font-bold">{c.officersCount}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            c.isFullySubmitted
                              ? 'bg-emerald-100 text-emerald-800'
                              : c.submittedReports > 0
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {c.submittedReports} / {c.officersCount}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-indigo-900">
                          {c.doneTrans} / {c.receivedTrans} पृष्ठ
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full"
                            style={{
                              width: `${c.receivedTrans > 0 ? Math.min(100, Math.round((c.doneTrans / c.receivedTrans) * 100)) : 100}%`,
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {c.visits} विज़िट
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onSelectCircleFromHO(c.code)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>अंचल समीक्षा खोलें</span>
                          <span className="text-xs">→</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Officer Transfer Management (Feature requested by user) */}
      {activeHoTab === 'transfer' && (
        <div className="space-y-6">
          {/* Transfer Success Notification */}
          {transferSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm">स्थानांतरण सफलता पूर्वक संपन्न!</strong>
                <span>{transferSuccessMsg}</span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                  <span>अधिकारी स्थानांतरण एवं पदस्थापन अद्यतन (Transfer & Posting Management)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  प्रधान कार्यालय स्तर से अधिकारी का नवीन RO या CO में स्थानांतरण करें। स्थानांतरण के उपरांत अधिकारी के लॉगिन में स्वतः ही नवीन कार्यालय का डेटा फॉर्म सक्रिय हो जाएगा।
                </p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-900 font-bold px-3 py-1 rounded-full">
                अखिल भारतीय पदस्थापन नियंत्रण
              </span>
            </div>

            {/* Officer Selector */}
            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                १. स्थानांतरण हेतु राजभाषा अधिकारी चुनें (Select Officer for Transfer):
              </label>
              <select
                value={selectedStaffNo}
                onChange={(e) => setSelectedStaffNo(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-blue-950 focus:ring-2 focus:ring-blue-500"
              >
                {officers.map((off) => (
                  <option key={off.id} value={off.staffNo}>
                    {off.staffNo} - {off.name} ({off.designation}) | वर्तमान कार्यालय: {off.primaryOfficeName} ({off.circleOfficeName})
                  </option>
                ))}
              </select>
            </div>

            {/* Side-by-Side: Current vs New Posting Form */}
            <form onSubmit={handleTransferSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Posting Card */}
                <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      वर्तमान पदस्थापन विवरण (Current Posting)
                    </span>
                    <span className="text-[11px] bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded">
                      मौजूदा
                    </span>
                  </div>

                  <div className="text-xs space-y-2">
                    <div>
                      <span className="text-slate-500 block">अधिकारी का नाम व कर्मचारी संख्या:</span>
                      <strong className="text-sm text-slate-900">{currentSelectedOfficer?.name}</strong>{' '}
                      <span className="font-mono text-slate-600 font-bold">({currentSelectedOfficer?.staffNo})</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">पदनाम:</span>
                      <strong className="text-slate-800">{currentSelectedOfficer?.designation}</strong>
                    </div>

                    <div>
                      <span className="text-slate-500 block">वर्तमान मूल कार्यालय:</span>
                      <strong className="text-blue-950">{currentSelectedOfficer?.primaryOfficeName}</strong>
                    </div>

                    <div>
                      <span className="text-slate-500 block">वर्तमान अंचल कार्यालय (CO):</span>
                      <strong className="text-indigo-900">{currentSelectedOfficer?.circleOfficeName}</strong>
                    </div>

                    <div>
                      <span className="text-slate-500 block">मौजूदा समवर्ती प्रभार (Concurrent):</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {currentSelectedOfficer?.concurrentOffices.length > 0 ? (
                          currentSelectedOfficer.concurrentOffices.map((co) => (
                            <span key={co} className="bg-amber-100 text-amber-900 text-[10px] font-semibold px-2 py-0.5 rounded">
                              {co}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">कोई नहीं</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* New Posting Assignment Card */}
                <div className="p-4 bg-blue-50/60 border border-blue-300 rounded-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                    <span className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                      नवीन पदस्थापन आवंटन (New Transfer Posting)
                    </span>
                    <span className="text-[11px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded">
                      स्थानांतरण
                    </span>
                  </div>

                  <div className="text-xs space-y-3">
                    <div>
                      <label className="block font-bold text-blue-950 mb-1">
                        नवीन अंचल कार्यालय (New Circle Office):
                      </label>
                      <select
                        value={transferTargetCircle}
                        onChange={(e) => setTransferTargetCircle(e.target.value)}
                        className="w-full p-2 bg-white border border-blue-300 rounded-lg text-xs font-bold"
                      >
                        {circleOffices.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-blue-950 mb-1">
                        नवीन मूल पदस्थापन कार्यालय (New Primary Office):
                      </label>
                      <select
                        value={transferTargetOffice}
                        onChange={(e) => setTransferTargetOffice(e.target.value)}
                        className="w-full p-2 bg-white border border-blue-300 rounded-lg text-xs font-bold text-slate-800"
                      >
                        {allOffices.map((o) => (
                          <option key={o.name} value={o.name}>
                            {o.name} {o.dpCode ? `(DP: ${o.dpCode})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-blue-950 mb-1">
                        नवीन समवर्ती प्रभार (New Concurrent Charges):
                      </label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {transferConcurrent.map((co) => (
                          <span
                            key={co}
                            className="bg-blue-200 text-blue-950 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1"
                          >
                            <span>{co}</span>
                            <button
                              type="button"
                              onClick={() => toggleConcurrent(co)}
                              className="font-bold hover:text-red-700"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            toggleConcurrent(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="w-full p-1.5 bg-white border border-blue-200 rounded text-xs"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          + समवर्ती प्रभार कार्यालय जोड़ें...
                        </option>
                        {allOffices
                          .filter((o) => o.name !== transferTargetOffice && !transferConcurrent.includes(o.name))
                          .map((o) => (
                            <option key={o.name} value={o.name}>
                              {o.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transfer Order Details */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">स्थानांतरण आदेश संख्या (Order No):</label>
                  <input
                    type="text"
                    required
                    value={transferOrderNo}
                    onChange={(e) => setTransferOrderNo(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">प्रभावी तिथि (Effective Date):</label>
                  <input
                    type="date"
                    required
                    value={transferEffectiveDate}
                    onChange={(e) => setTransferEffectiveDate(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">स्थानांतरण टिप्पणी / कारण:</label>
                  <input
                    type="text"
                    value={transferRemarks}
                    onChange={(e) => setTransferRemarks(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Submit Transfer Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-black text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>स्थानांतरण आदेश निष्पादित करें (Execute Transfer)</span>
                </button>
              </div>
            </form>
          </div>

          {/* Transfer History Log */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-600" />
                <span>अधिकारी स्थानांतरण इतिहास एवं ऑडिट लॉग (Transfer History)</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                कुल {transferHistory.length} स्थानांतरण दर्ज
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-10 text-center">क्र.</th>
                    <th className="p-3 w-40">अधिकारी का नाम</th>
                    <th className="p-3 w-28">कर्मचारी सं.</th>
                    <th className="p-3 w-56">पूर्व पदस्थापन</th>
                    <th className="p-3 w-56">नवीन पदस्थापन</th>
                    <th className="p-3 w-36">आदेश संख्या</th>
                    <th className="p-3 w-28">प्रभावी तिथि</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {transferHistory.map((tr, idx) => (
                    <tr key={tr.id} className="hover:bg-slate-50">
                      <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}.</td>
                      <td className="p-3 font-bold text-slate-900">{tr.officerName}</td>
                      <td className="p-3 font-mono text-slate-600">{tr.staffNo}</td>
                      <td className="p-3 text-slate-600">
                        <div>{tr.fromOffice}</div>
                        <div className="text-[10px] text-slate-400">{tr.fromCircleName}</div>
                      </td>
                      <td className="p-3 font-semibold text-blue-900">
                        <div>{tr.toOffice}</div>
                        <div className="text-[10px] text-indigo-700 font-bold">{tr.toCircleName}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-700">{tr.orderNo}</td>
                      <td className="p-3 text-slate-600">{tr.effectiveDate}</td>
                    </tr>
                  ))}
                  {transferHistory.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                        अभी तक कोई स्थानांतरण रिकॉर्ड दर्ज नहीं है। ऊपर दिए गए फॉर्म से स्थानांतरण करें।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: National Translation Tracking */}
      {activeHoTab === 'translation' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                अखिल भारतीय अनुवाद कार्य मॉनिटरिंग एवं तुलनात्मक विश्लेषण
              </h3>
              <p className="text-xs text-slate-500">
                प्रधान कार्यालय द्वारा भेजे गए अनुवाद कार्य की अंचल-वार प्राप्ति व अनूदित पृष्ठों की स्थिति
              </p>
            </div>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 px-3 py-1 rounded-full">
              कुल अनूदित: {totalPagesTranslated} / {totalPagesReceived} पृष्ठ ({translationPercentage}%)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b">
                <tr>
                  <th className="p-3 w-10 text-center">क्र.</th>
                  <th className="p-3 w-60">अंचल कार्यालय</th>
                  <th className="p-3 w-32 text-center">HO से प्राप्त पृष्ठ</th>
                  <th className="p-3 w-32 text-center">हिंदी में अनूदित पृष्ठ</th>
                  <th className="p-3 w-32 text-center">लंबित पृष्ठ</th>
                  <th className="p-3 w-40">प्रगति दर (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {circleStats.map((c, idx) => {
                  const rate = c.receivedTrans > 0 ? Math.min(100, Math.round((c.doneTrans / c.receivedTrans) * 100)) : 100;
                  return (
                    <tr key={c.code} className="hover:bg-slate-50">
                      <td className="p-3 text-center text-slate-400">{idx + 1}.</td>
                      <td className="p-3 font-bold text-slate-900">{c.name}</td>
                      <td className="p-3 text-center font-bold">{c.receivedTrans}</td>
                      <td className="p-3 text-center font-bold text-emerald-700">{c.doneTrans}</td>
                      <td className="p-3 text-center font-bold text-amber-700">
                        {Math.max(0, c.receivedTrans - c.doneTrans)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[11px] w-10">{rate}%</span>
                          <div className="grow bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${rate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: National Branch Visits Tracking */}
      {activeHoTab === 'visits' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                अखिल भारतीय शाखा निरीक्षण व राजभाषा भ्रमण विवरण
              </h3>
              <p className="text-xs text-slate-500">
                समस्त अंचलों व क्षेत्रीय कार्यालयों द्वारा तिमाही में किए गए शाखा निरीक्षण एवं समीक्षा पत्र प्रेषण
              </p>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full">
              कुल राष्ट्रीय विज़िट: {totalBranchVisits} शाखाएं
            </span>
          </div>

          <div className="space-y-3">
            {quarterReports.map((rep) => (
              <div key={rep.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-blue-950 text-sm">{rep.officerName}</strong> ({rep.officerStaffNo}) —{' '}
                    <span className="text-slate-600">{rep.primaryOfficeName} ({rep.circleOfficeName})</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded text-[11px]">
                    {rep.branchVisits?.length || 0} शाखाएं विज़िट
                  </span>
                </div>

                {rep.branchVisits && rep.branchVisits.length > 0 ? (
                  <table className="w-full text-xs text-left bg-white border border-slate-200 rounded overflow-hidden">
                    <thead className="bg-slate-100 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-2 w-48">क्षेत्रीय कार्यालय</th>
                        <th className="p-2 w-48">शाखा नाम / डीपी कोड</th>
                        <th className="p-2 w-32">विज़िट तिथि</th>
                        <th className="p-2 w-32">समीक्षा पत्र तिथि</th>
                        <th className="p-2">मुख्य निष्कर्ष</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rep.branchVisits.map((bv, bIdx) => (
                        <tr key={bIdx}>
                          <td className="p-2 font-medium">{bv.regionalOfficeName}</td>
                          <td className="p-2 font-bold">{bv.branchCodeOrName}</td>
                          <td className="p-2">{bv.visitDate || '-'}</td>
                          <td className="p-2">{bv.reviewLetterDate || '-'}</td>
                          <td className="p-2 text-slate-600">{bv.keyObservations || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">इस कार्यालय द्वारा कोई शाखा विज़िट दर्ज नहीं की गई।</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Publications, TOLIC, Innovative Works & Awards */}
      {activeHoTab === 'publications_tolic' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                अखिल भारतीय पत्रिकाएं, केनराज्योति, नराकास (TOLIC), नवोन्मेषी कार्य एवं पुरस्कार समेकन
              </h3>
              <p className="text-xs text-slate-500">
                तालिका 10, 11, 12, 13 तथा भाग 14 व 15 का अखिल भारतीय केंद्रीय दृश्य
              </p>
            </div>
            <button
              onClick={() => exportHeadOfficeMasterToExcel(quarterReports, officers)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm cursor-pointer self-start md:self-auto"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>प्रकाशन व नराकास एक्सेल एक्सपोर्ट</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-xl border border-indigo-200">
              <span className="text-[11px] font-semibold text-slate-500">कुल विमोचित पत्रिकाएं (छमाही)</span>
              <div className="text-2xl font-black text-indigo-900 mt-1">
                {quarterReports.reduce((sum, r) => sum + r.magazines.length, 0)}
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-amber-200">
              <span className="text-[11px] font-semibold text-slate-500">नराकास संयोजक कार्यालय (TOLIC)</span>
              <div className="text-2xl font-black text-amber-900 mt-1">
                {quarterReports.reduce((sum, r) => sum + r.tolicConveners.length, 0)}
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-teal-200">
              <span className="text-[11px] font-semibold text-slate-500">नवोन्मेषी कार्य प्रविष्टियां</span>
              <div className="text-2xl font-black text-teal-900 mt-1">
                {quarterReports.reduce((sum, r) => sum + r.innovativeWorks.length, 0)}
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-amber-300">
              <span className="text-[11px] font-semibold text-slate-500">प्राप्त विशेष पुरस्कार</span>
              <div className="text-2xl font-black text-amber-950 mt-1">
                {quarterReports.reduce((sum, r) => sum + r.specialAwards.length, 0)}
              </div>
            </div>
          </div>

          {/* Detailed All-India Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[1100px]">
                <thead className="bg-slate-100 text-slate-800 uppercase tracking-wider text-[11px] font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-3 w-10 text-center">क्र.</th>
                    <th className="p-3 min-w-[180px]">अंचल व कार्यालय</th>
                    <th className="p-3 min-w-[150px]">राजभाषा अधिकारी</th>
                    <th className="p-3 min-w-[210px] bg-indigo-50/60 text-indigo-950 border-x border-slate-200">
                      हिंदी में जारी पत्रिका/ई पत्रिका/बुलेटिन(छमाही)
                    </th>
                    <th className="p-3 min-w-[210px] bg-indigo-50/60 text-indigo-950 border-r border-slate-200">
                      केनराज्योति व श्रेयस पत्रिकाओं के लिए प्रविष्टियां(तिमाही)
                    </th>
                    <th className="p-3 min-w-[210px] bg-amber-50/60 text-amber-950 border-r border-slate-200">
                      नगर राजभाषा कार्यान्वयन समिति(जहां बैंक सदस्य है)
                    </th>
                    <th className="p-3 min-w-[220px] bg-purple-50/60 text-purple-950 border-r border-slate-200">
                      नगर राजभाषा कार्यान्वयन समिति(जहां बैंक संयोजक है)
                    </th>
                    <th className="p-3 min-w-[210px] bg-teal-50/60 text-teal-950 border-r border-slate-200">
                      अंचल व क्षेत्रीय कार्यालयों द्वारा तिमाही के दौरान किए गए नवोन्मेषी कार्य :
                    </th>
                    <th className="p-3 min-w-[210px] bg-amber-50/60 text-amber-950 border-r border-slate-200">
                      अंचल व क्षेत्रीय कार्यालयों को प्राप्त विशेष पुरस्कार :
                    </th>
                    <th className="p-3 w-24 text-center">कार्रवाई</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {quarterReports.map((rep, idx) => (
                    <tr key={rep.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 text-center font-bold text-slate-400">{idx + 1}.</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{rep.primaryOfficeName}</div>
                        <div className="text-[11px] text-slate-500">{rep.circleOfficeName}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{rep.officerName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{rep.officerStaffNo}</div>
                      </td>

                      {/* 1. हिंदी पत्रिका */}
                      <td className="p-3 bg-indigo-50/20 border-x border-slate-200">
                        {rep.magazines.length > 0 ? (
                          <div className="space-y-1">
                            {rep.magazines.map((m, mIdx) => (
                              <div key={mIdx} className="bg-white p-1.5 rounded border border-indigo-100 text-[11px]">
                                <div className="font-bold text-indigo-950">{m.magazineName}</div>
                                <div className="text-[10px] text-slate-600">
                                  पृष्ठ: <strong>{m.totalPages}</strong> | विमोचन: <strong>{m.releaseDate || '-'}</strong>
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  HO प्रेषण: <strong>{m.hoSentDate || '-'}</strong>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">निरंक</span>
                        )}
                      </td>

                      {/* 2. केनराज्योति व श्रेयस */}
                      <td className="p-3 bg-indigo-50/20 border-r border-slate-200">
                        {rep.houseJournals.length > 0 ? (
                          <div className="space-y-1">
                            {rep.houseJournals.map((hj, hIdx) => (
                              <div key={hIdx} className="bg-white p-1.5 rounded border border-indigo-100 text-[11px]">
                                <div className="text-slate-700">
                                  प्रविष्टियां: <strong className="text-indigo-900">{hj.staffEntriesSentDate || '-'}</strong>
                                </div>
                                <div className="text-slate-700">
                                  गतिविधि: <strong className="text-indigo-900">{hj.activityReportSentDate || '-'}</strong>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">निरंक</span>
                        )}
                      </td>

                      {/* 3. नराकास सदस्य */}
                      <td className="p-3 bg-amber-50/20 border-r border-slate-200">
                        {rep.tolicMembers.length > 0 ? (
                          <div className="space-y-1">
                            {rep.tolicMembers.map((tm, tIdx) => (
                              <div key={tIdx} className="bg-white p-1.5 rounded border border-amber-200 text-[11px]">
                                <div className="font-bold text-amber-950">{tm.tolicName}</div>
                                <div className="text-[10px] text-slate-600">
                                  छमाही रिपोर्ट: <strong>{tm.halfYearlyReportDate || '-'}</strong> | बैठक: <strong>{tm.meetingDate || '-'}</strong>
                                </div>
                                <div className="text-[10px] text-slate-500">उपस्थित: <strong>{tm.headAttendedName || '-'}</strong></div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">सदस्य नहीं</span>
                        )}
                      </td>

                      {/* 4. नराकास संयोजक */}
                      <td className="p-3 bg-purple-50/20 border-r border-slate-200">
                        {rep.tolicConveners.length > 0 ? (
                          <div className="space-y-1">
                            {rep.tolicConveners.map((tc, cIdx) => (
                              <div key={cIdx} className="bg-white p-1.5 rounded border border-purple-200 text-[11px]">
                                <div className="font-bold text-purple-950">{tc.tolicName}</div>
                                <div className="text-[10px] text-slate-600">
                                  माह: <strong>{tc.targetCalendarMonth || '-'}</strong> | बैठक: <strong>{tc.meetingDate || '-'}</strong>
                                </div>
                                <div className="text-[10px] font-bold text-emerald-800">
                                  उपस्थित/कुल: {tc.attendedMemberOffices || 0} / {tc.totalMemberOffices || 0}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">संयोजक नहीं</span>
                        )}
                      </td>

                      {/* 5. नवोन्मेषी कार्य */}
                      <td className="p-3 bg-teal-50/20 border-r border-slate-200">
                        {rep.innovativeWorks.length > 0 ? (
                          <div className="space-y-1">
                            <span className="inline-block bg-teal-100 text-teal-900 border border-teal-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              {rep.innovativeWorks.length} कार्य दर्ज
                            </span>
                            <p className="text-[11px] text-slate-800 line-clamp-2" title={rep.innovativeWorks.join(' | ')}>
                              {rep.innovativeWorks[0]}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">कोई नहीं</span>
                        )}
                      </td>

                      {/* 6. विशेष पुरस्कार */}
                      <td className="p-3 bg-amber-50/20 border-r border-slate-200">
                        {rep.specialAwards.length > 0 ? (
                          <div className="space-y-1">
                            <span className="inline-block bg-amber-100 text-amber-950 border border-amber-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              {rep.specialAwards.length} पुरस्कार दर्ज
                            </span>
                            <p className="text-[11px] text-slate-800 line-clamp-2" title={rep.specialAwards.join(' | ')}>
                              {rep.specialAwards[0]}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">कोई नहीं</span>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => onViewPrintable(rep)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>देखें</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Signed Authentic Reports Repository (Head Office Exclusive - User Requested) */}
      {activeHoTab === 'signed_pdfs' && (
        <div className="space-y-6">
          {/* Action Feedback Banner */}
          {hoActionFeedback && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{hoActionFeedback}</span>
            </div>
          )}

          {/* Exclusive HO Repository Banner */}
          <div className="bg-gradient-to-r from-indigo-950 via-blue-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold text-xl shadow shrink-0">
                  <FileCheck2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-amber-400 text-blue-950 font-extrabold px-2.5 py-0.5 rounded-full">
                      केवल प्रधान कार्यालय स्तर पर आरक्षित
                    </span>
                    <span className="text-xs bg-blue-800/80 text-blue-100 px-2 py-0.5 rounded font-mono">
                      समीक्षा अवधि: {selectedQuarter}
                    </span>
                    <span className="text-xs bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded inline-flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-300" />
                      <span>गोपनीय केंद्रीय रिपॉजिटरी</span>
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight mt-1">
                    अखिल भारतीय हस्ताक्षरित एवं प्रमाणित रिपोर्ट रिपॉजिटरी (Authentic Signed Reports)
                  </h3>
                  <p className="text-xs text-blue-200 mt-0.5 max-w-3xl">
                    सभी क्षेत्रीय व अंचल कार्यालयों द्वारा प्रिंट निकालकर <strong>राजभाषा अधिकारी</strong> तथा <strong>कार्यालय प्रमुख (Head of Office)</strong> के भौतिक/डिजिटल हस्ताक्षर व मुहर उपरांत अपलोड की गई मूल अधिकृत प्रतियां। यह खंड अन्य अधिकारियों को नहीं दिखता।
                  </p>
                </div>
              </div>
            </div>

            {/* Quick KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-indigo-800/60">
              <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                <span className="text-[11px] text-blue-200 block">अपेक्षित रिपोर्टें (कुल अधिकारी)</span>
                <span className="text-2xl font-black text-white mt-0.5 block">{totalOfficers}</span>
                <span className="text-[10px] text-blue-300">28 अंचलों में</span>
              </div>

              <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                <span className="text-[11px] text-amber-300 font-semibold block">हस्ताक्षरित प्रतियां संलग्न</span>
                <span className="text-2xl font-black text-amber-300 mt-0.5 block">{totalSignedPdfReports}</span>
                <span className="text-[10px] text-blue-200">
                  {Math.round((totalSignedPdfReports / Math.max(1, totalOfficers)) * 100)}% अपलोड पूर्ण
                </span>
              </div>

              <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                <span className="text-[11px] text-emerald-300 font-semibold block">प्र.का. द्वारा सत्यापित</span>
                <span className="text-2xl font-black text-emerald-300 mt-0.5 block">{totalVerifiedSignedPdfReports}</span>
                <span className="text-[10px] text-emerald-200">पूर्णतः अनुमोदित</span>
              </div>

              <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                <span className="text-[11px] text-rose-300 font-semibold block">हस्ताक्षरित प्रति लंबित</span>
                <span className="text-2xl font-black text-rose-300 mt-0.5 block">
                  {Math.max(0, totalOfficers - totalSignedPdfReports)}
                </span>
                <span className="text-[10px] text-rose-200">अपलोड प्रतीक्षित</span>
              </div>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Circle Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-700">अंचल:</span>
                  <select
                    value={signedCircleFilter}
                    onChange={(e) => setSignedCircleFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold"
                  >
                    <option value="all">सभी 28 अंचल कार्यालय (All Circles)</option>
                    {circleOffices.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-700">स्थिति:</span>
                  <select
                    value={signedStatusFilter}
                    onChange={(e) => setSignedStatusFilter(e.target.value as any)}
                    className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold"
                  >
                    <option value="all">सभी स्थितियां (All Statuses)</option>
                    <option value="uploaded">केवल संलग्न प्रतियां (Attached Only)</option>
                    <option value="verified">केवल प्र.का. सत्यापित (Verified Only)</option>
                    <option value="pending">केवल लंबित (Pending Upload)</option>
                  </select>
                </div>
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="अधिकारी, स्टाफ नं., कार्यालय खोजें..."
                  value={signedSearch}
                  onChange={(e) => setSignedSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Signed PDFs Master Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-indigo-700" />
                <span>अखिल भारतीय हस्ताक्षरित रिपोर्ट सूची</span>
              </h4>
              <span className="text-xs text-slate-500 font-semibold">
                प्रदर्शित: {officers.filter((o) => {
                  if (signedCircleFilter !== 'all' && o.circleOfficeCode !== signedCircleFilter) return false;
                  const rep = quarterReports.find((r) => r.officerStaffNo === o.staffNo);
                  if (signedStatusFilter === 'uploaded' && !rep?.signedPdf) return false;
                  if (signedStatusFilter === 'verified' && rep?.signedPdf?.status !== 'प्र.का. द्वारा सत्यापित') return false;
                  if (signedStatusFilter === 'pending' && rep?.signedPdf) return false;
                  if (signedSearch) {
                    const q = signedSearch.toLowerCase();
                    return o.name.toLowerCase().includes(q) || o.staffNo.includes(q) || o.primaryOfficeName.toLowerCase().includes(q);
                  }
                  return true;
                }).length} कार्यालय
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3 w-12 text-center">क्र.</th>
                    <th className="p-3">अंचल कार्यालय (Circle)</th>
                    <th className="p-3">पदस्थापन कार्यालय (Office)</th>
                    <th className="p-3">राजभाषा अधिकारी (OL Officer)</th>
                    <th className="p-3">कार्यालय प्रमुख हस्ताक्षरकर्ता (Head Signatory)</th>
                    <th className="p-3 text-center">हस्ताक्षर दिनांक</th>
                    <th className="p-3">अपलोड विवरण</th>
                    <th className="p-3 text-center">प्र.का. सत्यापन स्थिति</th>
                    <th className="p-3 text-center">कार्रवाई (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {officers
                    .filter((off) => {
                      if (signedCircleFilter !== 'all' && off.circleOfficeCode !== signedCircleFilter) return false;
                      const rep = quarterReports.find((r) => r.officerStaffNo === off.staffNo);
                      if (signedStatusFilter === 'uploaded' && !rep?.signedPdf) return false;
                      if (signedStatusFilter === 'verified' && rep?.signedPdf?.status !== 'प्र.का. द्वारा सत्यापित') return false;
                      if (signedStatusFilter === 'pending' && rep?.signedPdf) return false;
                      if (signedSearch) {
                        const q = signedSearch.toLowerCase();
                        return off.name.toLowerCase().includes(q) || off.staffNo.includes(q) || off.primaryOfficeName.toLowerCase().includes(q);
                      }
                      return true;
                    })
                    .map((off, index) => {
                      const rep = quarterReports.find((r) => r.officerStaffNo === off.staffNo);
                      const spdf = rep?.signedPdf;

                      return (
                        <tr
                          key={off.id}
                          className={`hover:bg-blue-50/40 transition ${
                            spdf ? 'bg-white' : 'bg-slate-50/50 text-slate-500'
                          }`}
                        >
                          <td className="p-3 text-center font-bold text-slate-600">
                            {index + 1}
                          </td>

                          <td className="p-3">
                            <span className="font-bold text-blue-950 block">{off.circleOfficeName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">कोड: {off.circleOfficeCode}</span>
                          </td>

                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{off.primaryOfficeName}</span>
                            {off.concurrentOffices.length > 0 && (
                              <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 font-semibold inline-block mt-0.5">
                                + {off.concurrentOffices.length} समवर्ती प्रभार
                              </span>
                            )}
                          </td>

                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{off.name}</span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                              <span className="font-mono font-semibold">कर्म. सं: {off.staffNo}</span>
                              <span>•</span>
                              <span>{off.designation}</span>
                            </div>
                          </td>

                          <td className="p-3">
                            {spdf ? (
                              <div>
                                <span className="font-bold text-slate-900 block">
                                  {spdf.signedByHeadName || 'कार्यालय प्रमुख'}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  रा.भा. हस्ताक्षरकर्ता: {spdf.signedByOfficerName}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">लंबित</span>
                            )}
                          </td>

                          <td className="p-3 text-center">
                            {spdf?.signatureDate ? (
                              <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                {spdf.signatureDate}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          <td className="p-3">
                            {spdf ? (
                              <div className="text-[11px] space-y-0.5">
                                <span className="font-semibold text-indigo-950 block truncate max-w-[140px]" title={spdf.fileName}>
                                  {spdf.fileName}
                                </span>
                                <span className="text-[10px] text-slate-500 block">
                                  {spdf.uploadedAt ? new Date(spdf.uploadedAt).toLocaleDateString('hi-IN') : '-'}
                                  {spdf.fileSize ? ` (${(spdf.fileSize / 1024).toFixed(0)} KB)` : ''}
                                </span>
                              </div>
                            ) : (
                              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-200">
                                अप्रस्तुत
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-center">
                            {spdf ? (
                              <div className="space-y-1">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    spdf.status === 'प्र.का. द्वारा सत्यापित'
                                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                      : spdf.status === 'संशोधन अपेक्षित'
                                      ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                      : 'bg-blue-100 text-blue-900 border border-blue-300'
                                  }`}
                                >
                                  {spdf.status}
                                </span>
                                {spdf.verifiedByHOAt && (
                                  <span className="text-[9px] text-emerald-700 block font-medium">
                                    सत्यापित: {new Date(spdf.verifiedByHOAt).toLocaleDateString('hi-IN')}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px] italic">
                                ⏳ प्रति प्रतीक्षित
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-center">
                            {spdf && rep ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setSelectedSignedReport(rep)}
                                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer border border-indigo-200 transition"
                                  title="हस्ताक्षरित पीडीएफ खोलें व जांचें"
                                >
                                  <Eye className="w-3.5 h-3.5 text-indigo-700" />
                                  <span>जांचें</span>
                                </button>

                                {spdf.status !== 'प्र.का. द्वारा सत्यापित' && (
                                  <button
                                    onClick={() => {
                                      setSelectedSignedReport(rep);
                                    }}
                                    className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer shadow-xs transition"
                                    title="सत्यापित करें"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>सत्यापित</span>
                                  </button>
                                )}
                              </div>
                            ) : rep ? (
                              <button
                                onClick={() => onViewPrintable(rep)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold cursor-pointer"
                                title="डिजिटल रिपोर्ट देखें"
                              >
                                डिजिटल ड्राफ्ट देखें
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[10px]">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Full Signed PDF Viewer & Verification Modal (Exclusively for Head Office) */}
      <SignedPdfViewerModal
        isOpen={!!selectedSignedReport}
        onClose={() => setSelectedSignedReport(null)}
        record={selectedSignedReport?.signedPdf || null}
        officeName={selectedSignedReport?.primaryOfficeName}
        circleName={selectedSignedReport?.circleOfficeName}
        quarter={selectedSignedReport?.quarter}
        canVerify={true}
        onVerify={handleVerifySignedPdf}
      />
    </div>
  );
};
