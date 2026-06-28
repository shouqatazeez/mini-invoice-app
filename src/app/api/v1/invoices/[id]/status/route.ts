import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/get-user-id";

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    const { status } = await req.json();

    if (!["PAID", "UNPAID", "OVERDUE"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be PAID, UNPAID, or OVERDUE" },
        { status: 400 }
      );
    }

    const existing = await prisma.invoice.findFirst({
      where: { id: parseInt(id), userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    const invoice = await prisma.invoice.update({
      where: { id: parseInt(id) },
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
