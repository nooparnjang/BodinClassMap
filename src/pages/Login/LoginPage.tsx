import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuthHook";
import { doSignInWithGoogle } from "../../firebase/auth";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";

function LoginPage() {
  const { userLoggedIn, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (userLoggedIn && currentUser) {
      const timer = setTimeout(() => navigate("/dashboard"), 1000);
      return () => clearTimeout(timer);
    }
  }, [userLoggedIn, currentUser, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      await doSignInWithGoogle();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in with Google";
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (userLoggedIn && currentUser) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.brand}>
              <div className={styles.logoWrap}>
                <span className={styles.logo}>C</span>
              </div>
              <div className={styles.schoolNameWrap}>
                <h1 className={styles.title}>ระบบจองที่นั่งห้องเรียน</h1>
                <p className={styles.subtitle}>โรงเรียนบดินทรเดชา (สิงห์ สิงหเสนี)</p>
              </div>
            </div>
            <h2 style={{ textAlign: "center", margin: 0 }}>✓ You are logged in as {currentUser.displayName}!</h2>
            <p style={{ textAlign: "center", margin: "18px 0 0" }}>Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.brand}>
            <div className={styles.logoWrap}>
              <img src="/logolarge_black.png" alt="School logo" className={styles.logoImage} />
            </div>

            <div className={styles.schoolNameWrap}>
              <h1 className={styles.title}>ระบบจองที่นั่งห้องเรียน</h1>
              <p className={styles.subtitle}>โรงเรียนบดินทรเดชา (สิงห์ สิงหเสนี)</p>
            </div>
          </div>

          {error && <p style={{ color: "red", textAlign: "center", margin: 0 }}>{error}</p>}

          <button
            type="button"
            className={styles.googleButton}
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <span className={styles.googleIcon} aria-hidden="true">
              <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Google logo">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.23 9.24 3.64l6.85-6.85C35.9 2.38 30.42 0 24 0 14.64 0 6.67 5.38 2.6 13.22l7.98 6.2C12.17 14.77 17.5 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24.55c0-1.6-.14-3.13-.4-4.55H24v8.64h12.7c-.55 2.96-2.22 5.47-4.73 7.16l7.66 5.95C43.72 37.35 46.5 31.53 46.5 24.55z"/>
                <path fill="#FBBC05" d="M32.97 40.2c-2.17 1.46-4.94 2.3-8.97 2.3-6.45 0-11.9-4.35-13.83-10.18l-8.1 6.28C4.57 42.5 13.56 48 24 48c7.04 0 12.95-2.31 17.24-6.3l-8.27-6.5z"/>
                <path fill="#34A853" d="M11.17 32.32A14.5 14.5 0 0 1 10 24c0-1.67.29-3.28.82-4.8L2.6 13.22A23.98 23.98 0 0 0 0 24c0 3.84.92 7.47 2.6 10.7l8.57-6.38z"/>
              </svg>
            </span>
            {loading ? "Signing in..." : "เข้าสู่ระบบด้วย Google"}
          </button>

          <p className={styles.note}>ใช้ได้เฉพาะอีเมล <span className={styles.note_blue}>@bodin.ac.th</span> เท่านั้น</p>
        </div>

        <p className={styles.footer}>© 2026 โรงเรียนบดินทรเดชา (สิงห์ สิงหเสนี)</p>
      </div>
    </div>
  );
}

export default LoginPage;