/**
 * Reads a plain-text streaming HTTP response chunk by chunk.
 * Calls `onUpdate` whenever more text has arrived.
 */
export async function readTextStream(
    response: Response,
    onUpdate: (fullText: string) => void,
  ) {
    if (!response.body) {
      throw new Error("No response stream");
    }
  
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
  
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
  
      fullText += decoder.decode(value, { stream: true });
      onUpdate(fullText);
    }
  
    return fullText;
  }
  