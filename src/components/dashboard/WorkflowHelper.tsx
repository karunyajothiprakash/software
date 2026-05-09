import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, CircleDashed, PlayCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from "react";

export function WorkflowHelper() {
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 1500, stopOnInteraction: true })]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  // Fetch actionable items
  const { data: wonLeads } = useQuery({
    queryKey: ['workflow_leads'],
    queryFn: async () => {
      const { data } = await supabase.from('leads').select('*').eq('stage', 'won').limit(3);
      return data || [];
    }
  });

  const { data: pendingOrders } = useQuery({
    queryKey: ['workflow_orders'],
    queryFn: async () => {
      const { data } = await supabase.from('export_orders').select('*').eq('status', 'pending').limit(3);
      return data || [];
    }
  });

  const steps = [
    {
      title: "Step 1: CRM & Leads",
      description: "Convert won leads into customers",
      active: (wonLeads?.length || 0) > 0,
      count: wonLeads?.length || 0,
      action: "View Leads",
      url: "/crm/leads",
      icon: <UsersIcon className="h-5 w-5" />
    },
    {
      title: "Step 2: Quotations",
      description: "Send prices to your new customers",
      active: true,
      action: "Create Quote",
      url: "/quotations/create",
      icon: <FileTextIcon className="h-5 w-5" />
    },
    {
      title: "Step 3: Export Orders",
      description: "Process pending orders for fulfillment",
      active: (pendingOrders?.length || 0) > 0,
      count: pendingOrders?.length || 0,
      action: "Manage Orders",
      url: "/orders",
      icon: <ShoppingCartIcon className="h-5 w-5" />
    },
    {
      title: "Step 4: Procurement",
      description: "Buy quality stock from farmers",
      active: true,
      action: "Purchase Goods",
      url: "/procurement/orders/create",
      icon: <PackageIcon className="h-5 w-5" />
    },
    {
      title: "Step 5: Logistics",
      description: "Ship containers to your buyers",
      active: true,
      action: "Plan Shipment",
      url: "/shipments/create",
      icon: <ShipIcon className="h-5 w-5" />
    }
  ];

  return (
    <Card className="border-primary/20 bg-primary/5 relative group/guide">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <PlayCircle className="h-5 w-5 text-primary" />
          Business Workflow Guide
        </CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={scrollPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={scrollNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {steps.map((step, i) => (
            <div key={i} className="flex-[0_0_100%] md:flex-[0_0_45%] lg:flex-[0_0_31%] min-w-0 p-1">
              <div className={`h-full p-4 rounded-lg border bg-card transition-all ${step.active ? 'border-primary/50 shadow-sm' : 'opacity-60'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className={`p-2 rounded-md ${step.active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {step.icon}
                  </div>
                  {step.active ? (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase">
                      <CheckCircle2 className="h-3 w-3" /> Action Ready
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase">
                      <CircleDashed className="h-3 w-3" /> Pending
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-sm">{step.title}</h3>
                <p className="text-xs text-muted-foreground mb-4 h-8">{step.description}</p>
                <Button 
                  variant={step.active ? "default" : "outline"} 
                  size="sm" 
                  className="w-full text-xs group"
                  onClick={() => navigate(step.url)}
                >
                  {step.action}
                  <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Simple icons
function UsersIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> }
function FileTextIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg> }
function ShoppingCartIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg> }
function PackageIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> }
function ShipIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 21c.6.5 1.2 1 2.5 1 1.4 0 2.1-.6 2.5-1 .4.4 1.1 1 2.5 1 1.4 0 2.1-.6 2.5-1 .4.4 1.1 1 2.5 1 1.4 0 2.1-.6 2.5-1 .4.4 1.1 1 2.5 1 1.3 0 1.9-.5 2.5-1"/><path d="M19.38 20L21 7l-9-4-9 4 1.62 13"/><path d="M12 3v10"/></svg> }
