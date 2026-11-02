import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  setDoc, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { QuarterlyReport, Officer, TransferRecord } from '../types';

const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying firestoreDatabaseId
export const db = getFirestore(
  app,
  (firebaseConfig as any).firestoreDatabaseId || '(default)'
);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notification:', JSON.stringify(errInfo));
}

// Initial connection test as required by skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('✓ Firestore Real-time Cloud Database connected successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or connecting: please check Firebase network status.');
    }
    return false;
  }
}

// Start connection test on load
testConnection();

/**
 * Real-time subscription to Quarterly Reports
 */
export function subscribeToReports(onReportsUpdate: (reports: QuarterlyReport[]) => void): () => void {
  const reportsCol = collection(db, 'reports');
  const unsubscribe = onSnapshot(
    reportsCol,
    (snapshot) => {
      const list: QuarterlyReport[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as QuarterlyReport);
      });
      if (list.length > 0) {
        onReportsUpdate(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'reports');
    }
  );
  return unsubscribe;
}

/**
 * Save / Update a single report in Firestore in real-time
 */
export async function syncReportToFirestore(report: QuarterlyReport): Promise<void> {
  const cleanId = (report.id || `rep_${report.officerStaffNo}_${Date.now()}`).trim();
  const path = `reports/${cleanId}`;
  try {
    await setDoc(doc(db, 'reports', cleanId), report, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Real-time subscription to Officer Transfers
 */
export function subscribeToTransfers(onTransfersUpdate: (transfers: TransferRecord[]) => void): () => void {
  const transfersCol = collection(db, 'transfers');
  return onSnapshot(
    transfersCol,
    (snapshot) => {
      const list: TransferRecord[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as TransferRecord);
      });
      if (list.length > 0) {
        onTransfersUpdate(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'transfers');
    }
  );
}

/**
 * Save transfer record to Firestore
 */
export async function syncTransferToFirestore(record: TransferRecord): Promise<void> {
  const path = `transfers/${record.id}`;
  try {
    await setDoc(doc(db, 'transfers', record.id), record, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Real-time subscription to Central Passwords Registry
 */
export function subscribeToPasswords(onPasswordsUpdate: (registry: Record<string, string>) => void): () => void {
  const col = collection(db, 'passwords');
  return onSnapshot(
    col,
    (snapshot) => {
      const registry: Record<string, string> = {};
      snapshot.forEach((d) => {
        const data = d.data();
        if (data && data.password) {
          registry[d.id] = data.password;
        }
      });
      if (Object.keys(registry).length > 0) {
        onPasswordsUpdate(registry);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'passwords');
    }
  );
}

/**
 * Save password to Firestore
 */
export async function syncPasswordToFirestore(id: string, pass: string): Promise<void> {
  const cleanId = id.trim();
  const path = `passwords/${cleanId}`;
  try {
    await setDoc(
      doc(db, 'passwords', cleanId),
      { id: cleanId, password: pass.trim(), updatedAt: new Date().toISOString() },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Real-time subscription to Officers Master list
 */
export function subscribeToOfficers(onOfficersUpdate: (officers: Officer[]) => void): () => void {
  const col = collection(db, 'officers');
  return onSnapshot(
    col,
    (snapshot) => {
      const list: Officer[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as Officer);
      });
      if (list.length > 0) {
        onOfficersUpdate(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'officers');
    }
  );
}

/**
 * Save Officer to Firestore
 */
export async function syncOfficerToFirestore(officer: Officer): Promise<void> {
  const path = `officers/${officer.staffNo}`;
  try {
    await setDoc(doc(db, 'officers', officer.staffNo), officer, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
