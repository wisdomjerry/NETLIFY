// src/firebase.js

// Firebase core
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getAnalytics, logEvent } from "firebase/analytics";

// Firebase config (your credentials)
const firebaseConfig = {
  apiKey: "AIzaSyDqYQaM1YPExDuwg7K21b69_LnXbsC4tg8",
  authDomain: "pelikulaapp.firebaseapp.com",
  projectId: "pelikulaapp",
  storageBucket: "pelikulaapp.firebasestorage.app",
  messagingSenderId: "890545131443",
  appId: "1:890545131443:web:1511a07e1b68d7bc5d85c6",
  measurementId: "G-WY9EQ25NST",
};

// Initialize Firebase App & Services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ✅ Set auth persistence (keeps users logged in after app closes)
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Error setting auth persistence:", err);
});

// 🔐 Login with Google
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    logEvent(analytics, "login", { method: "google" });
    return result.user;
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};

// 🚪 Logout
const logout = () => signOut(auth);

// 👥 Listen to auth state changes
const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

// ✅ Export all for use in your app
export { auth, analytics, signInWithGoogle, logout, onAuthChange };
