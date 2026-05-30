import { useState } from "react";

const tasks = [
  { id: 1, title: "Follow up with Rajesh Kumar", priority: "High", status: "Pending", due: "2025-06-01", assignee: "Anitha S", category: "Sales" },
  { id: 2, title: "Prepare Q2 Sales Report", priority: "Medium", status: "In Progress", due: "2025-06-03", assignee: "Vikram R", category: "Reports" },
  { id: 3, title: "Client onboarding - Chennai Traders", priority: "High", status: "Pending", due: "2025-05-31", assignee: "Priya M", category: "Onboarding" },
  { id: 4, title: "Update CRM database entries", priority: "Low", status: "Completed", due: "2025-05-28", assignee: "Suresh K", category: "Admin" },
  { id: 5, title: "Schedule demo for new lead", priority: "High", status: "Pending", due: "2025-06-02", assignee: "Anitha S", category: "Sales" },
  { id: 6, title: "Invoice follow-up - Coimbatore client", priority: "Medium", status: "In Progress", due: "2025-06-04", assignee: "Vikram R", category: "Finance" },
  { id: 7, title: "Team training on new CRM features", priority: "Low", status: "Pending", due: "2025-06-07", assignee: "Priya M", category: "Training" },
  { id: 8, title: "Review monthly targets", priority: "Medium", status: "Completed", due: "2025-05-30", assignee: "Suresh K", category: "Reports" },
];

const priorityColor: Record<string, string> = {
  High: "#ef4444",
  Medium: "#f59e0b",
  Low: "#22c55e",
};

const statusColor: Record<string, string> = {
  Pending: "#f59e0b",
  "In Progress": "#3b82f6",
  Completed: "#22c55e",
};

