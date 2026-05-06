import { useState, useEffect } from "react";
import { FileBox, Package, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Section } from "@/components/shared/FormShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function PackingLists() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPLs = async () => {
      try {
        const { data, error } = await supabase
          .from("export_shipments")
          .select("*, export_containers(count)")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setShipments(data || []);
      } catch (err) {
        toast.error("Failed to load packing lists");
      } finally {
        setLoading(false);
      }
    };
    fetchPLs();
  }, []);

  return (
    <div>
      <PageHeader title="Packing Lists" description="Per-shipment packing list documents" breadcrumbs={[{ label: "Documents" }, { label: "Packing Lists" }]} />
      
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : shipments.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-lg">
          <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <p className="text-muted-foreground">No active packing lists found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shipments.map((s) => (
            <Section key={s.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <FileBox className="h-5 w-5" />
                </div>
                <StatusBadge status={s.status} />
              </div>
              <div className="font-bold text-sm">PL-{s.shipment_number?.slice(4)}</div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">{s.customer_name}</div>
              <div className="text-[11px] text-muted-foreground mt-3 flex justify-between border-t pt-2 border-border">
                <span>{s.export_containers?.[0]?.count || 0} Containers</span>
                <span>To: {s.destination_port}</span>
              </div>
            </Section>
          ))}
        </div>
      )}
    </div>
  );
}
