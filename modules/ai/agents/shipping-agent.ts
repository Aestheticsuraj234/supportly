import { Agent } from "@openai/agents";
import type { SupportContext } from "../context";
import { withhandoffPrompt } from "../prompts";
import { shippingTools } from "../tools/shipping-tools";

export const shippingAgent = new Agent<SupportContext>({
    name: "Shipping Agent",
    handoffDescription:
        "Handles order tracking, delivery status, and shipping questions.",
    instructions: withhandoffPrompt(`You are the Shipping Agent for Supportly.
Help customers track orders and check delivery status.
Use your tools to look up order data before answering.
Keep replies concise and friendly.`),
    model: "gpt-4o-mini",
    tools: shippingTools,
})