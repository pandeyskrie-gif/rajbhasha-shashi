import * as XLSX from 'xlsx';
import { QuarterlyReport, Officer } from '../types';

/**
 * Export a single Officer's Quarterly Report to Excel
 */
export function exportSingleReportToExcel(report: QuarterlyReport) {
  const wb = XLSX.utils.book_new();

  // 1. Overview Sheet
  const overviewData = [
    ['केनरा बैंक - राजभाषा तिमाही रिपोर्ट (Canara Bank Official Language Quarterly Report)'],
    ['तिमाही (Quarter)', report.quarter],
    ['वित्तीय वर्ष (Financial Year)', report.financialYear],
    ['अंचल / क्षेत्रीय कार्यालय (Circle / Regional Office)', report.primaryOfficeName],
    ['अंचल कार्यालय (Circle Office)', report.circleOfficeName],
    ['राजभाषा अधिकारी (OL Officer)', `${report.officerName} (${report.officerStaffNo}) - ${report.officerDesignation}`],
    ['समवर्ती प्रभार कार्यालय (Concurrent Offices)', report.concurrentOffices.join(', ') || 'कोई नहीं'],
    ['अधीनस्थ कार्यालयों / शाखाओं की संख्या', report.subordinateOfficesCount],
    ['स्थिति (Status)', report.status],
    ['राजभाषा अधिकारी हस्ताक्षरकर्ता', report.officerSignatureName],
    ['कार्यालय प्रमुख हस्ताक्षरकर्ता', report.officeHeadSignatureName],
    ['अंतिम अद्यतन (Last Updated)', new Date(report.updatedAt).toLocaleString('hi-IN')],
    [],
    ['--- अनुवाद कार्य का विवरण (Translation Work Tracking) ---'],
    ['प्रधान कार्यालय से प्राप्त अनुवाद पृष्ठ', report.translation?.pagesReceivedFromHO || 0],
    ['प्राप्ति की तिथि (Date of Receipt)', report.translation?.receivedDate || '-'],
    ['कार्यालय द्वारा अनूदित पृष्ठ (Pages Translated in Hindi)', report.translation?.pagesTranslatedInHindi || 0],
    ['प्रेषण की तारीख (Date of Dispatch)', report.translation?.sentDate || '-'],
    ['लंबित पृष्ठ (Pending Pages)', report.translation?.pendingPages || 0],
    ['टिप्पणी (Remarks)', report.translation?.remarks || '-'],
  ];

  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, wsOverview, 'सामान्य विवरण एवं अनुवाद');

  // 1.5 शाखा निरीक्षण / भ्रमण विवरण (Branch Visits for Primary & Concurrent ROs)
  const branchVisitsData = [
    ['केनरा बैंक - शाखा निरीक्षण / राजभाषा भ्रमण विवरण (मूल एवं समवर्ती प्रभार शाखाएं)'],
    ['क्र. सं.', 'क्षेत्रीय कार्यालय (मूल/समवर्ती)', 'विज़िट की गई शाखा का नाम / डीपी कोड', 'विज़िट / निरीक्षण तिथि', 'समीक्षा पत्र प्रेषण तिथि', 'मुख्य निष्कर्ष / अनुपालन'],
    ...(report.branchVisits || []).map((bv, i) => [
      i + 1,
      bv.regionalOfficeName,
      bv.branchCodeOrName,
      bv.visitDate,
      bv.reviewLetterDate,
      bv.keyObservations || '-',
    ]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(branchVisitsData), 'शाखा निरीक्षण व भ्रमण');

  // 2. राजभाषा कार्यान्वयन समिति (OLIC Meetings)
  const olicData = [
    ['क्र. सं.', 'कार्यालय का नाम', 'बैठक आयोजन की तिथि', 'रिपोर्ट प्राप्ति की तिथि', 'समीक्षा की तिथि'],
    ...report.olicMeetings.map((r, i) => [i + 1, r.officeName, r.meetingDate, r.reportReceivedDate, r.reviewDate]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(olicData), 'रा.का.स. बैठक');

  // 3. हिंदी कार्यशाला (Hindi Workshop)
  const wsData = [
    ['क्र. सं.', 'कार्यालय का नाम', 'कार्यशाला की तारीख', 'उपस्थित प्रतिभागियों की संख्या', 'विषय/विवरण'],
    ...report.workshops.map((r, i) => [i + 1, r.officeName, r.workshopDate, r.participantsCount, r.topic || '-']),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(wsData), 'हिंदी कार्यशाला');

  // 4. क्षेत्रीय कार्यान्वयन कार्यालय रिपोर्ट
  const regReportData = [
    ['क्र. सं.', 'कार्यालय का नाम', 'ऑनलाइन प्रस्तुति दिनांक', 'रिपोर्ट नियंत्रण कार्यालय को प्रेषण की तारीख'],
    ...report.regionalReports.map((r, i) => [i + 1, r.officeName, r.onlineSubmissionDate, r.controllingOfficeSentDate]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(regReportData), 'क्षेत्रीय रिपोर्ट प्रेषण');

  // 5. STR-18 समीक्षा एवं प्रस्तुति
  const str18Data = [
    ['[1] क्षेत्राधीन सभी शाखाओं/क्षेत्रीय कार्यालयों की एस टी आर -18 की समीक्षा'],
    ['क्र. सं.', 'कार्यालय का नाम', 'समीक्षा दिनांक', 'संबंधित शाखा को समीक्षा पत्र का प्रेषण'],
    ...report.str18Reviews.map((r, i) => [i + 1, r.officeName, r.reviewDate, r.letterSentDate]),
    [],
    ['[2] नियंत्रण कार्यालय को हस्ताक्षरित एस टी आर -18 की प्रस्तुति'],
    ['क्र. सं.', 'कार्यालय का नाम', 'प्रस्तुति दिनांक'],
    ...report.str18Submissions.map((r, i) => [i + 1, r.officeName, r.submissionDate]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(str18Data), 'STR-18 समीक्षा');

  // 6. हिंदी परिचर्चा, संगोष्ठी, प्रतिनिधि बैठक
  const eventsData = [
    ['[1] हिंदी परिचर्चा (तिमाही)'],
    ['क्र. सं.', 'कार्यालय का नाम', 'आयोजन की तारीख', 'रिपोर्ट प्रेषण की तारीख', 'केननेट में रिपोर्ट अपलोड की तारीख'],
    ...report.paricharchas.map((r, i) => [i + 1, r.officeName, r.eventDate, r.reportSentDate, r.cannetUploadDate]),
    [],
    ['[2] हिंदी संगोष्ठी (वार्षिक)'],
    ['क्र. सं.', 'कार्यालय का नाम', 'आयोजन की तारीख', 'रिपोर्ट प्रेषण की तारीख', 'केननेट में रिपोर्ट अपलोड की तारीख'],
    ...report.seminars.map((r, i) => [i + 1, r.officeName, r.eventDate, r.reportSentDate, r.cannetUploadDate]),
    [],
    ['[3] राजभाषा प्रतिनिधि बैठक (वार्षिक)'],
    ['क्र. सं.', 'कार्यालय का नाम', 'आयोजन की तारीख', 'रिपोर्ट प्रेषण की तारीख', 'केननेट में रिपोर्ट अपलोड की तारीख'],
    ...report.representativeMeetings.map((r, i) => [i + 1, r.officeName, r.eventDate, r.reportSentDate, r.cannetUploadDate]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(eventsData), 'परिचर्चा व संगोष्ठी');

  // 7. पत्रिका एवं केनराज्योति/श्रेयस
  const magData = [
    ['[1] हिंदी में जारी पत्रिका/ई-पत्रिका/बुलेटिन (छमाही)'],
    ['क्र. सं.', 'कार्यालय का नाम', 'पत्रिका का नाम', 'कुल पृष्ठों की संख्या', 'विमोचन की तारीख', 'प्र.का. को प्रेषित करने की तारीख'],
    ...report.magazines.map((r, i) => [i + 1, r.officeName, r.magazineName, r.totalPages, r.releaseDate, r.hoSentDate]),
    [],
    ['[2] केनराज्योति व श्रेयस पत्रिकाओं के लिए प्रविष्टियां (तिमाही)'],
    ['क्र. सं.', 'कार्यालय का नाम', 'कर्मचारियों से प्राप्त प्रविष्टियां प्रेषित करने की तारीख', 'अंचल व क्षे.का. की गतिविधियों की रिपोर्ट प्रेषित करने की तारीख'],
    ...report.houseJournals.map((r, i) => [i + 1, r.officeName, r.staffEntriesSentDate, r.activityReportSentDate]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(magData), 'पत्रिकाएं व प्रकाशन');

  // 8. नराकास (TOLIC)
  const tolicData = [
    ['[1] नगर राजभाषा कार्यान्वयन समिति (जहाँ बैंक सदस्य है)'],
    ['क्र. सं.', 'कार्यालय का नाम', 'अधिकार क्षेत्र की नराकास का नाम', 'छमाही रिपोर्ट प्रस्तुत करने की तारीख', 'नराकास बैठक आयोजन की तिथि', 'उपस्थित कार्यालय प्रमुख का नाम व पदनाम'],
    ...report.tolicMembers.map((r, i) => [i + 1, r.officeName, r.tolicName, r.halfYearlyReportDate, r.meetingDate, r.headAttendedName]),
    [],
    ['[2] नगर राजभाषा कार्यान्वयन समिति (जहाँ बैंक संयोजक है)'],
    ['क्र. सं.', 'कार्यालय का नाम', 'नराकास का नाम', 'राजभाषा विभाग द्वारा बैठक आयोजन का निर्धारित कैलेंडर माह', 'बैठक आयोजन की तिथि', 'बैठक में उपस्थित कार्यालय प्रमुख का नाम व पदनाम', 'सदस्य कार्यालयों की कुल संख्या', 'बैठक में उपस्थित कार्यालयों की कुल संख्या'],
    ...report.tolicConveners.map((r, i) => [i + 1, r.officeName, r.tolicName, r.targetCalendarMonth, r.meetingDate, r.headAttendedName, r.totalMemberOffices, r.attendedMemberOffices]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(tolicData), 'नराकास (TOLIC)');

  // 9. नवोन्मेषी कार्य, पुरस्कार व कस्टम कॉलम
  const extraData = [
    ['[1] अंचल व क्षेत्रीय कार्यालयों द्वारा तिमाही के दौरान किए गए नवोन्मेषी कार्य'],
    ...report.innovativeWorks.map((w, i) => [`${i + 1}.`, w]),
    [],
    ['[2] अंचल व क्षेत्रीय कार्यालयों को प्राप्त विशेष पुरस्कार'],
    ...report.specialAwards.map((a, i) => [`${i + 1}.`, a]),
    [],
    ['[3] अतिरिक्त जोड़े गए कॉलम एवं विवरण'],
    ['क्र. सं.', 'कॉलम शीर्षक (Field Title)', 'मान / प्रविष्टि (Value)', 'टिप्पणी (Remarks)'],
    ...report.customFields.map((c, i) => [i + 1, c.title, c.value, c.remarks || '-']),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(extraData), 'नवोन्मेषी व अतिरिक्त विवरण');

  const fileName = `Rajbhasha_Report_${report.officerStaffNo}_${report.quarter.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Export Circle Office Consolidated Reports to Excel
 */
/**
 * Export Circle Office Consolidated Reports to Excel
 */
export function exportCircleConsolidatedToExcel(circleName: string, reports: QuarterlyReport[], officers: Officer[]) {
  const wb = XLSX.utils.book_new();

  // 1. All-in-One Official Comprehensive Summary Sheet
  const summaryHeader = [
    ['केनरा बैंक - अंचल कार्यालय समेकित राजभाषा तिमाही रिपोर्ट (Canara Bank CO Consolidated Report)'],
    ['अंचल कार्यालय (Circle Office)', circleName],
    ['दिनांक (Date of Generation)', new Date().toLocaleDateString('hi-IN')],
    ['संबद्ध अधिकारियों की कुल संख्या', officers.length],
    ['प्राप्त रिपोर्टों की संख्या', reports.length],
    [],
    [
      'क्र.सं.',
      'कर्मचारी संख्या',
      'राजभाषा अधिकारी का नाम',
      'पदनाम',
      'प्राथमिक कार्यालय',
      'समवर्ती प्रभार कार्यालय',
      'शाखाओं की संख्या',
      'रिपोर्ट स्थिति',
      'कुल शाखा विज़िट',
      'HO से प्राप्त अनुवाद पृष्ठ',
      'अनुवाद प्राप्ति तिथि',
      'अनूदित पृष्ठ',
      'अनुवाद प्रेषण तिथि',
      'लंबित अनुवाद पृष्ठ',
      'हिंदी में जारी पत्रिका/ई पत्रिका/बुलेटिन(छमाही) - पत्रिका का नाम',
      'हिंदी पत्रिका - कुल पृष्ठ',
      'हिंदी पत्रिका - विमोचन तिथि',
      'हिंदी पत्रिका - प्र.का. को प्रेषित करने की तारीख',
      'केनराज्योति व श्रेयस पत्रिकाओं के लिए प्रविष्टियां(तिमाही) - प्रविष्टियां प्रेषण तिथि',
      'केनराज्योति व श्रेयस - अंचल/क्षे.का. गतिविधियों की रिपोर्ट प्रेषण तिथि',
      'नगर राजभाषा कार्यान्वयन समिति(जहां बैंक सदस्य है) - नराकास का नाम',
      'नराकास (सदस्य) - छमाही रिपोर्ट प्रस्तुत करने की तारीख',
      'नराकास (सदस्य) - बैठक आयोजन की तिथि',
      'नराकास (सदस्य) - उपस्थित कार्यालय प्रमुख का नाम व पदनाम',
      'नगर राजभाषा कार्यान्वयन समिति(जहां बैंक संयोजक है) - नराकास का नाम',
      'नराकास (संयोजक) - निर्धारित कैलेंडर माह',
      'नराकास (संयोजक) - बैठक आयोजन की तिथि',
      'नराकास (संयोजक) - उपस्थित कार्यालय प्रमुख का नाम व पदनाम',
      'नराकास (संयोजक) - सदस्य कार्यालय (उपस्थित / कुल)',
      'अंचल व क्षेत्रीय कार्यालयों द्वारा तिमाही के दौरान किए गए नवोन्मेषी कार्य :',
      'अंचल व क्षेत्रीय कार्यालयों को प्राप्त विशेष पुरस्कार :',
      'रा.का.स. बैठकें',
      'हिंदी कार्यशालाएं',
      'कार्यशाला प्रतिभागी',
      'STR-18 समीक्षा',
    ],
  ];

  const summaryRows = reports.map((r, idx) => [
    idx + 1,
    r.officerStaffNo,
    r.officerName,
    r.officerDesignation,
    r.primaryOfficeName,
    r.concurrentOffices.join('; ') || 'कोई नहीं',
    r.subordinateOfficesCount,
    r.status,
    r.branchVisits?.length || 0,
    r.translation?.pagesReceivedFromHO || 0,
    r.translation?.receivedDate || '-',
    r.translation?.pagesTranslatedInHindi || 0,
    r.translation?.sentDate || '-',
    r.translation?.pendingPages || 0,
    r.magazines.map((m) => m.magazineName).filter(Boolean).join('; ') || 'निरंक',
    r.magazines.map((m) => m.totalPages).join('; ') || '-',
    r.magazines.map((m) => m.releaseDate).filter(Boolean).join('; ') || '-',
    r.magazines.map((m) => m.hoSentDate).filter(Boolean).join('; ') || '-',
    r.houseJournals.map((h) => h.staffEntriesSentDate).filter(Boolean).join('; ') || '-',
    r.houseJournals.map((h) => h.activityReportSentDate).filter(Boolean).join('; ') || '-',
    r.tolicMembers.map((t) => t.tolicName).filter(Boolean).join('; ') || 'सदस्य नहीं',
    r.tolicMembers.map((t) => t.halfYearlyReportDate).filter(Boolean).join('; ') || '-',
    r.tolicMembers.map((t) => t.meetingDate).filter(Boolean).join('; ') || '-',
    r.tolicMembers.map((t) => t.headAttendedName).filter(Boolean).join('; ') || '-',
    r.tolicConveners.map((t) => t.tolicName).filter(Boolean).join('; ') || 'संयोजक नहीं',
    r.tolicConveners.map((t) => t.targetCalendarMonth).filter(Boolean).join('; ') || '-',
    r.tolicConveners.map((t) => t.meetingDate).filter(Boolean).join('; ') || '-',
    r.tolicConveners.map((t) => t.headAttendedName).filter(Boolean).join('; ') || '-',
    r.tolicConveners.map((t) => `${t.attendedMemberOffices || 0}/${t.totalMemberOffices || 0}`).join('; ') || '-',
    r.innovativeWorks.join(' | ') || 'कोई नहीं',
    r.specialAwards.join(' | ') || 'कोई नहीं',
    r.olicMeetings.length,
    r.workshops.length,
    r.workshops.reduce((sum, w) => sum + (Number(w.participantsCount) || 0), 0),
    r.str18Reviews.length,
  ]);

  const wsSummary = XLSX.utils.aoa_to_sheet([...summaryHeader, ...summaryRows]);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'अंचल समेकन सारांश (15 तालिकाएं)');

  // 2. Sheet: हिंदी पत्रिकाएं व केनराज्योति (तालिका 10 व 11)
  const pubSheetData: (string | number)[][] = [
    ['अंचल कार्यालय - हिंदी में जारी पत्रिका/ई-पत्रिका/बुलेटिन(छमाही) एवं केनराज्योति/श्रेयस प्रविष्टियां(तिमाही) समेकन'],
    [],
    ['[1] हिंदी में जारी पत्रिका/ई-पत्रिका/बुलेटिन (छमाही) - तालिका 10'],
    ['क्र.सं.', 'अधिकारी का नाम', 'कार्यालय का नाम', 'पत्रिका का नाम', 'कुल पृष्ठों की संख्या', 'विमोचन की तारीख', 'प्र.का. को प्रेषित करने की तारीख'],
  ];
  reports.forEach((r, rIdx) => {
    r.magazines.forEach((m, mIdx) => {
      pubSheetData.push([
        pubSheetData.length - 3,
        r.officerName,
        m.officeName || r.primaryOfficeName,
        m.magazineName,
        m.totalPages,
        m.releaseDate,
        m.hoSentDate,
      ]);
    });
  });

  pubSheetData.push([]);
  pubSheetData.push(['[2] केनराज्योति व श्रेयस पत्रिकाओं के लिए प्रविष्टियां (तिमाही) - तालिका 11']);
  pubSheetData.push(['क्र.सं.', 'अधिकारी का नाम', 'कार्यालय का नाम', 'कर्मचारियों से प्राप्त प्रविष्टियां प्रेषित करने की तारीख', 'अंचल व क्षे.का. की गतिविधियों की रिपोर्ट प्रेषित करने की तारीख']);
  reports.forEach((r) => {
    r.houseJournals.forEach((h, hIdx) => {
      pubSheetData.push([
        hIdx + 1,
        r.officerName,
        h.officeName || r.primaryOfficeName,
        h.staffEntriesSentDate,
        h.activityReportSentDate,
      ]);
    });
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(pubSheetData), 'पत्रिकाएं व प्रकाशन समेकन');

  // 3. Sheet: नगर राजभाषा कार्यान्वयन समिति (नराकास - तालिका 12 व 13)
  const tolicSheetData: (string | number)[][] = [
    ['अंचल कार्यालय - नगर राजभाषा कार्यान्वयन समिति (नराकास) समेकन'],
    [],
    ['[1] नगर राजभाषा कार्यान्वयन समिति (जहाँ बैंक सदस्य है) - तालिका 12'],
    ['क्र.सं.', 'अधिकारी का नाम', 'कार्यालय का नाम', 'अधिकार क्षेत्र की नराकास का नाम', 'छमाही रिपोर्ट प्रस्तुत करने की तारीख', 'नराकास बैठक आयोजन की तिथि', 'उपस्थित कार्यालय प्रमुख का नाम व पदनाम'],
  ];
  reports.forEach((r) => {
    r.tolicMembers.forEach((tm, idx) => {
      tolicSheetData.push([
        idx + 1,
        r.officerName,
        tm.officeName || r.primaryOfficeName,
        tm.tolicName,
        tm.halfYearlyReportDate,
        tm.meetingDate,
        tm.headAttendedName,
      ]);
    });
  });

  tolicSheetData.push([]);
  tolicSheetData.push(['[2] नगर राजभाषा कार्यान्वयन समिति (जहाँ बैंक संयोजक है) - तालिका 13']);
  tolicSheetData.push(['क्र.सं.', 'अधिकारी का नाम', 'कार्यालय का नाम', 'नराकास का नाम', 'राजभाषा विभाग द्वारा बैठक आयोजन का निर्धारित कैलेंडर माह', 'बैठक आयोजन की तिथि', 'बैठक में उपस्थित कार्यालय प्रमुख का नाम व पदनाम', 'सदस्य कार्यालयों की कुल संख्या', 'बैठक में उपस्थित कार्यालयों की कुल संख्या']);
  reports.forEach((r) => {
    r.tolicConveners.forEach((tc, idx) => {
      tolicSheetData.push([
        idx + 1,
        r.officerName,
        tc.officeName || r.primaryOfficeName,
        tc.tolicName,
        tc.targetCalendarMonth,
        tc.meetingDate,
        tc.headAttendedName,
        tc.totalMemberOffices,
        tc.attendedMemberOffices,
      ]);
    });
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(tolicSheetData), 'नराकास सदस्य व संयोजक');

  // 4. Sheet: नवोन्मेषी कार्य व प्राप्त विशेष पुरस्कार (भाग 14 व 15)
  const awardSheetData: (string | number)[][] = [
    ['अंचल कार्यालय - अंचल व क्षेत्रीय कार्यालयों के नवोन्मेषी कार्य एवं विशेष पुरस्कार समेकन'],
    [],
    ['[1] अंचल व क्षेत्रीय कार्यालयों द्वारा तिमाही के दौरान किए गए नवोन्मेषी कार्य - भाग 14'],
    ['क्र.सं.', 'अधिकारी का नाम', 'कार्यालय का नाम', 'नवोन्मेषी कार्य / अभिनव पहल का विवरण'],
  ];
  let innovCount = 1;
  reports.forEach((r) => {
    r.innovativeWorks.forEach((work) => {
      awardSheetData.push([innovCount++, r.officerName, r.primaryOfficeName, work]);
    });
  });

  awardSheetData.push([]);
  awardSheetData.push(['[2] अंचल व क्षेत्रीय कार्यालयों को प्राप्त विशेष पुरस्कार - भाग 15']);
  awardSheetData.push(['क्र.सं.', 'अधिकारी का नाम', 'कार्यालय का नाम', 'प्राप्त विशेष पुरस्कार / सम्मान का विवरण']);
  let awardCount = 1;
  reports.forEach((r) => {
    r.specialAwards.forEach((award) => {
      awardSheetData.push([awardCount++, r.officerName, r.primaryOfficeName, award]);
    });
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(awardSheetData), 'नवोन्मेषी कार्य व पुरस्कार');

  // 5. Translation Sheet
  const transHeader = [
    ['अंचल कार्यालय - अनुवाद कार्य समेकन विवरण'],
    ['क्र.सं.', 'कर्मचारी संख्या', 'राजभाषा अधिकारी', 'कार्यालय', 'HO से प्राप्त पृष्ठ', 'प्राप्ति दिनांक', 'अनूदित पृष्ठ', 'प्रेषण दिनांक', 'लंबित पृष्ठ', 'टिप्पणी'],
  ];
  const transRows = reports.map((r, idx) => [
    idx + 1,
    r.officerStaffNo,
    r.officerName,
    r.primaryOfficeName,
    r.translation?.pagesReceivedFromHO || 0,
    r.translation?.receivedDate || '-',
    r.translation?.pagesTranslatedInHindi || 0,
    r.translation?.sentDate || '-',
    r.translation?.pendingPages || 0,
    r.translation?.remarks || '-',
  ]);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([...transHeader, ...transRows]), 'अनुवाद कार्य समेकन');

  const fileName = `CO_Consolidated_${circleName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Export All-India Head Office Master Compliance to Excel
 */
export function exportHeadOfficeMasterToExcel(reports: QuarterlyReport[], officers: Officer[]) {
  const wb = XLSX.utils.book_new();

  // 1. All-India Master Sheet with all 15 parts
  const masterHeader = [
    ['केनरा बैंक - प्रधान कार्यालय (राजभाषा अनुभाग) अखिल भारतीय समेकित रिपोर्ट'],
    ['कुल पंजीकृत अधिकारी (Total Officers)', officers.length],
    ['कुल प्रस्तुत रिपोर्ट (Total Reports)', reports.length],
    ['उत्पत्ति तिथि (Export Date)', new Date().toLocaleDateString('hi-IN')],
    [],
    [
      'क्र.सं.',
      'अंचल कार्यालय',
      'अंचल कोड',
      'कर्मचारी संख्या',
      'राजभाषा अधिकारी का नाम',
      'पदनाम',
      'प्राथमिक कार्यालय',
      'समवर्ती कार्यालय (Concurrent)',
      'शाखाएं',
      'स्थिति',
      'शाखा विज़िट संख्या',
      'प्राप्त अनुवाद पृष्ठ',
      'अनूदित पृष्ठ',
      'लंबित अनुवाद पृष्ठ',
      'हिंदी में जारी पत्रिका/ई पत्रिका/बुलेटिन(छमाही) - पत्रिका नाम',
      'हिंदी पत्रिका कुल पृष्ठ',
      'हिंदी पत्रिका विमोचन तिथि',
      'हिंदी पत्रिका प्र.का. प्रेषण तिथि',
      'केनराज्योति व श्रेयस प्रविष्टियां प्रेषण तिथि',
      'केनराज्योति व श्रेयस गतिविधि रिपोर्ट प्रेषण तिथि',
      'नराकास (सदस्य) नाम',
      'नराकास (सदस्य) छमाही रिपोर्ट तिथि',
      'नराकास (सदस्य) बैठक तिथि',
      'नराकास (सदस्य) उपस्थित प्रमुख',
      'नराकास (संयोजक) नाम',
      'नराकास (संयोजक) कैलेंडर माह',
      'नराकास (संयोजक) बैठक तिथि',
      'नराकास (संयोजक) सदस्य (उपस्थित / कुल)',
      'अंचल व क्षेत्रीय कार्यालयों द्वारा तिमाही के दौरान किए गए नवोन्मेषी कार्य :',
      'अंचल व क्षेत्रीय कार्यालयों को प्राप्त विशेष पुरस्कार :',
      'रा.का.स. बैठकें',
      'कार्यशालाएं',
      'कार्यशाला प्रतिभागी',
      'STR-18 समीक्षा',
    ],
  ];

  const masterRows = reports.map((r, i) => [
    i + 1,
    r.circleOfficeName,
    r.circleOfficeCode,
    r.officerStaffNo,
    r.officerName,
    r.officerDesignation,
    r.primaryOfficeName,
    r.concurrentOffices.join('; ') || 'कोई नहीं',
    r.subordinateOfficesCount,
    r.status,
    r.branchVisits?.length || 0,
    r.translation?.pagesReceivedFromHO || 0,
    r.translation?.pagesTranslatedInHindi || 0,
    r.translation?.pendingPages || 0,
    r.magazines.map((m) => m.magazineName).filter(Boolean).join('; ') || 'निरंक',
    r.magazines.map((m) => m.totalPages).join('; ') || '-',
    r.magazines.map((m) => m.releaseDate).filter(Boolean).join('; ') || '-',
    r.magazines.map((m) => m.hoSentDate).filter(Boolean).join('; ') || '-',
    r.houseJournals.map((h) => h.staffEntriesSentDate).filter(Boolean).join('; ') || '-',
    r.houseJournals.map((h) => h.activityReportSentDate).filter(Boolean).join('; ') || '-',
    r.tolicMembers.map((t) => t.tolicName).filter(Boolean).join('; ') || 'सदस्य नहीं',
    r.tolicMembers.map((t) => t.halfYearlyReportDate).filter(Boolean).join('; ') || '-',
    r.tolicMembers.map((t) => t.meetingDate).filter(Boolean).join('; ') || '-',
    r.tolicMembers.map((t) => t.headAttendedName).filter(Boolean).join('; ') || '-',
    r.tolicConveners.map((t) => t.tolicName).filter(Boolean).join('; ') || 'संयोजक नहीं',
    r.tolicConveners.map((t) => t.targetCalendarMonth).filter(Boolean).join('; ') || '-',
    r.tolicConveners.map((t) => t.meetingDate).filter(Boolean).join('; ') || '-',
    r.tolicConveners.map((t) => `${t.attendedMemberOffices || 0}/${t.totalMemberOffices || 0}`).join('; ') || '-',
    r.innovativeWorks.join(' | ') || 'कोई नहीं',
    r.specialAwards.join(' | ') || 'कोई नहीं',
    r.olicMeetings.length,
    r.workshops.length,
    r.workshops.reduce((sum, w) => sum + (Number(w.participantsCount) || 0), 0),
    r.str18Reviews.length,
  ]);

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([...masterHeader, ...masterRows]), 'अखिल भारतीय मास्टर समेकन');

  // 2. All-India Publications and TOLIC Sheet
  const hoPubData: (string | number)[][] = [
    ['अखिल भारतीय पत्रिकाएं, केनराज्योति, नराकास व नवोन्मेषी कार्य समेकन'],
    ['क्र.सं.', 'अंचल कार्यालय', 'कार्यालय का नाम', 'अधिकारी का नाम', 'पत्रिका नाम व पृष्ठ', 'केनराज्योति प्रेषण तिथि', 'नराकास (सदस्य)', 'नराकास (संयोजक)', 'नवोन्मेषी कार्य', 'विशेष पुरस्कार'],
    ...reports.map((r, i) => [
      i + 1,
      r.circleOfficeName,
      r.primaryOfficeName,
      r.officerName,
      r.magazines.map((m) => `${m.magazineName} (${m.totalPages} पृष्ठ)`).join('; ') || 'निरंक',
      r.houseJournals.map((h) => h.staffEntriesSentDate).filter(Boolean).join('; ') || '-',
      r.tolicMembers.map((t) => t.tolicName).join('; ') || 'सदस्य नहीं',
      r.tolicConveners.map((t) => `${t.tolicName} (${t.targetCalendarMonth})`).join('; ') || 'संयोजक नहीं',
      r.innovativeWorks.join('; ') || 'कोई नहीं',
      r.specialAwards.join('; ') || 'कोई नहीं',
    ]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(hoPubData), 'अखिल भारतीय प्रकाशन व नराकास');

  // 3. Translation Detailed Tracker
  const transMaster = [
    ['अखिल भारतीय अनुवाद कार्य मॉनिटरिंग'],
    [
      'क्र.सं.',
      'अंचल कार्यालय',
      'कार्यालय का नाम',
      'अधिकारी का नाम',
      'HO से प्राप्त पृष्ठ',
      'प्राप्ति तिथि',
      'अनूदित पृष्ठ',
      'प्रेषण तिथि',
      'अनुवाद अनुपालन दर (%)',
      'टिप्पणी',
    ],
    ...reports.map((r, i) => {
      const rec = Number(r.translation?.pagesReceivedFromHO) || 0;
      const done = Number(r.translation?.pagesTranslatedInHindi) || 0;
      const rate = rec > 0 ? Math.min(100, Math.round((done / rec) * 100)) : 100;
      return [
        i + 1,
        r.circleOfficeName,
        r.primaryOfficeName,
        r.officerName,
        rec,
        r.translation?.receivedDate || '-',
        done,
        r.translation?.sentDate || '-',
        `${rate}%`,
        r.translation?.remarks || '-',
      ];
    }),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(transMaster), 'अखिल भारतीय अनुवाद ट्रैकर');

  XLSX.writeFile(wb, `Canara_Bank_HO_Master_Rajbhasha_Consolidated_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
