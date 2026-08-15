"use client";

import { useState } from "react";
import { readTextStream } from "../lib/read-text-stream";

type SendMessageInput = {
    conversationId: string;
    content: string;
    onChunk?: () => void;
}

export function useChatStream(onMessageChange: () => Promise<unknown>) {
    const [streamingContent, setStreamingContent] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);

    async function sendMessage({ conversationId, content, onChunk }: SendMessageInput) {
        setIsStreaming(true);
        setStreamingContent("");

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversationId, content }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to send message");
            }

            await onMessageChange();

            await readTextStream(response, (text) => {
                setStreamingContent(text);
                onChunk?.();
            });

            setStreamingContent("");
            await onMessageChange();
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsStreaming(false);

        }
    }

    return {
        streamingContent,
        isStreaming,
        sendMessage,
    };
}