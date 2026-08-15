import { tool } from "@openai/agents";
import { z } from "zod";
import type { SupportContext } from "../context";
import {
  getOrdersForUser,
  trackOrderForUser,
} from "../data/mock-store";

export const trackOrder = tool<
  z.ZodObject<{ query: z.ZodString }>,
  SupportContext
>({
  name: "track_order",
  description: "Track an order by order ID or tracking number.",
  parameters: z.object({
    query: z
      .string()
      .describe("Order ID (e.g. ORD-1001) or tracking number (e.g. TRK-7829104)"),
  }),
  execute: async ({ query }, context) => {
    const userId = context?.context.userId ?? "";
    const order = trackOrderForUser(userId, query);

    if (!order) {
      return `No order found for "${query}".`;
    }

    return JSON.stringify(order, null, 2);
  },
});

export const getOrderStatus = tool<z.ZodObject<{}>, SupportContext>({
  name: "get_order_status",
  description: "Get a summary of the customer's recent orders.",
  parameters: z.object({}),
  execute: async (_input, context) => {
    const userId = context?.context.userId ?? "";
    const orders = getOrdersForUser(userId);

    return JSON.stringify(orders, null, 2);
  },
});

export const shippingTools = [trackOrder, getOrderStatus];
