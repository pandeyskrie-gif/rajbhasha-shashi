import React, { useState } from 'react';
import { Officer } from '../types';
import { 
  getPasswordsRegistry, 
  updatePasswordForUser, 
  savePasswordsRegistry 
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
  ExternalLink
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  officers: Officer[];
}

export const CentralPasswordModal: React.FC<Props> = ({ isOpen, onClose, officers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [passwords, setPasswords] = useState<Record<string, string>>(() => getPasswordsRegistry());
  const [editingStaffNo, setEditingStaffNo] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [copiedStaffNo, setCopiedStaffNo] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartEdit = (staffNo: string) => {
    setEditingStaffNo(staffNo);
    setEditValue(passwords[staffNo] || '');
  };

  const handleSaveEdit = (staffNo: string) => {
    if (!editValue.trim()) return;
    updatePasswordForUser(staffNo, editValue.trim());
    setPasswords(getPasswordsRegistry());
    setEditingStaffNo(null);
    showNotice(`स्टाफ नं. ${staffNo} का पासवर्ड सफलतापूर्वक अपडेट कर दिया गया!`);
  };

  const handleGenerateRandom = (staffNo: string, officerName: string) => {
    const first = officerName.split(' ')[0].slice(0, 4);
    const randDigits = Math.floor(100 + Math.random() * 900);
    const generated = `${first}@${randDigits}#`;
    updatePasswordForUser(staffNo, generated);
    setPasswords(getPasswordsRegistry());
    showNotice(`स्टाफ नं. ${staffNo} के लिए नया पासवर्ड (${generated}) तैयार किया गया!`);
  };

  const handleCopyCredentials = (staffNo: string, officerName: string, officeName: string) => {
    const pass = passwords[staffNo] || 'उपलब्ध नहीं';
    const text = `प्रिय ${officerName} जी,\n\nकेनरा बैंक राजभाषा तिमाही रिपोर्ट एवं प्रबंधन प्रणाली पोर्टल हेतु आपकी लॉगिन विवरणी:\n• कर्मचारी संख्या (लॉगिन आईडी): ${staffNo}\n• व्यक्तिगत पासवर्ड: ${pass}\n• कार्यालय: ${officeName}\n• पोर्टल लिंक: ${window.location.origin + window.location.pathname}?fullscreenApplet=true\n\nकृपया पोर्टल खोलकर अपना पासवर्ड दर्ज करें और तिमाही रिपोर्ट भरें।\n\nसादर,\nशशिकांत पांडेय\nवरिष्ठ प्रबंधक (राजभाषा), सीआईबीएम, मणिपाल`;

    navigator.clipboard.writeText(text);
    setCopiedStaffNo(staffNo);
    showNotice(`${officerName} जी के लॉगिन विवरण का संदेश कॉपी हो गया! इसे सीधे व्हाट्सएप या ईमेल पर भेजें।`);
    setTimeout(() => setCopiedStaffNo(null), 3000);
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredOfficers = officers.filter(
    (o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.staffNo.includes(searchTerm) ||
      o.primaryOfficeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.circleOfficeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-900 p-5 text-white flex items-center justify-between border-b-4 border-amber-400 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-black">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-amber-300">
                केंद्रीय पासवर्ड प्रबंधन केंद्र (Central Password Manager)
              </h3>
              <p className="text-xs text-blue-200 mt-0.5">
                केवल अधिकृत प्रशासक (Shashi Kant Pandey, Senior Manager (OL), CIBM, Manipal) हेतु
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

        {/* Search & Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="अधिकारी का नाम, कर्मचारी सं. या कार्यालय से खोजें..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 w-full sm:w-auto justify-end">
            <span className="font-bold text-blue-900">{filteredOfficers.length}</span> अधिकारी प्रदर्शित
          </div>
        </div>

        {notification && (
          <div className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center justify-between shrink-0">
            <span className="font-semibold">{notification}</span>
            <button onClick={() => setNotification(null)} className="text-emerald-700 font-bold ml-2">×</button>
          </div>
        )}

        {/* Officers Password Table */}
        <div className="p-4 overflow-y-auto grow space-y-2">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>गोपनीयता निर्देश:</strong> यहाँ से आप प्रत्येक अधिकारी का पासवर्ड देख सकते हैं, नया पासवर्ड बना सकते हैं, तथा "विवरण कॉपी करें" बटन दबाकर संबंधित अधिकारी को व्हाट्सएप/ईमेल द्वारा संदेश भेज सकते हैं।
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">क्र.सं.</th>
                  <th className="p-2.5">अधिकारी का नाम</th>
                  <th className="p-2.5">कर्मचारी सं.</th>
                  <th className="p-2.5">मूल पदस्थापन (RO/CO)</th>
                  <th className="p-2.5">अंचल कार्यालय</th>
                  <th className="p-2.5">गुप्त पासवर्ड (Secret Password)</th>
                  <th className="p-2.5 text-center">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOfficers.map((o, idx) => {
                  const pass = passwords[o.staffNo] || 'उपलब्ध नहीं';
                  const isEditing = editingStaffNo === o.staffNo;

                  return (
                    <tr key={o.id} className="hover:bg-blue-50/50 transition">
                      <td className="p-2.5 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="p-2.5 font-bold text-slate-900">
                        {o.name}
                        <span className="block text-[10px] text-slate-400 font-normal">{o.designation}</span>
                      </td>
                      <td className="p-2.5 font-mono font-bold text-blue-900">{o.staffNo}</td>
                      <td className="p-2.5 text-slate-700 text-[11px]">{o.primaryOfficeName}</td>
                      <td className="p-2.5 text-slate-600 text-[11px]">{o.circleOfficeName}</td>

                      {/* Password Field */}
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
                              onClick={() => handleSaveEdit(o.staffNo)}
                              className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                              title="सहेजें"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingStaffNo(null)}
                              className="p-1 bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
                              title="रद्द करें"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono bg-blue-50 text-blue-900 px-2 py-1 rounded font-bold border border-blue-200">
                              {pass}
                            </span>
                            <button
                              onClick={() => handleStartEdit(o.staffNo)}
                              className="p-1 text-slate-400 hover:text-blue-700 hover:bg-blue-100 rounded"
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
                            onClick={() => handleCopyCredentials(o.staffNo, o.name, o.primaryOfficeName)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer ${
                              copiedStaffNo === o.staffNo
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-300'
                            }`}
                            title="संदेश कॉपी करें व अधिकारी को भेजें"
                          >
                            {copiedStaffNo === o.staffNo ? (
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
                            onClick={() => handleGenerateRandom(o.staffNo, o.name)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
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

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <span>
            केंद्रीय नियंत्रक: <strong>Shashi Kant Pandey</strong>, Senior Manager (OL), CIBM, Manipal
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
