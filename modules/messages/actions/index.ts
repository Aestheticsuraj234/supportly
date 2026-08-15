"use server";
import prisma from "@/lib/db";
import { requireAuth } from "@/modules/auth/actions";


export async function getMessages(conversationId: string) {
    await requireAuth();

    return prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
    });
}

export async function createMessage(conversationId: string, content: string) {
    await requireAuth();

    const message = await prisma.message.create({
        data: {
            conversationId,
            content,
            role: "USER",
        },
    });

    await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
    });

    return message;
}


export async function updateMessage(id: string, content: string) {
    await requireAuth();

    return prisma.message.update({
        where: { id },
        data: { content },
    });
}

export async function deleteMessage(id: string) {
    await requireAuth();

    return prisma.message.delete({
        where: { id },
    });
}
