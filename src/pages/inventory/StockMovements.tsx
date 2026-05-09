import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, History } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

export default function StockMovements() {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const { data, error } = await supabase
          .from("inventory_movements")
          .select("*")
          .order("date", { ascending: false });

        if (error) throw error;
        setMovements(data || []);
      } catch (err: any) {
        toast.error("Failed to load stock movements");
      } finally {
        setLoading(false);
      }
    };
    fetchMovements();
  }, []);

  return (
    <div>
      <PageHeader 
        title="Stock Movements" 
        description="History of all inventory in/out transactions" 
        breadcrumbs={[{ label: "Inventory" }, { label: "Movements" }]} 
      />
      
      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : movements.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-card mt-6">
          <History className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
          <h2 className="text-xl font-medium">No movements yet</h2>
          <p className="text-muted-foreground mt-1 text-center">Inbound and outbound stock logs will appear here once you process orders.</p>
        </div>
      ) : (
        <DataTable
          data={movements}
          searchKeys={["sku", "reference", "warehouse"]}
          columns={[
            { 
              key: "date", 
              header: "Date", 
              render: (r) => <span className="text-xs">{format(new Date(r.date), "yyyy-MM-dd")}</span> 
            },
            { 
              key: "sku", 
              header: "SKU", 
              render: (r) => <span className="font-mono text-xs font-bold">{r.sku}</span> 
            },
            { 
              key: "direction", 
              header: "Type", 
              render: (r) => r.direction === "in"
                ? <span className="inline-flex items-center gap-1 text-emerald-500 text-xs font-bold"><ArrowDown className="h-3 w-3" />Inbound</span>
                : <span className="inline-flex items-center gap-1 text-orange-500 text-xs font-bold"><ArrowUp className="h-3 w-3" />Outbound</span> 
            },
            { 
              key: "qty", 
              header: "Qty", 
              render: (r) => <span className="tabular-nums font-bold text-base">{Number(r.qty).toLocaleString()}</span> 
            },
            { 
              key: "reference", 
              header: "Reference", 
              render: (r) => <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{r.reference}</span> 
            },
            { 
              key: "warehouse", 
              header: "Warehouse", 
              render: (r) => <span className="text-xs font-medium">{r.warehouse || "N/A"}</span> 
            },
          ]}
        />
      )}
    </div>
  );
}
