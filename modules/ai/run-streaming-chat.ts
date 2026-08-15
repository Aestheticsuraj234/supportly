import { run } from "@openai/agents";
import prisma from "@/lib/db";

import { messageToInput } from "./message-to-input";
import { MESSAGE_ROLE } from "@/lib/generated/prisma/client";
import { SupportContext } from "./context";
import { triageAgent } from "./agents";


async function saveUserMessage(conversationId: string, content: string) {
	await prisma.message.create({
		data: {
			conversationId,
			content,
			role: MESSAGE_ROLE.USER,
		},
	});
}


async function saveAssistantMessage(conversationId: string, content: string, agentName: string | null, toolsUsed: string[]) {
	await prisma.message.create({
		data: {
			conversationId,
			content,
			role: MESSAGE_ROLE.ASSISTANT,
			agentName,
			toolsUsed,
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

type ChatStreamEvent =
	| { type: "agent"; name: string }
	| { type: "tool"; name: string }
	| { type: "text"; delta: string };


function getToolName(item: {
	type?: string;
	rawItem?: { type?: string; name?: string };
}) {
	if (
		item.type === "tool_call_item" &&
		item.rawItem?.type === "function_call" &&
		item.rawItem.name
	) {
		return item.rawItem.name;
	}

	return null;
}

function encodeEvent(event: ChatStreamEvent) {
	return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

export async function runStreamingSupportChat(conversationId: string, userMessage: string, context: SupportContext) {
	await saveUserMessage(conversationId, userMessage);

	const messages = await getConversationMessages(conversationId);

	const agentStream = await run(triageAgent, messageToInput(messages), { stream: true, context });


	let assistantReply = "";
	let activeAgentName: string | null = triageAgent.name;
	const toolsUsed: string[] = []

	return new ReadableStream<Uint8Array>({
		async start(controller) {
			try {
				if (activeAgentName) {
					controller.enqueue(
						encodeEvent({ type: "agent", name: activeAgentName })
					)
				}

				for await (const event of agentStream) {
					if (event.type === "agent_updated_stream_event") {
						activeAgentName = event.agent.name;
						controller.enqueue(
							encodeEvent({ type: "agent", name: activeAgentName })
						);
					}

					if (
						event.type === "run_item_stream_event" &&
						event.name === "tool_called"
					) {
						const toolName = getToolName(event.item);
						if (toolName && !toolsUsed.includes(toolName)) {
							toolsUsed.push(toolName);
							controller.enqueue(
								encodeEvent({ type: "tool", name: toolName })
							)
						}

					}

					if (
						event.type === "raw_model_stream_event" &&
						event.data.type === "output_text_delta"
					) {
						const delta = event.data.delta;
						assistantReply += delta;
						controller.enqueue(
							encodeEvent({ type: "text", delta: delta })
						)
					}
				}

				await agentStream.completed;
				await saveAssistantMessage(conversationId, assistantReply, activeAgentName, toolsUsed);
				controller.close();
			} catch (error) {
				controller.error(error);
			} finally {
				controller.close();
			}
		},
	});
}