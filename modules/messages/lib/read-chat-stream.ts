type ChatStreamEvent =
  | { type: "agent"; name: string }
  | { type: "tool"; name: string }
  | { type: "text"; delta: string };

type ReadChatStreamOptions = {
  onAgent: (name: string) => void;
  onTool: (name: string) => void;
  onText: (fullText: string) => void;
};

function parseEvent(line: string): ChatStreamEvent | null {
  try {
    return JSON.parse(line) as ChatStreamEvent;
  } catch {
    return null;
  }
}

function handleEvent(
  event: ChatStreamEvent,
  { onAgent, onTool, onText }: ReadChatStreamOptions,
  state: { fullText: string },
) {
  if (event.type === "agent") {
    onAgent(event.name);
  }

  if (event.type === "tool") {
    onTool(event.name);
  }

  if (event.type === "text") {
    state.fullText += event.delta;
    onText(state.fullText);
  }
}

/**
 * Reads an NDJSON chat stream from the API.
 * Each line is a JSON event: agent switch, tool call, or text delta.
 */
export async function readChatStream(
  response: Response,
  callbacks: ReadChatStreamOptions,
) {
  if (!response.body) {
    throw new Error("No response stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const state = { fullText: "" };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;

      const event = parseEvent(line);
      if (!event) continue;

      handleEvent(event, callbacks, state);
    }
  }

  if (buffer.trim()) {
    const event = parseEvent(buffer);
    if (event) {
      handleEvent(event, callbacks, state);
    }
  }

  return state.fullText;
}
