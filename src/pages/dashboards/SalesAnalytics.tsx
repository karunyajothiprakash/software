import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Section } from "@/components/shared/FormShell";
import { BarChart3, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function SalesAnalytics() {
  // Query 1: Sales from database view
  const { data: realSales } = useQuery({
    queryKey: ['dashboard_sales'],
    queryFn: async () => {
      return [];
    },
    retry: false
  });

  // Query 2: Leads from CRM
  const { data: leads = [] } = useQuery({
    queryKey: ['sales_analytics_leads'],
    queryFn: async () => {
      return [];
    },
    retry: false
  });

  // Query 3: Export Orders
  const { data: orders = [] } = useQuery({
    queryKey: ['sales_analytics_orders'],
    queryFn: async () => {
      return [];
    },
    retry: false
  });

  // Calculations
  const chartSales = [];
  const totalRevenue = 0;
  
  const totalLeads = 0;
  const wonLeads = 0;
  const lostLeads = 0;
  
  const conversionRate = 0;
  
  const closedLeads = 0;
  const winRate = 0;

  const totalOrders = 0;
  const totalOrderAmount = 0;
  const avgDealSize = 0;

  const isLive = false;

  return (
    <div>
      <PageHeader title="Sales Analytics" description="Pipeline, conversion and revenue trends" breadcrumbs={[{ label: "Dashboards" }, { label: "Sales" }]} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Pipeline Value" value={isLive ? `$${(totalRevenue/1000).toFixed(0)}K` : "—"} delta={{ value: isLive ? "Live" : "No Data", positive: isLive }} hint="from database" />
        <StatCard label="Conversion Rate" value={isLive ? `${conversionRate.toFixed(1)}%` : "—"} delta={{ value: isLive ? "Live" : "No Data", positive: isLive }} hint="leads → orders" />
        <StatCard label="Avg Deal Size" value={isLive ? `$${(avgDealSize/1000).toFixed(1)}K` : "—"} delta={{ value: isLive ? "Live" : "No Data", positive: isLive }} hint="from database" />
        <StatCard label="Win Rate" value={isLive ? `${winRate.toFixed(1)}%` : "—"} delta={{ value: isLive ? "Live" : "No Data", positive: isLive }} hint="from database" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Orders per Month">
          <div className="h-64 flex items-center justify-center">
            {chartSales.length === 0 ? (
              <div className="text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-20" />
                <p className="text-xs text-muted-foreground italic">No sales orders found</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartSales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="orders" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Section>
        <Section title="Revenue Growth">
          <div className="h-64 flex items-center justify-center">
            {chartSales.length === 0 ? (
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-20" />
                <p className="text-xs text-muted-foreground italic">No revenue growth data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartSales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
