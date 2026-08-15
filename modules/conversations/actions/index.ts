"use server";
import prisma from "@/lib/db";
import { requireAuth } from "@/modules/auth/actions";

export async function getConversations() {
    const session = await requireAuth();

    return prisma.conversation.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
    });
}


export async function createConversation(title = "New chat") {
    const session = await requireAuth();

    return prisma.conversation.create({
        data: {
            title,
            userId: session.user.id,
        },
    });
}


export async function updateConversation(id: string, title: string) {
    const session = await requireAuth();

    return prisma.conversation.updateMany({
        where: { id, userId: session.user.id },
        data: { title },
    });
}

export async function deleteConversation(id: string) {
    const session = await requireAuth();

    return prisma.conversation.deleteMany({
        where: { id, userId: session.user.id },
    });
}
