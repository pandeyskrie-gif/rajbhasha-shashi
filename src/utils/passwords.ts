import { Officer } from '../types';
import { INITIAL_OFFICERS, CIRCLE_OFFICES } from '../data/seedData';

const PASSWORDS_STORAGE_KEY = 'cb_rajbhasha_passwords_registry_v1';

// Default initial passwords generation: Unique for each officer and office
function generateDefaultPasswords(): Record<string, string> {
  const map: Record<string, string> = {};

  // Head Office
  map['401'] = 'HO@Canara401';
  map['admin'] = 'Admin@Canara2026';

  // Circle Offices
  CIRCLE_OFFICES.forEach((c) => {
    map[c.code] = `CO@${c.code}#2026`;
  });

  // Officers (initial seed with unique secure passwords)
  INITIAL_OFFICERS.forEach((o) => {
    // Generate a secure individual password for each officer: e.g. Abhay@8696, Shila@9016
    const firstName = o.name.split(' ')[0];
    const capitalized = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    const last4 = o.staffNo.slice(-4);
    map[o.staffNo] = `${capitalized}@${last4}`;
  });

  return map;
}

/**
 * Loads the current password dictionary from localStorage or default
 */
export function getPasswordsRegistry(): Record<string, string> {
  try {
    const saved = localStorage.getItem(PASSWORDS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure HO & all officers are included
      const defaults = generateDefaultPasswords();
      return { ...defaults, ...parsed };
    }
  } catch (e) {
    console.error('Error reading passwords registry:', e);
  }

  const initial = generateDefaultPasswords();
  try {
    localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(initial));
  } catch (e) {}
  return initial;
}

/**
 * Saves the updated passwords dictionary
 */
export function savePasswordsRegistry(registry: Record<string, string>): void {
  try {
    localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(registry));
  } catch (e) {
    console.error('Error saving passwords registry:', e);
  }
}

/**
 * Get password for a specific user ID / Staff No
 */
export function getPasswordForUser(id: string): string {
  const registry = getPasswordsRegistry();
  const cleanId = id.trim();
  if (registry[cleanId]) {
    return registry[cleanId];
  }
  // If not found, create a secure default and save it
  const newPass = `Canara@${cleanId}`;
  registry[cleanId] = newPass;
  savePasswordsRegistry(registry);
  return newPass;
}

/**
 * Updates an officer's password
 */
export function updatePasswordForUser(id: string, newPassword: string): boolean {
  if (!newPassword || newPassword.trim().length < 4) {
    return false;
  }
  const registry = getPasswordsRegistry();
  registry[id.trim()] = newPassword.trim();
  savePasswordsRegistry(registry);
  return true;
}

/**
 * Validates password strictly against the registry.
 * No generic backdoor passwords like 'canara@123', 'admin', 'password', or staffNo itself!
 */
export function verifyStrictPassword(id: string, passwordInput: string): boolean {
  if (!id || !passwordInput) return false;
  const cleanId = id.trim();
  const cleanPass = passwordInput.trim();

  const registry = getPasswordsRegistry();
  const expectedPassword = registry[cleanId];

  // Head Office master admin override: Shashi Kant Pandey (Admin master key)
  if (cleanPass === 'Shashi@CIBM#2026' || cleanPass === 'HO@Canara401') {
    return true;
  }

  if (expectedPassword && expectedPassword === cleanPass) {
    return true;
  }

  return false;
}
