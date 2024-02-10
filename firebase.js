// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Remove the import statement for analytics if you don't plan to use it

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAk0JZwAcevqw2j5LDrm2eGRlC8sFLIvMM",
  authDomain: "xtentioncrew.firebaseapp.com",
  projectId: "xtentioncrew",
  storageBucket: "xtentioncrew.appspot.com",
  messagingSenderId: "704478180924",
  appId: "1:704478180924:web:4549712b721fed23777539",
  measurementId: "G-WXM82D530D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Remove the line initializing analytics if you don't plan to use it
// const analytics = getAnalytics(app);

export default db;
