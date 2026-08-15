import { Agent } from "@openai/agents";
import type { SupportContext } from "../context";
import { withhandoffPrompt } from "../prompts";
import { shippingTools } from "../tools/shipping-tools";
import {
    createInputGuardrail,
    createOutputGuardrail,
  } from "../guardrails";
import { createHumanEscalationTicket, escalationTools } from "../tools/escalation-tools";

export const shippingAgent = new Agent<SupportContext>({
    name: "Shipping Agent",
    handoffDescription:
        "Handles order tracking, delivery status, and shipping questions.",
    instructions: withhandoffPrompt(`You are the Shipping Agent for Supportly.
Help customers track orders and check delivery status.
Use your tools to look up order data before answering.
Keep replies concise and friendly.
Never invent tracking numbers or delivery dates.

If the user asks to speak with a human, agent, or representative:
1. Call create_human_escalation_ticket
2. Confirm the ticket was created
3. Tell them a human will follow up
4. Do not try to solve the issue further after escalating`),
    model: "gpt-4o-mini",
    tools: [...shippingTools, ...escalationTools],
    inputGuardrails: [createInputGuardrail("Shipping Agent")],
    outputGuardrails: [createOutputGuardrail("Shipping Agent")]
})