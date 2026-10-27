import React, { useState, useEffect } from 'react';
import { UserRole, Officer, QuarterlyReport, Office, TransferRecord } from './types';
import { 
  INITIAL_OFFICERS, 
  INITIAL_REPORTS, 
  REGIONAL_OFFICES, 
  CIRCLE_OFFICES 
} from './data/seedData';
import { AuthUser } from './utils/auth';
import { Navbar } from './components/Navbar';
import { OfficerPortal } from './components/OfficerPortal';
import { CircleOfficePortal } from './components/CircleOfficePortal';
import { HeadOfficePortal } from './components/HeadOfficePortal';
import { MasterManagement } from './components/MasterManagement';
import { PrintableReport } from './components/PrintableReport';
import { LoginScreen } from './components/LoginScreen';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { initGoogleAuth, subscribeToGoogleAuth } from './services/googleAuth';


export default function App() {
  // Read initial query params from URL
  const queryParams = new URLSearchParams(window.location.search);
  const initialRole = (queryParams.get('role') as UserRole) || 'officer';
  const initialStaffNo = queryParams.get('staffNo');
  const initialCircle = queryParams.get('circle') || '7690';
  const initialQuarter = queryParams.get('quarter') || 'जुलाई - सितंबर 2026';

  // State with LocalStorage persistence
  const [officers, setOfficers] = useState<Officer[]>(() => {
    const saved = localStorage.getItem('cb_rajbhasha_officers_v2');
    return saved ? JSON.parse(saved) : INITIAL_OFFICERS;
  });

  // Clean reports state: Zero mock/sample data! Fresh start for real bank data.
  const [reports, setReports] = useState<QuarterlyReport[]>(() => {
    try {
      localStorage.removeItem('cb_rajbhasha_reports_v2');
      localStorage.removeItem('cb_rajbhasha_reports_v1');
    } catch (e) {}
    const saved = localStorage.getItem('cb_rajbhasha_reports_clean_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [showGoogleSheetsModal, setShowGoogleSheetsModal] = useState(false);
  const [isGoogleConnectedState, setIsGoogleConnectedState] = useState(false);

  const [allOffices] = useState<Office[]>(REGIONAL_OFFICES);
  const [circleOffices] = useState<{ code: string; name: string }[]>(CIRCLE_OFFICES);

  // Authentication Session
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('cb_rajbhasha_auth_user_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // If user opened with direct staffNo in query params, or default to initial demo user
    if (initialStaffNo) {
      const match = INITIAL_OFFICERS.find((o) => o.staffNo === initialStaffNo);
      if (match) {
        return {
          role: 'officer',
          staffNo: match.staffNo,
          name: match.name,
          designation: match.designation,
          officeName: match.primaryOfficeName,
          dpCode: '6974',
          circleOfficeCode: match.circleOfficeCode,
          circleOfficeName: match.circleOfficeName,
          concurrentOffices: match.concurrentOffices,
        };
      }
    }
    return null;
  });

  // Transfer history state
  const [transferHistory, setTransferHistory] = useState<TransferRecord[]>(() => {
    const saved = localStorage.getItem('cb_rajbhasha_transfers_v2');
    return saved ? JSON.parse(saved) : [
      {
        id: 'tr-init-1',
        staffNo: '875884',
        officerName: 'PRAKASH MALI',
        fromOffice: 'REGIONAL OFFICE JAIPUR',
        fromCircleCode: '7425',
        fromCircleName: '7425 JAIPUR C.O.',
        toOffice: 'REGIONAL OFFICE KOTA',
        toCircleCode: '7425',
        toCircleName: '7425 JAIPUR C.O.',
        toConcurrentOffices: ['REGIONAL OFFICE UDAIPUR'],
        orderNo: 'HO/OL/TR/2026/102',
        transferDate: '2026-06-15',
        effectiveDate: '2026-07-01',
        remarks: 'नियमित स्थानांतरण उपरांत कार्यभार ग्रहण।',
      },
    ];
  });

  const [activeRole, setActiveRole] = useState<UserRole>(currentUser ? currentUser.role : initialRole);
  const [selectedQuarter, setSelectedQuarter] = useState<string>(initialQuarter);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState<string>('2026-2027');
  const [selectedFromDate, setSelectedFromDate] = useState<string>('2026-07-01');
  const [selectedToDate, setSelectedToDate] = useState<string>('2026-09-30');
  const [selectedCircleCode, setSelectedCircleCode] = useState<string>(
    currentUser?.role === 'co' ? currentUser.circleOfficeCode : initialCircle
  );

  const handleSelectPeriod = (quarterName: string, financialYear: string, fromDate: string, toDate: string) => {
    setSelectedQuarter(quarterName);
    setSelectedFinancialYear(financialYear);
    setSelectedFromDate(fromDate);
    setSelectedToDate(toDate);
  };

  const [currentOfficer, setCurrentOfficer] = useState<Officer | null>(() => {
    if (currentUser && currentUser.role === 'officer') {
      const match = officers.find((o) => o.staffNo === currentUser.staffNo);
      if (match) return match;
    }
    if (initialStaffNo) {
      const found = officers.find((o) => o.staffNo === initialStaffNo);
      if (found) return found;
    }
    return officers[0] || null;
  });

  // State for printable full-screen report view
  const [viewingPrintableReport, setViewingPrintableReport] = useState<QuarterlyReport | null>(null);

  // Quick Add Officer Modal state
  const [showAddOfficerModal, setShowAddOfficerModal] = useState(false);
  const [newStaffNo, setNewStaffNo] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesignation, setNewDesignation] = useState('Manager');
  const [newOffice, setNewOffice] = useState(REGIONAL_OFFICES[0]?.name || '');
  const [newCircleCode, setNewCircleCode] = useState('7690');

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('cb_rajbhasha_officers_v2', JSON.stringify(officers));
  }, [officers]);

  useEffect(() => {
    localStorage.setItem('cb_rajbhasha_reports_clean_v1', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    initGoogleAuth();
    const unsub = subscribeToGoogleAuth((user, token) => {
      setIsGoogleConnectedState(!!user && !!token);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    localStorage.setItem('cb_rajbhasha_transfers_v2', JSON.stringify(transferHistory));
  }, [transferHistory]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cb_rajbhasha_auth_user_v2', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cb_rajbhasha_auth_user_v2');
    }
  }, [currentUser]);

  // Handle Login & Logout
  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setActiveRole(user.role);

    if (user.role === 'officer') {
      const off = officers.find((o) => o.staffNo === user.staffNo);
      if (off) setCurrentOfficer(off);
    } else if (user.role === 'co') {
      setSelectedCircleCode(user.circleOfficeCode);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Execute Officer Transfer from HO
  const handleExecuteTransfer = (record: TransferRecord) => {
    // 1. Update Officer master record
    setOfficers((prev) =>
      prev.map((off) => {
        if (off.staffNo === record.staffNo) {
          return {
            ...off,
            primaryOfficeName: record.toOffice,
            circleOfficeCode: record.toCircleCode,
            circleOfficeName: record.toCircleName,
            concurrentOffices: record.toConcurrentOffices,
          };
        }
        return off;
      })
    );

    // 2. Append to transfer history
    setTransferHistory((prev) => [record, ...prev]);

    // 3. If currently logged in as this officer, update session
    if (currentUser && currentUser.staffNo === record.staffNo) {
      const updatedUser: AuthUser = {
        ...currentUser,
        officeName: record.toOffice,
        circleOfficeCode: record.toCircleCode,
        circleOfficeName: record.toCircleName,
        concurrentOffices: record.toConcurrentOffices,
      };
      setCurrentUser(updatedUser);
      if (currentOfficer) {
        setCurrentOfficer({
          ...currentOfficer,
          primaryOfficeName: record.toOffice,
          circleOfficeCode: record.toCircleCode,
          circleOfficeName: record.toCircleName,
          concurrentOffices: record.toConcurrentOffices,
        });
      }
    }
  };

  // Handlers
  const handleSaveReport = (updatedReport: QuarterlyReport) => {
    setReports((prev) => {
      const idx = prev.findIndex((r) => r.id === updatedReport.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedReport;
        return copy;
      }
      return [...prev, updatedReport];
    });
  };

  const handleUpdateReportStatus = (
    reportId: string,
    status: QuarterlyReport['status'],
    feedback?: string
  ) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === reportId) {
          return {
            ...r,
            status,
            coFeedback: feedback || r.coFeedback,
            approvedByCOAt: status.includes('स्वीकृत') ? new Date().toISOString() : r.approvedByCOAt,
            updatedAt: new Date().toISOString(),
          };
        }
        return r;
      })
    );
  };

  const handleAddOfficer = (newOfficer: Officer) => {
    setOfficers((prev) => [newOfficer, ...prev]);
    setCurrentOfficer(newOfficer);
    setShowAddOfficerModal(false);
  };

  const handleUpdateOfficer = (updated: Officer) => {
    setOfficers((prev) => prev.map((o) => (o.staffNo === updated.staffNo ? updated : o)));
    if (currentOfficer?.staffNo === updated.staffNo) {
      setCurrentOfficer(updated);
    }
  };

  const handleDeleteOfficer = (staffNo: string) => {
    if (window.confirm('क्या आप निश्चित हैं कि इस अधिकारी को हटाना चाहते हैं?')) {
      setOfficers((prev) => prev.filter((o) => o.staffNo !== staffNo));
      if (currentOfficer?.staffNo === staffNo) {
        setCurrentOfficer(officers[0] || null);
      }
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('क्या आप सभी डेटा को प्रारंभिक डिफ़ॉल्ट पर रीसेट करना चाहते हैं?')) {
      setOfficers(INITIAL_OFFICERS);
      setReports(INITIAL_REPORTS);
      setCurrentOfficer(INITIAL_OFFICERS[0]);
      localStorage.removeItem('cb_rajbhasha_officers_v2');
      localStorage.removeItem('cb_rajbhasha_reports_v2');
      localStorage.removeItem('cb_rajbhasha_transfers_v2');
    }
  };

  // Full backup JSON export
  const handleBackupExport = () => {
    const data = {
      exportDate: new Date().toISOString(),
      officers,
      reports,
      transferHistory,
      version: '2.6',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Canara_Bank_Rajbhasha_Data_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Backup restore
  const handleBackupImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.officers && Array.isArray(parsed.officers)) {
          setOfficers(parsed.officers);
        }
        if (parsed.reports && Array.isArray(parsed.reports)) {
          setReports(parsed.reports);
        }
        if (parsed.transferHistory && Array.isArray(parsed.transferHistory)) {
          setTransferHistory(parsed.transferHistory);
        }
        alert('डेटा सफलतापूर्वक पुनर्स्थापित (Restore) कर दिया गया है!');
      } catch (err) {
        alert('फाइल पढ़ने में त्रुटि। कृपया मान्य JSON बैकअप फाइल चुनें।');
      }
    };
    reader.readAsText(file);
  };

  const handleCreateNewOfficerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffNo || !newName) return;
    const matchedCircle = circleOffices.find((c) => c.code === newCircleCode);

    const created: Officer = {
      id: `off-${newStaffNo}`,
      staffNo: newStaffNo,
      name: newName.toUpperCase(),
      designation: newDesignation,
      primaryOfficeType: newOffice.includes('CIRCLE') ? 'CO' : 'RO',
      primaryOfficeName: newOffice,
      circleOfficeCode: newCircleCode,
      circleOfficeName: matchedCircle ? matchedCircle.name : `${newCircleCode} C.O.`,
      concurrentOffices: [],
      subordinateCount: 40,
    };
    handleAddOfficer(created);
    setNewStaffNo('');
    setNewName('');
  };

  // If user is not logged in, render the secure Login Screen!
  if (!currentUser) {
    return (
      <LoginScreen
        officers={officers}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // If currently viewing full-screen printable official report
  if (viewingPrintableReport) {
    return (
      <PrintableReport
        report={viewingPrintableReport}
        onBack={() => setViewingPrintableReport(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        selectedQuarter={selectedQuarter}
        setSelectedQuarter={setSelectedQuarter}
        selectedOfficer={currentOfficer}
        selectedCircleCode={selectedCircleCode}
        onBackupExport={handleBackupExport}
        onBackupImport={handleBackupImport}
        onSelectPeriod={handleSelectPeriod}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenGoogleSheets={() => setShowGoogleSheetsModal(true)}
        isGoogleConnected={isGoogleConnectedState}
      />

      {/* Main Role-Specific View */}
      <main className="grow">
        {/* Role 1: OL Officer View */}
        {activeRole === 'officer' && (
          <OfficerPortal
            officers={officers}
            allOffices={allOffices}
            reports={reports}
            selectedQuarter={selectedQuarter}
            selectedFinancialYear={selectedFinancialYear}
            selectedFromDate={selectedFromDate}
            selectedToDate={selectedToDate}
            onOpenDateModal={() => {
              const dateBtn = document.querySelector('button[title*="विशिष्ट वर्ष"]') as HTMLButtonElement;
              if (dateBtn) dateBtn.click();
            }}
            currentOfficer={currentOfficer}
            onSelectOfficer={(off) => setCurrentOfficer(off)}
            onSaveReport={handleSaveReport}
            onViewPrintable={(rep) => setViewingPrintableReport(rep)}
            onAddNewOfficerModal={() => setShowAddOfficerModal(true)}
            currentUser={currentUser}
          />
        )}

        {/* Role 2: Circle Office View */}
        {activeRole === 'co' && (
          <CircleOfficePortal
            selectedCircleCode={selectedCircleCode}
            onSelectCircleCode={(code) => setSelectedCircleCode(code)}
            circleOffices={circleOffices}
            officers={officers}
            reports={reports}
            selectedQuarter={selectedQuarter}
            onUpdateReportStatus={handleUpdateReportStatus}
            onViewPrintable={(rep) => setViewingPrintableReport(rep)}
            currentUser={currentUser}
          />
        )}

        {/* Role 3: Head Office View */}
        {activeRole === 'ho' && (
          <HeadOfficePortal
            circleOffices={circleOffices}
            allOffices={allOffices}
            officers={officers}
            reports={reports}
            selectedQuarter={selectedQuarter}
            onViewPrintable={(rep) => setViewingPrintableReport(rep)}
            onSelectCircleFromHO={(circleCode) => {
              setSelectedCircleCode(circleCode);
              setActiveRole('co');
            }}
            transferHistory={transferHistory}
            onExecuteTransfer={handleExecuteTransfer}
          />
        )}

        {/* Role 4: Admin / Master Settings */}
        {activeRole === 'admin' && (
          <MasterManagement
            officers={officers}
            onAddOfficer={handleAddOfficer}
            onUpdateOfficer={handleUpdateOfficer}
            onDeleteOfficer={handleDeleteOfficer}
            allOffices={allOffices}
            circleOffices={circleOffices}
            onResetToDefaults={handleResetToDefaults}
            onBackupExport={handleBackupExport}
            onBackupImport={handleBackupImport}
          />
        )}
      </main>

      {/* Quick Add Officer Modal */}
      {showAddOfficerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">
                नया राजभाषा अधिकारी प्रोफ़ाइल जोड़ें
              </h3>
              <button
                onClick={() => setShowAddOfficerModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateNewOfficerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">कर्मचारी संख्या (Staff No):</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. 902800"
                  value={newStaffNo}
                  onChange={(e) => setNewStaffNo(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">अधिकारी का नाम (Name):</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. ANIL SHARMA"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">पदनाम (Designation):</label>
                <select
                  value={newDesignation}
                  onChange={(e) => setNewDesignation(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded text-xs"
                >
                  <option value="Senior Manager">Senior Manager</option>
                  <option value="Manager">Manager</option>
                  <option value="Officer">Officer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">अंचल कार्यालय (Circle Office):</label>
                <select
                  value={newCircleCode}
                  onChange={(e) => setNewCircleCode(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded text-xs"
                >
                  {circleOffices.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">मूल पदस्थापन कार्यालय:</label>
                <select
                  value={newOffice}
                  onChange={(e) => setNewOffice(e.target.value)}
                  className="w-full p-2 bg-slate-50 border rounded text-xs"
                >
                  {allOffices.map((o) => (
                    <option key={o.name} value={o.name}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddOfficerModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold shadow-sm"
                >
                  सहेजें व शुरू करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Sheets Integration Modal */}
      <GoogleSheetsModal
        isOpen={showGoogleSheetsModal}
        onClose={() => setShowGoogleSheetsModal(false)}
        activeRole={activeRole}
        currentQuarter={selectedQuarter}
        currentReport={reports.find(r => r.officerStaffNo === currentOfficer?.staffNo && r.quarter === selectedQuarter) || null}
        currentOfficer={currentOfficer}
        circleReports={reports.filter(r => r.circleOfficeCode === selectedCircleCode && r.quarter === selectedQuarter)}
        circleName={circleOffices.find(c => c.code === selectedCircleCode)?.name}
        circleCode={selectedCircleCode}
        allReports={reports.filter(r => r.quarter === selectedQuarter)}
        allOfficers={officers}
      />

      {/* Global Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 px-6 border-t border-slate-800 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © केनरा बैंक - राजभाषा अनुभाग, प्रधान कार्यालय, बेंगलूरु | Canara Bank Official Language Section
          </span>
          <span className="text-[11px] text-slate-500">
            राजभाषा तिमाही रिपोर्ट संकलन, समेकन, अनुवाद व शाखा भ्रमण ट्रैकिंग प्रणाली
          </span>
        </div>
      </footer>
    </div>
  );
}
