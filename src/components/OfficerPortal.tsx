import React, { useState, useEffect } from 'react';
import { Officer, QuarterlyReport, Office, BranchVisitRow, CustomColumnValue } from '../types';
import { 
  FileText, 
  Send, 
  Save, 
  Download, 
  Eye, 
  Plus, 
  Trash2, 
  Languages, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Building,
  User,
  Calendar,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { exportSingleReportToExcel } from '../utils/excelExport';

import { AuthUser } from '../utils/auth';

interface Props {
  officers: Officer[];
  allOffices: Office[];
  reports: QuarterlyReport[];
  selectedQuarter: string;
  selectedFinancialYear?: string;
  selectedFromDate?: string;
  selectedToDate?: string;
  onOpenDateModal?: () => void;
  currentOfficer: Officer | null;
  onSelectOfficer: (officer: Officer) => void;
  onSaveReport: (report: QuarterlyReport) => void;
  onViewPrintable: (report: QuarterlyReport) => void;
  onAddNewOfficerModal: () => void;
  currentUser?: AuthUser | null;
}

export const OfficerPortal: React.FC<Props> = ({
  officers,
  allOffices,
  reports,
  selectedQuarter,
  selectedFinancialYear = '2026-2027',
  selectedFromDate = '2026-07-01',
  selectedToDate = '2026-09-30',
  onOpenDateModal,
  currentOfficer,
  onSelectOfficer,
  onSaveReport,
  onViewPrintable,
  onAddNewOfficerModal,
  currentUser,
}) => {
  // Find or create quarterly report for this officer and quarter
  const [reportData, setReportData] = useState<QuarterlyReport | null>(null);
  const [activeTab, setActiveTab] = useState<'basics' | 'translation' | 'visits' | 'meetings' | 'events' | 'tolic' | 'custom'>('basics');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // When officer or quarter changes, load or initialize their report
  useEffect(() => {
    if (!currentOfficer) return;

    const existing = reports.find(
      (r) => r.officerStaffNo === currentOfficer.staffNo && r.quarter === selectedQuarter
    );

    if (existing) {
      setReportData(JSON.parse(JSON.stringify(existing)));
    } else {
      // Build a fresh template
      const newReport: QuarterlyReport = {
        id: `rep-${currentOfficer.staffNo}-${Date.now()}`,
        quarter: selectedQuarter,
        financialYear: selectedFinancialYear,
        fromDate: selectedFromDate,
        toDate: selectedToDate,
        officerStaffNo: currentOfficer.staffNo,
        officerName: currentOfficer.name,
        officerDesignation: currentOfficer.designation,
        circleOfficeCode: currentOfficer.circleOfficeCode,
        circleOfficeName: currentOfficer.circleOfficeName,
        primaryOfficeName: currentOfficer.primaryOfficeName,
        concurrentOffices: [...currentOfficer.concurrentOffices],
        subordinateOfficesCount: currentOfficer.subordinateCount || 35,
        translation: {
          pagesReceivedFromHO: 0,
          receivedDate: '',
          pagesTranslatedInHindi: 0,
          sentDate: '',
          pendingPages: 0,
          remarks: '',
        },
        branchVisits: [
          {
            id: 'bv-new-1',
            regionalOfficeName: currentOfficer.primaryOfficeName,
            branchCodeOrName: '',
            visitDate: '',
            reviewLetterDate: '',
            keyObservations: '',
          },
        ],
        olicMeetings: [
          {
            id: 'olic-1',
            officeName: currentOfficer.primaryOfficeName,
            meetingDate: '',
            reportReceivedDate: '',
            reviewDate: '',
          },
        ],
        workshops: [
          {
            id: 'ws-1',
            officeName: currentOfficer.primaryOfficeName,
            workshopDate: '',
            participantsCount: 0,
            topic: 'बैंकिंग कार्य में हिंदी का प्रयोग',
          },
        ],
        regionalReports: [
          {
            id: 'rr-1',
            officeName: currentOfficer.primaryOfficeName,
            onlineSubmissionDate: '',
            controllingOfficeSentDate: '',
          },
        ],
        str18Reviews: [
          {
            id: 'str18-1',
            officeName: currentOfficer.primaryOfficeName,
            reviewDate: '',
            letterSentDate: '',
          },
        ],
        str18Submissions: [
          {
            id: 'strs-1',
            officeName: currentOfficer.primaryOfficeName,
            submissionDate: '',
          },
        ],
        paricharchas: [
          {
            id: 'p-1',
            officeName: currentOfficer.primaryOfficeName,
            eventDate: '',
            reportSentDate: '',
            cannetUploadDate: '',
          },
        ],
        seminars: [],
        representativeMeetings: [
          {
            id: 'rm-1',
            officeName: currentOfficer.primaryOfficeName,
            eventDate: '',
            reportSentDate: '',
            cannetUploadDate: '',
          },
        ],
        magazines: [
          {
            id: 'm-1',
            officeName: currentOfficer.primaryOfficeName,
            magazineName: '',
            totalPages: 0,
            releaseDate: '',
            hoSentDate: '',
          },
        ],
        houseJournals: [
          {
            id: 'hj-1',
            officeName: currentOfficer.primaryOfficeName,
            staffEntriesSentDate: '',
            activityReportSentDate: '',
          },
        ],
        tolicMembers: [
          {
            id: 'tm-1',
            officeName: currentOfficer.primaryOfficeName,
            tolicName: '',
            halfYearlyReportDate: '',
            meetingDate: '',
            headAttendedName: '',
          },
        ],
        tolicConveners: [],
        innovativeWorks: [''],
        specialAwards: [''],
        customFields: [],
        officerSignatureName: `${currentOfficer.name} (${currentOfficer.designation})`,
        officeHeadSignatureName: '',
        status: 'ड्राफ्ट (Draft)',
        updatedAt: new Date().toISOString(),
      };
      setReportData(newReport);
    }
  }, [currentOfficer, selectedQuarter, reports]);

  if (!currentOfficer || !reportData) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-white rounded-xl shadow-md border border-slate-200 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">राजभाषा अधिकारी चुनें (Select OL Officer)</h2>
        <p className="text-sm text-slate-600 mb-6 max-w-lg mx-auto">
          डेटा प्रविष्टि व रिपोर्ट जनरेट करने हेतु कृपया नीचे दी गई सूची में से अपना नाम या कर्मचारी संख्या चुनें।
        </p>

        <div className="max-w-md mx-auto mb-6 text-left">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            राजभाषा अधिकारी सूची (कुल {officers.length} अधिकारी उपलब्ध):
          </label>
          <select
            onChange={(e) => {
              const off = officers.find((o) => o.staffNo === e.target.value);
              if (off) onSelectOfficer(off);
            }}
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 font-medium"
            defaultValue=""
          >
            <option value="" disabled>
              -- अधिकारी चुनें (Select Officer) --
            </option>
            {officers.map((off) => (
              <option key={off.id} value={off.staffNo}>
                {off.staffNo} - {off.name} ({off.designation}) | {off.primaryOfficeName}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
          <span className="text-xs text-slate-500">यदि आपका नाम सूची में नहीं है:</span>
          <button
            onClick={onAddNewOfficerModal}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>नया अधिकारी प्रोफ़ाइल जोड़ें</span>
          </button>
        </div>
      </div>
    );
  }

  // Update handlers
  const handleSave = (newStatus?: QuarterlyReport['status']) => {
    if (!reportData) return;
    const updated: QuarterlyReport = {
      ...reportData,
      status: newStatus || reportData.status,
      updatedAt: new Date().toISOString(),
      submittedToCOAt: newStatus === 'अंचल को प्रस्तुत (Submitted to CO)' ? new Date().toISOString() : reportData.submittedToCOAt,
    };
    setReportData(updated);
    onSaveReport(updated);

    if (newStatus === 'अंचल को प्रस्तुत (Submitted to CO)') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setSaveSuccessMsg('रिपोर्ट सफलतापूर्वक अंचल कार्यालय (CO) को प्रेषित कर दी गई है!');
    } else {
      setSaveSuccessMsg('डेटा सफलतापूर्वक सहेज लिया गया है!');
    }

    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const updateTranslation = (field: keyof QuarterlyReport['translation'], value: any) => {
    setReportData((prev) => {
      if (!prev) return prev;
      const trans = { ...prev.translation, [field]: value };
      // auto calc pending
      const rec = Number(field === 'pagesReceivedFromHO' ? value : trans.pagesReceivedFromHO) || 0;
      const done = Number(field === 'pagesTranslatedInHindi' ? value : trans.pagesTranslatedInHindi) || 0;
      trans.pendingPages = Math.max(0, rec - done);
      return { ...prev, translation: trans };
    });
  };

  // Concurrent offices list
  const toggleConcurrentOffice = (roName: string) => {
    setReportData((prev) => {
      if (!prev) return prev;
      const exists = prev.concurrentOffices.includes(roName);
      const updated = exists
        ? prev.concurrentOffices.filter((o) => o !== roName)
        : [...prev.concurrentOffices, roName];
      return { ...prev, concurrentOffices: updated };
    });
  };

  // Branch Visits rows
  const addBranchVisit = () => {
    const newBv: BranchVisitRow = {
      id: `bv-${Date.now()}`,
      regionalOfficeName: reportData.primaryOfficeName,
      branchCodeOrName: '',
      visitDate: '',
      reviewLetterDate: '',
      keyObservations: '',
    };
    setReportData((prev) => prev ? { ...prev, branchVisits: [...(prev.branchVisits || []), newBv] } : prev);
  };

  const removeBranchVisit = (id: string) => {
    setReportData((prev) => prev ? {
      ...prev,
      branchVisits: (prev.branchVisits || []).filter((b) => b.id !== id),
    } : prev);
  };

  const updateBranchVisit = (id: string, field: keyof BranchVisitRow, val: string) => {
    setReportData((prev) => prev ? {
      ...prev,
      branchVisits: (prev.branchVisits || []).map((b) => b.id === id ? { ...b, [field]: val } : b),
    } : prev);
  };

  // Custom Fields (dynamic columns requested by user)
  const addCustomField = () => {
    const newField: CustomColumnValue = {
      id: `cf-${Date.now()}`,
      title: 'नया अतिरिक्त कॉलम',
      value: '',
      remarks: '',
    };
    setReportData((prev) => prev ? { ...prev, customFields: [...prev.customFields, newField] } : prev);
  };

  const removeCustomField = (id: string) => {
    setReportData((prev) => prev ? {
      ...prev,
      customFields: prev.customFields.filter((c) => c.id !== id),
    } : prev);
  };

  const updateCustomField = (id: string, field: keyof CustomColumnValue, val: string) => {
    setReportData((prev) => prev ? {
      ...prev,
      customFields: prev.customFields.map((c) => c.id === id ? { ...c, [field]: val } : c),
    } : prev);
  };

  // Office options for branch visits
  const availableOfficesForVisits = [
    reportData.primaryOfficeName,
    ...reportData.concurrentOffices,
  ].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Officer Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-700 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow">
              {currentOfficer.name.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{currentOfficer.name}</h2>
                <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded-full">
                  कर्मचारी संख्या: {currentOfficer.staffNo}
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                  {currentOfficer.designation}
                </span>
                <span className="text-xs bg-amber-50 text-amber-900 border border-amber-300 font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>समीक्षा अवधि: <strong>{selectedQuarter}</strong></span>
                  {onOpenDateModal && (
                    <button
                      type="button"
                      onClick={onOpenDateModal}
                      className="text-[10px] text-blue-700 underline font-bold hover:text-blue-900 ml-1 cursor-pointer"
                    >
                      (बदलें)
                    </button>
                  )}
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  <strong>मूल पदस्थापन:</strong> {reportData.primaryOfficeName}
                </span>
                <span>
                  <strong>अंचल कार्यालय (CO):</strong> {reportData.circleOfficeName}
                </span>
                <span>
                  <strong>अधीनस्थ शाखाएं:</strong> {reportData.subordinateOfficesCount}
                </span>
              </div>
            </div>
          </div>

          {/* Officer Selector & Status Badge */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">वर्तमान रिपोर्ट स्थिति</span>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  reportData.status.includes('स्वीकृत')
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : reportData.status.includes('प्रस्तुत')
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {reportData.status}
              </span>
            </div>

            {(!currentUser || currentUser.role === 'ho' || currentUser.role === 'admin') ? (
              <select
                value={currentOfficer.staffNo}
                onChange={(e) => {
                  const off = officers.find((o) => o.staffNo === e.target.value);
                  if (off) onSelectOfficer(off);
                }}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
              >
                {officers.map((o) => (
                  <option key={o.id} value={o.staffNo}>
                    {o.name} ({o.staffNo})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs bg-slate-100 text-slate-800 font-bold px-3 py-1.5 rounded-lg border border-slate-300 inline-flex items-center gap-1">
                <span>🔒 केवल अधिकृत प्रोफ़ाइल</span>
              </span>
            )}
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
        <button
          onClick={() => setActiveTab('basics')}
          className={`px-4 py-2 rounded-t-lg transition whitespace-nowrap cursor-pointer ${
            activeTab === 'basics'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          1. मूल कार्यालय व समवर्ती प्रभार (Offices)
        </button>
        <button
          onClick={() => setActiveTab('translation')}
          className={`px-4 py-2 rounded-t-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'translation'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>2. अनुवाद कार्य ट्रैकिंग (Translation)</span>
        </button>
        <button
          onClick={() => setActiveTab('visits')}
          className={`px-4 py-2 rounded-t-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'visits'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>3. शाखा निरीक्षण व भ्रमण (Branch Visits)</span>
          <span className="bg-amber-400 text-blue-950 px-1.5 py-0.2 rounded-full text-[10px]">
            {reportData.branchVisits?.length || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('meetings')}
          className={`px-4 py-2 rounded-t-lg transition whitespace-nowrap cursor-pointer ${
            activeTab === 'meetings'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          4. राकास बैठक व कार्यशाला (Meetings/Workshops)
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-t-lg transition whitespace-nowrap cursor-pointer ${
            activeTab === 'events'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          5. परिचर्चा, पत्रिका व STR-18
        </button>
        <button
          onClick={() => setActiveTab('tolic')}
          className={`px-4 py-2 rounded-t-lg transition whitespace-nowrap cursor-pointer ${
            activeTab === 'tolic'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          6. नराकास (TOLIC) व नवोन्मेषी कार्य
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2 rounded-t-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'custom'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>7. अतिरिक्त कॉलम व हस्ताक्षर (Custom)</span>
          {reportData.customFields.length > 0 && (
            <span className="bg-emerald-500 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {reportData.customFields.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Office & Concurrent Charges */}
      {activeTab === 'basics' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              <span>पदस्थापन एवं समवर्ती प्रभार कार्यालय (Concurrent Charge Offices)</span>
            </h3>
            <p className="text-xs text-slate-500">
              प्रत्येक राजभाषा अधिकारी के पास अपने मूल कार्यालय के साथ-साथ अन्य क्षेत्रीय कार्यालयों का भी समवर्ती प्रभार हो सकता है।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                मूल पदस्थापन क्षेत्रीय/अंचल कार्यालय:
              </label>
              <input
                type="text"
                value={reportData.primaryOfficeName}
                onChange={(e) => setReportData({ ...reportData, primaryOfficeName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                अधीनस्थ शाखाओं / कार्यालयों की कुल संख्या:
              </label>
              <input
                type="number"
                value={reportData.subordinateOfficesCount}
                onChange={(e) => setReportData({ ...reportData, subordinateOfficesCount: Number(e.target.value) || 0 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Concurrent Offices Selector */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800">
                समवर्ती प्रभार कार्यालय (Concurrent Regional Offices Assigned):
              </label>
              <span className="text-xs text-blue-700 font-semibold">
                चयनित: {reportData.concurrentOffices.length} कार्यालय
              </span>
            </div>

            {/* Selected badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {reportData.concurrentOffices.length > 0 ? (
                reportData.concurrentOffices.map((ro) => (
                  <span
                    key={ro}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-900 text-xs font-semibold rounded-full border border-blue-200"
                  >
                    <span>{ro}</span>
                    <button
                      onClick={() => toggleConcurrentOffice(ro)}
                      className="hover:text-red-700 font-bold ml-1 text-slate-500"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">
                  कोई समवर्ती प्रभार कार्यालय चयनित नहीं है। नीचे दी गई सूची से जोड़ें।
                </span>
              )}
            </div>

            {/* Quick add dropdown from master list */}
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    toggleConcurrentOffice(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium grow"
                defaultValue=""
              >
                <option value="" disabled>
                  + क्षेत्रीय कार्यालय सूची से समवर्ती प्रभार जोड़ें...
                </option>
                {allOffices
                  .filter((o) => o.name !== reportData.primaryOfficeName && !reportData.concurrentOffices.includes(o.name))
                  .map((o) => (
                    <option key={o.name} value={o.name}>
                      {o.name} {o.dpCode ? `(DP: ${o.dpCode})` : ''}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Translation Work (Requested Feature) */}
      {activeTab === 'translation' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Languages className="w-5 h-5 text-blue-600" />
                <span>तिमाही अनुवाद कार्य विवरण (Translation Tracking)</span>
              </h3>
              <p className="text-xs text-slate-500">
                प्रधान कार्यालय से प्राप्त अनुवाद कार्य एवं संबंधित कार्यालय द्वारा किए गए हिंदी अनुवाद का सटीक ब्यौरा
              </p>
            </div>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
              अनुपालन दर:{' '}
              {reportData.translation.pagesReceivedFromHO > 0
                ? `${Math.min(
                    100,
                    Math.round(
                      (reportData.translation.pagesTranslatedInHindi /
                        reportData.translation.pagesReceivedFromHO) *
                        100
                    )
                  )}%`
                : '100%'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pages Received */}
            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200">
              <label className="block text-xs font-bold text-blue-950 mb-1">
                HO से प्राप्त अनुवाद पृष्ठ (Pages Received):
              </label>
              <input
                type="number"
                min="0"
                value={reportData.translation.pagesReceivedFromHO}
                onChange={(e) => updateTranslation('pagesReceivedFromHO', Number(e.target.value) || 0)}
                className="w-full p-2.5 bg-white border border-blue-300 rounded-lg text-lg font-black text-blue-900"
              />
              <span className="text-[11px] text-blue-700 mt-1 block">प्रधान कार्यालय से प्राप्त सामग्री</span>
            </div>

            {/* Received Date */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                प्राप्ति की तारीख (Date of Receipt):
              </label>
              <input
                type="date"
                value={reportData.translation.receivedDate}
                onChange={(e) => updateTranslation('receivedDate', e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">दस्तावेज प्राप्त होने की तिथि</span>
            </div>

            {/* Pages Translated */}
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
              <label className="block text-xs font-bold text-emerald-950 mb-1">
                हिंदी में अनूदित पृष्ठ (Pages Translated):
              </label>
              <input
                type="number"
                min="0"
                value={reportData.translation.pagesTranslatedInHindi}
                onChange={(e) => updateTranslation('pagesTranslatedInHindi', Number(e.target.value) || 0)}
                className="w-full p-2.5 bg-white border border-emerald-300 rounded-lg text-lg font-black text-emerald-900"
              />
              <span className="text-[11px] text-emerald-700 mt-1 block">कार्यालय द्वारा पूर्ण किया गया अनुवाद</span>
            </div>

            {/* Sent Date */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                प्रेषण की तारीख (Date of Sending):
              </label>
              <input
                type="date"
                value={reportData.translation.sentDate}
                onChange={(e) => updateTranslation('sentDate', e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">अनूदित सामग्री वापस भेजने की तिथि</span>
            </div>
          </div>

          {/* Pending Pages & Remarks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-col justify-center">
              <span className="text-xs font-bold text-amber-900">शेष / लंबित पृष्ठ (Pending Pages)</span>
              <span className="text-2xl font-black text-amber-900 mt-1">
                {reportData.translation.pendingPages} पृष्ठ
              </span>
              <span className="text-[11px] text-amber-700 mt-0.5">
                {reportData.translation.pendingPages === 0
                  ? '✓ शत-प्रतिशत अनुवाद कार्य पूर्ण'
                  : 'अनुवाद कार्य प्रगति पर है'}
              </span>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                अनुवाद कार्य संबंधी विशेष टिप्पणी (Remarks on Translation Work):
              </label>
              <textarea
                rows={3}
                value={reportData.translation.remarks || ''}
                onChange={(e) => updateTranslation('remarks', e.target.value)}
                placeholder="उदा. परिपत्रों, फार्मों, वेबसाइट सामग्री एवं ग्राहक सूचनाओं का हिंदी अनुवाद..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Branch Visits (User Requested Feature) */}
      {activeTab === 'visits' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span>शाखा निरीक्षण व राजभाषा भ्रमण विवरण (Branch Visits & Inspection)</span>
              </h3>
              <p className="text-xs text-slate-500">
                अपने मूल RO और concurrent RO की कितनी और कौन-कौन सी शाखाएं विज़िट कीं, विज़िट की तारीख व समीक्षा पत्र प्रेषण तिथि
              </p>
            </div>
            <button
              onClick={addBranchVisit}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ नई शाखा विज़िट जोड़ें</span>
            </button>
          </div>

          {/* Visits Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[11px] font-bold border-b border-slate-300">
                  <th className="p-3 w-12 text-center">क्र.</th>
                  <th className="p-3 w-64">क्षेत्रीय कार्यालय (मूल/समवर्ती)</th>
                  <th className="p-3 w-64">विज़िट की गई शाखा का नाम / कोड</th>
                  <th className="p-3 w-40">विज़िट की तारीख</th>
                  <th className="p-3 w-40">समीक्षा पत्र प्रेषण तिथि</th>
                  <th className="p-3">मुख्य निष्कर्ष / अनुपालन</th>
                  <th className="p-3 w-12 text-center">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(reportData.branchVisits || []).map((bv, idx) => (
                  <tr key={bv.id} className="hover:bg-slate-50/80">
                    <td className="p-3 text-center font-bold text-slate-500">{idx + 1}.</td>
                    <td className="p-2">
                      <select
                        value={bv.regionalOfficeName}
                        onChange={(e) => updateBranchVisit(bv.id, 'regionalOfficeName', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-medium text-blue-900"
                      >
                        {availableOfficesForVisits.map((off) => (
                          <option key={off} value={off}>
                            {off}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={bv.branchCodeOrName}
                        onChange={(e) => updateBranchVisit(bv.id, 'branchCodeOrName', e.target.value)}
                        placeholder="शाखा का नाम व डीपी कोड"
                        className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-semibold"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="date"
                        value={bv.visitDate}
                        onChange={(e) => updateBranchVisit(bv.id, 'visitDate', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="date"
                        value={bv.reviewLetterDate}
                        onChange={(e) => updateBranchVisit(bv.id, 'reviewLetterDate', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={bv.keyObservations || ''}
                        onChange={(e) => updateBranchVisit(bv.id, 'keyObservations', e.target.value)}
                        placeholder="निष्कर्ष, कमियां या अनुपालन..."
                        className="w-full p-2 bg-white border border-slate-300 rounded text-xs"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => removeBranchVisit(bv.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition"
                        title="हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {(!reportData.branchVisits || reportData.branchVisits.length === 0) && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                      कोई शाखा विज़िट दर्ज नहीं है। ऊपर दिए गए बटन से शाखा निरीक्षण विवरण जोड़ें।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Meetings & Workshops */}
      {activeTab === 'meetings' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          {/* OLIC Meetings */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                राजभाषा कार्यान्वयन समिति (रा.का.स.) की बैठक (तिमाही)
              </h3>
              <button
                onClick={() => {
                  const newOlic = {
                    id: `olic-${Date.now()}`,
                    officeName: reportData.primaryOfficeName,
                    meetingDate: '',
                    reportReceivedDate: '',
                    reviewDate: '',
                  };
                  setReportData({ ...reportData, olicMeetings: [...reportData.olicMeetings, newOlic] });
                }}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-blue-900 font-semibold px-2.5 py-1 rounded"
              >
                + पंक्ति जोड़ें
              </button>
            </div>
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2 border">कार्यालय का नाम</th>
                  <th className="p-2 border">बैठक आयोजन की तिथि</th>
                  <th className="p-2 border">रिपोर्ट प्राप्ति की तिथि</th>
                  <th className="p-2 border">समीक्षा की तिथि</th>
                  <th className="p-2 border w-10">हटाएं</th>
                </tr>
              </thead>
              <tbody>
                {reportData.olicMeetings.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={row.officeName}
                        onChange={(e) => {
                          const updated = [...reportData.olicMeetings];
                          updated[idx].officeName = e.target.value;
                          setReportData({ ...reportData, olicMeetings: updated });
                        }}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="date"
                        value={row.meetingDate}
                        onChange={(e) => {
                          const updated = [...reportData.olicMeetings];
                          updated[idx].meetingDate = e.target.value;
                          setReportData({ ...reportData, olicMeetings: updated });
                        }}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="date"
                        value={row.reportReceivedDate}
                        onChange={(e) => {
                          const updated = [...reportData.olicMeetings];
                          updated[idx].reportReceivedDate = e.target.value;
                          setReportData({ ...reportData, olicMeetings: updated });
                        }}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="date"
                        value={row.reviewDate}
                        onChange={(e) => {
                          const updated = [...reportData.olicMeetings];
                          updated[idx].reviewDate = e.target.value;
                          setReportData({ ...reportData, olicMeetings: updated });
                        }}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border text-center">
                      <button
                        onClick={() => {
                          const updated = reportData.olicMeetings.filter((_, i) => i !== idx);
                          setReportData({ ...reportData, olicMeetings: updated });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Hindi Workshops */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                हिंदी कार्यशाला (तिमाही)
              </h3>
              <button
                onClick={() => {
                  const newWs = {
                    id: `ws-${Date.now()}`,
                    officeName: reportData.primaryOfficeName,
                    workshopDate: '',
                    participantsCount: 0,
                    topic: '',
                  };
                  setReportData({ ...reportData, workshops: [...reportData.workshops, newWs] });
                }}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-blue-900 font-semibold px-2.5 py-1 rounded"
              >
                + कार्यशाला जोड़ें
              </button>
            </div>
            <table className="w-full text-xs text-left border-collapse border border-slate-200">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2 border">कार्यालय का नाम</th>
                  <th className="p-2 border">कार्यशाला की तारीख</th>
                  <th className="p-2 border">प्रतिभागियों की संख्या</th>
                  <th className="p-2 border">विषय / विवरण</th>
                  <th className="p-2 border w-10">हटाएं</th>
                </tr>
              </thead>
              <tbody>
                {reportData.workshops.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={row.officeName}
                        onChange={(e) => {
                          const updated = [...reportData.workshops];
                          updated[idx].officeName = e.target.value;
                          setReportData({ ...reportData, workshops: updated });
                        }}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="date"
                        value={row.workshopDate}
                        onChange={(e) => {
                          const updated = [...reportData.workshops];
                          updated[idx].workshopDate = e.target.value;
                          setReportData({ ...reportData, workshops: updated });
                        }}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        value={row.participantsCount}
                        onChange={(e) => {
                          const updated = [...reportData.workshops];
                          updated[idx].participantsCount = Number(e.target.value) || 0;
                          setReportData({ ...reportData, workshops: updated });
                        }}
                        className="w-full p-1 border rounded font-bold"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={row.topic || ''}
                        onChange={(e) => {
                          const updated = [...reportData.workshops];
                          updated[idx].topic = e.target.value;
                          setReportData({ ...reportData, workshops: updated });
                        }}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border text-center">
                      <button
                        onClick={() => {
                          const updated = reportData.workshops.filter((_, i) => i !== idx);
                          setReportData({ ...reportData, workshops: updated });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Events, STR-18, Magazines */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          {/* STR-18 Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              एस टी आर -18 समीक्षा एवं नियंत्रण कार्यालय को प्रस्तुति (तिमाही)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 p-3 rounded-lg">
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  शाखाओं की एस टी आर -18 समीक्षा दिनांक:
                </span>
                <input
                  type="date"
                  value={reportData.str18Reviews[0]?.reviewDate || ''}
                  onChange={(e) => {
                    const rev = [...reportData.str18Reviews];
                    if (!rev[0]) rev[0] = { id: 'str-0', officeName: reportData.primaryOfficeName, reviewDate: '', letterSentDate: '' };
                    rev[0].reviewDate = e.target.value;
                    setReportData({ ...reportData, str18Reviews: rev });
                  }}
                  className="w-full p-2 border rounded text-xs"
                />
              </div>
              <div className="border border-slate-200 p-3 rounded-lg">
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  नियंत्रण कार्यालय को हस्ताक्षरित प्रस्तुति दिनांक:
                </span>
                <input
                  type="date"
                  value={reportData.str18Submissions[0]?.submissionDate || ''}
                  onChange={(e) => {
                    const sub = [...reportData.str18Submissions];
                    if (!sub[0]) sub[0] = { id: 'sub-0', officeName: reportData.primaryOfficeName, submissionDate: '' };
                    sub[0].submissionDate = e.target.value;
                    setReportData({ ...reportData, str18Submissions: sub });
                  }}
                  className="w-full p-2 border rounded text-xs"
                />
              </div>
            </div>
          </div>

          {/* Hindi Paricharcha & Seminar */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              हिंदी परिचर्चा व संगोष्ठी (आयोजन एवं केननेट में अपलोड)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600">आयोजन की तारीख</label>
                <input
                  type="date"
                  value={reportData.paricharchas[0]?.eventDate || ''}
                  onChange={(e) => {
                    const p = [...reportData.paricharchas];
                    if (!p[0]) p[0] = { id: 'p0', officeName: reportData.primaryOfficeName, eventDate: '', reportSentDate: '', cannetUploadDate: '' };
                    p[0].eventDate = e.target.value;
                    setReportData({ ...reportData, paricharchas: p });
                  }}
                  className="w-full p-2 border rounded text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">रिपोर्ट प्रेषण की तारीख</label>
                <input
                  type="date"
                  value={reportData.paricharchas[0]?.reportSentDate || ''}
                  onChange={(e) => {
                    const p = [...reportData.paricharchas];
                    if (!p[0]) p[0] = { id: 'p0', officeName: reportData.primaryOfficeName, eventDate: '', reportSentDate: '', cannetUploadDate: '' };
                    p[0].reportSentDate = e.target.value;
                    setReportData({ ...reportData, paricharchas: p });
                  }}
                  className="w-full p-2 border rounded text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">केननेट में अपलोड की तारीख</label>
                <input
                  type="date"
                  value={reportData.paricharchas[0]?.cannetUploadDate || ''}
                  onChange={(e) => {
                    const p = [...reportData.paricharchas];
                    if (!p[0]) p[0] = { id: 'p0', officeName: reportData.primaryOfficeName, eventDate: '', reportSentDate: '', cannetUploadDate: '' };
                    p[0].cannetUploadDate = e.target.value;
                    setReportData({ ...reportData, paricharchas: p });
                  }}
                  className="w-full p-2 border rounded text-xs"
                />
              </div>
            </div>
          </div>

          {/* Magazines (Patrika) */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              हिंदी में जारी पत्रिका / ई-पत्रिका / बुलेटिन (छमाही)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600">पत्रिका का नाम</label>
                <input
                  type="text"
                  placeholder="उदा. सुमन सौरभ"
                  value={reportData.magazines[0]?.magazineName || ''}
                  onChange={(e) => {
                    const m = [...reportData.magazines];
                    if (!m[0]) m[0] = { id: 'm0', officeName: reportData.primaryOfficeName, magazineName: '', totalPages: 0, releaseDate: '', hoSentDate: '' };
                    m[0].magazineName = e.target.value;
                    setReportData({ ...reportData, magazines: m });
                  }}
                  className="w-full p-2 border rounded text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">कुल पृष्ठों की संख्या</label>
                <input
                  type="number"
                  value={reportData.magazines[0]?.totalPages || 0}
                  onChange={(e) => {
                    const m = [...reportData.magazines];
                    if (!m[0]) m[0] = { id: 'm0', officeName: reportData.primaryOfficeName, magazineName: '', totalPages: 0, releaseDate: '', hoSentDate: '' };
                    m[0].totalPages = Number(e.target.value) || 0;
                    setReportData({ ...reportData, magazines: m });
                  }}
                  className="w-full p-2 border rounded text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">विमोचन की तारीख</label>
                <input
                  type="date"
                  value={reportData.magazines[0]?.releaseDate || ''}
                  onChange={(e) => {
                    const m = [...reportData.magazines];
                    if (!m[0]) m[0] = { id: 'm0', officeName: reportData.primaryOfficeName, magazineName: '', totalPages: 0, releaseDate: '', hoSentDate: '' };
                    m[0].releaseDate = e.target.value;
                    setReportData({ ...reportData, magazines: m });
                  }}
                  className="w-full p-2 border rounded text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">प्र.का. को प्रेषण तिथि</label>
                <input
                  type="date"
                  value={reportData.magazines[0]?.hoSentDate || ''}
                  onChange={(e) => {
                    const m = [...reportData.magazines];
                    if (!m[0]) m[0] = { id: 'm0', officeName: reportData.primaryOfficeName, magazineName: '', totalPages: 0, releaseDate: '', hoSentDate: '' };
                    m[0].hoSentDate = e.target.value;
                    setReportData({ ...reportData, magazines: m });
                  }}
                  className="w-full p-2 border rounded text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: TOLIC & Innovative Works */}
      {activeTab === 'tolic' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          {/* TOLIC Member */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              नगर राजभाषा कार्यान्वयन समिति (नराकास - जहाँ बैंक सदस्य है)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600">नराकास का नाम</label>
                <input
                  type="text"
                  placeholder="उदा. नराकास आगरा"
                  value={reportData.tolicMembers[0]?.tolicName || ''}
                  onChange={(e) => {
                    const tm = [...reportData.tolicMembers];
                    if (!tm[0]) tm[0] = { id: 'tm0', officeName: reportData.primaryOfficeName, tolicName: '', halfYearlyReportDate: '', meetingDate: '', headAttendedName: '' };
                    tm[0].tolicName = e.target.value;
                    setReportData({ ...reportData, tolicMembers: tm });
                  }}
                  className="w-full p-2 border rounded text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">बैठक आयोजन की तिथि</label>
                <input
                  type="date"
                  value={reportData.tolicMembers[0]?.meetingDate || ''}
                  onChange={(e) => {
                    const tm = [...reportData.tolicMembers];
                    if (!tm[0]) tm[0] = { id: 'tm0', officeName: reportData.primaryOfficeName, tolicName: '', halfYearlyReportDate: '', meetingDate: '', headAttendedName: '' };
                    tm[0].meetingDate = e.target.value;
                    setReportData({ ...reportData, tolicMembers: tm });
                  }}
                  className="w-full p-2 border rounded text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600">उपस्थित कार्यालय प्रमुख का नाम व पदनाम</label>
                <input
                  type="text"
                  placeholder="उदा. श्री राजेश कुमार, उप महाप्रबंधक"
                  value={reportData.tolicMembers[0]?.headAttendedName || ''}
                  onChange={(e) => {
                    const tm = [...reportData.tolicMembers];
                    if (!tm[0]) tm[0] = { id: 'tm0', officeName: reportData.primaryOfficeName, tolicName: '', halfYearlyReportDate: '', meetingDate: '', headAttendedName: '' };
                    tm[0].headAttendedName = e.target.value;
                    setReportData({ ...reportData, tolicMembers: tm });
                  }}
                  className="w-full p-2 border rounded text-xs"
                />
              </div>
            </div>
          </div>

          {/* Innovative Works & Special Awards */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                तिमाही के दौरान किए गए नवोन्मेषी कार्य (Innovative Works):
              </label>
              <textarea
                rows={4}
                value={reportData.innovativeWorks.join('\n')}
                onChange={(e) => setReportData({ ...reportData, innovativeWorks: e.target.value.split('\n') })}
                placeholder="प्रत्येक कार्य को नई लाइन में लिखें..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                प्राप्त विशेष पुरस्कार (Special Awards Received):
              </label>
              <textarea
                rows={4}
                value={reportData.specialAwards.join('\n')}
                onChange={(e) => setReportData({ ...reportData, specialAwards: e.target.value.split('\n') })}
                placeholder="प्रत्येक पुरस्कार को नई लाइन में लिखें..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Custom Columns & Signatures */}
      {activeTab === 'custom' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>अतिरिक्त कॉलम व कस्टम फील्ड्स (Custom Columns & Details)</span>
              </h3>
              <p className="text-xs text-slate-500">
                उपयोगकर्ता द्वारा अनुरोधित: कोई अन्य नाम, विषय, विशेष कॉलम आदि जोड़ने का पूर्ण विकल्प
              </p>
            </div>
            <button
              onClick={addCustomField}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ नया कस्टम कॉलम जोड़ें</span>
            </button>
          </div>

          {/* Dynamic custom columns list */}
          <div className="space-y-3">
            {reportData.customFields.map((cf) => (
              <div key={cf.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row gap-3 items-start md:items-center">
                <div className="w-full md:w-1/3">
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">कॉलम / फील्ड का नाम</label>
                  <input
                    type="text"
                    value={cf.title}
                    onChange={(e) => updateCustomField(cf.id, 'title', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-semibold"
                  />
                </div>
                <div className="w-full md:w-1/3">
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">मान / प्रविष्टि (Value)</label>
                  <input
                    type="text"
                    value={cf.value}
                    onChange={(e) => updateCustomField(cf.id, 'value', e.target.value)}
                    placeholder="विवरण दर्ज करें..."
                    className="w-full p-2 bg-white border border-slate-300 rounded text-xs"
                  />
                </div>
                <div className="w-full md:w-1/3">
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">विशेष टिप्पणी (Remarks)</label>
                  <input
                    type="text"
                    value={cf.remarks || ''}
                    onChange={(e) => updateCustomField(cf.id, 'remarks', e.target.value)}
                    placeholder="वैकल्पिक टिप्पणी..."
                    className="w-full p-2 bg-white border border-slate-300 rounded text-xs"
                  />
                </div>
                <button
                  onClick={() => removeCustomField(cf.id)}
                  className="mt-4 md:mt-0 p-2 text-slate-400 hover:text-red-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {reportData.customFields.length === 0 && (
              <p className="text-xs text-slate-400 italic text-center py-4">
                कोई अतिरिक्त कॉलम नहीं जोड़ा गया है। आवश्यकतानुसार ऊपर दिए गए बटन से नया कॉलम जोड़ सकते हैं।
              </p>
            )}
          </div>

          {/* Official Signatures Inputs */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                राजभाषा अधिकारी (प्रभारी) हस्ताक्षरकर्ता नाम व पदनाम:
              </label>
              <input
                type="text"
                value={reportData.officerSignatureName}
                onChange={(e) => setReportData({ ...reportData, officerSignatureName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                कार्यालय प्रमुख हस्ताक्षरकर्ता नाम व पदनाम:
              </label>
              <input
                type="text"
                value={reportData.officeHeadSignatureName}
                onChange={(e) => setReportData({ ...reportData, officeHeadSignatureName: e.target.value })}
                placeholder="उदा. श्री सुनील अरोड़ा, क्षेत्रीय प्रमुख (उप महाप्रबंधक)"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Footer */}
      <div className="mt-6 bg-white border border-slate-200 p-4 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave()}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            <Save className="w-4 h-4 text-slate-600" />
            <span>ड्राफ्ट सहेजें (Save Draft)</span>
          </button>

          <button
            onClick={() => exportSingleReportToExcel(reportData)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>एक्सेल (.xlsx) डाउनलोड करें</span>
          </button>

          <button
            onClick={() => onViewPrintable(reportData)}
            className="px-4 py-2 bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>रिपोर्ट पूर्वावलोकन / पीडीएफ (Print/PDF)</span>
          </button>
        </div>

        <button
          onClick={() => handleSave('अंचल को प्रस्तुत (Submitted to CO)')}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-lg text-xs font-extrabold inline-flex items-center gap-2 shadow-md transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>अंचल कार्यालय (CO) को प्रेषित करें</span>
        </button>
      </div>
    </div>
  );
};
