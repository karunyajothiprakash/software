import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Search, Plus, Trash2, Globe, Building2,
  Mail, Phone, MapPin, RefreshCw, Download,
  Filter, UserCheck, UserX, Edit
} from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  status: string;
  customer_type: string;
  total_orders: number;
  total_value: number;
  created_at: string;
}

export default function CustomerDatabase() {
  const { profile } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    company_name: "", contact_name: "", email: "",
    phone: "", country: "", city: "", customer_type: "buyer",
  });

  useEffect(() => {
    fetchCustomers();
  }, [profile]);

  const fetchCustomers = async () => {
    if (!profile?.company_id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  const handleAddCustomer = async () => {
    if (!profile?.company_id) return;
    if (!newCustomer.company_name) { toast.error("Company name is required"); return; }
    try {
      const { error } = await supabase.from("customers").insert({
        ...newCustomer,
        company_id: profile.company_id,
        status: "active",
        total_orders: 0,
        total_value: 0,
      });
      if (error) throw error;
      toast.success("Customer added successfully");
      setShowAddModal(false);
      setNewCustomer({ company_name: "", contact_name: "", email: "", phone: "", country: "", city: "", customer_type: "buyer" });
      fetchCustomers();
    } catch {
      toast.error("Failed to add customer");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
      toast.success("Customer deleted");
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error("Failed to delete customer");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const statusColor = (s: string) => {
    const m: Record<string, { bg: string; text: string }> = {
      active: { bg: "#22c55e18", text: "#22c55e" },
      inactive: { bg: "#ef444418", text: "#ef4444" },
      prospect: { bg: "#eab30818", text: "#eab308" },
    };
    return m[s] || { bg: "#ffffff10", text: "#888" };
  };

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>
      <PageHeader
        title="Customer Database"
        subtitle="Manage all buyers, importers and business contacts"
      />

      <div style={{ padding: "24px" }}>
        {/* Stats Row */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total Customers", value: customers.length, color: "#fff" },
            { label: "Active", value: customers.filter(c => c.status === "active").length, color: "#22c55e" },
            { label: "Inactive", value: customers.filter(c => c.status === "inactive").length, color: "#ef4444" },
            { label: "Prospects", value: customers.filter(c => c.status === "prospect").length, color: "#eab308" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "#111", border: "1px solid #222", borderRadius: "12px",
                padding: "20px 24px", flex: 1,
              }}
            >
              <p style={{ color: "#666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>
                {s.label}
              </p>
              <p style={{ color: s.color, fontSize: "28px", fontWeight: 700, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div
          style={{
            background: "#111", border: "1px solid #222", borderRadius: "12px",
            padding: "20px 24px", marginBottom: "16px",
            display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
            <Search size={16} color="#555" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: "36px", background: "#0d0d0d", border: "1px solid #222",
                color: "#fff", borderRadius: "8px",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {["all", "active", "inactive", "prospect"].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                style={{
                  padding: "8px 16px", borderRadius: "8px", fontSize: "13px",
                  fontWeight: 500, cursor: "pointer", border: "none",
                  background: statusFilter === f ? "#eab308" : "#1a1a1a",
                  color: statusFilter === f ? "#000" : "#888",
                  textTransform: "capitalize",
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
            <Button
              variant="outline"
              onClick={fetchCustomers}
              style={{ background: "#1a1a1a", border: "1px solid #333", color: "#888" }}
            >
              <RefreshCw size={14} />
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              style={{ background: "#eab308", color: "#000", fontWeight: 600 }}
            >
              <Plus size={14} /> Add Customer
            </Button>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#111", border: "1px solid #222", borderRadius: "12px", overflow: "hidden" }}>
          <Table>
            <TableHeader>
              <TableRow style={{ borderBottom: "1px solid #1a1a1a" }}>
                <TableHead style={{ color: "#555", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", width: "40px" }}>
                  <input
                    type="checkbox"
                    onChange={(e) => setSelectedIds(e.target.checked ? filtered.map(c => c.id) : [])}
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    style={{ accentColor: "#eab308" }}
                  />
                </TableHead>
                {["Company", "Contact", "Email", "Country", "Type", "Status", "Orders", "Value", "Actions"].map((h) => (
                  <TableHead key={h} style={{ color: "#555", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} style={{ borderBottom: "1px solid #111" }}>
                    {[...Array(10)].map((_, j) => (
                      <TableCell key={j}>
                        <div style={{ height: "16px", background: "#1a1a1a", borderRadius: "4px", width: "80%" }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} style={{ textAlign: "center", padding: "48px", color: "#555" }}>
                    <Building2 size={32} color="#333" style={{ margin: "0 auto 12px", display: "block" }} />
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => {
                  const sc = statusColor(c.status);
                  return (
                    <TableRow
                      key={c.id}
                      style={{
                        borderBottom: "1px solid #111",
                        background: selectedIds.includes(c.id) ? "#1a1a0a" : "transparent",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => { if (!selectedIds.includes(c.id)) e.currentTarget.style.background = "#141414"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = selectedIds.includes(c.id) ? "#1a1a0a" : "transparent"; }}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(c.id)}
                          onChange={() => toggleSelect(c.id)}
                          style={{ accentColor: "#eab308" }}
                        />
                      </TableCell>
                      <TableCell>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "34px", height: "34px", borderRadius: "8px",
                              background: "#1a1a1a", display: "flex", alignItems: "center",
                              justifyContent: "center", flexShrink: 0,
                            }}
                          >
                            <Building2 size={14} color="#555" />
                          </div>
                          <span style={{ color: "#fff", fontSize: "13px", fontWeight: 500 }}>{c.company_name}</span>
                        </div>
                      </TableCell>
                      <TableCell style={{ color: "#aaa", fontSize: "13px" }}>{c.contact_name || "—"}</TableCell>
                      <TableCell>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Mail size={12} color="#555" />
                          <span style={{ color: "#888", fontSize: "12px" }}>{c.email || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Globe size={12} color="#555" />
                          <span style={{ color: "#888", fontSize: "12px" }}>{c.country || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          style={{
                            background: "#eab30818", color: "#eab308",
                            padding: "3px 10px", borderRadius: "20px",
                            fontSize: "11px", textTransform: "capitalize",
                          }}
                        >
                          {c.customer_type || "buyer"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          style={{
                            background: sc.bg, color: sc.text,
                            padding: "3px 10px", borderRadius: "20px",
                            fontSize: "11px", textTransform: "capitalize",
                          }}
                        >
                          {c.status || "active"}
                        </span>
                      </TableCell>
                      <TableCell style={{ color: "#aaa", fontSize: "13px" }}>{c.total_orders || 0}</TableCell>
                      <TableCell style={{ color: "#eab308", fontSize: "13px", fontWeight: 600 }}>
                        ${(c.total_value || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            style={{
                              background: "#1a1a1a", border: "none", borderRadius: "6px",
                              width: "30px", height: "30px", display: "flex", alignItems: "center",
                              justifyContent: "center", cursor: "pointer", color: "#888",
                            }}
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            style={{
                              background: "#ef444418", border: "none", borderRadius: "6px",
                              width: "30px", height: "30px", display: "flex", alignItems: "center",
                              justifyContent: "center", cursor: "pointer", color: "#ef4444",
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
          <p style={{ color: "#555", fontSize: "12px" }}>
            Showing {filtered.length} of {customers.length} customers
          </p>
          {selectedIds.length > 0 && (
            <p style={{ color: "#eab308", fontSize: "12px" }}>
              {selectedIds.length} selected
            </p>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
          onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
        >
          <div
            style={{
              background: "#111", border: "1px solid #222", borderRadius: "16px",
              padding: "32px", width: "100%", maxWidth: "500px",
            }}
          >
            <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: 600, margin: "0 0 24px" }}>
              Add New Customer
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { label: "Company Name *", key: "company_name", placeholder: "Acme Imports Ltd" },
                { label: "Contact Name", key: "contact_name", placeholder: "John Smith" },
                { label: "Email", key: "email", placeholder: "john@acme.com" },
                { label: "Phone", key: "phone", placeholder: "+1 555 0000" },
                { label: "Country", key: "country", placeholder: "United States" },
                { label: "City", key: "city", placeholder: "New York" },
              ].map((field) => (
                <div key={field.key}>
                  <label style={{ color: "#888", fontSize: "12px", marginBottom: "6px", display: "block" }}>
                    {field.label}
                  </label>
                  <Input
                    placeholder={field.placeholder}
                    value={(newCustomer as any)[field.key]}
                    onChange={(e) => setNewCustomer((p) => ({ ...p, [field.key]: e.target.value }))}
                    style={{ background: "#0d0d0d", border: "1px solid #222", color: "#fff" }}
                  />
                </div>
              ))}
              <div>
                <label style={{ color: "#888", fontSize: "12px", marginBottom: "6px", display: "block" }}>Type</label>
                <select
                  value={newCustomer.customer_type}
                  onChange={(e) => setNewCustomer((p) => ({ ...p, customer_type: e.target.value }))}
                  style={{
                    width: "100%", padding: "8px 12px", background: "#0d0d0d",
                    border: "1px solid #222", color: "#fff", borderRadius: "8px", fontSize: "14px",
                  }}
                >
                  <option value="buyer">Buyer</option>
                  <option value="importer">Importer</option>
                  <option value="distributor">Distributor</option>
                  <option value="retailer">Retailer</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "24px", justifyContent: "flex-end" }}>
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                style={{ background: "#1a1a1a", border: "1px solid #333", color: "#888" }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCustomer}
                style={{ background: "#eab308", color: "#000", fontWeight: 600 }}
              >
                Add Customer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}