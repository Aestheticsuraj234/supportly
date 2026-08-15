"use client";

import { useState } from "react";
import { readChatStream } from "../lib/read-chat-stream";
import { useQueryClient } from "@tanstack/react-query";

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
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const queryClient = useQueryClient();

  async function sendMessage({
    conversationId,
    content,
    onChunk,
  }: SendMessageInput) {
    setIsStreaming(true);
    setStreamingContent("");
    setStreamingAgentName(null);
    setStreamingTools([]);
    setLockedNotice(null);

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

      const wasLocked = response.headers.get("X-Conversation-Locked") === "true";

      if (!wasLocked) {
        await onMessagesChange();
      }

      const fullText = await readChatStream(response, {
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

      if (wasLocked) {
        setLockedNotice(fullText);
        setStreamingContent("");
        setStreamingAgentName(null);
        setStreamingTools([]);
        await queryClient.invalidateQueries({
          queryKey: ["open-ticket", conversationId],
        });
        return fullText;
      }

      setStreamingContent("");
      setStreamingAgentName(null);
      setStreamingTools([]);
      await onMessagesChange();
      await queryClient.invalidateQueries({
        queryKey: ["open-ticket", conversationId],
      });

      return fullText;
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
    lockedNotice,
  };
}