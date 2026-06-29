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
    const pageWidth = doc.internal.pageSize.getWidth();

    // === HEADER BAR (primary blue) ===
    doc.setFillColor(59, 130, 246); // blue-500 (matches app primary)
    doc.rect(0, 0, pageWidth, 40, "F");

    // Accent strip below header
    doc.setFillColor(37, 99, 235); // blue-600 (darker accent)
    doc.rect(0, 40, pageWidth, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("InvoTrack", 20, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Simple Billing for Small Businesses", 20, 26);

    // Invoice title on the right side of header
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth - 20, 22, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.invoiceNumber, pageWidth - 20, 30, { align: "right" });

    // === INVOICE META (below header) ===
    doc.setTextColor(60, 60, 60);
    let y = 55;

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("INVOICE DATE", 20, y);
    doc.text("STATUS", 80, y);

    y += 6;
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.createdAt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }), 20, y);

    // Status badge
    const statusColors: Record<string, [number, number, number]> = {
      PAID: [22, 163, 74],    // green
      UNPAID: [202, 138, 4],  // yellow
      OVERDUE: [220, 38, 38], // red
    };
    const statusColor = statusColors[invoice.status] || [100, 100, 100];
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(invoice.status, 80, y);

    // === BILL TO SECTION ===
    y += 18;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.setFont("helvetica", "normal");
    doc.text("BILL TO", 20, y);

    y += 6;
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.customer.name, 20, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    if (invoice.customer.email) {
      y += 6;
      doc.text(invoice.customer.email, 20, y);
    }
    if (invoice.customer.phone) {
      y += 6;
      doc.text(invoice.customer.phone, 20, y);
    }
    if (invoice.customer.address) {
      y += 6;
      doc.text(invoice.customer.address, 20, y);
    }

    // === LINE ITEMS TABLE ===
    y += 16;

    // Table header background
    doc.setFillColor(219, 234, 254); // blue-100
    doc.rect(20, y - 5, pageWidth - 40, 10, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text("PRODUCT", 25, y + 1);
    doc.text("QTY", 105, y + 1);
    doc.text("PRICE", 130, y + 1);
    doc.text("TOTAL", pageWidth - 25, y + 1, { align: "right" });

    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);

    for (const item of invoice.items) {
      doc.text(item.product.name, 25, y);
      doc.text(item.quantity.toString(), 105, y);
      doc.text(`Rs.${item.price.toFixed(2)}`, 130, y);
      doc.text(`Rs.${item.total.toFixed(2)}`, pageWidth - 25, y, { align: "right" });

      // Light line under each row
      y += 3;
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(20, y, pageWidth - 20, y);
      y += 9;
    }

    // === TOTALS SECTION ===
    y += 8;
    const totalsX = 130;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Subtotal", totalsX, y);
    doc.text(`Rs.${invoice.subtotal.toFixed(2)}`, pageWidth - 25, y, { align: "right" });

    y += 8;
    doc.text(`Tax (${invoice.taxRate}%)`, totalsX, y);
    doc.text(`Rs.${invoice.taxAmount.toFixed(2)}`, pageWidth - 25, y, { align: "right" });

    y += 8;
    doc.text("Discount", totalsX, y);
    doc.text(`-Rs.${invoice.discount.toFixed(2)}`, pageWidth - 25, y, { align: "right" });

    // Total with highlight box
    y += 12;
    doc.setFillColor(59, 130, 246); // blue-500
    doc.roundedRect(totalsX - 5, y - 6, pageWidth - totalsX - 15, 14, 2, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("TOTAL", totalsX, y + 2);
    doc.text(`Rs.${invoice.total.toFixed(2)}`, pageWidth - 25, y + 2, { align: "right" });

    // === FOOTER ===
    const footerY = 275;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, footerY, pageWidth - 20, footerY);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.text("Generated by InvoTrack — Simple Billing for Small Businesses", pageWidth / 2, footerY + 8, { align: "center" });

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
