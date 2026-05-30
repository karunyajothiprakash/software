import { useState } from "react";

const loginLogs = [
  { id: 1, user: "Anitha S", role: "Sales Manager", ip: "192.168.1.10", device: "Windows PC", time: "2025-05-30 09:12", status: "Success" },
  { id: 2, user: "Vikram R", role: "Team Lead", ip: "192.168.1.25", device: "MacBook", time: "2025-05-30 09:34", status: "Success" },
  { id: 3, user: "Unknown", role: "-", ip: "45.33.32.156", device: "Linux", time: "2025-05-30 10:05", status: "Failed" },
  { id: 4, user: "Priya M", role: "CRM Executive", ip: "192.168.1.18", device: "iPhone", time: "2025-05-30 10:22", status: "Success" },
  { id: 5, user: "Unknown", role: "-", ip: "103.24.76.90", device: "Android", time: "2025-05-30 11:01", status: "Failed" },
  { id: 6, user: "Suresh K", role: "Admin", ip: "192.168.1.5", device: "Windows PC", time: "2025-05-30 11:30", status: "Success" },
];

const permissions = [
  { role: "Admin", dashboard: true, customers: true, reports: true, security: true, employees: true },
  { role: "Sales Manager", dashboard: true, customers: true, reports: true, security: false, employees: true },
  { role: "Team Lead", dashboard: true, customers: true, reports: true, security: false, employees: false },
  { role: "CRM Executive", dashboard: true, customers: true, reports: false, security: false, employees: false },
];

const alerts = [
  { type: "warning", message: "3 failed login attempts from IP 45.33.32.156", time: "10:05 AM" },
  { type: "danger", message: "Unauthorized access attempt blocked - IP 103.24.76.90", time: "11:01 AM" },
  { type: "info", message: "Password policy updated by Admin Suresh K", time: "08:30 AM" },
];

