export type OfficeType = 'RO' | 'CO' | 'HO';

export interface Office {
  dpCode?: string;
  name: string;
  type: OfficeType;
  circleOfficeCode?: string;
  circleOfficeName?: string;
}

export interface Officer {
  id: string;
  staffNo: string;
  name: string;
  designation: 'Senior Manager' | 'Manager' | 'Officer' | string;
  primaryOfficeType: OfficeType;
  primaryOfficeName: string;
  circleOfficeCode: string;
  circleOfficeName: string;
  concurrentOffices: string[]; // List of additional Regional Offices under charge
  subordinateCount: number; // Number of subordinate offices / branches
  phone?: string;
  email?: string;
}

export interface TransferRecord {
  id: string;
  staffNo: string;
  officerName: string;
  fromOffice: string;
  fromCircleCode: string;
  fromCircleName: string;
  toOffice: string;
  toCircleCode: string;
  toCircleName: string;
  toConcurrentOffices: string[];
  orderNo: string;
  transferDate: string;
  effectiveDate: string;
  remarks?: string;
}

// Table row types matching Canara Bank Rajbhasha Timahi Report (PDF 1)

export interface OlicMeetingRow {
  id: string;
  officeName: string;
  meetingDate: string; // बैठक आयोजन की तिथि
  reportReceivedDate: string; // रिपोर्ट प्राप्ति की तिथि
  reviewDate: string; // समीक्षा की तिथि
}

export interface WorkshopRow {
  id: string;
  officeName: string;
  workshopDate: string; // कार्यशाला की तारीख
  participantsCount: number; // उपस्थित प्रतिभागियों की संख्या
  topic?: string;
}

export interface RegionalOfficeReportRow {
  id: string;
  officeName: string;
  onlineSubmissionDate: string; // ऑनलाइन प्रस्तुति दिनांक
  controllingOfficeSentDate: string; // रिपोर्ट नियंत्रण कार्यालय को प्रेषण की तारीख
}

export interface Str18ReviewRow {
  id: string;
  officeName: string;
  reviewDate: string; // समीक्षा दिनांक
  letterSentDate: string; // संबंधित शाखा को समीक्षा पत्र का प्रेषण
}

export interface Str18SubmissionRow {
  id: string;
  officeName: string;
  submissionDate: string; // प्रस्तुति दिनांक
}

export interface ParicharchaRow {
  id: string;
  officeName: string;
  eventDate: string; // आयोजन की तारीख
  reportSentDate: string; // रिपोर्ट प्रेषण की तारीख
  cannetUploadDate: string; // केननेट में रिपोर्ट अपलोड करने की तारीख
}

export interface SeminarRow {
  id: string;
  officeName: string;
  eventDate: string; // आयोजन की तारीख
  reportSentDate: string; // रिपोर्ट प्रेषण की तारीख
  cannetUploadDate: string; // केननेट में रिपोर्ट अपलोड करने की तारीख
}

export interface RepresentativeMeetingRow {
  id: string;
  officeName: string;
  eventDate: string; // आयोजन की तारीख
  reportSentDate: string; // रिपोर्ट प्रेषण की तारीख
  cannetUploadDate: string; // केननेट में रिपोर्ट अपलोड करने की तारीख
}

export interface MagazineRow {
  id: string;
  officeName: string;
  magazineName: string; // पत्रिका/ई पत्रिका/बुलेटिन का नाम
  totalPages: number; // कुल पृष्ठों की संख्या
  releaseDate: string; // विमोचन की तारीख
  hoSentDate: string; // प्र.का. को प्रेषित करने की तारीख
}

export interface HouseJournalRow {
  id: string;
  officeName: string;
  staffEntriesSentDate: string; // कर्मचारियों से प्राप्त प्रविष्टियां प्रेषित करने की तारीख
  activityReportSentDate: string; // अंचल व क्षे.का. की गतिविधियों की रिपोर्ट प्रेषित करने की तारीख
}

export interface TolicMemberRow {
  id: string;
  officeName: string;
  tolicName: string; // अधिकार क्षेत्र की नराकास का नाम
  halfYearlyReportDate: string; // छमाही रिपोर्ट प्रस्तुत करने की तारीख
  meetingDate: string; // नराकास बैठक आयोजन की तिथि
  headAttendedName: string; // बैठक में उपस्थित कार्यालय प्रमुख का नाम व पदनाम
}

