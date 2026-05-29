import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBIvSu83l4x7U5cxNQbGFU31suePbrDxKU",
  authDomain: "wcproject-86af0.firebaseapp.com",
  projectId: "wcproject-86af0",
  storageBucket: "wcproject-86af0.firebasestorage.app",
  messagingSenderId: "653840800",
  appId: "1:653840800:web:67dabeb98908b95ca0d4c5",
  measurementId: "G-H7DD9ZV6FR"
};

// Initialize Firebase (prevent re-initialization in Next.js fast refresh)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
