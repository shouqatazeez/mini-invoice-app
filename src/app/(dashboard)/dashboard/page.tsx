"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  IndianRupee,
  Clock,
  AlertTriangle,
  FileText,
  LayoutDashboard,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Stats {
  totalRevenue: number;
  totalUnpaid: number;
  totalOverdue: number;
  totalInvoices: number;
  paidCount: number;
  unpaidCount: number;
  overdueCount: number;
  totalCustomers: number;
  totalProducts: number;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  total: number;
  status: "PAID" | "UNPAID" | "OVERDUE";
  createdAt: string;
  customer: {
    name: string;
  };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, invoicesRes] = await Promise.all([
          fetch("/api/v1/dashboard/stats"),
          fetch("/api/v1/invoices"),
        ]);

        const statsData = await statsRes.json();
        const invoicesData = await invoicesRes.json();

        setStats(statsData);
        setInvoices(invoicesData.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const statusVariant = (status: string) => {
    switch (status) {
      case "PAID":
        return "default";
      case "UNPAID":
        return "secondary";
      case "OVERDUE":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Title shimmer */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-7 w-36" />
        </div>

        <Separator />

        {/* Stats cards shimmer */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-l-4 border-l-muted">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-3 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick actions shimmer */}
        <div className="flex gap-3">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>

        {/* Recent invoices shimmer */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-8 w-20" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const firstName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>

      <Separator />

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <IndianRupee className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats?.totalRevenue?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.paidCount || 0} paid invoices
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unpaid Amount
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats?.totalUnpaid?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.unpaidCount || 0} pending invoices
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue Amount
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats?.totalOverdue?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.overdueCount || 0} overdue invoices
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invoices
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalInvoices || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.totalCustomers || 0} customers · {stats?.totalProducts || 0} products
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Button asChild size="sm" className="active:!translate-y-0">
          <Link href="/invoices/new">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="active:!translate-y-0">
          <Link href="/customers/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="active:!translate-y-0">
          <Link href="/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Recent invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Invoices</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/invoices">
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No invoices yet. Create your first invoice to get started.
              </p>
              <Button asChild size="sm" className="mt-4">
                <Link href="/invoices/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium font-mono text-xs">
                      {invoice.invoiceNumber.slice(0, 12)}
                    </TableCell>
                    <TableCell>{invoice.customer.name}</TableCell>
                    <TableCell className="font-medium">
                      ₹{invoice.total.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
