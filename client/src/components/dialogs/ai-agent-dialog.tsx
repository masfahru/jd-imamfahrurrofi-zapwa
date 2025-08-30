import { useEffect } from "react";
import { useForm } from "@mantine/form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface AIAgent {
  id: string;
  name: string;
  behavior: string;
  isActive?: boolean;
}

interface AIAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: AIAgent | null;
  onSave: (values: Omit<AIAgent, "id">) => void;
  isSaving: boolean;
}

export function AIAgentDialog({ open, onOpenChange, agent, onSave, isSaving }: AIAgentDialogProps) {
  const form = useForm({
    initialValues: {
      name: "",
      behavior: "",
    },
    validate: {
      name: (value) => (value.trim().length < 3 ? "Name must be at least 3 characters" : null),
      behavior: (value) => (value.trim().length < 10 ? "Behavior must be at least 10 characters" : null),
    },
  });

  useEffect(() => {
    if (agent) {
      form.setValues({ name: agent.name, behavior: agent.behavior });
    } else {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={form.onSubmit(onSave)}>
          <DialogHeader>
            <DialogTitle>{agent ? "Edit AI Agent" : "Create New AI Agent"}</DialogTitle>
            <DialogDescription>
              Define the name and behavior (personality) of your customer service AI.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Agent Name</Label>
              <Input id="name" {...form.getInputProps("name")} placeholder="e.g., Friendly Helper" />
              {form.errors.name && <p className="text-sm text-red-500">{form.errors.name}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="behavior">Behavior / Personality</Label>
              <Textarea
                id="behavior"
                rows={6}
                placeholder="Describe how your AI should behave. e.g., 'You are a formal and professional assistant. Always address customers as Sir or Ma'am.'"
                {...form.getInputProps("behavior")}
                className="h-32 resize-none"
              />
              {form.errors.behavior && <p className="text-sm text-red-500">{form.errors.behavior}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
