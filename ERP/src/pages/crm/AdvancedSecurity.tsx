import { useState } from "react";

const threats = [
  { id: 1, type: "Brute Force", ip: "45.33.32.156", country: "Russia", severity: "Critical", time: "2025-05-30 10:05", status: "Blocked" },
  { id: 2, type: "Unauthorized Access", ip: "103.24.76.90", country: "China", severity: "High", time: "2025-05-30 11:01", status: "Blocked" },
  { id: 3, type: "SQL Injection Attempt", ip: "192.168.1.99", country: "Local", severity: "Medium", time: "2025-05-30 08:44", status: "Blocked" },
  { id: 4, type: "Suspicious Login", ip: "78.45.12.200", country: "Germany", severity: "Low", time: "2025-05-29 23:12", status: "Reviewing" },
  { id: 5, type: "Port Scan", ip: "91.108.4.33", country: "Netherlands", severity: "Medium", time: "2025-05-29 20:30", status: "Blocked" },
];

const auditLogs = [
  { user: "Suresh K", action: "Changed password policy", module: "Settings", time: "2025-05-30 08:30", ip: "192.168.1.5" },
  { user: "Anitha S", action: "Exported customer list", module: "Customers", time: "2025-05-30 09:45", ip: "192.168.1.10" },
  { user: "Vikram R", action: "Deleted old lead record", module: "CRM", time: "2025-05-30 10:20", ip: "192.168.1.25" },
  { user: "Admin", action: "Added new user account", module: "Security", time: "2025-05-30 11:00", ip: "192.168.1.5" },
  { user: "Priya M", action: "Generated Q2 report", module: "Reports", time: "2025-05-30 12:15", ip: "192.168.1.18" },
];

const severityColor: Record<string, string> = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#f59e0b",
  Low: "#22c55e",
};

