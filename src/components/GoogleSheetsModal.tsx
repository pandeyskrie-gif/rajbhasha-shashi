import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  FileCheck,
  Calendar,
  Layers,
  Search,
  Check
} from 'lucide-react';
import { 
  signInWithGoogle, 
  signOutGoogle, 
  getGoogleAccessToken, 
  getGoogleUser, 
  isGoogleConnected,
  subscribeToGoogleAuth 
} from '../services/googleAuth';
import { 
  exportOfficerReportToGoogleSheets, 
  exportCOConsolidatedToGoogleSheets, 
  exportHOAllIndiaToGoogleSheets,
  listUserSpreadsheets,
  DriveSpreadsheetFile,
  GoogleSheetsExportResult
} from '../services/googleSheetsService';
import { QuarterlyReport, Officer, UserRole } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeRole: UserRole;
  currentQuarter: string;
  currentReport?: QuarterlyReport | null;
  currentOfficer?: Officer | null;
  circleReports?: QuarterlyReport[];
  circleName?: string;
  circleCode?: string;
  allReports?: QuarterlyReport[];
  allOfficers?: Officer[];
}

export const GoogleSheetsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  activeRole,
  currentQuarter,
  currentReport,
  currentOfficer,
  circleReports = [],
  circleName = '',
  circleCode = '',
  allReports = [],
  allOfficers = [],
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(isGoogleConnected());
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(getGoogleUser()?.email || null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [recentSheets, setRecentSheets] = useState<DriveSpreadsheetFile[]>([]);
  const [activeTab, setActiveTab] = useState<'export' | 'browse' | 'help'>('export');
  const [lastExportResult, setLastExportResult] = useState<GoogleSheetsExportResult | null>(null);

  // Mandatory Confirmation Dialog State (per workspace-integration skill)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToGoogleAuth((user, token) => {
      setIsConnected(!!token && !!user);
      setGoogleUserEmail(user?.email || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isOpen && isConnected && activeTab === 'browse') {
      fetchRecentSheets();
    }
  }, [isOpen, isConnected, activeTab]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await signInWithGoogle();
      if (res?.user) {
        setIsConnected(true);
        setGoogleUserEmail(res.user.email);
        setStatusMessage({
          type: 'success',
          text: `सफलतापूर्वक कनेक्ट हुआ: ${res.user.email}`,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'गूगल से कनेक्शन में विफल। कृपया पुनः प्रयास करें।',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOutGoogle();
      setIsConnected(false);
      setGoogleUserEmail(null);
      setLastExportResult(null);
      setStatusMessage({
        type: 'info',
        text: 'गूगल खाता डिस्कनेक्ट कर दिया गया।',
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentSheets = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const files = await listUserSpreadsheets();
      setRecentSheets(files);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'गूगल ड्राइव से स्प्रेडशीट लोड करने में समस्या।',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger export with mandatory user confirmation dialog
  const requestExport = (exportType: 'officer' | 'co' | 'ho') => {
    let title = '';
    let description = '';

    if (exportType === 'officer') {
      title = `क्षेत्रीय कार्यालय (${currentReport?.primaryOfficeName || 'RO'}) की रिपोर्ट गूगल शीट्स में निर्यात`;
      description = `यह क्रिया आपके Google Drive में एक नया स्प्रेडशीट "केनरा बैंक - राजभाषा रिपोर्ट - ${currentReport?.primaryOfficeName} (${currentQuarter})" बनाएगी जिसमें अनुवाद प्रगति, शाखा भ्रमण व समिति बैठकों के 3 टैब शामिल होंगे।`;
    } else if (exportType === 'co') {
      title = `अंचल कार्यालय (${circleName || 'CO'}) समेकित डेटा गूगल शीट्स में निर्यात`;
      description = `यह क्रिया आपके Google Drive में एक नया समेकित स्प्रेडशीट बनाएगी जिसमें ${circleName} अंचल के सभी क्षेत्रीय कार्यालयों का तुलनात्मक अनुवाद व निरीक्षण डेटा होगा।`;
    } else {
      title = `अखिल भारतीय प्रधान कार्यालय (HO) मास्टर रिपोर्ट गूगल शीट्स में निर्यात`;
      description = `यह क्रिया आपके Google Drive में ऑल-इंडिया 28 अंचल व 88 राजभाषा अधिकारियों की समग्र स्थिति का मास्टर स्प्रेडशीट निर्मित करेगी।`;
    }

    setConfirmAction({
      title,
      description,
      onConfirm: async () => {
        setIsLoading(true);
        setStatusMessage(null);
        try {
          let res: GoogleSheetsExportResult;
          if (exportType === 'officer' && currentReport) {
            res = await exportOfficerReportToGoogleSheets(currentReport, currentOfficer);
          } else if (exportType === 'co') {
            res = await exportCOConsolidatedToGoogleSheets(circleCode, circleName, currentQuarter, circleReports);
          } else {
            res = await exportHOAllIndiaToGoogleSheets(currentQuarter, allReports, allOfficers);
          }
          setLastExportResult(res);
          setStatusMessage({
            type: 'success',
            text: `स्प्रेडशीट सफलतापूर्वक तैयार: "${res.title}"`,
          });
        } catch (err: any) {
          setStatusMessage({
            type: 'error',
            text: err.message || 'गूगल शीट्स में निर्यात विफल। कृपया पुनः प्रयास करें।',
          });
        } finally {
          setIsLoading(false);
          setShowConfirmDialog(false);
        }
      },
    });
    setShowConfirmDialog(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-5 flex items-center justify-between border-b-4 border-amber-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <span>गूगल शीट्स एकीकरण केंद्र</span>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Google Workspace
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                राजभाषा तिमाही रिपोर्ट, अनुवाद सांख्यिकी व शाखा भ्रमण का लाइव स्प्रेडशीट सिंक
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google Authentication Status Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 ring-4 ring-emerald-100 animate-pulse' : 'bg-slate-300'}`}></div>
            <div>
              <span className="text-xs font-semibold text-slate-700 block">
                {isConnected ? 'गूगल खाता कनेक्टेड है' : 'गूगल खाता कनेक्ट नहीं है'}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {isConnected ? googleUserEmail : 'स्प्रेडशीट बनाने या पढ़ने हेतु कनेक्ट करें'}
              </span>
            </div>
          </div>

          <div>
            {isConnected ? (
              <button
                onClick={handleGoogleSignOut}
                disabled={isLoading}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 font-medium transition cursor-pointer disabled:opacity-50"
              >
                डिस्कनेक्ट करें
              </button>
            ) : (
              /* Official Google Sign-In Button styled per brand guidelines */
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm transition cursor-pointer disabled:opacity-50 hover:shadow"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google से साइन-इन करें</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>गूगल शीट्स में निर्यात (Export)</span>
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'browse'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ड्राइव स्प्रेडशीट ब्राउज़ करें</span>
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'help'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>मार्गदर्शिका (Guide)</span>
          </button>
        </div>

        {/* Status Message Banner */}
        {statusMessage && (
          <div
            className={`mx-6 mt-4 p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p>{statusMessage.text}</p>
            </div>
          </div>
        )}

        {/* Export Success Banner with direct Google Sheet link */}
        {lastExportResult && (
          <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-950 block">स्प्रेडशीट सफलतापूर्वक तैयार!</span>
                <span className="text-[11px] text-emerald-800 truncate block max-w-sm">
                  {lastExportResult.title}
                </span>
              </div>
            </div>
            <a
              href={lastExportResult.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <span>Google Sheets में खोलें</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-6">
          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>वर्तमान तिमाही: {currentQuarter}</span>
                </h4>
                <p className="text-[11px] text-blue-700">
                  नीचे दिए गए विकल्पों से आप अपनी संबंधित भूमिका (Officer / CO / HO) का आधिकारिक राजभाषा डेटा सीधे अपने Google Drive खाते में नई Google Spreadsheet के रूप में सुरक्षित रूप से एक्सपोर्ट कर सकते हैं।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* 1. Officer Level Export */}
                <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-sm transition bg-white flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded uppercase">
                      क्षेत्रीय अधिकारी (RO)
                    </span>
                    <h5 className="font-bold text-sm text-slate-900 mt-2">
                      {currentReport?.primaryOfficeName || 'क्षेत्रीय कार्यालय'} रिपोर्ट
                    </h5>
                    <p className="text-xs text-slate-500 mt-1">
                      अनुवाद पृष्ठ, शाखा भ्रमण, समिति बैठकें व कार्यशालाओं की विस्तृत शीट
                    </p>
                  </div>
                  <button
                    onClick={() => requestExport('officer')}
                    disabled={isLoading || !isConnected}
                    className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-40"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>RO रिपोर्ट भेजें</span>
                  </button>
                </div>

                {/* 2. Circle Office (CO) Consolidated Export */}
                <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-sm transition bg-white flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded uppercase">
                      अंचल कार्यालय (CO)
                    </span>
                    <h5 className="font-bold text-sm text-slate-900 mt-2">
                      {circleName || 'अंचल'} समेकित स्प्रेडशीट
                    </h5>
                    <p className="text-xs text-slate-500 mt-1">
                      अंचल के सभी क्षेत्रीय कार्यालयों का तुलनात्मक अनुवाद व निरीक्षण चार्ट
                    </p>
                  </div>
                  <button
                    onClick={() => requestExport('co')}
                    disabled={isLoading || !isConnected}
                    className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-40"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>CO समेकित शीट बनाएं</span>
                  </button>
                </div>

                {/* 3. Head Office (HO) All-India Master Export */}
                <div className="sm:col-span-2 border border-slate-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-sm transition bg-gradient-to-r from-slate-50 to-blue-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded uppercase">
                      प्रधान कार्यालय (HO)
                    </span>
                    <h5 className="font-bold text-sm text-slate-900 mt-1">
                      अखिल भारतीय मास्टर रिपोर्ट (All-India Master Sheet)
                    </h5>
                    <p className="text-xs text-slate-600 mt-0.5">
                      सभी 28 अंचल, 88 अधिकारी, अनुवाद सांख्यिकी व स्थानांतरण का राष्ट्रीय डेटा
                    </p>
                  </div>
                  <button
                    onClick={() => requestExport('ho')}
                    disabled={isLoading || !isConnected}
                    className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-40 shadow-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                    <span>HO अखिल भारतीय शीट बनाएं</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BROWSE RECENT DRIVE SHEETS */}
          {activeTab === 'browse' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  आपके Google Drive में उपलब्ध स्प्रेडशीट्स ({recentSheets.length}):
                </span>
                <button
                  onClick={fetchRecentSheets}
                  disabled={isLoading || !isConnected}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>रिफ्रेश</span>
                </button>
              </div>

              {!isConnected ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 font-medium">कृपया पहले Google खाता कनेक्ट करें</p>
                  <button
                    onClick={handleGoogleSignIn}
                    className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    साइन-इन करें
                  </button>
                </div>
              ) : recentSheets.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600">कोई हालिया स्प्रेडशीट नहीं मिली अथवा लोड हो रही है।</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-2 bg-slate-50">
                  {recentSheets.map((file) => (
                    <div
                      key={file.id}
                      className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between hover:border-blue-400 hover:shadow-xs transition"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="truncate">
                          <span className="text-xs font-semibold text-slate-800 block truncate">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            अंतिम संशोधन: {new Date(file.modifiedTime).toLocaleDateString('hi-IN')}
                          </span>
                        </div>
                      </div>
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium p-1.5 hover:bg-blue-50 rounded transition shrink-0"
                        title="Google Sheets में खोलें"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HELP & SECURITY */}
          {activeTab === 'help' && (
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>सुरक्षा एवं गोपनीयता (Security & Least Privilege)</span>
                </h5>
                <p>
                  यह एकीकरण केवल आपके द्वारा अधिकृत Google Sheets एवं Google Drive की फाइलों के साथ सुरक्षित क्लाइंट-साइड टोकन के माध्यम से संवाद करता है।
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                  <li>एक्सेस टोकन ब्राउज़र मेमोरी में रहता है, कभी भी असुरक्षित स्टोरेज में नहीं लिखा जाता।</li>
                  <li>नया स्प्रेडशीट बनाते समय केनरा बैंक के आधिकारिक रंगरूप व प्रारूप (Blue Header + Gold Accent) में डेटा व्यवस्थित होता है।</li>
                  <li>स्प्रेडशीट में संशोधन या नए निर्माण से पूर्व आपसे अनिवार्य रूप से पुष्टि (Confirmation) ली जाती है।</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            केनरा बैंक राजभाषा अनुभाग • गूगल शीट्स क्लाउड सिंक
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>

      {/* MANDATORY USER CONFIRMATION MODAL (per workspace-integration skill) */}
      {showConfirmDialog && confirmAction && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <h4 className="font-bold text-sm text-white">{confirmAction.title}</h4>
            </div>
            <div className="p-5 text-xs text-slate-700 leading-relaxed space-y-3">
              <p>{confirmAction.description}</p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                <strong>पुष्टि करें:</strong> क्या आप यह डेटा अपने Google Drive खाते ({googleUserEmail}) में सहेजना चाहते हैं?
              </div>
            </div>
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
              <button
                onClick={confirmAction.onConfirm}
                disabled={isLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>हाँ, स्प्रेडशीट बनाएं (Proceed)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
