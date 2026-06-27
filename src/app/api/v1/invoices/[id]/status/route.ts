import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/get-user-id";

/**
 * PUT /api/v1/invoices/:id/status
 * Updates an invoice's payment status (PAID, UNPAID, OVERDUE).
 * Only works if the invoice belongs to the logged-in user.
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();

    if (!["PAID", "UNPAID", "OVERDUE"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be PAID, UNPAID, or OVERDUE" },
        { status: 400 }
      );
    }

    // Verify this invoice belongs to the user
    const existing = await prisma.invoice.findFirst({
      where: { id: parseInt(params.id), userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    const invoice = await prisma.invoice.update({
      where: { id: parseInt(params.id) },
      data: { status },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update invoice status" },
      { status: 500 }
    );
  }
}
