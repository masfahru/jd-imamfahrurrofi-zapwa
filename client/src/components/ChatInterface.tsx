import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Bot, Send, User, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Changed from Input
import { cn } from "@/lib/utils";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

// Define the structure of a message
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Define the API response structure
interface ChatApiResponse {
  sessionId: string;
  response: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  // A ref to keep the message list scrolled to the bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // React Query mutation to handle sending a message
  const { mutate: sendMessage, isPending } = useMutation<
    ChatApiResponse,
    Error,
    { message: string; sessionId: string | null }
  >({
    mutationFn: async ({ message, sessionId }) => {
      const res = await fetch(`${SERVER_URL}/api/user/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          sessionId,
          // In a real customer-facing app, this would be dynamic
          customerIdentifier: "customer-test-123",
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to get response from AI");
      }
      return res.json().then(data => data.data);
    },
    onSuccess: (data, _variables) => {
      // Add the AI's response to the message list
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: data.response },
      ]);
      // Update the session ID with the one from the server
      setSessionId(data.sessionId);
    },
    onError: (error) => {
      // Add an error message to the chat
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: `Error: ${error.message}` },
      ]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    // Add user's message to the list immediately
    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    // Call the mutation to send the message to the backend
    sendMessage({ message: input, sessionId });

    // Clear the input field
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto pr-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-start gap-3",
              msg.role === "user" && "justify-end"
            )}
          >
            {msg.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" />
              </div>
            )}
            <div
              className={cn(
                "max-w-xs rounded-lg px-4 py-2 md:max-w-md",
                msg.role === "assistant"
                  ? "bg-muted"
                  : "bg-primary text-primary-foreground"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <User className="h-5 w-5" />
              </div>
            )}
          </div>
        ))}
        {isPending && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Loader className="h-5 w-5 animate-spin" />
            </div>
            <div className="max-w-xs rounded-lg bg-muted px-4 py-2 md:max-w-md">
              <p className="text-sm italic">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2 border-t pt-4">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about products or place an order..."
          className="flex-1 resize-none max-h-24"
          rows={1}
          disabled={isPending}
        />
        <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
