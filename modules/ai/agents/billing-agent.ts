import { Agent } from "@openai/agents";
import type { SupportContext } from "../context";
import { withhandoffPrompt } from "../prompts";
import { billingTools } from "../tools/billing-tools";
import {
    createInputGuardrail,
    createOutputGuardrail,
  } from "../guardrails";   
import { createHumanEscalationTicket, escalationTools } from "../tools/escalation-tools";
export const billingAgent = new Agent<SupportContext>({
    name: "Billing Agent",
    handoffDescription:
        "Handles invoices, payments, refunds, and billing disputes.",
        instructions: withhandoffPrompt(`You are the Billing Agent for Supportly.
            Help customers with invoices, payments, and refunds.
            Use your tools to look up real invoice data before answering.
            Keep replies concise and friendly.
            Never invent invoice IDs or payment details.
            
            If the user asks to speak with a human, agent, or representative:
            1. Call create_human_escalation_ticket
            2. Confirm the ticket was created
            3. Tell them a human will follow up
            4. Do not try to solve the issue further after escalating`),
    model: "gpt-4o-mini",
    tools: [...billingTools, ...escalationTools],
    inputGuardrails: [createInputGuardrail("Billing Agent")],
    outputGuardrails: [createOutputGuardrail("Billing Agent")]
})