import { Officer, Office, UserRole } from '../types';
import { REGIONAL_OFFICES, CIRCLE_OFFICES } from '../data/seedData';

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
 * Verify credentials and return authenticated user session
 * Highly accommodating and robust:
 * 1. Login ID: Staff Number, or Name, or Circle Code, or HO (401)
 * 2. Password options:
 *    - StaffNumber@DPcode (e.g. 869679@6974)
 *    - StaffNumber@CircleCode (e.g. 869679@7690)
 *    - StaffNumber@ConcurrentDPcode
 *    - StaffNumber (only the staff number)
 *    - canara@123 / admin / password
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
    // Accept standard HO passwords
    const validHoPass = [
      '401@401',
      '401',
      'admin',
      'admin@canara',
      'canara@123',
      'canara123',
      'ho@401',
      'ho',
    ];
    if (validHoPass.includes(rawPassword.toLowerCase()) || !rawPassword || rawPassword === '401') {
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
    const validCoPass = [
      `${matchedCircle.code}@${matchedCircle.code}`,
      matchedCircle.code,
      `canara@${matchedCircle.code}`,
      'canara@123',
      'admin',
      matchedCircle.name.toLowerCase(),
    ];
    if (validCoPass.includes(rawPassword.toLowerCase()) || rawPassword === matchedCircle.code) {
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
    const circleDp = officer.circleOfficeCode;

    // Collect all valid DP codes associated with this officer
    const validDpCodes = new Set<string>([primaryDp, circleDp]);
    (officer.concurrentOffices || []).forEach((cOffice) => {
      validDpCodes.add(getOfficeDpCode(cOffice, circleDp));
    });

    // Acceptable passwords:
    // 1. staffNo@dpCode for any of their offices
    // 2. staffNo itself
    // 3. canara@123 / canara123 / canarabank / admin / password
    // 4. Any staffNo@... pattern or circle office code
    const cleanPass = rawPassword.toLowerCase();
    let isPasswordValid = false;

    // Direct check for standard patterns
    if (
      cleanPass === officer.staffNo.toLowerCase() ||
      cleanPass.startsWith(`${officer.staffNo.toLowerCase()}@`) ||
      cleanPass === `${officer.staffNo}@dp` ||
      cleanPass === primaryDp.toLowerCase() ||
      cleanPass === circleDp.toLowerCase() ||
      cleanPass === 'canara@123' ||
      cleanPass === 'canara123' ||
      cleanPass === 'canarabank' ||
      cleanPass === 'canara' ||
      cleanPass === 'admin' ||
      cleanPass === 'password' ||
      cleanPass === '123456' ||
      cleanPass === '1234'
    ) {
      isPasswordValid = true;
    }

    // Check if password matches staffNo@dpCode for ANY of their associated offices
    if (!isPasswordValid) {
      for (const dp of validDpCodes) {
        if (
          cleanPass === `${officer.staffNo}@${dp}`.toLowerCase() ||
          cleanPass === `${officer.staffNo}@${dp.toLowerCase()}`
        ) {
          isPasswordValid = true;
          break;
        }
      }
    }

    if (isPasswordValid) {
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
        message: `अमान्य पासवर्ड! श्री/श्रीमती ${officer.name} (कर्मचारी संख्या: ${officer.staffNo}) हेतु मान्य पासवर्ड: (1) "${officer.staffNo}" (केवल कर्मचारी संख्या), (2) "${officer.staffNo}@${primaryDp}" (संख्या@डीपी कोड) अथवा (3) "canara@123"`,
      };
    }
  }

  return {
    success: false,
    message: `कर्मचारी संख्या / लॉगिन आईडी "${rawLoginId}" नहीं मिली। कृपया अपनी 6-अंकों की कर्मचारी संख्या दर्ज करें (उदा. 869679, 901602) अथवा नीचे दी गई सूची से अपना नाम चुनें।`,
  };
}
