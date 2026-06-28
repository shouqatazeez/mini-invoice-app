import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/get-user-id";
import { jsPDF } from "jspdf";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;

    const invoice = await prisma.invoice.findFirst({
      where: { id: parseInt(id), userId },
      include: { customer: true, items: { include: { product: true } } },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("INVOICE", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 35);
    doc.text(`Date: ${invoice.createdAt.toLocaleDateString()}`, 20, 42);
    doc.text(`Status: ${invoice.status}`, 20, 49);

    doc.setFontSize(12);
    doc.text("Bill To:", 20, 62);
    doc.setFontSize(10);
    doc.text(`${invoice.customer.name}`, 20, 69);
    if (invoice.customer.email) doc.text(`${invoice.customer.email}`, 20, 76);
    if (invoice.customer.phone) doc.text(`${invoice.customer.phone}`, 20, 83);
    if (invoice.customer.address)
      doc.text(`${invoice.customer.address}`, 20, 90);

    let y = 105;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Product", 20, y);
    doc.text("Qty", 100, y);
    doc.text("Price", 130, y);
    doc.text("Total", 170, y);
    doc.line(20, y + 2, 190, y + 2);

    doc.setFont("helvetica", "normal");
    y += 10;

    for (const item of invoice.items) {
      doc.text(item.product.name, 20, y);
      doc.text(item.quantity.toString(), 100, y);
      doc.text(`${item.price.toFixed(2)}`, 130, y);
      doc.text(`${item.total.toFixed(2)}`, 170, y);
      y += 8;
    }

    y += 5;
    doc.line(20, y, 190, y);
    y += 10;

    doc.text(`Subtotal: ${invoice.subtotal.toFixed(2)}`, 130, y);
    y += 7;
    doc.text(
      `Tax (${invoice.taxRate}%): ${invoice.taxAmount.toFixed(2)}`,
      130,
      y
    );
    y += 7;
    doc.text(`Discount: -${invoice.discount.toFixed(2)}`, 130, y);
    y += 7;
    doc.setFont("helvetica", "bold");
    doc.text(`Total: ${invoice.total.toFixed(2)}`, 130, y);

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
