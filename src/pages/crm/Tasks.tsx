import { useState, useEffect } from "react";
import SectionHeader from "../../components/SectionHeader";
import Card from "@/components/Card";
import { ClipboardList, Plus, Search, CheckCircle2, Circle, Clock, AlertTriangle, User, Tag, ArrowRight, Loader2, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Tasks() {
  const { user, profile: currentUserProfile, roleSlugs } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    assigned_to: "",
    due_date: "",
    client_name: ""
  });
  const [filterMode, setFilterMode] = useState<"all" | "byMe">("all");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [reasonTaskId, setReasonTaskId] = useState<string | null>(null);
  const [reasonText, setReasonText] = useState("");

  const isAdminOrManager = Array.from(roleSlugs).some(role => 
    ["admin", "manager"].includes(role.toLowerCase())
  );

  // 4. Fetch profiles for assignment dropdown (filtered by company_id)
  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles_for_tasks", currentUserProfile?.company_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("company_id", currentUserProfile?.company_id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentUserProfile?.company_id
  });

  // 2. Fetch tasks with assignee and assigner names
  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ["crm_tasks", isAdminOrManager, user?.id],
    queryFn: async () => {
      let query = supabase
        .from("tasks")
        .select("*, assignee:profiles!assigned_to(full_name), assigner:profiles!assigned_by(full_name)")
        .order("created_at", { ascending: false });

      if (!isAdminOrManager) {
        query = query.eq("assigned_to", user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // 7. Real-time task updates
  useEffect(() => {
    const channel = supabase
      .channel("tasks-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // 5. Mark complete
  const markComplete = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .update({ 
        status: "completed",
        updated_at: new Date().toISOString()
      })
      .eq("id", taskId);

    if (error) {
      toast.error("Failed to mark task as completed");
    } else {
      toast.success("Task completed");
      refetch();
    }
  };

  // Delete task 
  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      toast.error("Failed to delete task");
    } else {
      toast.success("Task deleted successfully");
      refetch();
    }
  };

  // 3. Save incomplete reason
  const saveIncompleteReason = async (taskId: string) => {
    if (!reasonText.trim()) {
      toast.error("Please enter a reason");
      return;
    }

    const { error } = await supabase
      .from("tasks")
      .update({ 
        incomplete_reason: reasonText,
        status: "in_progress",
        updated_at: new Date().toISOString()
      })
      .eq("id", taskId);

    if (error) {
      toast.error("Failed to save reason");
    } else {
      toast.success("Incomplete reason saved");
      setReasonTaskId(null);
      setReasonText("");
      refetch();
    }
  };

  // 3. Create task
  const createTaskMutation = useMutation({
    mutationFn: async () => {
      if (!newTask.title) throw new Error("Title is required");
      
      const { error } = await supabase.from("tasks").insert([{
        ...newTask,
        assigned_by: user?.id,
        company_id: currentUserProfile?.company_id,
        status: "pending"
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Task assigned successfully");
      setIsAddingTask(false);
      setNewTask({ title: "", description: "", priority: "medium", assigned_to: "", due_date: "", client_name: "" });
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create task");
    }
  });

  const filteredTasks = tasks.filter((t: any) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.client_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Admin/Manager full visibility filtering
    const matchesFilterMode = !isAdminOrManager || filterMode === "all" || t.assigned_by === user?.id;
    const matchesEmployee = !isAdminOrManager || selectedEmployee === "all" || t.assigned_to === selectedEmployee;
    
    return matchesSearch && matchesFilterMode && matchesEmployee;
  });

  // 6. Stat cards calculations
  const activeTasks = tasks.filter((t: any) => t.status !== "completed").length;
  const highPriorityCount = tasks.filter((t: any) => t.priority === "high" && t.status !== "completed").length;
  const completedTodayCount = tasks.filter((t: any) => {
    const today = new Date().toISOString().split("T")[0];
    const updateDate = t.updated_at ? t.updated_at.split("T")[0] : "";
    return t.status === "completed" && updateDate === today;
  }).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-foreground">
      <SectionHeader
        title="Tasks & Sales Workflows"
        sub="Monitor and assign daily sales tasks and follow-up activities for field executives"
        actions={
          <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
            <DialogTrigger asChild>
              <Button size="sm" className="btn-gold shadow-md">
                <Plus className="h-4 w-4 mr-1.5" /> Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-900 border-border sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Assign New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Task Title</label>
                  <input 
                    className="w-full bg-black/50 border border-border rounded-lg px-3 py-2 text-sm focus:border-primary/50 outline-none"
                    placeholder="Enter task title"
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client Name</label>
                  <input 
                    className="w-full bg-black/50 border border-border rounded-lg px-3 py-2 text-sm focus:border-primary/50 outline-none"
                    placeholder="Enter client name or project"
                    value={newTask.client_name}
                    onChange={e => setNewTask({...newTask, client_name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Task Description</label>
                  <textarea 
                    className="w-full bg-black/50 border border-border rounded-lg px-3 py-2 text-sm focus:border-primary/50 outline-none min-h-[80px]"
                    placeholder="Describe the task details..."
                    value={newTask.description}
                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</label>
                    <select 
                      className="w-full bg-black/50 border border-border rounded-lg px-3 py-2 text-sm focus:border-primary/50 outline-none"
                      value={newTask.priority}
                      onChange={e => setNewTask({...newTask, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Due Date</label>
                    <input 
                      type="date"
                      className="w-full bg-black/50 border border-border rounded-lg px-3 py-2 text-sm focus:border-primary/50 outline-none"
                      value={newTask.due_date}
                      onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assign To</label>
                  <Select 
                    value={newTask.assigned_to} 
                    onValueChange={val => setNewTask({...newTask, assigned_to: val})}
                  >
                    <SelectTrigger className="w-full bg-black/50 border-border h-10 text-sm focus:ring-primary/20">
                      <SelectValue placeholder="Select executive..." />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-border shadow-2xl max-h-[300px]">
                      {profiles.map((p: any) => (
                        <SelectItem 
                          key={p.id} 
                          value={p.id}
                          className="text-sm focus:bg-primary/10 transition-colors"
                        >
                          {p.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full btn-gold" 
                  onClick={() => createTaskMutation.mutate()}
                  disabled={createTaskMutation.isPending}
                >
                  {createTaskMutation.isPending ? "Creating..." : "Assign Task"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 p-5 bg-card/60 backdrop-blur-md">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Active Tasks</div>
            <div className="text-2xl font-bold font-mono mt-0.5">{activeTasks}</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5 bg-card/60 backdrop-blur-md">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">High Priority Tasks</div>
            <div className="text-2xl font-bold font-mono mt-0.5">{highPriorityCount}</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5 bg-card/60 backdrop-blur-md">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Completed Today</div>
            <div className="text-2xl font-bold font-mono mt-0.5">{completedTodayCount}</div>
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-foreground">Task Board</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Assigned workflow queues for your team</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks or clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-neutral-900 border border-border text-foreground focus:outline-hidden focus:border-primary/50 transition-colors"
            />
          </div>
        </div>
        
        {/* 2. Admin/Manager full visibility filter bar */}
        {isAdminOrManager && (
          <div className="flex flex-wrap items-center gap-3 bg-neutral-900/50 p-3 rounded-xl border border-border/50">
            <div className="flex bg-black/40 p-1 rounded-lg border border-border/50 shadow-inner">
              <button
                onClick={() => setFilterMode("all")}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-md transition-all ${filterMode === 'all' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
              >
                All Tasks
              </button>
              <button
                onClick={() => setFilterMode("byMe")}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-md transition-all ${filterMode === 'byMe' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Assigned By Me
              </button>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="h-9 truncate bg-black/40 border-border/50 text-[10px] uppercase tracking-wider font-bold focus:ring-primary/20">
                  <SelectValue placeholder="Filter by Employee" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-border shadow-2xl">
                  <SelectItem value="all" className="text-[10px] uppercase font-bold hover:bg-primary/10">All Employees</SelectItem>
                  {profiles.map((p: any) => (
                    <SelectItem key={p.id} value={p.id} className="text-[10px] uppercase font-bold hover:bg-primary/10">{p.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {filteredTasks.map((t: any) => (
            <div
              key={t.id}
              className={`rounded-xl border transition-all duration-300 flex flex-col overflow-hidden ${
                t.status === "completed"
                  ? "bg-neutral-900/20 border-border/40 opacity-60"
                  : "bg-neutral-900/40 border-border hover:border-primary/20 shadow-sm hover:shadow-primary/5"
              }`}
            >
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <TooltipProvider>
                    <div className="flex flex-col items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (t.status !== "completed" && t.due_date) markComplete(t.id);
                            }}
                            disabled={t.status === "completed" || !t.due_date}
                            className={`mt-0.5 transition-colors focus:outline-hidden ${
                              t.status === "completed" 
                                ? "cursor-default text-emerald-500" 
                                : !t.due_date 
                                ? "text-muted-foreground/30 cursor-not-allowed" 
                                : "text-muted-foreground hover:text-primary"
                            }`}
                          >
                            {t.status === "completed" ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <Circle className="h-5 w-5" />
                            )}
                          </button>
                        </TooltipTrigger>
                        {!t.due_date && t.status !== "completed" && (
                          <TooltipContent className="bg-neutral-900 border-border text-[10px] font-bold">
                            Set a due date to mark complete
                          </TooltipContent>
                        )}
                      </Tooltip>

                      {/* 2. Mark Incomplete button */}
                      {t.status !== 'completed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReasonTaskId(reasonTaskId === t.id ? null : t.id);
                            setReasonText(t.incomplete_reason || "");
                          }}
                          className="text-muted-foreground hover:text-amber-500 transition-colors"
                          title="Mark as Incomplete/Add Reason"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </TooltipProvider>

                  <div className="space-y-1">
                    <div 
                      onClick={() => setExpandedTaskId(expandedTaskId === t.id ? null : t.id)}
                      className={`text-xs font-bold leading-normal cursor-pointer hover:text-primary transition-colors ${t.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}
                    >
                      {t.title}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {t.client_name || "Internal Workspace"}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-primary">To: {t.assignee?.full_name || "Unassigned"}</span>
                    </div>
                    {/* 1. Assigned By label */}
                    <div className="text-[9px] text-muted-foreground opacity-70 ml-5">
                      Assigned by: {t.assigner?.full_name || "System"}
                    </div>
                    
                    {/* 3. Pending/Overdue reason display */}
                    {t.status !== 'completed' && (
                      <div className="text-[9px] text-muted-foreground/70 ml-5 mt-0.5 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {t.due_date ? (
                          new Date(t.due_date) < new Date(new Date().setHours(0,0,0,0)) 
                            ? `Pending since ${new Date(t.due_date).toLocaleDateString()}`
                            : `Due on ${new Date(t.due_date).toLocaleDateString()}`
                        ) : (
                          <span className="text-amber-500/70">No deadline set</span>
                        )}
                      </div>
                    )}
                    
                    {/* 4. Incomplete reason display */}
                    {t.incomplete_reason && (
                      <div className="text-[9px] text-amber-500 font-bold ml-5 mt-1 flex items-start gap-1">
                        <AlertTriangle className="h-2.5 w-2.5 mt-0.5" />
                        <span>Reason: {t.incomplete_reason}</span>
                      </div>
                    )}

                    {/* 3. Completed details */}
                    {t.status === "completed" && (
                      <div className="text-[9px] text-emerald-400/80 ml-5 mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="h-2.5 w-2.5" /> 
                        {t.assignee?.full_name} reached goal on {new Date(t.updated_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  {/* Delete Button (Visible only to Admins/Managers) */}
                  {isAdminOrManager && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button 
                          className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all mr-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-neutral-900 border-border shadow-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-foreground">Delete Task?</AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground text-xs">
                            This will permanently remove the task <strong>"{t.title}"</strong> and all its associated data. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4">
                          <AlertDialogCancel className="bg-neutral-800 border-border text-[10px] uppercase font-bold h-8">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteTask(t.id)}
                            className="bg-red-500 hover:bg-red-600 text-white text-[10px] uppercase font-bold h-8"
                          >
                            Delete Task
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {/* 3. Overdue badge */}
                  {t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date(new Date().setHours(0,0,0,0)) && (
                    <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 text-[8px] px-2 h-5 uppercase font-bold animate-pulse">
                      Overdue
                    </Badge>
                  )}

                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[10px] uppercase ${
                    t.priority === "high"
                      ? "bg-red-500/10 text-red-500 border border-red-500/20"
                      : t.priority === "medium"
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}>
                    {t.priority}
                  </span>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] ${
                    t.status === "completed"
                      ? "bg-neutral-800 text-muted-foreground border border-neutral-700"
                      : "bg-neutral-900 text-muted-foreground border border-border"
                  }`}>
                    {t.due_date ? new Date(t.due_date).toLocaleDateString() : "No deadline"}
                  </span>
                </div>
              </div>

              {/* 2. Inline Reason Input */}
              {reasonTaskId === t.id && (
                <div className="px-11 pb-4 pt-0 animate-in slide-in-from-top-1 duration-200">
                  <div className="bg-black/40 border border-amber-500/20 p-3 rounded-lg space-y-3">
                    <div className="text-[10px] uppercase font-bold text-amber-500/80">Why is this task incomplete?</div>
                    <textarea 
                      className="w-full bg-black/40 border border-border rounded-md p-2 text-xs text-foreground outline-hidden focus:border-amber-500/50 min-h-[60px]"
                      placeholder="Enter the reason why this task cannot be completed yet..."
                      value={reasonText}
                      onChange={(e) => setReasonText(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 text-[10px] text-muted-foreground"
                        onClick={() => setReasonTaskId(null)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-7 text-[10px] bg-amber-500 hover:bg-amber-600 text-black font-bold"
                        onClick={() => saveIncompleteReason(t.id)}
                      >
                        Save Reason
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Task detail expand */}
              {expandedTaskId === t.id && (
                <div className="px-11 pb-5 pt-1 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="h-px bg-border/40 w-full" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Description</div>
                        <p className="text-xs text-foreground/80 leading-relaxed bg-black/20 p-3 rounded-lg border border-border/50">
                          {t.description || "No description provided for this task."}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Client/Project</div>
                          <div className="text-xs font-semibold">{t.client_name || "Internal Workspace"}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Task ID</div>
                          <div className="text-[10px] font-mono text-muted-foreground">{t.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col gap-3 p-3 rounded-lg bg-black/20 border border-border/30 shadow-inner">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-muted-foreground uppercase font-extrabold opacity-60">Assigned To</span>
                          <span className="font-bold text-primary">{t.assignee?.full_name}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-muted-foreground uppercase font-extrabold opacity-60">Assigned By</span>
                          <span className="text-foreground font-medium">{t.assigner?.full_name}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-muted-foreground uppercase font-extrabold opacity-60">Due Date</span>
                          <span className={t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed' ? "text-red-400 font-bold" : "font-medium"}>
                            {t.due_date ? new Date(t.due_date).toLocaleDateString() : "Not Set"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-muted-foreground uppercase font-extrabold opacity-60">Priority</span>
                          <span className={`uppercase font-bold ${t.priority === 'high' ? 'text-red-400' : 'text-foreground'}`}>{t.priority}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-muted-foreground uppercase font-extrabold opacity-60">Status</span>
                          <span className="uppercase font-bold text-muted-foreground">{t.status}</span>
                        </div>
                      </div>

                      {t.status !== "completed" && (
                        <Button 
                          size="sm" 
                          className="w-full btn-gold h-8 text-[10px] uppercase font-bold shadow-lg shadow-amber-500/10"
                          disabled={!t.due_date}
                          onClick={() => markComplete(t.id)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Mark as Completed
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-xs">
              No tasks found matching your filter criteria.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

