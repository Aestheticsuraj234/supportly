"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createMessage,
    deleteMessage,
    getMessages,
    updateMessage,
} from "../actions";

export function useMessages(conversationId: string | null) {
    return useQuery({
        queryKey: ["messages", conversationId],
        queryFn: () => getMessages(conversationId!),
        enabled: !!conversationId,
    });
}

export function useCreateMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            conversationId,
            content,
        }: {
            conversationId: string;
            content: string;
        }) => createMessage(conversationId, content),
        onSuccess: (_, { conversationId }) => {
            queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
    });
}

export function useUpdateMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, content }: { id: string; content: string }) =>
            updateMessage(id, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages"] });
        },
    });
}

export function useDeleteMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteMessage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages"] });
        },
    });
}
