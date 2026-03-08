"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConfidenceIndicator } from "@/components/confidence-indicator";
import { Send, Loader2, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  confidence?: "high" | "medium" | "low" | null;
}

interface ChatInterfaceProps {
  advisorId: string;
  advisorName: string;
}

export function ChatInterface({ advisorId, advisorName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", confidence: null },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advisorId,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          message: userMessage.content,
        }),
      });

      if (!response.ok) throw new Error("Chat failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let confidence: "high" | "medium" | "low" | null = null;

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullContent += chunk;

        // Parse confidence from accumulated content
        if (!confidence) {
          const highMatch = fullContent.match(/\[CONFIDENCE:HIGH\]/i);
          const medMatch = fullContent.match(/\[CONFIDENCE:MEDIUM\]/i);
          const lowMatch = fullContent.match(/\[CONFIDENCE:LOW\]/i);
          if (highMatch) confidence = "high";
          else if (medMatch) confidence = "medium";
          else if (lowMatch) confidence = "low";
        }

        // Clean confidence tag from display
        const cleanContent = fullContent
          .replace(/\[CONFIDENCE:(HIGH|MEDIUM|LOW)\]\s*/gi, "")
          .trim();

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: cleanContent, confidence }
              : m
          )
        );
      }

      // Save to database
      await fetch("/api/chat/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          advisorId,
          userMessage: userMessage.content,
          assistantMessage: fullContent.replace(/\[CONFIDENCE:(HIGH|MEDIUM|LOW)\]\s*/gi, "").trim(),
          confidence,
        }),
      });
    } catch (error) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Error: Failed to get response. Check your API key." }
            : m
        )
      );
    }

    setIsStreaming(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-background/50">
      <div className="p-3 border-b">
        <h3 className="font-medium flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          Chat with {advisorName}
        </h3>
        <p className="text-xs text-muted-foreground">
          Responses include confidence indicators based on source material coverage
        </p>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Start a conversation with {advisorName}</p>
              <p className="text-xs mt-1">Ask about their expertise, challenge their thinking, or seek advice</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-3",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.role === "assistant" && message.confidence && (
                  <div className="mb-2">
                    <ConfidenceIndicator level={message.confidence} />
                  </div>
                )}
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{message.content || (isStreaming ? "..." : "")}</ReactMarkdown>
                </div>
              </div>
              {message.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${advisorName} something...`}
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            size="icon"
            className="h-[44px] w-[44px]"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
