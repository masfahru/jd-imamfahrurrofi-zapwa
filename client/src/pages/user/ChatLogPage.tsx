import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Bot, MessageSquare, User, Wrench } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "tool";
  content: string;
  totalTokens: number | null;
  promptTokens: number | null;
  completionTokens: number | null;
  createdAt: string;
}

interface PaginatedResponse<T> {
  message: string;
  data: {
    items: T[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case "user":
      return <User className="h-4 w-4" />;
    case "assistant":
      return <Bot className="h-4 w-4" />;
    case "tool":
      return <Wrench className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "user":
      return "secondary" as const;
    case "assistant":
      return "default" as const;
    case "tool":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
};

export function ChatLogPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [roleFilter, setRoleFilter] = useState("all");
  const [sessionIdFilter, setSessionIdFilter] = useState("");

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: chatLogData, isLoading, isError, error } = useQuery<PaginatedResponse<ChatMessage>, Error>({
    queryKey: ["chatLogs", page, limit, debouncedSearchTerm, roleFilter, sessionIdFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (sessionIdFilter) params.append("sessionId", sessionIdFilter);

      const res = await fetch(`${SERVER_URL}/api/user/chat-logs/chat-messages?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch chat messages.");
      return res.json();
    },
  });

  const messages = chatLogData?.data?.items ?? [];
  const pagination = chatLogData?.data?.pagination;

  const columns: ColumnDef<ChatMessage>[] = [
    {
      id: "index",
      header: "No.",
      cell: ({ row }) => {
        const startIndex = (page - 1) * limit;
        return startIndex + row.index + 1;
      },
    },
    {
      accessorKey: "sessionId",
      header: "Session",
      cell: ({ row }) => (
        <Input
          value={row.original.sessionId}
          readOnly
          className="font-mono text-xs h-8 w-48 cursor-text"
          onClick={(e) => e.currentTarget.select()}
        />
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant={getRoleBadgeVariant(row.original.role)} className="gap-1">
          {getRoleIcon(row.original.role)}
          <span className="capitalize">{row.original.role}</span>
        </Badge>
      ),
    },
    {
      accessorKey: "content",
      header: "Message",
      cell: ({ row }) => (
        <div className="max-w-md">
          <p className="truncate text-sm">{row.original.content}</p>
        </div>
      ),
    },
    {
      accessorKey: "totalTokens",
      header: "Tokens",
      cell: ({ row }) => {
        const { totalTokens, promptTokens, completionTokens } = row.original;
        if (totalTokens === null) return <span className="text-muted-foreground">-</span>;

        return (
          <div className="text-xs">
            <div className="font-medium">{totalTokens}</div>
            {promptTokens !== null && completionTokens !== null && (
              <div className="text-muted-foreground">
                {promptTokens}+{completionTokens}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <div className="text-xs">
          <div>{new Date(row.original.createdAt).toLocaleDateString()}</div>
          <div className="text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
  ];

  if (isError) return <div>Error fetching chat logs: {error.message}</div>;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Chat Logs</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        View all chat messages and interactions with your AI assistant. Track token usage and analyze conversation patterns.
      </p>

      <DataTableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search message content..."
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="role-filter" className="whitespace-nowrap text-sm font-medium">
              Role
            </Label>
            <Select
              value={roleFilter}
              onValueChange={(value) => {
                setRoleFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger id="role-filter" className="h-8 w-[120px]">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
                <SelectItem value="tool">Tool</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Label htmlFor="session-filter" className="whitespace-nowrap text-sm font-medium">
              Session
            </Label>
            <Input
              id="session-filter"
              placeholder="Session ID..."
              value={sessionIdFilter}
              onChange={(e) => {
                setSessionIdFilter(e.target.value);
                setPage(1);
              }}
              className="h-8 w-[150px]"
            />
          </div>
        </div>
      </DataTableToolbar>

      {isLoading ? (
        <div>Loading chat logs...</div>
      ) : (
        <DataTable columns={columns} data={messages} />
      )}

      {pagination && (
        <DataTablePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalItems}
          itemPerPage={limit}
          onPageChange={setPage}
          onPerPageChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      )}
    </main>
  );
}
