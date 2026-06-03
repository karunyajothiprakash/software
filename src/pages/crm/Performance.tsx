import { useState, useMemo, useEffect } from "react";
import SectionHeader from "../../components/SectionHeader";
import Card from "@/components/Card";
import { 
  Users, 
  Phone, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  Download, 
  Loader2, 
  User,
  Calendar,
  BarChart3,
  Trophy,
  Award,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, startOfWeek, startOfMonth, subDays, isAfter, differenceInMinutes } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIsAdminOrManager } from "@/hooks/useAuth";

export default function Performance() {
  const { profile: currentUser, roleSlugs } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editingTarget, setEditingTarget] = useState<string | null>(null);
  const [targetValue, setTargetValue] = useState<string>("");
  const [data, setData] = useState<{
    profiles: any[];
    leads: any[];
    activities: any[];
    followUps: any[];
    quotations: any[];
  } | null>(null);

  const isAdminOrManager = useIsAdminOrManager();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        { data: profiles },
        { data: leads },
        { data: activities },
        { data: followUps },
        { data: quotations },
        { data: userRoles }
      ] = await Promise.all([
        supabase.from("profiles" as any).select("id, full_name, avatar_url, monthly_target"),
        supabase.from("leads" as any).select("id, assigned_to, stage, created_at"),
        supabase.from("activities" as any).select("*"),
        supabase.from("follow_ups" as any).select("id, assigned_to, is_notified, created_at"),
        supabase.from("quotations" as any).select("*"),
        supabase.from("user_roles" as any).select("user_id, roles(name)")
      ]);

      // Manually attach roles to profiles
      const enrichedProfiles = (profiles || []).map((p: any) => {
        const uRole = (userRoles || []).find((ur: any) => ur.user_id === p.id);
        return {
          ...p,
          role_name: (uRole as any)?.roles?.name || "Employee"
        };
      });

      setData({
        profiles: enrichedProfiles,
        leads: (leads || []) as any[],
        activities: (activities || []) as any[],
        followUps: (followUps || []) as any[],
        quotations: (quotations || []) as any[]
      });
    } catch (error: any) {
      toast.error("Failed to load performance data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const performanceStats = useMemo(() => {
    if (!data) return [];

    const { profiles, leads, activities, followUps, quotations } = data;

    const isEmployeeMatch = (dbValue: any, employee: any) => {
      if (!dbValue || !employee) return false;
      const val = String(dbValue).trim().toLowerCase();
      const empId = String(employee.id).trim().toLowerCase();
      const empName = employee.full_name ? String(employee.full_name).trim().toLowerCase() : null;
      
      return val === empId || (empName && val === empName);
    };

    const stats = profiles.filter(p => !['admin', 'manager'].includes(p.role_name.toLowerCase())).map(employee => {
      const role = employee.role_name;
      const employeeLeads = leads.filter(l => isEmployeeMatch(l.assigned_to, employee));
      const employeeLeadIds = new Set(employeeLeads.map(l => l.id));

      const employeeActivities = activities.filter(a => 
        isEmployeeMatch(a.created_by, employee) || 
        (a.lead_id && employeeLeadIds.has(a.lead_id))
      );

      const employeeFollowUps = followUps.filter(f => isEmployeeMatch(f.assigned_to, employee) && f.is_notified);

      const employeeQuotes = quotations.filter(q => 
        isEmployeeMatch(q.created_by, employee) || 
        (q.lead_id && employeeLeadIds.has(q.lead_id))
      );

      const responseTimes: number[] = [];
      const leadsProcessedByEmp = new Set(employeeActivities.filter(a => a.lead_id).map(a => a.lead_id));
      
      leadsProcessedByEmp.forEach(leadId => {
        const lead = leads.find(l => l.id === leadId);
        if (lead && lead.created_at) {
          const empLeadActivities = employeeActivities.filter(a => a.lead_id === leadId);
          const firstActivity = [...empLeadActivities].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )[0];
          
          if (firstActivity) {
            const diff = differenceInMinutes(new Date(firstActivity.created_at), new Date(lead.created_at));
            if (diff >= 0) responseTimes.push(diff);
          }
        }
      });

      const avgMinutes = responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0;

      const formatResponseTime = (mins: number) => {
        if (mins === 0) return "N/A";
        const h = Math.floor(mins / 60);
        const m = Math.round(mins % 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
      };

      const leadsHandled = employeeLeads.length;
      const callsMade = employeeActivities.filter(a => 
        ['call', 'phone'].includes(a.type?.toLowerCase()?.trim())
      ).length;
      const followUpsCompleted = employeeFollowUps.length;
      
      const dealsClosed = employeeLeads.filter(l => 
        ['won', 'closed won', 'closed_won', 'won', 'Closed Won'].includes(l.stage?.toLowerCase()?.trim())
      ).length;
      
      const revenueGenerated = employeeQuotes.reduce((sum, q) => 
        sum + (Number(q.total_amount) || Number(q.amount) || Number(q.total) || 0), 0
      );
      
      const conversionRatio = leadsHandled > 0 
        ? Math.round((dealsClosed / leadsHandled) * 100) 
        : 0;

      return {
        id: employee.id,
        name: employee.full_name || "Unknown",
        role,
        initials: (employee.full_name || "??")
          .split(" ")
          .map(n => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase(),
        leadsHandled,
        callsMade,
        followUpsCompleted,
        dealsClosed,
        revenueGenerated,
        conversionRatio,
        avgResponseTime: formatResponseTime(avgMinutes),
        monthlyTarget: Number(employee.monthly_target) || 0
      };
    });

    const maxLeads = Math.max(...stats.map(s => s.leadsHandled), 0);

    return stats.map(s => ({
      ...s,
      isTopPerformer: maxLeads > 0 && s.leadsHandled === maxLeads
    })).sort((a, b) => b.revenueGenerated - a.revenueGenerated);
  }, [data]);

  const handleUpdateTarget = async (employeeId: string) => {
    const val = parseFloat(targetValue);
    if (isNaN(val)) {
      toast.error("Please enter a valid number");
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles' as any)
        .update({ monthly_target: val } as any)
        .eq('id', employeeId);

      if (error) throw error;
      toast.success("Target updated successfully");
      setEditingTarget(null);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update target");
    }
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error("No data available for this report");
      return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReportDownload = (type: string) => {
    if (!data) return;
    const { profiles, leads, activities, followUps, quotations } = data;
    const today = startOfDay(new Date());

    const getEmployeeName = (dbValue: any) => {
      if (!dbValue) return "Unknown";
      const val = String(dbValue).trim().toLowerCase();
      const matchedProfile = profiles.find(p => 
        String(p.id).toLowerCase() === val || 
        (p.full_name && String(p.full_name).trim().toLowerCase() === val)
      );
      return matchedProfile?.full_name || (dbValue.length > 20 ? "Unknown" : dbValue);
    };

    let reportData: any[] = [];
    let fileName = "";

    switch (type) {
      case 'daily':
        fileName = "Daily_Activity_Report";
        reportData = (activities || [])
          .filter(a => isAfter(new Date(a.created_at), today))
          .map(a => ({
            Employee: getEmployeeName(a.created_by),
            Type: a.type,
            Time: format(new Date(a.created_at), 'hh:mm a')
          }));
        break;

      case 'weekly':
        fileName = "Weekly_Performance_Report";
        reportData = performanceStats.map(s => ({
          Employee: s.name,
          Leads: s.leadsHandled,
          Calls: s.callsMade,
          FollowUps: s.followUpsCompleted,
          Conversion: `${s.conversionRatio}%`
        }));
        break;

      case 'monthly':
        fileName = "Monthly_Sales_Report";
        const firstOfMonth = startOfMonth(new Date());
        reportData = (quotations || [])
          .filter(q => isAfter(new Date(q.created_at), firstOfMonth))
          .map(q => ({
            Employee: getEmployeeName(q.created_by),
            Amount: Number(q.total_amount) || Number(q.amount) || 0,
            Date: format(new Date(q.created_at), 'yyyy-MM-dd')
          }));
        break;

      case 'ranking':
        fileName = "Employee_Ranking_Report";
        reportData = [...performanceStats]
          .sort((a, b) => b.leadsHandled - a.leadsHandled)
          .map((s, idx) => ({
            Rank: idx + 1,
            Employee: s.name,
            Leads_Handled: s.leadsHandled,
            Revenue: `${s.revenueGenerated.toLocaleString()}`
          }));
        break;
    }

    downloadCSV(reportData, fileName);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-foreground pb-10">
      <SectionHeader
        title="Employee Performance Monitoring"
        sub="Measures employee productivity and sales efficiency"
      />

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-[#c8a84b]" />
          <h2 className="text-xl font-bold text-[#c8a84b] uppercase tracking-wider">KPIs</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {performanceStats.map((emp) => (
            <Card key={emp.id} className="relative overflow-hidden bg-neutral-900/40 border border-white/5 group hover:border-[#c8a84b]/30 transition-all p-0">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Trophy className="h-20 w-20 text-[#c8a84b]" />
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="h-14 w-14 shrink-0 rounded-2xl bg-gradient-to-br from-[#c8a84b] to-[#a68a3d] flex items-center justify-center text-black font-black text-xl shadow-lg ring-4 ring-[#c8a84b]/10">
                    {emp.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-white leading-tight truncate">{emp.name}</h3>
                      {emp.isTopPerformer && (
                        <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full">
                          <Trophy className="h-3 w-3 text-amber-500" />
                          <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">Top Performer</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{emp.role}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
                          ACTIVE
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div className="space-y-1">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Leads Handled</div>
                    <div className="text-xl font-black font-mono text-white flex items-center gap-2">
                       <Users className="h-4 w-4 text-blue-400" /> {emp.leadsHandled}
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Calls Made</div>
                    <div className="text-xl font-black font-mono text-white flex items-center gap-2 justify-end">
                       {emp.callsMade} <Phone className="h-4 w-4 text-purple-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Follow-ups</div>
                    <div className="text-xl font-black font-mono text-white flex items-center gap-2">
                       <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {emp.followUpsCompleted}
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Avg Response</div>
                    <div className="text-xl font-black font-mono text-white flex items-center gap-2 justify-end">
                       {emp.avgResponseTime} <Clock className="h-4 w-4 text-blue-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Revenue</div>
                    <div className="text-xl font-black font-mono text-emerald-500 flex items-center gap-2 font-mono">
                       <DollarSign className="h-4 w-4" /> {emp.revenueGenerated.toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Deals Won</div>
                    <div className="text-xl font-black font-mono text-white flex items-center gap-2 justify-end">
                       {emp.dealsClosed} <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                  </div>
                </div>

                {/* Monthly Target Section */}
                <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Monthly Target</div>
                      {editingTarget === emp.id ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number"
                            className="bg-black/40 border border-[#c8a84b] text-white text-sm font-mono px-2 py-1 rounded w-20 outline-none"
                            value={targetValue}
                            autoFocus
                            onChange={(e) => setTargetValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateTarget(emp.id)}
                            onBlur={() => setEditingTarget(null)}
                          />
                          <button onClick={() => handleUpdateTarget(emp.id)} className="text-[#c8a84b] hover:text-white">
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className={cn("text-lg font-black font-mono text-white", isAdminOrManager && "cursor-pointer hover:text-[#c8a84b]")}
                          onClick={() => {
                            if (isAdminOrManager) {
                              setEditingTarget(emp.id);
                              setTargetValue(String(emp.monthlyTarget));
                            }
                          }}
                        >
                          {emp.monthlyTarget} <span className="text-xs text-muted-foreground ml-1">leads</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Achievement</div>
                      <div className="text-lg font-black font-mono text-emerald-400">
                        {emp.monthlyTarget > 0 ? ((emp.leadsHandled / emp.monthlyTarget) * 100).toFixed(0) + '%' : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500/50 to-[#c8a84b] transition-all duration-1000 shadow-[0_0_10px_rgba(200,168,75,0.3)]" 
                      style={{ width: `${Math.min(100, (emp.monthlyTarget > 0 ? (emp.leadsHandled / emp.monthlyTarget) * 100 : 0))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                    <span>Target: {emp.monthlyTarget}</span>
                    <span>Achieved: {emp.leadsHandled}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-6 pt-6 mt-10 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-[#c8a84b]" />
          <h2 className="text-xl font-bold text-[#c8a84b] uppercase tracking-wider">Reports</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            variant="outline" 
            className="h-auto py-6 flex flex-col gap-3 bg-neutral-900/40 border-white/10 hover:border-[#c8a84b] hover:bg-[#c8a84b]/5 text-white transition-all group"
            onClick={() => handleReportDownload('daily')}
          >
            <Calendar className="h-6 w-6 text-blue-400 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <div className="text-xs font-black uppercase tracking-widest">Daily Activity</div>
              <div className="text-[10px] text-muted-foreground mt-1">Today's logs per employee</div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto py-6 flex flex-col gap-3 bg-neutral-900/40 border-white/10 hover:border-[#c8a84b] hover:bg-[#c8a84b]/5 text-white transition-all group"
            onClick={() => handleReportDownload('weekly')}
          >
            <TrendingUp className="h-6 w-6 text-purple-400 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <div className="text-xs font-black uppercase tracking-widest">Weekly Performance</div>
              <div className="text-[10px] text-muted-foreground mt-1">Last 7 days metrics</div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto py-6 flex flex-col gap-3 bg-neutral-900/40 border-white/10 hover:border-[#c8a84b] hover:bg-[#c8a84b]/5 text-white transition-all group"
            onClick={() => handleReportDownload('monthly')}
          >
            <DollarSign className="h-6 w-6 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <div className="text-xs font-black uppercase tracking-widest">Monthly Sales</div>
              <div className="text-[10px] text-muted-foreground mt-1">Revenue generation summary</div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="h-auto py-6 flex flex-col gap-3 bg-neutral-900/40 border-white/10 hover:border-[#c8a84b] hover:bg-[#c8a84b]/5 text-white transition-all group"
            onClick={() => handleReportDownload('ranking')}
          >
            <Award className="h-6 w-6 text-[#c8a84b] group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <div className="text-xs font-black uppercase tracking-widest">Employee Ranking</div>
              <div className="text-[10px] text-muted-foreground mt-1">Leads handled leaderboard</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
