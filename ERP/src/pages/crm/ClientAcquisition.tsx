import { useState } from "react";

const leads = [
  { id: 1, name: "Rajesh Kumar", company: "Chennai Auto Parts", source: "Cold Call", stage: "Qualified", value: "₹4,50,000", assignee: "Anitha S", date: "2025-05-28", phone: "+91 98400 12345" },
  { id: 2, name: "Meena Devi", company: "Madurai Textiles", source: "Referral", stage: "Proposal Sent", value: "₹2,80,000", assignee: "Vikram R", date: "2025-05-26", phone: "+91 97890 54321" },
  { id: 3, name: "Senthil V", company: "Salem Steel Works", source: "Website", stage: "Negotiation", value: "₹7,20,000", assignee: "Priya M", date: "2025-05-24", phone: "+91 94440 67890" },
  { id: 4, name: "Kavitha R", company: "Coimbatore Plastics", source: "Exhibition", stage: "Won", value: "₹3,50,000", assignee: "Anitha S", date: "2025-05-20", phone: "+91 99000 11223" },
  { id: 5, name: "Murugan P", company: "Trichy Logistics", source: "LinkedIn", stage: "New Lead", value: "₹1,90,000", assignee: "Karthik B", date: "2025-05-30", phone: "+91 95551 33445" },
  { id: 6, name: "Lakshmi S", company: "Erode Agro Traders", source: "Cold Call", stage: "Lost", value: "₹5,10,000", assignee: "Vikram R", date: "2025-05-18", phone: "+91 91234 56789" },
];

const stageColor: Record<string, string> = {
  "New Lead": "#3b82f6",
  "Qualified": "#a855f7",
  "Proposal Sent": "#f59e0b",
  "Negotiation": "#fb923c",
  "Won": "#22c55e",
  "Lost": "#ef4444",
};

const funnel = [
  { stage: "New Lead", count: 24, color: "#3b82f6" },
  { stage: "Qualified", count: 18, color: "#a855f7" },
  { stage: "Proposal Sent", count: 12, color: "#f59e0b" },
  { stage: "Negotiation", count: 7, color: "#fb923c" },
  { stage: "Won", count: 4, color: "#22c55e" },
];

