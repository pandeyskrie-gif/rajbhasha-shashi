import React, { useState } from 'react';
import { Officer } from '../types';
import { CanaraLogo } from './CanaraLogo';
import { verifyCredentials, AuthUser, getOfficeDpCode } from '../utils/auth';
import { 
  Lock, 
  User, 
  KeyRound, 
  HelpCircle, 
  ShieldCheck, 
  Building2, 
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Props {
  officers: Officer[];
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginScreen: React.FC<Props> = ({ officers, onLoginSuccess }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showHelper, setShowHelper] = useState(false);
  const [helperSearch, setHelperSearch] = useState('');

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const res = verifyCredentials(loginId, password, officers);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMsg(res.message || 'लॉगिन विफल। कृपया विवरण जांचें।');
    }
  };

  const handleQuickLogin = (quickId: string, quickPass: string) => {
    setLoginId(quickId);
    setPassword(quickPass);
    const res = verifyCredentials(quickId, quickPass, officers);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative z-10">
        {/* Canara Bank Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-6 text-white border-b-4 border-amber-400">
          <div className="flex flex-col items-center text-center">
            <CanaraLogo size="md" theme="dark" className="justify-center mb-2" />
            <h2 className="text-lg font-black tracking-tight mt-2 text-amber-300">
              राजभाषा तिमाही रिपोर्ट एवं प्रबंधन प्रणाली
            </h2>
            <p className="text-xs text-blue-200 mt-1">
              सुरक्षित आंतरिक डेटा संधारण व समेकन पोर्टल (Role-Based Access)
            </p>
          </div>
        </div>

        {/* Login Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="text-center">
            <h3 className="text-base font-bold text-slate-900">
              कर्मचारी लॉगिन (Staff Sign-In)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              अपनी अधिकृत रिपोर्ट व संबंधित कार्यालयों के संपादन हेतु लॉगिन करें
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {/* Login ID Input */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>लॉगिन आईडी (कर्मचारी संख्या / Staff No):</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="उदा. 869679 अथवा 7690 (अंचल) / 401 (HO)"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>पासवर्ड (Password):</span>
                <button
                  type="button"
                  onClick={() => setShowHelper(!showHelper)}
                  className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>पासवर्ड प्रारूप?</span>
                </button>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="प्रारूप: StaffNumber@DPcode (उदा. 869679@6974)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                नियम: <span className="font-mono text-blue-900 font-semibold">कर्मचारी_संख्या@डीपी_कोड</span> जहाँ आप पदस्थापित हैं।
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-black text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>सुरक्षित लॉगिन करें (Log In)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center mb-2.5">
              ⚡ त्वरित परीक्षण लॉगिन (1-Click Demo Logins):
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('869679', '869679@6974')}
                className="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-bold text-slate-800 text-xs">
                    १. क्षेत्रीय राजभाषा अधिकारी (RO बागपत)
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    ID: 869679 | Pass: 869679@6974 (DP: 6974)
                  </div>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                  केवल अपनी व समवर्ती RO
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('7690', '7690@7690')}
                className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-bold text-indigo-950 text-xs">
                    २. अंचल कार्यालय डेस्क (आगरा अंचल C.O.)
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    ID: 7690 | Pass: 7690@7690
                  </div>
                </div>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-semibold">
                  केवल आगरा अंचल की ROs
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('401', '401@401')}
                className="p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-bold text-emerald-950 text-xs">
                    ३. प्रधान कार्यालय (Head Office बेंगलूरु)
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    ID: 401 | Pass: 401@401
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                  अखिल भारतीय सभी 28 अंचल
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Password Helper Modal / Drawer */}
        {showHelper && (
          <div className="p-4 bg-slate-100 border-t border-slate-200 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                <span>अधिकारी डीपी कोड एवं पासवर्ड सूची:</span>
              </span>
              <button
                onClick={() => setShowHelper(false)}
                className="text-slate-500 hover:text-slate-800 font-bold"
              >
                ×
              </button>
            </div>
            <input
              type="text"
              placeholder="अधिकारी नाम / संख्या से खोजें..."
              value={helperSearch}
              onChange={(e) => setHelperSearch(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
            <div className="max-h-40 overflow-y-auto space-y-1.5">
              {officers
                .filter(
                  (o) =>
                    o.name.toLowerCase().includes(helperSearch.toLowerCase()) ||
                    o.staffNo.includes(helperSearch)
                )
                .slice(0, 10)
                .map((o) => {
                  const dp = getOfficeDpCode(o.primaryOfficeName, o.circleOfficeCode);
                  return (
                    <div
                      key={o.id}
                      onClick={() => {
                        setLoginId(o.staffNo);
                        setPassword(`${o.staffNo}@${dp}`);
                        setShowHelper(false);
                      }}
                      className="p-1.5 bg-white rounded border border-slate-200 hover:border-blue-400 cursor-pointer flex items-center justify-between text-[11px]"
                    >
                      <div>
                        <strong>{o.name}</strong> ({o.staffNo}) — {o.primaryOfficeName}
                      </div>
                      <span className="font-mono text-blue-800 font-bold">
                        {o.staffNo}@{dp}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Security Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400">
          सुरक्षित सत्र एन्क्रिप्शन • केवल अधिकृत केनरा बैंक कर्मचारियों के प्रयोग हेतु
        </div>
      </div>
    </div>
  );
};
