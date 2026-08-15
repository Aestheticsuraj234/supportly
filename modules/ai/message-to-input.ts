import { Message, MESSAGE_ROLE } from "@/lib/generated/prisma/client";
import { assistant, user, type AgentInputItem } from "@openai/agents";

export function messageToInput(messages:Message[]): AgentInputItem[] {

    return messages.map((message)=>{
        if(message.role === MESSAGE_ROLE.USER){
            return user(message.content);
        }

        return assistant(message.content);
    });
}