export default function AdvancedSecurity() {
  const [tab, setTab] = useState("Threats");
  const tabs = ["Threats", "Audit Log", "Firewall", "Compliance"];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Segoe UI', sans-serif", padding: "32px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ color: "#f59e0b", fontSize: "13px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "4px" }}>SHASTIKA GLOBAL IMPEX</div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", margin: 0 }}>Advanced Security</h1>
        <div style={{ color: "#666", fontSize: "13px", marginTop: "4px" }}>Threat monitoring, audit trails & compliance management</div>
      </div>

      {/* Threat Alert */}
      <div style={{ background: "#1a000022", border: "1px solid #ef444444", borderRadius: "12px", padding: "14px 20px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "20px" }}>🚨</span>
        <div style={{ flex: 1 }}>
          <span style={{ color: "#ef4444", fontWeight: 700 }}>1 Critical Threat Detected</span>
          <span style={{ color: "#888", fontSize: "13px", marginLeft: "10px" }}>Brute force attack from 45.33.32.156 — automatically blocked</span>
        </div>
        <span style={{ color: "#22c55e", fontSize: "13px", fontWeight: 700 }}>✓ Protected</span>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "Threats Blocked", value: "47", icon: "🛡️", color: "#22c55e" },
          { label: "Critical Alerts", value: "1", icon: "🚨", color: "#ef4444" },
          { label: "Audit Events", value: "128", icon: "📋", color: "#3b82f6" },
          { label: "Compliance Score", value: "92%", icon: "✅", color: "#f59e0b" },
        ].map(card => (
          <div key={card.label} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ fontSize: "28px" }}>{card.icon}</div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: card.color }}>{card.value}</div>
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
              padding: "9px 20px", borderRadius: "8px", border: "1px solid", cursor: "pointer", fontSize: "13px", fontWeight: 600,
              background: tab === t ? "#f59e0b" : "transparent",
              color: tab === t ? "#000" : "#888",
              borderColor: tab === t ? "#f59e0b" : "#333",
            }}
          >{t}</button>
        ))}
      </div>

      {/* Threats Tab */}
      {tab === "Threats" && (
        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#161616", borderBottom: "1px solid #222" }}>
                {["Threat Type", "IP Address", "Country", "Severity", "Time", "Status"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", color: "#f59e0b", fontSize: "12px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {threats.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: "1px solid #1a1a1a", background: i % 2 === 0 ? "transparent" : "#0d0d0d" }}>
                  <td style={{ padding: "14px 16px", color: "#fff", fontWeight: 600, fontSize: "14px" }}>{t.type}</td>
                  <td style={{ padding: "14px 16px", color: "#f59e0b", fontSize: "13px", fontFamily: "monospace" }}>{t.ip}</td>
                  <td style={{ padding: "14px 16px", color: "#aaa", fontSize: "13px" }}>{t.country}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ color: severityColor[t.severity], fontWeight: 700, fontSize: "13px" }}>● {t.severity}</span>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#555", fontSize: "12px" }}>{t.time}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ background: t.status === "Blocked" ? "#ef444422" : "#f59e0b22", color: t.status === "Blocked" ? "#ef4444" : "#f59e0b", borderRadius: "6px", padding: "3px 12px", fontSize: "12px", fontWeight: 700 }}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Log Tab */}
      {tab === "Audit Log" && (
        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#161616", borderBottom: "1px solid #222" }}>
                {["User", "Action", "Module", "Time", "IP Address"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", color: "#f59e0b", fontSize: "12px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #1a1a1a", background: i % 2 === 0 ? "transparent" : "#0d0d0d" }}>
                  <td style={{ padding: "14px 16px", color: "#f59e0b", fontWeight: 700, fontSize: "14px" }}>{log.user}</td>
                  <td style={{ padding: "14px 16px", color: "#ccc", fontSize: "13px" }}>{log.action}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ background: "#1e1e1e", color: "#888", borderRadius: "6px", padding: "3px 10px", fontSize: "12px" }}>{log.module}</span>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#555", fontSize: "12px" }}>{log.time}</td>
                  <td style={{ padding: "14px 16px", color: "#f59e0b", fontSize: "13px", fontFamily: "monospace" }}>{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Firewall Tab */}
      {tab === "Firewall" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "24px" }}>
            <div style={{ color: "#f59e0b", fontWeight: 700, marginBottom: "20px", fontSize: "14px" }}>🔥 Firewall Rules</div>
            {[
              { rule: "Block all traffic from CN, RU, KP", status: "Active", type: "Geo Block" },
              { rule: "Allow 192.168.1.x subnet only", status: "Active", type: "IP Whitelist" },
              { rule: "Block port 23, 445, 3389", status: "Active", type: "Port Block" },
              { rule: "Rate limit: 100 req/min per IP", status: "Active", type: "Rate Limit" },
              { rule: "Allow only HTTPS (443) inbound", status: "Active", type: "Protocol" },
            ].map((r, i) => (
              <div key={i} style={{ padding: "14px 0", borderBottom: i < 4 ? "1px solid #1a1a1a" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "#ccc", fontSize: "13px" }}>{r.rule}</div>
                  <span style={{ background: "#1e1e1e", color: "#888", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", marginTop: "4px", display: "inline-block" }}>{r.type}</span>
                </div>
                <span style={{ color: "#22c55e", fontWeight: 700, fontSize: "12px" }}>✓ {r.status}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "24px" }}>
            <div style={{ color: "#f59e0b", fontWeight: 700, marginBottom: "20px", fontSize: "14px" }}>🌍 Blocked Countries</div>
            {[
              { country: "Russia", attempts: 12, flag: "🇷🇺" },
              { country: "China", attempts: 8, flag: "🇨🇳" },
              { country: "North Korea", attempts: 3, flag: "🇰🇵" },
              { country: "Netherlands", attempts: 2, flag: "🇳🇱" },
              { country: "Unknown", attempts: 5, flag: "🌐" },
            ].map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 0", borderBottom: i < 4 ? "1px solid #1a1a1a" : "none" }}>
                <span style={{ fontSize: "22px" }}>{c.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#ccc", fontSize: "13px", fontWeight: 600 }}>{c.country}</div>
                </div>
                <span style={{ color: "#ef4444", fontWeight: 700, fontSize: "14px" }}>{c.attempts} attempts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Tab */}
      {tab === "Compliance" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {[
            { title: "Password Policy", score: 95, items: ["Min 8 chars ✓", "Special char required ✓", "30-day expiry ✓", "No reuse last 5 ✓"] },
            { title: "Data Protection", score: 90, items: ["Encryption at rest ✓", "HTTPS only ✓", "Backup daily ✓", "GDPR compliant ✓"] },
            { title: "Access Control", score: 88, items: ["Role-based access ✓", "2FA for admin ✓", "Session timeout ✓", "IP whitelist ✗"] },
            { title: "Audit & Logging", score: 92, items: ["All actions logged ✓", "90-day retention ✓", "Tamper-proof ✓", "Real-time alerts ✓"] },
          ].map(c => (
            <div key={c.title} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ color: "#f59e0b", fontWeight: 700, fontSize: "15px" }}>{c.title}</div>
                <div style={{ fontSize: "22px", fontWeight: 800, color: c.score >= 90 ? "#22c55e" : "#f59e0b" }}>{c.score}%</div>
              </div>
              <div style={{ background: "#1e1e1e", borderRadius: "4px", height: "6px", marginBottom: "16px" }}>
                <div style={{ background: c.score >= 90 ? "#22c55e" : "#f59e0b", borderRadius: "4px", height: "6px", width: `${c.score}%` }} />
              </div>
              {c.items.map((item, i) => (
                <div key={i} style={{ color: item.endsWith("✓") ? "#aaa" : "#ef4444", fontSize: "13px", marginBottom: "6px" }}>
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}