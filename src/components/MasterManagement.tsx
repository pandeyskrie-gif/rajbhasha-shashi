import React, { useState } from 'react';
import { Officer, Office, QuarterlyReport } from '../types';
import { 
  UserPlus, 
  Building, 
  Trash2, 
  Edit3, 
  Plus, 
  Check, 
  RotateCcw, 
  Download, 
  Upload, 
  Search,
  Sliders
} from 'lucide-react';

interface Props {
  officers: Officer[];
  onAddOfficer: (officer: Officer) => void;
  onUpdateOfficer: (officer: Officer) => void;
  onDeleteOfficer: (staffNo: string) => void;
  allOffices: Office[];
  circleOffices: { code: string; name: string }[];
  onResetToDefaults: () => void;
  onBackupExport: () => void;
  onBackupImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MasterManagement: React.FC<Props> = ({
  officers,
  onAddOfficer,
  onUpdateOfficer,
  onDeleteOfficer,
  allOffices,
  circleOffices,
  onResetToDefaults,
  onBackupExport,
  onBackupImport,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'officers' | 'concurrent' | 'offices' | 'backup'>('officers');
  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Officer Form state
  const [editingStaffNo, setEditingStaffNo] = useState<string | null>(null);
  const [formStaffNo, setFormStaffNo] = useState('');
  const [formName, setFormName] = useState('');
  const [formDesignation, setFormDesignation] = useState('Manager');
  const [formPrimaryOffice, setFormPrimaryOffice] = useState(allOffices[0]?.name || '');
  const [formCircleCode, setFormCircleCode] = useState(circleOffices[0]?.code || '');
  const [formConcurrentOffices, setFormConcurrentOffices] = useState<string[]>([]);
  const [formSubordinateCount, setFormSubordinateCount] = useState<number>(50);
  const [formSuccess, setFormSuccess] = useState('');

  const openEditModal = (off: Officer) => {
    setEditingStaffNo(off.staffNo);
    setFormStaffNo(off.staffNo);
    setFormName(off.name);
    setFormDesignation(off.designation);
    setFormPrimaryOffice(off.primaryOfficeName);
    setFormCircleCode(off.circleOfficeCode);
    setFormConcurrentOffices([...off.concurrentOffices]);
    setFormSubordinateCount(off.subordinateCount || 40);
  };

  const resetForm = () => {
    setEditingStaffNo(null);
    setFormStaffNo('');
    setFormName('');
    setFormDesignation('Manager');
    setFormPrimaryOffice(allOffices[0]?.name || '');
    setFormCircleCode(circleOffices[0]?.code || '');
    setFormConcurrentOffices([]);
    setFormSubordinateCount(40);
  };

  const handleSaveOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStaffNo || !formName) return;

    const matchedCircle = circleOffices.find((c) => c.code === formCircleCode);

    const officerData: Officer = {
      id: editingStaffNo || `off-${Date.now()}`,
      staffNo: formStaffNo,
      name: formName.toUpperCase(),
      designation: formDesignation,
      primaryOfficeType: formPrimaryOffice.includes('CIRCLE') ? 'CO' : 'RO',
      primaryOfficeName: formPrimaryOffice,
      circleOfficeCode: formCircleCode,
      circleOfficeName: matchedCircle ? matchedCircle.name : `${formCircleCode} C.O.`,
      concurrentOffices: formConcurrentOffices,
      subordinateCount: Number(formSubordinateCount) || 30,
    };

    if (editingStaffNo) {
      onUpdateOfficer(officerData);
      setFormSuccess('अधिकारी विवरण सफलतापूर्वक अद्यतन किया गया!');
    } else {
      onAddOfficer(officerData);
      setFormSuccess('नया अधिकारी सफलतापूर्वक मास्टर डेटा में जोड़ा गया!');
    }

    resetForm();
    setTimeout(() => setFormSuccess(''), 3000);
  };