export default function Security() {
  const [tab, setTab] = useState("Logs");
  const tabs = ["Logs", "Permissions", "Alerts", "Settings"];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Segoe UI', sans-serif", padding: "32px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ color: "#f59e0b", fontSize: "13px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "4px" }}>SHASTIKA GLOBAL IMPEX</div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", margin: 0 }}>Security Center</h1>
        <div style={{ color: "#666", fontSize: "13px", marginTop: "4px" }}>Monitor access, permissions and security alerts</div>
      </div>

      {/* Alert Banner */}
      <div style={{ background: "#1a0e00", border: "1px solid #f59e0b44", borderRadius: "12px", padding: "14px 20px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "20px" }}>🛡️</span>
        <div>
          <span style={{ color: "#f59e0b", fontWeight: 700 }}>2 Security Alerts</span>
          <span style={{ color: "#888", fontSize: "13px", marginLeft: "10px" }}>Unauthorized access attempts detected today</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "Total Logins", value: "4", icon: "🔑", color: "#22c55e" },
          { label: "Failed Attempts", value: "2", icon: "❌", color: "#ef4444" },
          { label: "Active Users", value: "4", icon: "👤", color: "#3b82f6" },
          { label: "Alerts", value: "3", icon: "⚠️", color: "#f59e0b" },
        ].map(card => (
          <div key={card.label} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ fontSize: "28px" }}>{card.icon}</div>
            <div>
              <div style={{ fontSize: "26px", fontWeight: 800, color: card.color }}>{card.value}</div>
              <div style={{ color: "#666", fontSize: "12px" }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "9px 20px", borderRadius: "8px", border: "1px solid", cursor: "pointer", fontSize: "13px", fontWeight: 600, transition: "all 0.2s",
              background: tab === t ? "#f59e0b" : "transparent",
              color: tab === t ? "#000" : "#888",
              borderColor: tab === t ? "#f59e0b" : "#333",
            }}
          >{t}</button>
        ))}
      </div>

      {/* Login Logs Tab */}
      {tab === "Logs" && (
        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#161616", borderBottom: "1px solid #222" }}>
                {["User", "Role", "IP Address", "Device", "Time", "Status"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", color: "#f59e0b", fontSize: "12px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loginLogs.map((log, i) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #1a1a1a", background: i % 2 === 0 ? "transparent" : "#0d0d0d" }}>
                  <td style={{ padding: "13px 16px", color: "#fff", fontSize: "14px" }}>{log.user}</td>
                  <td style={{ padding: "13px 16px", color: "#aaa", fontSize: "13px" }}>{log.role}</td>
                  <td style={{ padding: "13px 16px", color: "#f59e0b", fontSize: "13px", fontFamily: "monospace" }}>{log.ip}</td>
                  <td style={{ padding: "13px 16px", color: "#aaa", fontSize: "13px" }}>{log.device}</td>
                  <td style={{ padding: "13px 16px", color: "#666", fontSize: "12px" }}>{log.time}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{
                      background: log.status === "Success" ? "#22c55e22" : "#ef444422",
                      color: log.status === "Success" ? "#22c55e" : "#ef4444",
                      borderRadius: "6px", padding: "3px 12px", fontSize: "12px", fontWeight: 700,
                      border: `1px solid ${log.status === "Success" ? "#22c55e44" : "#ef444444"}`
                    }}>{log.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Permissions Tab */}
      {tab === "Permissions" && (
        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#161616", borderBottom: "1px solid #222" }}>
                {["Role", "Dashboard", "Customers", "Reports", "Security", "Employees"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", color: "#f59e0b", fontSize: "12px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((p, i) => (
                <tr key={p.role} style={{ borderBottom: "1px solid #1a1a1a", background: i % 2 === 0 ? "transparent" : "#0d0d0d" }}>
                  <td style={{ padding: "14px 16px", color: "#fff", fontWeight: 700, fontSize: "14px" }}>{p.role}</td>
                  {["dashboard", "customers", "reports", "security", "employees"].map(key => (
                    <td key={key} style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: "18px" }}>{(p as any)[key] ? "✅" : "❌"}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Alerts Tab */}
      {tab === "Alerts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {alerts.map((a, i) => (
            <div key={i} style={{
              background: a.type === "danger" ? "#1a000033" : a.type === "warning" ? "#1a0e0033" : "#00111a33",
              border: `1px solid ${a.type === "danger" ? "#ef444444" : a.type === "warning" ? "#f59e0b44" : "#3b82f644"}`,
              borderRadius: "12px", padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px"
            }}>
              <div style={{ fontSize: "22px" }}>{a.type === "danger" ? "🚨" : a.type === "warning" ? "⚠️" : "ℹ️"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>{a.message}</div>
                <div style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>{a.time}</div>
              </div>
              <button style={{ background: "transparent", border: "1px solid #333", borderRadius: "6px", color: "#888", padding: "5px 12px", fontSize: "12px", cursor: "pointer" }}>Dismiss</button>
            </div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {tab === "Settings" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {[
            { label: "Two-Factor Authentication", desc: "Require 2FA for all admin accounts", enabled: true },
            { label: "Session Timeout", desc: "Auto logout after 30 minutes of inactivity", enabled: true },
            { label: "IP Whitelist", desc: "Only allow logins from approved IP ranges", enabled: false },
            { label: "Login Alerts", desc: "Email alerts for failed login attempts", enabled: true },
            { label: "Device Lock", desc: "Lock account after 5 failed attempts", enabled: true },
            { label: "Audit Log Retention", desc: "Keep logs for 90 days", enabled: false },
          ].map(s => (
            <div key={s.label} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>{s.label}</div>
                <div style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>{s.desc}</div>
              </div>
              <div style={{
                width: "44px", height: "24px", borderRadius: "12px",
                background: s.enabled ? "#f59e0b" : "#333",
                position: "relative", cursor: "pointer", transition: "background 0.3s"
              }}>
                <div style={{
                  width: "18px", height: "18px", borderRadius: "50%", background: "#fff",
                  position: "absolute", top: "3px", transition: "left 0.3s",
                  left: s.enabled ? "23px" : "3px"
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}