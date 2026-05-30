import { PageHeader } from "@/components/shared/PageHeader";
import { Section } from "@/components/shared/FormShell";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, differenceInDays, addDays, parseISO, startOfMonth } from "date-fns";
import { Loader2, Fingerprint, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EsslUploader } from "./EsslUploader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const generateDateArray = (startStr: string, endStr: string) => {
  try {
    const start = parseISO(startStr);
    const end = parseISO(endStr);
    const daysCount = differenceInDays(end, start) + 1;
    if (daysCount <= 0 || daysCount > 100) return [];
    return Array.from({ length: daysCount }, (_, i) => {
      return format(addDays(start, i), 'yyyy-MM-dd');
    });
  } catch (e) {
    return [];
  }
};

export default function Attendance() {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, any>>({});
  const [myTodayStatus, setMyTodayStatus] = useState<any>(null);
  const [punching, setPunching] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Dynamic Date States
  const [startDate, setStartDate] = useState(() => format(subDays(new Date(), 13), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [preset, setPreset] = useState("14days");

  const daysInRange = useMemo(() => {
    return generateDateArray(startDate, endDate);
  }, [startDate, endDate]);

  const loadData = async (startVal: string, endVal: string) => {
    setLoading(true);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);

    // Fetch approved profiles
    const { data: profiles, error: profErr } = await supabase
      .from('profiles')
      .select('id, full_name, requested_role, company_id, biometric_id')
      .eq('status', 'approved')
      .order('full_name');

    if (profErr) {
      toast.error("Failed to load employees");
      setLoading(false);
      return;
    }

    setEmployees(profiles || []);
    
    const myProfile = profiles?.find(p => p.id === user?.id);
    if (myProfile?.company_id) setCompanyId(myProfile.company_id);

    // Fetch attendance logs within dynamic range
    const { data: logs, error: logsErr } = await supabase
      .from('attendance_logs')
      .select('*')
      .gte('date', startVal)
      .lte('date', endVal);

    if (!logsErr && logs) {
      const grouped: Record<string, any> = {};
      logs.forEach(log => {
        if (!grouped[log.employee_id]) grouped[log.employee_id] = {};
        grouped[log.employee_id][log.date] = log;
        
        // Check my status today
        if (log.employee_id === user?.id && log.date === format(new Date(), 'yyyy-MM-dd')) {
          setMyTodayStatus(log);
        }
      });
      setAttendanceData(grouped);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadData(startDate, endDate);

    // Subscribe to realtime updates on attendance_logs
    const channel = supabase
      .channel('attendance-logs-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance_logs' },
        () => {
          loadData(startDate, endDate);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [startDate, endDate]);

  const handlePresetChange = (value: string) => {
    if (value === "custom") {
      setPreset(value);
      return;
    }
    setPreset(value);
    const today = new Date();
    let newStart = subDays(today, 13);
    let newEnd = today;

    if (value === "today") {
      newStart = today;
      newEnd = today;
    } else if (value === "yesterday") {
      newStart = subDays(today, 1);
      newEnd = subDays(today, 1);
    } else if (value === "7days") {
      newStart = subDays(today, 6);
      newEnd = today;
    } else if (value === "14days") {
      newStart = subDays(today, 13);
      newEnd = today;
    } else if (value === "30days") {
      newStart = subDays(today, 29);
      newEnd = today;
    } else if (value === "this_month") {
      newStart = startOfMonth(today);
      newEnd = today;
    }

    setStartDate(format(newStart, 'yyyy-MM-dd'));
    setEndDate(format(newEnd, 'yyyy-MM-dd'));
  };

  const handleStartDateChange = (val: string) => {
    if (!val) return;
    setPreset("custom");
    
    try {
      const start = parseISO(val);
      const end = parseISO(endDate);
      const diff = differenceInDays(end, start);
      if (diff < 0) {
        setStartDate(val);
        setEndDate(val);
      } else if (diff >= 31) {
        toast.warning("Date range limited to maximum 31 days. Adjusted End Date.");
        setStartDate(val);
        setEndDate(format(addDays(start, 30), 'yyyy-MM-dd'));
      } else {
        setStartDate(val);
      }
    } catch (e) {
      setStartDate(val);
    }
  };

  const handleEndDateChange = (val: string) => {
    if (!val) return;
    setPreset("custom");

    try {
      const start = parseISO(startDate);
      const end = parseISO(val);
      const diff = differenceInDays(end, start);
      if (diff < 0) {
        setEndDate(val);
        setStartDate(val);
      } else if (diff >= 31) {
        toast.warning("Date range limited to maximum 31 days. Adjusted Start Date.");
        setEndDate(val);
        setStartDate(format(subDays(end, 30), 'yyyy-MM-dd'));
      } else {
        setEndDate(val);
      }
    } catch (e) {
      setEndDate(val);
    }
  };

  const handlePunch = async () => {
    if (!userId || !companyId) return toast.error("User or Company ID missing");
    
    setPunching(true);
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    try {
      if (!myTodayStatus) {
        // Punch In
        const { error } = await supabase.from('attendance_logs').insert({
          employee_id: userId,
          company_id: companyId,
          date: todayStr,
          status: 'present',
          clock_in: new Date().toISOString()
        });
        if (error) throw error;
        toast.success("Successfully Punched In!");
      } else if (!myTodayStatus.clock_out) {
        // Punch Out
        const { error } = await supabase.from('attendance_logs').update({
          clock_out: new Date().toISOString()
        }).eq('id', myTodayStatus.id);
        if (error) throw error;
        toast.success("Successfully Punched Out!");
      }
      await loadData(startDate, endDate); // Reload
    } catch (e: any) {
      toast.error(e.message || "Failed to record attendance");
    } finally {
      setPunching(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in zoom-in duration-300">
      <PageHeader 
        title="Attendance" 
        description="Track team presence and punch in for the day" 
        breadcrumbs={[{ label: "Employees" }, { label: "Attendance" }]} 
        actions={<EsslUploader employees={employees} onUploadComplete={() => loadData(startDate, endDate)} />}
      />
      
      {/* Date Range Selector Toolbar */}
      <div className="flex flex-wrap items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Presets:</span>
          <Select value={preset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-[140px] h-9 bg-background">
              <SelectValue placeholder="Select preset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="14days">Last 14 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">From:</span>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-[140px] h-9 bg-background text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">To:</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="w-[140px] h-9 bg-background text-sm"
            />
          </div>
        </div>
      </div>

      {/* Live Team Presence Dashboard */}
      <div className="space-y-3 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Team Presence ({endDate === format(new Date(), 'yyyy-MM-dd') ? 'Today' : format(parseISO(endDate), 'MMM dd, yyyy')})
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Biometric punch status of employees for {endDate === format(new Date(), 'yyyy-MM-dd') ? 'today' : format(parseISO(endDate), 'MMM dd, yyyy')}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading status...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {employees.map((emp) => {
              const todayStr = endDate;
              const log = attendanceData[emp.id]?.[todayStr];
              
              let statusBadge = (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                  Not Synced
                </span>
              );
              
              if (log) {
                if (log.clock_out) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      Punched Out
                    </span>
                  );
                } else if (log.clock_in) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-pulse">
                      Punched In
                    </span>
                  );
                }
              }

              const initials = emp.full_name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase() || "?";

              return (
                <div key={emp.id} className="bg-background hover:bg-muted/10 transition-all duration-300 p-4 rounded-lg border flex flex-col justify-between space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold truncate text-foreground">{emp.full_name}</h4>
                      <p className="text-[10px] text-muted-foreground truncate capitalize">
                        {emp.requested_role?.replace('_', ' ') || 'Employee'}
                        {emp.biometric_id && ` • Bio ID: ${emp.biometric_id}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-border/50 flex flex-col space-y-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {statusBadge}
                    </div>
                    {log?.clock_in && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">In:</span>
                        <span className="font-medium text-foreground">{format(new Date(log.clock_in), 'hh:mm a')}</span>
                      </div>
                    )}
                    {log?.clock_out && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Out:</span>
                        <span className="font-medium text-foreground">{format(new Date(log.clock_out), 'hh:mm a')}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {employees.length === 0 && (
              <div className="col-span-full text-center py-6 text-xs text-muted-foreground border border-dashed rounded-lg">
                No employees available.
              </div>
            )}
          </div>
        )}
      </div>

      <Section>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading records...
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left text-xs uppercase font-medium text-muted-foreground px-3 py-2">Employee</th>
                {daysInRange.map((dateStr) => (
                  <th key={dateStr} className="text-center text-xs font-medium text-muted-foreground px-1 py-2">
                    {format(parseISO(dateStr), 'dd')}
                  </th>
                ))}
                <th className="text-right text-xs uppercase font-medium text-muted-foreground px-3 py-2">%</th>
              </tr></thead>
              <tbody>
                {employees.map((e) => {
                  const empLogs = attendanceData[e.id] || {};
                  
                  let presentCount = 0;
                  const dayElements = daysInRange.map(dateStr => {
                    const log = empLogs[dateStr];
                    const status = log?.status;
                    
                    if (status === 'present') { presentCount += 1; }
                    else if (status === 'half_day') { presentCount += 0.5; }

                    const clockInStr = log?.clock_in ? format(new Date(log.clock_in), 'hh:mm a') : null;
                    const clockOutStr = log?.clock_out ? format(new Date(log.clock_out), 'hh:mm a') : null;
                    const tooltip = status 
                      ? `${format(parseISO(dateStr), 'MMM dd')} - ${status.toUpperCase()}\nIn: ${clockInStr || '--:--'}\nOut: ${clockOutStr || '--:--'}`
                      : `${format(parseISO(dateStr), 'MMM dd')}: No Record`;

                    return (
                      <td key={dateStr} className="text-center px-1 py-1.5" title={tooltip}>
                        {log ? (
                          <div className="inline-flex flex-col items-center justify-center gap-0.5 min-w-[65px] py-1 px-1.5 rounded bg-muted/40 border border-border/40 text-[9px] font-medium leading-none">
                            {clockInStr ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{clockInStr}</span>
                            ) : (
                              <span className="text-muted-foreground/40">--:--</span>
                            )}
                            {clockOutStr ? (
                              <span className="text-blue-600 dark:text-blue-400 font-semibold">{clockOutStr}</span>
                            ) : (
                              <span className="text-muted-foreground/40">--:--</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/30 text-xs font-normal">—</span>
                        )}
                      </td>
                    );
                  });

                  const pct = daysInRange.length > 0 ? Math.round((presentCount / daysInRange.length) * 100) : 0;

                  return (
                    <tr key={e.id} className="border-b last:border-0 border-border hover:bg-muted/30">
                      <td className="px-3 py-2 min-w-[200px]">
                        <div className="text-sm font-medium">{e.full_name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground capitalize">{e.requested_role?.replace('_', ' ') || "Employee"}</div>
                      </td>
                      {dayElements}
                      <td className="text-right px-3 py-2 tabular-nums font-medium">{pct}%</td>
                    </tr>
                  );
                })}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={daysInRange.length + 2} className="text-center py-8 text-muted-foreground">No approved employees found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </Section>
    </div>
  );
}
