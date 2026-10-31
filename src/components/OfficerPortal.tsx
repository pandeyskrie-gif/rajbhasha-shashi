import React, { useState, useEffect } from 'react';
import { 
  Officer, 
  QuarterlyReport, 
  Office, 
  BranchVisitRow, 
  CustomColumnValue,
  OlicMeetingRow,
  WorkshopRow,
  RegionalOfficeReportRow,
  Str18ReviewRow,
  Str18SubmissionRow,
  ParicharchaRow,
  SeminarRow,
  RepresentativeMeetingRow,
  MagazineRow,
  HouseJournalRow,
  TolicMemberRow,
  TolicConvenerRow,
  SignedPdfRecord
} from '../types';
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
  Share2,
  LogOut,
  BookOpen,
  Award,
  Sparkles,
  Layers,
  Building2,
  ListOrdered,
  KeyRound,
  FileCheck2,
  Lock,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { exportSingleReportToExcel } from '../utils/excelExport';
import { SignedPdfUploadSection } from './SignedPdfUploadSection';
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
  onLogout?: () => void;
  onBackToCODesk?: () => void;
  onOpenChangePassword?: () => void;
}

export type OfficerPortalTab = 
  | 'basics' 
  | 'translation' 
  | 'visits' 
  | 'meetings' 
  | 'events' 
  | 'magazine' 
  | 'houseJournal' 
  | 'tolicMember' 
  | 'tolicConvener' 
  | 'innovative' 
  | 'awards' 
  | 'tolic' 
  | 'custom'
  | 'signed_pdf' 
  | 'all';

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
  onLogout,
  onBackToCODesk,
  onOpenChangePassword,
}) => {
  // Find or create quarterly report for this officer and quarter
  const [reportData, setReportData] = useState<QuarterlyReport | null>(null);
  const [activeTab, setActiveTab] = useState<OfficerPortalTab>('basics');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // When officer or quarter changes, load or initialize their report
  useEffect(() => {
    if (!currentOfficer) return;

    const existing = reports.find(
      (r) => r.officerStaffNo === currentOfficer.staffNo && r.quarter === selectedQuarter
    );

    if (existing) {
      const parsed: QuarterlyReport = JSON.parse(JSON.stringify(existing));
      parsed.branchVisits = parsed.branchVisits || [];
      parsed.olicMeetings = parsed.olicMeetings || [];
      parsed.workshops = parsed.workshops || [];
      parsed.regionalReports = parsed.regionalReports || [];
      parsed.str18Reviews = parsed.str18Reviews || [];
      parsed.str18Submissions = parsed.str18Submissions || [];
      parsed.paricharchas = parsed.paricharchas || [];
      parsed.seminars = parsed.seminars || [];
      parsed.representativeMeetings = parsed.representativeMeetings || [];
      parsed.magazines = parsed.magazines || [];
      parsed.houseJournals = parsed.houseJournals || [];
      parsed.tolicMembers = parsed.tolicMembers || [];
      parsed.tolicConveners = parsed.tolicConveners || [];
      parsed.customFields = parsed.customFields || [];
      parsed.innovativeWorks = parsed.innovativeWorks && parsed.innovativeWorks.length > 0 ? parsed.innovativeWorks : [''];
      parsed.specialAwards = parsed.specialAwards && parsed.specialAwards.length > 0 ? parsed.specialAwards : [''];
      setReportData(parsed);
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

  const handleUpdateSignedPdf = (signedPdf: SignedPdfRecord | null) => {
    if (!reportData) return;
    const updated: QuarterlyReport = {
      ...reportData,
      signedPdf,
      updatedAt: new Date().toISOString(),
    };
    setReportData(updated);
    onSaveReport(updated);

    if (signedPdf) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      setSaveSuccessMsg('हस्ताक्षरित एवं अनुमोदित रिपोर्ट (PDF) सफलतापूर्वक संलग्न कर दी गई है! (केवल प्र.का. स्तर पर दृश्य)');
    } else {
      setSaveSuccessMsg('हस्ताक्षरित रिपोर्ट पीडीएफ हटा दी गई है।');
    }
    setTimeout(() => setSaveSuccessMsg(''), 5000);
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

  // Office options for branch visits and data entry
  const availableOfficesForVisits = [
    reportData.primaryOfficeName,
    ...reportData.concurrentOffices,
  ].filter(Boolean);

  // Quick office list for datalists & auto-fill across all 6 tables
  const officerOfficesList = [
    reportData.primaryOfficeName,
    ...(reportData.concurrentOffices || []),
  ].filter(Boolean);

  const autoAddOfficesToTable = (tableType: 'magazine' | 'houseJournal' | 'tolicMember' | 'tolicConvener') => {
    if (!reportData) return;
    const offices = officerOfficesList.length > 0 ? officerOfficesList : [reportData.primaryOfficeName];

    if (tableType === 'magazine') {
      const existing = (reportData.magazines || []).map((m) => m.officeName.trim().toLowerCase());
      const toAdd = offices.filter((o) => !existing.includes(o.trim().toLowerCase()));
      if (toAdd.length === 0) {
        setSaveSuccessMsg('सभी आवंटित कार्यालय पहले से ही तालिका में शामिल हैं।');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
        return;
      }
      const newRows: MagazineRow[] = toAdd.map((o, idx) => ({
        id: `mag-auto-${Date.now()}-${idx}`,
        officeName: o,
        magazineName: '',
        totalPages: 0,
        releaseDate: '',
        hoSentDate: '',
      }));
      setReportData({ ...reportData, magazines: [...(reportData.magazines || []), ...newRows] });
    } else if (tableType === 'houseJournal') {
      const existing = (reportData.houseJournals || []).map((m) => m.officeName.trim().toLowerCase());
      const toAdd = offices.filter((o) => !existing.includes(o.trim().toLowerCase()));
      if (toAdd.length === 0) {
        setSaveSuccessMsg('सभी आवंटित कार्यालय पहले से ही तालिका में शामिल हैं।');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
        return;
      }
      const newRows: HouseJournalRow[] = toAdd.map((o, idx) => ({
        id: `hj-auto-${Date.now()}-${idx}`,
        officeName: o,
        staffEntriesSentDate: '',
        activityReportSentDate: '',
      }));
      setReportData({ ...reportData, houseJournals: [...(reportData.houseJournals || []), ...newRows] });
    } else if (tableType === 'tolicMember') {
      const existing = (reportData.tolicMembers || []).map((m) => m.officeName.trim().toLowerCase());
      const toAdd = offices.filter((o) => !existing.includes(o.trim().toLowerCase()));
      if (toAdd.length === 0) {
        setSaveSuccessMsg('सभी आवंटित कार्यालय पहले से ही तालिका में शामिल हैं।');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
        return;
      }
      const newRows: TolicMemberRow[] = toAdd.map((o, idx) => ({
        id: `tm-auto-${Date.now()}-${idx}`,
        officeName: o,
        tolicName: '',
        halfYearlyReportDate: '',
        meetingDate: '',
        headAttendedName: '',
      }));
      setReportData({ ...reportData, tolicMembers: [...(reportData.tolicMembers || []), ...newRows] });
    } else if (tableType === 'tolicConvener') {
      const existing = (reportData.tolicConveners || []).map((m) => m.officeName.trim().toLowerCase());
      const toAdd = offices.filter((o) => !existing.includes(o.trim().toLowerCase()));
      if (toAdd.length === 0) {
        setSaveSuccessMsg('सभी आवंटित कार्यालय पहले से ही तालिका में शामिल हैं।');
        setTimeout(() => setSaveSuccessMsg(''), 4000);
        return;
      }
      const newRows: TolicConvenerRow[] = toAdd.map((o, idx) => ({
        id: `tc-auto-${Date.now()}-${idx}`,
        officeName: o,
        tolicName: '',
        targetCalendarMonth: 'अगस्त 2026',
        meetingDate: '',
        headAttendedName: '',
        totalMemberOffices: 0,
        attendedMemberOffices: 0,
      }));
      setReportData({ ...reportData, tolicConveners: [...(reportData.tolicConveners || []), ...newRows] });
    }
  };

  const addNilRow = (tableType: 'magazine' | 'houseJournal' | 'tolicMember' | 'tolicConvener' | 'innovative' | 'awards') => {
    if (!reportData) return;
    if (tableType === 'magazine') {
      const newRow: MagazineRow = {
        id: `mag-nil-${Date.now()}`,
        officeName: reportData.primaryOfficeName,
        magazineName: 'लागू नहीं / निरंक (NIL)',
        totalPages: 0,
        releaseDate: '',
        hoSentDate: '',
      };
      setReportData({ ...reportData, magazines: [...(reportData.magazines || []), newRow] });
    } else if (tableType === 'houseJournal') {
      const newRow: HouseJournalRow = {
        id: `hj-nil-${Date.now()}`,
        officeName: reportData.primaryOfficeName,
        staffEntriesSentDate: 'लागू नहीं (NIL)',
        activityReportSentDate: 'लागू नहीं (NIL)',
      };
      setReportData({ ...reportData, houseJournals: [...(reportData.houseJournals || []), newRow] });
    } else if (tableType === 'tolicMember') {
      const newRow: TolicMemberRow = {
        id: `tm-nil-${Date.now()}`,
        officeName: reportData.primaryOfficeName,
        tolicName: 'लागू नहीं / निरंक (NIL)',
        halfYearlyReportDate: '',
        meetingDate: '',
        headAttendedName: 'लागू नहीं',
      };
      setReportData({ ...reportData, tolicMembers: [...(reportData.tolicMembers || []), newRow] });
    } else if (tableType === 'tolicConvener') {
      const newRow: TolicConvenerRow = {
        id: `tc-nil-${Date.now()}`,
        officeName: reportData.primaryOfficeName,
        tolicName: 'लागू नहीं / बैंक संयोजक नहीं है',
        targetCalendarMonth: 'लागू नहीं',
        meetingDate: '',
        headAttendedName: 'लागू नहीं',
        totalMemberOffices: 0,
        attendedMemberOffices: 0,
      };
      setReportData({ ...reportData, tolicConveners: [...(reportData.tolicConveners || []), newRow] });
    } else if (tableType === 'innovative') {
      setReportData({
        ...reportData,
        innovativeWorks: [...(reportData.innovativeWorks || []).filter(Boolean), 'लागू नहीं / निरंक (NIL)'],
      });
    } else if (tableType === 'awards') {
      setReportData({
        ...reportData,
        specialAwards: [...(reportData.specialAwards || []).filter(Boolean), 'लागू नहीं / निरंक (NIL)'],
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Circle Office In-charge Mode Navigation Banner */}
      {currentUser?.role === 'co' && (
        <div className="mb-5 p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-xl shadow-sm border border-blue-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold shrink-0 shadow">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs text-amber-300">
                  अंचल राजभाषा प्रभारी मोड (Circle Office Edit Mode)
                </span>
                <span className="text-[10px] bg-indigo-500/40 text-blue-100 border border-indigo-400/40 px-2 py-0.5 rounded font-mono">
                  {currentUser.circleOfficeName}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                आप वर्तमान में <strong>{currentOfficer.name}</strong> ({currentOfficer.primaryOfficeName}) की रिपोर्ट भर / संपादित कर रहे हैं।
              </p>
            </div>
          </div>

          {onBackToCODesk && (
            <button
              type="button"
              onClick={onBackToCODesk}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Building className="w-3.5 h-3.5" />
              <span>2. अधीनस्थ RO समेकन व HO प्रेषण तालिका पर जाएँ</span>
            </button>
          )}
        </div>
      )}

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

            {(!currentUser || currentUser.role === 'ho' || currentUser.role === 'admin' || currentUser.role === 'co') ? (
              <div className="flex items-center gap-2">
                <select
                  value={currentOfficer.staffNo}
                  onChange={(e) => {
                    const off = officers.find((o) => o.staffNo === e.target.value);
                    if (off) onSelectOfficer(off);
                  }}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium max-w-[220px]"
                >
                  {(currentUser?.role === 'co'
                    ? officers.filter((o) => o.circleOfficeCode === currentUser.circleOfficeCode)
                    : officers
                  ).map((o) => (
                    <option key={o.id} value={o.staffNo}>
                      {o.name} ({o.staffNo}) {o.primaryOfficeType === 'CO' ? '⭐ [अंचल]' : ''}
                    </option>
                  ))}
                </select>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-xs bg-red-50 hover:bg-red-100 text-red-700 font-semibold px-2 py-1.5 rounded-lg border border-red-200 transition inline-flex items-center gap-1 cursor-pointer"
                    title="लॉगआउट करें"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-100 text-slate-800 font-bold px-3 py-1.5 rounded-lg border border-slate-300 inline-flex items-center gap-1">
                  <span>🔒 केवल अधिकृत प्रोफ़ाइल</span>
                </span>
                {onOpenChangePassword && (
                  <button
                    type="button"
                    onClick={onOpenChangePassword}
                    className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold px-2.5 py-1.5 rounded-lg border border-amber-300 transition inline-flex items-center gap-1 cursor-pointer"
                    title="अपना व्यक्तिगत पासवर्ड बदलें"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    <span>पासवर्ड बदलें</span>
                  </button>
                )}
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-xs bg-red-50 hover:bg-red-100 text-red-700 font-semibold px-2.5 py-1.5 rounded-lg border border-red-200 hover:border-red-300 transition inline-flex items-center gap-1 cursor-pointer"
                    title="वर्तमान सत्र से बाहर निकलें व अन्य अधिकारी के रूप में लॉगिन करें"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>अन्य अधिकारी लॉगिन</span>
                  </button>
                )}
              </div>
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

      {/* Officer assigned offices datalist for easy 1-click autocomplete */}
      <datalist id="officer-assigned-offices">
        <option value={reportData.primaryOfficeName} />
        {reportData.concurrentOffices.map((off, idx) => (
          <option key={idx} value={off} />
        ))}
      </datalist>

      {/* 6 Official Sections Quick-Jump & Direct Data Entry Access Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-xl p-4 mb-6 shadow-md border border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-blue-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-blue-950 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                <span>आधिकारिक प्रपत्र के 6 विशिष्ट स्तम्भ (Direct Data Entry Shortcuts)</span>
                <span className="text-[10px] bg-amber-400 text-blue-950 font-extrabold px-2 py-0.5 rounded-full uppercase">
                  PDF तालिका 10, 11, 12, 13 तथा भाग 14, 15
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                प्रत्येक राजभाषा अधिकारी अपने मूल व समवर्ती कार्यालयों हेतु नीचे दिए गए 6 स्तम्भों में सीधा डेटा दर्ज कर सकते हैं:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'all' ? 'basics' : 'all')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition inline-flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-amber-400 text-blue-950 border-amber-300 shadow-sm'
                  : 'bg-blue-800/80 hover:bg-blue-700 text-white border-blue-600'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{activeTab === 'all' ? '✓ सम्पूर्ण प्रपत्र मोड सक्रिय' : '📄 सम्पूर्ण प्रपत्र एक साथ देखें (All-in-One)'}</span>
            </button>
          </div>
        </div>

        {/* 6 Quick Entry Action Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab('magazine')}
            className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
              activeTab === 'magazine'
                ? 'bg-blue-600 border-amber-400 text-white shadow ring-2 ring-amber-400'
                : 'bg-white/10 hover:bg-white/15 border-white/15 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-amber-300">तालिका 10</span>
              <span className="text-[10px] bg-blue-500/60 px-1.5 py-0.5 rounded font-mono font-bold">
                {reportData.magazines?.length || 0}
              </span>
            </div>
            <span className="text-xs font-semibold leading-tight line-clamp-2">हिंदी पत्रिका / ई-पत्रिका (छमाही)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('houseJournal')}
            className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
              activeTab === 'houseJournal'
                ? 'bg-blue-600 border-amber-400 text-white shadow ring-2 ring-amber-400'
                : 'bg-white/10 hover:bg-white/15 border-white/15 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-amber-300">तालिका 11</span>
              <span className="text-[10px] bg-blue-500/60 px-1.5 py-0.5 rounded font-mono font-bold">
                {reportData.houseJournals?.length || 0}
              </span>
            </div>
            <span className="text-xs font-semibold leading-tight line-clamp-2">केनराज्योति व श्रेयस प्रविष्टियां</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tolicMember')}
            className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
              activeTab === 'tolicMember'
                ? 'bg-blue-600 border-amber-400 text-white shadow ring-2 ring-amber-400'
                : 'bg-white/10 hover:bg-white/15 border-white/15 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-amber-300">तालिका 12</span>
              <span className="text-[10px] bg-blue-500/60 px-1.5 py-0.5 rounded font-mono font-bold">
                {reportData.tolicMembers?.length || 0}
              </span>
            </div>
            <span className="text-xs font-semibold leading-tight line-clamp-2">नराकास (बैंक सदस्य है)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tolicConvener')}
            className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
              activeTab === 'tolicConvener'
                ? 'bg-blue-600 border-amber-400 text-white shadow ring-2 ring-amber-400'
                : 'bg-white/10 hover:bg-white/15 border-white/15 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-amber-300">तालिका 13</span>
              <span className="text-[10px] bg-blue-500/60 px-1.5 py-0.5 rounded font-mono font-bold">
                {reportData.tolicConveners?.length || 0}
              </span>
            </div>
            <span className="text-xs font-semibold leading-tight line-clamp-2">नराकास (बैंक संयोजक है)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('innovative')}
            className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
              activeTab === 'innovative'
                ? 'bg-blue-600 border-amber-400 text-white shadow ring-2 ring-amber-400'
                : 'bg-white/10 hover:bg-white/15 border-white/15 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-amber-300">भाग 14</span>
              <span className="text-[10px] bg-blue-500/60 px-1.5 py-0.5 rounded font-mono font-bold">
                {(reportData.innovativeWorks || []).filter(Boolean).length}
              </span>
            </div>
            <span className="text-xs font-semibold leading-tight line-clamp-2">तिमाही में किए गए नवोन्मेषी कार्य</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('awards')}
            className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
              activeTab === 'awards'
                ? 'bg-blue-600 border-amber-400 text-white shadow ring-2 ring-amber-400'
                : 'bg-white/10 hover:bg-white/15 border-white/15 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-amber-300">भाग 15</span>
              <span className="text-[10px] bg-blue-500/60 px-1.5 py-0.5 rounded font-mono font-bold">
                {(reportData.specialAwards || []).filter(Boolean).length}
              </span>
            </div>
            <span className="text-xs font-semibold leading-tight line-clamp-2">कार्यालयों को प्राप्त विशेष पुरस्कार</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 mb-6 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
        <button
          onClick={() => setActiveTab('basics')}
          className={`px-3 py-2 rounded-t-lg transition whitespace-nowrap cursor-pointer ${
            activeTab === 'basics'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          1. पदस्थापन व समवर्ती (तालिका 1)
        </button>
        <button
          onClick={() => setActiveTab('translation')}
          className={`px-3 py-2 rounded-t-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            activeTab === 'translation'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>2. अनुवाद (Translation)</span>
        </button>
        <button
          onClick={() => setActiveTab('visits')}
          className={`px-3 py-2 rounded-t-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            activeTab === 'visits'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>3. शाखा निरीक्षण</span>
          <span className="bg-amber-400 text-blue-950 px-1.5 py-0.2 rounded-full text-[10px]">
            {reportData.branchVisits?.length || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('meetings')}
          className={`px-3 py-2 rounded-t-lg transition whitespace-nowrap cursor-pointer ${
            activeTab === 'meetings'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          4. राकास, कार्यशाला (तालिका 2-4)
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-3 py-2 rounded-t-lg transition whitespace-nowrap cursor-pointer ${
            activeTab === 'events'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          5. STR-18, संगोष्ठी (तालिका 5-9)
        </button>
        <button
          onClick={() => setActiveTab('magazine')}
          className={`px-3 py-2 rounded-t-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            activeTab === 'magazine'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>6. पत्रिका (तालिका 10)</span>
          <span className="bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded-full text-[10px]">
            {reportData.magazines?.length || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('houseJournal')}
          className={`px-3 py-2 rounded-t-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            activeTab === 'houseJournal'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>7. केनराज्योति/श्रेयस (तालिका 11)</span>
          <span className="bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded-full text-[10px]">
            {reportData.houseJournals?.length || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('tolicMember')}
          className={`px-3 py-2 rounded-t-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            activeTab === 'tolicMember'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>8. नराकास सदस्य (तालिका 12)</span>
          <span className="bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded-full text-[10px]">
            {reportData.tolicMembers?.length || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('tolicConvener')}
          className={`px-3 py-2 rounded-t-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            activeTab === 'tolicConvener'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>9. नराकास संयोजक (तालिका 13)</span>
          <span className="bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded-full text-[10px]">
            {reportData.tolicConveners?.length || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('innovative')}
          className={`px-3 py-2 rounded-t-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            activeTab === 'innovative'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>10. नवोन्मेषी कार्य (भाग 14)</span>
          <span className="bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded-full text-[10px]">
            {(reportData.innovativeWorks || []).filter(Boolean).length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('awards')}
          className={`px-3 py-2 rounded-t-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            activeTab === 'awards'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>11. विशेष पुरस्कार (भाग 15)</span>
          <span className="bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded-full text-[10px]">
            {(reportData.specialAwards || []).filter(Boolean).length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-3 py-2 rounded-t-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            activeTab === 'custom'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>12. अतिरिक्त व हस्ताक्षर</span>
        </button>
        <button
          onClick={() => setActiveTab('signed_pdf')}
          className={`px-3 py-2 rounded-t-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'signed_pdf'
              ? 'bg-indigo-700 text-white shadow-sm font-bold'
              : 'text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>13. हस्ताक्षरित रिपोर्ट (Signed PDF)</span>
          {reportData.signedPdf ? (
            <span className="bg-emerald-500 text-white px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              ✓ संलग्न
            </span>
          ) : (
            <span className="bg-amber-400 text-blue-950 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              लंबित
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-2 rounded-t-lg transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            activeTab === 'all'
              ? 'bg-amber-500 text-white shadow-sm font-bold'
              : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>📑 सम्पूर्ण प्रपत्र (All-in-One)</span>
        </button>
      </div>

      {/* Tab 1: Office & Concurrent Charges */}
      {(activeTab === 'basics' || activeTab === 'all') && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 mb-6">
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
      {(activeTab === 'translation' || activeTab === 'all') && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 mb-6">
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
      {(activeTab === 'visits' || activeTab === 'all') && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 mb-6">
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

      {/* Tab 4: Meetings, Workshops & Regional Report (Tables 2, 3, 4) */}
      {(activeTab === 'meetings' || activeTab === 'all') && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8 mb-6">
          {/* Table 2: OLIC Meetings */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-3 border-b border-slate-200 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">2</span>
                  <span>राजभाषा कार्यान्वयन समिति की बैठक (तिमाही)</span>
                </h3>
                <p className="text-[11px] text-slate-500">Official Language Implementation Committee (OLIC) Quarterly Meeting</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newOlic: OlicMeetingRow = {
                    id: `olic-${Date.now()}`,
                    officeName: reportData.primaryOfficeName,
                    meetingDate: '',
                    reportReceivedDate: '',
                    reviewDate: '',
                  };
                  setReportData({ ...reportData, olicMeetings: [...(reportData.olicMeetings || []), newOlic] });
                }}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold px-3 py-1.5 rounded-lg border border-blue-200 inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ पंक्ति जोड़ें</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5 border border-slate-300 w-12 text-center">क्रम सं.</th>
                    <th className="p-2.5 border border-slate-300 min-w-56">कार्यालय का नाम</th>
                    <th className="p-2.5 border border-slate-300 w-40 text-center">बैठक आयोजन की तिथि</th>
                    <th className="p-2.5 border border-slate-300 w-40 text-center">रिपोर्ट प्राप्ति की तिथि</th>
                    <th className="p-2.5 border border-slate-300 w-40 text-center">समीक्षा की तिथि</th>
                    <th className="p-2.5 border border-slate-300 w-12 text-center">हटाएं</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData.olicMeetings || []).map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/80">
                      <td className="p-2.5 border border-slate-300 text-center font-semibold text-slate-600">{idx + 1}.</td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="text"
                          value={row.officeName}
                          onChange={(e) => {
                            const updated = [...reportData.olicMeetings];
                            updated[idx].officeName = e.target.value;
                            setReportData({ ...reportData, olicMeetings: updated });
                          }}
                          placeholder="कार्यालय का नाम"
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-medium"
                        />
                      </td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="date"
                          value={row.meetingDate}
                          onChange={(e) => {
                            const updated = [...reportData.olicMeetings];
                            updated[idx].meetingDate = e.target.value;
                            setReportData({ ...reportData, olicMeetings: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="date"
                          value={row.reportReceivedDate}
                          onChange={(e) => {
                            const updated = [...reportData.olicMeetings];
                            updated[idx].reportReceivedDate = e.target.value;
                            setReportData({ ...reportData, olicMeetings: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="date"
                          value={row.reviewDate}
                          onChange={(e) => {
                            const updated = [...reportData.olicMeetings];
                            updated[idx].reviewDate = e.target.value;
                            setReportData({ ...reportData, olicMeetings: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-300 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = reportData.olicMeetings.filter((_, i) => i !== idx);
                            setReportData({ ...reportData, olicMeetings: updated });
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 transition"
                          title="हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!reportData.olicMeetings || reportData.olicMeetings.length === 0) && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400 italic">
                        कोई विवरण दर्ज नहीं है। ऊपर दिए गए बटन से पंक्ति जोड़ें।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 3: Hindi Workshops */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-3 border-b border-slate-200 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">3</span>
                  <span>हिंदी कार्यशाला (तिमाही)</span>
                </h3>
                <p className="text-[11px] text-slate-500">Quarterly Hindi Workshop for Staff</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newWs: WorkshopRow = {
                    id: `ws-${Date.now()}`,
                    officeName: reportData.primaryOfficeName,
                    workshopDate: '',
                    participantsCount: 0,
                    topic: 'बैंकिंग कार्य में हिंदी का प्रयोग',
                  };
                  setReportData({ ...reportData, workshops: [...(reportData.workshops || []), newWs] });
                }}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold px-3 py-1.5 rounded-lg border border-blue-200 inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ कार्यशाला जोड़ें</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5 border border-slate-300 w-12 text-center">क्रम सं.</th>
                    <th className="p-2.5 border border-slate-300 min-w-56">कार्यालय का नाम</th>
                    <th className="p-2.5 border border-slate-300 w-40 text-center">कार्यशाला की तारीख</th>
                    <th className="p-2.5 border border-slate-300 w-36 text-center">उपस्थित प्रतिभागियों की संख्या</th>
                    <th className="p-2.5 border border-slate-300 min-w-56">विषय / विवरण</th>
                    <th className="p-2.5 border border-slate-300 w-12 text-center">हटाएं</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData.workshops || []).map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/80">
                      <td className="p-2.5 border border-slate-300 text-center font-semibold text-slate-600">{idx + 1}.</td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="text"
                          value={row.officeName}
                          onChange={(e) => {
                            const updated = [...reportData.workshops];
                            updated[idx].officeName = e.target.value;
                            setReportData({ ...reportData, workshops: updated });
                          }}
                          placeholder="कार्यालय का नाम"
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-medium"
                        />
                      </td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="date"
                          value={row.workshopDate}
                          onChange={(e) => {
                            const updated = [...reportData.workshops];
                            updated[idx].workshopDate = e.target.value;
                            setReportData({ ...reportData, workshops: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="number"
                          value={row.participantsCount}
                          onChange={(e) => {
                            const updated = [...reportData.workshops];
                            updated[idx].participantsCount = Number(e.target.value) || 0;
                            setReportData({ ...reportData, workshops: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-center"
                        />
                      </td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="text"
                          value={row.topic || ''}
                          onChange={(e) => {
                            const updated = [...reportData.workshops];
                            updated[idx].topic = e.target.value;
                            setReportData({ ...reportData, workshops: updated });
                          }}
                          placeholder="कार्यशाला का विषय..."
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-300 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = reportData.workshops.filter((_, i) => i !== idx);
                            setReportData({ ...reportData, workshops: updated });
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 transition"
                          title="हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!reportData.workshops || reportData.workshops.length === 0) && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400 italic">
                        कोई विवरण दर्ज नहीं है। ऊपर दिए गए बटन से कार्यशाला जोड़ें।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 4: Regional Office Report to Implementation Office */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-3 border-b border-slate-200 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">4</span>
                  <span>क्षेत्रीय कार्यान्वयन कार्यालय को प्रेषित रिपोर्ट (तिमाही)</span>
                </h3>
                <p className="text-[11px] text-slate-500">Report Sent to Regional Implementation Office (RIO)</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newRow: RegionalOfficeReportRow = {
                    id: `rr-${Date.now()}`,
                    officeName: reportData.primaryOfficeName,
                    onlineSubmissionDate: '',
                    controllingOfficeSentDate: '',
                  };
                  setReportData({ ...reportData, regionalReports: [...(reportData.regionalReports || []), newRow] });
                }}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold px-3 py-1.5 rounded-lg border border-blue-200 inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ पंक्ति जोड़ें</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5 border border-slate-300 w-12 text-center">क्रम सं.</th>
                    <th className="p-2.5 border border-slate-300 min-w-56">कार्यालय का नाम</th>
                    <th className="p-2.5 border border-slate-300 w-48 text-center">ऑनलाइन प्रस्तुति दिनांक</th>
                    <th className="p-2.5 border border-slate-300 w-64 text-center">रिपोर्ट नियंत्रण कार्यालय को प्रेषण की तारीख</th>
                    <th className="p-2.5 border border-slate-300 w-12 text-center">हटाएं</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData.regionalReports || []).map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/80">
                      <td className="p-2.5 border border-slate-300 text-center font-semibold text-slate-600">{idx + 1}.</td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="text"
                          value={row.officeName}
                          onChange={(e) => {
                            const updated = [...reportData.regionalReports];
                            updated[idx].officeName = e.target.value;
                            setReportData({ ...reportData, regionalReports: updated });
                          }}
                          placeholder="कार्यालय का नाम"
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-medium"
                        />
                      </td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="date"
                          value={row.onlineSubmissionDate}
                          onChange={(e) => {
                            const updated = [...reportData.regionalReports];
                            updated[idx].onlineSubmissionDate = e.target.value;
                            setReportData({ ...reportData, regionalReports: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="date"
                          value={row.controllingOfficeSentDate}
                          onChange={(e) => {
                            const updated = [...reportData.regionalReports];
                            updated[idx].controllingOfficeSentDate = e.target.value;
                            setReportData({ ...reportData, regionalReports: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-300 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = reportData.regionalReports.filter((_, i) => i !== idx);
                            setReportData({ ...reportData, regionalReports: updated });
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 transition"
                          title="हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!reportData.regionalReports || reportData.regionalReports.length === 0) && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400 italic">
                        कोई विवरण दर्ज नहीं है। ऊपर दिए गए बटन से पंक्ति जोड़ें।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: STR-18, Paricharcha, Seminar & Rep Meeting (Tables 5, 6, 7, 8, 9) */}
      {(activeTab === 'events' || activeTab === 'all') && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8 mb-6">
          {/* Table 5: STR-18 Review */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-3 border-b border-slate-200 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">5</span>
                  <span>क्षेत्राधीन सभी शाखाओं/ क्षेत्रीय कार्यालयों की एस टी आर -18 की समीक्षा (तिमाही)</span>
                </h3>
                <p className="text-[11px] text-slate-500">Quarterly Review of STR-18 of all Branches & Regional Offices</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newRow: Str18ReviewRow = {
                    id: `str18-${Date.now()}`,
                    officeName: reportData.primaryOfficeName,
                    reviewDate: '',
                    letterSentDate: '',
                  };
                  setReportData({ ...reportData, str18Reviews: [...(reportData.str18Reviews || []), newRow] });
                }}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold px-3 py-1.5 rounded-lg border border-blue-200 inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ पंक्ति जोड़ें</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5 border border-slate-300 w-12 text-center">क्रम सं.</th>
                    <th className="p-2.5 border border-slate-300 min-w-56">कार्यालय का नाम</th>
                    <th className="p-2.5 border border-slate-300 w-44 text-center">समीक्षा दिनांक</th>
                    <th className="p-2.5 border border-slate-300 w-64 text-center">संबंधित शाखा को समीक्षा पत्र का प्रेषण</th>
                    <th className="p-2.5 border border-slate-300 w-12 text-center">हटाएं</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData.str18Reviews || []).map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/80">
                      <td className="p-2.5 border border-slate-300 text-center font-semibold text-slate-600">{idx + 1}.</td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="text"
                          value={row.officeName}
                          onChange={(e) => {
                            const updated = [...reportData.str18Reviews];
                            updated[idx].officeName = e.target.value;
                            setReportData({ ...reportData, str18Reviews: updated });
                          }}
                          placeholder="कार्यालय का नाम"
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-medium"
                        />
                      </td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="date"
                          value={row.reviewDate}
                          onChange={(e) => {
                            const updated = [...reportData.str18Reviews];
                            updated[idx].reviewDate = e.target.value;
                            setReportData({ ...reportData, str18Reviews: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="date"
                          value={row.letterSentDate}
                          onChange={(e) => {
                            const updated = [...reportData.str18Reviews];
                            updated[idx].letterSentDate = e.target.value;
                            setReportData({ ...reportData, str18Reviews: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-300 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = reportData.str18Reviews.filter((_, i) => i !== idx);
                            setReportData({ ...reportData, str18Reviews: updated });
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 transition"
                          title="हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!reportData.str18Reviews || reportData.str18Reviews.length === 0) && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400 italic">
                        कोई विवरण दर्ज नहीं है। ऊपर दिए गए बटन से पंक्ति जोड़ें।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 6: STR-18 Submission to Controlling Office */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-3 border-b border-slate-200 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">6</span>
                  <span>नियंत्रण कार्यालय को हस्ताक्षरित एस टी आर -18 की प्रस्तुति (तिमाही)</span>
                </h3>
                <p className="text-[11px] text-slate-500">Submission of Signed STR-18 to Controlling Office</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newRow: Str18SubmissionRow = {
                    id: `strs-${Date.now()}`,
                    officeName: reportData.primaryOfficeName,
                    submissionDate: '',
                  };
                  setReportData({ ...reportData, str18Submissions: [...(reportData.str18Submissions || []), newRow] });
                }}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold px-3 py-1.5 rounded-lg border border-blue-200 inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ पंक्ति जोड़ें</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5 border border-slate-300 w-12 text-center">क्रम सं.</th>
                    <th className="p-2.5 border border-slate-300 min-w-56">कार्यालय का नाम</th>
                    <th className="p-2.5 border border-slate-300 w-56 text-center">प्रस्तुति दिनांक</th>
                    <th className="p-2.5 border border-slate-300 w-12 text-center">हटाएं</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData.str18Submissions || []).map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/80">
                      <td className="p-2.5 border border-slate-300 text-center font-semibold text-slate-600">{idx + 1}.</td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="text"
                          value={row.officeName}
                          onChange={(e) => {
                            const updated = [...reportData.str18Submissions];
                            updated[idx].officeName = e.target.value;
                            setReportData({ ...reportData, str18Submissions: updated });
                          }}
                          placeholder="कार्यालय का नाम"
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-medium"
                        />
                      </td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="date"
                          value={row.submissionDate}
                          onChange={(e) => {
                            const updated = [...reportData.str18Submissions];
                            updated[idx].submissionDate = e.target.value;
                            setReportData({ ...reportData, str18Submissions: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-300 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = reportData.str18Submissions.filter((_, i) => i !== idx);
                            setReportData({ ...reportData, str18Submissions: updated });
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 transition"
                          title="हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!reportData.str18Submissions || reportData.str18Submissions.length === 0) && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400 italic">
                        कोई विवरण दर्ज नहीं है। ऊपर दिए गए बटन से पंक्ति जोड़ें।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 7: Hindi Paricharcha */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-3 border-b border-slate-200 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">7</span>
                  <span>हिंदी परिचर्चा (तिमाही)</span>
                </h3>
                <p className="text-[11px] text-slate-500">Quarterly Hindi Discussion / Paricharcha</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newRow: ParicharchaRow = {
                    id: `p-${Date.now()}`,
                    officeName: reportData.primaryOfficeName,
                    eventDate: '',
                    reportSentDate: '',
                    cannetUploadDate: '',
                  };
                  setReportData({ ...reportData, paricharchas: [...(reportData.paricharchas || []), newRow] });
                }}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold px-3 py-1.5 rounded-lg border border-blue-200 inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ परिचर्चा विवरण जोड़ें</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5 border border-slate-300 w-12 text-center">क्रम सं.</th>
                    <th className="p-2.5 border border-slate-300 min-w-56">कार्यालय का नाम</th>
                    <th className="p-2.5 border border-slate-300 w-40 text-center">आयोजन की तारीख</th>
                    <th className="p-2.5 border border-slate-300 w-44 text-center">रिपोर्ट प्रेषण की तारीख</th>
                    <th className="p-2.5 border border-slate-300 w-52 text-center">केननेट में रिपोर्ट अपलोड करने की तारीख</th>
                    <th className="p-2.5 border border-slate-300 w-12 text-center">हटाएं</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData.paricharchas || []).map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/80">
                      <td className="p-2.5 border border-slate-300 text-center font-semibold text-slate-600">{idx + 1}.</td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="text"
                          value={row.officeName}
                          onChange={(e) => {
                            const updated = [...reportData.paricharchas];
                            updated[idx].officeName = e.target.value;
                            setReportData({ ...reportData, paricharchas: updated });
                          }}
                          placeholder="कार्यालय का नाम"
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-medium"
                        />
                      </td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="date"
                          value={row.eventDate}
                          onChange={(e) => {
                            const updated = [...reportData.paricharchas];
                            updated[idx].eventDate = e.target.value;
                            setReportData({ ...reportData, paricharchas: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="date"
                          value={row.reportSentDate}
                          onChange={(e) => {
                            const updated = [...reportData.paricharchas];
                            updated[idx].reportSentDate = e.target.value;
                            setReportData({ ...reportData, paricharchas: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="date"
                          value={row.cannetUploadDate}
                          onChange={(e) => {
                            const updated = [...reportData.paricharchas];
                            updated[idx].cannetUploadDate = e.target.value;
                            setReportData({ ...reportData, paricharchas: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-300 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = reportData.paricharchas.filter((_, i) => i !== idx);
                            setReportData({ ...reportData, paricharchas: updated });
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 transition"
                          title="हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!reportData.paricharchas || reportData.paricharchas.length === 0) && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400 italic">
                        कोई विवरण दर्ज नहीं है। ऊपर दिए गए बटन से परिचर्चा विवरण जोड़ें।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 8: Hindi Seminar (Annual) */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-3 border-b border-slate-200 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">8</span>
                  <span>हिंदी संगोष्ठी (वार्षिक)</span>
                </h3>
                <p className="text-[11px] text-slate-500">Annual Hindi Seminar (यदि इस तिमाही में आयोजित हुई हो)</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newRow: SeminarRow = {
                    id: `sem-${Date.now()}`,
                    officeName: reportData.primaryOfficeName,
                    eventDate: '',
                    reportSentDate: '',
                    cannetUploadDate: '',
                  };
                  setReportData({ ...reportData, seminars: [...(reportData.seminars || []), newRow] });
                }}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold px-3 py-1.5 rounded-lg border border-blue-200 inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ संगोष्ठी विवरण जोड़ें</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5 border border-slate-300 w-12 text-center">क्रम सं.</th>
                    <th className="p-2.5 border border-slate-300 min-w-56">कार्यालय का नाम</th>
                    <th className="p-2.5 border border-slate-300 w-40 text-center">आयोजन की तारीख</th>
                    <th className="p-2.5 border border-slate-300 w-44 text-center">रिपोर्ट प्रेषण की तारीख</th>
                    <th className="p-2.5 border border-slate-300 w-52 text-center">केननेट में रिपोर्ट अपलोड करने की तारीख</th>
                    <th className="p-2.5 border border-slate-300 w-12 text-center">हटाएं</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData.seminars || []).map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/80">
                      <td className="p-2.5 border border-slate-300 text-center font-semibold text-slate-600">{idx + 1}.</td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="text"
                          value={row.officeName}
                          onChange={(e) => {
                            const updated = [...reportData.seminars];
                            updated[idx].officeName = e.target.value;
                            setReportData({ ...reportData, seminars: updated });
                          }}
                          placeholder="कार्यालय का नाम"
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-medium"
                        />
                      </td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="date"
                          value={row.eventDate}
                          onChange={(e) => {
                            const updated = [...reportData.seminars];
                            updated[idx].eventDate = e.target.value;
                            setReportData({ ...reportData, seminars: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="date"
                          value={row.reportSentDate}
                          onChange={(e) => {
                            const updated = [...reportData.seminars];
                            updated[idx].reportSentDate = e.target.value;
                            setReportData({ ...reportData, seminars: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="date"
                          value={row.cannetUploadDate}
                          onChange={(e) => {
                            const updated = [...reportData.seminars];
                            updated[idx].cannetUploadDate = e.target.value;
                            setReportData({ ...reportData, seminars: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-300 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = reportData.seminars.filter((_, i) => i !== idx);
                            setReportData({ ...reportData, seminars: updated });
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 transition"
                          title="हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!reportData.seminars || reportData.seminars.length === 0) && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400 italic">
                        वार्षिक संगोष्ठी आयोजित नहीं हुई है अथवा लागू नहीं। (यदि आयोजित हुई हो तो ऊपर बटन से विवरण जोड़ें)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 9: Official Language Representative Meeting (Annual) */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-3 border-b border-slate-200 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-bold">9</span>
                  <span>राजभाषा प्रतिनिधि बैठक (वार्षिक)</span>
                </h3>
                <p className="text-[11px] text-slate-500">Annual Official Language Representatives Meeting</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newRow: RepresentativeMeetingRow = {
                    id: `rm-${Date.now()}`,
                    officeName: reportData.primaryOfficeName,
                    eventDate: '',
                    reportSentDate: '',
                    cannetUploadDate: '',
                  };
                  setReportData({ ...reportData, representativeMeetings: [...(reportData.representativeMeetings || []), newRow] });
                }}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold px-3 py-1.5 rounded-lg border border-blue-200 inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ बैठक विवरण जोड़ें</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5 border border-slate-300 w-12 text-center">क्रम सं.</th>
                    <th className="p-2.5 border border-slate-300 min-w-56">कार्यालय का नाम</th>
                    <th className="p-2.5 border border-slate-300 w-40 text-center">आयोजन की तारीख</th>
                    <th className="p-2.5 border border-slate-300 w-44 text-center">रिपोर्ट प्रेषण की तारीख</th>
                    <th className="p-2.5 border border-slate-300 w-52 text-center">केननेट में रिपोर्ट अपलोड करने की तारीख</th>
                    <th className="p-2.5 border border-slate-300 w-12 text-center">हटाएं</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData.representativeMeetings || []).map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-50/80">
                      <td className="p-2.5 border border-slate-300 text-center font-semibold text-slate-600">{idx + 1}.</td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="text"
                          value={row.officeName}
                          onChange={(e) => {
                            const updated = [...reportData.representativeMeetings];
                            updated[idx].officeName = e.target.value;
                            setReportData({ ...reportData, representativeMeetings: updated });
                          }}
                          placeholder="कार्यालय का नाम"
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-medium"
                        />
                      </td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="date"
                          value={row.eventDate}
                          onChange={(e) => {
                            const updated = [...reportData.representativeMeetings];
                            updated[idx].eventDate = e.target.value;
                            setReportData({ ...reportData, representativeMeetings: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="date"
                          value={row.reportSentDate}
                          onChange={(e) => {
                            const updated = [...reportData.representativeMeetings];
                            updated[idx].reportSentDate = e.target.value;
                            setReportData({ ...reportData, representativeMeetings: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-300">
                        <input
                          type="date"
                          value={row.cannetUploadDate}
                          onChange={(e) => {
                            const updated = [...reportData.representativeMeetings];
                            updated[idx].cannetUploadDate = e.target.value;
                            setReportData({ ...reportData, representativeMeetings: updated });
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2 border border-slate-300 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = reportData.representativeMeetings.filter((_, i) => i !== idx);
                            setReportData({ ...reportData, representativeMeetings: updated });
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 transition"
                          title="हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!reportData.representativeMeetings || reportData.representativeMeetings.length === 0) && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400 italic">
                        कोई विवरण दर्ज नहीं है। ऊपर दिए गए बटन से राजभाषा प्रतिनिधि बैठक विवरण जोड़ें।
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Table 10: Magazines (Patrika / E-Patrika / Bulletin - Half Yearly) */}
      {(activeTab === 'magazine' || activeTab === 'tolic' || activeTab === 'all') && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs flex items-center justify-center font-bold shadow-xs">10</span>
                <h3 className="text-base font-bold text-slate-900">
                  हिंदी में जारी पत्रिका/ई पत्रिका/बुलेटिन (छमाही)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Half-yearly Hindi Magazine / E-Magazine / Bulletin Published (तालिका 10)
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => autoAddOfficesToTable('magazine')}
                className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-semibold px-2.5 py-1.5 rounded-lg border border-indigo-200 inline-flex items-center gap-1 cursor-pointer"
                title="मूल कार्यालय व सभी समवर्ती कार्यालयों हेतु स्वतः पंक्ति जोड़ें"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>+ सभी समवर्ती कार्यालय ({officerOfficesList.length}) जोड़ें</span>
              </button>
              <button
                type="button"
                onClick={() => addNilRow('magazine')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 cursor-pointer"
                title="यदि पत्रिका प्रकाशित नहीं हुई तो निरंक पंक्ति जोड़ें"
              >
                <span>+ निरंक (NIL)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const newRow: MagazineRow = {
                    id: `mag-${Date.now()}`,
                    officeName: reportData.primaryOfficeName,
                    magazineName: '',
                    totalPages: 0,
                    releaseDate: '',
                    hoSentDate: '',
                  };
                  setReportData({ ...reportData, magazines: [...(reportData.magazines || []), newRow] });
                }}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ पत्रिका जोड़ें</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2.5 border border-slate-300 w-12 text-center">क्रम सं.</th>
                  <th className="p-2.5 border border-slate-300 min-w-48">कार्यालय का नाम</th>
                  <th className="p-2.5 border border-slate-300 min-w-48">पत्रिका/ई पत्रिका/बुलेटिन का नाम</th>
                  <th className="p-2.5 border border-slate-300 w-28 text-center">कुल पृष्ठों की संख्या</th>
                  <th className="p-2.5 border border-slate-300 w-40 text-center">विमोचन की तारीख</th>
                  <th className="p-2.5 border border-slate-300 w-44 text-center">प्र.का. को प्रेषित करने की तारीख</th>
                  <th className="p-2.5 border border-slate-300 w-12 text-center">हटाएं</th>
                </tr>
              </thead>
              <tbody>
                {(reportData.magazines || []).map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/80">
                    <td className="p-2.5 border border-slate-300 text-center font-semibold text-slate-600">{idx + 1}.</td>
                    <td className="p-2 border border-slate-300">
                      <input
                        type="text"
                        list="officer-assigned-offices"
                        value={row.officeName}
                        onChange={(e) => {
                          const updated = [...reportData.magazines];
                          updated[idx].officeName = e.target.value;
                          setReportData({ ...reportData, magazines: updated });
                        }}
                        placeholder="कार्यालय का नाम (मूल/समवर्ती)"
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-blue-900"
                      />
                    </td>
                    <td className="p-2 border border-slate-300">
                      <input
                        type="text"
                        value={row.magazineName}
                        onChange={(e) => {
                          const updated = [...reportData.magazines];
                          updated[idx].magazineName = e.target.value;
                          setReportData({ ...reportData, magazines: updated });
                        }}
                        placeholder="उदा. सुमन सौरभ / प्रेरणा"
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-semibold"
                      />
                    </td>
                    <td className="p-2 border border-slate-300">
                      <input
                        type="number"
                        value={row.totalPages}
                        onChange={(e) => {
                          const updated = [...reportData.magazines];
                          updated[idx].totalPages = Number(e.target.value) || 0;
                          setReportData({ ...reportData, magazines: updated });
                        }}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-center"
                      />
                    </td>
                    <td className="p-2 border border-slate-300">
                      <input
                        type="date"
                        value={row.releaseDate}
                        onChange={(e) => {
                          const updated = [...reportData.magazines];
                          updated[idx].releaseDate = e.target.value;
                          setReportData({ ...reportData, magazines: updated });
                        }}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                      />
                    </td>
                    <td className="p-2 border border-slate-300">
                      <input
                        type="date"
                        value={row.hoSentDate}
                        onChange={(e) => {
                          const updated = [...reportData.magazines];
                          updated[idx].hoSentDate = e.target.value;
                          setReportData({ ...reportData, magazines: updated });
                        }}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                      />
                    </td>
                    <td className="p-2 border border-slate-300 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = reportData.magazines.filter((_, i) => i !== idx);
                          setReportData({ ...reportData, magazines: updated });
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 transition"
                        title="हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {(!reportData.magazines || reportData.magazines.length === 0) && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-slate-400 italic">
                      कोई पत्रिका विवरण दर्ज नहीं है। ऊपर दिए गए बटन से जोड़ें अथवा 'निरंक (NIL)' दर्ज करें।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table 11: House Journals (Canrajyoti & Shreyas Entries) */}
      {(activeTab === 'houseJournal' || activeTab === 'tolic' || activeTab === 'all') && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs flex items-center justify-center font-bold shadow-xs">11</span>
                <h3 className="text-base font-bold text-slate-900">
                  केनराज्योति व श्रेयस पत्रिकाओं के लिए प्रविष्टियां (तिमाही)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Entries & Activity Reports for Canrajyoti & Shreyas House Journals (तालिका 11)
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => autoAddOfficesToTable('houseJournal')}
                className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-semibold px-2.5 py-1.5 rounded-lg border border-indigo-200 inline-flex items-center gap-1 cursor-pointer"
                title="मूल कार्यालय व सभी समवर्ती कार्यालयों हेतु स्वतः पंक्ति जोड़ें"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>+ सभी समवर्ती कार्यालय ({officerOfficesList.length}) जोड़ें</span>
              </button>
              <button
                type="button"
                onClick={() => addNilRow('houseJournal')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 cursor-pointer"
                title="यदि प्रविष्टि नहीं भेजी गई तो निरंक पंक्ति जोड़ें"
              >
                <span>+ निरंक (NIL)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const newRow: HouseJournalRow = {
                    id: `hj-${Date.now()}`,
                    officeName: reportData.primaryOfficeName,
                    staffEntriesSentDate: '',
                    activityReportSentDate: '',
                  };
                  setReportData({ ...reportData, houseJournals: [...(reportData.houseJournals || []), newRow] });
                }}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ प्रविष्टि जोड़ें</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2.5 border border-slate-300 w-12 text-center">क्रम सं.</th>
                  <th className="p-2.5 border border-slate-300 min-w-56">कार्यालय का नाम</th>
                  <th className="p-2.5 border border-slate-300 w-64 text-center">कर्मचारियों से प्राप्त प्रविष्टियां प्रेषित करने की तारीख</th>
                  <th className="p-2.5 border border-slate-300 w-72 text-center">अंचल व क्षे.का. की गतिविधियों की रिपोर्ट प्रेषित करने की तारीख</th>
                  <th className="p-2.5 border border-slate-300 w-12 text-center">हटाएं</th>
                </tr>
              </thead>
              <tbody>
                {(reportData.houseJournals || []).map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/80">
                    <td className="p-2.5 border border-slate-300 text-center font-semibold text-slate-600">{idx + 1}.</td>
                    <td className="p-2 border border-slate-300">
                      <input
                        type="text"
                        list="officer-assigned-offices"
                        value={row.officeName}
                        onChange={(e) => {
                          const updated = [...reportData.houseJournals];
                          updated[idx].officeName = e.target.value;
                          setReportData({ ...reportData, houseJournals: updated });
                        }}
                        placeholder="कार्यालय का नाम"
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-blue-900"
                      />
                    </td>
                    <td className="p-2 border border-slate-300">
                      <input
                        type="date"
                        value={row.staffEntriesSentDate}
                        onChange={(e) => {
                          const updated = [...reportData.houseJournals];
                          updated[idx].staffEntriesSentDate = e.target.value;
                          setReportData({ ...reportData, houseJournals: updated });
                        }}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                      />
                    </td>
                    <td className="p-2 border border-slate-300">
                      <input
                        type="date"
                        value={row.activityReportSentDate}
                        onChange={(e) => {
                          const updated = [...reportData.houseJournals];
                          updated[idx].activityReportSentDate = e.target.value;
                          setReportData({ ...reportData, houseJournals: updated });
                        }}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                      />
                    </td>
                    <td className="p-2 border border-slate-300 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = reportData.houseJournals.filter((_, i) => i !== idx);
                          setReportData({ ...reportData, houseJournals: updated });
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 transition"
                        title="हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {(!reportData.houseJournals || reportData.houseJournals.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400 italic">
                      कोई विवरण दर्ज नहीं है। ऊपर दिए गए बटन से पंक्ति जोड़ें अथवा 'निरंक (NIL)' दर्ज करें।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table 12: TOLIC Member (where bank is a member) */}
      {(activeTab === 'tolicMember' || activeTab === 'tolic' || activeTab === 'all') && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs flex items-center justify-center font-bold shadow-xs">12</span>
                <h3 className="text-base font-bold text-slate-900">
                  नगर राजभाषा कार्यान्वयन समिति (जहां बैंक सदस्य है)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Town Official Language Implementation Committee (TOLIC) where Bank is a Member (तालिका 12)
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => autoAddOfficesToTable('tolicMember')}
                className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-semibold px-2.5 py-1.5 rounded-lg border border-indigo-200 inline-flex items-center gap-1 cursor-pointer"
                title="मूल कार्यालय व सभी समवर्ती कार्यालयों हेतु स्वतः पंक्ति जोड़ें"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>+ सभी समवर्ती कार्यालय ({officerOfficesList.length}) जोड़ें</span>
              </button>
              <button
                type="button"
                onClick={() => addNilRow('tolicMember')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 cursor-pointer"
                title="यदि बैंक सदस्य नहीं है तो निरंक पंक्ति जोड़ें"
              >
                <span>+ निरंक (NIL)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const newRow: TolicMemberRow = {
                    id: `tm-${Date.now()}`,
                    officeName: reportData.primaryOfficeName,
                    tolicName: '',
                    halfYearlyReportDate: '',
                    meetingDate: '',
                    headAttendedName: '',
                  };
                  setReportData({ ...reportData, tolicMembers: [...(reportData.tolicMembers || []), newRow] });
                }}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ नराकास (सदस्य) जोड़ें</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2.5 border border-slate-300 w-12 text-center">क्रम सं.</th>
                  <th className="p-2.5 border border-slate-300 min-w-44">कार्यालय का नाम</th>
                  <th className="p-2.5 border border-slate-300 min-w-48">अधिकार क्षेत्र की नराकास का नाम</th>
                  <th className="p-2.5 border border-slate-300 w-44 text-center">छमाही रिपोर्ट प्रस्तुत करने की तारीख</th>
                  <th className="p-2.5 border border-slate-300 w-40 text-center">नराकास बैठक आयोजन की तिथि</th>
                  <th className="p-2.5 border border-slate-300 min-w-56">बैठक में उपस्थित कार्यालय प्रमुख का नाम व पदनाम</th>
                  <th className="p-2.5 border border-slate-300 w-12 text-center">हटाएं</th>
                </tr>
              </thead>
              <tbody>
                {(reportData.tolicMembers || []).map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/80">
                    <td className="p-2.5 border border-slate-300 text-center font-semibold text-slate-600">{idx + 1}.</td>
                    <td className="p-2 border border-slate-300">
                      <input
                        type="text"
                        list="officer-assigned-offices"
                        value={row.officeName}
                        onChange={(e) => {
                          const updated = [...reportData.tolicMembers];
                          updated[idx].officeName = e.target.value;
                          setReportData({ ...reportData, tolicMembers: updated });
                        }}
                        placeholder="कार्यालय का नाम"
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-blue-900"
                      />
                    </td>
                    <td className="p-2 border border-slate-300">
                      <input
                        type="text"
                        value={row.tolicName}
                        onChange={(e) => {
                          const updated = [...reportData.tolicMembers];
                          updated[idx].tolicName = e.target.value;
                          setReportData({ ...reportData, tolicMembers: updated });
                        }}
                        placeholder="उदा. नराकास आगरा (बैंक)"
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-semibold"
                      />
                    </td>
                    <td className="p-2 border border-slate-300">
                      <input
                        type="date"
                        value={row.halfYearlyReportDate}
                        onChange={(e) => {
                          const updated = [...reportData.tolicMembers];
                          updated[idx].halfYearlyReportDate = e.target.value;
                          setReportData({ ...reportData, tolicMembers: updated });
                        }}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                      />
                    </td>
                    <td className="p-2 border border-slate-300">
                      <input
                        type="date"
                        value={row.meetingDate}
                        onChange={(e) => {
                          const updated = [...reportData.tolicMembers];
                          updated[idx].meetingDate = e.target.value;
                          setReportData({ ...reportData, tolicMembers: updated });
                        }}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                      />
                    </td>
                    <td className="p-2 border border-slate-300">
                      <input
                        type="text"
                        value={row.headAttendedName}
                        onChange={(e) => {
                          const updated = [...reportData.tolicMembers];
                          updated[idx].headAttendedName = e.target.value;
                          setReportData({ ...reportData, tolicMembers: updated });
                        }}
                        placeholder="उदा. श्री आर. के. शर्मा (उप महाप्रबंधक)"
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                      />
                    </td>
                    <td className="p-2 border border-slate-300 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = reportData.tolicMembers.filter((_, i) => i !== idx);
                          setReportData({ ...reportData, tolicMembers: updated });
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 transition"
                        title="हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {(!reportData.tolicMembers || reportData.tolicMembers.length === 0) && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-slate-400 italic">
                      कोई विवरण दर्ज नहीं है। ऊपर दिए गए बटन से पंक्ति जोड़ें अथवा 'निरंक (NIL)' दर्ज करें।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table 13: TOLIC Convener (where bank is the Convener) */}
      {(activeTab === 'tolicConvener' || activeTab === 'tolic' || activeTab === 'all') && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs flex items-center justify-center font-bold shadow-xs">13</span>
                <h3 className="text-base font-bold text-slate-900">
                  नगर राजभाषा कार्यान्वयन समिति (जहां बैंक संयोजक है)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                TOLIC where Canara Bank is the Convener Bank (तालिका 13)
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => autoAddOfficesToTable('tolicConvener')}
                className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-semibold px-2.5 py-1.5 rounded-lg border border-indigo-200 inline-flex items-center gap-1 cursor-pointer"
                title="मूल कार्यालय व सभी समवर्ती कार्यालयों हेतु स्वतः पंक्ति जोड़ें"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>+ सभी समवर्ती कार्यालय ({officerOfficesList.length}) जोड़ें</span>
              </button>
              <button
                type="button"
                onClick={() => addNilRow('tolicConvener')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 cursor-pointer"
                title="यदि बैंक संयोजक नहीं है तो निरंक पंक्ति जोड़ें"
              >
                <span>+ बैंक संयोजक नहीं है (NIL)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const newRow: TolicConvenerRow = {
                    id: `tc-${Date.now()}`,
                    officeName: reportData.primaryOfficeName,
                    tolicName: '',
                    targetCalendarMonth: 'अगस्त 2026',
                    meetingDate: '',
                    headAttendedName: '',
                    totalMemberOffices: 0,
                    attendedMemberOffices: 0,
                  };
                  setReportData({ ...reportData, tolicConveners: [...(reportData.tolicConveners || []), newRow] });
                }}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ नराकास (संयोजक) जोड़ें</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2.5 border border-slate-300 w-12 text-center">क्रम सं.</th>
                  <th className="p-2.5 border border-slate-300 min-w-40">कार्यालय का नाम</th>
                  <th className="p-2.5 border border-slate-300 min-w-44">नराकास का नाम</th>
                  <th className="p-2.5 border border-slate-300 w-44 text-center">बैठक आयोजन का निर्धारित कैलेंडर माह</th>
                  <th className="p-2.5 border border-slate-300 w-36 text-center">बैठक आयोजन की तिथि</th>
                  <th className="p-2.5 border border-slate-300 min-w-48">बैठक में उपस्थित कार्यालय प्रमुख का नाम व पदनाम</th>
                  <th className="p-2.5 border border-slate-300 w-28 text-center">सदस्य कार्यालयों की संख्या</th>
                  <th className="p-2.5 border border-slate-300 w-28 text-center">उपस्थित कार्यालयों की संख्या</th>
                  <th className="p-2.5 border border-slate-300 w-12 text-center">हटाएं</th>
                </tr>
              </thead>
              <tbody>
                {(reportData.tolicConveners || []).map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/80">
                    <td className="p-2.5 border border-slate-300 text-center font-semibold text-slate-600">{idx + 1}.</td>
                    <td className="p-2 border border-slate-300">
                      <input
                        type="text"
                        list="officer-assigned-offices"
                        value={row.officeName}
                        onChange={(e) => {
                          const updated = [...reportData.tolicConveners];
                          updated[idx].officeName = e.target.value;
                          setReportData({ ...reportData, tolicConveners: updated });
                        }}
                        placeholder="कार्यालय का नाम"
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-blue-900"
                      />
                    </td>
                    <td className="p-2 border border-slate-300">
                      <input
                        type="text"
                        value={row.tolicName}
                        onChange={(e) => {
                          const updated = [...reportData.tolicConveners];
                          updated[idx].tolicName = e.target.value;
                          setReportData({ ...reportData, tolicConveners: updated });
                        }}
                        placeholder="उदा. नराकास (बैंक) आगरा"
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-semibold"
                      />
                    </td>
                    <td className="p-2 border border-slate-300">
                      <input
                        type="text"
                        value={row.targetCalendarMonth}
                        onChange={(e) => {
                          const updated = [...reportData.tolicConveners];
                          updated[idx].targetCalendarMonth = e.target.value;
                          setReportData({ ...reportData, tolicConveners: updated });
                        }}
                        placeholder="उदा. अगस्त 2026"
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs text-center"
                      />
                    </td>
                    <td className="p-2 border border-slate-300">
                      <input
                        type="date"
                        value={row.meetingDate}
                        onChange={(e) => {
                          const updated = [...reportData.tolicConveners];
                          updated[idx].meetingDate = e.target.value;
                          setReportData({ ...reportData, tolicConveners: updated });
                        }}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                      />
                    </td>
                    <td className="p-2 border border-slate-300">
                      <input
                        type="text"
                        value={row.headAttendedName}
                        onChange={(e) => {
                          const updated = [...reportData.tolicConveners];
                          updated[idx].headAttendedName = e.target.value;
                          setReportData({ ...reportData, tolicConveners: updated });
                        }}
                        placeholder="उदा. श्री सुनील अरोड़ा (उप महाप्रबंधक)"
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                      />
                    </td>
                    <td className="p-2 border border-slate-300">
                      <input
                        type="number"
                        value={row.totalMemberOffices}
                        onChange={(e) => {
                          const updated = [...reportData.tolicConveners];
                          updated[idx].totalMemberOffices = Number(e.target.value) || 0;
                          setReportData({ ...reportData, tolicConveners: updated });
                        }}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-center"
                      />
                    </td>
                    <td className="p-2 border border-slate-300">
                      <input
                        type="number"
                        value={row.attendedMemberOffices}
                        onChange={(e) => {
                          const updated = [...reportData.tolicConveners];
                          updated[idx].attendedMemberOffices = Number(e.target.value) || 0;
                          setReportData({ ...reportData, tolicConveners: updated });
                        }}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-center"
                      />
                    </td>
                    <td className="p-2 border border-slate-300 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = reportData.tolicConveners.filter((_, i) => i !== idx);
                          setReportData({ ...reportData, tolicConveners: updated });
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 transition"
                        title="हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {(!reportData.tolicConveners || reportData.tolicConveners.length === 0) && (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-slate-400 italic">
                      बैंक नराकास का संयोजक नहीं है अथवा इस तिमाही में बैठक नहीं हुई। संयोजक होने पर ऊपर दिए गए बटन से जोड़ें।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 14: Innovative Works */}
      {(activeTab === 'innovative' || activeTab === 'custom' || activeTab === 'all') && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs flex items-center justify-center font-bold shadow-xs">14</span>
                <h3 className="text-base font-bold text-slate-900">
                  अंचल व क्षेत्रीय कार्यालयों द्वारा तिमाही के दौरान किए गए नवोन्मेषी कार्य :
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Innovative Works Done During the Quarter (भाग 14)
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => addNilRow('innovative')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 cursor-pointer"
                title="यदि कोई नवोन्मेषी कार्य नहीं हुआ तो निरंक दर्ज करें"
              >
                <span>+ निरंक (NIL)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setReportData({
                    ...reportData,
                    innovativeWorks: [...(reportData.innovativeWorks || []).filter(Boolean), ''],
                  });
                }}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ नया नवोन्मेषी कार्य जोड़ें</span>
              </button>
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>त्वरित सुझाव (Quick Suggestions):</span>
            </span>
            {[
              'शाखाओं में हिंदी पखवाड़े के दौरान नवीन ऑनलाइन प्रश्नोत्तरी प्रतियोगिता',
              'अधिकारियों हेतु बैंकिंग हिंदी शब्दावली ई-बुकलेट का वितरण',
              'क्षेत्रीय स्तर पर हिंदी कार्यशाला सह निबंध व वाद-विवाद प्रतियोगिता',
              'ग्राहक सेवा पटल पर द्विभाषी प्रपत्रों का 100% कार्यान्वयन अभियान'
            ].map((sugg, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() => {
                  const current = (reportData.innovativeWorks || []).filter(Boolean);
                  if (!current.includes(sugg)) {
                    setReportData({ ...reportData, innovativeWorks: [...current, sugg] });
                  }
                }}
                className="text-[11px] bg-white hover:bg-indigo-100 text-indigo-800 font-medium px-2.5 py-1 rounded-md border border-indigo-200 transition cursor-pointer"
              >
                + {sugg}
              </button>
            ))}
          </div>

          <div className="space-y-2.5 pt-1">
            {(reportData.innovativeWorks || []).map((work, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 w-6 text-right shrink-0">{idx + 1}.</span>
                <input
                  type="text"
                  value={work}
                  onChange={(e) => {
                    const updated = [...reportData.innovativeWorks];
                    updated[idx] = e.target.value;
                    setReportData({ ...reportData, innovativeWorks: updated });
                  }}
                  placeholder="नवोन्मेषी कार्य का विवरण दर्ज करें..."
                  className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = reportData.innovativeWorks.filter((_, i) => i !== idx);
                    setReportData({ ...reportData, innovativeWorks: updated.length ? updated : [''] });
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 transition"
                  title="हटाएं"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 15: Special Awards */}
      {(activeTab === 'awards' || activeTab === 'custom' || activeTab === 'all') && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-500 text-white text-xs flex items-center justify-center font-bold shadow-xs">15</span>
                <h3 className="text-base font-bold text-slate-900">
                  अंचल व क्षेत्रीय कार्यालयों को प्राप्त विशेष पुरस्कार :
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Special Awards Received by Circle & Regional Offices (भाग 15)
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => addNilRow('awards')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 cursor-pointer"
                title="यदि कोई पुरस्कार प्राप्त नहीं हुआ तो निरंक दर्ज करें"
              >
                <span>+ निरंक (NIL)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setReportData({
                    ...reportData,
                    specialAwards: [...(reportData.specialAwards || []).filter(Boolean), ''],
                  });
                }}
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-lg shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ नया पुरस्कार विवरण जोड़ें</span>
              </button>
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>त्वरित सुझाव (Quick Suggestions):</span>
            </span>
            {[
              'नराकास द्वारा प्रथम राजभाषा शील्ड पुरस्कार प्राप्त',
              'नराकास द्वारा द्वितीय राजभाषा शील्ड पुरस्कार प्राप्त',
              'गृह मंत्रालय राजभाषा विभाग द्वारा क्षेत्रीय राजभाषा पुरस्कार',
              'प्रधान कार्यालय द्वारा उत्कृष्ट राजभाषा शील्ड पुरस्कार'
            ].map((sugg, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() => {
                  const current = (reportData.specialAwards || []).filter(Boolean);
                  if (!current.includes(sugg)) {
                    setReportData({ ...reportData, specialAwards: [...current, sugg] });
                  }
                }}
                className="text-[11px] bg-white hover:bg-amber-100 text-amber-900 font-medium px-2.5 py-1 rounded-md border border-amber-200 transition cursor-pointer"
              >
                + {sugg}
              </button>
            ))}
          </div>

          <div className="space-y-2.5 pt-1">
            {(reportData.specialAwards || []).map((award, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 w-6 text-right shrink-0">{idx + 1}.</span>
                <input
                  type="text"
                  value={award}
                  onChange={(e) => {
                    const updated = [...reportData.specialAwards];
                    updated[idx] = e.target.value;
                    setReportData({ ...reportData, specialAwards: updated });
                  }}
                  placeholder="प्राप्त पुरस्कार का नाम, प्रदाता संस्था एवं विवरण दर्ज करें..."
                  className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = reportData.specialAwards.filter((_, i) => i !== idx);
                    setReportData({ ...reportData, specialAwards: updated.length ? updated : [''] });
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 transition"
                  title="हटाएं"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 16: Custom Added Columns & Official Signatures */}
      {(activeTab === 'custom' || activeTab === 'all') && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8 mb-6">
          {/* Custom Columns Section */}
          <div className="border border-slate-200 p-5 rounded-xl bg-amber-50/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-3 border-b border-slate-200 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-700" />
                  <span>अतिरिक्त कॉलम व कस्टम फील्ड्स (Custom Columns & Additional Details)</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  उपयोगकर्ता द्वारा अनुरोधित: कोई अन्य नाम, विषय, विशेष कॉलम आदि जोड़ने का पूर्ण विकल्प
                </p>
              </div>
              <button
                type="button"
                onClick={addCustomField}
                className="text-xs bg-slate-800 hover:bg-slate-900 text-white font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ नया कस्टम कॉलम जोड़ें</span>
              </button>
            </div>

            <div className="space-y-3">
              {reportData.customFields.map((cf) => (
                <div key={cf.id} className="p-3 bg-white border border-slate-200 rounded-lg flex flex-col md:flex-row gap-3 items-start md:items-center shadow-xs">
                  <div className="w-full md:w-1/3">
                    <label className="text-[11px] font-bold text-slate-700 block mb-0.5">कॉलम / फील्ड का नाम</label>
                    <input
                      type="text"
                      value={cf.title}
                      onChange={(e) => updateCustomField(cf.id, 'title', e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-semibold"
                    />
                  </div>
                  <div className="w-full md:w-1/3">
                    <label className="text-[11px] font-bold text-slate-700 block mb-0.5">मान / प्रविष्टि (Value)</label>
                    <input
                      type="text"
                      value={cf.value}
                      onChange={(e) => updateCustomField(cf.id, 'value', e.target.value)}
                      placeholder="विवरण दर्ज करें..."
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div className="w-full md:w-1/3">
                    <label className="text-[11px] font-bold text-slate-700 block mb-0.5">विशेष टिप्पणी (Remarks)</label>
                    <input
                      type="text"
                      value={cf.remarks || ''}
                      onChange={(e) => updateCustomField(cf.id, 'remarks', e.target.value)}
                      placeholder="वैकल्पिक टिप्पणी..."
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCustomField(cf.id)}
                    className="mt-4 md:mt-0 p-2 text-slate-400 hover:text-red-600 transition"
                    title="हटाएं"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {reportData.customFields.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-3">
                  कोई अतिरिक्त कॉलम नहीं जोड़ा गया है। आवश्यकतानुसार ऊपर दिए गए बटन से नया कॉलम जोड़ सकते हैं।
                </p>
              )}
            </div>
          </div>

          {/* Official Signatures Section */}
          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              आधिकारिक हस्ताक्षर विवरण (Official Signatures on Quarterly Report)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  राजभाषा अधिकारी (प्रभारी) के हस्ताक्षर (नाम व पदनाम):
                </label>
                <input
                  type="text"
                  value={reportData.officerSignatureName}
                  onChange={(e) => setReportData({ ...reportData, officerSignatureName: e.target.value })}
                  placeholder="अधिकारी का नाम व पदनाम..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-blue-900"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  रिपोर्ट के अंत में "राजभाषा अधिकारी (प्रभारी) के हस्ताक्षर" के रूप में मुद्रित होगा।
                </span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  कार्यालय प्रमुख के हस्ताक्षर (नाम व पदनाम):
                </label>
                <input
                  type="text"
                  value={reportData.officeHeadSignatureName}
                  onChange={(e) => setReportData({ ...reportData, officeHeadSignatureName: e.target.value })}
                  placeholder="उदा. श्री सुनील अरोड़ा, क्षेत्रीय प्रमुख (उप महाप्रबंधक)"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-blue-900"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  रिपोर्ट के अंत में "कार्यालय प्रमुख के हस्ताक्षर (मुहर सहित)" के रूप में मुद्रित होगा।
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 13: Signed Authentic PDF Upload (OL & Office Head Signatures verified) */}
      {(activeTab === 'signed_pdf' || activeTab === 'custom' || activeTab === 'all') && (
        <div className="space-y-4 mb-6">
          {activeTab === 'signed_pdf' && (
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm border border-blue-800 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold shrink-0 shadow">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    हस्ताक्षरित एवं अनुमोदित रिपोर्ट अपलोड प्रक्रिया (3 सरल चरण)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-xs text-blue-100">
                    <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                      <strong className="block text-amber-300 mb-1">१. रिपोर्ट प्रिंट / पीडीएफ लें:</strong>
                      नीचे दिए गए "रिपोर्ट पूर्वावलोकन / पीडीएफ" बटन पर क्लिक करके तैयार रिपोर्ट का प्रिंट निकालें।
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                      <strong className="block text-amber-300 mb-1">२. हस्ताक्षर एवं मुहर करवाएँ:</strong>
                      अंतिम पृष्ठ पर राजभाषा अधिकारी एवं कार्यालय प्रमुख (RO/CO Head) के हस्ताक्षर व कार्यालय मुहर लगवाएं।
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                      <strong className="block text-amber-300 mb-1">३. यहाँ पीडीएफ अपलोड करें:</strong>
                      हस्ताक्षरित प्रति को स्कैन कर नीचे अपलोड करें। यह प्रति केवल प्रधान कार्यालय (HO) स्तर पर ही जांची जा सकेगी।
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <SignedPdfUploadSection
            reportData={reportData}
            onUpdateSignedPdf={handleUpdateSignedPdf}
          />
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