export default function ClientAcquisition() {
  const [tab, setTab] = useState("Pipeline");
  const [search, setSearch] = useState("");
  const tabs = ["Pipeline", "Funnel", "Sources"];

  const filtered = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Segoe UI', sans-serif", padding: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <div style={{ color: "#f59e0b", fontSize: "13px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "4px" }}>SHASTIKA GLOBAL IMPEX</div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", margin: 0 }}>Client Acquisition</h1>
          <div style={{ color: "#666", fontSize: "13px", marginTop: "4px" }}>Lead pipeline, conversion funnel & source analysis</div>
        </div>
        <button style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: "10px", padding: "12px 24px", color: "#000", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
          + Add Lead
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "Total Leads", value: "24", icon: "🎯", color: "#3b82f6" },
          { label: "Won This Month", value: "4", icon: "🏆", color: "#22c55e" },
          { label: "Pipeline Value", value: "₹25L", icon: "💰", color: "#f59e0b" },
          { label: "Conversion Rate", value: "16.7%", icon: "📈", color: "#a855f7" },
        ].map(card => (
          <div key={card.label} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "14px", padding: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ fontSize: "28px" }}>{card.icon}</div>
            <div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: card.color }}>{card.value}</div>
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

      {/* Pipeline Tab */}
      {tab === "Pipeline" && (
        <>
          <div style={{ marginBottom: "16px" }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search lead or company..."
              style={{ background: "#111", border: "1px solid #333", borderRadius: "8px", padding: "10px 16px", color: "#fff", fontSize: "14px", width: "280px", outline: "none" }}
            />
          </div>
          <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#161616", borderBottom: "1px solid #222" }}>
                  {["Lead Name", "Company", "Source", "Stage", "Value", "Assignee", "Date"].map(h => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", color: "#f59e0b", fontSize: "12px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => (
                  <tr key={lead.id} style={{ borderBottom: "1px solid #1a1a1a", background: i % 2 === 0 ? "transparent" : "#0d0d0d" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>{lead.name}</div>
                      <div style={{ color: "#555", fontSize: "12px" }}>{lead.phone}</div>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#aaa", fontSize: "13px" }}>{lead.company}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ background: "#1e1e1e", color: "#f59e0b", borderRadius: "6px", padding: "3px 10px", fontSize: "12px" }}>{lead.source}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ background: stageColor[lead.stage] + "22", color: stageColor[lead.stage], borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: 700, border: `1px solid ${stageColor[lead.stage]}44` }}>
                        {lead.stage}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#22c55e", fontWeight: 700, fontSize: "14px" }}>{lead.value}</td>
                    <td style={{ padding: "14px 16px", color: "#ccc", fontSize: "13px" }}>{lead.assignee}</td>
                    <td style={{ padding: "14px 16px", color: "#555", fontSize: "12px" }}>{lead.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Funnel Tab */}
      {tab === "Funnel" && (
        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "32px" }}>
          <div style={{ color: "#f59e0b", fontWeight: 700, marginBottom: "24px", fontSize: "15px" }}>Sales Conversion Funnel</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            {funnel.map((f, i) => {
              const width = 100 - i * 12;
              return (
                <div key={f.stage} style={{ width: "100%", display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "120px", textAlign: "right", color: "#aaa", fontSize: "13px" }}>{f.stage}</div>
                  <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                    <div style={{ width: `${width}%`, background: f.color + "33", border: `1px solid ${f.color}66`, borderRadius: "8px", padding: "14px 0", display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <span style={{ color: f.color, fontWeight: 800, fontSize: "20px" }}>{f.count}</span>
                    </div>
                  </div>
                  <div style={{ width: "60px", color: "#555", fontSize: "13px" }}>
                    {i > 0 ? `${Math.round((f.count / funnel[i - 1].count) * 100)}%` : "100%"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sources Tab */}
      {tab === "Sources" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "24px" }}>
            <div style={{ color: "#f59e0b", fontWeight: 700, marginBottom: "20px", fontSize: "14px" }}>Leads by Source</div>
            {[
              { source: "Cold Call", count: 8, color: "#3b82f6" },
              { source: "Referral", count: 6, color: "#22c55e" },
              { source: "Website", count: 5, color: "#f59e0b" },
              { source: "Exhibition", count: 3, color: "#a855f7" },
              { source: "LinkedIn", count: 2, color: "#fb923c" },
            ].map(s => (
              <div key={s.source} style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#ccc", fontSize: "13px" }}>{s.source}</span>
                  <span style={{ color: s.color, fontWeight: 700, fontSize: "13px" }}>{s.count} leads</span>
                </div>
                <div style={{ background: "#1e1e1e", borderRadius: "4px", height: "6px" }}>
                  <div style={{ background: s.color, borderRadius: "4px", height: "6px", width: `${(s.count / 8) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "24px" }}>
            <div style={{ color: "#f59e0b", fontWeight: 700, marginBottom: "20px", fontSize: "14px" }}>Top Performing Agents</div>
            {[
              { name: "Anitha S", won: 2, leads: 8, revenue: "₹8L" },
              { name: "Vikram R", won: 1, leads: 6, revenue: "₹5.5L" },
              { name: "Priya M", won: 1, leads: 5, revenue: "₹7.2L" },
              { name: "Karthik B", won: 0, leads: 5, revenue: "₹1.9L" },
            ].map((a, i) => (
              <div key={a.name} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 0", borderBottom: i < 3 ? "1px solid #1a1a1a" : "none" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "13px", color: "#000" }}>
                  {a.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: "14px" }}>{a.name}</div>
                  <div style={{ color: "#666", fontSize: "12px" }}>{a.leads} leads · {a.won} won</div>
                </div>
                <div style={{ color: "#22c55e", fontWeight: 700, fontSize: "14px" }}>{a.revenue}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}