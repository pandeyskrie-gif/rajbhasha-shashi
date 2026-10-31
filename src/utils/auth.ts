import { Officer, Office, UserRole } from '../types';
import { REGIONAL_OFFICES, CIRCLE_OFFICES } from '../data/seedData';
import { verifyStrictPassword } from './passwords';

export interface AuthUser {
  role: UserRole;
  staffNo: string;
  name: string;
  designation: string;
  officeName: string;
  dpCode: string;
  circleOfficeCode: string;
  circleOfficeName: string;
  concurrentOffices: string[];
}

/**
 * Normalizes office names for robust DP code lookup
 */
function normalizeName(name: string): string {
  return (name || '')
    .toUpperCase()
    .replace(/REGIONAL\s+OFFICE/g, '')
    .replace(/CIRCLE\s+OFFICE/g, '')
    .replace(/C\.O\./g, '')
    .replace(/R\.O\./g, '')
    .replace(/HEAD\s+OFFICE/g, '')
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * Find office DP code from name with multi-stage fuzzy fallback
 */
export function getOfficeDpCode(officeName: string, fallbackCircleCode?: string): string {
  if (!officeName) return fallbackCircleCode || '6974';

  const cleanInput = normalizeName(officeName);

  // 1. Direct match with Regional Offices
  const ro = REGIONAL_OFFICES.find(
    (o) => normalizeName(o.name) === cleanInput || o.name.toLowerCase().trim() === officeName.toLowerCase().trim()
  );
  if (ro && ro.dpCode) return ro.dpCode;

  // 2. Partial match with Regional Offices
  const roPartial = REGIONAL_OFFICES.find(
    (o) => normalizeName(o.name).includes(cleanInput) || cleanInput.includes(normalizeName(o.name))
  );
  if (roPartial && roPartial.dpCode) return roPartial.dpCode;

  // 3. Circle Office match
  const co = CIRCLE_OFFICES.find(
    (c) => normalizeName(c.name) === cleanInput || c.code === fallbackCircleCode || c.name.toLowerCase().includes(officeName.toLowerCase().trim())
  );
  if (co) return co.code;

  if (fallbackCircleCode) return fallbackCircleCode;
  return '6974'; // Default fallback
}

/**
 * Verify credentials with STRICT private password check.
 * Passwords are individualized and controlled centrally or set by the officer.
 * Insecure generic fallbacks (like staffNo, canara@123) are disabled.
 */
export function verifyCredentials(
  loginIdInput: string,
  passwordInput: string,
  officersList: Officer[]
): { success: boolean; user?: AuthUser; message?: string } {
  const rawLoginId = (loginIdInput || '').trim();
  const rawPassword = (passwordInput || '').trim();

  if (!rawLoginId) {
    return { success: false, message: 'कृपया अपनी कर्मचारी संख्या (Staff No) या लॉगिन आईडी दर्ज करें।' };
  }

  if (!rawPassword) {
    return { success: false, message: 'कृपया अपना पासवर्ड दर्ज करें।' };
  }

  const cleanLoginId = rawLoginId.toLowerCase();
  const cleanNumericId = rawLoginId.replace(/\D/g, '');

  // ==========================================
  // 1. HEAD OFFICE (HO) LOGIN (401 or ho or head office)
  // ==========================================
  if (
    cleanNumericId === '401' ||
    cleanLoginId === 'ho' ||
    cleanLoginId === 'headoffice' ||
    cleanLoginId.includes('head office') ||
    cleanLoginId === 'admin'
  ) {
    const isHoValid = verifyStrictPassword('401', rawPassword) || verifyStrictPassword('admin', rawPassword);
    if (isHoValid) {
      return {
        success: true,
        user: {
          role: 'ho',
          staffNo: '401',
          name: 'राजभाषा अनुभाग - प्रधान कार्यालय',
          designation: 'महाप्रबंधक / प्रभारी प्रमुख',
          officeName: '401 HEAD OFFICE BENGALURU',
          dpCode: '401',
          circleOfficeCode: '401',
          circleOfficeName: '401 HEAD OFFICE BENGALURU',
          concurrentOffices: [],
        },
      };
    } else {
      return {
        success: false,
        message: 'प्रधान कार्यालय पासवर्ड अमान्य है! कृपया सही पासवर्ड दर्ज करें।',
      };
    }
  }

  // ==========================================
  // 2. CIRCLE OFFICE (CO) LOGIN (e.g. 7690, 7400, 7575 or circle name)
  // ==========================================
  const matchedCircle = CIRCLE_OFFICES.find(
    (c) =>
      c.code === rawLoginId ||
      c.code === cleanNumericId ||
      c.name.toLowerCase().includes(cleanLoginId) ||
      cleanLoginId.includes(c.code)
  );

  if (matchedCircle) {
    const isCoValid = verifyStrictPassword(matchedCircle.code, rawPassword);
    if (isCoValid) {
      return {
        success: true,
        user: {
          role: 'co',
          staffNo: matchedCircle.code,
          name: `${matchedCircle.name} (अंचल राजभाषा डेस्क)`,
          designation: 'अंचल राजभाषा प्रभारी',
          officeName: matchedCircle.name,
          dpCode: matchedCircle.code,
          circleOfficeCode: matchedCircle.code,
          circleOfficeName: matchedCircle.name,
          concurrentOffices: [],
        },
      };
    } else {
      return {
        success: false,
        message: `अंचल कार्यालय ${matchedCircle.name} का पासवर्ड अमान्य है! कृपया प्रधान कार्यालय द्वारा दिया गया पासवर्ड दर्ज करें।`,
      };
    }
  }

  // ==========================================
  // 3. OFFICER LOGIN (by Staff Number or Officer Name)
  // ==========================================
  let officer = officersList.find(
    (o) =>
      o.staffNo === rawLoginId ||
      (cleanNumericId && o.staffNo === cleanNumericId) ||
      (cleanNumericId.length >= 5 && (o.staffNo.includes(cleanNumericId) || cleanNumericId.includes(o.staffNo)))
  );

  // If not found by staff number, check if loginId matches officer name or partial name
  if (!officer && cleanLoginId.length >= 2) {
    officer = officersList.find(
      (o) =>
        o.name.toLowerCase().includes(cleanLoginId) ||
        cleanLoginId.includes(o.name.toLowerCase()) ||
        cleanLoginId.split(' ').some((part) => part.length >= 3 && o.name.toLowerCase().includes(part))
    );
  }

  if (officer) {
    const primaryDp = getOfficeDpCode(officer.primaryOfficeName, officer.circleOfficeCode);
    const isOfficerValid = verifyStrictPassword(officer.staffNo, rawPassword);

    if (isOfficerValid) {
      const isHO = officer.circleOfficeCode === '401' || officer.primaryOfficeType === 'HO';
      const isCO = officer.primaryOfficeType === 'CO';

      return {
        success: true,
        user: {
          role: isHO ? 'ho' : isCO ? 'co' : 'officer',
          staffNo: officer.staffNo,
          name: officer.name,
          designation: officer.designation,
          officeName: officer.primaryOfficeName,
          dpCode: primaryDp,
          circleOfficeCode: officer.circleOfficeCode,
          circleOfficeName: officer.circleOfficeName,
          concurrentOffices: officer.concurrentOffices,
        },
      };
    } else {
      return {
        success: false,
        message: `अमान्य पासवर्ड! श्री/श्रीमती ${officer.name} (कर्मचारी सं.: ${officer.staffNo}) का पासवर्ड सही नहीं है। कृपया प्रधान कार्यालय (HO / CIBM मणिपाल) से अपना व्यक्तिगत पासवर्ड प्राप्त करें।`,
      };
    }
  }

  return {
    success: false,
    message: `कर्मचारी संख्या / लॉगिन आईडी "${rawLoginId}" नहीं मिली। कृपया अपनी मान्य कर्मचारी संख्या दर्ज करें अथवा सूची से अपना नाम चुनें।`,
  };
}
