import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  FileBarChart, Download, Calendar, RefreshCw,
  TrendingUp, DollarSign, Users, FileText,
  Filter, ChevronDown, Printer, Share2,
} from "lucide-react";
import { toast } from "sonner";

interface ReportSummary {
  total_leads: number;
  converted_leads: number;
  total_quotations: number;
  approved_quotations: number;
  total_invoices: number;
  total_revenue: number;
  avg_deal_value: number;
  win_rate: number;
}

interface ReportRow {
  period: string;
  leads: number;
  converted: number;
  quotations: number;
  revenue: number;
  win_rate: number;
}

export default function Reports() {
  const { profile } = useAuth();
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<"sales" | "leads" | "export">("sales");
  const [period, setPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchReports();
  }, [profile, reportType, period, year]);

  const fetchReports = async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const [leadsRes, quotRes, invRes] = await Promise.all([
        supabase.from("crm_leads").select("*").eq("company_id", profile.company_id),
        supabase.from("quotations").select("*").eq("company_id", profile.company_id),
        supabase.from("commercial_invoices").select("*").eq("company_id", profile.company_id),
      ]);

      const leads = leadsRes.data || [];
      const quotations = quotRes.data || [];
      const invoices = invRes.data || [];

      const converted = leads.filter((l) => l.status === "won" || l.status === "converted");
      const approvedQ = quotations.filter((q) => q.status === "approved");
      const totalRevenue = invoices.reduce((s, i) => s + (i.total_amount || 0), 0);
      const avgDeal = approvedQ.length > 0
        ? approvedQ.reduce((s, q) => s + (q.total_amount || 0), 0) / approvedQ.length
        : 0;

      setSummary({
        total_leads: leads.length,
        converted_leads: converted.length,
        total_quotations: quotations.length,
        approved_quotations: approvedQ.length,
        total_invoices: invoices.length,
        total_revenue: totalRevenue,
        avg_deal_value: avgDeal,
        win_rate: leads.length > 0 ? Math.round((converted.length / leads.length) * 100) : 0,
      });

      // Build period rows
      const periodCount = period === "monthly" ? 12 : period === "quarterly" ? 4 : 5;
      const generatedRows: ReportRow[] = [];

      for (let i = 0; i < periodCount; i++) {
        let label = "";
        let fromDate = new Date();
        let toDate = new Date();

        if (period === "monthly") {
          const d = new Date(year, i, 1);
          label = d.toLocaleString("default", { month: "long" });
          fromDate = new Date(year, i, 1);
          toDate = new Date(year, i + 1, 0);
        } else if (period === "quarterly") {
          label = `Q${i + 1} ${year}`;
          fromDate = new Date(year, i * 3, 1);
          toDate = new Date(year, i * 3 + 3, 0);
        } else {
          const y = year - 4 + i;
          label = `${y}`;
          fromDate = new Date(y, 0, 1);
          toDate = new Date(y, 11, 31);
        }

        const pLeads = leads.filter((l) => {
          const d = new Date(l.created_at);
          return d >= fromDate && d <= toDate;
        });
        const pConverted = pLeads.filter((l) => l.status === "won" || l.status === "converted");
        const pQuotations = quotations.filter((q) => {
          const d = new Date(q.created_at);
          return d >= fromDate && d <= toDate;
        });
        const pRevenue = invoices
          .filter((inv) => {
            const d = new Date(inv.created_at);
            return d >= fromDate && d <= toDate;
          })
          .reduce((s, inv) => s + (inv.total_amount || 0), 0);

        generatedRows.push({
          period: label,
          leads: pLeads.length,
          converted: pConverted.length,
          quotations: pQuotations.length,
          revenue: pRevenue,
          win_rate: pLeads.length > 0 ? Math.round((pConverted.length / pLeads.length) * 100) : 0,
        });
      }

      setRows(generatedRows);
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const headers = ["Period", "Leads", "Converted", "Quotations", "Revenue", "Win Rate"];
    const csvRows = rows.map((r) =>
      [r.period, r.leads, r.converted, r.quotations, r.revenue, `${r.win_rate}%`].join(",")
    );
    const csv = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${reportType}_${period}_${year}.csv`;
    a.click();
    toast.success("Report exported");
  };

  const maxRevenue = Math.max(...rows.map((r) => r.revenue), 1);

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>
      <PageHeader title="Reports" subtitle="Generate and export sales, lead, and export performance reports" />

      <div style={{ padding: "24px" }}>
        {/* Controls Bar */}
        <div
          style={{
            background: "#111", border: "1px solid #222", borderRadius: "12px",
            padding: "16px 20px", marginBottom: "24px",
            display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: "6px" }}>
            {(["sales", "leads", "export"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setReportType(t)}
                style={{
                  padding: "8px 16px", borderRadius: "8px", fontSize: "13px",
                  cursor: "pointer", border: reportType === t ? "none" : "1px solid #222",
                  background: reportType === t ? "#eab308" : "#1a1a1a",
                  color: reportType === t ? "#000" : "#888",
                  fontWeight: reportType === t ? 600 : 400, textTransform: "capitalize",
                }}
              >
                {t} Report
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {(["monthly", "quarterly", "yearly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: "6px 14px", borderRadius: "8px", fontSize: "12px",
                  cursor: "pointer", border: period === p ? "none" : "1px solid #222",
                  background: period === p ? "#222" : "transparent",
                  color: period === p ? "#eab308" : "#666",
                  textTransform: "capitalize",
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            style={{
              padding: "6px 12px", background: "#1a1a1a", border: "1px solid #222",
              color: "#888", borderRadius: "8px", fontSize: "12px", cursor: "pointer",
            }}
          >
            {[2022, 2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
            <button
              onClick={fetchReports}
              style={{
                width: "36px", height: "36px", borderRadius: "8px",
                background: "#1a1a1a", border: "1px solid #222", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <RefreshCw size={14} color="#888" />
            </button>
            <Button
              onClick={handleExport}
              style={{ background: "#eab308", color: "#000", fontWeight: 600 }}
            >
              <Download size={14} /> Export CSV
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
            {[
              { label: "Total Leads", value: summary.total_leads, sub: `${summary.converted_leads} converted`, icon: Users, color: "#3b82f6" },
              { label: "Quotations", value: summary.total_quotations, sub: `${summary.approved_quotations} approved`, icon: FileText, color: "#eab308" },
              { label: "Win Rate", value: `${summary.win_rate}%`, sub: "lead conversion", icon: TrendingUp, color: "#22c55e" },
              { label: "Total Revenue", value: `$${(summary.total_revenue / 1000).toFixed(1)}K`, sub: `avg $${(summary.avg_deal_value / 1000).toFixed(1)}K/deal`, icon: DollarSign, color: "#a855f7" },
            ].map((c) => (
              <div key={c.label} style={{ flex: 1, background: "#111", border: "1px solid #222", borderRadius: "12px", padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <p style={{ color: "#666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>{c.label}</p>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${c.color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <c.icon size={15} color={c.color} />
                  </div>
                </div>
                <p style={{ color: "#fff", fontSize: "26px", fontWeight: 700, margin: "0 0 4px" }}>{c.value}</p>
                <p style={{ color: "#555", fontSize: "11px", margin: 0 }}>{c.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Revenue Chart */}
        <div style={{ background: "#111", border: "1px solid #222", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h3 style={{ color: "#fff", fontSize: "15px", fontWeight: 600, margin: "0 0 4px" }}>Revenue Overview</h3>
              <p style={{ color: "#666", fontSize: "12px", margin: 0 }}>Revenue by {period} period</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "160px" }}>
            {rows.map((row, i) => (
              <div key={row.period} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%" }}>
                <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                  <div
                    style={{
                      width: "100%", borderRadius: "4px 4px 0 0",
                      background: row.revenue > 0
                        ? `linear-gradient(to top, #eab308, #eab30880)`
                        : "#1a1a1a",
                      height: `${Math.max((row.revenue / maxRevenue) * 100, row.revenue > 0 ? 4 : 2)}%`,
                      transition: "height 0.6s ease",
                      position: "relative",
                    }}
                    title={`$${row.revenue.toLocaleString()}`}
                  >
                    {row.revenue > 0 && (
                      <div
                        style={{
                          position: "absolute", top: "-20px", left: "50%",
                          transform: "translateX(-50%)",
                          color: "#eab308", fontSize: "9px", whiteSpace: "nowrap",
                        }}
                      >
                        ${(row.revenue / 1000).toFixed(1)}K
                      </div>
                    )}
                  </div>
                </div>
                <span style={{ color: "#555", fontSize: "9px", textAlign: "center" }}>
                  {period === "monthly" ? row.period.slice(0, 3) : row.period}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div style={{ background: "#111", border: "1px solid #222", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ color: "#fff", fontSize: "14px", fontWeight: 600, margin: 0 }}>
              {period.charAt(0).toUpperCase() + period.slice(1)} Breakdown — {year}
            </h3>
            <button
              style={{
                background: "#1a1a1a", border: "1px solid #222", borderRadius: "8px",
                padding: "6px 12px", color: "#888", fontSize: "12px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              <Printer size={12} /> Print
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                {["Period", "Leads", "Converted", "Quotations", "Revenue", "Win Rate"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#555", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #111" }}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} style={{ padding: "12px 16px" }}>
                        <div style={{ height: "12px", background: "#1a1a1a", borderRadius: "3px", width: "60%" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.map((row, i) => (
                <tr
                  key={row.period}
                  style={{ borderBottom: "1px solid #111" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#141414")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 16px", color: "#fff", fontSize: "13px", fontWeight: 500 }}>{row.period}</td>
                  <td style={{ padding: "12px 16px", color: "#aaa", fontSize: "13px" }}>{row.leads}</td>
                  <td style={{ padding: "12px 16px", color: "#22c55e", fontSize: "13px" }}>{row.converted}</td>
                  <td style={{ padding: "12px 16px", color: "#aaa", fontSize: "13px" }}>{row.quotations}</td>
                  <td style={{ padding: "12px 16px", color: "#eab308", fontSize: "13px", fontWeight: 600 }}>
                    {row.revenue > 0 ? `$${row.revenue.toLocaleString()}` : "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "50px", height: "4px", background: "#1a1a1a", borderRadius: "2px" }}>
                        <div
                          style={{
                            width: `${row.win_rate}%`, height: "100%",
                            background: row.win_rate > 50 ? "#22c55e" : row.win_rate > 25 ? "#eab308" : "#ef4444",
                            borderRadius: "2px",
                          }}
                        />
                      </div>
                      <span style={{ color: "#aaa", fontSize: "12px" }}>{row.win_rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}