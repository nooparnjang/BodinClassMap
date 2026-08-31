// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC5PMZoXH_aZY1q7g4yRD-vEfY8trZEb9I",
  authDomain: "bodin-classmap.firebaseapp.com",
  projectId: "bodin-classmap",
  storageBucket: "bodin-classmap.firebasestorage.app",
  messagingSenderId: "329248942010",
  appId: "1:329248942010:web:08cc7473e243efe795df83",
  measurementId: "G-ECQSF094EN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db }