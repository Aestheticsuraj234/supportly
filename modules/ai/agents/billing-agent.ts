import { Agent } from "@openai/agents";
import type { SupportContext } from "../context";
import { withhandoffPrompt } from "../prompts";
import { billingTools } from "../tools/billing-tools";

export const billingAgent = new Agent<SupportContext>({
    name: "Billing Agent",
    handoffDescription:
        "Handles invoices, payments, refunds, and billing disputes.",
    instructions: withhandoffPrompt(`You are the Billing Agent for Supportly.
        Help customers with invoices, payments, and refunds.
        Use your tools to look up real invoice data before answering.
        Keep replies concise and friendly.`),
    model: "gpt-4o-mini",
    tools: billingTools,
})