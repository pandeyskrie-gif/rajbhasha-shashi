import React, { useState } from 'react';
import { Calendar, Check, X, Clock, ChevronRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedQuarter: string;
  onSelectPeriod: (quarterName: string, financialYear: string, fromDate: string, toDate: string) => void;
}

export const QuarterDateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedQuarter,
  onSelectPeriod,
}) => {
  const currentYear = new Date().getFullYear(); // 2026
  
  // Available Financial Years (Historical & Future: 2021 to 2028)
  const financialYears = [
    '2027-2028',
    '2026-2027',
    '2025-2026',
    '2024-2025',
    '2023-2024',
    '2022-2023',
    '2021-2022',
  ];

  const [activeTab, setActiveTab] = useState<'standard' | 'customDate'>('standard');
  const [selectedFY, setSelectedFY] = useState<string>('2026-2027');
  const [selectedQtrIndex, setSelectedQtrIndex] = useState<number>(1); // Q2 default (Jul-Sep)

  // Custom date range state
  const [customFromDate, setCustomFromDate] = useState('2026-07-01');
  const [customToDate, setCustomToDate] = useState('2026-09-30');
  const [customPeriodLabel, setCustomPeriodLabel] = useState('जुलाई - सितंबर 2026');

  if (!isOpen) return null;

  const startYear = parseInt(selectedFY.split('-')[0], 10);
  const endYear = parseInt(selectedFY.split('-')[1], 10);

  const quartersMeta = [
    {
      index: 0,
      code: 'Q1',
      name: `अप्रैल - जून ${startYear}`,
      desc: 'प्रथम तिमाही (First Quarter)',
      fromDate: `${startYear}-04-01`,
      toDate: `${startYear}-06-30`,
      displayRange: `01/04/${startYear} से 30/06/${startYear}`,
    },
    {
      index: 1,
      code: 'Q2',
      name: `जुलाई - सितंबर ${startYear}`,
      desc: 'द्वितीय तिमाही (Second Quarter)',
      fromDate: `${startYear}-07-01`,
      toDate: `${startYear}-09-30`,
      displayRange: `01/07/${startYear} से 30/09/${startYear}`,
    },
    {
      index: 2,
      code: 'Q3',
      name: `अक्टूबर - दिसंबर ${startYear}`,
      desc: 'तृतीय तिमाही (Third Quarter)',
      fromDate: `${startYear}-10-01`,
      toDate: `${startYear}-12-31`,
      displayRange: `01/10/${startYear} से 31/12/${startYear}`,
    },
    {
      index: 3,
      code: 'Q4',
      name: `जनवरी - मार्च ${endYear}`,
      desc: 'चतुर्थ तिमाही (Fourth Quarter)',
      fromDate: `${endYear}-01-01`,
      toDate: `${endYear}-03-31`,
      displayRange: `01/01/${endYear} से 31/03/${endYear}`,
    },
  ];

  const handleApplyStandard = (qMeta: typeof quartersMeta[0]) => {
    onSelectPeriod(qMeta.name, selectedFY, qMeta.fromDate, qMeta.toDate);
    onClose();
  };

  const handleApplyCustomDate = () => {
    if (!customFromDate || !customToDate) return;
    const fYear = `${new Date(customFromDate).getFullYear()}-${new Date(customToDate).getFullYear()}`;
    const label = customPeriodLabel.trim() || `${customFromDate} से ${customToDate}`;
    onSelectPeriod(label, fYear, customFromDate, customToDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-5 flex items-center justify-between border-b-2 border-amber-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400 text-blue-950 rounded-xl flex items-center justify-center shadow">
              <Calendar className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide">
                समीक्षा तिमाही एवं अवधि चयन (Select Review Quarter / Date Range)
              </h3>
              <p className="text-xs text-blue-200">
                वर्तमान अथवा किसी भी पूर्व वर्ष (Historical Years) की तिमाही व विशिष्ट तिथि चुनें
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg text-slate-200 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch: Standard Quarter vs Custom Date Range */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 text-xs font-semibold px-4 pt-3">
          <button
            onClick={() => setActiveTab('standard')}
            className={`px-4 py-2.5 rounded-t-lg transition border-b-2 ${
              activeTab === 'standard'
                ? 'bg-white border-blue-600 text-blue-950 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            १. वित्तीय वर्ष एवं तिमाही चयन (Year & Quarter)
          </button>
          <button
            onClick={() => setActiveTab('customDate')}
            className={`px-4 py-2.5 rounded-t-lg transition border-b-2 ${
              activeTab === 'customDate'
                ? 'bg-white border-blue-600 text-blue-950 shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            २. विशिष्ट तारीख चयन (Custom Date Range)
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {activeTab === 'standard' ? (
            <div className="space-y-5">
              {/* Financial Year Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  वित्तीय वर्ष चुनें (Select Financial Year - पूर्व एवं वर्तमान वर्ष):
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {financialYears.map((fy) => (
                    <button
                      key={fy}
                      type="button"
                      onClick={() => setSelectedFY(fy)}
                      className={`p-2 rounded-lg text-xs font-bold border transition cursor-pointer text-center ${
                        selectedFY === fy
                          ? 'bg-blue-900 text-amber-300 border-blue-950 shadow-sm'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {fy}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Quarters of selected financial year */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {selectedFY} की तिमाही एवं तारीख अवधि चुनें (Select Quarter & Exact Dates):
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quartersMeta.map((q) => {
                    const isSelected = selectedQuarter === q.name;
                    return (
                      <div
                        key={q.code}
                        onClick={() => handleApplyStandard(q)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/30 shadow-md'
                            : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                              {q.code} - {q.desc}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 mt-2">
                              {q.name}
                            </h4>
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                              ✓
                            </span>
                          )}
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span className="font-mono text-[11px] text-blue-900 font-semibold">
                            📅 {q.displayRange}
                          </span>
                          <span className="text-blue-700 font-bold hover:underline inline-flex items-center">
                            चुनें <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Custom Date Selection */
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                <strong>विशिष्ट तारीख चयन:</strong> आप किसी भी पूर्व या विशेष अवधि के लिए समीक्षा प्रारंभ व समाप्ति तिथि सीधे कैलेंडर से चुन सकते हैं।
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    समीक्षा प्रारंभ तिथि (From Date):
                  </label>
                  <input
                    type="date"
                    value={customFromDate}
                    onChange={(e) => setCustomFromDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    समीक्षा समाप्ति तिथि (To Date):
                  </label>
                  <input
                    type="date"
                    value={customToDate}
                    onChange={(e) => setCustomToDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  अवधि / तिमाही का शीर्षक (Period / Quarter Title):
                </label>
                <input
                  type="text"
                  placeholder="उदा. जुलाई - सितंबर 2024 अथवा विशेष समीक्षा 2025"
                  value={customPeriodLabel}
                  onChange={(e) => setCustomPeriodLabel(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleApplyCustomDate}
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow transition cursor-pointer"
                >
                  यह तारीख अवधि लागू करें (Apply Date Range)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            वर्तमान में चयनित:{' '}
            <strong className="text-blue-900 font-bold">{selectedQuarter}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
