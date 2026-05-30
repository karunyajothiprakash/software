import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  TrendingUp, TrendingDown, Target, Award,
  BarChart2, Users, DollarSign, Activity,
  Calendar, RefreshCw, ChevronUp, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

interface PerformanceMetric {
  employee_id: string;
  employee_name: string;
  role: string;
  leads_assigned: number;
  leads_converted: number;
  quotations_sent: number;
  deals_closed: number;
  revenue_generated: number;
  conversion_rate: number;
  avg_deal_size: number;
  activities_count: number;
}

interface MonthlyData {
  month: string;
  leads: number;
  converted: number;
  revenue: number;
}

export default function Performance() {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [sortField, setSortField] = useState<keyof PerformanceMetric>("revenue_generated");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchPerformanceData();
  }, [profile, period]);

  const fetchPerformanceData = async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const now = new Date();
      let fromDate = new Date();
      if (period === "month") fromDate.setMonth(now.getMonth() - 1);
      else if (period === "quarter") fromDate.setMonth(now.getMonth() - 3);
      else fromDate.setFullYear(now.getFullYear() - 1);

      const [empRes, leadsRes, quotRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, role").eq("company_id", profile.company_id),
        supabase.from("crm_leads").select("*").eq("company_id", profile.company_id).gte("created_at", fromDate.toISOString()),
        supabase.from("quotations").select("*").eq("company_id", profile.company_id).gte("created_at", fromDate.toISOString()),
      ]);

      const employees = empRes.data || [];
      const leads = leadsRes.data || [];
      const quotations = quotRes.data || [];

      const perf: PerformanceMetric[] = employees.map((emp: any) => {
        const empLeads = leads.filter((l: any) => l.assigned_to === emp.id);
        const empConverted = empLeads.filter((l: any) => l.status === "won" || l.status === "converted");
        const empQuotations = quotations.filter((q: any) => q.created_by === emp.id);
        const empDeals = empQuotations.filter((q: any) => q.status === "approved");
        const revenue = empDeals.reduce((s: number, q: any) => s + (q.total_amount || 0), 0);
        return {
          employee_id: emp.id,
          employee_name: emp.full_name,
          role: emp.role,
          leads_assigned: empLeads.length,
          leads_converted: empConverted.length,
          quotations_sent: empQuotations.length,
          deals_closed: empDeals.length,
          revenue_generated: revenue,
          conversion_rate: empLeads.length > 0 ? Math.round((empConverted.length / empLeads.length) * 100) : 0,
          avg_deal_size: empDeals.length > 0 ? Math.round(revenue / empDeals.length) : 0,
          activities_count: 0,
        };
      });

      setMetrics(perf);

      // Build monthly chart data
      const months: MonthlyData[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const label = d.toLocaleString("default", { month: "short" });
        const mLeads = leads.filter((l: any) => {
          const ld = new Date(l.created_at);
          return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
        });
        const mConverted = mLeads.filter((l: any) => l.status === "won" || l.status === "converted");
        const mRevenue = quotations
          .filter((q: any) => {
            const qd = new Date(q.created_at);
            return qd.getMonth() === d.getMonth() && qd.getFullYear() === d.getFullYear() && q.status === "approved";
          })
          .reduce((s: number, q: any) => s + (q.total_amount || 0), 0);
        months.push({ month: label, leads: mLeads.length, converted: mConverted.length, revenue: mRevenue });
      }
      setMonthlyData(months);
    } catch (err) {
      toast.error("Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  const sorted = [...metrics].sort((a, b) => {
    const av = a[sortField] as number;
    const bv = b[sortField] as number;
    return sortDir === "desc" ? bv - av : av - bv;
  });

  const handleSort = (field: keyof PerformanceMetric) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const totals = metrics.reduce(
    (acc, m) => ({
      leads: acc.leads + m.leads_assigned,
      converted: acc.converted + m.leads_converted,
      revenue: acc.revenue + m.revenue_generated,
      deals: acc.deals + m.deals_closed,
    }),
    { leads: 0, converted: 0, revenue: 0, deals: 0 }
  );

  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1);
  const maxLeads = Math.max(...monthlyData.map((m) => m.leads), 1);

  const rankColor = (i: number) => {
    if (i === 0) return "#eab308";
    if (i === 1) return "#aaa";
    if (i === 2) return "#cd7f32";
    return "#555";
  };

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>
      <PageHeader title="Performance Analytics" subtitle="Track team KPIs, conversion rates, and revenue metrics" />

      <div style={{ padding: "24px" }}>
        {/* Period Selector */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {(["month", "quarter", "year"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: "8px 20px", borderRadius: "8px", fontSize: "13px",
                  cursor: "pointer", border: "none", textTransform: "capitalize",
                  background: period === p ? "#eab308" : "#111",
                  color: period === p ? "#000" : "#888", fontWeight: period === p ? 600 : 400,
                  border: period === p ? "none" : "1px solid #222",
                }}
              >
                This {p}
              </button>
            ))}
          </div>
          <button
            onClick={fetchPerformanceData}
            style={{
              width: "36px", height: "36px", borderRadius: "8px",
              background: "#111", border: "1px solid #222", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <RefreshCw size={14} color="#888" />
          </button>
        </div>

        {/* Summary Cards */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total Leads", value: totals.leads, icon: Users, color: "#3b82f6", sub: "assigned this period" },
            { label: "Converted", value: totals.converted, icon: Target, color: "#22c55e", sub: "leads converted" },
            { label: "Revenue", value: `$${(totals.revenue / 1000).toFixed(1)}K`, icon: DollarSign, color: "#eab308", sub: "total generated" },
            { label: "Deals Closed", value: totals.deals, icon: Award, color: "#a855f7", sub: "approved deals" },
          ].map((c) => (
            <div
              key={c.label}
              style={{
                flex: 1, background: "#111", border: "1px solid #222",
                borderRadius: "12px", padding: "20px 24px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <p style={{ color: "#666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>{c.label}</p>
                <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: `${c.color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <c.icon size={16} color={c.color} />
                </div>
              </div>
              <p style={{ color: "#fff", fontSize: "28px", fontWeight: 700, margin: "0 0 4px" }}>{c.value}</p>
              <p style={{ color: "#555", fontSize: "11px", margin: 0 }}>{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Chart + Leaderboard */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", marginBottom: "24px" }}>
          {/* Bar Chart */}
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: "12px", padding: "24px" }}>
            <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: 600, margin: "0 0 4px" }}>Monthly Trend</h3>
            <p style={{ color: "#666", fontSize: "12px", margin: "0 0 24px" }}>Lead generation and conversion over 6 months</p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", height: "180px" }}>
              {monthlyData.map((m, i) => (
                <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%" }}>
                  <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end", gap: "4px" }}>
                    <div
                      style={{
                        flex: 1, borderRadius: "4px 4px 0 0",
                        background: "rgba(59,130,246,0.6)",
                        height: `${Math.max((m.leads / maxLeads) * 100, 2)}%`,
                        transition: "height 0.5s ease",
                      }}
                      title={`Leads: ${m.leads}`}
                    />
                    <div
                      style={{
                        flex: 1, borderRadius: "4px 4px 0 0",
                        background: "rgba(34,197,94,0.7)",
                        height: `${Math.max((m.converted / maxLeads) * 100, 2)}%`,
                        transition: "height 0.5s ease",
                      }}
                      title={`Converted: ${m.converted}`}
                    />
                  </div>
                  <span style={{ color: "#555", fontSize: "10px" }}>{m.month}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
              {[{ label: "Leads", color: "rgba(59,130,246,0.6)" }, { label: "Converted", color: "rgba(34,197,94,0.7)" }].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: l.color }} />
                  <span style={{ color: "#666", fontSize: "11px" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: "12px", padding: "24px" }}>
            <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: 600, margin: "0 0 4px" }}>Top Performers</h3>
            <p style={{ color: "#666", fontSize: "12px", margin: "0 0 20px" }}>Ranked by revenue generated</p>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} style={{ height: "52px", background: "#1a1a1a", borderRadius: "8px", marginBottom: "8px" }} />
              ))
            ) : sorted.slice(0, 5).map((emp, i) => (
              <div
                key={emp.employee_id}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px 12px", borderRadius: "8px",
                  background: i === 0 ? "rgba(234,179,8,0.06)" : "#0d0d0d",
                  border: i === 0 ? "1px solid rgba(234,179,8,0.2)" : "1px solid #151515",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: rankColor(i), fontSize: "16px", fontWeight: 700, width: "20px", textAlign: "center" }}>
                  {i + 1}
                </span>
                <div
                  style={{
                    width: "34px", height: "34px", borderRadius: "50%",
                    background: "#1a1a1a", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "12px", fontWeight: 700,
                    color: rankColor(i), flexShrink: 0,
                  }}
                >
                  {emp.employee_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "#fff", fontSize: "13px", fontWeight: 500, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {emp.employee_name}
                  </p>
                  <p style={{ color: "#555", fontSize: "10px", margin: 0 }}>
                    {emp.deals_closed} deals · {emp.conversion_rate}% rate
                  </p>
                </div>
                <span style={{ color: "#eab308", fontSize: "13px", fontWeight: 600 }}>
                  ${(emp.revenue_generated / 1000).toFixed(1)}K
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Table */}
        <div style={{ background: "#111", border: "1px solid #222", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #1a1a1a" }}>
            <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: 600, margin: 0 }}>Detailed Performance</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                  {[
                    { label: "Employee", field: null },
                    { label: "Leads", field: "leads_assigned" },
                    { label: "Converted", field: "leads_converted" },
                    { label: "Quotations", field: "quotations_sent" },
                    { label: "Deals", field: "deals_closed" },
                    { label: "Conv. Rate", field: "conversion_rate" },
                    { label: "Revenue", field: "revenue_generated" },
                    { label: "Avg Deal", field: "avg_deal_size" },
                  ].map((h) => (
                    <th
                      key={h.label}
                      onClick={() => h.field && handleSort(h.field as keyof PerformanceMetric)}
                      style={{
                        padding: "12px 16px", textAlign: "left",
                        color: sortField === h.field ? "#eab308" : "#555",
                        fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px",
                        cursor: h.field ? "pointer" : "default", userSelect: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        {h.label}
                        {sortField === h.field && (sortDir === "desc" ? <ChevronDown size={12} /> : <ChevronUp size={12} />)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #111" }}>
                      {[...Array(8)].map((_, j) => (
                        <td key={j} style={{ padding: "14px 16px" }}>
                          <div style={{ height: "12px", background: "#1a1a1a", borderRadius: "3px", width: "70%" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : sorted.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#555" }}>
                      No performance data found
                    </td>
                  </tr>
                ) : (
                  sorted.map((m, i) => (
                    <tr
                      key={m.employee_id}
                      style={{ borderBottom: "1px solid #111" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#141414")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "32px", height: "32px", borderRadius: "50%",
                              background: "#1a1a1a", display: "flex", alignItems: "center",
                              justifyContent: "center", fontSize: "11px", fontWeight: 700,
                              color: rankColor(i),
                            }}
                          >
                            {m.employee_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p style={{ color: "#fff", fontSize: "13px", fontWeight: 500, margin: 0 }}>{m.employee_name}</p>
                            <p style={{ color: "#555", fontSize: "11px", margin: 0, textTransform: "capitalize" }}>{m.role}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", color: "#aaa", fontSize: "13px" }}>{m.leads_assigned}</td>
                      <td style={{ padding: "14px 16px", color: "#22c55e", fontSize: "13px" }}>{m.leads_converted}</td>
                      <td style={{ padding: "14px 16px", color: "#aaa", fontSize: "13px" }}>{m.quotations_sent}</td>
                      <td style={{ padding: "14px 16px", color: "#aaa", fontSize: "13px" }}>{m.deals_closed}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ flex: 1, height: "4px", background: "#1a1a1a", borderRadius: "2px", maxWidth: "60px" }}>
                            <div
                              style={{
                                width: `${m.conversion_rate}%`, height: "100%",
                                background: m.conversion_rate > 50 ? "#22c55e" : m.conversion_rate > 25 ? "#eab308" : "#ef4444",
                                borderRadius: "2px",
                              }}
                            />
                          </div>
                          <span style={{ color: "#aaa", fontSize: "12px" }}>{m.conversion_rate}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", color: "#eab308", fontSize: "13px", fontWeight: 600 }}>
                        ${m.revenue_generated.toLocaleString()}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#aaa", fontSize: "13px" }}>
                        ${m.avg_deal_size.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}