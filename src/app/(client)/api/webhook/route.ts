import razorpay from "@/lib/razorpay"; // <-- import your Razorpay instance
import { backendClient } from "@/sanity/lib/backendClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not set" }, { status: 400 });
  }

  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  // Verify signature
  const crypto = await import("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    const notes = payment.notes || {};

    // 1. Create Invoice via Razorpay API
    let invoiceData = null;
    try {
      invoiceData = await razorpay.invoices.create({
        type: "link",
        customer: {
          name: notes.customerName,
          email: notes.customerEmail,
          contact: payment.contact,
        },
        line_items: [
          {
            name: "Order #" + notes.orderNumber,
            amount: payment.amount, // in paise
            currency: payment.currency,
            quantity: 1,
          },
        ],
        description: "Invoice for order #" + notes.orderNumber,
        receipt: notes.orderNumber,
        email_notify: 1,
        sms_notify: 0,
        notes: notes,
        // Add more fields as needed
      });
    } catch (err) {
      console.error("Error creating Razorpay invoice:", err);
    }

    // 2. Save order in Sanity (with invoice info if available)
    try {
      console.log("Creating order in Sanity:", {
        orderNumber: notes.orderNumber,
        // ...baaki fields
      });
      await backendClient.create({
        _type: "order",
        orderNumber: notes.orderNumber,
        razorpayPaymentId: payment.id,
        razorpayOrderId: payment.order_id,
        razorpayInvoice: invoiceData
          ? {
              id: invoiceData.id,
              number: (invoiceData as any).number || "N/A",
              status: invoiceData.status,
              amount: (invoiceData as any).amount / 100,
              currency: (invoiceData as any).currency,
              invoice_url: (invoiceData as any).short_url || (invoiceData as any).invoice_url,
              created_at: invoiceData.created_at
                ? new Date(invoiceData.created_at * 1000).toISOString()
                : null,
              paid_at: invoiceData.paid_at
                ? new Date(invoiceData.paid_at * 1000).toISOString()
                : null,
            }
          : undefined,
        customerName: notes.customerName,
        clerkUserId: notes.clerkUserId,
        email: notes.customerEmail,
        currency: payment.currency,
        amountDiscount: notes.amountDiscount ? Number(notes.amountDiscount) : 0,
        products: notes.products ? JSON.parse(notes.products) : [],
        totalPrice: payment.amount / 100,
        status: "paid",
        orderDate: new Date().toISOString(),
        address: notes.address ? JSON.parse(notes.address) : null,
      });
      console.log("Order created successfully in Sanity");
    } catch (error) {
      console.error("Error creating order in Sanity:", error);
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}