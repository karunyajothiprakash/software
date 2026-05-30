import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import {
  Activity, Clock, CheckCircle, AlertCircle,
  Search, RefreshCw, User, Calendar,
  TrendingUp, MapPin, Monitor, Smartphone
} from "lucide-react";
import { toast } from "sonner";

interface ActivityLog {
  id: string;
  employee_id: string;
  employee_name: string;
  action: string;
  module: string;
  description: string;
  ip_address: string;
  device_type: string;
  created_at: string;
}

interface Employee {
  id: string;
  full_name: string;
  role: string;
  last_active: string;
  activity_count: number;
  status: "online" | "offline" | "idle";
}

export default function EmployeeActivity() {
  const { profile } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");
  const [dateRange, setDateRange] = useState("today");

  const modules = ["all", "crm", "quotations", "documents", "reports", "settings"];

  useEffect(() => {
    fetchData();
  }, [profile, dateRange]);

  const fetchData = async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const now = new Date();
      let fromDate = new Date();
      if (dateRange === "today") fromDate.setHours(0, 0, 0, 0);
      else if (dateRange === "week") fromDate.setDate(now.getDate() - 7);
      else if (dateRange === "month") fromDate.setMonth(now.getMonth() - 1);

      const [actRes, empRes] = await Promise.all([
        supabase
          .from("employee_activity_logs")
          .select("*")
          .eq("company_id", profile.company_id)
          .gte("created_at", fromDate.toISOString())
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("profiles")
          .select("id, full_name, role, updated_at")
          .eq("company_id", profile.company_id),
      ]);

      setActivities(actRes.data || []);

      const empData = (empRes.data || []).map((e: any) => {
        const lastActive = new Date(e.updated_at);
        const diffMin = (Date.now() - lastActive.getTime()) / 60000;
        return {
          id: e.id,
          full_name: e.full_name,
          role: e.role,
          last_active: e.updated_at,
          activity_count: (actRes.data || []).filter((a: any) => a.employee_id === e.id).length,
          status: diffMin < 5 ? "online" : diffMin < 30 ? "idle" : "offline",
        };
      });
      setEmployees(empData);
    } catch (err) {
      toast.error("Failed to load activity data");
    } finally {
      setLoading(false);
    }
  };

  const filtered = activities.filter((a) => {
    const matchSearch =
      a.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchModule = selectedModule === "all" || a.module === selectedModule;
    return matchSearch && matchModule;
  });

  const statusColor = (s: string) => {
    return s === "online" ? "#22c55e" : s === "idle" ? "#eab308" : "#555";
  };

  const moduleColor = (m: string) => {
    const map: Record<string, string> = {
      crm: "#3b82f6", quotations: "#eab308", documents: "#a855f7",
      reports: "#22c55e", settings: "#888", login: "#f97316",
    };
    return map[m] || "#555";
  };

  const timeAgo = (date: string) => {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>
      <PageHeader
        title="Employee Activity"
        subtitle="Monitor team actions, login history, and module usage"
      />

      <div style={{ padding: "24px" }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total Activities", value: activities.length, icon: Activity, color: "#fff" },
            { label: "Online Now", value: employees.filter(e => e.status === "online").length, icon: CheckCircle, color: "#22c55e" },
            { label: "Idle", value: employees.filter(e => e.status === "idle").length, icon: Clock, color: "#eab308" },
            { label: "Offline", value: employees.filter(e => e.status === "offline").length, icon: AlertCircle, color: "#ef4444" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                flex: 1, background: "#111", border: "1px solid #222",
                borderRadius: "12px", padding: "20px 24px",
                display: "flex", gap: "16px", alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "44px", height: "44px", borderRadius: "10px",
                  background: `${s.color}12`, display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}
              >
                <s.icon size={20} color={s.color} />
              </div>
              <div>
                <p style={{ color: "#666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px" }}>
                  {s.label}
                </p>
                <p style={{ color: s.color, fontSize: "26px", fontWeight: 700, margin: 0 }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px" }}>
          {/* Employee Status Panel */}
          <div>
            <div
              style={{
                background: "#111", border: "1px solid #222",
                borderRadius: "12px", padding: "20px",
              }}
            >
              <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: 600, margin: "0 0 16px" }}>
                Team Status
              </h3>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: "56px", background: "#1a1a1a",
                      borderRadius: "8px", marginBottom: "8px",
                    }}
                  />
                ))
              ) : employees.length === 0 ? (
                <p style={{ color: "#555", fontSize: "13px", textAlign: "center", padding: "24px 0" }}>
                  No employees found
                </p>
              ) : (
                employees.map((emp) => (
                  <div
                    key={emp.id}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "10px 12px", borderRadius: "8px", marginBottom: "6px",
                      background: "#0d0d0d", border: "1px solid #1a1a1a",
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <div
                        style={{
                          width: "36px", height: "36px", borderRadius: "50%",
                          background: "#1a1a1a", display: "flex",
                          alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <User size={16} color="#555" />
                      </div>
                      <div
                        style={{
                          position: "absolute", bottom: 1, right: 1,
                          width: "9px", height: "9px", borderRadius: "50%",
                          background: statusColor(emp.status),
                          border: "2px solid #0d0d0d",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "#fff", fontSize: "13px", fontWeight: 500, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {emp.full_name}
                      </p>
                      <p style={{ color: "#555", fontSize: "11px", margin: 0, textTransform: "capitalize" }}>
                        {emp.role} · {emp.activity_count} actions
                      </p>
                    </div>
                    <span
                      style={{
                        color: statusColor(emp.status),
                        fontSize: "10px", textTransform: "capitalize",
                        background: `${statusColor(emp.status)}18`,
                        padding: "2px 8px", borderRadius: "10px",
                        flexShrink: 0,
                      }}
                    >
                      {emp.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Log */}
          <div>
            {/* Controls */}
            <div
              style={{
                background: "#111", border: "1px solid #222", borderRadius: "12px",
                padding: "16px 20px", marginBottom: "16px",
                display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap",
              }}
            >
              <div style={{ position: "relative", flex: 1, minWidth: "180px" }}>
                <Search size={14} color="#555" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: "32px", background: "#0d0d0d", border: "1px solid #222", color: "#fff" }}
                />
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {modules.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedModule(m)}
                    style={{
                      padding: "6px 14px", borderRadius: "8px", fontSize: "12px",
                      cursor: "pointer", border: "none", textTransform: "capitalize",
                      background: selectedModule === m ? "#eab308" : "#1a1a1a",
                      color: selectedModule === m ? "#000" : "#888",
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
                {["today", "week", "month"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setDateRange(r)}
                    style={{
                      padding: "6px 12px", borderRadius: "8px", fontSize: "12px",
                      cursor: "pointer", border: "none", textTransform: "capitalize",
                      background: dateRange === r ? "#222" : "transparent",
                      color: dateRange === r ? "#eab308" : "#666",
                    }}
                  >
                    {r}
                  </button>
                ))}
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
              </div>
            </div>

            {/* Log List */}
            <div
              style={{
                background: "#111", border: "1px solid #222", borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "16px 20px", borderBottom: "1px solid #111",
                      display: "flex", gap: "12px", alignItems: "center",
                    }}
                  >
                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#1a1a1a" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: "12px", background: "#1a1a1a", borderRadius: "3px", width: "40%", marginBottom: "6px" }} />
                      <div style={{ height: "10px", background: "#151515", borderRadius: "3px", width: "60%" }} />
                    </div>
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px", color: "#555" }}>
                  <Activity size={32} color="#333" style={{ margin: "0 auto 12px", display: "block" }} />
                  No activity logs found
                </div>
              ) : (
                filtered.map((log, i) => (
                  <div
                    key={log.id}
                    style={{
                      padding: "14px 20px",
                      borderBottom: i < filtered.length - 1 ? "1px solid #111" : "none",
                      display: "flex", gap: "14px", alignItems: "flex-start",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#141414")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div
                      style={{
                        width: "36px", height: "36px", borderRadius: "8px",
                        background: `${moduleColor(log.module)}15`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginTop: "2px",
                      }}
                    >
                      <Activity size={15} color={moduleColor(log.module)} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ color: "#fff", fontSize: "13px", fontWeight: 500 }}>
                          {log.employee_name || "Unknown"}
                        </span>
                        <span
                          style={{
                            background: `${moduleColor(log.module)}20`,
                            color: moduleColor(log.module),
                            padding: "1px 8px", borderRadius: "10px",
                            fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.3px",
                          }}
                        >
                          {log.module}
                        </span>
                        <span style={{ color: "#eab308", fontSize: "12px" }}>{log.action}</span>
                      </div>
                      <p style={{ color: "#666", fontSize: "12px", margin: "3px 0 0" }}>
                        {log.description || "No description"}
                      </p>
                      <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                        {log.ip_address && (
                          <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#555", fontSize: "11px" }}>
                            <MapPin size={10} /> {log.ip_address}
                          </span>
                        )}
                        {log.device_type && (
                          <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#555", fontSize: "11px" }}>
                            {log.device_type === "mobile" ? <Smartphone size={10} /> : <Monitor size={10} />}
                            {log.device_type}
                          </span>
                        )}
                      </div>
                    </div>
                    <span style={{ color: "#444", fontSize: "11px", flexShrink: 0, whiteSpace: "nowrap" }}>
                      {timeAgo(log.created_at)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}