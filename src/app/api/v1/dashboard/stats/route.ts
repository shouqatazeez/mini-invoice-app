import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/get-user-id";

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalCustomers,
      totalProducts,
      paidInvoices,
      unpaidInvoices,
      overdueInvoices,
    ] = await Promise.all([
      prisma.customer.count({ where: { userId } }),
      prisma.product.count({ where: { userId } }),
      prisma.invoice.findMany({ where: { userId, status: "PAID" } }),
      prisma.invoice.findMany({ where: { userId, status: "UNPAID" } }),
      prisma.invoice.findMany({ where: { userId, status: "OVERDUE" } }),
    ]);

    const totalRevenue = paidInvoices.reduce(
      (sum: number, inv: { total: number }) => sum + inv.total,
      0
    );

    const totalUnpaid = unpaidInvoices.reduce(
      (sum: number, inv: { total: number }) => sum + inv.total,
      0
    );

    const totalOverdue = overdueInvoices.reduce(
      (sum: number, inv: { total: number }) => sum + inv.total,
      0
    );

    return NextResponse.json({
      totalCustomers,
      totalProducts,
      totalRevenue,
      totalUnpaid,
      totalOverdue,
      paidCount: paidInvoices.length,
      unpaidCount: unpaidInvoices.length,
      overdueCount: overdueInvoices.length,
      totalInvoices:
        paidInvoices.length + unpaidInvoices.length + overdueInvoices.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
