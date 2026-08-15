import { tool } from "@openai/agents";
import { z } from "zod";
import type { SupportContext } from "../context";
import { searchKnowledgeBase } from "../data/mock-store";
import {
  getTicketByIdForUser,
  getTicketsForUser,
} from "@/modules/tickets/actions";

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
  description: "Look up a human support ticket by ID for the current user.",
  parameters: z.object({
    ticketId: z.string().describe("The ticket ID"),
  }),
  execute: async ({ ticketId }, context) => {
    const userId = context?.context.userId ?? "";
    const ticket = await getTicketByIdForUser(ticketId, userId);

    if (!ticket) {
      const openTickets = await getTicketsForUser(userId);
      return `Ticket ${ticketId} not found. Your tickets: ${JSON.stringify(openTickets, null, 2)}`;
    }

    return JSON.stringify(ticket, null, 2);
  },
});

export const technicalTools = [searchKb, getTicketStatus];
