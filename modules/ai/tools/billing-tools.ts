import { tool } from "@openai/agents";
import { z } from "zod";
import type { SupportContext } from "../context";
import {
    getInvoiceForUser,
    getInvoicesForUser,
    requestRefundForUser,
} from "../data/mock-store";


export const getInvoices = tool<z.ZodObject<{}>, SupportContext>({
    name: "get_invoices",
    description: "List all invoices for the current customer.",
    parameters: z.object({}),
    execute: async (_input, context) => {
        const userId = context?.context.userId ?? "";
        const invoices = getInvoicesForUser(userId);

        return JSON.stringify(invoices, null, 2);
    },
});

export const getInvoiceDetails = tool<
    z.ZodObject<{ invoiceId: z.ZodString }>,
    SupportContext
>({
    name: "get_invoice_details",
    description: "Get details for a specific invoice by ID.",
    parameters: z.object({
        invoiceId: z.string().describe("The invoice ID, e.g. INV-1001"),
    }),
    execute: async ({ invoiceId }, context) => {
        const userId = context?.context.userId ?? "";
        const invoice = getInvoiceForUser(userId, invoiceId);

        if (!invoice) {
            return `Invoice ${invoiceId} was not found.`;
        }

        return JSON.stringify(invoice, null, 2);
    },
});

export const requestRefund = tool<
  z.ZodObject<{ invoiceId: z.ZodString; reason: z.ZodString }>,
  SupportContext
>({
  name: "request_refund",
  description: "Submit a refund request for an invoice.",
  parameters: z.object({
    invoiceId: z.string().describe("The invoice ID to refund"),
    reason: z.string().describe("Why the customer wants a refund"),
  }),
  execute: async ({ invoiceId, reason }, context) => {
    const userId = context?.context.userId ?? "";
    const result = requestRefundForUser(userId, invoiceId, reason);

    return result.message;
  },
});


export const billingTools = [getInvoices, getInvoiceDetails, requestRefund];