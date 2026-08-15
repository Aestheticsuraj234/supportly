import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { runStreamingSupportChat } from "@/modules/ai/run-streaming-chat";
import { getOpenTicketForConversation } from "@/modules/tickets/actions";

const streamHeaders = {
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-cache",
};

function encodeEvent(event: { type: string; name?: string; delta?: string }) {
    return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
  }


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

      // If this chat already has a human ticket, stop talking to AI.
  const openTicket = await getOpenTicketForConversation(
    conversationId,
    session.user.id,
  );

  if (openTicket) {
    const message =
      "This conversation has been escalated to a human. Please wait for their reply.";

    const lockedStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encodeEvent({ type: "agent", name: "Human Support" }),
        );
        controller.enqueue(encodeEvent({ type: "text", delta: message }));
        controller.close();
      },
    });

    return new Response(lockedStream, {
      headers: {
        ...streamHeaders,
        "X-Conversation-Locked": "true",
      },
    });
  }

    const stream = await runStreamingSupportChat(conversationId, content, {
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name,
        conversationId,
    });

    return new Response(stream, { headers: streamHeaders });
}