export default function Tasks() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [taskList, setTaskList] = useState(tasks);
  const [newTask, setNewTask] = useState({ title: "", priority: "Medium", due: "", assignee: "", category: "Sales" });

  const statuses = ["All", "Pending", "In Progress", "Completed"];

  const filtered = taskList.filter(t =>
    (filter === "All" || t.status === filter) &&
    (t.title.toLowerCase().includes(search.toLowerCase()) || t.assignee.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = {
    Pending: taskList.filter(t => t.status === "Pending").length,
    "In Progress": taskList.filter(t => t.status === "In Progress").length,
    Completed: taskList.filter(t => t.status === "Completed").length,
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.due || !newTask.assignee) return;
    setTaskList([...taskList, { ...newTask, id: taskList.length + 1, status: "Pending" }]);
    setNewTask({ title: "", priority: "Medium", due: "", assignee: "", category: "Sales" });
    setShowModal(false);
  };

  const toggleStatus = (id: number) => {
    setTaskList(taskList.map(t => {
      if (t.id !== id) return t;
      const next = t.status === "Pending" ? "In Progress" : t.status === "In Progress" ? "Completed" : "Pending";
      return { ...t, status: next };
    }));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Segoe UI', sans-serif", padding: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <div style={{ color: "#f59e0b", fontSize: "13px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", marginBottom: "4px" }}>SHASTIKA GLOBAL IMPEX</div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", margin: 0 }}>Task Management</h1>
          <div style={{ color: "#666", fontSize: "13px", marginTop: "4px" }}>Track and manage all team tasks</div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", border: "none", borderRadius: "10px", padding: "12px 24px", color: "#000", fontWeight: 700, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
        >
          + Add Task
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "Pending", count: counts["Pending"], color: "#f59e0b", icon: "⏳" },
          { label: "In Progress", count: counts["In Progress"], color: "#3b82f6", icon: "🔄" },
          { label: "Completed", count: counts["Completed"], color: "#22c55e", icon: "✅" },
        ].map(card => (
          <div key={card.label} style={{ background: "#111", border: "1px solid #222", borderRadius: "14px", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ fontSize: "32px" }}>{card.icon}</div>
            <div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: card.color }}>{card.count}</div>
              <div style={{ color: "#888", fontSize: "13px" }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search tasks or assignee..."
          style={{ background: "#111", border: "1px solid #333", borderRadius: "8px", padding: "10px 16px", color: "#fff", fontSize: "14px", width: "280px", outline: "none" }}
        />
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "8px 18px", borderRadius: "8px", border: "1px solid", cursor: "pointer", fontSize: "13px", fontWeight: 600,
              background: filter === s ? "#f59e0b" : "transparent",
              color: filter === s ? "#000" : "#888",
              borderColor: filter === s ? "#f59e0b" : "#333",
            }}
          >{s}</button>
        ))}
      </div>

      {/* Task Table */}
      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#161616", borderBottom: "1px solid #222" }}>
              {["Task", "Category", "Assignee", "Due Date", "Priority", "Status", "Action"].map(h => (
                <th key={h} style={{ padding: "14px 16px", textAlign: "left", color: "#f59e0b", fontSize: "12px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((task, i) => (
              <tr key={task.id} style={{ borderBottom: "1px solid #1a1a1a", background: i % 2 === 0 ? "transparent" : "#0d0d0d", transition: "background 0.2s" }}>
                <td style={{ padding: "14px 16px", color: "#fff", fontSize: "14px", maxWidth: "220px" }}>{task.title}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ background: "#1e1e1e", color: "#f59e0b", borderRadius: "6px", padding: "3px 10px", fontSize: "12px", fontWeight: 600 }}>{task.category}</span>
                </td>
                <td style={{ padding: "14px 16px", color: "#ccc", fontSize: "13px" }}>{task.assignee}</td>
                <td style={{ padding: "14px 16px", color: "#888", fontSize: "13px" }}>{task.due}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ color: priorityColor[task.priority], fontWeight: 700, fontSize: "13px" }}>● {task.priority}</span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ background: statusColor[task.status] + "22", color: statusColor[task.status], borderRadius: "6px", padding: "4px 12px", fontSize: "12px", fontWeight: 600, border: `1px solid ${statusColor[task.status]}44` }}>
                    {task.status}
                  </span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <button onClick={() => toggleStatus(task.id)} style={{ background: "#1e1e1e", border: "1px solid #333", borderRadius: "6px", color: "#f59e0b", padding: "5px 12px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}>
                    Next →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "#555", padding: "40px", fontSize: "14px" }}>No tasks found.</div>
        )}
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#111", border: "1px solid #333", borderRadius: "18px", padding: "32px", width: "460px", maxWidth: "95vw" }}>
            <h2 style={{ margin: "0 0 24px", color: "#f59e0b", fontWeight: 800 }}>Add New Task</h2>
            {[
              { label: "Task Title", key: "title", type: "text", placeholder: "Enter task title" },
              { label: "Assignee", key: "assignee", type: "text", placeholder: "Assignee name" },
              { label: "Due Date", key: "due", type: "date", placeholder: "" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", color: "#888", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={(newTask as any)[f.key]}
                  onChange={e => setNewTask({ ...newTask, [f.key]: e.target.value })}
                  style={{ width: "100%", background: "#0a0a0a", border: "1px solid #333", borderRadius: "8px", padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}
            {[
              { label: "Priority", key: "priority", options: ["High", "Medium", "Low"] },
              { label: "Category", key: "category", options: ["Sales", "Reports", "Onboarding", "Admin", "Finance", "Training"] },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", color: "#888", fontSize: "12px", marginBottom: "6px", fontWeight: 600 }}>{f.label}</label>
                <select
                  value={(newTask as any)[f.key]}
                  onChange={e => setNewTask({ ...newTask, [f.key]: e.target.value })}
                  style={{ width: "100%", background: "#0a0a0a", border: "1px solid #333", borderRadius: "8px", padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none" }}
                >
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid #333", borderRadius: "8px", color: "#888", fontSize: "14px", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleAddTask} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: "8px", color: "#000", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}