import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Monitor, Camera, RefreshCw, Eye, EyeOff,
  Clock, User, Wifi, WifiOff, AlertTriangle,
  Play, Pause, Download, Grid, List,
  Shield, Activity,
} from "lucide-react";
import { toast } from "sonner";

interface ScreenSession {
  id: string;
  employee_id: string;
  employee_name: string;
  screenshot_url: string;
  active_window: string;
  idle_time: number;
  is_active: boolean;
  captured_at: string;
  ip_address: string;
  resolution: string;
}

interface MonitoredEmployee {
  id: string;
  name: string;
  role: string;
  status: "active" | "idle" | "offline";
  last_screenshot: string;
  active_window: string;
  idle_time: number;
  screenshots_today: number;
}

export default function ScreenMonitor() {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<ScreenSession[]>([]);
  const [employees, setEmployees] = useState<MonitoredEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
    if (isMonitoring) {
      const id = window.setInterval(fetchData, 30000);
      setRefreshInterval(id);
      return () => clearInterval(id);
    }
  }, [profile, isMonitoring]);

  const fetchData = async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const [sessRes, empRes] = await Promise.all([
        supabase
          .from("screen_sessions")
          .select("*")
          .eq("company_id", profile.company_id)
          .order("captured_at", { ascending: false })
          .limit(50),
        supabase
          .from("profiles")
          .select("id, full_name, role")
          .eq("company_id", profile.company_id),
      ]);

      const sessions = sessRes.data || [];
      setSessions(sessions);

      const empData = (empRes.data || []).map((emp: any) => {
        const empSessions = sessions.filter((s: any) => s.employee_id === emp.id);
        const latest = empSessions[0];
        const lastActive = latest ? new Date(latest.captured_at) : null;
        const diffMin = lastActive ? (Date.now() - lastActive.getTime()) / 60000 : Infinity;
        return {
          id: emp.id,
          name: emp.full_name,
          role: emp.role,
          status: diffMin < 2 ? "active" : diffMin < 15 ? "idle" : "offline",
          last_screenshot: latest?.captured_at || "",
          active_window: latest?.active_window || "Unknown",
          idle_time: latest?.idle_time || 0,
          screenshots_today: empSessions.filter((s: any) => {
            const d = new Date(s.captured_at);
            const today = new Date();
            return d.toDateString() === today.toDateString();
          }).length,
        };
      });
      setEmployees(empData);
    } catch {
      toast.error("Failed to load monitoring data");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (s: string) => {
    return s === "active" ? "#22c55e" : s === "idle" ? "#eab308" : "#555";
  };

  const timeAgo = (d: string) => {
    if (!d) return "Never";
    const diff = (Date.now() - new Date(d).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const filteredSessions = selectedEmployee
    ? sessions.filter((s) => s.employee_id === selectedEmployee)
    : sessions;

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>
      <PageHeader title="Screen Monitor" subtitle="Real-time employee screen activity and session tracking" />

      <div style={{ padding: "24px" }}>
        {/* Top Bar */}
        <div
          style={{
            background: "#111", border: "1px solid #222", borderRadius: "12px",
            padding: "16px 20px", marginBottom: "24px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "8px", height: "8px", borderRadius: "50%",
                  background: isMonitoring ? "#22c55e" : "#555",
                  animation: isMonitoring ? "pulse 2s infinite" : "none",
                }}
              />
              <span style={{ color: isMonitoring ? "#22c55e" : "#555", fontSize: "13px", fontWeight: 500 }}>
                {isMonitoring ? "Monitoring Active" : "Monitoring Paused"}
              </span>
            </div>
            <span style={{ color: "#333" }}>|</span>
            <span style={{ color: "#666", fontSize: "12px" }}>
              {employees.filter((e) => e.status === "active").length} active · {employees.length} total
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              {(["grid", "list"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    width: "34px", height: "34px", borderRadius: "8px", border: "none",
                    background: view === v ? "#222" : "transparent", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: view === v ? "#eab308" : "#666",
                  }}
                >
                  {v === "grid" ? <Grid size={14} /> : <List size={14} />}
                </button>
              ))}
            </div>
            <button
              onClick={fetchData}
              style={{
                width: "34px", height: "34px", borderRadius: "8px",
                background: "#1a1a1a", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <RefreshCw size={14} color="#888" />
            </button>
            <button
              onClick={() => setIsMonitoring((p) => !p)}
              style={{
                padding: "7px 16px", borderRadius: "8px", border: "none",
                background: isMonitoring ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                color: isMonitoring ? "#ef4444" : "#22c55e",
                fontSize: "13px", cursor: "pointer", fontWeight: 500,
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              {isMonitoring ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Resume</>}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Active Sessions", value: employees.filter(e => e.status === "active").length, color: "#22c55e", icon: Activity },
            { label: "Idle", value: employees.filter(e => e.status === "idle").length, color: "#eab308", icon: Clock },
            { label: "Offline", value: employees.filter(e => e.status === "offline").length, color: "#555", icon: WifiOff },
            { label: "Screenshots Today", value: sessions.filter(s => new Date(s.captured_at).toDateString() === new Date().toDateString()).length, color: "#3b82f6", icon: Camera },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: "#111", border: "1px solid #222", borderRadius: "12px", padding: "16px 20px", display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: `${s.color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon size={17} color={s.color} />
              </div>
              <div>
                <p style={{ color: "#666", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>{s.label}</p>
                <p style={{ color: s.color, fontSize: "24px", fontWeight: 700, margin: 0 }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "20px" }}>
          {/* Employee List */}
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #1a1a1a" }}>
              <h3 style={{ color: "#fff", fontSize: "13px", fontWeight: 600, margin: 0 }}>Employees</h3>
            </div>
            <div>
              <div
                onClick={() => setSelectedEmployee(null)}
                style={{
                  padding: "10px 16px", cursor: "pointer",
                  background: !selectedEmployee ? "rgba(234,179,8,0.08)" : "transparent",
                  borderBottom: "1px solid #111", borderLeft: !selectedEmployee ? "3px solid #eab308" : "3px solid transparent",
                }}
              >
                <span style={{ color: !selectedEmployee ? "#eab308" : "#888", fontSize: "12px" }}>All Employees ({employees.length})</span>
              </div>
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp.id === selectedEmployee ? null : emp.id)}
                  style={{
                    padding: "10px 16px", cursor: "pointer",
                    background: selectedEmployee === emp.id ? "rgba(234,179,8,0.06)" : "transparent",
                    borderBottom: "1px solid #111",
                    borderLeft: selectedEmployee === emp.id ? "3px solid #eab308" : "3px solid transparent",
                    display: "flex", alignItems: "center", gap: "10px",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <User size={13} color="#555" />
                    </div>
                    <div
                      style={{
                        position: "absolute", bottom: 0, right: 0,
                        width: "8px", height: "8px", borderRadius: "50%",
                        background: statusColor(emp.status), border: "2px solid #111",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "#fff", fontSize: "12px", fontWeight: 500, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {emp.name}
                    </p>
                    <p style={{ color: "#444", fontSize: "10px", margin: 0 }}>
                      {timeAgo(emp.last_screenshot)}
                    </p>
                  </div>
                  <span style={{ color: statusColor(emp.status), fontSize: "9px", textTransform: "capitalize", flexShrink: 0 }}>
                    {emp.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Screenshots */}
          <div>
            {/* Selected employee info */}
            {selectedEmployee && (() => {
              const emp = employees.find((e) => e.id === selectedEmployee);
              if (!emp) return null;
              return (
                <div
                  style={{
                    background: "#111", border: "1px solid #222", borderRadius: "12px",
                    padding: "16px 20px", marginBottom: "16px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <User size={18} color="#555" />
                    </div>
                    <div>
                      <p style={{ color: "#fff", fontSize: "14px", fontWeight: 600, margin: 0 }}>{emp.name}</p>
                      <p style={{ color: "#666", fontSize: "12px", margin: 0 }}>
                        {emp.active_window} · {emp.screenshots_today} screenshots today
                      </p>
                    </div>
                  </div>
                  <span
                    style={{
                      background: `${statusColor(emp.status)}18`,
                      color: statusColor(emp.status),
                      padding: "6px 14px", borderRadius: "20px", fontSize: "12px",
                      fontWeight: 500, textTransform: "capitalize",
                    }}
                  >
                    {emp.status}
                  </span>
                </div>
              );
            })()}

            {/* Screenshot Grid */}
            {view === "grid" ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <div key={i} style={{ background: "#111", border: "1px solid #222", borderRadius: "10px", overflow: "hidden" }}>
                      <div style={{ height: "120px", background: "#1a1a1a" }} />
                      <div style={{ padding: "10px" }}>
                        <div style={{ height: "10px", background: "#1a1a1a", borderRadius: "3px", width: "60%", marginBottom: "6px" }} />
                        <div style={{ height: "8px", background: "#151515", borderRadius: "3px", width: "40%" }} />
                      </div>
                    </div>
                  ))
                ) : filteredSessions.length === 0 ? (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "64px", color: "#555" }}>
                    <Camera size={40} color="#333" style={{ display: "block", margin: "0 auto 12px" }} />
                    <p style={{ fontSize: "14px", margin: 0 }}>No screenshots captured yet</p>
                  </div>
                ) : (
                  filteredSessions.slice(0, 20).map((session) => (
                    <div
                      key={session.id}
                      style={{
                        background: "#111", border: "1px solid #222",
                        borderRadius: "10px", overflow: "hidden", cursor: "pointer",
                        transition: "border-color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#333")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#222")}
                    >
                      {/* Screenshot placeholder */}
                      <div
                        style={{
                          height: "120px", background: "#0d0d0d",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          position: "relative",
                        }}
                      >
                        {session.screenshot_url ? (
                          <img
                            src={session.screenshot_url}
                            alt="screenshot"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <Monitor size={32} color="#333" />
                        )}
                        <div
                          style={{
                            position: "absolute", top: "8px", right: "8px",
                            width: "8px", height: "8px", borderRadius: "50%",
                            background: session.is_active ? "#22c55e" : "#555",
                          }}
                        />
                      </div>
                      <div style={{ padding: "10px 12px" }}>
                        <p style={{ color: "#fff", fontSize: "12px", fontWeight: 500, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {session.employee_name}
                        </p>
                        <p style={{ color: "#555", fontSize: "10px", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {session.active_window || "Unknown window"}
                        </p>
                        <span style={{ color: "#444", fontSize: "10px" }}>
                          {timeAgo(session.captured_at)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* List View for sessions */
              <div style={{ background: "#111", border: "1px solid #222", borderRadius: "12px", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                      {["Employee", "Active Window", "IP Address", "Resolution", "Idle Time", "Captured"].map((h) => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#555", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #111" }}>
                          {[...Array(6)].map((_, j) => (
                            <td key={j} style={{ padding: "12px 16px" }}>
                              <div style={{ height: "12px", background: "#1a1a1a", borderRadius: "3px", width: "70%" }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : filteredSessions.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#555" }}>
                          No sessions found
                        </td>
                      </tr>
                    ) : (
                      filteredSessions.slice(0, 50).map((s) => (
                        <tr
                          key={s.id}
                          style={{ borderBottom: "1px solid #111" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#141414")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div
                                style={{
                                  width: "8px", height: "8px", borderRadius: "50%",
                                  background: s.is_active ? "#22c55e" : "#555",
                                }}
                              />
                              <span style={{ color: "#fff", fontSize: "13px" }}>{s.employee_name}</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px", color: "#888", fontSize: "12px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {s.active_window || "—"}
                          </td>
                          <td style={{ padding: "12px 16px", color: "#666", fontSize: "12px" }}>{s.ip_address || "—"}</td>
                          <td style={{ padding: "12px 16px", color: "#666", fontSize: "12px" }}>{s.resolution || "—"}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ color: s.idle_time > 300 ? "#ef4444" : "#22c55e", fontSize: "12px" }}>
                              {s.idle_time ? `${Math.floor(s.idle_time / 60)}m` : "Active"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", color: "#555", fontSize: "12px" }}>
                            {timeAgo(s.captured_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}