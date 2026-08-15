import { tool } from "@openai/agents";
import { z } from "zod";
import type { SupportContext } from "../context";
import {
  createTicketForUser,
  getTicketForUser,
  getTicketsForUser,
  searchKnowledgeBase,
} from "../data/mock-store";

export const searchKb = tool<
  z.ZodObject<{ query: z.ZodString }>,
  SupportContext
>({
  name: "search_knowledge_base",
  description: "Search the support knowledge base for help articles.",
  parameters: z.object({
    query: z.string().describe("Search terms, e.g. 'crash' or 'password reset'"),
  }),
  execute: async ({ query }) => {
    const articles = searchKnowledgeBase(query);

    if (articles.length === 0) {
      return `No articles found for "${query}".`;
    }

    return JSON.stringify(articles, null, 2);
  },
});

export const getTicketStatus = tool<
  z.ZodObject<{ ticketId: z.ZodString }>,
  SupportContext
>({
  name: "get_ticket_status",
  description: "Look up a support ticket by ID.",
  parameters: z.object({
    ticketId: z.string().describe("The ticket ID, e.g. TKT-501"),
  }),
  execute: async ({ ticketId }, context) => {
    const userId = context?.context.userId ?? "";
    const ticket = getTicketForUser(userId, ticketId);

    if (!ticket) {
      const openTickets = getTicketsForUser(userId);
      return `Ticket ${ticketId} not found. Open tickets: ${JSON.stringify(openTickets)}`;
    }

    return JSON.stringify(ticket, null, 2);
  },
});

export const createSupportTicket = tool<
  z.ZodObject<{ subject: z.ZodString; description: z.ZodString }>,
  SupportContext
>({
  name: "create_support_ticket",
  description: "Create a new technical support ticket.",
  parameters: z.object({
    subject: z.string().describe("Short summary of the issue"),
    description: z.string().describe("Detailed description of the problem"),
  }),
  execute: async ({ subject, description }, context) => {
    const userId = context?.context.userId ?? "";
    const result = createTicketForUser(userId, subject, description);

    return result.message;
  },
});

export const technicalTools = [searchKb, getTicketStatus, createSupportTicket];
