import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();

    if (!["PAID", "UNPAID", "OVERDUE"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be PAID, UNPAID, or OVERDUE" },
        { status: 400 }
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
