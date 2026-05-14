import { useEffect, useRef } from "react";
import type { ChatMessage } from "../types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

interface MessageListProps {
  messages: ChatMessage[];
  loading: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {messages.length === 0 && !loading && (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              How can I help?
            </p>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Ask about the demo prediction, feature importance, model confidence, or treatment
              considerations. Use the chips below to get started.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} role={m.role} content={m.content} />
        ))}
        {loading && (
          <div className="flex justify-start pl-10">
            <TypingIndicator />
          </div>
        )}
        <div ref={bottom} className="h-px shrink-0" aria-hidden />
      </div>
    </div>
  );
}
