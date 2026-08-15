"use server";

import prisma from "@/lib/db";
import type { TicketPriority } from "@/lib/generated/prisma/client";
import { requireAuth } from "@/modules/auth/actions";

type CreateEscalationTicketInput = {
  userId: string;
  conversationId: string;
  title: string;
  description: string;
  priority: TicketPriority;
};

/**
 * Returns an active ticket for this conversation, if one exists.
 * Active = OPEN or IN_PROGRESS (conversation is AI-locked).
 */
export async function getOpenTicketForConversation(
  conversationId: string,
  userId: string,
) {
  return prisma.ticket.findFirst({
    where: {
      conversationId,
      userId,
      status: { in: ["OPEN", "IN_PROGRESS"] },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Client-friendly helper: uses the signed-in user automatically. */
export async function getOpenTicketForCurrentConversation(
  conversationId: string,
) {
  const session = await requireAuth();
  return getOpenTicketForConversation(conversationId, session.user.id);
}

/**
 * Creates a human escalation ticket.
 * If the conversation already has an active ticket, returns that one instead.
 */
export async function createEscalationTicket({
  userId,
  conversationId,
  title,
  description,
  priority,
}: CreateEscalationTicketInput) {
  const existing = await getOpenTicketForConversation(conversationId, userId);

  if (existing) {
    return {
      ticket: existing,
      created: false,
      message: `A human support ticket already exists for this conversation. Reference: ${existing.id}`,
    };
  }

  const ticket = await prisma.ticket.create({
    data: {
      userId,
      conversationId,
      title,
      description,
      priority,
      status: "OPEN",
    },
  });

  return {
    ticket,
    created: true,
    message: `Human escalation ticket created. Reference: ${ticket.id}. Priority: ${ticket.priority}. A human agent will follow up soon.`,
  };
}

export async function getTicketByIdForUser(ticketId: string, userId: string) {
  return prisma.ticket.findFirst({
    where: {
      id: ticketId,
      userId,
    },
  });
}

export async function getTicketsForUser(userId: string) {
  return prisma.ticket.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
