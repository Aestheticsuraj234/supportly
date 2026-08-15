"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getConversations, createConversation, updateConversation, deleteConversation } from "../actions";


export function useConversations() {
    return useQuery({
        queryKey: ["conversations"],
        queryFn: getConversations,
    });
}


export function useCreateConversation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (title?: string) => createConversation(title),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
    });
}


export function useUpdateConversation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, title }: { id: string; title: string }) =>
            updateConversation(id, title),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
    });
}

export function useDeleteConversation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteConversation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
    });
}
