import { tool } from "@openai/agents";
import { z } from "zod";
import type { SupportContext } from "../context";
import { createEscalationTicket } from "@/modules/tickets/actions";

export const createHumanEscalationTicket = tool<
  z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    priority: z.ZodEnum<{
      LOW: "LOW";
      MEDIUM: "MEDIUM";
      HIGH: "HIGH";
      URGENT: "URGENT";
    }>;
  }>,
  SupportContext
>({
  name: "create_human_escalation_ticket",
  description:
    "Escalate this conversation to a human support agent. Use when the user asks to speak with a human, agent, or representative.",
  parameters: z.object({
    title: z.string().describe("Short title for the escalation ticket"),
    description: z
      .string()
      .describe("What the customer needs help with and why they want a human"),
    priority: z
      .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
      .describe("How urgent the request is"),
  }),
  execute: async ({ title, description, priority }, context) => {
    const userId = context?.context.userId ?? "";
    const conversationId = context?.context.conversationId ?? "";

    if (!userId || !conversationId) {
      return "Unable to create a ticket because user or conversation context is missing.";
    }

    const result = await createEscalationTicket({
      userId,
      conversationId,
      title,
      description,
      priority,
    });

    return result.message;
  },
});

export const escalationTools = [createHumanEscalationTicket];