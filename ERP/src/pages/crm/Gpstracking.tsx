import { useState } from "react";

const calls = [
  { id: 1, agent: "Anitha S", contact: "Rajesh Kumar", phone: "+91 98400 12345", type: "Outbound", duration: "8:24", outcome: "Interested", time: "2025-05-30 09:15", notes: "Will send proposal by Friday" },
  { id: 2, agent: "Vikram R", contact: "Meena Devi", phone: "+91 97890 54321", type: "Inbound", duration: "5:10", outcome: "Follow-up", time: "2025-05-30 09:45", notes: "Needs pricing details" },
  { id: 3, agent: "Karthik B", contact: "Senthil V", phone: "+91 94440 67890", type: "Outbound", duration: "12:03", outcome: "Meeting Scheduled", time: "2025-05-30 10:30", notes: "Meeting on June 3rd at Salem office" },
  { id: 4, agent: "Priya M", contact: "Kavitha R", phone: "+91 99000 11223", type: "Outbound", duration: "3:45", outcome: "Not Interested", time: "2025-05-30 11:00", notes: "Budget constraints this quarter" },
  { id: 5, agent: "Anitha S", contact: "Murugan P", phone: "+91 95551 33445", type: "Inbound", duration: "6:58", outcome: "Interested", time: "2025-05-30 12:10", notes: "Demo requested for next week" },
  { id: 6, agent: "Vikram R", contact: "Lakshmi S", phone: "+91 91234 56789", type: "Outbound", duration: "2:15", outcome: "No Answer", time: "2025-05-30 12:40", notes: "Will try again tomorrow" },
];

const outcomeColor: Record<string, string> = {
  "Interested": "#22c55e",
  "Follow-up": "#3b82f6",
  "Meeting Scheduled": "#a855f7",
  "Not Interested": "#ef4444",
  "No Answer": "#666",
};

export default function CallLogging() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [callList, setCallList] = useState(calls);
  const [newCall, setNewCall] = useState({ agent: "", contact: "", phone: "", type: "Outbound", duration: "", outcome: "Interested", notes: "" });

  const outcomes = ["All", "Interested", "Follow-up", "Meeting Scheduled", "Not Interested", "No Answer"];

  const filtered = callList.filter(c =>
    (filter === "All" || c.outcome === filter) &&
    (c.contact.toLowerCase().includes(search.toLowerCase()) || c.agent.toLowerCase().includes(search.toLowerCase()))
  );

  const totalDuration = callList.reduce((acc, c) => {
    const [m, s] = c.duration.split(":").map(Number);
    return acc + m * 60 + s;
  }, 0);
  const totalMins = Math.floor(totalDuration / 60);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Segoe UI', sans-serif", padding: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <div style={{ color: "#f59e0b", fontSize: "13px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "4px" }}>SHASTIKA GLOBAL IMPEX</div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", margin: 0 }}>Call Logging</h1>
          <div style={{ color: "#666", fontSize: "13px", marginTop: "4px" }}>Track all inbound and outbound sales calls</div>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: "10px", padding: "12px 24px", color: "#000", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
          + Log Call
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "Total Calls", value: String(callList.length), icon: "📞", color: "#3b82f6" },
          { label: "Talk Time", value: `${totalMins}m`, icon: "⏱️", color: "#f59e0b" },
          { label: "Interested", value: String(callList.filter(c => c.outcome === "Interested").length), icon: "✅", color: "#22c55e" },
          { label: "Meetings Set", value: String(callList.filter(c => c.outcome === "Meeting Scheduled").length), icon: "📅", color: "#a855f7" },
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
          placeholder="Search contact or agent..."
          style={{ background: "#111", border: "1px solid #333", borderRadius: "8px", padding: "9px 14px", color: "#fff", fontSize: "14px", width: "240px", outline: "none" }}
        />
        {outcomes.map(o => (
          <button key={o} onClick={() => setFilter(o)} style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid", cursor: "pointer", fontSize: "12px", fontWeight: 600, background: filter === o ? "#f59e0b" : "transparent", color: filter === o ? "#000" : "#777", borderColor: filter === o ? "#f59e0b" : "#333" }}>
            {o}
          </button>
        ))}
      </div>

      {/* Call List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.map(call => (
          <div key={call.id} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "18px 22px", display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: call.type === "Inbound" ? "#3b82f622" : "#f59e0b22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
              {call.type === "Inbound" ? "📲" : "📤"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: "15px" }}>{call.contact}</span>
                <span style={{ color: "#555", fontSize: "12px" }}>{call.phone}</span>
                <span style={{ background: call.type === "Inbound" ? "#3b82f622" : "#f59e0b22", color: call.type === "Inbound" ? "#3b82f6" : "#f59e0b", borderRadius: "5px", padding: "2px 8px", fontSize: "11px", fontWeight: 700 }}>{call.type}</span>
              </div>
              <div style={{ color: "#777", fontSize: "12px" }}>Agent: <span style={{ color: "#ccc" }}>{call.agent}</span> · Duration: <span style={{ color: "#f59e0b" }}>{call.duration}</span> · {call.time}</div>
              <div style={{ color: "#555", fontSize: "12px", marginTop: "4px" }}>📝 {call.notes}</div>
            </div>
            <div>
              <span style={{ background: (outcomeColor[call.outcome] || "#666") + "22", color: outcomeColor[call.outcome] || "#666", borderRadius: "8px", padding: "5px 12px", fontSize: "12px", fontWeight: 700, border: `1px solid ${(outcomeColor[call.outcome] || "#666")}44` }}>
                {call.outcome}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Call Modal */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#111", border: "1px solid #333", borderRadius: "18px", padding: "32px", width: "480px", maxWidth: "95vw" }}>
            <h2 style={{ margin: "0 0 24px", color: "#f59e0b", fontWeight: 800 }}>Log New Call</h2>
            {[
              { label: "Agent Name", key: "agent", placeholder: "Agent name" },
              { label: "Contact Name", key: "contact", placeholder: "Contact name" },
              { label: "Phone Number", key: "phone", placeholder: "+91 XXXXX XXXXX" },
              { label: "Duration (e.g. 5:30)", key: "duration", placeholder: "MM:SS" },
              { label: "Notes", key: "notes", placeholder: "Call summary" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", color: "#888", fontSize: "12px", marginBottom: "5px", fontWeight: 600 }}>{f.label}</label>
                <input value={(newCall as any)[f.key]} onChange={e => setNewCall({ ...newCall, [f.key]: e.target.value })} placeholder={f.placeholder} style={{ width: "100%", background: "#0a0a0a", border: "1px solid #333", borderRadius: "8px", padding: "9px 14px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              {[
                { label: "Type", key: "type", options: ["Outbound", "Inbound"] },
                { label: "Outcome", key: "outcome", options: ["Interested", "Follow-up", "Meeting Scheduled", "Not Interested", "No Answer"] },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", color: "#888", fontSize: "12px", marginBottom: "5px", fontWeight: 600 }}>{f.label}</label>
                  <select value={(newCall as any)[f.key]} onChange={e => setNewCall({ ...newCall, [f.key]: e.target.value })} style={{ width: "100%", background: "#0a0a0a", border: "1px solid #333", borderRadius: "8px", padding: "9px 14px", color: "#fff", fontSize: "14px", outline: "none" }}>
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid #333", borderRadius: "8px", color: "#888", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { setCallList([...callList, { ...newCall, id: callList.length + 1, time: new Date().toLocaleString() }]); setShowAdd(false); }} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: "8px", color: "#000", fontWeight: 700, cursor: "pointer" }}>Log Call</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}