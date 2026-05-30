import { useState } from "react";

const ipLogs = [
  { id: 1, user: "Anitha S", ip: "192.168.1.10", location: "Chennai, India", isp: "Airtel", device: "Windows PC", time: "2025-05-30 09:12", risk: "Low", trusted: true },
  { id: 2, user: "Vikram R", ip: "192.168.1.25", location: "Coimbatore, India", isp: "Jio", device: "MacBook", time: "2025-05-30 09:34", risk: "Low", trusted: true },
  { id: 3, user: "Unknown", ip: "45.33.32.156", location: "Moscow, Russia", isp: "Rostelecom", device: "Linux VPS", time: "2025-05-30 10:05", risk: "Critical", trusted: false },
  { id: 4, user: "Priya M", ip: "192.168.1.18", location: "Madurai, India", isp: "BSNL", device: "iPhone", time: "2025-05-30 10:22", risk: "Low", trusted: true },
  { id: 5, user: "Unknown", ip: "103.24.76.90", location: "Beijing, China", isp: "China Telecom", device: "Android", time: "2025-05-30 11:01", risk: "Critical", trusted: false },
  { id: 6, user: "Suresh K", ip: "192.168.1.5", location: "Chennai, India", isp: "Airtel", device: "Windows PC", time: "2025-05-30 11:30", risk: "Low", trusted: true },
  { id: 7, user: "Karthik B", ip: "10.0.0.45", location: "Salem, India", isp: "Vodafone", device: "Android", time: "2025-05-30 11:45", risk: "Medium", trusted: true },
];

const riskColor: Record<string, string> = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#ef4444",
};

export default function IPTracking() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filters = ["All", "Trusted", "Untrusted", "Critical"];

  const filtered = ipLogs.filter(l => {
    if (filter === "Trusted") return l.trusted;
    if (filter === "Untrusted") return !l.trusted;
    if (filter === "Critical") return l.risk === "Critical";
    return true;
  }).filter(l =>
    l.ip.includes(search) || l.user.toLowerCase().includes(search.toLowerCase()) || l.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Segoe UI', sans-serif", padding: "32px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ color: "#f59e0b", fontSize: "13px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "4px" }}>SHASTIKA GLOBAL IMPEX</div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", margin: 0 }}>IP Tracking</h1>
        <div style={{ color: "#666", fontSize: "13px", marginTop: "4px" }}>Monitor login IPs, geo-location and threat detection</div>
      </div>

      {/* Alert */}
      <div style={{ background: "#1a000022", border: "1px solid #ef444444", borderRadius: "12px", padding: "14px 20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
        <span>🚨</span>
        <span style={{ color: "#ef4444", fontWeight: 700 }}>2 Critical IPs detected</span>
        <span style={{ color: "#888", fontSize: "13px" }}>— Access from Russia and China blocked automatically</span>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "Total IPs", value: String(ipLogs.length), icon: "🌐", color: "#3b82f6" },
          { label: "Trusted IPs", value: String(ipLogs.filter(l => l.trusted).length), icon: "✅", color: "#22c55e" },
          { label: "Blocked IPs", value: String(ipLogs.filter(l => !l.trusted).length), icon: "🚫", color: "#ef4444" },
          { label: "Countries", value: "4", icon: "🗺️", color: "#f59e0b" },
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

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search IP, user or location..."
          style={{ background: "#111", border: "1px solid #333", borderRadius: "8px", padding: "9px 14px", color: "#fff", fontSize: "14px", width: "260px", outline: "none" }}
        />
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 16px", borderRadius: "8px", border: "1px solid", cursor: "pointer", fontSize: "13px", fontWeight: 600, background: filter === f ? "#f59e0b" : "transparent", color: filter === f ? "#000" : "#777", borderColor: filter === f ? "#f59e0b" : "#333" }}>
            {f}
          </button>
        ))}
      </div>

      {/* IP Table */}
      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", overflow: "hidden", marginBottom: "24px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#161616", borderBottom: "1px solid #222" }}>
              {["User", "IP Address", "Location", "ISP", "Device", "Time", "Risk", "Trust"].map(h => (
                <th key={h} style={{ padding: "13px 16px", textAlign: "left", color: "#f59e0b", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((log, i) => (
              <tr key={log.id} style={{ borderBottom: "1px solid #1a1a1a", background: !log.trusted ? "#1a000011" : i % 2 === 0 ? "transparent" : "#0d0d0d" }}>
                <td style={{ padding: "13px 16px", color: "#fff", fontWeight: 600, fontSize: "14px" }}>{log.user}</td>
                <td style={{ padding: "13px 16px", color: "#f59e0b", fontSize: "13px", fontFamily: "monospace" }}>{log.ip}</td>
                <td style={{ padding: "13px 16px", color: "#ccc", fontSize: "13px" }}>{log.location}</td>
                <td style={{ padding: "13px 16px", color: "#888", fontSize: "12px" }}>{log.isp}</td>
                <td style={{ padding: "13px 16px", color: "#888", fontSize: "12px" }}>{log.device}</td>
                <td style={{ padding: "13px 16px", color: "#555", fontSize: "12px" }}>{log.time}</td>
                <td style={{ padding: "13px 16px" }}>
                  <span style={{ color: riskColor[log.risk], fontWeight: 700, fontSize: "13px" }}>● {log.risk}</span>
                </td>
                <td style={{ padding: "13px 16px" }}>
                  <span style={{
                    background: log.trusted ? "#22c55e22" : "#ef444422",
                    color: log.trusted ? "#22c55e" : "#ef4444",
                    borderRadius: "6px", padding: "3px 10px", fontSize: "12px", fontWeight: 700,
                    border: `1px solid ${log.trusted ? "#22c55e44" : "#ef444444"}`
                  }}>
                    {log.trusted ? "Trusted" : "Blocked"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Geo Distribution */}
      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "24px" }}>
        <div style={{ color: "#f59e0b", fontWeight: 700, marginBottom: "18px", fontSize: "14px" }}>🌍 IP by Country</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
          {[
            { country: "India", flag: "🇮🇳", count: 5, color: "#22c55e", trusted: true },
            { country: "Russia", flag: "🇷🇺", count: 1, color: "#ef4444", trusted: false },
            { country: "China", flag: "🇨🇳", count: 1, color: "#ef4444", trusted: false },
            { country: "Others", flag: "🌐", count: 0, color: "#666", trusted: true },
          ].map(c => (
            <div key={c.country} style={{ background: "#0d0d0d", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: "28px", marginBottom: "6px" }}>{c.flag}</div>
              <div style={{ color: "#fff", fontWeight: 700 }}>{c.country}</div>
              <div style={{ color: c.color, fontWeight: 800, fontSize: "22px" }}>{c.count}</div>
              <div style={{ color: c.trusted ? "#22c55e" : "#ef4444", fontSize: "11px", marginTop: "4px" }}>{c.trusted ? "Safe" : "Blocked"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}