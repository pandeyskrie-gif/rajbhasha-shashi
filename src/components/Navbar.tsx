import React, { useState } from 'react';
import { UserRole, Officer } from '../types';
import { AuthUser } from '../utils/auth';
import { CanaraLogo } from './CanaraLogo';
import { 
  Building2, 
  UserCheck, 
  ShieldCheck, 
  Sliders, 
  Share2, 
  Check, 
  Download, 
  Upload, 
  ExternalLink,
  ChevronDown,
  Calendar,
  Clock,
  LogOut,
  User,
  Lock,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { QuarterDateModal } from './QuarterDateModal';

interface Props {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  selectedQuarter: string;
  setSelectedQuarter: (q: string) => void;
  selectedOfficer: Officer | null;
  selectedCircleCode: string;
  onBackupExport: () => void;
  onBackupImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectPeriod: (quarterName: string, financialYear: string, fromDate: string, toDate: string) => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
  onOpenGoogleSheets?: () => void;
  isGoogleConnected?: boolean;
}

export const Navbar: React.FC<Props> = ({
  activeRole,
  setActiveRole,
  selectedQuarter,
  setSelectedQuarter,
  selectedOfficer,
  selectedCircleCode,
  onBackupExport,
  onBackupImport,
  onSelectPeriod,
  currentUser,
  onLogout,
  onOpenGoogleSheets,
  isGoogleConnected = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQuarterModal, setShowQuarterModal] = useState(false);

  // Multi-year preset list covering past years & current year
  const multiYearQuarters = [
    { label: 'जुलाई - सितंबर 2026 (चालू तिमाही)', val: 'जुलाई - सितंबर 2026', fy: '2026-2027', from: '2026-07-01', to: '2026-09-30' },
    { label: 'अप्रैल - जून 2026', val: 'अप्रैल - जून 2026', fy: '2026-2027', from: '2026-04-01', to: '2026-06-30' },
    { label: 'अक्टूबर - दिसंबर 2026', val: 'अक्टूबर - दिसंबर 2026', fy: '2026-2027', from: '2026-10-01', to: '2026-12-31' },
    { label: 'जनवरी - मार्च 2027', val: 'जनवरी - मार्च 2027', fy: '2026-2027', from: '2027-01-01', to: '2027-03-31' },
    { label: 'जनवरी - मार्च 2026 (पूर्व वर्ष)', val: 'जनवरी - मार्च 2026', fy: '2025-2026', from: '2026-01-01', to: '2026-03-31' },
    { label: 'अक्टूबर - दिसंबर 2025', val: 'अक्टूबर - दिसंबर 2025', fy: '2025-2026', from: '2025-10-01', to: '2025-12-31' },
    { label: 'जुलाई - सितंबर 2025', val: 'जुलाई - सितंबर 2025', fy: '2025-2026', from: '2025-07-01', to: '2025-09-30' },
    { label: 'अप्रैल - जून 2025', val: 'अप्रैल - जून 2025', fy: '2025-2026', from: '2025-04-01', to: '2025-06-30' },
    { label: 'जनवरी - मार्च 2025', val: 'जनवरी - मार्च 2025', fy: '2024-2025', from: '2025-01-01', to: '2025-03-31' },
    { label: 'अक्टूबर - दिसंबर 2024', val: 'अक्टूबर - दिसंबर 2024', fy: '2024-2025', from: '2024-10-01', to: '2024-12-31' },
    { label: 'जुलाई - सितंबर 2024', val: 'जुलाई - सितंबर 2024', fy: '2024-2025', from: '2024-07-01', to: '2024-09-30' },
    { label: 'अप्रैल - जून 2024', val: 'अप्रैल - जून 2024', fy: '2024-2025', from: '2024-04-01', to: '2024-06-30' },
  ];

  // Single universal link for all users (RO, CO, HO)
  const copySingleUniversalLink = () => {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('fullscreenApplet', 'true');
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isHO = !currentUser || currentUser.role === 'ho' || currentUser.role === 'admin';
  const isCO = currentUser?.role === 'co';
  const isOfficer = currentUser?.role === 'officer';

  return (
    <>
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-lg sticky top-0 z-50 border-b-4 border-amber-400">
        {/* Top micro bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between border-b border-blue-700/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-300">केनरा बैंक / Canara Bank</span>
            <span className="text-blue-300">•</span>
            <span className="text-slate-200">राजभाषा अनुभाग</span>
            <span className="text-blue-300">•</span>
            <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded text-[11px] font-mono border border-amber-400/30">
              सुरक्षित पोर्टल v2.6
            </span>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-2.5 mt-1 sm:mt-0">
            {currentUser && (
              <div className="flex items-center gap-2 bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-700">
                <div className="w-5 h-5 rounded-full bg-amber-400 text-blue-950 font-black text-[10px] flex items-center justify-center">
                  {currentUser.name.slice(0, 1)}
                </div>
                <div className="leading-tight">
                  <span className="font-bold text-amber-300 text-[11px] block">{currentUser.name}</span>
                  <span className="text-[10px] text-blue-200 block">
                    {currentUser.role === 'officer'
                      ? `RO अधिकारी (${currentUser.staffNo})`
                      : currentUser.role === 'co'
                      ? `अंचल: ${currentUser.circleOfficeName}`
                      : 'प्रधान कार्यालय (HO)'}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="ml-2 p-1 text-slate-300 hover:text-red-300 hover:bg-red-950/50 rounded transition cursor-pointer"
                  title="लॉगआउट करें (Sign Out)"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Single Universal Share Link Button for RO, CO & HO */}
            <button
              onClick={copySingleUniversalLink}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold rounded-md text-xs shadow-sm transition cursor-pointer"
              title="एकल पोर्टल लिंक कॉपी करें (Single access link for all RO, CO & HO)"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-950 font-black" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'लिंक कॉपी हुआ!' : 'पोर्टल लिंक शेयर करें'}</span>
            </button>

            {/* Google Sheets Integration Button */}
            {onOpenGoogleSheets && (
              <button
                onClick={onOpenGoogleSheets}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold rounded-md text-xs shadow-xs transition cursor-pointer border border-emerald-400/50"
                title="Google Sheets के साथ डेटा सिंक या एक्सपोर्ट करें"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                <span>गूगल शीट्स</span>
                {isGoogleConnected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-300 ring-2 ring-emerald-800 animate-pulse" title="Google Connected"></span>
                )}
              </button>
            )}

            {/* Backup */}
            {isHO && (
              <>
                <button
                  onClick={onBackupExport}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-950/60 hover:bg-blue-950 text-slate-200 hover:text-white rounded text-xs border border-blue-700 transition"
                  title="डेटा बैकअप डाउनलोड करें"
                >
                  <Download className="w-3 h-3" />
                  <span>बैकअप</span>
                </button>
                <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-950/60 hover:bg-blue-950 text-slate-200 hover:text-white rounded text-xs border border-blue-700 transition cursor-pointer">
                  <Upload className="w-3 h-3" />
                  <span>रिस्टोर</span>
                  <input type="file" accept=".json" onChange={onBackupImport} className="hidden" />
                </label>
              </>
            )}
          </div>
        </div>

        {/* Main Bar with Official Canara Bank Logo */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Official Canara Bank Logo */}
          <div className="flex items-center">
            <CanaraLogo size="md" theme="dark" />
          </div>

          {/* Quarter & Date Select Controls */}
          <div className="flex items-center gap-2 bg-blue-950/70 p-2 rounded-xl border border-blue-600/80 shadow-inner flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">समीक्षा तिमाही:</span>
            </div>

            {/* Quick Multi-Year Dropdown */}
            <select
              value={selectedQuarter}
              onChange={(e) => {
                const target = multiYearQuarters.find((q) => q.val === e.target.value);
                if (target) {
                  onSelectPeriod(target.val, target.fy, target.from, target.to);
                } else {
                  setSelectedQuarter(e.target.value);
                }
              }}
              className="bg-blue-900 text-amber-300 font-bold text-xs rounded-lg px-2.5 py-1.5 outline-none border border-blue-500 focus:border-amber-400 cursor-pointer max-w-[210px] truncate"
            >
              {multiYearQuarters.map((q) => (
                <option key={q.val} value={q.val} className="bg-slate-900 text-white">
                  {q.label}
                </option>
              ))}
              {!multiYearQuarters.some((q) => q.val === selectedQuarter) && (
                <option value={selectedQuarter} className="bg-slate-900 text-amber-300">
                  {selectedQuarter} (कस्टम)
                </option>
              )}
            </select>

            {/* Date Select Button */}
            <button
              type="button"
              onClick={() => setShowQuarterModal(true)}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-xs rounded-lg shadow-sm transition inline-flex items-center gap-1 cursor-pointer"
              title="विशिष्ट वर्ष, तिमाही अथवा कस्टम तारीख (Date Range) चुनें"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>तारीख चुनें (Date Select)</span>
            </button>
          </div>
        </div>

        {/* Role Bar Enforcing Strict Boundary */}
        <div className="bg-blue-950/90 px-4 sm:px-6 py-2 border-t border-blue-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {/* If logged in as RO Officer */}
            {isOfficer && (
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="font-bold text-amber-300">
                  अधिकृत स्तर: क्षेत्रीय राजभाषा अधिकारी
                </span>
                <span className="text-slate-300">
                  ({currentUser.name} — केवल {currentUser.officeName} एवं समवर्ती ROs का संपादन अधिकार)
                </span>
              </div>
            )}

            {/* If logged in as CO: Enable both My Report (CO & Concurrent RO) and Subordinate RO Consolidation */}
            {isCO && (
              <div className="flex items-center justify-between w-full flex-wrap gap-2 py-0.5">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider mr-1 hidden sm:inline">
                    अंचल स्तर:
                  </span>

                  {/* Tab 1: Fill / Edit My CO & Concurrent RO Report */}
                  <button
                    onClick={() => setActiveRole('officer')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                      activeRole === 'officer'
                        ? 'bg-amber-400 text-blue-950 shadow-md font-bold'
                        : 'text-blue-100 hover:bg-blue-800/80 bg-blue-900/60'
                    }`}
                    title="अपनी अंचल कार्यालय एवं समवर्ती RO की रिपोर्ट भरें या संपादित करें"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>1. मेरी रिपोर्ट (CO व समवर्ती RO फॉर्म)</span>
                  </button>

                  {/* Tab 2: Subordinate RO Consolidation & Review */}
                  <button
                    onClick={() => setActiveRole('co')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                      activeRole === 'co'
                        ? 'bg-amber-400 text-blue-950 shadow-md font-bold'
                        : 'text-blue-100 hover:bg-blue-800/80 bg-blue-900/60'
                    }`}
                    title="अपने क्षेत्राधीन क्षेत्रीय कार्यालयों (RO) की रिपोर्ट समीक्षा, समेकन व HO को प्रेषण"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>2. अधीनस्थ RO समेकन व HO प्रेषण</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                  <span className="font-bold text-amber-300">
                    {currentUser.circleOfficeName}
                  </span>
                  <span className="text-slate-300 hidden md:inline">
                    ({currentUser.name})
                  </span>
                </div>
              </div>
            )}

            {/* If logged in as Head Office or Admin: Full Multi-Level Navigation */}
            {isHO && (
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider mr-2 hidden sm:inline">
                  कार्य स्तर (Level):
                </span>

                <button
                  onClick={() => setActiveRole('officer')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    activeRole === 'officer'
                      ? 'bg-amber-400 text-blue-950 shadow-md font-bold'
                      : 'text-blue-100 hover:bg-blue-800/80'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>1. राजभाषा अधिकारी फॉर्म (OL Officer)</span>
                </button>

                <button
                  onClick={() => setActiveRole('co')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    activeRole === 'co'
                      ? 'bg-amber-400 text-blue-950 shadow-md font-bold'
                      : 'text-blue-100 hover:bg-blue-800/80'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>2. अंचल कार्यालय डेस्क (Circle Office - CO)</span>
                </button>

                <button
                  onClick={() => setActiveRole('ho')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    activeRole === 'ho'
                      ? 'bg-amber-400 text-blue-950 shadow-md font-bold'
                      : 'text-blue-100 hover:bg-blue-800/80'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>3. प्रधान कार्यालय डैशबोर्ड (Head Office - HO)</span>
                </button>

                <button
                  onClick={() => setActiveRole('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    activeRole === 'admin'
                      ? 'bg-amber-400 text-blue-950 shadow-md font-bold'
                      : 'text-blue-100 hover:bg-blue-800/80'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>4. मास्टर डेटा व सेटिंग्स (Admin)</span>
                </button>
              </div>
            )}

            <div className="hidden lg:flex items-center gap-2 text-xs text-blue-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>अवधि: {selectedQuarter}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Quarter Date Picker Modal */}
      <QuarterDateModal
        isOpen={showQuarterModal}
        onClose={() => setShowQuarterModal(false)}
        selectedQuarter={selectedQuarter}
        onSelectPeriod={onSelectPeriod}
      />
    </>
  );
};
