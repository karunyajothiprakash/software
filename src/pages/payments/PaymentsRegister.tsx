import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Save, Receipt } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

export default function PaymentsRegister() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [partyName, setPartyName] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Wire Transfer");
  const [ref, setRef] = useState("");
  const [currency, setCurrency] = useState("USD");

  const { data: allPayments, isLoading } = useQuery({
    queryKey: ["payments_live"],
    queryFn: async () => {
      // Fetch confirmed payments
      const { data: pData, error: pError } = await supabase
        .from("payments")
        .select("*, customer:customers(name)")
        .order("created_at", { ascending: false });
      
      if (pError) throw pError;

      // Fetch pending sales orders (unpaid)
      const { data: sData, error: sError } = await supabase
        .from("sales_orders")
        .select("*, customer:customers(name)")
        .eq("status", "Pending");

      if (sError) throw sError;

      const formattedPayments = (pData || []).map(p => ({
        id: p.payment_number || p.id.split('-')[0].toUpperCase(),
        party: p.customer?.name || "Unknown",
        ref: p.reference_number || "Direct",
        method: p.method,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        date: p.received_at ? format(new Date(p.received_at), "yyyy-MM-dd") : "—"
      }));

      const formattedOrders = (sData || []).map(s => ({
        id: s.order_number,
        party: s.customer?.name || "Unknown",
        ref: s.order_number,
        method: "Pending",
        amount: s.amount,
        currency: s.currency,
        status: "Pending",
        date: s.created_at ? format(new Date(s.created_at), "yyyy-MM-dd") : "—"
      }));

      return [...formattedPayments, ...formattedOrders];
    }
  });

  const handleAddPayment = async () => {
    if (!partyName || !amount) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', userId).single();

      const payNum = `PAY-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;

      const { error } = await supabase.from("payments").insert({
        company_id: profile?.company_id,
        payment_number: payNum,
        amount: Number(amount),
        currency,
        method,
        status: 'Completed',
        reference_number: ref,
        received_at: new Date().toISOString(),
        created_by: userId
      });

      if (error) throw error;

      toast.success("Payment registered successfully");
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["payments_live"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to register payment");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="p-6">
      <PageHeader 
        title="Payment Register" 
        description="All incoming and outstanding payments" 
        breadcrumbs={[{ label: "Payments" }]} 
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gold">
                <Plus className="mr-2 h-4 w-4" /> Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="erp-card border-white/10">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  Register Payment
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Payer Name (Party) *</Label>
                  <Input placeholder="e.g. Osaka Electronics" value={partyName} onChange={(e) => setPartyName(e.target.value)} className="bg-white/5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount *</Label>
                    <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-white/5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="bg-white/5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card">
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Method</Label>
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger className="bg-white/5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card">
                        <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                        <SelectItem value="LC">Letter of Credit (LC)</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Check">Check</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reference #</Label>
                    <Input placeholder="INV-2025-..." value={ref} onChange={(e) => setRef(e.target.value)} className="bg-white/5" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button className="btn-gold" onClick={handleAddPayment} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Register
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        </div>
      ) : !allPayments || allPayments.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-white/10 rounded-xl">
          <Receipt className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
          <h3 className="text-lg font-medium">No payments recorded</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
            There are no live payments or pending orders in your database.
          </p>
        </div>
      ) : (
        <DataTable
          data={allPayments}
          searchKeys={["id", "party", "ref"]}
          columns={[
            { key: "id", header: "ID", render: (r) => <span className="font-mono text-xs font-bold text-primary">{r.id}</span> },
            { key: "party", header: "Party", render: (r) => <span className="font-medium">{r.party}</span> },
            { key: "ref", header: "Reference", render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.ref}</span> },
            { key: "method", header: "Method", render: (r) => <span className="text-sm">{r.method}</span> },
            { key: "amount", header: "Amount", render: (r) => <span className="font-bold tabular-nums text-white">{r.currency} {Number(r.amount).toLocaleString()}</span> },
            { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
            { key: "date", header: "Date", render: (r) => <span className="text-xs text-muted-foreground">{r.date}</span> },
          ]}
        />
      )}
    </div>
  );
}