export interface TolicConvenerRow {
  id: string;
  officeName: string;
  tolicName: string; // नराकास का नाम
  targetCalendarMonth: string; // राजभाषा विभाग द्वारा बैठक आयोजन का निर्धारित कैलेंडर माह
  meetingDate: string; // बैठक आयोजन की तिथि
  headAttendedName: string; // बैठक में उपस्थित कार्यालय प्रमुख का नाम व पदनाम
  totalMemberOffices: number; // सदस्य कार्यालयों की कुल संख्या
  attendedMemberOffices: number; // बैठक में उपस्थित कार्यालयों की कुल संख्या
}

// User-requested translation tracking fields
export interface TranslationTracking {
  pagesReceivedFromHO: number; // प्रधान कार्यालय से प्राप्त अनुवाद पृष्ठ
  receivedDate: string; // प्राप्ति की तिथि
  pagesTranslatedInHindi: number; // संबंधित कार्यालय द्वारा हिंदी में अनूदित पृष्ठ
  sentDate: string; // प्रेषण की तारीख
  pendingPages: number; // शेष पृष्ठ
  remarks?: string;
}

// User-requested branch visit tracking:
// अपने RO और concurrent RO की कितनी और कौन-कौन सी शाखाएं विज़िट कीं, विज़िट की तारीख, समीक्षा पत्र भेजने की तारीख
export interface BranchVisitRow {
  id: string;
  regionalOfficeName: string; // संबंधित क्षेत्रीय कार्यालय (मूल या समवर्ती)
  branchCodeOrName: string; // विज़िट की गई शाखा का नाम / डीपी कोड
  visitDate: string; // विज़िट / निरीक्षण की तारीख
  reviewLetterDate: string; // समीक्षा पत्र प्रेषण की तारीख
  keyObservations?: string; // मुख्य बिंदु / कमियां व अनुपालन
}

// User-requested dynamic / custom columns
export interface CustomColumnValue {
  id: string;
  title: string;
  value: string;
  remarks?: string;
}

export type UserRole = 'officer' | 'co' | 'ho' | 'admin';

export type ReportStatus = 'ड्राफ्ट (Draft)' | 'अंचल को प्रस्तुत (Submitted to CO)' | 'अंचल द्वारा स्वीकृत (Approved by CO)' | 'प्रधान कार्यालय को प्रेषित (Forwarded to HO)';

export interface QuarterlyReport {
  id: string;
  quarter: string; // e.g. "जुलाई - सितंबर 2026"
  financialYear: string; // e.g. "2026-2027"
  fromDate?: string; // e.g. "2026-07-01"
  toDate?: string; // e.g. "2026-09-30"
  officerStaffNo: string;
  officerName: string;
  officerDesignation: string;
  circleOfficeCode: string;
  circleOfficeName: string;
  primaryOfficeName: string;
  concurrentOffices: string[];
  subordinateOfficesCount: number;

  // Translation Work (Requested by user)
  translation: TranslationTracking;

  // Branch Visits (Requested by user)
  branchVisits: BranchVisitRow[];

  // The 12 tables of the standard report
  olicMeetings: OlicMeetingRow[];
  workshops: WorkshopRow[];
  regionalReports: RegionalOfficeReportRow[];
  str18Reviews: Str18ReviewRow[];
  str18Submissions: Str18SubmissionRow[];
  paricharchas: ParicharchaRow[];
  seminars: SeminarRow[];
  representativeMeetings: RepresentativeMeetingRow[];
  magazines: MagazineRow[];
  houseJournals: HouseJournalRow[];
  tolicMembers: TolicMemberRow[];
  tolicConveners: TolicConvenerRow[];

  // Qualitative sections
  innovativeWorks: string[]; // नवोन्मेषी कार्य
  specialAwards: string[]; // प्राप्त विशेष पुरस्कार

  // User-requested custom dynamic fields/columns
  customFields: CustomColumnValue[];

  // Signatures & Workflow Status
  officerSignatureName: string;
  officeHeadSignatureName: string;
  status: ReportStatus;
  updatedAt: string;
  submittedToCOAt?: string;
  approvedByCOAt?: string;
  coFeedback?: string;
}
