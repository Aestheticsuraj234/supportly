"use client";

import { useState } from "react";
import { readChatStream } from "../lib/read-chat-stream";

type SendMessageInput = {
    conversationId: string;
    content: string;
    onChunk?: () => void;
}

export function useChatStream(onMessagesChange: () => Promise<unknown>) {
    const [streamingContent, setStreamingContent] = useState("");
    const [streamingAgentName, setStreamingAgentName] = useState<string | null>(
        null,
    );
    const [streamingTools, setStreamingTools] = useState<string[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);

    async function sendMessage({
        conversationId,
        content,
        onChunk,
      }: SendMessageInput) {
        setIsStreaming(true);
        setStreamingContent("");
        setStreamingAgentName(null);
        setStreamingTools([]);
    
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
    
          await onMessagesChange();
    
          await readChatStream(response, {
            onAgent: setStreamingAgentName,
            onTool: (toolName) => {
              setStreamingTools((current) =>
                current.includes(toolName) ? current : [...current, toolName],
              );
              onChunk?.();
            },
            onText: (text) => {
              setStreamingContent(text);
              onChunk?.();
            },
          });
    
          setStreamingContent("");
          setStreamingAgentName(null);
          setStreamingTools([]);
          await onMessagesChange();
        } finally {
          setIsStreaming(false);
        }
      }
    

    return {
        sendMessage,
    isStreaming,
    streamingContent,
    streamingAgentName,
    streamingTools,
    };
}