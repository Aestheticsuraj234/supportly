"use client";

import { useQuery } from "@tanstack/react-query";
import { getOpenTicketForCurrentConversation } from "../actions";

export function useOpenTicket(conversationId: string | null) {
  return useQuery({
    queryKey: ["open-ticket", conversationId],
    queryFn: () => getOpenTicketForCurrentConversation(conversationId!),
    enabled: !!conversationId,
  });
}
