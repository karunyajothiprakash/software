import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Download, Edit, Send, Share2, Mail, Loader2, Copy } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/shared/FormShell";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function QuotationPreview() {
  const { id } = useParams();
  const nav = useNavigate();

  const { data: q, isLoading } = useQuery({
    queryKey: ['quotation', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotations')
        .select(`
          *,
          customer:customers(name, email),
          items:quotation_items(
            *,
            product:products(name, sku)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/share/quote/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Public share link copied to clipboard!");
  };

  const handleEmail = () => {
    const shareUrl = `${window.location.origin}/share/quote/${id}`;
    const subject = encodeURIComponent(`Quotation ${q.quotation_number} from Shastika Global`);
    const body = encodeURIComponent(`Dear ${q.customer?.name || 'Customer'},\n\nPlease find our quotation ${q.quotation_number} at the link below:\n\n${shareUrl}\n\nBest regards,\nShastika Global Team`);
    window.location.href = `mailto:${q.customer?.email || ''}?subject=${subject}&body=${body}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (!q) return <div className="p-12 text-center text-muted-foreground">Quotation not found.</div>;

  return (
    <div>
      <PageHeader 
        title={q.quotation_number} 
        description="Quotation detail & sharing" 
        breadcrumbs={[{ label: "Quotations", to: "/quotations" }, { label: q.quotation_number }]}
        actions={<>
          <Button variant="outline" size="sm" onClick={() => nav(-1)}><ArrowLeft className="h-4 w-4 mr-1.5" />Back</Button>
          <Button variant="outline" size="sm" onClick={() => nav(`/quotations/edit/${id}`)}><Edit className="h-4 w-4 mr-1.5" />Edit</Button>
          <Button variant="outline" size="sm" onClick={handleShare}><Copy className="h-4 w-4 mr-1.5" />Share Link</Button>
          <Button variant="outline" size="sm" onClick={handleEmail}><Mail className="h-4 w-4 mr-1.5" />Email</Button>
          <Button size="sm" className="btn-gold" onClick={() => { toast.success("Quotation status updated to Sent"); }}>
            <Send className="h-4 w-4 mr-1.5" />Mark as Sent
          </Button>
        </>}
      />
      <Section>
        <div className="max-w-4xl mx-auto space-y-8 bg-card p-8 rounded-xl border shadow-sm">
          <div className="flex items-start justify-between pb-6 border-b border-border">
            <div>
              <div className="text-3xl font-black tracking-tight">QUOTATION</div>
              <div className="text-sm font-mono text-muted-foreground mt-1">{q.quotation_number}</div>
            </div>
            <StatusBadge status={q.status} />
          </div>

          <div className="grid grid-cols-2 gap-12 py-6 border-b border-border">
            <div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">From</div>
              <div className="font-bold text-sm">Shastika Global Exports</div>
              <div className="text-sm text-muted-foreground mt-2 leading-relaxed">
                123 Marine Drive<br />
                Mumbai 400001, India<br />
                GST: 27ABCDE1234F1Z5
              </div>
            </div>
            <div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Bill To</div>
              <div className="font-bold text-sm">{q.customer?.name}</div>
              <div className="text-sm text-muted-foreground mt-2 space-y-1">
                <p><span className="text-slate-400">Date:</span> {new Date(q.created_at).toLocaleDateString()}</p>
                <p><span className="text-slate-400">Valid until:</span> {q.valid_until ? new Date(q.valid_until).toLocaleDateString() : 'N/A'}</p>
                <p><span className="text-slate-400">Incoterm:</span> CIF</p>
              </div>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead className="border-b-2 border-slate-900">
              <tr>
                <th className="text-left py-4 font-bold text-xs uppercase tracking-wider">Description</th>
                <th className="text-right py-4 font-bold text-xs uppercase tracking-wider w-24">Qty</th>
                <th className="text-right py-4 font-bold text-xs uppercase tracking-wider w-32">Price</th>
                <th className="text-right py-4 font-bold text-xs uppercase tracking-wider w-32">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(q.items || []).map((item: any, i: number) => (
                <tr key={i}>
                  <td className="py-5">
                    <p className="font-bold">{item.product?.name || 'Custom Item'}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5 uppercase">{item.product?.sku || 'GENERIC'}</p>
                  </td>
                  <td className="text-right py-5 tabular-nums text-slate-600">{item.quantity.toLocaleString()} kg</td>
                  <td className="text-right py-5 tabular-nums text-slate-600">{q.currency} {item.unit_price.toLocaleString()}</td>
                  <td className="text-right py-5 tabular-nums font-bold text-slate-900">{q.currency} {item.total_price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col md:flex-row justify-between gap-8 pt-8 border-t border-border">
            <div className="flex-1 space-y-3">
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Payment Terms</h4>
              <p className="text-xs text-muted-foreground leading-relaxed italic whitespace-pre-wrap">
                {q.payment_terms || "Standard terms apply."}
              </p>
            </div>
            <div className="w-full md:w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums font-medium">{q.currency} {q.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({q.tax_rate}%)</span>
                <span className="tabular-nums font-medium">{q.currency} {q.tax_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-3 border-t-2 border-slate-900 font-bold text-lg text-primary">
                <span>Total</span>
                <span className="tabular-nums">{q.currency} {q.amount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generated by Shastika ERP</div>
            <Button size="sm" onClick={() => nav("/quotations/convert")}>
              Convert to Order <ArrowRight className="h-3.5 w-3.5 ml-2" />
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
