import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { runStreamingSupportChat } from "@/modules/ai/run-streaming-chat";

const streamHeaders = {
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-cache",
};


export async function POST(request: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
        return new Response("OpenAI API key is not set", { status: 500 });
    }

    const { conversationId, content } = await request.json();

    if (!conversationId || !content) {
        return new Response("Conversation ID and content are required", { status: 400 });
    };

    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            userId: session.user.id,
        },
    });

    if (!conversation) {
        return new Response("Conversation not found", { status: 404 });
    }

    const stream = await runStreamingSupportChat(conversationId, content, {
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name,
        conversationId,
    });

    return new Response(stream, { headers: streamHeaders });
}