  const toggleFormConcurrent = (roName: string) => {
    if (formConcurrentOffices.includes(roName)) {
      setFormConcurrentOffices(formConcurrentOffices.filter((o) => o !== roName));
    } else {
      setFormConcurrentOffices([...formConcurrentOffices, roName]);
    }
  };

  const filteredOfficers = officers.filter((o) => {
    const q = searchTerm.toLowerCase();
    return (
      o.name.toLowerCase().includes(q) ||
      o.staffNo.includes(q) ||
      o.primaryOfficeName.toLowerCase().includes(q) ||
      o.circleOfficeName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center font-bold">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                मास्टर डेटा एवं व्यवस्थापक सेटिंग्स (Admin Master Data)
              </h2>
              <p className="text-xs text-slate-500">
                नए अधिकारी जोड़ें, समवर्ती प्रभार (Concurrent Charges) प्रबंधित करें, कार्यालय व डेटा बैकअप
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetToDefaults}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition"
              title="मूल डेटा पुनर्स्थापित करें"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>डिफ़ॉल्ट डेटा पुनर्स्थापित करें</span>
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 mt-4 pt-3 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('officers')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'officers' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            राजभाषा अधिकारी सूची ({officers.length})
          </button>
          <button
            onClick={() => setActiveSubTab('concurrent')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'concurrent' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            समवर्ती प्रभार प्रबंधन
          </button>
          <button
            onClick={() => setActiveSubTab('backup')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeSubTab === 'backup' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            डेटा बैकअप एवं रिस्टोर
          </button>
        </div>
      </div>

      {formSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* Officers Tab */}
      {activeSubTab === 'officers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add / Edit Form Column */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b">
              {editingStaffNo ? 'अधिकारी विवरण संपादित करें' : 'नया राजभाषा अधिकारी जोड़ें'}
            </h3>

            <form onSubmit={handleSaveOfficer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">कर्मचारी संख्या (Staff No):</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. 902999"
                  value={formStaffNo}
                  onChange={(e) => setFormStaffNo(e.target.value)}
                  disabled={!!editingStaffNo}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">अधिकारी का नाम (Name):</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. RAMESH KUMAR"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">पदनाम (Designation):</label>
                <select
                  value={formDesignation}
                  onChange={(e) => setFormDesignation(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-medium"
                >
                  <option value="Senior Manager">Senior Manager (वरिष्ठ प्रबंधक)</option>
                  <option value="Manager">Manager (प्रबंधक)</option>
                  <option value="Officer">Officer (अधिकारी)</option>
                  <option value="Chief Manager">Chief Manager (मुख्य प्रबंधक)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">अंचल कार्यालय (Circle Office):</label>
                <select
                  value={formCircleCode}
                  onChange={(e) => setFormCircleCode(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-medium"
                >
                  {circleOffices.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">मूल पदस्थापन कार्यालय (Primary Office):</label>
                <select
                  value={formPrimaryOffice}
                  onChange={(e) => setFormPrimaryOffice(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-medium"
                >
                  {allOffices.map((o) => (
                    <option key={o.name} value={o.name}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">अधीनस्थ शाखाओं की संख्या:</label>
                <input
                  type="number"
                  value={formSubordinateCount}
                  onChange={(e) => setFormSubordinateCount(Number(e.target.value) || 0)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                {editingStaffNo && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                  >
                    रद्द करें
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold shadow-sm"
                >
                  {editingStaffNo ? 'अपडेट सहेजें' : '+ अधिकारी जोड़ें'}
                </button>
              </div>
            </form>
          </div>

          {/* Officers List Column */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900">
                पंजीकृत राजभाषा अधिकारी सूची ({officers.length})
              </h3>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="अधिकारी नाम / संख्या खोजें..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border rounded text-xs w-48 outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[11px] font-bold sticky top-0">
                  <tr>
                    <th className="p-2.5 w-12 text-center">क्र.</th>
                    <th className="p-2.5 w-44">अधिकारी का नाम</th>
                    <th className="p-2.5 w-24">कर्मचारी सं.</th>
                    <th className="p-2.5 w-44">मूल कार्यालय</th>
                    <th className="p-2.5 w-36">अंचल</th>
                    <th className="p-2.5 w-20 text-center">कार्रवाई</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredOfficers.map((off, idx) => (
                    <tr key={off.id} className="hover:bg-slate-50">
                      <td className="p-2.5 text-center text-slate-400 font-bold">{idx + 1}.</td>
                      <td className="p-2.5 font-bold text-slate-900">{off.name}</td>
                      <td className="p-2.5 font-mono text-slate-600">{off.staffNo}</td>
                      <td className="p-2.5 text-blue-900 font-medium">{off.primaryOfficeName}</td>
                      <td className="p-2.5 text-slate-600">{off.circleOfficeName}</td>
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(off)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="संपादित करें"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteOfficer(off.staffNo)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Concurrent Charges Tab */}
      {activeSubTab === 'concurrent' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            समवर्ती प्रभार आवंटन एवं समीक्षा (Concurrent Charge Assignment)
          </h3>
          <p className="text-xs text-slate-500">
            प्रत्येक अधिकारी के अधीन मूल कार्यालय के अतिरिक्त समवर्ती प्रभार कार्यालयों की स्थिति
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-3 w-10 text-center">क्र.</th>
                  <th className="p-3 w-48">राजभाषा अधिकारी</th>
                  <th className="p-3 w-56">मूल पदस्थापन कार्यालय</th>
                  <th className="p-3">आवंटित समवर्ती प्रभार कार्यालय (Concurrent ROs)</th>
                  <th className="p-3 w-28 text-center">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {officers.map((off, idx) => (
                  <tr key={off.id} className="hover:bg-slate-50">
                    <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}.</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{off.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{off.staffNo}</div>
                    </td>
                    <td className="p-3 font-semibold text-blue-950">{off.primaryOfficeName}</td>
                    <td className="p-3">
                      {off.concurrentOffices.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {off.concurrentOffices.map((co) => (
                            <span
                              key={co}
                              className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[11px] font-medium"
                            >
                              {co}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">कोई समवर्ती प्रभार नहीं</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          openEditModal(off);
                          setActiveSubTab('officers');
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-blue-800 rounded font-semibold text-[11px]"
                      >
                        संशोधित करें
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Backup Tab */}
      {activeSubTab === 'backup' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-slate-900">
            पोर्टल डेटा बैकअप एवं सुरक्षित संधारण (Data Backup & Portability)
          </h3>
          <p className="text-xs text-slate-600">
            संपूर्ण पोर्टल डेटा (सभी अधिकारी, उनके समवर्ती प्रभार, भरे गए तिमाही विवरण, अनुवाद कार्य और शाखा निरीक्षण) को एक क्लिक में JSON फाइल के रूप में अपने कंप्यूटर पर डाउनलोड कर सकते हैं और कभी भी दोबारा रिस्टोर कर सकते हैं।
          </p>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-xs text-slate-800 block">संपूर्ण डेटा बैकअप डाउनलोड करें</span>
              <span className="text-[11px] text-slate-500">सभी तालिकाओं व रिपोर्ट्स की सुरक्षित प्रति</span>
            </div>
            <button
              onClick={onBackupExport}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" />
              <span>बैकअप डाउनलोड (JSON)</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
            <div>
              <span className="font-bold text-xs text-slate-800 block">पूर्व बैकअप फाइल से रिस्टोर करें</span>
              <span className="text-[11px] text-slate-500">अपनी सुरक्षित .json फाइल अपलोड करें</span>
            </div>
            <label className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>फाइल चुनें व रिस्टोर करें</span>
              <input type="file" accept=".json" onChange={onBackupImport} className="hidden" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
