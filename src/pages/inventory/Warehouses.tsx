import { useState } from "react";
import { Warehouse, MapPin, Plus, Loader2, Save, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Section } from "@/components/shared/FormShell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Warehouses() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const { data: warehouses, isLoading } = useQuery({
    queryKey: ["warehouses_live"],
    queryFn: async () => {
      // Fetch warehouses along with their associated inventory batches and product categories
      const { data, error } = await supabase
        .from("warehouses")
        .select(`
          *,
          inventory_batches(
            quantity_remaining_kg,
            product:products(category)
          )
        `)
        .order("name");
        
      if (error) throw error;

      // Process data to get summaries
      return (data || []).map(w => {
        const batchData = w.inventory_batches || [];
        const totalStock = batchData.reduce((sum: number, b: any) => sum + (Number(b.quantity_remaining_kg) || 0), 0);
        
        // Group by category
        const categories: Record<string, number> = {};
        batchData.forEach((b: any) => {
          const cat = b.product?.category || "Uncategorized";
          categories[cat] = (categories[cat] || 0) + (Number(b.quantity_remaining_kg) || 0);
        });

        return { ...w, totalStock, categories };
      });
    }
  });

  const handleAddWarehouse = async () => {
    if (!name || !location) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', userId).single();

      const { error } = await supabase.from("warehouses").insert({
        company_id: profile?.company_id,
        name,
        location,
        is_active: true
      });

      if (error) throw error;

      toast.success("Warehouse added successfully");
      setIsDialogOpen(false);
      setName("");
      setLocation("");
      queryClient.invalidateQueries({ queryKey: ["warehouses_live"] });
      queryClient.invalidateQueries({ queryKey: ["warehouses"] }); // Update dashboard dropdown too
    } catch (err: any) {
      toast.error(err.message || "Failed to add warehouse");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <PageHeader 
        title="Warehouses" 
        description="All distribution centers and storage facilities" 
        breadcrumbs={[{ label: "Inventory" }, { label: "Warehouses" }]} 
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gold">
                <Plus className="mr-2 h-4 w-4" /> Add Warehouse
              </Button>
            </DialogTrigger>
            <DialogContent className="erp-card border-white/10">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  New Warehouse
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Warehouse Name</Label>
                  <Input placeholder="e.g. Mumbai Main DC" value={name} onChange={(e) => setName(e.target.value)} className="bg-white/5" />
                </div>
                <div className="space-y-2">
                  <Label>Location / City</Label>
                  <Input placeholder="e.g. Mumbai, Maharashtra" value={location} onChange={(e) => setLocation(e.target.value)} className="bg-white/5" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button className="btn-gold" onClick={handleAddWarehouse} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Warehouse
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
      ) : !warehouses || warehouses.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-white/10 rounded-xl">
          <Warehouse className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
          <h3 className="text-lg font-medium">No warehouses found</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
            You haven't added any real warehouses to the database yet. Click the button above to start.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((w) => (
            <Section key={w.id} className="erp-card group hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Warehouse className="h-6 w-6" />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Warehouse ID</span>
                  <span className="text-xs font-mono text-white/60">{w.id.split('-')[0]}...</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="font-bold text-lg text-white group-hover:text-primary transition-colors">{w.name}</div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary/60" />
                  {w.location || "Location not set"}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Total Stock</span>
                  <span className="text-lg font-bold text-gradient-gold tabular-nums">{w.totalStock?.toLocaleString()} kg</span>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                  {Object.keys(w.categories).length > 0 ? (
                    Object.entries(w.categories).map(([cat, qty]) => (
                      <div key={cat} className="bg-white/5 border border-white/10 rounded-full px-3 py-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-[10px] font-medium text-white/80">{cat}:</span>
                        <span className="text-[10px] font-bold text-primary tabular-nums">{Number(qty).toLocaleString()} kg</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[10px] text-muted-foreground italic">No stock in this warehouse</span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter ${w.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {w.is_active ? 'Active' : 'Inactive'}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all">
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Section>
          ))}
        </div>
      )}
    </div>
  );
}
