"use client";

import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

type MarkdownMessageProps = {
  content: string;
  isAnimating?: boolean;
  className?: string;
};

/**
 * Renders AI markdown nicely (bold, lists, etc.) while text streams in.
 */
export function MarkdownMessage({
  content,
  isAnimating = false,
  className,
}: MarkdownMessageProps) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none text-sm leading-relaxed dark:prose-invert",
        "[&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5",
        className,
      )}
    >
      <Streamdown isAnimating={isAnimating}>{content}</Streamdown>
    </div>
  );
}
