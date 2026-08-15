import type {
    InputGuardrail,
    OutputGuardrail,
} from "@openai/agents";

export function getInputText(input: string | unknown[]): string {
    if (typeof input === "string") {
        return input;
    }

    return input
        .map((item) => {
            if (!item || typeof item !== "object") return "";

            const message = item as {
                role?: string;
                content?: string | unknown[];
            };

            if (message.role !== "user") return "";

            if (typeof message.content === "string") {
                return message.content;
            }

            return "";
        })
        .filter(Boolean)
        .join("\n");
}


function getOutputText(output: unknown): string {
    if (typeof output === "string") return output;
    if (output == null) return "";
    return String(output);
}

const bannedInputWords = [
    "ignore previous instructions",
    "ignore all instructions",
    "jailbreak",
    "hack the system",
    "bypass security",
];

const abusiveWords = ["kill yourself", "bomb threat"];

const secretPatterns = [
    /sk-[a-zA-Z0-9]{10,}/,
    /api[_-]?key\s*[:=]\s*\S+/i,
    /password\s*[:=]\s*\S+/i,
];

export function createInputGuardrail(agentLabel: string): InputGuardrail {
    return {
      name: `${agentLabel} input guardrail`,
      // Wait for the check before calling the model (safer + cheaper).
      runInParallel: false,
      execute: async ({ input }) => {
        const text = getInputText(input).toLowerCase();
  
        const foundBanned = bannedInputWords.find((word) => text.includes(word));
        if (foundBanned) {
          return {
            tripwireTriggered: true,
            outputInfo: {
              agent: agentLabel,
              reason: "jailbreak_attempt",
              matched: foundBanned,
            },
          };
        }
  
        const foundAbuse = abusiveWords.find((word) => text.includes(word));
        if (foundAbuse) {
          return {
            tripwireTriggered: true,
            outputInfo: {
              agent: agentLabel,
              reason: "abusive_language",
              matched: foundAbuse,
            },
          };
        }
  
        return {
          tripwireTriggered: false,
          outputInfo: { agent: agentLabel, reason: "ok" },
        };
      },
    };
  }

  export function createOutputGuardrail(agentLabel: string): OutputGuardrail {
    return {
      name: `${agentLabel} output guardrail`,
      execute: async ({ agentOutput }) => {
        const text = getOutputText(agentOutput);
  
        const matchedSecret = secretPatterns.find((pattern) =>
          pattern.test(text),
        );
  
        if (matchedSecret) {
          return {
            tripwireTriggered: true,
            outputInfo: {
              agent: agentLabel,
              reason: "possible_secret_leak",
            },
          };
        }
  
        return {
          tripwireTriggered: false,
          outputInfo: { agent: agentLabel, reason: "ok" },
        };
      },
    };
  }

  /** Friendly message shown to the user when a guardrail blocks the run. */
export function getGuardrailUserMessage(error: unknown): string {
    const info =
      error &&
      typeof error === "object" &&
      "result" in error &&
      error.result &&
      typeof error.result === "object" &&
      "output" in error.result
        ? (error.result as { output?: { outputInfo?: { reason?: string } } })
            .output?.outputInfo
        : undefined;
  
    if (info?.reason === "jailbreak_attempt") {
      return "I can't follow requests that try to override my instructions. Please ask a normal support question.";
    }
  
    if (info?.reason === "abusive_language") {
      return "I want to help, but I can't continue with that kind of language. Please rephrase your question.";
    }
  
    if (info?.reason === "possible_secret_leak") {
      return "I almost shared something sensitive, so I stopped that reply. Please ask again without requesting secrets.";
    }
  
    return "Your message was blocked by a safety check. Please try rephrasing your question.";
  }
  