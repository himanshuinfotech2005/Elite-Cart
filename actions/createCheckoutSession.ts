"use server";

import razorpay from "@/lib/razorpay";
import { Address } from "../sanity.types";
import { CartItem } from "../store";

export interface Metadata {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  clerkUserId?: string;
  address?: Address | null;
}

export interface GroupedCartItems {
  product: CartItem["product"]  ;
  quantity: number;
}

export async function createCheckoutSession(
  items: GroupedCartItems[],
  metadata: Metadata
) {
  try {
    if (!items || items.length === 0) {
      throw new Error("Cart is empty");
    }
    // Debug: log items and price
    console.log("Cart items:", items);

    // If price is in rupees, keep *100. If in paise, remove *100.
    const amount = items.reduce(
      (sum, item) => sum + Math.round(Number(item.product.price) * 100) * item.quantity,
      0
    );

    // Prepare products info for notes
    const products = items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
    }));

    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: metadata.orderNumber,
      notes: {
        orderNumber: metadata.orderNumber,
        customerName: metadata.customerName,
        customerEmail: metadata.customerEmail,
        clerkUserId: metadata.clerkUserId || "",
        address: metadata.address ? JSON.stringify(metadata.address) : "",
        products: JSON.stringify(products),
        amountDiscount: 0, // Add discount if you have
      },
      payment_capture: true,
    });

    console.log("Razorpay order response:", order);

    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      name: "EliteCart",
      description: "Order Payment",
      orderNumber: metadata.orderNumber,
      customerName: metadata.customerName,
      customerEmail: metadata.customerEmail,
      address: metadata.address,
    };
  } catch (error) {
    console.error("Error creating Razorpay Order", error);
    throw error;
  }
}