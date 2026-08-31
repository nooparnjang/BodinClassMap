import { db } from "./firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  getDocs
} from "firebase/firestore";

// Extract student ID from email (e.g., "45057@bodin.ac.th" -> "45057")
const getStudentIdFromEmail = (email: string): string => {
  return email.split("@")[0];
};

// Reserve a seat for a user in a classroom
export const reserveSeat = async (
  email: string,
  classroomId: string,
  tableNumber: number
) => {
  const studentId = getStudentIdFromEmail(email);
  console.log("Firestore - Attempting to reserve:", { email, studentId, classroomId, tableNumber });

  // Reference to the student's seat in the classroom
  // Structure: ROOM_614 -> studentId -> { table: number }
  const studentRef = doc(db, classroomId, studentId);
  console.log("Firestore - Document reference path:", `${classroomId}/${studentId}`);

  try {
    await setDoc(
      studentRef,
      {
        table: tableNumber,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
    
    console.log("Firestore - Reservation successful");
    return {
      success: true,
      message: `Table ${tableNumber} reserved successfully`,
      studentId
    };
  } catch (error) {
    console.error("Firestore - Error during reservation:", error);
    throw error;
  }
};

// Get user's current seat reservation in a classroom
export const getUserReservation = async (
  email: string,
  classroomId: string
) => {
  const studentId = getStudentIdFromEmail(email);
  console.log("Firestore - Getting reservation for:", { email, studentId, classroomId });
  
  const studentRef = doc(db, classroomId, studentId);
  const studentSnap = await getDoc(studentRef);

  if (studentSnap.exists()) {
    const data = studentSnap.data();
    console.log("Firestore - Found reservation:", data);
    return {
      studentId,
      table: data.table,
      ...data
    };
  }
  console.log("Firestore - No reservation found");
  return null;
};

// Cancel/clear reservation (set table to 0)
export const cancelReservation = async (
  email: string,
  classroomId: string
) => {
  const studentId = getStudentIdFromEmail(email);
  console.log("Firestore - Cancelling reservation for:", { email, studentId, classroomId });
  
  const studentRef = doc(db, classroomId, studentId);

  try {
    await updateDoc(studentRef, {
      table: 0,
      updatedAt: serverTimestamp()
    });

    console.log("Firestore - Reservation cancelled successfully");
    return { success: true, message: "Reservation cancelled" };
  } catch (error) {
    console.error("Firestore - Error cancelling reservation:", error);
    throw error;
  }
};

// Get all reservations in a classroom
export const getClassroomReservations = async (
  classroomId: string
) => {
  console.log("Firestore - Getting all reservations for classroom:", classroomId);
  
  // Get all documents in the classroom to check tables
  const allReservations: Record<string, number> = {};
  
  // Fetch all student documents in this classroom
  const classroomRef = collection(db, classroomId);
  const allDocs = await getDocs(classroomRef);
  
  console.log("Firestore - Total documents found:", allDocs.size);
  
  allDocs.forEach((docSnap) => {
    if (docSnap.id !== "_metadata" && docSnap.data().table > 0) {
      allReservations[docSnap.id] = docSnap.data().table;
      console.log(`Firestore - Student ${docSnap.id} has table ${docSnap.data().table}`);
    }
  });

  console.log("Firestore - Total active reservations:", Object.keys(allReservations).length);
  return allReservations;
};

