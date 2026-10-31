import React, { useState } from 'react';
import { SignedPdfRecord } from '../types';
import { 
  FileCheck2, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Calendar, 
  UserCheck, 
  Clock, 
  Building
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: SignedPdfRecord | null;
  officeName?: string;
  circleName?: string;
  quarter?: string;
  canVerify?: boolean; // Only true for Head Office
  onVerify?: (status: 'प्र.का. द्वारा सत्यापित' | 'संशोधन अपेक्षित', remarks: string) => void;
}

export const SignedPdfViewerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  record,
  officeName,
  circleName,
  quarter,
  canVerify = false,
  onVerify,
}) => {
  const [hoRemarks, setHoRemarks] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen || !record) return null;

  const handleDownload = () => {
    try {
      const a = document.createElement('a');
      a.href = record.base64Data;
      a.download = record.fileName || `Signed_Report_${record.uploadedByStaffNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      window.open(record.base64Data, '_blank');
    }
  };

  const handleOpenInNewTab = () => {
    // Open base64 in a new window/tab safely
    const win = window.open();
    if (win) {
      win.document.write(
        `<html><head><title>${record.fileName}</title></head><body style="margin:0"><embed width="100%" height="100%" src="${record.base64Data}" type="application/pdf"></body></html>`
      );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:px-6 flex items-start justify-between gap-4 border-b border-blue-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold shrink-0 mt-0.5 shadow">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-amber-400 text-blue-950 font-extrabold px-2 py-0.5 rounded">
                  हस्ताक्षरित एवं अनुमोदित रिपोर्ट (Signed Authentic PDF)
                </span>
                <span className="text-xs bg-blue-800/80 text-blue-100 px-2 py-0.5 rounded font-mono">
                  {quarter || 'समीक्षा तिमाही'}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    record.status === 'प्र.का. द्वारा सत्यापित'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : record.status === 'संशोधन अपेक्षित'
                      ? 'bg-rose-500 text-white'
                      : 'bg-amber-300 text-blue-950'
                  }`}
                >
                  {record.status}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                {officeName || record.fileName}
              </h3>
              <p className="text-xs text-blue-200">
                {circleName ? `${circleName} | ` : ''}हस्ताक्षरकर्ता: <strong>{record.signedByOfficerName}</strong> (राजभाषा) एवं <strong>{record.signedByHeadName}</strong> (कार्यालय प्रमुख)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded-lg border border-blue-500 transition inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="पीडीएफ डाउनलोड करें"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">डाउनलोड</span>
            </button>
            <button
              onClick={handleOpenInNewTab}
              className="p-1.5 bg-blue-800/80 hover:bg-blue-700 text-white rounded-lg transition cursor-pointer"
              title="अलग टैब में खोलें"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition cursor-pointer ml-1"
              title="बंद करें"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metadata & Verification Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-700">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>हस्ताक्षर तिथि: <strong>{record.signatureDate || 'अनुपलब्ध'}</strong></span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>अपलोड: <strong>{record.uploadedAt ? new Date(record.uploadedAt).toLocaleString('hi-IN') : '-'}</strong></span>
            </span>
            <span className="text-slate-500">
              फ़ाइल: <strong>{record.fileName}</strong> ({formatFileSize(record.fileSize)})
            </span>
            {record.remarks && (
              <span className="text-slate-600 italic bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                टिप्पणी: "{record.remarks}"
              </span>
            )}
          </div>

          {record.verifiedByHOAt && (
            <div className="text-emerald-800 font-semibold inline-flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                सत्यापित: {record.verifiedByHOOfficer || 'प्र.का. अधिकारी'} ({new Date(record.verifiedByHOAt).toLocaleDateString('hi-IN')})
              </span>
            </div>
          )}
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-slate-200 p-2 sm:p-4 overflow-hidden relative flex flex-col">
          <div className="flex-1 bg-white rounded-xl shadow-inner border border-slate-300 overflow-hidden relative min-h-[400px]">
            {record.base64Data ? (
              <iframe
                src={record.base64Data}
                title={record.fileName}
                className="w-full h-full border-0"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-amber-500 mb-2" />
                <p className="font-semibold text-slate-700">पीडीएफ डेटा प्रदर्शित नहीं किया जा सका</p>
                <p className="text-xs text-slate-500 mt-1">कृपया सीधे डाउनलोड करके देखें।</p>
                <button
                  onClick={handleDownload}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
                >
                  डाउनलोड करें
                </button>
              </div>
            )}
          </div>
        </div>

        {/* HO Verification Controls (Exclusively for Head Office) */}
        {canVerify && onVerify && (
          <div className="bg-slate-50 border-t border-slate-200 p-4 sm:px-6">
            {!isVerifying ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>
                    <strong>प्रधान कार्यालय सत्यापन (HO Verification):</strong> क्या यह हस्ताक्षरित रिपोर्ट नियमानुसार पूर्ण व मुहरयुक्त है?
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onVerify('प्र.का. द्वारा सत्यापित', 'प्रधान कार्यालय राजभाषा विभाग द्वारा हस्ताक्षरित प्रति सत्यापित एवं अनुमोदित की गई।');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ प्र.का. द्वारा सत्यापित एवं मान्य करें</span>
                  </button>
                  <button
                    onClick={() => setIsVerifying(true)}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    विशेष टिप्पणी / संशोधन अनुरोध
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    प्रधान कार्यालय सत्यापन टिप्पणी / निर्देश दर्ज करें:
                  </span>
                  <button
                    onClick={() => setIsVerifying(false)}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    रद्द करें
                  </button>
                </div>
                <input
                  type="text"
                  value={hoRemarks}
                  onChange={(e) => setHoRemarks(e.target.value)}
                  placeholder="उदा. रिपोर्ट की दोनों पृष्ठों पर हस्ताक्षर व मुहर का मिलान हो गया है..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      onVerify('संशोधन अपेक्षित', hoRemarks || 'हस्ताक्षर अथवा मुहर अस्पष्ट है, कृपया पुनः अपलोड करें।');
                      setIsVerifying(false);
                    }}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    संशोधन हेतु वापस करें
                  </button>
                  <button
                    onClick={() => {
                      onVerify('प्र.का. द्वारा सत्यापित', hoRemarks || 'प्रधान कार्यालय द्वारा हस्ताक्षरित रिपोर्ट सत्यापित एवं स्वीकृत।');
                      setIsVerifying(false);
                    }}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>स्वीकृत व सत्यापित करें</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
