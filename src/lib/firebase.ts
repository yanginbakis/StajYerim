import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  type DocumentData
} from "firebase/firestore";

// Firebase Applet Configuration (copied from firebase-applet-config.json for client use)
const firebaseConfig = {
  apiKey: "AIzaSyBT1bJL4iyYFqJK4FIxOGmgliCZXgoH31I",
  authDomain: "gen-lang-client-0637727909.firebaseapp.com",
  projectId: "gen-lang-client-0637727909",
  storageBucket: "gen-lang-client-0637727909.firebasestorage.app",
  messagingSenderId: "171265962137",
  appId: "1:171265962137:web:8528af57fdbb56b0fd4808",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID if applicable or default
const db = getFirestore(app, "ai-studio-f771f36f-2147-4300-a103-f6b2eb4c4161");

export { 
  db, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  type DocumentData 
};
