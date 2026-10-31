import React, { useState, useRef } from 'react';
import { SignedPdfRecord, QuarterlyReport } from '../types';
import { 
  FileCheck2, 
  Upload, 
  CheckCircle2, 
  Eye, 
  Download, 
  Trash2, 
  AlertCircle, 
  Lock, 
  FileText, 
  Calendar, 
  UserCheck, 
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { SignedPdfViewerModal } from './SignedPdfViewerModal';

interface Props {
  reportData: QuarterlyReport;
  onUpdateSignedPdf: (signedPdf: SignedPdfRecord | null) => void;
  readOnly?: boolean;
}

export const SignedPdfUploadSection: React.FC<Props> = ({
  reportData,
  onUpdateSignedPdf,
  readOnly = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [signDate, setSignDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [officerSignName, setOfficerSignName] = useState<string>(
    reportData.officerSignatureName || `${reportData.officerName} (${reportData.officerDesignation})`
  );
  const [headSignName, setHeadSignName] = useState<string>(
    reportData.officeHeadSignatureName || ''
  );
  const [uploadRemarks, setUploadRemarks] = useState<string>(
    'कार्यालय प्रमुख एवं राजभाषा अधिकारी के हस्ताक्षर व मुहर सहित मूल प्रति।'
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const existingRecord = reportData.signedPdf;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('कृपया केवल PDF (.pdf) प्रारूप की फाइल ही चुनें!');
      return;
    }

    // Limit to 15MB for base64 storage
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('फाइल का आकार 15 MB से कम होना चाहिए।');
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadSubmit = () => {
    if (!selectedFile) {
      setErrorMsg('कृपया हस्ताक्षरित पीडीएफ फाइल चुनें!');
      return;
    }
    if (!headSignName.trim()) {
      setErrorMsg('कृपया हस्ताक्षर करने वाले कार्यालय प्रमुख का नाम व पदनाम अवश्य दर्ज करें!');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const base64Data = event.target?.result as string;
        const newRecord: SignedPdfRecord = {
          id: `spdf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type || 'application/pdf',
          base64Data,
          uploadedAt: new Date().toISOString(),
          uploadedByStaffNo: reportData.officerStaffNo,
          uploadedByName: reportData.officerName,
          signedByOfficerName: officerSignName,
          signedByHeadName: headSignName,
          signatureDate: signDate,
          remarks: uploadRemarks,
          status: 'हस्ताक्षरित प्रति संलग्न',
        };

        onUpdateSignedPdf(newRecord);
        setSelectedFile(null);
        setIsReplacing(false);
        setIsUploading(false);
      } catch (err) {
        setErrorMsg('फाइल अपलोड करने में त्रुटि उत्पन्न हुई। कृपया पुनः प्रयास करें।');
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg('फाइल पढ़ने में त्रुटि। कृपया पुनः प्रयास करें।');
      setIsUploading(false);
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleRemove = () => {
    if (window.confirm('क्या आप निश्चित हैं कि इस हस्ताक्षरित पीडीएफ को हटाना चाहते हैं?')) {
      onUpdateSignedPdf(null);
      setIsReplacing(false);
      setSelectedFile(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-indigo-200/80 p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-100 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900">
                हस्ताक्षरित एवं अनुमोदित रिपोर्ट (Signed & Approved Report PDF)
              </h3>
              <span className="text-[11px] bg-indigo-100 text-indigo-900 font-bold px-2 py-0.5 rounded-full border border-indigo-300">
                प्रामाणिकता एवं सत्यापन
              </span>
              <span className="text-[11px] bg-amber-50 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300 inline-flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-600" />
                <span>केवल प्र.का. (HO) स्तर पर दृश्य</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              रिपोर्ट का प्रिंटआउट लेकर <strong>राजभाषा अधिकारी</strong> एवं <strong>कार्यालय प्रमुख (Head of Office)</strong> के भौतिक/डिजिटल हस्ताक्षर व मुहर उपरांत, उसकी अंतिम पीडीएफ प्रति यहाँ अपलोड करें।
            </p>
          </div>
        </div>

        {existingRecord && !isReplacing && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowViewerModal(true)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-lg border border-blue-200 transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>देखें / पूर्वावलोकन</span>
            </button>
            {!readOnly && (
              <button
                type="button"
                onClick={() => setIsReplacing(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                title="हस्ताक्षरित प्रति बदलें या पुनः अपलोड करें"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>प्रति बदलें</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Case 1: Already Uploaded and Active */}
      {existingRecord && !isReplacing ? (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-300 rounded-xl p-4 sm:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-emerald-950">
                    {existingRecord.fileName}
                  </span>
                  <span className="text-xs bg-emerald-100 text-emerald-900 font-semibold px-2 py-0.5 rounded-full border border-emerald-300">
                    {formatFileSize(existingRecord.fileSize)}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      existingRecord.status === 'प्र.का. द्वारा सत्यापित'
                        ? 'bg-blue-600 text-white'
                        : 'bg-emerald-700 text-white'
                    }`}
                  >
                    {existingRecord.status}
                  </span>
                </div>

                <div className="text-xs text-slate-700 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                  <span>
                    <strong>राजभाषा हस्ताक्षरकर्ता:</strong> {existingRecord.signedByOfficerName}
                  </span>
                  <span>
                    <strong>कार्यालय प्रमुख हस्ताक्षरकर्ता:</strong> {existingRecord.signedByHeadName}
                  </span>
                  <span>
                    <strong>हस्ताक्षर दिनांक:</strong> {existingRecord.signatureDate}
                  </span>
                  <span>
                    <strong>अपलोड समय:</strong> {new Date(existingRecord.uploadedAt).toLocaleString('hi-IN')}
                  </span>
                </div>

                {existingRecord.remarks && (
                  <p className="text-xs text-slate-600 italic pt-0.5">
                    टिप्पणी: "{existingRecord.remarks}"
                  </p>
                )}

                {existingRecord.verifiedByHOAt && (
                  <div className="pt-2 text-xs text-blue-900 font-bold inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <span>
                      प्रधान कार्यालय (HO) द्वारा विधिवत सत्यापित ({existingRecord.verifiedByHOOfficer || 'श्री शशि कांत पांडेय'} - {new Date(existingRecord.verifiedByHOAt).toLocaleDateString('hi-IN')})
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                type="button"
                onClick={() => setShowViewerModal(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>पीडीएफ देखें</span>
              </button>

              {!readOnly && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-2 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                  title="हटाएं"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-200/80 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Lock className="w-3.5 h-3.5 text-indigo-700" />
              <span>
                <strong>गोपनीयता सुरक्षा:</strong> यह हस्ताक्षरित रिपोर्ट केवल आपके कार्यालय तथा <strong>प्रधान कार्यालय (Head Office)</strong> स्तर पर ही खोली व देखी जा सकती है।
              </span>
            </span>
          </div>
        </div>
      ) : (
        /* Case 2: Upload / Replace Form */
        <div className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Signatory 1: OL Officer */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                १. राजभाषा अधिकारी हस्ताक्षरकर्ता का नाम व पदनाम:
              </label>
              <input
                type="text"
                value={officerSignName}
                onChange={(e) => setOfficerSignName(e.target.value)}
                placeholder="उदा. अनिल शर्मा, प्रबंधक (रा.भा.)"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white"
              />
            </div>

            {/* Signatory 2: Office Head */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                २. कार्यालय प्रमुख हस्ताक्षरकर्ता का नाम व पदनाम (मुहर सहित): <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={headSignName}
                onChange={(e) => setHeadSignName(e.target.value)}
                placeholder="उदा. श्री सुनील अरोड़ा, क्षेत्रीय प्रमुख (उप महाप्रबंधक)"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white"
                required
              />
            </div>

            {/* Signature Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ३. हस्ताक्षर दिनांक (Date of Signature):
              </label>
              <input
                type="date"
                value={signDate}
                onChange={(e) => setSignDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ४. विशेष टिप्पणी / विवरण (Remarks):
            </label>
            <input
              type="text"
              value={uploadRemarks}
              onChange={(e) => setUploadRemarks(e.target.value)}
              placeholder="उदा. दोनों अधिकारियों के हस्ताक्षर व कार्यालय मुहर सहित सत्यापित प्रति संलग्न।"
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800"
            />
          </div>

          {/* File Picker Drag & Drop Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
              selectedFile
                ? 'border-emerald-400 bg-emerald-50/50'
                : 'border-indigo-300 bg-indigo-50/30 hover:bg-indigo-50/60'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              {selectedFile ? (
                <div>
                  <p className="text-sm font-bold text-emerald-900 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>चयनित फाइल: {selectedFile.name}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    आकार: {formatFileSize(selectedFile.size)} | प्रारूप: PDF
                  </p>
                  <span className="text-[11px] text-blue-700 underline font-semibold mt-1 inline-block">
                    (दूसरी फाइल चुनने के लिए यहाँ क्लिक करें)
                  </span>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    हस्ताक्षरित पीडीएफ फाइल चुनें या यहाँ खींचकर लाएँ (Drag & Drop)
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    केवल PDF प्रारूप (.pdf), अधिकतम 15 MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>अपलोड के बाद यह प्रति केवल प्रधान कार्यालय (HO) स्तर पर ही सुलभ होगी।</span>
            </span>

            <div className="flex items-center gap-2">
              {isReplacing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsReplacing(false);
                    setSelectedFile(null);
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  रद्द करें
                </button>
              )}

              <button
                type="button"
                disabled={!selectedFile || isUploading}
                onClick={handleUploadSubmit}
                className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-md transition inline-flex items-center gap-2 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>अपलोड हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <FileCheck2 className="w-4 h-4" />
                    <span>हस्ताक्षरित एवं प्रमाणित पीडीएफ सुरक्षित रूप से संलग्न करें</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full PDF Viewer Modal */}
      <SignedPdfViewerModal
        isOpen={showViewerModal}
        onClose={() => setShowViewerModal(false)}
        record={existingRecord || null}
        officeName={reportData.primaryOfficeName}
        circleName={reportData.circleOfficeName}
        quarter={reportData.quarter}
        canVerify={false}
      />
    </div>
  );
};
