import { Input } from '@/components/ui/input';

interface DataTableToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function DataTableToolbar({ searchTerm, onSearchChange }: DataTableToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter admins by name or email..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
      </div>
    </div>
  );
}
