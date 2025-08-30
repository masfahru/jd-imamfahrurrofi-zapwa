import { ChatInterface } from "@/components/ChatInterface";

export function ChatPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Customer Chat</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        This is a simulation of the chat interface your customers will use.
        Interact with your active AI agent to test its responses and capabilities.
      </p>
      <div className="flex-1 rounded-lg border bg-card p-4 shadow-sm">
        <ChatInterface />
      </div>
    </div>
  );
}
