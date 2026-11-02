import React, { useState } from 'react';
import { Officer } from '../types';
import { CIRCLE_OFFICES } from '../data/seedData';
import { 
  getPasswordsRegistry, 
  updatePasswordForUser 
} from '../utils/passwords';
import { 
  X, 
  KeyRound, 
  Search, 
  Copy, 
  Check, 
  Edit3, 
  Save, 
  ShieldCheck, 
  RefreshCw,
  Building2,
  User,
  Eye,
  EyeOff,
  Sparkles,
  Lock
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  officers: Officer[];
  circleOffices?: { code: string; name: string }[];
}

type TabType = 'circles' | 'officers' | 'ho_admin';

export const CentralPasswordModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  officers, 
  circleOffices = CIRCLE_OFFICES 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('circles');
  const [searchTerm, setSearchTerm] = useState('');
  const [passwords, setPasswords] = useState<Record<string, string>>(() => getPasswordsRegistry());
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleReveal = (key: string) => {
    setRevealedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStartEdit = (key: string) => {
    setEditingKey(key);
    setEditValue(passwords[key] || '');
  };

  const handleSaveEdit = (key: string, label: string) => {
    if (!editValue.trim()) return;
    updatePasswordForUser(key, editValue.trim());
    setPasswords(getPasswordsRegistry());
    setEditingKey(null);
    showNotice(`✓ ${label} का नया पासवर्ड सफलतापूर्वक सुरक्षित कर दिया गया!`);
  };

  // Generate secure random password for Circle Office
  const handleGenerateCirclePassword = (circleCode: string, circleName: string) => {
    const cleanName = circleName.replace(/[^a-zA-Z]/g, '').slice(0, 4);
    const rand = Math.floor(100 + Math.random() * 900);
    const generated = `CO@${circleCode}#${rand}`;
    updatePasswordForUser(circleCode, generated);
    setPasswords(getPasswordsRegistry());
    showNotice(`✓ अंचल ${circleName} (${circleCode}) हेतु नया पासवर्ड (${generated}) तैयार किया गया!`);
  };

  // Generate secure random password for Officer
  const handleGenerateOfficerPassword = (staffNo: string, officerName: string) => {
    const first = officerName.split(' ')[0].replace(/[^a-zA-Z]/g, '');
    const capitalized = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
    const randDigits = Math.floor(100 + Math.random() * 900);
    const generated = `${capitalized}@${randDigits}#`;
    updatePasswordForUser(staffNo, generated);
    setPasswords(getPasswordsRegistry());
    showNotice(`✓ अधिकारी ${officerName} (स्टाफ: ${staffNo}) हेतु नया पासवर्ड (${generated}) तैयार किया गया!`);
  };

  // Copy ready-to-send credentials message for Circle Office
  const handleCopyCircleCredentials = (circleCode: string, circleName: string, inchargeName: string) => {
    const pass = passwords[circleCode] || `CO@${circleCode}#2026`;
    const portalUrl = window.location.origin + window.location.pathname + '?fullscreenApplet=true';

    const text = `गोपनीय / CONFIDENTIAL\n\nप्रिय अंचल प्रमुख / राजभाषा प्रभारी जी (${circleName}),\n\nकेनरा बैंक राजभाषा तिमाही रिपोर्ट एवं प्रबंधन प्रणाली पोर्टल हेतु आपके अंचल कार्यालय का अधिकृत लॉगिन विवरण:\n• अंचल कार्यालय: ${circleName} (कोड: ${circleCode})\n• पदस्थ प्रभारी: ${inchargeName}\n• अंचल लॉगिन पासवर्ड: ${pass}\n• पोर्टल लिंक: ${portalUrl}\n\nनिर्देश: कृपया इस पासवर्ड को गोपनीय रखें। पोर्टल में "अंचल कार्यालय (CO)" टैब पर यह पासवर्ड दर्ज कर आप अपने क्षेत्राधीन सभी क्षेत्रीय कार्यालयों की रिपोर्ट समीक्षा, लॉक/अनलॉक व अनुमोदन कर सकते हैं।\n\nसादर,\nराजभाषा अनुभाग, प्रधान कार्यालय, बेंगलूरु\nप्रशासक: शशिकांत पांडेय, वरिष्ठ प्रबंधक (राजभाषा), सीआईबीएम, मणिपाल`;

    navigator.clipboard.writeText(text);
    setCopiedKey(circleCode);
    showNotice(`✓ ${circleName} का गोपनीय लॉगिन विवरण कॉपी हो गया! इसे सीधे व्हाट्सएप या आंतरिक ईमेल पर भेजें।`);
    setTimeout(() => setCopiedKey(null), 3000);
  };

  // Copy ready-to-send credentials message for Officer
  const handleCopyOfficerCredentials = (staffNo: string, officerName: string, officeName: string) => {
    const pass = passwords[staffNo] || 'उपलब्ध नहीं';
    const portalUrl = window.location.origin + window.location.pathname + '?fullscreenApplet=true';

    const text = `गोपनीय / CONFIDENTIAL\n\nप्रिय ${officerName} जी,\n\nकेनरा बैंक राजभाषा तिमाही रिपोर्ट एवं प्रबंधन प्रणाली पोर्टल हेतु आपकी व्यक्तिगत लॉगिन विवरणी:\n• कर्मचारी संख्या (लॉगिन आईडी): ${staffNo}\n• व्यक्तिगत पासवर्ड: ${pass}\n• पदस्थापन कार्यालय: ${officeName}\n• पोर्टल लिंक: ${portalUrl}\n\nकृपया पोर्टल खोलकर अपना नाम चुनें, पासवर्ड दर्ज करें और तिमाही रिपोर्ट भरें।\n\nसादर,\nशशिकांत पांडेय\nवरिष्ठ प्रबंधक (राजभाषा), सीआईबीएम, मणिपाल`;

    navigator.clipboard.writeText(text);
    setCopiedKey(staffNo);
    showNotice(`✓ ${officerName} जी के लॉगिन विवरण का संदेश कॉपी हो गया! इसे सीधे व्हाट्सएप या ईमेल पर भेजें।`);
    setTimeout(() => setCopiedKey(null), 3000);
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtered Circles
  const filteredCircles = circleOffices.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.includes(searchTerm)
  );

  // Filtered Officers
  const filteredOfficers = officers.filter(
    (o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.staffNo.includes(searchTerm) ||
      o.primaryOfficeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.circleOfficeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-900 p-5 text-white flex items-center justify-between border-b-4 border-amber-400 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-black shadow-md">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-amber-300">
                  केंद्रीय पासवर्ड प्रबंधन केंद्र (Central Password Manager)
                </h3>
                <span className="text-[10px] bg-amber-400 text-blue-950 px-2 py-0.5 rounded font-black">
                  HO Admin Exclusive
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                समस्त 28 अंचल कार्यालयों (CO) एवं 70+ राजभाषा अधिकारियों के गोपनीय पासवर्ड का केंद्रीय नियंत्रण एवं रीसेट
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 bg-slate-100 border-b border-slate-200 p-1.5 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('circles');
              setSearchTerm('');
            }}
            className={`py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'circles'
                ? 'bg-indigo-800 text-white shadow-xs font-black'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>१. अंचल कार्यालय पासवर्ड (28 Circle Offices)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('officers');
              setSearchTerm('');
            }}
            className={`py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'officers'
                ? 'bg-blue-800 text-white shadow-xs font-black'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <User className="w-4 h-4" />
            <span>२. राजभाषा अधिकारी पासवर्ड ({officers.length} OL Officers)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('ho_admin');
              setSearchTerm('');
            }}
            className={`py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'ho_admin'
                ? 'bg-emerald-800 text-white shadow-xs font-black'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>३. प्रधान कार्यालय (HO) व मास्टर की</span>
          </button>
        </div>

        {/* Search & Statistics Bar */}
        {activeTab !== 'ho_admin' && (
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={
                  activeTab === 'circles'
                    ? 'अंचल कार्यालय का नाम या कोड खोजें (उदा. 7695 Hubballi)...'
                    : 'अधिकारी का नाम, कर्मचारी सं. या कार्यालय से खोजें...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 w-full sm:w-auto justify-end">
              <span className="font-bold text-indigo-900">
                {activeTab === 'circles' ? filteredCircles.length : filteredOfficers.length}
              </span>
              <span>{activeTab === 'circles' ? 'अंचल कार्यालय' : 'अधिकारी'} प्रदर्शित</span>
            </div>
          </div>
        )}

        {/* Notification Toast */}
        {notification && (
          <div className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center justify-between shrink-0 font-semibold shadow-xs">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="text-emerald-700 font-bold ml-2">×</button>
          </div>
        )}

        {/* TAB 1: CIRCLE OFFICES PASSWORDS */}
        {activeTab === 'circles' && (
          <div className="p-4 overflow-y-auto grow space-y-3">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold">
                  अंचल कार्यालय (Circle Office) पासवर्ड सुरक्षा नीति:
                </div>
                <div className="text-[11px] text-slate-700 leading-relaxed">
                  लॉगिन स्क्रीन पर अंचल कार्यालयों का पासवर्ड पूरी तरह गोपनीय रखा गया है ताकि कोई अन्य व्यक्ति किसी अन्य अंचल की रिपोर्ट न खोल सके। प्रधान कार्यालय (HO) यहाँ से किसी भी अंचल का पासवर्ड देख सकता है, नया पासवर्ड सेट कर सकता है अथवा <strong>"संदेश कॉपी"</strong> बटन से संबंधित अंचल प्रभारी को सुरक्षित संदेश भेज सकता है।
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 text-center w-12">क्र.सं.</th>
                    <th className="p-2.5">अंचल कार्यालय का नाम</th>
                    <th className="p-2.5 text-center w-24">अंचल कोड</th>
                    <th className="p-2.5">पदस्थ अंचल राजभाषा प्रभारी</th>
                    <th className="p-2.5">गोपनीय पासवर्ड</th>
                    <th className="p-2.5 text-center">कार्रवाई (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCircles.map((circle, idx) => {
                    const pass = passwords[circle.code] || `CO@${circle.code}#2026`;
                    const isEditing = editingKey === circle.code;
                    const isRevealed = !!revealedKeys[circle.code];

                    // Find posted CO officer
                    const circleOfficers = officers.filter((o) => o.circleOfficeCode === circle.code);
                    const coIncharge = circleOfficers.find((o) => o.primaryOfficeType === 'CO') || circleOfficers[0];

                    return (
                      <tr key={circle.code} className="hover:bg-indigo-50/40 transition">
                        <td className="p-2.5 text-slate-400 font-mono text-[11px] text-center">{idx + 1}</td>
                        <td className="p-2.5">
                          <span className="font-bold text-slate-900 block">{circle.name}</span>
                          <span className="text-[10px] text-slate-500 font-medium">केनरा बैंक अंचल कार्यालय</span>
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-indigo-900">
                          <span className="bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                            {circle.code}
                          </span>
                        </td>
                        <td className="p-2.5">
                          {coIncharge ? (
                            <div>
                              <div className="font-bold text-slate-800">{coIncharge.name}</div>
                              <div className="text-[10px] text-slate-500">
                                स्टाफ: {coIncharge.staffNo} | {coIncharge.designation}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">अधिकारी पदस्थापन प्रतीक्षित</span>
                          )}
                        </td>

                        {/* Password Column */}
                        <td className="p-2.5">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="px-2 py-1 bg-white border-2 border-indigo-600 rounded font-mono font-bold text-xs text-indigo-900 w-36 outline-none"
                                placeholder="नया पासवर्ड..."
                              />
                              <button
                                onClick={() => handleSaveEdit(circle.code, circle.name)}
                                className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer"
                                title="सहेजें"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingKey(null)}
                                className="p-1 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded cursor-pointer"
                                title="रद्द करें"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono bg-indigo-50 text-indigo-950 px-2 py-1 rounded font-bold border border-indigo-200 min-w-[100px] text-center">
                                {isRevealed ? pass : '••••••••'}
                              </span>
                              <button
                                onClick={() => toggleReveal(circle.code)}
                                className="p-1 text-slate-400 hover:text-indigo-700 hover:bg-indigo-100 rounded cursor-pointer"
                                title={isRevealed ? 'पासवर्ड छिपाएं' : 'पासवर्ड देखें'}
                              >
                                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleStartEdit(circle.code)}
                                className="p-1 text-slate-400 hover:text-indigo-700 hover:bg-indigo-100 rounded cursor-pointer"
                                title="पासवर्ड बदलें"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Actions Column */}
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleCopyCircleCredentials(circle.code, circle.name, coIncharge?.name || 'अंचल प्रभारी')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer ${
                                copiedKey === circle.code
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-300'
                              }`}
                              title="अंचल लॉगिन संदेश कॉपी करें (WhatsApp/Email हेतु)"
                            >
                              {copiedKey === circle.code ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>कॉपी हुआ!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>संदेश कॉपी</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleGenerateCirclePassword(circle.code, circle.name)}
                              className="p-1.5 text-slate-400 hover:text-indigo-700 hover:bg-indigo-100 rounded cursor-pointer"
                              title="नया यादृच्छिक पासवर्ड बनाएं"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
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

        {/* TAB 2: OFFICERS PASSWORDS */}
        {activeTab === 'officers' && (
          <div className="p-4 overflow-y-auto grow space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold">
                  राजभाषा अधिकारी (RO OL Officers) पासवर्ड सुरक्षा:
                </div>
                <div className="text-[11px] text-slate-700 leading-relaxed">
                  यहाँ से आप बैंक के सभी पदस्थ राजभाषा अधिकारियों के पासवर्ड देख सकते हैं, रीसेट कर सकते हैं, तथा "संदेश कॉपी" बटन से संबंधित अधिकारी को उनके व्यक्तिगत व्हाट्सएप या ईमेल पर सीधे लॉगिन निर्देश भेज सकते हैं।
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 text-center w-12">क्र.सं.</th>
                    <th className="p-2.5">अधिकारी का नाम</th>
                    <th className="p-2.5">कर्मचारी सं.</th>
                    <th className="p-2.5">मूल पदस्थापन (RO/CO)</th>
                    <th className="p-2.5">अंचल कार्यालय</th>
                    <th className="p-2.5">गोपनीय पासवर्ड</th>
                    <th className="p-2.5 text-center">कार्रवाई (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOfficers.map((o, idx) => {
                    const pass = passwords[o.staffNo] || 'उपलब्ध नहीं';
                    const isEditing = editingKey === o.staffNo;
                    const isRevealed = !!revealedKeys[o.staffNo];

                    return (
                      <tr key={o.id} className="hover:bg-blue-50/50 transition">
                        <td className="p-2.5 text-slate-400 font-mono text-[11px] text-center">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {o.name}
                          <span className="block text-[10px] text-slate-400 font-normal">{o.designation}</span>
                        </td>
                        <td className="p-2.5 font-mono font-bold text-blue-900">{o.staffNo}</td>
                        <td className="p-2.5 text-slate-700 text-[11px]">{o.primaryOfficeName}</td>
                        <td className="p-2.5 text-slate-600 text-[11px]">{o.circleOfficeName}</td>

                        {/* Password Column */}
                        <td className="p-2.5">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="px-2 py-1 bg-white border-2 border-blue-500 rounded font-mono font-bold text-xs text-blue-900 w-32 outline-none"
                              />
                              <button
                                onClick={() => handleSaveEdit(o.staffNo, o.name)}
                                className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer"
                                title="सहेजें"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingKey(null)}
                                className="p-1 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded cursor-pointer"
                                title="रद्द करें"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono bg-blue-50 text-blue-900 px-2 py-1 rounded font-bold border border-blue-200 min-w-[90px] text-center">
                                {isRevealed ? pass : '••••••••'}
                              </span>
                              <button
                                onClick={() => toggleReveal(o.staffNo)}
                                className="p-1 text-slate-400 hover:text-blue-700 hover:bg-blue-100 rounded cursor-pointer"
                                title={isRevealed ? 'पासवर्ड छिपाएं' : 'पासवर्ड देखें'}
                              >
                                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleStartEdit(o.staffNo)}
                                className="p-1 text-slate-400 hover:text-blue-700 hover:bg-blue-100 rounded cursor-pointer"
                                title="पासवर्ड बदलें"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleCopyOfficerCredentials(o.staffNo, o.name, o.primaryOfficeName)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer ${
                                copiedKey === o.staffNo
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-300'
                              }`}
                              title="लॉगिन संदेश कॉपी करें व अधिकारी को भेजें"
                            >
                              {copiedKey === o.staffNo ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>कॉपी हुआ!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>संदेश कॉपी</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleGenerateOfficerPassword(o.staffNo, o.name)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer"
                              title="नया यादृच्छिक पासवर्ड बनाएं"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
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

        {/* TAB 3: HO & ADMIN PASSWORDS */}
        {activeTab === 'ho_admin' && (
          <div className="p-6 overflow-y-auto grow space-y-5">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 space-y-2">
              <div className="font-bold flex items-center gap-2 text-sm text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>प्रधान कार्यालय (Head Office - 401) सुरक्षा विवरणी</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-xs">
                प्रधान कार्यालय (HO) का पासवर्ड अखिल भारतीय स्तर पर सभी 28 अंचल कार्यालयों और अधीनस्थ क्षेत्रीय कार्यालयों की रिपोर्टों की समीक्षा, स्थानांतरण आदेश व राष्ट्रीय समेकन हेतु अधिकृत है।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* HO Card */}
              <div className="p-4 bg-white border border-slate-300 rounded-xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">
                    401 प्रधान कार्यालय (HO Password)
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-mono font-bold">
                    ID: 401
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  वर्तमान अधिकृत पासवर्ड:
                </div>
                {editingKey === '401' ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="px-3 py-1.5 bg-white border-2 border-emerald-600 rounded font-mono font-bold text-xs text-slate-900 w-full outline-none"
                    />
                    <button
                      onClick={() => handleSaveEdit('401', 'प्रधान कार्यालय (HO)')}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded font-bold text-xs cursor-pointer"
                    >
                      सहेजें
                    </button>
                    <button
                      onClick={() => setEditingKey(null)}
                      className="px-2 py-1.5 bg-slate-200 text-slate-700 rounded text-xs cursor-pointer"
                    >
                      रद्द
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {revealedKeys['401'] ? passwords['401'] || 'HO@Canara401' : '••••••••••••'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleReveal('401')}
                        className="p-1 text-slate-500 hover:text-slate-900 rounded cursor-pointer"
                      >
                        {revealedKeys['401'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleStartEdit('401')}
                        className="p-1 text-slate-500 hover:text-indigo-700 rounded cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Developer / Admin Master Key */}
              <div className="p-4 bg-white border border-slate-300 rounded-xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 text-sm">
                    मास्टर एडमिन कुंजी (Master Admin Key)
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono font-bold">
                    Super Admin
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  आपातकालीन मास्टर कुंजी (अधिकृत प्रशासक):
                </div>
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {revealedKeys['master'] ? 'Shashi@CIBM#2026' : '••••••••••••••••'}
                  </span>
                  <button
                    onClick={() => toggleReveal('master')}
                    className="p-1 text-slate-500 hover:text-slate-900 rounded cursor-pointer"
                  >
                    {revealedKeys['master'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  प्रशासक: Shashi Kant Pandey, Senior Manager (OL), CIBM, Manipal
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <span>
            केंद्रीय नियंत्रक: <strong>Shashi Kant Pandey</strong>, Senior Manager (OL), CIBM, Manipal
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition cursor-pointer"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
