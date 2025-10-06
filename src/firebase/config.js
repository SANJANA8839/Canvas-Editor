// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCTNt69Dlg94YWjC_VmfEMG3nYbId5JwYE",
  authDomain: "canvas-editor-5c5ef.firebaseapp.com",
  projectId: "canvas-editor-5c5ef",
  storageBucket: "canvas-editor-5c5ef.firebasestorage.app",
  messagingSenderId: "619888740159",
  appId: "1:619888740159:web:672f86998f661c9734b58a",
  measurementId: "G-K2EY8JXT9T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
export const db = getFirestore(app);