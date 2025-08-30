import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Edit, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AIAgentDialog, type AIAgent } from "@/components/dialogs/ai-agent-dialog";
import { Badge } from "@/components/ui/badge";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

interface PaginatedResponse<T> {
  data: { items: T[] };
}

export function AIAgentsPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  const { data: agentsData, isLoading } = useQuery<PaginatedResponse<AIAgent>, Error>({
    queryKey: ["aiAgents"],
    queryFn: async () => {
      const res = await fetch(`${SERVER_URL}/api/user/ai/agents`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch AI agents.");
      return res.json();
    },
  });
  const agents = agentsData?.data?.items ?? [];

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["aiAgents"] });
    setDialogOpen(false);
    setSelectedAgent(null);
  };

  const { mutate: createAgent, isPending: isCreating } = useMutation({
    mutationFn: (newAgent: Omit<AIAgent, 'id' | 'isActive'>) =>
      fetch(`${SERVER_URL}/api/user/ai/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent),
        credentials: 'include',
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create agent');
        return res.json();
      }),
    onSuccess: handleSuccess,
  });

  const { mutate: updateAgent, isPending: isUpdating } = useMutation({
    mutationFn: (agentToUpdate: Omit<AIAgent, 'isActive'>) =>
      fetch(`${SERVER_URL}/api/user/ai/agents/${agentToUpdate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: agentToUpdate.name, behavior: agentToUpdate.behavior }),
        credentials: 'include',
      }).then(res => {
        if (!res.ok) throw new Error('Failed to update agent');
        return res.json();
      }),
    onSuccess: handleSuccess,
  });

  const { mutate: deleteAgent } = useMutation({
    mutationFn: (agentId: string) =>
      fetch(`${SERVER_URL}/api/user/ai/agents/${agentId}`, {
        method: 'DELETE',
        credentials: 'include',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aiAgents"] });
    },
  });

  const { mutate: setActiveAgent, isPending: isActivating } = useMutation({
    mutationFn: (agentId: string) =>
      fetch(`${SERVER_URL}/api/user/ai/agents/${agentId}/activate`, {
        method: 'PUT',
        credentials: 'include',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aiAgents"] });
    }
  });

  const handleSave = (values: Omit<AIAgent, 'id' | 'isActive'>) => {
    if (selectedAgent) {
      updateAgent({ ...values, id: selectedAgent.id });
    } else {
      createAgent(values);
    }
  };

  const columns: ColumnDef<AIAgent>[] = [
    {
      accessorKey: "name",
      header: "Name"
    },
    {
      accessorKey: "behavior",
      header: "Behavior",
      cell: ({ row }) => <p className="truncate max-w-md">{row.original.behavior}</p>
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        return row.original.isActive ? (
          <Badge variant="default">
            <CheckCircle2 className="mr-1 h-3 w-3"/>
            Active
          </Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const agent = row.original;
        return (
          <div className="flex justify-end space-x-2">
            {!agent.isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveAgent(agent.id)}
                disabled={isActivating}
              >
                Set Active
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={() => { setSelectedAgent(agent); setDialogOpen(true); }}>
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" disabled={agent.isActive}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete "{agent.name}".</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteAgent(agent.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">AI Agents</h1>
        <Button onClick={() => { setSelectedAgent(null); setDialogOpen(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Agent
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Define the personality and behavior of your AI assistant. The agent marked as "Active" will be used for all customer chats.
      </p>
      {isLoading ? (
        <div>Loading agents...</div>
      ) : (
        <DataTable columns={columns} data={agents} />
      )}
      <AIAgentDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        agent={selectedAgent}
        onSave={handleSave}
        isSaving={isCreating || isUpdating}
      />
    </main>
  );
}
