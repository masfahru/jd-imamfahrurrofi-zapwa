import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import type { User } from "@/pages/admin/UserManagementPage";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

interface ReassignLicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (newUserId: string) => void;
  isSaving: boolean;
  title: string;
  description: string;
  currentUser: User;
}

export function ReassignLicenseDialog({
                                        open,
                                        onOpenChange,
                                        onSave,
                                        isSaving,
                                        title,
                                        description,
                                        currentUser,
                                      }: ReassignLicenseDialogProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);
  const { data: usersData, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["usersForLicenseReassignment", debouncedSearchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: "20",
        search: debouncedSearchQuery,
      });
      const res = await fetch(`${SERVER_URL}/api/admin/users?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch users.");
      const paginatedData = await res.json();
      return paginatedData.data.items.filter(
        (user: User) => user.id !== currentUser.id
      );
    },
    enabled: open,
  });
  useEffect(() => {
    if (!open) {
      setSelectedUserId(null);
      setSearchQuery("");
      setDebouncedSearchQuery("");
    }
  }, [open]);
  const handleSave = () => {
    if (selectedUserId) {
      onSave(selectedUserId);
    }
  };

  const selectedUser = usersData?.find(user => user.id === selectedUserId);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-1.5">
            <Label>Select New User</Label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={popoverOpen}
                  className="w-full justify-between"
                >
                  {selectedUser
                    ? `${selectedUser.name} (${selectedUser.email})`
                    : "Select a user..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search user by name or email..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {isLoadingUsers ? "Loading..." : "No user found."}
                    </CommandEmpty>
                    {!isLoadingUsers && (
                      <CommandGroup>
                        {usersData?.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={user.id}
                            onSelect={() => {
                              setSelectedUserId(user.id);
                              setPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedUserId === user.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {user.name} ({user.email})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !selectedUserId}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
