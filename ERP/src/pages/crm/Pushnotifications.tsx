import { useState } from "react";

const notifications = [
  { id: 1, title: "New Lead Assigned", body: "Rajesh Kumar from Chennai Auto Parts has been assigned to you.", type: "Lead", sent: "2025-05-30 09:00", recipients: 1, status: "Delivered" },
  { id: 2, title: "Daily Target Reminder", body: "You have achieved 65% of today's sales target. Keep going!", type: "Reminder", sent: "2025-05-30 10:00", recipients: 8, status: "Delivered" },
  { id: 3, title: "Meeting in 15 mins", body: "Team standup meeting starts at 11:00 AM in Conference Room A.", type: "Meeting", sent: "2025-05-30 10:45", recipients: 8, status: "Delivered" },
  { id: 4, title: "Invoice Payment Received", body: "Coimbatore Plastics paid ₹3,50,000. Invoice #INV-2025-044 closed.", type: "Finance", sent: "2025-05-30 11:30", recipients: 3, status: "Delivered" },
  { id: 5, title: "Security Alert", body: "Failed login attempt detected from IP 45.33.32.156. Please verify your account.", type: "Security", sent: "2025-05-30 11:05", recipients: 2, status: "Delivered" },
];

const typeColor: Record<string, string> = {
  Lead: "#3b82f6",
  Reminder: "#f59e0b",
  Meeting: "#a855f7",
  Finance: "#22c55e",
  Security: "#ef4444",
};

export default function PushNotifications() {
  const [tab, setTab] = useState("History");
  const [showCompose, setShowCompose] = useState(false);
  const [notif, setNotif] = useState({ title: "", body: "", type: "Reminder", recipients: "All" });

  const tabs = ["History", "Compose", "Settings"];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Segoe UI', sans-serif", padding: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <div style={{ color: "#f59e0b", fontSize: "13px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "4px" }}>SHASTIKA GLOBAL IMPEX</div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", margin: 0 }}>Push Notifications</h1>
          <div style={{ color: "#666", fontSize: "13px", marginTop: "4px" }}>Manage and send mobile push notifications</div>
        </div>
        <button
          onClick={() => { setTab("Compose"); setShowCompose(true); }}
          style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: "10px", padding: "12px 24px", color: "#000", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
        >
          + Send Notification
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "Sent Today", value: "5", icon: "📤", color: "#3b82f6" },
          { label: "Delivered", value: "5", icon: "✅", color: "#22c55e" },
          { label: "Recipients", value: "22", icon: "👥", color: "#f59e0b" },
          { label: "Open Rate", value: "84%", icon: "📱", color: "#a855f7" },
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
              padding: "9px 20px", borderRadius: "8px", border: "1px solid", cursor: "pointer", fontSize: "13px", fontWeight: 600,
              background: tab === t ? "#f59e0b" : "transparent",
              color: tab === t ? "#000" : "#888",
              borderColor: tab === t ? "#f59e0b" : "#333",
            }}
          >{t}</button>
        ))}
      </div>

      {/* History */}
      {tab === "History" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {notifications.map(n => (
            <div key={n.id} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "20px 24px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: typeColor[n.type] + "22", border: `1px solid ${typeColor[n.type]}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                {{ Lead: "🎯", Reminder: "⏰", Meeting: "📅", Finance: "💰", Security: "🛡️" }[n.type]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: "15px" }}>{n.title}</div>
                    <div style={{ color: "#888", fontSize: "13px", marginTop: "4px" }}>{n.body}</div>
                  </div>
                  <span style={{ background: typeColor[n.type] + "22", color: typeColor[n.type], borderRadius: "6px", padding: "3px 10px", fontSize: "12px", fontWeight: 700, marginLeft: "12px", flexShrink: 0 }}>{n.type}</span>
                </div>
                <div style={{ display: "flex", gap: "20px", marginTop: "12px" }}>
                  <span style={{ color: "#555", fontSize: "12px" }}>📅 {n.sent}</span>
                  <span style={{ color: "#555", fontSize: "12px" }}>👥 {n.recipients} recipients</span>
                  <span style={{ color: "#22c55e", fontSize: "12px", fontWeight: 600 }}>✓ {n.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compose Tab */}
      {tab === "Compose" && (
        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "32px", maxWidth: "560px" }}>
          <h2 style={{ color: "#f59e0b", fontWeight: 800, margin: "0 0 24px", fontSize: "18px" }}>Compose Notification</h2>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", color: "#888", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>TITLE</label>
            <input value={notif.title} onChange={e => setNotif({ ...notif, title: e.target.value })} placeholder="Notification title" style={{ width: "100%", background: "#0a0a0a", border: "1px solid #333", borderRadius: "8px", padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", color: "#888", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>MESSAGE</label>
            <textarea value={notif.body} onChange={e => setNotif({ ...notif, body: e.target.value })} placeholder="Notification message" rows={3} style={{ width: "100%", background: "#0a0a0a", border: "1px solid #333", borderRadius: "8px", padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" }}>
            <div>
              <label style={{ display: "block", color: "#888", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>TYPE</label>
              <select value={notif.type} onChange={e => setNotif({ ...notif, type: e.target.value })} style={{ width: "100%", background: "#0a0a0a", border: "1px solid #333", borderRadius: "8px", padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none" }}>
                {["Reminder", "Lead", "Meeting", "Finance", "Security"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", color: "#888", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>RECIPIENTS</label>
              <select value={notif.recipients} onChange={e => setNotif({ ...notif, recipients: e.target.value })} style={{ width: "100%", background: "#0a0a0a", border: "1px solid #333", borderRadius: "8px", padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none" }}>
                {["All", "Sales Team", "Admin Only", "Field Agents", "Team Leads"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <button style={{ width: "100%", background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: "10px", padding: "13px", color: "#000", fontWeight: 800, fontSize: "15px", cursor: "pointer" }}>
            Send Notification 📤
          </button>
        </div>
      )}

      {/* Settings Tab */}
      {tab === "Settings" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {[
            { label: "Lead Notifications", desc: "Alert when new lead is assigned", enabled: true },
            { label: "Daily Target Reminders", desc: "Morning reminder for daily goals", enabled: true },
            { label: "Meeting Alerts", desc: "15-min before meeting reminder", enabled: true },
            { label: "Payment Notifications", desc: "Alert on invoice payment", enabled: true },
            { label: "Security Alerts", desc: "Notify on suspicious activity", enabled: true },
            { label: "Weekly Reports", desc: "Push summary every Monday", enabled: false },
          ].map(s => (
            <div key={s.label} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>{s.label}</div>
                <div style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>{s.desc}</div>
              </div>
              <div style={{ width: "44px", height: "24px", borderRadius: "12px", background: s.enabled ? "#f59e0b" : "#333", position: "relative", cursor: "pointer" }}>
                <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "#fff", position: "absolute", top: "3px", left: s.enabled ? "23px" : "3px", transition: "left 0.3s" }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}