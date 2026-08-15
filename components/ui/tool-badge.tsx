"use client";

import {
  BookOpenIcon,
  FileTextIcon,
  HeadsetIcon,
  PackageIcon,
  ReceiptIcon,
  RefreshCcwIcon,
  TicketIcon,
  WrenchIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const toolStyles: Record<
  string,
  { label: string; icon: typeof WrenchIcon; className: string }
> = {
  get_invoices: {
    label: "Get invoices",
    icon: ReceiptIcon,
    className: "bg-emerald-100 text-emerald-800",
  },
  get_invoice_details: {
    label: "Invoice details",
    icon: FileTextIcon,
    className: "bg-emerald-100 text-emerald-800",
  },
  request_refund: {
    label: "Request refund",
    icon: RefreshCcwIcon,
    className: "bg-amber-100 text-amber-800",
  },
  track_order: {
    label: "Track order",
    icon: PackageIcon,
    className: "bg-sky-100 text-sky-800",
  },
  get_order_status: {
    label: "Order status",
    icon: PackageIcon,
    className: "bg-sky-100 text-sky-800",
  },
  search_knowledge_base: {
    label: "Search knowledge base",
    icon: BookOpenIcon,
    className: "bg-violet-100 text-violet-800",
  },
  get_ticket_status: {
    label: "Ticket status",
    icon: TicketIcon,
    className: "bg-violet-100 text-violet-800",
  },
  create_support_ticket: {
    label: "Create ticket",
    icon: TicketIcon,
    className: "bg-orange-100 text-orange-800",
  },
  create_human_escalation_ticket: {
    label: "Human escalation",
    icon: HeadsetIcon,
    className: "bg-rose-100 text-rose-800",
  },
};

const fallbackStyle = {
  label: "Tool",
  icon: WrenchIcon,
  className: "bg-muted text-muted-foreground",
};

type ToolBadgeProps = {
  name: string;
};

export function ToolBadge({ name }: ToolBadgeProps) {
  const style = toolStyles[name] ?? {
    ...fallbackStyle,
    label: name.replaceAll("_", " "),
  };
  const Icon = style.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
        style.className,
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      {style.label}
    </span>
  );
}

type ToolBadgeListProps = {
  tools: string[];
};

export function ToolBadgeList({ tools }: ToolBadgeListProps) {
  if (tools.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tools.map((tool) => (
        <ToolBadge key={tool} name={tool} />
      ))}
    </div>
  );
}
