// src/components/Auth.js
import React, { useEffect, useState } from "react";
import { signInWithGoogle, logout, onAuthChange } from "../firebase";

export default function Auth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(setUser);
    return () => unsubscribe();
  }, []);

  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.displayName} ({user.email})</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={signInWithGoogle}>Continue with Google</button>
      )}
    </div>
  );
}



