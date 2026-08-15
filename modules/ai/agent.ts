import { Agent } from "@openai/agents";

export const supportAgent = new Agent({
    name: "Supportly Assistant",
    instructions: "You are a friendly customer support assistant for Supportly. " +
        "Answer clearly, keep replies concise, and ask follow-up questions when helpful.",
    model: "gpt-4o-mini",
})