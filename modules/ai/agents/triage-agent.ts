import { Agent } from "@openai/agents";
import { withhandoffPrompt } from "../prompts";
import { billingAgent } from "./billing-agent";
import { shippingAgent } from "./shipping-agent";
import { technicalAgent } from "./technical-agent";


export const triageAgent = Agent.create({
    name: "Support Triage Agent",
    instructions: withhandoffPrompt(`
        You are the front-line support triage agent for Supportly.
Your job is to understand the customer's question and hand off to the right specialist:

- Billing questions (invoices, payments, refunds) → hand off to Billing Agent
- Shipping questions (orders, tracking, delivery) → hand off to Shipping Agent
- Technical questions (bugs, crashes, tickets, how-to) → hand off to Technical Agent

For simple greetings or general questions you can handle yourself.
Always be friendly and concise.
        `),
    model: "gpt-4o-mini",
    handoffs: [billingAgent, shippingAgent, technicalAgent]
})