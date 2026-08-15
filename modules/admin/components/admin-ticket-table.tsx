"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type ColumnDef,
  type StockFeatures,
  flexRender,
  stockFeatures,
  useTable,
} from "@tanstack/react-table";
import { MessageCircleIcon } from "lucide-react";
import {
  resolveTicket,
  sendHumanReply,
} from "@/modules/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export type AdminTicket = {
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  user: { name: string; email: string };
  conversation: { title: string };
};

type AdminTicketTableProps = {
  tickets: AdminTicket[];
};

export function AdminTicketTable({ tickets }: AdminTicketTableProps) {
  const [rows, setRows] = useState(tickets);
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(
    null,
  );
  const [reply, setReply] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setRows(tickets);
  }, [tickets]);

  const closeReplyDialog = useCallback(() => {
    setSelectedTicket(null);
    setReply("");
  }, []);

  const handleReply = useCallback(async () => {
    if (!selectedTicket || !reply.trim()) return;

    setIsSaving(true);
    try {
      await sendHumanReply(selectedTicket.id, reply);
      setRows((current) =>
        current.map((ticket) =>
          ticket.id === selectedTicket.id
            ? { ...ticket, status: "IN_PROGRESS" }
            : ticket,
        ),
      );
      closeReplyDialog();
    } finally {
      setIsSaving(false);
    }
  }, [closeReplyDialog, reply, selectedTicket]);

  const handleResolve = useCallback(async (ticketId: string) => {
    await resolveTicket(ticketId);
    setRows((current) => current.filter((ticket) => ticket.id !== ticketId));
  }, []);

  const columns = useMemo<ColumnDef<StockFeatures, AdminTicket>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Ticket",
        cell: ({ row }) => (
          <div className="min-w-48">
            <p className="font-medium">{row.original.title}</p>
            <p className="max-w-72 truncate text-xs text-muted-foreground">
              {row.original.description}
            </p>
          </div>
        ),
      },
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => (
          <div>
            <p>{row.original.user.name}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.user.email}
            </p>
          </div>
        ),
      },
      {
        id: "conversation",
        header: "Conversation",
        cell: ({ row }) => row.original.conversation.title,
      },
      {
        accessorKey: "priority",
        header: "Priority",
      },
      {
        accessorKey: "status",
        header: "Status",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedTicket(row.original)}
            >
              <MessageCircleIcon />
              Reply
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleResolve(row.original.id)}
            >
              Resolve
            </Button>
          </div>
        ),
      },
    ],
    [handleResolve],
  );

  const table = useTable({
    features: stockFeatures,
    data: rows,
    columns,
  });

  return (
    <>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-10 text-center">
                No pending tickets.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog
        open={!!selectedTicket}
        onOpenChange={(open) => !open && closeReplyDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply as human support</DialogTitle>
          </DialogHeader>
          <Textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder="Write your reply to the customer..."
          />
          <DialogFooter>
            <Button
              onClick={handleReply}
              disabled={isSaving || !reply.trim()}
            >
              Send reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
