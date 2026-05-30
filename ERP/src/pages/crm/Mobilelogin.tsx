import { useState } from "react";

export default function MobileLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = () => {
    if (!email || !password) { setError("Please enter email and password."); return; }
    setError("");
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif", padding: "20px"
    }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ width: "72px", height: "72px", background: "linear-gradient(135deg,#f59e0b,#d97706)", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "32px" }}>
            🌐
          </div>
          <div style={{ color: "#f59e0b", fontSize: "20px", fontWeight: 900, letterSpacing: "2px" }}>SHASTIKA</div>
          <div style={{ color: "#888", fontSize: "12px", letterSpacing: "3px", marginTop: "2px" }}>GLOBAL IMPEX CRM</div>
        </div>

        {/* Card */}
        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "20px", padding: "36px 32px" }}>
          <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "22px", margin: "0 0 6px" }}>Welcome Back</h2>
          <p style={{ color: "#666", fontSize: "13px", margin: "0 0 28px" }}>Sign in to your CRM account</p>

          {error && (
            <div style={{ background: "#ef444422", border: "1px solid #ef444444", borderRadius: "8px", padding: "10px 14px", color: "#ef4444", fontSize: "13px", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", color: "#888", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>EMAIL ADDRESS</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@shastika.com"
              style={{ width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: "10px", padding: "12px 16px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
              onFocus={e => (e.target.style.borderColor = "#f59e0b")}
              onBlur={e => (e.target.style.borderColor = "#2a2a2a")}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block", color: "#888", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>PASSWORD</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: "10px", padding: "12px 44px 12px 16px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                onFocus={e => (e.target.style.borderColor = "#f59e0b")}
                onBlur={e => (e.target.style.borderColor = "#2a2a2a")}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "16px" }}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div style={{ textAlign: "right", marginBottom: "24px" }}>
            <span style={{ color: "#f59e0b", fontSize: "13px", cursor: "pointer", fontWeight: 600 }}>Forgot password?</span>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%", background: loading ? "#555" : "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: "10px",
              padding: "14px", color: "#000", fontWeight: 800, fontSize: "15px", cursor: loading ? "not-allowed" : "pointer", transition: "opacity 0.2s"
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#1e1e1e" }} />
            <span style={{ color: "#555", fontSize: "12px" }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: "#1e1e1e" }} />
          </div>

          {/* Biometric */}
          <button style={{ width: "100%", background: "transparent", border: "1px solid #2a2a2a", borderRadius: "10px", padding: "12px", color: "#ccc", fontWeight: 600, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>👆</span> Sign in with Fingerprint
          </button>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "24px", color: "#444", fontSize: "12px" }}>
          Shastika Global Impex CRM v2.0 · <span style={{ color: "#f59e0b" }}>Secure Login</span>
        </div>
      </div>
    </div>
  );
}