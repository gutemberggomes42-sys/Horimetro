import { db } from '../firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { ReportData } from '../types';
import { initialData } from '../initialData';

const COLLECTION_NAME = 'reports';

export const reportService = {
  // Subscribe to real-time updates for a specific report
  subscribeToReport: (reportId: string, onUpdate: (data: ReportData) => void) => {
    const docRef = doc(db, COLLECTION_NAME, reportId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as ReportData);
      } else {
        // If document doesn't exist, create it with initial data
        setDoc(docRef, initialData);
        onUpdate(initialData);
      }
    }, (error) => {
      console.error("Error subscribing to report:", error);
    });

    return unsubscribe;
  },

  // Update the entire report data
  updateReport: async (reportId: string, data: ReportData) => {
    const docRef = doc(db, COLLECTION_NAME, reportId);
    try {
      await updateDoc(docRef, data as any);
    } catch (error) {
      console.error("Error updating report:", error);
      throw error;
    }
  },

  // Reset report to initial state
  resetReport: async (reportId: string) => {
    const docRef = doc(db, COLLECTION_NAME, reportId);
    try {
      await setDoc(docRef, initialData);
    } catch (error) {
      console.error("Error resetting report:", error);
      throw error;
    }
  }
};
