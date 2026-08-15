import { run } from "@openai/agents";
import prisma from "@/lib/db";
import { supportAgent } from "./agent";
import { messageToInput } from "./message-to-input";
import { MESSAGE_ROLE } from "@/lib/generated/prisma/client";


async function saveUserMessage(conversationId: string, content: string) {
    await prisma.message.create({
        data: {
            conversationId,
            content,
            role: MESSAGE_ROLE.USER,
        },
    });
}


async function saveAssistantMessage(conversationId: string, content: string) {
    await prisma.message.create({
        data: {
            conversationId,
            content,
            role: MESSAGE_ROLE.ASSISTANT,
        },
    });

    await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
    });
}


async function getConversationMessages(conversationId: string) {
    return prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
    });
}

export async function runStreamingSupportChat(conversationId: string, userMessage: string) {
    await saveUserMessage(conversationId, userMessage);

    const messages = await getConversationMessages(conversationId);

    const agentStream = await run(supportAgent, messageToInput(messages), { stream: true });

    const textStream = agentStream.toTextStream();
    let assistantReply = "";

    return new ReadableStream<string>({
        async start(controller) {
            try {
                for await (const chunk of textStream) {
                    assistantReply += chunk;
                    controller.enqueue(chunk);
                }

                await agentStream.completed;
                await saveAssistantMessage(conversationId, assistantReply);
                controller.close();
            } catch (error) {
                controller.error(error);
            } finally {
                controller.close();
            }
        },
    });
}