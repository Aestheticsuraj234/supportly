import { Agent } from "@openai/agents";
import type { SupportContext } from "../context";
import { withhandoffPrompt } from "../prompts";
import { technicalTools } from "../tools/technical-tools";

export const technicalAgent = new Agent<SupportContext>({
    name: "Technical Agent",
    handoffDescription:
        "Handles bugs, troubleshooting, support tickets, and technical issues.",
    instructions: withhandoffPrompt(`You are the Technical Agent for Supportly.
        Help customers troubleshoot issues, search the knowledge base, and manage support tickets.
        Use your tools to find accurate information before answering.
        Keep replies concise and friendly.`),
    model: "gpt-4o-mini",
    tools: technicalTools,
})