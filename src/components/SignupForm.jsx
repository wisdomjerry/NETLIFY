/* global __app_id, __initial_auth_token */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, User, Lock, Eye, EyeOff } from 'lucide-react'; // Removed 'Google' as it's an inline SVG
// Assuming SignupForm.css is now integrated into your index.css or a global CSS file
// If you still have a separate SignupForm.css, you would import it here:
// import './SignupForm.css'; 

// Firebase imports
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  signInWithCustomToken, // For Canvas environment
  signInAnonymously // Fallback for Canvas environment
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';

// YOUR SPECIFIC FIREBASE CONFIGURATION
// This configuration is now directly embedded.
const firebaseConfig = {
  apiKey: "AIzaSyDqYQaM1YPExDuwg7K21b69_LnXbsC4tg8",
  authDomain: "pelikulaapp.firebaseapp.com",
  projectId: "pelikulaapp",
  storageBucket: "pelikulaapp.firebasestorage.app",
  messagingSenderId: "890545131443",
  appId: "1:890545131443:web:1511a07e1b68d7bc5d85c6",
  measurementId: "G-WY9EQ25NST"
};

// Main App component to wrap the SignupForm for demonstration purposes
// In your actual app, you would render SignupForm directly within your routing.
export default function App() {
  return (
    <SignupForm />
  );
}

const SignupForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", // Keeping 'name' as per your original code
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null); // State for custom messages
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // To track Firebase auth readiness

  // Firebase Initialization and Auth State Listener
  useEffect(() => {
    try {
      // Use the provided firebaseConfig directly
      if (Object.keys(firebaseConfig).length === 0 || !firebaseConfig.apiKey) {
        console.error("Firebase config is missing or incomplete. Please ensure 'firebaseConfig' is correctly populated.");
        setMessage("Firebase configuration missing. Cannot authenticate.");
        return;
      }

      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestoreDb);
      setAuth(firebaseAuth);

      // Listen for authentication state changes
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          console.log("User is signed in:", user.uid);
          // Optionally fetch user profile data here if needed
        } else {
          console.log("No user is signed in.");
        }
        setIsAuthReady(true); // Firebase auth is ready
      });

      // Sign in with custom token if available (Canvas environment)
      const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
      if (initialAuthToken) {
        signInWithCustomToken(firebaseAuth, initialAuthToken)
          .then(() => console.log("Signed in with custom token"))
          .catch((error) => {
            console.error("Error signing in with custom token:", error);
            // Fallback to anonymous sign-in if custom token fails
            signInAnonymously(firebaseAuth)
              .then(() => console.log("Signed in anonymously as fallback"))
              .catch((anonError) => console.error("Anonymous sign-in failed:", anonError));
          });
      } else {
        // If no custom token, sign in anonymously
        signInAnonymously(firebaseAuth)
          .then(() => console.log("Signed in anonymously"))
          .catch((error) => console.error("Anonymous sign-in failed:", error));
      }

      return () => unsubscribe(); // Cleanup auth listener on component unmount
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);
      setMessage(`Firebase initialization failed: ${error.message}`);
    }
  }, []); // Empty dependency array means this runs once on mount

  // Function to save user profile data to Firestore
  const saveUserProfile = async (uid, userData) => {
    if (!db || !uid) {
      console.error("Firestore DB not initialized or UID missing.");
      return;
    }
    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      // Store private user data under /artifacts/{appId}/users/{userId}/profile/details
      const userDocRef = doc(db, `artifacts/${appId}/users/${uid}/profile/details`); 
      await setDoc(userDocRef, userData, { merge: true }); // Use merge to avoid overwriting other fields
      console.log("User profile saved to Firestore:", userData);
    } catch (error) {
      console.error("Error saving user profile to Firestore:", error);
      setMessage(`Failed to save user data: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth || !db) {
      setMessage("Authentication service not ready. Please wait.");
      return;
    }

    setMessage("Signing up...");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;

      // Save additional user data to Firestore
      await saveUserProfile(user.uid, {
        name: form.name, // Using 'name' as per your original form state
        username: form.username,
        email: form.email,
        joined: new Date().toISOString(),
      });

      setMessage("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Email/Password signup failed:", error);
      let errorMessage = "Failed to create account. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already in use. Please use a different email or log in.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. It must be at least 6 characters.";
      }
      setMessage(errorMessage);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth || !db) {
      setMessage("Authentication service not ready. Please wait.");
      return;
    }

    setMessage("Signing in with Google...");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile already exists in Firestore, if not, save it
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/details`);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        await saveUserProfile(user.uid, {
          name: user.displayName || '', // Use Google display name if available for 'name'
          username: user.email ? user.email.split('@')[0] : '', // Use part of email as username
          email: user.email,
          joined: new Date().toISOString(),
        });
      } else {
        console.log("User profile already exists in Firestore.");
      }

      setMessage("Successfully signed in with Google! Redirecting...");
      setTimeout(() => {
        navigate("/dashboard"); // Or wherever you want to redirect after Google login
      }, 1500);
    } catch (error) {
      console.error("Google sign-in failed:", error);
      let errorMessage = "Failed to sign in with Google. Please try again.";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Google sign-in window was closed.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "Popup blocked or request cancelled.";
      }
      setMessage(errorMessage);
    }
  };

  // Show loading state while Firebase is initializing
  if (!isAuthReady) {
    return (
      <div className="signup-container">
        <div className="message-overlay">
          <div className="message-box">
            <p className="message-text">Initializing authentication services...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      {/* Custom Message Box */}
      {message && (
        <div className="message-overlay">
          <div className="message-box">
            <p className="message-text">{message}</p>
            <button
              onClick={() => setMessage(null)}
              className="message-button"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* App Branding */}
      <div className="app-branding">
        <img
          src="/pelikula.jfif" // Assuming this path is correct now
          alt="Pelikula Logo"
          className="logo"
        />
        <h1 className="app-name">
          Pelikula
        </h1>
      </div>

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="signup-form">
        <h2 className="gradient-text">Create an Account</h2>

        {/* Full Name Input */}
        <div className="input-group"> {/* Changed from 'relative' to 'input-group' */}
          <User className="input-icon" size={20} /> {/* Removed 'left-3' */}
          <input
            name="name"
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="signup-form-input"
          />
        </div>

        {/* Username Input */}
        <div className="input-group"> {/* Changed from 'relative' to 'input-group' */}
          <User className="input-icon" size={20} /> {/* Removed 'left-3' */}
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            className="signup-form-input"
          />
        </div>

        {/* Email Input */}
        <div className="input-group"> {/* Changed from 'relative' to 'input-group' */}
          <Mail className="input-icon" size={20} /> {/* Removed 'left-3' */}
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="signup-form-input"
          />
        </div>

        {/* Password Input */}
        <div className="input-group"> {/* Changed from 'relative' to 'input-group' */}
          <Lock className="input-icon" size={20} /> {/* Removed 'left-3' */}
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="signup-form-input password-input" /* Added password-input class */
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle-button"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Sign Up Button */}
        <button
          type="submit"
          className="signup-button"
        >
          Sign Up
        </button>

        {/* Alternative Login */}
        <div className="alternative-login">
          <p>
            Already have an account?{" "}
            <a href="/login" className="login-link">
              Login
            </a>
          </p>

          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-600"></span>
            </div>
            <div className="relative bg-gray-800 px-4 text-sm text-gray-400">
              OR
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="google-login-btn"
            type="button"
          >
            {/* Inline SVG for Google logo */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="20px"
              height="20px"
              className="google-icon"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.945,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,3.92,1.194,7.597,3.266,10.748l-6.571,4.819C1.104,34.053,0,29.176,0,24C0,18.824,1.104,13.947,6.306,14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.571,4.819C1.104,34.053,0,29.176,0,24c0-3.92,1.194-7.597,3.266-10.748l6.571,4.819C12.381,29.683,16.798,33,22,33h2c2.909,0,5.66-1.012,7.74-2.76l6.19,5.238C34.046,41.947,29.268,44,24,44z"
              />
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.002,0.003-0.003l-6.19,5.238C36.92,39.864,40.85,41.947,44,44C39.648,44,35.046,42.245,31.306,39.043L24,33.864V28h11.303c1.649-4.657,6.08-8,11.303-8C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      </form>
    </div>
  );
};
