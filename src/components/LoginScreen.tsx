import React, { useState } from 'react';
import { Officer } from '../types';
import { CIRCLE_OFFICES } from '../data/seedData';
import { CanaraLogo } from './CanaraLogo';
import { verifyCredentials, AuthUser, getOfficeDpCode } from '../utils/auth';
import { 
  Lock, 
  User, 
  Building2, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface Props {
  officers: Officer[];
  onLoginSuccess: (user: AuthUser) => void;
  initialLoginId?: string;
}

type LoginTab = 'officer' | 'co' | 'ho' | 'manual';

export const LoginScreen: React.FC<Props> = ({ officers, onLoginSuccess, initialLoginId = '' }) => {
  const [activeTab, setActiveTab] = useState<LoginTab>('officer');
  const [selectedStaffNo, setSelectedStaffNo] = useState<string>(initialLoginId);
  const [selectedCircleCode, setSelectedCircleCode] = useState<string>('7690');
  const [password, setPassword] = useState('');
  const [manualLoginId, setManualLoginId] = useState(initialLoginId);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPasswordDetails, setShowPasswordDetails] = useState(false);

  // Find currently selected officer from dropdown
  const selectedOfficer = officers.find((o) => o.staffNo === selectedStaffNo) || null;

  // Handler 1: Log in as selected RO Officer
  const handleOfficerLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!selectedOfficer) {
      setErrorMsg('कृपया सूची में से अपना नाम चुनें (Please select your name from list)।');
      return;
    }

    const primaryDp = getOfficeDpCode(selectedOfficer.primaryOfficeName, selectedOfficer.circleOfficeCode);
    const passToUse = password.trim() ? password.trim() : `${selectedOfficer.staffNo}@${primaryDp}`;

    const res = verifyCredentials(selectedOfficer.staffNo, passToUse, officers);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMsg(res.message || 'लॉगिन विफल। कृपया पासवर्ड जांचें।');
    }
  };

  // Handler 2: Log in as selected Circle Office
  const handleCircleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const matchedCircle = CIRCLE_OFFICES.find((c) => c.code === selectedCircleCode);
    if (!matchedCircle) {
      setErrorMsg('कृपया अंचल कार्यालय चुनें।');
      return;
    }

    const passToUse = password.trim() ? password.trim() : `${matchedCircle.code}@${matchedCircle.code}`;
    const res = verifyCredentials(matchedCircle.code, passToUse, officers);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMsg(res.message || 'अंचल लॉगिन विफल।');
    }
  };

  // Handler 3: Log in as Head Office (HO)
  const handleHoLogin = () => {
    setErrorMsg('');
    const res = verifyCredentials('401', '401@401', officers);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMsg('प्रधान कार्यालय लॉगिन विफल।');
    }
  };

  // Handler 4: Manual Staff ID & Password Login
  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!manualLoginId.trim()) {
      setErrorMsg('कृपया अपनी कर्मचारी संख्या या लॉगिन आईडी दर्ज करें।');
      return;
    }

    const res = verifyCredentials(manualLoginId.trim(), password.trim(), officers);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMsg(res.message || 'लॉगिन विफल। कृपया कर्मचारी संख्या अथवा पासवर्ड जांचें।');
    }
  };

  // When officer dropdown changes, reset password state or set default
  const handleSelectOfficer = (staffNo: string) => {
    setSelectedStaffNo(staffNo);
    setErrorMsg('');
    const off = officers.find((o) => o.staffNo === staffNo);
    if (off) {
      const dp = getOfficeDpCode(off.primaryOfficeName, off.circleOfficeCode);
      setPassword(`${off.staffNo}@${dp}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none"></div>

      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative z-10">
        {/* Canara Bank Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-6 text-white border-b-4 border-amber-400">
          <div className="flex flex-col items-center text-center">
            <CanaraLogo size="md" theme="dark" className="justify-center mb-2" />
            <h2 className="text-lg font-black tracking-tight mt-2 text-amber-300">
              राजभाषा तिमाही रिपोर्ट एवं प्रबंधन प्रणाली
            </h2>
            <p className="text-xs text-blue-200 mt-1 font-medium">
              एकल सुरक्षित पोर्टल लिंक (Single Access Link for RO, CO & HO)
            </p>
          </div>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-3 bg-slate-100 border-b border-slate-200 p-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('officer');
              setErrorMsg('');
            }}
            className={`py-2 px-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'officer'
                ? 'bg-blue-700 text-white shadow-sm font-black'
                : 'text-slate-600 hover:text-blue-900 hover:bg-slate-200/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>RO अधिकारी</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('co');
              setErrorMsg('');
            }}
            className={`py-2 px-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'co'
                ? 'bg-blue-700 text-white shadow-sm font-black'
                : 'text-slate-600 hover:text-blue-900 hover:bg-slate-200/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>अंचल कार्यालय (CO)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('ho');
              setErrorMsg('');
            }}
            className={`py-2 px-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ho'
                ? 'bg-blue-700 text-white shadow-sm font-black'
                : 'text-slate-600 hover:text-blue-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>प्रधान कार्यालय (HO)</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: RO OFFICER LOGIN */}
          {activeTab === 'officer' && (
            <form onSubmit={handleOfficerLogin} className="space-y-4 text-xs">
              <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200 space-y-2">
                <label className="block font-bold text-blue-950 text-xs">
                  १. अपना नाम चुनें (Select Your Name):
                </label>
                <select
                  value={selectedStaffNo}
                  onChange={(e) => handleSelectOfficer(e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-blue-400 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-xs"
                >
                  <option value="" disabled>
                    -- सूची से अपना नाम / कर्मचारी संख्या चुनें ({officers.length} अधिकारी) --
                  </option>
                  {officers.map((o) => (
                    <option key={o.id} value={o.staffNo}>
                      {o.name} (स्टाफ: {o.staffNo}) | {o.primaryOfficeName} ({o.circleOfficeName})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-blue-700">
                  सूची में से अपना नाम चुनते ही आपका संबंधित पोर्टल तुरंत तैयार हो जाएगा।
                </p>
              </div>

              {/* Officer details card preview when an officer is selected */}
              {selectedOfficer && (
                <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl text-xs space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-950 text-sm">{selectedOfficer.name}</span>
                    <span className="font-mono bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">
                      स्टाफ नं: {selectedOfficer.staffNo}
                    </span>
                  </div>
                  <div className="text-slate-700 text-[11px]">
                    <strong>मूल कार्यालय:</strong> {selectedOfficer.primaryOfficeName} ({selectedOfficer.circleOfficeName})
                  </div>
                  {selectedOfficer.concurrentOffices && selectedOfficer.concurrentOffices.length > 0 && (
                    <div className="text-blue-900 text-[11px]">
                      <strong>समवर्ती ROs:</strong> {selectedOfficer.concurrentOffices.join(', ')}
                    </div>
                  )}
                </div>
              )}

              {/* Password Section */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 text-xs flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>पासवर्ड (Password):</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPasswordDetails(!showPasswordDetails)}
                    className="text-[11px] text-blue-700 hover:text-blue-900 font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>{showPasswordDetails ? 'छिपाएं' : 'पासवर्ड विकल्प'}</span>
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="कर्मचारी संख्या अथवा StaffNumber@DPcode"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
                />
                {showPasswordDetails && (
                  <div className="p-2.5 bg-slate-100 rounded-lg text-[10px] text-slate-600 space-y-1">
                    <p>मान्य पासवर्ड: <span className="font-mono text-blue-900 font-bold">कर्मचारी_संख्या</span>, <span className="font-mono text-blue-900 font-bold">संख्या@डीपी_कोड</span> (उदा. {selectedOfficer?.staffNo || '869679'}@6974) अथवा <span className="font-mono text-blue-900 font-bold">canara@123</span></p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={!selectedOfficer}
                className="w-full py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {selectedOfficer
                    ? `👉 ${selectedOfficer.name} - पोर्टल खोलें`
                    : 'कृपया पहले अपना नाम चुनें'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: CIRCLE OFFICE (CO) LOGIN */}
          {activeTab === 'co' && (
            <form onSubmit={handleCircleLogin} className="space-y-4 text-xs">
              <div className="bg-indigo-50/80 p-3.5 rounded-xl border border-indigo-200 space-y-2">
                <label className="block font-bold text-indigo-950 text-xs">
                  १. अपना अंचल कार्यालय चुनें (Select Circle Office):
                </label>
                <select
                  value={selectedCircleCode}
                  onChange={(e) => setSelectedCircleCode(e.target.value)}
                  className="w-full p-2.5 bg-white border-2 border-indigo-400 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer shadow-xs"
                >
                  {CIRCLE_OFFICES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} (कोड: {c.code})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-indigo-700">
                  अंचल कार्यालय स्तर पर आप अपनी CO रिपोर्ट भरने के साथ-साथ अधीनस्थ ROs की रिपोर्ट समीक्षा व समेकन कर सकेंगे।
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 text-xs flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>अंचल पासवर्ड (Circle Password / DP Code):</span>
                </label>
                <input
                  type="password"
                  placeholder={`अंचल कोड (उदा. ${selectedCircleCode} अथवा ${selectedCircleCode}@${selectedCircleCode})`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-700 to-blue-800 hover:from-indigo-800 hover:to-blue-900 text-white font-black text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  👉 {CIRCLE_OFFICES.find((c) => c.code === selectedCircleCode)?.name || 'अंचल'} डेस्क खोलें
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: HEAD OFFICE (HO) LOGIN */}
          {activeTab === 'ho' && (
            <div className="space-y-4 text-xs">
              <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-300 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="font-black text-emerald-950 text-sm">
                  401 HEAD OFFICE BENGALURU
                </div>
                <p className="text-xs text-emerald-800">
                  राजभाषा अनुभाग - प्रधान कार्यालय, बेंगलूरु (समस्त अंचल व क्षेत्रीय कार्यालयों का अखिल भारतीय समेकन)
                </p>
              </div>

              <button
                type="button"
                onClick={handleHoLogin}
                className="w-full py-3 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-black text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>👉 प्रधान कार्यालय (HO) डैशबोर्ड खोलें</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Fallback Manual Option Toggle */}
          <div className="pt-2 border-t border-slate-100 text-center">
            {activeTab !== 'manual' ? (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('manual');
                  setErrorMsg('');
                }}
                className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>कर्मचारी संख्या व पासवर्ड स्वयं टाइप करना चाहते हैं? यहाँ क्लिक करें</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            ) : (
              <form onSubmit={handleManualLogin} className="space-y-3 text-left">
                <div className="font-bold text-slate-800 text-xs">सीधा लॉगिन (Manual Login):</div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">कर्मचारी संख्या / Staff No:</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. 869679 अथवा 7690 (अंचल) / 401 (HO)"
                    value={manualLoginId}
                    onChange={(e) => setManualLoginId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">पासवर्ड (Password):</label>
                  <input
                    type="password"
                    required
                    placeholder="पासवर्ड"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs"
                  >
                    लॉगिन करें
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('officer')}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs"
                  >
                    वापस
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Security Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-500 font-medium">
          सुरक्षित सत्र • केनरा बैंक राजभाषा प्रबंधन प्रणाली • एकल यूआरएल प्रवेश
        </div>
      </div>
    </div>
  );
};
