import { useState } from "react";

const devices = [
  { id: 1, user: "Anitha S", device: "Windows PC - Dell Inspiron", deviceId: "DEV-001", os: "Windows 11", type: "Desktop", status: "Authorized", lastLogin: "2025-05-30 09:12", location: "Chennai" },
  { id: 2, user: "Vikram R", device: "MacBook Pro 14\"", deviceId: "DEV-002", os: "macOS Ventura", type: "Laptop", status: "Authorized", lastLogin: "2025-05-30 09:34", location: "Coimbatore" },
  { id: 3, user: "Priya M", device: "iPhone 13", deviceId: "DEV-003", os: "iOS 16.6", type: "Mobile", status: "Authorized", lastLogin: "2025-05-30 10:22", location: "Madurai" },
  { id: 4, user: "Karthik B", device: "Redmi Note 12", deviceId: "DEV-004", os: "Android 13", type: "Mobile", status: "Authorized", lastLogin: "2025-05-30 11:45", location: "Salem" },
  { id: 5, user: "Unknown", device: "Linux VPS", deviceId: "DEV-UNK-01", os: "Ubuntu 22.04", type: "Server", status: "Blocked", lastLogin: "2025-05-30 10:05", location: "Moscow, Russia" },
  { id: 6, user: "Suresh K", device: "Windows PC - HP", deviceId: "DEV-005", os: "Windows 10", type: "Desktop", status: "Authorized", lastLogin: "2025-05-30 11:30", location: "Chennai" },
  { id: 7, user: "New User", device: "Samsung Galaxy A54", deviceId: "DEV-006", os: "Android 14", type: "Mobile", status: "Pending", lastLogin: "2025-05-30 12:00", location: "Chennai" },
];

const statusColor: Record<string, string> = {
  Authorized: "#22c55e",
  Blocked: "#ef4444",
  Pending: "#f59e0b",
};

const typeIcon: Record<string, string> = {
  Desktop: "🖥️",
  Laptop: "💻",
  Mobile: "📱",
  Server: "🖧",
};

export default function DeviceAuthorization() {
  const [filter, setFilter] = useState("All");
  const [deviceList, setDeviceList] = useState(devices);
  const [search, setSearch] = useState("");

  const filters = ["All", "Authorized", "Pending", "Blocked"];

  const filtered = deviceList.filter(d =>
    (filter === "All" || d.status === filter) &&
    (d.user.toLowerCase().includes(search.toLowerCase()) || d.device.toLowerCase().includes(search.toLowerCase()) || d.deviceId.toLowerCase().includes(search.toLowerCase()))
  );

  const changeStatus = (id: number, status: string) => {
    setDeviceList(deviceList.map(d => d.id === id ? { ...d, status } : d));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Segoe UI', sans-serif", padding: "32px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ color: "#f59e0b", fontSize: "13px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "4px" }}>SHASTIKA GLOBAL IMPEX</div>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", margin: 0 }}>Device Authorization</h1>
        <div style={{ color: "#666", fontSize: "13px", marginTop: "4px" }}>Manage and authorize employee devices</div>
      </div>

      {/* Pending Alert */}
      {deviceList.filter(d => d.status === "Pending").length > 0 && (
        <div style={{ background: "#1a0e0022", border: "1px solid #f59e0b44", borderRadius: "12px", padding: "14px 20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
          <span>⏳</span>
          <span style={{ color: "#f59e0b", fontWeight: 700 }}>{deviceList.filter(d => d.status === "Pending").length} device(s) pending authorization</span>
          <span style={{ color: "#888", fontSize: "13px" }}>— Review and approve or block below</span>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "Total Devices", value: String(deviceList.length), icon: "📱", color: "#3b82f6" },
          { label: "Authorized", value: String(deviceList.filter(d => d.status === "Authorized").length), icon: "✅", color: "#22c55e" },
          { label: "Pending", value: String(deviceList.filter(d => d.status === "Pending").length), icon: "⏳", color: "#f59e0b" },
          { label: "Blocked", value: String(deviceList.filter(d => d.status === "Blocked").length), icon: "🚫", color: "#ef4444" },
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

      {/* Filters + Search */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search user, device or ID..."
          style={{ background: "#111", border: "1px solid #333", borderRadius: "8px", padding: "9px 14px", color: "#fff", fontSize: "14px", width: "260px", outline: "none" }}
        />
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 16px", borderRadius: "8px", border: "1px solid", cursor: "pointer", fontSize: "13px", fontWeight: 600, background: filter === f ? "#f59e0b" : "transparent", color: filter === f ? "#000" : "#777", borderColor: filter === f ? "#f59e0b" : "#333" }}>
            {f}
          </button>
        ))}
      </div>

      {/* Device Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "14px" }}>
        {filtered.map(d => (
          <div key={d.id} style={{
            background: "#111",
            border: `1px solid ${d.status === "Blocked" ? "#ef444433" : d.status === "Pending" ? "#f59e0b33" : "#1e1e1e"}`,
            borderRadius: "16px", padding: "20px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ fontSize: "28px" }}>{typeIcon[d.type] || "📱"}</div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: "15px" }}>{d.device}</div>
                  <div style={{ color: "#555", fontSize: "12px", fontFamily: "monospace" }}>{d.deviceId}</div>
                </div>
              </div>
              <span style={{
                background: statusColor[d.status] + "22",
                color: statusColor[d.status],
                borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: 700,
                border: `1px solid ${statusColor[d.status]}44`
              }}>{d.status}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "14px" }}>
              {[
                { label: "User", value: d.user },
                { label: "OS", value: d.os },
                { label: "Location", value: d.location },
                { label: "Last Login", value: d.lastLogin.split(" ")[1] },
              ].map(item => (
                <div key={item.label} style={{ background: "#0d0d0d", borderRadius: "8px", padding: "8px 12px" }}>
                  <div style={{ color: "#555", fontSize: "10px", marginBottom: "2px" }}>{item.label}</div>
                  <div style={{ color: "#ccc", fontSize: "12px", fontWeight: 600 }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {d.status !== "Authorized" && (
                <button onClick={() => changeStatus(d.id, "Authorized")} style={{ flex: 1, padding: "8px", background: "#22c55e22", border: "1px solid #22c55e44", borderRadius: "8px", color: "#22c55e", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                  ✓ Authorize
                </button>
              )}
              {d.status !== "Blocked" && (
                <button onClick={() => changeStatus(d.id, "Blocked")} style={{ flex: 1, padding: "8px", background: "#ef444422", border: "1px solid #ef444444", borderRadius: "8px", color: "#ef4444", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                  🚫 Block
                </button>
              )}
              {d.status === "Blocked" && (
                <button onClick={() => changeStatus(d.id, "Pending")} style={{ flex: 1, padding: "8px", background: "#1e1e1e", border: "1px solid #333", borderRadius: "8px", color: "#888", fontSize: "12px", cursor: "pointer" }}>
                  Reset
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}