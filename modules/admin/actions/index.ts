"use server";

import prisma from "@/lib/db";
import { requireAuth } from "@/modules/auth/actions";

async function requireAdmin() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    throw new Error("Admin access required.");
  }
}

export async function getAdminTickets() {
  await requireAdmin();

  return prisma.ticket.findMany({
    where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
    include: {
      user: { select: { name: true, email: true } },
      conversation: { select: { title: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function sendHumanReply(ticketId: string, content: string) {
  await requireAdmin();

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    throw new Error("Ticket not found.");
  }

  const reply = content.trim();
  if (!reply) {
    throw new Error("Reply cannot be empty.");
  }

  await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId: ticket.conversationId,
        content: reply,
        role: "ASSISTANT",
        agentName: "Human Support",
      },
    }),
    prisma.ticket.update({
      where: { id: ticketId },
      data: { status: "IN_PROGRESS" },
    }),
  ]);
}

export async function resolveTicket(ticketId: string) {
  await requireAdmin();

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: "RESOLVED" },
  });
}
