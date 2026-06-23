import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { customerId, taxRate, discount, items } = await request.json();

    if (!customerId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Customer and at least one item are required" },
        { status: 400 }
      );
    }

    const subtotal = items.reduce(
      (sum: number, item: { quantity: number; price: number }) =>
        sum + item.quantity * item.price,
      0
    );

    const taxAmount = (subtotal * (taxRate || 0)) / 100;
    const total = subtotal + taxAmount - (discount || 0);

    const invoice = await prisma.invoice.create({
      data: {
        customerId,
        subtotal,
        taxRate: taxRate || 0,
        taxAmount,
        discount: discount || 0,
        total,
        items: {
          create: items.map(
            (item: { productId: number; quantity: number; price: number }) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              total: item.quantity * item.price,
            })
          ),
        },
      },
      include: { customer: true, items: { include: { product: true } } },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
