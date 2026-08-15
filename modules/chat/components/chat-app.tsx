"use client";

import { useRef, useState } from "react";
import { MoreHorizontalIcon, PlusIcon, SendIcon } from "lucide-react";
import { useConversations } from "@/modules/conversations/hooks/useConversations";
import {
  createConversation,
  deleteConversation,
  updateConversation,
} from "@/modules/conversations/actions";
import { useChatStream } from "@/modules/messages/hooks/use-chat-stream";
import { useMessages } from "@/modules/messages/hooks/useMessages";
import {
  deleteMessage,
  updateMessage,
} from "@/modules/messages/actions";
import { useOpenTicket } from "@/modules/tickets/hooks/use-open-ticket";
import { signOutAction } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { MarkdownMessage } from "@/components/ui/markdown-message";
import { ToolBadgeList } from "@/components/ui/tool-badge";
import {
  Message,
  MessageContent,
  MessageGroup,
} from "@/components/ui/message";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ChatApp({ isAdmin = false }: { isAdmin?: boolean }) {
  const { data: conversations = [], refetch: refetchConversations } =
    useConversations();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const activeId =
    selectedId && conversations.some((conversation) => conversation.id === selectedId)
      ? selectedId
      : (conversations[0]?.id ?? null);

  const selectedConversation = conversations.find(
    (conversation) => conversation.id === activeId,
  );

  async function handleNewChat() {
    setIsCreating(true);

    try {
      const conversation = await createConversation("New chat");
      setSelectedId(conversation.id);
      await refetchConversations();
    } finally {
      setIsCreating(false);
    }
  }

  function openRename(id: string, title: string) {
    setRenameId(id);
    setRenameTitle(title);
  }

  async function handleRename() {
    if (!renameId) return;

    await updateConversation(renameId, renameTitle);
    setRenameId(null);
    await refetchConversations();
  }

  async function handleDelete(id: string) {
    await deleteConversation(id);

    if (selectedId === id) {
      setSelectedId(null);
    }

    await refetchConversations();
  }

  return (
    <div className="flex h-svh min-h-0 bg-background">
      <aside className="flex w-72 shrink-0 flex-col border-r">
        <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <h1 className="text-base font-semibold tracking-tight">Supportly</h1>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <Link
                href="/admin/tickets"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Tickets
              </Link>
            ) : null}
            <form action={signOutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                Sign out
              </Button>
            </form>
          </div>
        </div>

        <div className="px-4 py-4">
          <Button
            className="w-full"
            onClick={handleNewChat}
            disabled={isCreating}
          >
            <PlusIcon />
            New chat
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "group flex items-center gap-1 rounded-xl",
                activeId === conversation.id && "bg-muted",
              )}
            >
              <button
                type="button"
                className="min-w-0 flex-1 truncate px-3 py-2.5 text-left text-sm leading-none"
                onClick={() => setSelectedId(conversation.id)}
              >
                {conversation.title}
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="mr-1 shrink-0 opacity-70 group-hover:opacity-100"
                    />
                  }
                >
                  <MoreHorizontalIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      openRename(conversation.id, conversation.title)
                    }
                  >
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(conversation.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        {selectedConversation ? (
          <ChatMessages
            conversationId={selectedConversation.id}
            title={selectedConversation.title}
            onConversationChange={refetchConversations}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-8 text-center">
            <p className="text-base font-medium">Start your first conversation</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Create a new chat to begin messaging.
            </p>
            <Button className="mt-2" onClick={handleNewChat} disabled={isCreating}>
              <PlusIcon />
              New chat
            </Button>
          </div>
        )}
      </main>

      <Dialog open={!!renameId} onOpenChange={() => setRenameId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename chat</DialogTitle>
          </DialogHeader>
          <Input
            value={renameTitle}
            onChange={(e) => setRenameTitle(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChatMessages({
  conversationId,
  title,
  onConversationChange,
}: {
  conversationId: string;
  title: string;
  onConversationChange: () => Promise<unknown>;
}) {
  const { data: messages = [], refetch: refetchMessages } =
    useMessages(conversationId);
  const { data: openTicket } = useOpenTicket(conversationId);
  const isEscalated = !!openTicket;

  const bottomRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function refreshMessages() {
    await Promise.all([refetchMessages(), onConversationChange()]);
  }

  const {
    sendMessage,
    isStreaming,
    streamingContent,
    streamingAgentName,
    streamingTools,
    lockedNotice,
  } = useChatStream(refreshMessages);

  const [content, setContent] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || isStreaming || isEscalated) return;

    const message = content.trim();
    setContent("");

    await sendMessage({
      conversationId,
      content: message,
      onChunk: scrollToBottom,
    });

    scrollToBottom();
  }

  function openEdit(id: string, text: string) {
    setEditId(id);
    setEditContent(text);
  }

  async function handleEditSave() {
    if (!editId) return;

    await updateMessage(editId, editContent);
    setEditId(null);
    await refetchMessages();
  }

  async function handleDelete(id: string) {
    await deleteMessage(id);
    await refetchMessages();
  }

  return (
    <>
      <div className="border-b px-6 py-4">
        <h2 className="truncate text-base font-semibold tracking-tight">{title}</h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 && !isStreaming ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Send a message to start the chat
          </p>
        ) : (
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-end">
            <MessageGroup className="w-full gap-5">
              {messages.map((message) => {
                const isUser = message.role === "USER";

                return (
                  <Message
                    key={message.id}
                    align={isUser ? "end" : "start"}
                    className="group/msg w-full"
                  >
                    <MessageContent
                      className={cn(
                        "w-auto max-w-[80%] gap-1.5",
                        isUser ? "ml-auto items-end" : "mr-auto items-start",
                      )}
                    >
                      {!isUser && message.agentName ? (
                        <AgentBadge name={message.agentName} />
                      ) : null}
                      {!isUser ? (
                        <ToolBadgeList tools={message.toolsUsed} />
                      ) : null}
                      <div
                        className={cn(
                          "flex items-center gap-1.5",
                          isUser && "flex-row-reverse",
                        )}
                      >
                        <Bubble
                          variant={isUser ? "default" : "muted"}
                          align={isUser ? "end" : "start"}
                          className="max-w-full"
                        >
                          <BubbleContent className="text-sm leading-relaxed">
                            {isUser ? (
                              <span className="whitespace-pre-wrap">
                                {message.content}
                              </span>
                            ) : (
                              <MarkdownMessage content={message.content} />
                            )}
                          </BubbleContent>
                        </Bubble>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                className="shrink-0 opacity-0 group-hover/msg:opacity-100"
                              />
                            }
                          >
                            <MoreHorizontalIcon />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                openEdit(message.id, message.content)
                              }
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(message.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </MessageContent>
                  </Message>
                );
              })}

              {isStreaming ? (
                <Message align="start" className="w-full">
                  <MessageContent className="mr-auto w-auto max-w-[80%] items-start gap-1.5">
                    {streamingAgentName ? (
                      <AgentBadge name={streamingAgentName} />
                    ) : null}
                    <ToolBadgeList tools={streamingTools} />
                    {streamingContent ? (
                      <Bubble variant="muted" align="start" className="max-w-full">
                        <BubbleContent className="text-sm leading-relaxed">
                          <MarkdownMessage
                            content={streamingContent}
                            isAnimating
                          />
                        </BubbleContent>
                      </Bubble>
                    ) : (
                      <p className="text-sm text-muted-foreground">Thinking…</p>
                    )}
                  </MessageContent>
                </Message>
              ) : null}

              {lockedNotice && !isStreaming ? (
                <Message align="start" className="w-full">
                  <MessageContent className="mr-auto w-auto max-w-[80%] items-start gap-1.5">
                    <AgentBadge name="Human Support" />
                    <Bubble variant="muted" align="start" className="max-w-full">
                      <BubbleContent className="text-sm leading-relaxed">
                        <MarkdownMessage content={lockedNotice} />
                      </BubbleContent>
                    </Bubble>
                  </MessageContent>
                </Message>
              ) : null}
            </MessageGroup>
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {isEscalated ? (
        <div className="border-t px-6 py-5">
          <div className="mx-auto max-w-3xl rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
            This conversation is with human support now. AI replies are turned
            off until the ticket is resolved.
            {openTicket ? (
              <span className="mt-1 block text-xs">
                Ticket: {openTicket.id} · Priority: {openTicket.priority}
              </span>
            ) : null}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSend} className="border-t px-6 py-5">
          <InputGroup className="mx-auto max-w-3xl has-[textarea]:h-auto">
            <InputGroupTextarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Send a message..."
              rows={1}
              className="min-h-10 py-3 text-sm"
              disabled={isStreaming}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <InputGroupAddon align="inline-end" className="pr-2">
              <InputGroupButton
                type="submit"
                size="icon-sm"
                disabled={isStreaming}
              >
                <SendIcon />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>
      )}

      <Dialog open={!!editId} onOpenChange={() => setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit message</DialogTitle>
          </DialogHeader>
          <InputGroup className="has-[textarea]:h-auto">
            <InputGroupTextarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
            />
          </InputGroup>
          <DialogFooter>
            <Button onClick={handleEditSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AgentBadge({ name }: { name: string }) {
  return (
    <span className="text-xs font-medium text-muted-foreground">{name}</span>
  );
}
